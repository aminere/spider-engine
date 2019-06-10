
import { Texture2D } from "../graphics/Texture2D";
import { Asset } from "./Asset";
import { StaticMeshAsset } from "./StaticMeshAsset";
import { Material } from "../graphics/Material";
import { Scene } from "./Scene";
import { Prefab } from "./Prefab";
import { Shader } from "../graphics/Shader";
import { AssetLoadingDefinition } from "./AssetLoadingDefinition";
import { EngineHud } from "../core/hud/EngineHud";
import { IObjectManagerInternal } from "../core/IObjectManager";

namespace Private {

    export let whiteTexture: Texture2D;
    export let particlesMaterial: Material;
    export let transitionScene: Scene;
    export let boxMesh: StaticMeshAsset;
    export let sphereMesh: StaticMeshAsset;
    export let planeMesh: StaticMeshAsset;
    export let coneMesh: StaticMeshAsset;
    export let hudPrefab: Prefab;
    export let hudProperty: Prefab;
    export let uiMaterial: Material;
    export let renderDepthShader: Shader;
    export let skinnedRenderDepthShader: Shader;
    export let skyMaterial: Material;
    export let cubeMapMaterial: Material;
    export let fullScreenShader: Shader;
    export let blurShader: Shader;
    export let composeShader: Shader;
    export let bloomShader: Shader;

    export const defaultAssets: AssetLoadingDefinition[] = [
        // Engine assets
        {
            path: "Assets/DefaultAssets/Textures/WhiteSquare.Texture2D",
            set: asset => whiteTexture = asset as Texture2D,
            get: () => whiteTexture
        },
        {
            path: "Assets/DefaultAssets/Materials/Particles.Material",
            set: asset => particlesMaterial = asset as Material,
            get: () => particlesMaterial
        },
        {
            path: "Assets/DefaultAssets/Transition/Transition.Scene",
            set: asset => transitionScene = asset as Scene,
            get: () => transitionScene
        },
        {
            path: "Assets/DefaultAssets/Geometry/Meshes/Cube.StaticMeshAsset",
            set: asset => boxMesh = asset as StaticMeshAsset,
            get: () => boxMesh
        },
        {
            path: "Assets/DefaultAssets/Geometry/Meshes/Sphere.StaticMeshAsset",
            set: asset => sphereMesh = asset as StaticMeshAsset,
            get: () => sphereMesh
        },
        {
            path: "Assets/DefaultAssets/Geometry/Meshes/Plane.StaticMeshAsset",
            set: asset => planeMesh = asset as StaticMeshAsset,
            get: () => planeMesh
        },
        {
            path: "Assets/DefaultAssets/Geometry/Meshes/Cone.StaticMeshAsset",
            set: asset => coneMesh = asset as StaticMeshAsset,
            get: () => coneMesh
        },
        // Rendering
        {
            path: "Assets/DefaultAssets/Materials/UI.Material",
            set: asset => uiMaterial = asset as Material,
            get: () => uiMaterial
        },
        {
            path: "Assets/DefaultAssets/Shaders/RenderDepth.Shader",
            set: asset => renderDepthShader = asset as Shader,
            get: () => renderDepthShader
        },
        {
            path: "Assets/DefaultAssets/Shaders/SkinnedRenderDepth.Shader",
            set: asset => skinnedRenderDepthShader = asset as Shader,
            get: () => skinnedRenderDepthShader
        },
        {
            path: "Assets/DefaultAssets/Materials/Sky.Material",
            set: asset => skyMaterial = asset as Material,
            get: () => skyMaterial
        },
        {
            path: "Assets/DefaultAssets/Materials/CubeMap.Material",
            set: asset => cubeMapMaterial = asset as Material,
            get: () => cubeMapMaterial
        },
        {
            path: "Assets/DefaultAssets/Shaders/FullScreen.Shader",
            set: asset => fullScreenShader = asset as Shader,
            get: () => fullScreenShader
        },
        {
            path: "Assets/DefaultAssets/Shaders/PostFX/BloomStep1.Shader",
            set: asset => bloomShader = asset as Shader,
            get: () => bloomShader
        },
        {
            path: "Assets/DefaultAssets/Shaders/PostFX/Blur.Shader",
            set: asset => blurShader = asset as Shader,
            get: () => blurShader
        },
        {
            path: "Assets/DefaultAssets/Shaders/PostFX/Compose.Shader",
            set: asset => composeShader = asset as Shader,
            get: () => composeShader
        }
    ];
}

export class DefaultAssets {
    static get whiteTexture() { return Private.whiteTexture; }
    static get boxMesh() { return Private.boxMesh; }
    static get sphereMesh() { return Private.sphereMesh; }
    static get planeMesh() { return Private.planeMesh; }
    static get coneMesh() { return Private.coneMesh; }
    static get uiMaterial() { return Private.uiMaterial; }
    static get blurShader() { return Private.blurShader; }
    static get fullScreenShader() { return Private.fullScreenShader; }
    static get particlesMaterial() { return Private.particlesMaterial; }
    static get composeShader() { return Private.composeShader; }
    static get renderDepthShader() { return Private.renderDepthShader; }
    static get skinnedRenderDepthShader() { return Private.skinnedRenderDepthShader; }
    static get cubeMapMaterial() { return Private.cubeMapMaterial; }
    static get skyMaterial() { return Private.skyMaterial; }
    static get transitionScene() { return Private.transitionScene; }

    static load() {
        return Promise.all(
            Private.defaultAssets.map(a => {
                return IObjectManagerInternal.instance.loadObject(a.path)
                    .then(tuple => a.set(tuple[0] as Asset));
            })
        )
        .then(() => EngineHud.load());
    }

    static get loaded() {
        for (const a of Private.defaultAssets) {
            if (!a.get().isLoaded()) {
                return false;
            }
        }
        return EngineHud.isLoaded();
    }
}
