
import { Visual } from "./Visual";
import { Vector2 } from "../math/Vector2";
import { RenderPass, TextureFiltering } from "./GraphicTypes";
import { Camera, CameraClear } from "./Camera";
import { VertexBuffer } from "./VertexBuffer";
import { Material } from "./Material";
import { MapPool } from "../core/MapPool";
import { Matrix44 } from "../math/Matrix44";
import { Screen } from "../ui/Screen";
import { Shader, ShaderAttributes } from "./Shader";
import { PerspectiveProjector } from "./PerspectiveProjector";
import { Vector3 } from "../math/Vector3";
import { Light } from "./lighting/Light";
import { RenderTarget } from "./RenderTarget";
import { GraphicUpdateResult } from "./geometry/Geometry";
import { Size, SizeType } from "../core/Size";
import { Environment, ColorEnvironment, SkySimulation, SkyBoxEnvironment } from "./Environment";
import { SkinnedMesh } from "./geometry/SkinnedMesh";
import { GraphicUtils } from "./GraphicUtils";
import { ExponentialFog, LinearFog } from "./Fog";
import { Matrix33 } from "../math/Matrix33";
import { AssetReference } from "../serialization/AssetReference";
import { Texture } from "./Texture";
import { GeometryProvider } from "./geometry/GeometryProvider";
import { WebGL } from "./WebGL";
import { Components } from "../core/Components";
import { Time } from "../core/Time";
import { ScenesInternal } from "../core/Scenes";
import { defaultAssets } from "../assets/DefaultAssets";
import { IRenderer, IRendererInternal } from "./IRenderer";
import { IObjectManagerInternal } from "../core/IObjectManager";
import { Component } from "../core/Component";
import { EngineSettings } from "../core/EngineSettings";
import { Projector } from "./Projector";
import { FrustumCorner } from "./Frustum";

interface RenderPassDefinition {
    begin: (gl: WebGLRenderingContext) => void;
    makeViewMatrix: (viewMatrixIn: Matrix44) => Matrix44;
    makeWorldMatrix: (worldMatrixIn: Matrix44) => Matrix44;
    renderStateBucketMap: RenderStateBucketsMap;
}

interface VisualBucket {
    reference: Visual;
    vertexBufferToVisualsMap: VertexBufferToVisualsMap;
}

interface RenderStateBucket {
    reference: Material;
    shaderToVisualBucketsMap: ShaderToVisualBucketsMap;
}

type RenderPassToDefinitionMap = Map<number, RenderPassDefinition>;
type VertexBufferToVisualsMap = Map<VertexBuffer, Visual[]>;
type VisualBucketsMap = Map<string, VisualBucket>;
type ShaderToVisualBucketsMap = Map<Shader, VisualBucketsMap>;
type RenderStateBucketsMap = Map<string, RenderStateBucket>;

interface LightInfo {
    light: Light;
    viewMatrix: Matrix44;
    projectionMatrix: Matrix44;
}

namespace Private {
    export let canvas: HTMLCanvasElement;
    export const initialShadowCastersPoolSize = 128;
    export const numRenderPasses = RenderPass.Transparent + 1;
    export const initialCameraPoolSize = 8;
    export const initialMaterialPoolSize = 128;
    export const defaultShadowMapSize = new Vector2(2048, 2048);
    export let defaultPerspectiveCamera: Camera | null = null;

    export const screenSize = new Vector2();
    export const dummyMatrix = new Matrix44();
    export const normalMatrix = new Matrix33();
    export const uiProjectionMatrix = new Matrix44();
    export const cameraToRenderPassMap = new Map<Camera, RenderPassToDefinitionMap>();

    export const renderPassToDefinitionMapPool = new MapPool<number, RenderPassDefinition>(Private.initialCameraPoolSize);
    export const renderStateBucketMapPool = new MapPool<string, RenderStateBucket>(Private.numRenderPasses * 3); // average 3 cameras
    export const shaderToVisualBucketsMapPool = new MapPool<Shader, VisualBucketsMap>(16);
    export const visualBucketsMapPool = new MapPool<string, VisualBucket>(16);
    export const vertexBufferToVisualsMapPool = new MapPool<VertexBuffer, Visual[]>(16);

    export let currentRenderTarget: RenderTarget | null = null;
    export let showWireFrame = false;

    // shadow mapping
    export let lights: LightInfo[] = [];
    export const shadowCasters = new Map<VertexBuffer, Visual[]>();
    export const shadowMaps: RenderTarget[] = [];    
    export const skinnedRenderDepthBonesTexture = new AssetReference(Texture);   

    export function doRenderPass(renderPassDefinition: RenderPassDefinition, gl: WebGLRenderingContext, camera: Camera) {
        if (renderPassDefinition.renderStateBucketMap.size === 0) {
            return;
        }
        const hasLights = Private.lights.length > 0;
        const fog = ScenesInternal.list()[0].fog;
        renderPassDefinition.begin(gl);
        // this ensure materials with additive blending mode are rendered last
        // TODO implement a more rebust method of controlling material render order
        // (for example separate into different buckets based on priority - controls the order but doesn't need uploadState multiple times.)
        const sortedBuckedIds = Array.from(renderPassDefinition.renderStateBucketMap.keys()).sort();
        for (const bucketId of sortedBuckedIds) {
            const renderStateBucket = renderPassDefinition.renderStateBucketMap.get(bucketId) as RenderStateBucket;
            renderStateBucket.reference.uploadState();
            if (renderStateBucket.reference.depthTest) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
            const viewMatrix = renderPassDefinition.makeViewMatrix(camera.getViewMatrix());
            renderStateBucket.shaderToVisualBucketsMap.forEach((visualBuckets, shader) => {
                visualBuckets.forEach((visualBucket, visualBucketId) => {
                    const shaderInstance = shader.beginWithVisual(visualBucket.reference);
                    if (!shaderInstance) {
                        return;
                    }

                    shader.applyParam("projectionMatrix", camera.getProjectionMatrix(), visualBucketId);
                    shader.applyParam("viewMatrix", viewMatrix, visualBucketId);

                    // lighting & shadowing
                    if (hasLights) {
                        const lightCount = Math.min(EngineSettings.instance.maxDirectionalLights, Private.lights.length);
                        shader.applyParam("directionalLightCount", lightCount, visualBucketId);
                        for (let i = 0; i < lightCount; ++i) {
                            const { light, projectionMatrix, viewMatrix: lightViewMatrix } = Private.lights[i];
                            if (visualBucket.reference.receiveShadows) {
                                const lightMatrix = Private.dummyMatrix.multiplyMatrices(
                                    projectionMatrix,
                                    lightViewMatrix
                                );
                                shader.applyParam(`directionalLightMatrices[${i}]`, lightMatrix, visualBucketId);
                                shader.applyReferenceArrayParam(
                                    `directionalShadowMaps`,
                                    Private.shadowMaps.filter(Boolean), 
                                    visualBucketId
                                );
                            }
                            
                            const lightDir = Vector3.fromPool().copy(light.entity.transform.worldForward);
                            lightDir.transformDirection(viewMatrix);
                            shader.applyParam(`directionalLights[${i}].direction`, lightDir, visualBucketId);
                            shader.applyParam(`directionalLights[${i}].color`, light.color, visualBucketId);
                            shader.applyParam(`directionalLights[${i}].shadow`, light.castShadows, visualBucketId);
                            shader.applyParam(`directionalLights[${i}].shadowBias`, light.shadowBias, visualBucketId);
                            shader.applyParam(`directionalLights[${i}].shadowRadius`, light.shadowRadius, visualBucketId);
                            shader.applyParam(`directionalLights[${i}].shadowMapSize`, Private.defaultShadowMapSize, visualBucketId);
                        }
                    } else {
                        shader.applyParam("directionalLightCount", 0, visualBucketId);
                    }

                    // fog
                    if (visualBucket.reference.receiveFog && fog) {
                        shader.applyParam("fogColor", fog.color, visualBucketId);
                        if (fog.isA(ExponentialFog)) {
                            shader.applyParam("fogDensity", (fog as ExponentialFog).density, visualBucketId);
                        } else {
                            const linearFog = fog as LinearFog;
                            shader.applyParam("fogNear", linearFog.near, visualBucketId);
                            shader.applyParam("fogFar", linearFog.far, visualBucketId);
                        }
                    }

                    const shaderAttributes = shaderInstance.attributes as ShaderAttributes;
                    visualBucket.vertexBufferToVisualsMap.forEach((visuals, vertexBuffer) => {
                        vertexBuffer.bindBuffers(gl);
                        vertexBuffer.bindAttributes(gl, shaderAttributes);
                        // TODO instancing?
                        for (const visual of visuals) {
                            const geometryUpdateStatus = visual.graphicUpdate(camera, shader, Time.deltaTime);
                            if (geometryUpdateStatus === GraphicUpdateResult.Changed) {
                                vertexBuffer.updateBufferDatas(gl);
                            }
                            const worldMatrix = renderPassDefinition.makeWorldMatrix(visual.worldTransform);
                            const modelViewMatrix = visual.isSkinned
                                ? viewMatrix
                                : Private.dummyMatrix.multiplyMatrices(viewMatrix, worldMatrix);
                            Private.normalMatrix.getNormalMatrix(modelViewMatrix);
                            shader.applyParam("worldMatrix", worldMatrix, visualBucketId);
                            shader.applyParam("modelViewMatrix", modelViewMatrix, visualBucketId);
                            shader.applyParam("normalMatrix", Private.normalMatrix, visualBucketId);
                            shader.applyParam("screenSize", screenSize, visualBucketId);
                            shader.applyParam("time", Time.time, visualBucketId);
                            shader.applyParam("deltaTime", Time.deltaTime, visualBucketId);
                            shader.applyParam("frame", Time.currentFrame, visualBucketId);
                            const material = (visual.animatedMaterial || visual.material) as Material;
                            const materialParams = material.shaderParams;
                            for (const param of Object.keys(materialParams)) {
                                shader.applyParam(param, materialParams[param], visualBucketId);
                            }
                            vertexBuffer.draw(gl);
                        }
                        vertexBuffer.unbindAttributes(gl, shaderAttributes);
                    });
                });
            });
        }
    }

    export function addToRenderMap(camera: Camera, visual: Visual) {
        const vertexBuffer = visual.vertexBuffer;
        if (!vertexBuffer) {
            return;
        }
        const material = visual.animatedMaterial || visual.material;
        if (!material || !material.shader) {
            return;
        }

        const renderPassToDefinitionMap = Private.cameraToRenderPassMap.get(camera) as RenderPassToDefinitionMap;
        const renderStateBuckedIdToShadersMap = (renderPassToDefinitionMap.get(material.renderPass) as RenderPassDefinition).renderStateBucketMap;
        const materialBucketId = material.buckedId;
        let renderStateBucket = renderStateBuckedIdToShadersMap.get(materialBucketId);
        if (!renderStateBucket) {
            renderStateBucket = {
                reference: material,
                shaderToVisualBucketsMap: Private.shaderToVisualBucketsMapPool.get()
            };
            renderStateBuckedIdToShadersMap.set(materialBucketId, renderStateBucket);
        }

        let visualBucketsMap = renderStateBucket.shaderToVisualBucketsMap.get(material.shader);
        if (!visualBucketsMap) {
            visualBucketsMap = Private.visualBucketsMapPool.get();
            renderStateBucket.shaderToVisualBucketsMap.set(material.shader, visualBucketsMap);
        }

        let visualBucket = visualBucketsMap.get(visual.bucketId);
        if (!visualBucket) {
            visualBucket = {
                reference: visual,
                vertexBufferToVisualsMap: Private.vertexBufferToVisualsMapPool.get()
            };
            visualBucketsMap.set(visual.bucketId, visualBucket);
        }

        const visuals = visualBucket.vertexBufferToVisualsMap.get(vertexBuffer);
        if (!visuals) {
            visualBucket.vertexBufferToVisualsMap.set(vertexBuffer, [visual]);
        } else {
            visuals.push(visual);
        }
    }

    export function renderShadowMaps(camera: Camera) {
        Private.shadowMaps.length = EngineSettings.instance.maxDirectionalLights;

        const context = WebGL.context;
        // render to shadow maps
        context.enable(context.DEPTH_TEST);
        context.disable(context.BLEND);
        context.depthMask(true);
        // render back faces to avoid self-shadowing artifacts
        context.enable(context.CULL_FACE);
        context.cullFace(context.FRONT);
        const numShadowMaps = Math.min(Private.lights.length, Private.shadowMaps.length);

        let previousRenderDepthShader: Shader | null = null;
        for (let i = 0; i < numShadowMaps; ++i) {
            let shadowMap = Private.shadowMaps[i];
            if (!shadowMap) {
                const size = new Size(SizeType.Absolute, Private.defaultShadowMapSize.x);
                shadowMap = new RenderTarget(size, size, true, false, TextureFiltering.Nearest);
                Private.shadowMaps[i] = shadowMap;
            }

            try {
                IRendererInternal.instance.renderTarget = shadowMap;
                Private.lights[i].viewMatrix.copy(makeLightViewMatrix(camera, Private.lights[i].light));
                Private.lights[i].projectionMatrix.copy(makeLightProjectionMatrix(camera, Private.lights[i]));

                // TODO this is horribly inefficient, must unify the shading pipeline and use a shader with multiple 
                // instances like the standard shader!!
                Private.shadowCasters.forEach((visuals, vertexBuffer) => {
                    // TODO This assumes that all the visual instances of a particular vertex buffer
                    // Are renderer with the same shader type (skinned vs non-skinned), this is a fair assumption
                    // But deserves a check in the future
                    const hasSkinning = visuals[0].isSkinned;
                    const currentShader = hasSkinning ? defaultAssets.shaders.skinnedRenderDepth : defaultAssets.shaders.renderDepth;
                    if (currentShader !== previousRenderDepthShader) {
                        // if (hasSkinning) {
                        //     // ( for example when prebuilding shader to be used with multiple objects )
                        //     //
                        //     //  - leave some extra space for other uniforms
                        //     //  - limit here is ANGLE's 254 max uniform vectors
                        //     //    (up to 54 should be safe)
                        //     var nVertexUniforms = gl.caps.maxVertexUniforms;
                        //     var nVertexMatrices = Math.floor((nVertexUniforms - 20) / 4);
                        // }
                        currentShader.begin();
                        currentShader.applyParam("projectionMatrix", Private.lights[i].projectionMatrix);
                        if (hasSkinning) {
                            currentShader.applyParam("viewMatrix", Private.lights[i].viewMatrix);
                        }
                        previousRenderDepthShader = currentShader;
                    }

                    vertexBuffer.begin(context, currentShader);
                    for (const visual of visuals) {
                        if (hasSkinning) {
                            const skinnedMesh = visual.geometry as SkinnedMesh;
                            if (!skinnedMesh.boneTexture) {
                                continue;
                            }
                            currentShader.applyParam("bindMatrix", skinnedMesh.bindMatrix);
                            currentShader.applyParam("bindMatrixInverse", skinnedMesh.bindMatrixInverse);
                            if (WebGL.extensions.OES_texture_float) {
                                Private.skinnedRenderDepthBonesTexture.asset = skinnedMesh.boneTexture;
                                currentShader.applyParam("boneTexture", Private.skinnedRenderDepthBonesTexture);
                                currentShader.applyParam("boneTextureSize", skinnedMesh.boneTextureSize);
                            } else {
                                currentShader.applyParam("boneMatrices", skinnedMesh.boneMatrices);
                            }
                        } else {
                            const modelViewMatrix = Private.dummyMatrix.multiplyMatrices(
                                Private.lights[i].viewMatrix, 
                                visual.worldTransform
                            );
                            currentShader.applyParam("modelViewMatrix", modelViewMatrix);
                        }
                        vertexBuffer.draw(context);
                    }
                    vertexBuffer.end(context, currentShader);
                });
            } catch (e) {  
                // shadow map not loaded yet              
            }           
        }
    }

    export function setupCameraRenderPassDefinition(camera: Camera) {
        const renderPassToDefinitionMap = Private.renderPassToDefinitionMapPool.get();

        // OPAQUE PASS
        renderPassToDefinitionMap.set(RenderPass.Opaque, {
            begin: (gl: WebGLRenderingContext) => {
                gl.enable(gl.DEPTH_TEST);
                gl.depthMask(true);
            },
            makeViewMatrix: (viewMatrix: Matrix44) => viewMatrix,
            makeWorldMatrix: (worldMatrix: Matrix44) => worldMatrix,
            renderStateBucketMap: Private.renderStateBucketMapPool.get()
        });

        // TRANSPARENT PASS
        renderPassToDefinitionMap.set(RenderPass.Transparent, {
            begin: (gl: WebGLRenderingContext) => {
                gl.enable(gl.DEPTH_TEST);
                gl.depthMask(false);
            },
            makeViewMatrix: (viewMatrix: Matrix44) => viewMatrix,
            makeWorldMatrix: (worldMatrix: Matrix44) => worldMatrix,
            renderStateBucketMap: Private.renderStateBucketMapPool.get()
        });        

        Private.cameraToRenderPassMap.set(camera, renderPassToDefinitionMap);
    }

    export function makeSkyViewMatrix(camera: Camera) {
        // Make position-agnostic view matrix
        const vm = Matrix44.fromPool();
        vm.copy(camera.entity.transform.worldMatrix).setPosition(Vector3.zero);
        vm.transpose();
        return vm;
    }

    export function makeLightViewMatrix(camera: Camera, light: Light) {
        if (!camera.projector) {
            return Matrix44.identity;
        }
        return Matrix44.fromPool()
            .compose(
                Vector3.fromPool().copy(camera.entity.transform.worldForward)
                    .multiply(-(camera.projector as Projector).zNear)
                    .add(camera.entity.transform.worldPosition),
                light.entity.transform.worldRotation,
                Vector3.one
            )
            .invert();
    }

    export function makeLightProjectionMatrix(camera: Camera, light: LightInfo) {
        if (!camera.frustum) {
            return Matrix44.identity;
        }
        let left = Number.MAX_VALUE, bottom = Number.MAX_VALUE, minZ = Number.MAX_VALUE;
        let right = -Number.MAX_VALUE, top = -Number.MAX_VALUE, maxZ = -Number.MAX_VALUE;
        const localCornerPos = Vector3.fromPool();
        const rightProj = Vector3.fromPool(), upProj = Vector3.fromPool(), forwardProj = Vector3.fromPool();
        for (let i = 0; i < FrustumCorner.Count; ++i) {
            const corner = camera.frustum.corners[i];
            localCornerPos.copy(corner).transform(light.viewMatrix);
            rightProj.copy(localCornerPos).projectOnVector(light.light.entity.transform.worldRight);
            upProj.copy(localCornerPos).projectOnVector(light.light.entity.transform.worldUp);
            forwardProj.copy(localCornerPos).projectOnVector(light.light.entity.transform.worldForward);
            if (rightProj.x < left) {
                left = rightProj.x;
            }
            if (rightProj.x > right) {
                right = rightProj.x;
            }
            if (upProj.y < bottom) {
                bottom = upProj.y;
            }
            if (upProj.y > top) {
                top = upProj.y;
            }    
            if (forwardProj.z < minZ) {
                minZ = forwardProj.z;
            }
            if (forwardProj.z > maxZ) {
                maxZ = forwardProj.z;
            }
        }
        return Matrix44.fromPool().makeOrthoProjection(left, right, top, bottom, 0, -minZ);
    }
}

export class Renderer implements IRenderer {   
    get screenSize() { return Private.screenSize; }
    get defaultPerspectiveCamera() { return Private.defaultPerspectiveCamera; }    
    get canvas() { return Private.canvas; }
    get renderTarget() { return Private.currentRenderTarget; }
    set renderTarget(rt: RenderTarget | null) { 
        const gl = WebGL.context;
        if (rt) {
            let result = rt.bind(gl);
            if (result) {
                Private.currentRenderTarget = rt;
            } else {
                throw "RenderTarget not ready for rendering";
            }            
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, this.screenSize.x, this.screenSize.y);
            Private.currentRenderTarget = null;
        }
    }
    set showWireFrame(show: boolean) {
        if (show !== Private.showWireFrame) {
            IObjectManagerInternal.instance.forEach(o => {
                if (o.isA(Shader)) {
                    (o as Shader).invalidateProgram();
                }
            });
            Private.showWireFrame = show;
        }
    }
    get showWireFrame() { return Private.showWireFrame; }    
}

/**
 * @hidden
 */
export class RendererInternal {

    static processCanvasDimensions(canvas: HTMLCanvasElement) {
        const { clientWidth, clientHeight } = canvas;
        if (clientWidth === 0 || clientHeight === 0) {
            return;
        }
        Private.screenSize.set(clientWidth, clientHeight);
        Private.uiProjectionMatrix.makeOrthoProjection(0, canvas.clientWidth, 0, canvas.clientHeight, -100, 100);
        // Not sure this is necessary
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    static create(canvas: HTMLCanvasElement) {
        IRendererInternal.instance = new Renderer();
        RendererInternal.processCanvasDimensions(canvas);
        Private.canvas = canvas;
    }

    static render(
        environment: Environment | undefined,
        cameras: Camera[],
        renderables: { [typeName: string]: Component[] },
        preRender?: (camera: Camera) => void,
        postRender?: (camera: Camera) => void,
        uiPostRender?: () => void
    ) {
        Private.renderPassToDefinitionMapPool.flush();
        Private.renderStateBucketMapPool.flush();
        Private.shaderToVisualBucketsMapPool.flush();
        Private.visualBucketsMapPool.flush();
        Private.vertexBufferToVisualsMapPool.flush();

        // setup render pass definitions
        Private.cameraToRenderPassMap.clear();
        for (const camera of cameras) {
            Private.setupCameraRenderPassDefinition(camera);
        }

        // collect rendrables
        Private.defaultPerspectiveCamera = null;
        Private.shadowCasters.clear();

        for (const visual of renderables.Visual as Visual[]) {
            if (!visual.vertexBuffer) {
                continue;
            }
            for (const camera of cameras) {
                if (camera.canRenderGroup(visual.group)) {
                    Private.addToRenderMap(camera, visual);
                }
            }

            // collect shadow casters
            if (visual.castShadows) {
                const vertexBuffer = visual.vertexBuffer;
                const shadowCastersMap = Private.shadowCasters.get(vertexBuffer);
                if (!shadowCastersMap) {
                    Private.shadowCasters.set(vertexBuffer, [visual]);
                } else {
                    shadowCastersMap.push(visual);
                }
            }
        }

        const gl = WebGL.context;
        Private.lights = (renderables.Light as Light[]).map(light => ({
            light,
            viewMatrix: Matrix44.fromPool(),
            projectionMatrix: Matrix44.fromPool()
        }));

        // gl.depthMask(true);
        if (Private.cameraToRenderPassMap.size > 0) {
            Private.cameraToRenderPassMap.forEach((renderPassSelector, camera) => {

                // prepare shadow maps
                Private.renderShadowMaps(camera);

                camera.setupFrame();

                const postEffects = camera.postEffects;
                const bloom = postEffects ? postEffects.bloom : undefined;
                if (bloom) {
                    IRendererInternal.instance.renderTarget = camera.sceneRenderTarget;
                } else {
                    IRendererInternal.instance.renderTarget = camera.renderTarget;
                }

                if (!Private.defaultPerspectiveCamera) {
                    const projector = camera.projector;
                    if (projector && projector.isA(PerspectiveProjector)) {
                        Private.defaultPerspectiveCamera = camera;
                    }
                }

                const clearValue = camera.clearValue;
                if (clearValue === CameraClear.Environment) {
                    if (environment) {
                        if (environment.isA(ColorEnvironment)) {
                            const color = (environment as ColorEnvironment).color;
                            gl.clearColor(color.r, color.g, color.b, color.a);
                            // tslint:disable-next-line
                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                        } else if (environment.isA(SkySimulation)) {
                            const skySim = environment as SkySimulation;
                            gl.enable(gl.DEPTH_TEST);
                            gl.depthMask(false);
                            // tslint:disable-next-line
                            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                            const { sky } = defaultAssets.materials;
                            sky.queueParameter("projectionMatrix", camera.getProjectionMatrix());
                            sky.queueParameter("modelViewMatrix", Private.makeSkyViewMatrix(camera));
                            sky.queueParameter("sunPosition", skySim.sunPosition);
                            sky.queueParameter("rayleigh", skySim.rayleigh);
                            sky.queueParameter("turbidity", skySim.turbidity);
                            sky.queueParameter("mieCoefficient", skySim.mieCoefficient);
                            sky.queueParameter("luminance", skySim.luminance);
                            sky.queueParameter("mieDirectionalG", skySim.mieDirectionalG);
                            if (sky.begin()) {
                                GraphicUtils.drawVertexBuffer(
                                    gl, 
                                    defaultAssets.primitives.sphere.vertexBuffer, 
                                    sky.shader as Shader
                                );
                            }
                        } else if (environment.isA(SkyBoxEnvironment)) {
                            const sky = environment as SkyBoxEnvironment;
                            if (sky.cubeMap) {
                                gl.enable(gl.DEPTH_TEST);
                                gl.depthMask(false);
                                // tslint:disable-next-line
                                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                                const { cubeMap } = defaultAssets.materials;
                                cubeMap.queueParameter("projectionMatrix", camera.getProjectionMatrix());
                                cubeMap.queueParameter("modelViewMatrix", Private.makeSkyViewMatrix(camera));
                                cubeMap.queueReferenceParameter("cubemap", sky.cubeMap);
                                if (cubeMap.begin()) {
                                    const vb = GeometryProvider.skyBox;
                                    GraphicUtils.drawVertexBuffer(gl, vb, cubeMap.shader as Shader);
                                }
                            }
                        }
                    }
                }

                if (preRender) {
                    preRender(camera);
                }
                Private.doRenderPass(renderPassSelector.get(RenderPass.Opaque) as RenderPassDefinition, gl, camera);
                Private.doRenderPass(renderPassSelector.get(RenderPass.Transparent) as RenderPassDefinition, gl, camera);
                if (postRender) {
                    postRender(camera);
                }

                // TODO handle all post effects here not just bloom!
                if (bloom) {                    
                    const fullScreenQuad = GeometryProvider.centeredQuad;
                    const inputRT = bloom.render(gl, camera.sceneRenderTarget, fullScreenQuad) as RenderTarget;
                    // add post effects to scene RT
                    const composeShader = defaultAssets.shaders.compose;
                    if (composeShader.begin()) {
                        IRendererInternal.instance.renderTarget = camera.renderTarget;
                        composeShader.applyReferenceParam("scene", camera.sceneRenderTarget);
                        composeShader.applyReferenceParam("postFX", inputRT);
                        composeShader.applyParam("postFxIntensity", bloom.intensity);                            
                        GraphicUtils.drawVertexBuffer(gl, fullScreenQuad, composeShader);
                    }
                }
            });
        } else {
            // Empty scene, so at least do the pre and post rendering
            IRendererInternal.instance.renderTarget = null;
            if (preRender) {
                if (cameras.length > 0) {
                    preRender(cameras[0]);
                }
            }
            if (postRender) {
                if (cameras.length > 0) {
                    postRender(cameras[0]);
                }
            }
        }

        // render UI
        IRendererInternal.instance.renderTarget = null;
        gl.disable(gl.DEPTH_TEST);
        defaultAssets.materials.ui.queueParameter("projectionMatrix", Private.uiProjectionMatrix);
        for (const screen of renderables.Screen as Screen[]) {
            screen.updateTransforms();
            screen.render(defaultAssets.materials.ui);
        }

        if (uiPostRender) {
            uiPostRender();
        } 
    }

    static clearDefaultPerspectiveCamera() {
        Private.defaultPerspectiveCamera = null;
    }

    static get uiProjectionMatrix() {
        return Private.uiProjectionMatrix;
    }    
}
