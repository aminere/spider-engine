
import { Visual } from "./Visual";
import { Vector2 } from "../math/Vector2";
import { RenderPass, TextureFiltering } from "./GraphicTypes";
import { Camera, CameraClear } from "./camera/Camera";
import { VertexBuffer } from "./VertexBuffer";
import { Material } from "./Material";
import { MapPool } from "../core/MapPool";
import { Matrix44 } from "../math/Matrix44";
import { Screen } from "../ui/Screen";
import { Shader, ShaderAttributes } from "./shading/Shader";
import { PerspectiveProjector } from "./camera/PerspectiveProjector";
import { Vector3 } from "../math/Vector3";
import { Light } from "./lighting/Light";
import { RenderTarget } from "./texture/RenderTarget";
import { GraphicUpdateResult, Geometry } from "./geometry/Geometry";
import { Size, SizeType } from "../core/Size";
import { Environment, ColorEnvironment, SkySimulation, SkyBoxEnvironment } from "./Environment";
import { SkinnedMesh } from "./geometry/SkinnedMesh";
import { GraphicUtils } from "./GraphicUtils";
import { ExponentialFog, LinearFog, Fog } from "./Fog";
import { Matrix33 } from "../math/Matrix33";
import { AssetReference } from "../serialization/AssetReference";
import { Texture } from "./texture/Texture";
import { GeometryProvider } from "./geometry/GeometryProvider";
import { WebGL } from "./WebGL";
import { Time } from "../core/Time";
import { defaultAssets } from "../assets/DefaultAssets";
import { IRenderer, IRendererInternal } from "./IRenderer";
import { Component } from "../core/Component";
import { FrustumTest } from "./camera/Frustum";
import { DirectionalLight } from "./lighting/DirectionalLight";
import { Transform } from "../core/Transform";
import { Entity } from "../core/Entity";
import { Shadow, PCFShadow } from "./lighting/Shadow";
import { AABB } from "../math/AABB";
import { graphicSettings } from "./GraphicSettings";
import { ReflectionProbe } from "./reflection/ReflectionProbe";
import { Bloom } from "./postfx/PostEffects";
import { PhongShaderInternal } from "./shading/PhongShader";
import { Color } from "./Color";

interface IRenderPassDefinition {
    allowDepthWrite: () => boolean;
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
type CameraToRenderPassToDefinitionMap = Map<Camera, RenderPassToDefinitionMap>;

namespace Private {
    export let canvas: HTMLCanvasElement;
    export const initialShadowCastersPoolSize = 128;
    export const numRenderPasses = RenderPass.Transparent + 1;
    export const initialCameraPoolSize = 8;
    export const initialMaterialPoolSize = 128;
    export const defaultShadowMapSize = new Vector2(4096, 4096);
    export let defaultPerspectiveCamera: Camera | null = null;

    export const screenSize = new Vector2();
    export const dummyMatrix = new Matrix44();
    export const normalMatrix = new Matrix33();
    export const uiProjectionMatrix = new Matrix44();
    export const cameraToRenderPassMap = new Map<Camera, RenderPassToDefinitionMap>();
    export const probeToRenderPassMap = new Map<ReflectionProbe, CameraToRenderPassToDefinitionMap>();

    export const renderPassToDefinitionMapPool = new MapPool<number, IRenderPassDefinition>(Private.initialCameraPoolSize);
    export const renderStateBucketMapPool = new MapPool<string, IRenderStateBucket>(Private.numRenderPasses * 3); // average 3 cameras
    export const shaderToVisualBucketsMapPool = new MapPool<Shader, VisualBucketsMap>(16);
    export const visualBucketsMapPool = new MapPool<string, IVisualBucket>(16);
    export const vertexBufferToVisualsMapPool = new MapPool<VertexBuffer, Visual[]>(16);
    export const shadowCastersMapPool = new MapPool<VertexBuffer, Visual[]>(16);
    export const cameraToRenderPassMapPool = new MapPool<Camera, RenderPassToDefinitionMap>(16);

    export let currentRenderTarget: RenderTarget | null = null;
    export let currentCubemapFace: number | undefined = undefined;
    export let showWireFrame = false;
    export let showShadowCascades = false;

    // shadow mapping
    export let directionalLights: IDirectionalLight[];
    export const directionalShadowMaps: RenderTarget[] = [];
    export const cameraToShadowCastersMap = new Map<Camera, Visual[]>();
    export const skinnedRenderDepthBonesTexture = new AssetReference(Texture);

    export const updatedSkinnedMeshes = new Map<SkinnedMesh, boolean>();

    function doRenderPass(renderPassDefinition: IRenderPassDefinition, camera: Camera, fog?: Fog) {
        if (renderPassDefinition.renderStateBucketMap.size === 0) {
            return;
        }

        const viewMatrix = camera.getViewMatrix();
        const { maxDirectionalLights, maxShadowCascades, shadowCascadeEdges } = graphicSettings;
        const numDirectionalLights = Math.min(maxDirectionalLights, directionalLights.length);

        // this ensure materials with additive blending mode are rendered last
        // Because BlendingModes.Additive > BlendingModes.Linear
        // TODO implement a more rebust method of controlling material render order
        // (for example separate into different buckets based on priority - controls the order but doesn't need uploadState multiple times.)
        const sortedBuckedIds = Array.from(renderPassDefinition.renderStateBucketMap.keys()).sort();
        for (const bucketId of sortedBuckedIds) {
            const renderStateBucket = renderPassDefinition.renderStateBucketMap.get(bucketId) as IRenderStateBucket;
            const refMaterial = renderStateBucket.reference;
            refMaterial.uploadState();
            WebGL.enableDepthTest(refMaterial.depthTest);
            if (refMaterial.depthTest) {
                WebGL.enableDepthWrite(renderPassDefinition.allowDepthWrite());
            }
            // tslint:disable-next-line
            renderStateBucket.shaderToVisualBucketsMap.forEach((visualBuckets, shader) => {
                visualBuckets.forEach((visualBucket, visualBucketId) => {
                    const shaderInstance = shader.beginWithVisual(visualBucket.reference, visualBucketId, fog);
                    if (!shaderInstance) {
                        return;
                    }

                    shader.applyParam("projectionMatrix", camera.getProjectionMatrix(), visualBucketId);
                    shader.applyParam("viewMatrix", viewMatrix, visualBucketId);
                    shader.applyParam("cameraPosition", camera.entity.transform.worldPosition, visualBucketId);

                    // lighting & shadowing
                    if (numDirectionalLights > 0) {
                        const { receiveShadows } = visualBucket.reference;
                        shader.applyParam("directionalLightCount", numDirectionalLights, visualBucketId);
                        if (receiveShadows) {
                            shader.applyNumberArrayParam("shadowCascadeEdges", shadowCascadeEdges, visualBucketId);
                            shader.applyReferenceArrayParam("directionalShadowMaps", directionalShadowMaps, visualBucketId);
                        }

                        const lightDir = Vector3.fromPool();
                        const lightDirs: Vector3[] = [];
                        for (let i = 0; i < numDirectionalLights; ++i) {
                            const { light } = directionalLights[i];
                            lightDir.copy(light.entity.transform.worldForward).transformDirection(viewMatrix);
                            lightDirs.push(Vector3.fromPool().copy(lightDir));                            
                            shader.applyParam(`directionalLights[${i}].color`, light.color, visualBucketId);
                            shader.applyParam(`directionalLights[${i}].intensity`, light.intensity, visualBucketId);

                            const hasShadows = receiveShadows && light.castShadows;
                            if (hasShadows) {
                                const { projectionMatrices, viewMatrices } = directionalLights[i];
                                for (let j = 0; j < maxShadowCascades; ++j) {
                                    const lightMatrix = dummyMatrix.multiplyMatrices(
                                        projectionMatrices[j],
                                        viewMatrices[j]
                                    );
                                    shader.applyParam(`directionalLightMatrices[${i * maxShadowCascades + j}]`, lightMatrix, visualBucketId);
                                }

                                const shadow = light.shadow as Shadow;
                                shader.applyParam(`directionalLights[${i}].shadow`, true, visualBucketId);
                                shader.applyParam(`directionalLights[${i}].shadowType`, shadow.getTypeIndex(), visualBucketId);
                                if (shadow.isA(PCFShadow)) {
                                    shader.applyParam(
                                        `directionalLights[${i}].shadowRadius`,
                                        (shadow as PCFShadow).radius,
                                        visualBucketId
                                    );
                                }
                            } else {
                                shader.applyParam(`directionalLights[${i}].shadow`, false, visualBucketId);
                            }
                        }

                        shader.applyVec3ArrayParam(`directionalLightDirs`, lightDirs, visualBucketId);

                    } else {
                        shader.applyParam("directionalLightCount", 0, visualBucketId);
                    }
                    // fog
                    if (fog && visualBucket.reference.receiveFog) {
                        shader.applyParam("fogColor", fog.color, visualBucketId);
                        if (fog.isA(ExponentialFog)) {
                            shader.applyParam("fogDensity", (fog as ExponentialFog).density, visualBucketId);
                        } else {
                            const linearFog = fog as LinearFog;
                            shader.applyParam("fogNear", linearFog.near, visualBucketId);
                            shader.applyParam("fogFar", linearFog.far, visualBucketId);
                        }
                    }

                    const shaderAttributes = shaderInstance.vertexAttribs as ShaderAttributes;
                    visualBucket.vertexBufferToVisualsMap.forEach((visuals, vertexBuffer) => {
                        vertexBuffer.bindBuffers();
                        vertexBuffer.bindAttributes(shaderAttributes);
                        // TODO instancing?
                        for (const visual of visuals) {
                            const geometryUpdateStatus = visual.graphicUpdate(camera);
                            if (geometryUpdateStatus === GraphicUpdateResult.Changed) {
                                vertexBuffer.updateBufferDatas();
                            }

                            let modelViewMatrix: Matrix44;
                            if (visual.isSkinned) {
                                modelViewMatrix = viewMatrix;
                                const skinnedMesh = (visual.geometry as SkinnedMesh);
                                if (!updatedSkinnedMeshes.has(skinnedMesh)) {
                                    skinnedMesh.updateMatrices();
                                    updatedSkinnedMeshes.set(skinnedMesh, true);
                                }                                
                                skinnedMesh.updateShader(shader, visualBucketId);
                            } else {
                                modelViewMatrix = Private.dummyMatrix.multiplyMatrices(viewMatrix, visual.worldTransform);
                            }                            

                            Private.normalMatrix.getNormalMatrix(modelViewMatrix);
                            shader.applyParam("worldMatrix", visual.worldTransform, visualBucketId);
                            shader.applyParam("modelViewMatrix", modelViewMatrix, visualBucketId);
                            shader.applyParam("normalMatrix", Private.normalMatrix, visualBucketId);
                            shader.applyParam("screenSize", screenSize, visualBucketId);
                            shader.applyParam("time", Time.time, visualBucketId);
                            shader.applyParam("deltaTime", Time.deltaTime, visualBucketId);
                            shader.applyParam("frame", Time.currentFrame, visualBucketId);

                            const envMap = visual.envMap;
                            if (envMap) {
                                shader.applyReferenceParam("envMap", envMap, visualBucketId);
                            }
                            
                            const material = (visual.animatedMaterial ?? visual.material) as Material;
                            const materialParams = material.shaderParams;
                            for (const [paramName, param] of Object.entries(materialParams)) {
                                shader.applyParam(paramName, param, visualBucketId);
                            }
                            vertexBuffer.draw();
                        }
                        vertexBuffer.unbindAttributes(shaderAttributes);
                    });
                });
            });
        }
    }    

    function doReflectionRenderPass(renderPassDefinition: IRenderPassDefinition, camera: Camera, viewMatrix: Matrix44) {
        let previousShader: Shader | null = null;
        renderPassDefinition.renderStateBucketMap.forEach((renderStateBucket, bucketId) => {
            renderStateBucket.shaderToVisualBucketsMap.forEach((visualBuckets, shader) => {
                const uniforms = shader.getUniforms();
                const diffuseMap = uniforms[PhongShaderInternal.diffuseMapKey];
                const hasDiffuseMap = diffuseMap && diffuseMap.type === "sampler2D";
                const diffuse = uniforms[PhongShaderInternal.diffuseKey];
                const hasDiffuse = diffuse && diffuse.type === "vec4";
                visualBuckets.forEach((visualBucket, visualBucketId) => {                     
                    visualBucket.vertexBufferToVisualsMap.forEach((visuals, vertexBuffer) => {

                        // TODO This assumes that all the visual instances of a particular vertex buffer
                        // Are renderer with the same shader type (skinned vs non-skinned), this is a fair assumption
                        // But deserves a check in the future
                        const hasSkinning = visuals[0].isSkinned;
                        const currentShader = hasSkinning
                            ? defaultAssets.shaders.skinnedDynamicCubemap
                            : defaultAssets.shaders.dynamicCubemap;
                        if (currentShader !== previousShader) {
                            currentShader.begin();
                            currentShader.applyParam("projectionMatrix", camera.getProjectionMatrix());
                            if (hasSkinning) {
                                currentShader.applyParam("viewMatrix", viewMatrix);
                            }
                            previousShader = currentShader;
                        }
                        
                        vertexBuffer.begin(currentShader);
                        for (const visual of visuals) {
                            const material = (visual.material ?? visual.animatedMaterial) as Material;
                            const texture = hasDiffuseMap ? material[PhongShaderInternal.diffuseMapKey] : defaultAssets.whiteTexture;
                            const color = hasDiffuse ? material[PhongShaderInternal.diffuseKey] : Color.white;
                            currentShader.applyReferenceParam("diffuse", texture);
                            currentShader.applyParam("ambient", color);
                            if (hasSkinning) {
                                const skinnedMesh = visual.geometry as SkinnedMesh;
                                if (!updatedSkinnedMeshes.has(skinnedMesh)) {
                                    skinnedMesh.updateMatrices();
                                    updatedSkinnedMeshes.set(skinnedMesh, true);
                                }
                                skinnedMesh.updateShader(currentShader, visual.bucketId);
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
                                const modelViewMatrix = Private.dummyMatrix.multiplyMatrices(viewMatrix, visual.worldTransform);
                                currentShader.applyParam("modelViewMatrix", modelViewMatrix);
                            }
                            vertexBuffer.draw();
                        }
                        vertexBuffer.end(currentShader);
                    });
                });
            });
        });
    }

    function findBounds(
        cameraTransform: Transform,
        localLightMatrix: Matrix44,
        corners: Vector3[],
        min: Vector3,
        max: Vector3
    ) {
        const lightPos = Vector3.fromPool();
        min.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        max.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        for (let i = 0; i < corners.length; ++i) {
            lightPos.copy(corners[i])
                .substract(cameraTransform.worldPosition)
                .transform(localLightMatrix);
            if (lightPos.x < min.x) {
                min.x = lightPos.x;
            }
            if (lightPos.x > max.x) {
                max.x = lightPos.x;
            }
            if (lightPos.y < min.y) {
                min.y = lightPos.y;
            }
            if (lightPos.y > max.y) {
                max.y = lightPos.y;
            }
            if (lightPos.z < min.z) {
                min.z = lightPos.z;
            }
            if (lightPos.z > max.z) {
                max.z = lightPos.z;
            }
        }
    }

    export let dummyTransform: Transform;
    function setupDirectionalLightMatrices(
        camera: Camera,
        light: IDirectionalLight,
        cascadeIndex: number,
        shadowCasters: Visual[]
    ) {
        const lightTransform = light.light.entity.transform;
        dummyTransform.position = Vector3.zero;
        dummyTransform.rotation = lightTransform.rotation;
        const localLightMatrix = Matrix44.fromPool().copy(dummyTransform.worldMatrix).invert();
        const cameraTransform = camera.entity.transform;

        // Tight fit around current frustum split
        const frustum = camera.frustum.splits[cascadeIndex];
        const frustumMin = Vector3.fromPool();
        const frustumMax = Vector3.fromPool();
        findBounds(cameraTransform, localLightMatrix, frustum.corners, frustumMin, frustumMax);

        const visibleShadowCasters = shadowCastersMapPool.get();
        const casterMin = Vector3.fromPool();
        const casterMax = Vector3.fromPool();
        const castersMin = Vector3.fromPool().set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        const castersMax = Vector3.fromPool().set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        for (const shadowCaster of shadowCasters) {
            const visualAABB = (shadowCaster.geometry as Geometry).getBoundingBox() as AABB;
            Private.dummyAABB.copy(visualAABB).transform(shadowCaster.worldTransform);
            findBounds(cameraTransform, localLightMatrix, Private.dummyAABB.corners, casterMin, casterMax);

            // Light frustum test
            if (casterMax.x < frustumMin.x || casterMin.x > frustumMax.x
            || casterMax.y < frustumMin.y || casterMin.y > frustumMax.y
            || casterMax.z < frustumMin.z) {
                continue;
            }

            // Keep track of global shadow caster bounds
            castersMin.set(
                Math.min(castersMin.x, casterMin.x), 
                Math.min(castersMin.y, casterMin.y), 
                Math.min(castersMin.z, casterMin.z)
            );
            castersMax.set(
                Math.max(castersMax.x, casterMax.x),
                Math.max(castersMax.y, casterMax.y),
                Math.max(castersMax.z, casterMax.z)
            );

            const vertexBuffer = shadowCaster.vertexBuffer as VertexBuffer;
            const visuals = visibleShadowCasters.get(vertexBuffer);
            if (visuals) {
                visuals.push(shadowCaster);                
            } else {
                visibleShadowCasters.set(vertexBuffer, [shadowCaster]);
            }
        }

        if (visibleShadowCasters.size > 0) {
            const padding = 1; // leave padding around to guarantee smooth shadows
            // Tight fit around shadow casters
            frustumMin.x = Math.max(castersMin.x - padding, frustumMin.x);
            frustumMax.x = Math.min(castersMax.x + padding, frustumMax.x);
            frustumMin.y = Math.max(castersMin.y - padding, frustumMin.y);
            frustumMax.y = Math.min(castersMax.y + padding, frustumMax.y);
            frustumMin.z = Math.min(castersMin.z, frustumMin.z);
            // Expand towards light direction to catch casters that are behind the camera
            frustumMax.z = Math.max(castersMax.z, frustumMax.z);

            // Make ortho projection matrix        
            const halfHorizontalExtent = (frustumMax.x - frustumMin.x) / 2;
            const halfVerticalExtent = (frustumMax.y - frustumMin.y) / 2;
            const halfForwardExtent = (frustumMax.z - frustumMin.z) / 2;
            light.projectionMatrices[cascadeIndex].makeOrthoProjection(
                -halfHorizontalExtent,
                halfHorizontalExtent,
                halfVerticalExtent,
                -halfVerticalExtent,
                -halfForwardExtent,
                halfForwardExtent
            );

            // Make view matrix
            const rightOffset = frustumMin.x + halfHorizontalExtent;
            const upOffset = frustumMin.y + halfVerticalExtent;
            const forwardOffset = frustumMin.z + halfForwardExtent;
            dummyTransform.position.copy(cameraTransform.worldPosition)
                .add(Vector3.fromPool().copy(lightTransform.worldForward).multiply(forwardOffset))
                .add(Vector3.fromPool().copy(lightTransform.worldRight).multiply(rightOffset))
                .add(Vector3.fromPool().copy(lightTransform.worldUp).multiply(upOffset));
            light.viewMatrices[cascadeIndex].copy(dummyTransform.worldMatrix).invert();
            return visibleShadowCasters;
        } 

        return null;
    }

    export const dummyAABB = new AABB();
    function renderShadowMaps(camera: Camera) {
        const { maxDirectionalLights, maxShadowCascades } = graphicSettings;
        const maxDirectionalShadowMaps = maxDirectionalLights * maxShadowCascades;
        Private.directionalShadowMaps.length = maxDirectionalShadowMaps;

        // directional shadow maps
        const numDirectionalLights = Math.min(Private.directionalLights.length, maxDirectionalLights);
        let previousRenderDepthShader: Shader | null = null;

        if (numDirectionalLights > 0) {
            WebGL.enableDepthTest(true);
            WebGL.enableBlending(false);
            WebGL.enableDepthWrite(true);
            WebGL.enableCulling(true);
            WebGL.setCullMode(WebGL.context.BACK);
        }

        const shadowCasters = Private.cameraToShadowCastersMap.get(camera);
        for (let i = 0; i < numDirectionalLights; ++i) {
            let firstCascade = Private.directionalShadowMaps[i * maxShadowCascades];
            if (!firstCascade) {
                for (let j = 0; j < maxShadowCascades; ++j) {
                    const size = new Size(SizeType.Absolute, Private.defaultShadowMapSize.x / (Math.pow(2, j)));
                    Private.directionalShadowMaps[i * maxShadowCascades + j]
                        = new RenderTarget(size, size, true, false, TextureFiltering.Nearest);
                }
            }

            for (let j = 0; j < maxShadowCascades; ++j) {
                let matricesNeedUpdate = true;
                const cascade = Private.directionalShadowMaps[i * maxShadowCascades + j];
                IRendererInternal.instance.setRenderTarget(cascade);

                // This is done here so that the shadow maps get cleared (in renderTarget = cascade)
                // otherwise, the shadows remain even if shadowcasters are gone
                if (!shadowCasters) {
                    continue;
                }

                const visibleShadowCasters = setupDirectionalLightMatrices(camera, Private.directionalLights[i], j, shadowCasters);

                if (!visibleShadowCasters) {
                    continue;
                }

                // TODO this is horribly inefficient, must unify the shading pipeline and use a shader with multiple 
                // instances like the standard shader!!
                visibleShadowCasters.forEach((visuals, vertexBuffer) => {
                    // TODO This assumes that all the visual instances of a particular vertex buffer
                    // Are renderer with the same shader type (skinned vs non-skinned), this is a fair assumption
                    // But deserves a check in the future
                    const hasSkinning = visuals[0].isSkinned;
                    const currentShader = hasSkinning ? defaultAssets.shaders.skinnedRenderDepth : defaultAssets.shaders.renderDepth;
                    if (currentShader !== previousRenderDepthShader) {
                        currentShader.begin();
                        previousRenderDepthShader = currentShader;
                        matricesNeedUpdate = true;
                    }

                    if (matricesNeedUpdate) {
                        currentShader.applyParam("projectionMatrix", Private.directionalLights[i].projectionMatrices[j]);
                        if (hasSkinning) {
                            currentShader.applyParam("viewMatrix", Private.directionalLights[i].viewMatrices[j]);
                        }
                        matricesNeedUpdate = false;
                    }

                    vertexBuffer.begin(currentShader);
                    for (const visual of visuals) {
                        if (hasSkinning) {
                            const skinnedMesh = visual.geometry as SkinnedMesh;
                            if (!updatedSkinnedMeshes.has(skinnedMesh)) {
                                skinnedMesh.updateMatrices();
                                updatedSkinnedMeshes.set(skinnedMesh, true);
                            }
                            skinnedMesh.updateShader(currentShader, visual.bucketId);
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
                        vertexBuffer.draw();
                    }
                    vertexBuffer.end(currentShader);
                });
            }
        }
    }

    function tryClearWithColor(environment: Environment) {
        const gl = WebGL.context;
        if ((environment as Environment).isA(ColorEnvironment)) {
            const color = (environment as ColorEnvironment).color;
            gl.clearColor(color.r, color.g, color.b, color.a);
            // tslint:disable-next-line
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            return true;
        } else {
            gl.clear(gl.DEPTH_BUFFER_BIT);
        }
        return false;
    }

    function makeSkyViewMatrix(camera: Camera) {
        const { zFar } = camera.projector;
        return Matrix44.fromPool()
            .copy(camera.entity.transform.worldMatrix)
            .setPosition(Vector3.zero)
            .transpose()
            .scaleFromCoords(zFar, zFar, zFar);
    }

    function tryClearWithEnvironment(camera: Camera, environment: Environment, viewMatrix: Matrix44) {
        if ((environment as Environment).isA(SkySimulation)) {
            const skySim = environment as SkySimulation;
            WebGL.enableDepthTest(true);
            WebGL.enableDepthWrite(false);
            const { sky } = defaultAssets.materials;
            sky.queueParameter("projectionMatrix", camera.getProjectionMatrix());
            sky.queueParameter("modelViewMatrix", viewMatrix);
            sky.queueParameter("sunPosition", skySim.sunPosition);
            sky.queueParameter("rayleigh", skySim.rayleigh);
            sky.queueParameter("turbidity", skySim.turbidity);
            sky.queueParameter("mieCoefficient", skySim.mieCoefficient);
            sky.queueParameter("luminance", skySim.luminance);
            sky.queueParameter("mieDirectionalG", skySim.mieDirectionalG);
            if (sky.begin()) {
                const { sphere } = defaultAssets.primitives;
                GraphicUtils.drawVertexBuffer(sphere.vertexBuffer, sky.shader as Shader);
            }
        } else if ((environment as Environment).isA(SkyBoxEnvironment)) {
            const sky = environment as SkyBoxEnvironment;
            if (sky.cubeMap) {
                WebGL.enableDepthTest(true);
                WebGL.enableDepthWrite(false);
                const { cubeMap } = defaultAssets.materials;
                cubeMap.queueParameter("projectionMatrix", camera.getProjectionMatrix());
                cubeMap.queueParameter("modelViewMatrix", viewMatrix);
                cubeMap.queueReferenceParameter("cubemap", sky.cubeMap);
                if (cubeMap.begin()) {
                    GraphicUtils.drawVertexBuffer(GeometryProvider.skyBox, cubeMap.shader as Shader);
                }
            }
        }
    }

    function doPostFX(camera: Camera, bloom: Bloom) {
        const fullScreenQuad = GeometryProvider.centeredQuad;
        const inputRT = bloom.render(camera.sceneRenderTarget, fullScreenQuad) as RenderTarget;
        // add post effects to scene RT
        const composeShader = defaultAssets.shaders.compose;
        if (composeShader.begin()) {
            IRendererInternal.instance.setRenderTarget(camera.renderTarget);
            composeShader.applyReferenceParam("scene", camera.sceneRenderTarget);
            composeShader.applyReferenceParam("postFX", inputRT);
            composeShader.applyParam("postFxIntensity", bloom.intensity);
            GraphicUtils.drawVertexBuffer(fullScreenQuad, composeShader);
        }
    }

    export function addToRenderMap(renderMap: RenderPassToDefinitionMap, visual: Visual) {
        const vertexBuffer = visual.vertexBuffer;
        if (!vertexBuffer) {
            return;
        }
        const material = visual.animatedMaterial || visual.material;
        if (!material || !material.shader) {
            return;
        }

        const renderStateBuckedIdToShadersMap = (renderMap.get(material.renderPass))?.renderStateBucketMap;
        const materialBucketId = material.buckedId;
        let renderStateBucket = renderStateBuckedIdToShadersMap?.get(materialBucketId);
        if (!renderStateBucket) {
            renderStateBucket = {
                reference: material,
                shaderToVisualBucketsMap: Private.shaderToVisualBucketsMapPool.get()
            };
            renderStateBuckedIdToShadersMap?.set(materialBucketId, renderStateBucket);
        }

        let visualBucketsMap = renderStateBucket.shaderToVisualBucketsMap.get(material.shader);
        if (!visualBucketsMap) {
            visualBucketsMap = Private.visualBucketsMapPool.get();
            renderStateBucket.shaderToVisualBucketsMap.set(material.shader, visualBucketsMap);
        }

        const bucketId = visual.bucketId;
        let visualBucket = visualBucketsMap.get(bucketId);
        if (!visualBucket) {
            visualBucket = {
                reference: visual,
                vertexBufferToVisualsMap: Private.vertexBufferToVisualsMapPool.get()
            };
            visualBucketsMap.set(bucketId, visualBucket);
        }

        const visuals = visualBucket.vertexBufferToVisualsMap.get(vertexBuffer);
        if (visuals) {
            visuals.push(visual);
        } else {
            visualBucket.vertexBufferToVisualsMap.set(vertexBuffer, [visual]);            
        }
    }

    export function renderReflections(
        selector: RenderPassToDefinitionMap,
        camera: Camera,
        cubeMapFace: number,
        environment?: Environment
    ) {
        camera.setupFrame();
        IRendererInternal.instance.setRenderTarget(camera.renderTarget, cubeMapFace);

        const needClear = (camera.clearValue === CameraClear.Environment) && Boolean(environment);
        const cleared = needClear && tryClearWithColor(environment as Environment);        

        WebGL.enableDepthTest(true);
        WebGL.enableBlending(false);

        // ignore entity rotation
        const { worldPosition, rotation } = camera.entity.transform;
        const viewMatrix = Matrix44.fromPool().compose(worldPosition, rotation, Vector3.one).invert();
        const beginPass = () => {
            WebGL.enableDepthWrite(true);
        };

        beginPass();
        doReflectionRenderPass(selector.get(RenderPass.Opaque) as IRenderPassDefinition, camera, viewMatrix);

        if (needClear && !cleared) {
            const { zFar } = camera.projector;
            const skyViewMatrix = Matrix44.fromPool().compose(Vector3.zero, rotation, Vector3.one)
                .transpose()
                .scaleFromCoords(zFar, zFar, zFar);
            tryClearWithEnvironment(camera, environment as Environment, skyViewMatrix);
            beginPass();
        }

        doReflectionRenderPass(selector.get(RenderPass.Transparent) as IRenderPassDefinition, camera, viewMatrix);
    }

    export function render(
        selector: RenderPassToDefinitionMap,
        camera: Camera,
        environment?: Environment,
        fog?: Fog,
        preRender?: (camera: Camera) => void,
        postRender?: (camera: Camera) => void,
    ) {
        renderShadowMaps(camera);
        camera.setupFrame();

        const bloom = camera.postEffects?.bloom;
        if (bloom) {
            IRendererInternal.instance.setRenderTarget(camera.sceneRenderTarget);
        } else {
            IRendererInternal.instance.setRenderTarget(camera.renderTarget);
        }        

        if (!Private.defaultPerspectiveCamera) {
            const projector = camera.projector;
            if (projector && projector.isA(PerspectiveProjector)) {
                Private.defaultPerspectiveCamera = camera;
            }
        }               

        const needClear = (camera.clearValue === CameraClear.Environment) && Boolean(environment);
        const cleared = needClear && tryClearWithColor(environment as Environment);

        if (preRender) {
            preRender(camera);
        }
        doRenderPass(selector.get(RenderPass.Opaque) as IRenderPassDefinition, camera, fog);
        
        if (needClear && !cleared) {
            tryClearWithEnvironment(camera, environment as Environment, makeSkyViewMatrix(camera));
        }

        doRenderPass(selector.get(RenderPass.Transparent) as IRenderPassDefinition, camera, fog);
        if (postRender) {
            postRender(camera);
        }

        // TODO handle all post effects here not just bloom!
        if (bloom) {
            doPostFX(camera, bloom);
        }
    }

    export function makeRenderPassDefinitions() {
        const renderPassToDefinitionMap = Private.renderPassToDefinitionMapPool.get();

        // OPAQUE PASS
        renderPassToDefinitionMap.set(RenderPass.Opaque, {
            allowDepthWrite: () => true,
            renderStateBucketMap: Private.renderStateBucketMapPool.get()
        });

        // TRANSPARENT PASS
        renderPassToDefinitionMap.set(RenderPass.Transparent, {
            allowDepthWrite: () => false,
            renderStateBucketMap: Private.renderStateBucketMapPool.get()
        });

        return renderPassToDefinitionMap;
    }     
}

export class Renderer implements IRenderer {
    get screenSize() { return Private.screenSize; }
    get defaultPerspectiveCamera() { return Private.defaultPerspectiveCamera; }
    get canvas() { return Private.canvas; }
    get renderTarget() { return Private.currentRenderTarget; }
    
    set showWireFrame(show: boolean) {
        if (show === Private.showWireFrame) {
            return;
        }
        GraphicUtils.invalidateShaders();
        Private.showWireFrame = show;
    }
    get showWireFrame() { return Private.showWireFrame; }

    set showShadowCascades(show: boolean) {
        if (show === Private.showShadowCascades) {
            return;
        }
        GraphicUtils.invalidateShaders();
        Private.showShadowCascades = show;
    }
    get showShadowCascades() { return Private.showShadowCascades; }

    setRenderTarget(rt: RenderTarget | null, cubeMapFace?: number) {
        if (rt === Private.currentRenderTarget && Private.currentCubemapFace === cubeMapFace) {
            return;
        }
        if (rt) {
            const result = rt.bind(cubeMapFace);
            if (result) {
                Private.currentRenderTarget = rt;
                Private.currentCubemapFace = cubeMapFace;
            } else {
                throw "RenderTarget not ready for rendering";
            }
        } else {
            WebGL.context.bindFramebuffer(WebGL.context.FRAMEBUFFER, null);
            WebGL.context.viewport(0, 0, this.screenSize.x, this.screenSize.y);
            Private.currentRenderTarget = null;
            Private.currentCubemapFace = undefined;
        }
    }
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
        fog: Fog | undefined,
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
        Private.shadowCastersMapPool.flush();
        Private.cameraToRenderPassMapPool.flush();

        // setup render pass definitions
        Private.cameraToRenderPassMap.clear();
        cameras.forEach(camera => {
            Private.cameraToRenderPassMap.set(camera, Private.makeRenderPassDefinitions());
        });
        Private.probeToRenderPassMap.clear();        

        // collect renderables
        Private.defaultPerspectiveCamera = null;
        Private.cameraToShadowCastersMap.clear();

        // TODO support sky simulation environment maps
        const sceneEnvMap = (environment?.isA(SkyBoxEnvironment) ? (environment as SkyBoxEnvironment).cubeMap : null);        

        for (const visual of renderables.Visual as Visual[]) {
            if (!visual.vertexBuffer) {
                continue;
            }

            let visualAABB: AABB | null = null;

            let closestProbe: ReflectionProbe | null = null;
            let distToClosestProbe = Number.MAX_VALUE;
            if (visual.isReflective) {
                for (const probe of renderables.ReflectionProbe as ReflectionProbe[]) {
                    const distToProbe = Vector3.distanceSq(
                        probe.entity.transform.worldPosition,
                        visual.entity.transform.worldPosition
                    );
                    if (distToProbe < distToClosestProbe) {
                        closestProbe = probe;                        
                        distToClosestProbe = distToProbe;
                    }
                }
                visual.envMap = closestProbe?.renderTarget ?? sceneEnvMap;   
            } else {
                visual.envMap = null;
            }

            for (const probe of renderables.ReflectionProbe as ReflectionProbe[]) {

                if (!probe.canCapture()) {
                    continue;
                }

                let probeMap = Private.probeToRenderPassMap.get(probe);
                if (!probeMap) {
                    probeMap = Private.cameraToRenderPassMapPool.get();
                    Private.probeToRenderPassMap.set(probe, probeMap);
                    probe.traverseCameras(camera => {
                        probeMap?.set(camera, Private.makeRenderPassDefinitions());
                    });
                }

                if (
                    probe.entity.isAncestor(visual.entity)
                    || !probe.canRenderGroup(visual.group)
                ) {
                    continue;
                }

                const bbox = visual.geometry?.getBoundingBox();
                if (bbox) {
                    visualAABB = Private.dummyAABB.copy(bbox).transform(visual.worldTransform);
                    probe.traverseCameras(camera => {
                        // Disable frustum culling for now because scene is low resolution anyway
                        // Re-enable it but make sure the frustum is not rotated!! otherwise objects disappear
                        // (Reflection probes' transform must keep an identity rotation)
                        // if (camera.frustum.full.testAABB(visualAABB as AABB) !== FrustumTest.Out) {
                            const selector = probeMap?.get(camera) as RenderPassToDefinitionMap;
                            Private.addToRenderMap(selector, visual);
                        // }
                    });
                } else {
                    // TODO cull geometries that don't have an AABB?
                    probe.traverseCameras(camera => {
                        const selector = probeMap?.get(camera) as RenderPassToDefinitionMap;
                        Private.addToRenderMap(selector, visual);
                    });
                }
            }

            for (const camera of cameras) {

                if (!camera.canRenderGroup(visual.group)) {
                    continue;
                }

                const bbox = visual.geometry?.getBoundingBox();
                if (bbox) {
                    if (visual.castShadows) {
                        const visuals = Private.cameraToShadowCastersMap.get(camera);
                        if (visuals) {
                            visuals.push(visual);                           
                        } else {
                            Private.cameraToShadowCastersMap.set(camera, [visual]);
                        }
                    }

                    // Frustum culling
                    const aabb = visualAABB ?? Private.dummyAABB.copy(bbox).transform(visual.worldTransform);                    
                    if (camera.frustum.full.testAABB(aabb) === FrustumTest.Out) {
                        continue;
                    }

                } else {
                    // TODO cull & shadow cast geometries that don't have an AABB?
                }

                const renderMap = Private.cameraToRenderPassMap.get(camera) as RenderPassToDefinitionMap;
                Private.addToRenderMap(renderMap, visual);
            }            
        }

        const lights = (renderables.Light as Light[]);
        Private.directionalLights = lights
            .filter(light => light.type.isA(DirectionalLight))
            .map(light => ({
                light,
                viewMatrices: Array.from(new Array(graphicSettings.maxShadowCascades)).map(a => Matrix44.fromPool()),
                projectionMatrices: Array.from(new Array(graphicSettings.maxShadowCascades)).map(a => Matrix44.fromPool())
            }));

        Private.updatedSkinnedMeshes.clear();

        // update reflection maps
        for (const probe of renderables.ReflectionProbe as ReflectionProbe[]) {
            probe.tick();
        }
        Private.probeToRenderPassMap.forEach((cameraToRenderPass, probe) => {
            cameraToRenderPass.forEach((selector, camera) => {
                const index = probe.getCameraIndex(camera);
                const cubeMapFace = WebGL.cubeMapFaces[index];
                Private.renderReflections(selector, camera, cubeMapFace, environment);
            });
        });

        if (Private.cameraToRenderPassMap.size > 0) {            
            Private.cameraToRenderPassMap.forEach((selector, camera) => {
                Private.render(
                    selector,
                    camera,                    
                    environment,
                    fog,                    
                    preRender,
                    postRender
                );
            });
        } else {
            // Empty scene, so at least do the pre and post rendering
            IRendererInternal.instance.setRenderTarget(null);
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
        if (renderables.Screen.length) {
            IRendererInternal.instance.setRenderTarget(null);
            WebGL.enableDepthTest(false);
            const { ui } = defaultAssets.materials;
            ui.queueParameter("projectionMatrix", Private.uiProjectionMatrix);
            for (const screen of renderables.Screen as Screen[]) {
                screen.updateTransforms();
                screen.render(ui);
            }
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
