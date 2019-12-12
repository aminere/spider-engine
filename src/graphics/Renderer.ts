
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
import { Time } from "../core/Time";
import { ScenesInternal } from "../core/Scenes";
import { defaultAssets } from "../assets/DefaultAssets";
import { IRenderer, IRendererInternal } from "./IRenderer";
import { IObjectManagerInternal } from "../core/IObjectManager";
import { Component } from "../core/Component";
import { EngineSettings } from "../core/EngineSettings";
import { FrustumCorner, Frustum } from "./Frustum";
import { DirectionalLight } from "./lighting/DirectionalLight";
import { Transform } from "../core/Transform";
import { Entity } from "../core/Entity";
import { IFrustum } from "./IFrustum";

interface IRenderPassDefinition {
    begin: (gl: WebGLRenderingContext) => void;
    makeViewMatrix: (viewMatrixIn: Matrix44) => Matrix44;
    makeWorldMatrix: (worldMatrixIn: Matrix44) => Matrix44;
    renderStateBucketMap: RenderStateBucketsMap;
}

interface IVisualBucket {
    reference: Visual;
    vertexBufferToVisualsMap: VertexBufferToVisualsMap;
}

interface IRenderStateBucket {
    reference: Material;
    shaderToVisualBucketsMap: ShaderToVisualBucketsMap;
}

interface IDirectionalLight {
    light: Light;
    viewMatrices: Matrix44[];
    projectionMatrices: Matrix44[];
}

type RenderPassToDefinitionMap = Map<number, IRenderPassDefinition>;
type VertexBufferToVisualsMap = Map<VertexBuffer, Visual[]>;
type VisualBucketsMap = Map<string, IVisualBucket>;
type ShaderToVisualBucketsMap = Map<Shader, VisualBucketsMap>;
type RenderStateBucketsMap = Map<string, IRenderStateBucket>;

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

    export const renderPassToDefinitionMapPool = new MapPool<number, IRenderPassDefinition>(Private.initialCameraPoolSize);
    export const renderStateBucketMapPool = new MapPool<string, IRenderStateBucket>(Private.numRenderPasses * 3); // average 3 cameras
    export const shaderToVisualBucketsMapPool = new MapPool<Shader, VisualBucketsMap>(16);
    export const visualBucketsMapPool = new MapPool<string, IVisualBucket>(16);
    export const vertexBufferToVisualsMapPool = new MapPool<VertexBuffer, Visual[]>(16);

    export let currentRenderTarget: RenderTarget | null = null;
    export let showWireFrame = false;

    // shadow mapping
    export let directionalLights: IDirectionalLight[];
    export const directionalShadowMaps: RenderTarget[] = [];
    export const shadowCasters = new Map<VertexBuffer, Visual[]>();
    export const skinnedRenderDepthBonesTexture = new AssetReference(Texture);

    export function doRenderPass(renderPassDefinition: IRenderPassDefinition, gl: WebGLRenderingContext, camera: Camera) {
        if (renderPassDefinition.renderStateBucketMap.size === 0) {
            return;
        }
        const hasDirectionalLights = Private.directionalLights.length > 0;
        const fog = ScenesInternal.list()[0].fog;
        renderPassDefinition.begin(gl);
        // this ensure materials with additive blending mode are rendered last
        // TODO implement a more rebust method of controlling material render order
        // (for example separate into different buckets based on priority - controls the order but doesn't need uploadState multiple times.)
        const sortedBuckedIds = Array.from(renderPassDefinition.renderStateBucketMap.keys()).sort();
        const { maxDirectionalLights, maxShadowCascades } = EngineSettings.instance;
        for (const bucketId of sortedBuckedIds) {
            const renderStateBucket = renderPassDefinition.renderStateBucketMap.get(bucketId) as IRenderStateBucket;
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
                    if (hasDirectionalLights) {
                        const numDirectionalLights = Math.min(maxDirectionalLights, directionalLights.length);
                        shader.applyParam("directionalLightCount", numDirectionalLights, visualBucketId);
                        for (let i = 0; i < numDirectionalLights; ++i) {
                            const { light, projectionMatrices, viewMatrices } = Private.directionalLights[i];
                            if (visualBucket.reference.receiveShadows) {
                                for (let j = 0; j < maxShadowCascades; ++j) {
                                    const lightMatrix = Private.dummyMatrix.multiplyMatrices(
                                        projectionMatrices[j],
                                        viewMatrices[j]
                                    );
                                    shader.applyParam(`directionalLightMatrices[${i * maxShadowCascades + j}]`, lightMatrix, visualBucketId);
                                }
                                shader.applyReferenceArrayParam("directionalShadowMaps", Private.directionalShadowMaps, visualBucketId);
                            }
                            const lightDir = Vector3.fromPool()
                                .copy(light.entity.transform.worldForward)
                                .transformDirection(viewMatrix);
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
        const renderStateBuckedIdToShadersMap = (renderPassToDefinitionMap.get(material.renderPass) as IRenderPassDefinition).renderStateBucketMap;
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

    export let dummyTransform: Transform;
    function setupDirectionalLightMatrices(camera: Camera, light: IDirectionalLight, cascadeIndex: number) {
        const lightTransform = light.light.entity.transform;
        const cameraTransform = camera.entity.transform;
        dummyTransform.position = Vector3.zero;
        dummyTransform.rotation = lightTransform.rotation;

        // Calculate bounds in order to frustum-fit the light projection matrix
        const localLightMatrix = Matrix44.fromPool().copy(dummyTransform.worldMatrix).invert();
        let left = Number.MAX_VALUE, bottom = Number.MAX_VALUE, minZ = Number.MAX_VALUE;
        let right = -Number.MAX_VALUE, top = -Number.MAX_VALUE, maxZ = -Number.MAX_VALUE;

        const frustum = (camera.frustum as IFrustum).splits[cascadeIndex];
        const localCornerPos = Vector3.fromPool();
        for (let i = 0; i < FrustumCorner.Count; ++i) {
            const corner = frustum.corners[i];
            localCornerPos.copy(corner)
                .substract(cameraTransform.worldPosition)
                .transform(localLightMatrix);
            if (localCornerPos.x < left) {
                left = localCornerPos.x;
            }
            if (localCornerPos.x > right) {
                right = localCornerPos.x;
            }
            if (localCornerPos.y < bottom) {
                bottom = localCornerPos.y;
            }
            if (localCornerPos.y > top) {
                top = localCornerPos.y;
            }
            if (localCornerPos.z < minZ) {
                minZ = localCornerPos.z;
            }
            if (localCornerPos.z > maxZ) {
                maxZ = localCornerPos.z;
            }
        }

        // Make ortho projection matrix        
        const halfHorizontalExtent = (right - left) / 2;
        const halfVerticalExtent = (top - bottom) / 2;
        const halfForwardExtent = (maxZ - minZ) / 2;
        light.projectionMatrices[cascadeIndex].makeOrthoProjection(
            -halfHorizontalExtent,
            halfHorizontalExtent,
            halfVerticalExtent,
            -halfVerticalExtent,
            -halfForwardExtent,
            halfForwardExtent
        );

        // Make view matrix
        const rightOffset = left + halfHorizontalExtent;
        const upOffset = bottom + halfVerticalExtent;
        const forwardOffset = minZ + halfForwardExtent;
        dummyTransform.position.copy(cameraTransform.worldPosition)
            .add(Vector3.fromPool().copy(lightTransform.worldForward).multiply(forwardOffset))
            .add(Vector3.fromPool().copy(lightTransform.worldRight).multiply(rightOffset))
            .add(Vector3.fromPool().copy(lightTransform.worldUp).multiply(upOffset));
        light.viewMatrices[cascadeIndex].copy(dummyTransform.worldMatrix).invert();
    }

    export function renderShadowMaps(camera: Camera) {
        const { maxDirectionalLights, maxShadowCascades } = EngineSettings.instance;
        const maxDirectionalShadowMaps = maxDirectionalLights * maxShadowCascades;
        Private.directionalShadowMaps.length = maxDirectionalShadowMaps;

        const context = WebGL.context;
        // render to shadow maps
        context.enable(context.DEPTH_TEST);
        context.disable(context.BLEND);
        context.depthMask(true);
        // render back faces to avoid self-shadowing artifacts
        context.enable(context.CULL_FACE);
        context.cullFace(context.FRONT);

        // Directional shadow maps
        const numDirectionalLights = Math.min(Private.directionalLights.length, maxDirectionalLights);
        let previousRenderDepthShader: Shader | null = null;
        for (let i = 0; i < numDirectionalLights; ++i) {
            let firstCascade = Private.directionalShadowMaps[i * maxShadowCascades];
            if (!firstCascade) {
                for (let j = 0; j < maxShadowCascades; ++j) {
                    const size = new Size(SizeType.Absolute, Private.defaultShadowMapSize.x / (Math.pow(2, j)));
                    Private.directionalShadowMaps[i * maxShadowCascades + j] 
                        = new RenderTarget(size, size, true, false, TextureFiltering.Nearest);
                }
            }

            try {
                for (let j = 0; j < maxShadowCascades; ++j) {
                    const cascade = Private.directionalShadowMaps[i * maxShadowCascades + j];
                    IRendererInternal.instance.renderTarget = cascade;
                    setupDirectionalLightMatrices(camera, Private.directionalLights[i], j);

                    // TODO this is horribly inefficient, must unify the shading pipeline and use a shader with multiple 
                    // instances like the standard shader!!
                    Private.shadowCasters.forEach((visuals, vertexBuffer) => {
                        // TODO This assumes that all the visual instances of a particular vertex buffer
                        // Are renderer with the same shader type (skinned vs non-skinned), this is a fair assumption
                        // But deserves a check in the future
                        const hasSkinning = visuals[0].isSkinned;
                        const currentShader = hasSkinning ? defaultAssets.shaders.skinnedRenderDepth : defaultAssets.shaders.renderDepth;
                        if (currentShader !== previousRenderDepthShader) {
                            currentShader.begin();
                            previousRenderDepthShader = currentShader;
                        }
                        
                        currentShader.applyParam("projectionMatrix", Private.directionalLights[i].projectionMatrices[j]);
                        if (hasSkinning) {
                            currentShader.applyParam("viewMatrix", Private.directionalLights[i].viewMatrices[j]);
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
                                    Private.directionalLights[i].viewMatrices[j],
                                    visual.worldTransform
                                );
                                currentShader.applyParam("modelViewMatrix", modelViewMatrix);
                            }
                            vertexBuffer.draw(context);
                        }
                        vertexBuffer.end(context, currentShader);
                    });
                }
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

        Private.dummyTransform = new Transform();
        Private.dummyTransform.setEntity(new Entity());
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
        const lights = (renderables.Light as Light[]);
        Private.directionalLights = lights
            .filter(light => light.type.isA(DirectionalLight))
            .map(light => ({
                light,
                viewMatrices: Array.from(new Array(EngineSettings.instance.maxShadowCascades)).map(a => Matrix44.fromPool()),
                projectionMatrices: Array.from(new Array(EngineSettings.instance.maxShadowCascades)).map(a => Matrix44.fromPool())
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
                Private.doRenderPass(renderPassSelector.get(RenderPass.Opaque) as IRenderPassDefinition, gl, camera);
                Private.doRenderPass(renderPassSelector.get(RenderPass.Transparent) as IRenderPassDefinition, gl, camera);
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
