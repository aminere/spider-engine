
import { Texture2D } from "../graphics/texture/Texture2D";
import { Asset } from "./Asset";
import { StaticMeshAsset } from "./StaticMeshAsset";
import { Material } from "../graphics/Material";
import { Scene } from "./Scene";
import { Prefab } from "./Prefab";
import { Shader } from "../graphics/shading/Shader";
import { AssetLoadingDefinition } from "./AssetLoadingDefinition";
import { EngineHud } from "../core/hud/EngineHud";
import { IObjectManagerInternal } from "../core/IObjectManager";

export namespace defaultAssets {    
    export namespace materials {
        export let particles: Material;
        export let ui: Material;
        export let sky: Material;
        export let cubeMap: Material;
    }    

    export namespace shaders {
        export let renderDepth: Shader;
        export let skinnedRenderDepth: Shader;
        export let phong: Shader;    
        export let fullScreen: Shader;
        export let blur: Shader;
        export let compose: Shader;
        export let bloom: Shader;
        export let diffuse: Shader;
        export let dynamicCubemap: Shader;
        export let skinnedDynamicCubemap: Shader;
    }    
    
    export namespace primitives {    
        export let box: StaticMeshAsset;
        export let sphere: StaticMeshAsset;
        export let plane: StaticMeshAsset;
        export let cone: StaticMeshAsset;
    }
    
    // misc
    export let whiteTexture: Texture2D;    
    export let transitionScene: Scene;    
    export let cubemapCaptureRig: Prefab;
}

namespace Private {    
    export const definitions: AssetLoadingDefinition[] = [
        // materials
        {
            path: "Assets/DefaultAssets/Materials/Particles.Material",
            set: asset => defaultAssets.materials.particles = asset as Material,
            get: () => defaultAssets.materials.particles
        },        
        {
            path: "Assets/DefaultAssets/Materials/UI.Material",
            set: asset => defaultAssets.materials.ui = asset as Material,
            get: () => defaultAssets.materials.ui
        },
        {
            path: "Assets/DefaultAssets/Materials/Sky.Material",
            set: asset => defaultAssets.materials.sky = asset as Material,
            get: () => defaultAssets.materials.sky
        },
        {
            path: "Assets/DefaultAssets/Materials/CubeMap.Material",
            set: asset => defaultAssets.materials.cubeMap = asset as Material,
            get: () => defaultAssets.materials.cubeMap
        },
        // shaders
        {
            path: "Assets/DefaultAssets/Shaders/RenderDepth.Shader",
            set: asset => defaultAssets.shaders.renderDepth = asset as Shader,
            get: () => defaultAssets.shaders.renderDepth
        },
        {
            path: "Assets/DefaultAssets/Shaders/SkinnedRenderDepth.Shader",
            set: asset => defaultAssets.shaders.skinnedRenderDepth = asset as Shader,
            get: () => defaultAssets.shaders.skinnedRenderDepth
        },
        
        {
            path: "Assets/DefaultAssets/Shaders/FullScreen.Shader",
            set: asset => defaultAssets.shaders.fullScreen = asset as Shader,
            get: () => defaultAssets.shaders.fullScreen
        },
        {
            path: "Assets/DefaultAssets/Shaders/PostFX/BloomStep1.Shader",
            set: asset => defaultAssets.shaders.bloom = asset as Shader,
            get: () => defaultAssets.shaders.bloom
        },
        {
            path: "Assets/DefaultAssets/Shaders/PostFX/Blur.Shader",
            set: asset => defaultAssets.shaders.blur = asset as Shader,
            get: () => defaultAssets.shaders.blur
        },
        {
            path: "Assets/DefaultAssets/Shaders/PostFX/Compose.Shader",
            set: asset => defaultAssets.shaders.compose = asset as Shader,
            get: () => defaultAssets.shaders.compose
        },
        {
            path: "Assets/DefaultAssets/Shaders/Phong.PhongShader",
            set: asset => defaultAssets.shaders.phong = asset as Shader,
            get: () => defaultAssets.shaders.phong
        },
        {
            path: "Assets/DefaultAssets/Shaders/Diffuse.Shader",
            set: asset => defaultAssets.shaders.diffuse = asset as Shader,
            get: () => defaultAssets.shaders.diffuse
        },
        {
            path: "Assets/DefaultAssets/Shaders/DynamicCubemap.Shader",
            set: asset => defaultAssets.shaders.dynamicCubemap = asset as Shader,
            get: () => defaultAssets.shaders.dynamicCubemap            
        },
        {
            path: "Assets/DefaultAssets/Shaders/SkinnedDynamicCubemap.Shader",
            set: asset => defaultAssets.shaders.skinnedDynamicCubemap = asset as Shader,
            get: () => defaultAssets.shaders.skinnedDynamicCubemap
        },
        // primitives
        {
            path: "Assets/DefaultAssets/Geometry/Meshes/Cube.StaticMeshAsset",
            set: asset => defaultAssets.primitives.box = asset as StaticMeshAsset,
            get: () => defaultAssets.primitives.box
        },
        {
            path: "Assets/DefaultAssets/Geometry/Meshes/Sphere.StaticMeshAsset",
            set: asset => defaultAssets.primitives.sphere = asset as StaticMeshAsset,
            get: () => defaultAssets.primitives.sphere
        },
        {
            path: "Assets/DefaultAssets/Geometry/Meshes/Plane.StaticMeshAsset",
            set: asset => defaultAssets.primitives.plane = asset as StaticMeshAsset,
            get: () => defaultAssets.primitives.plane
        },
        {
            path: "Assets/DefaultAssets/Geometry/Meshes/Cone.StaticMeshAsset",
            set: asset => defaultAssets.primitives.cone = asset as StaticMeshAsset,
            get: () => defaultAssets.primitives.cone
        },
        // misc
        {
            path: "Assets/DefaultAssets/Textures/WhiteSquare.Texture2D",
            set: asset => defaultAssets.whiteTexture = asset as Texture2D,
            get: () => defaultAssets.whiteTexture
        },       
        {
            path: "Assets/DefaultAssets/Transition/Transition.Scene",
            set: asset => defaultAssets.transitionScene = asset as Scene,
            get: () => defaultAssets.transitionScene
        },
        {
            path: "Assets/DefaultAssets/Prefabs/CubemapCaptureRig.Prefab",
            set: asset => defaultAssets.cubemapCaptureRig = asset as Prefab,
            get: () => defaultAssets.cubemapCaptureRig
        }       
    ];

    export let isLoaded = false;
}

/**
 * @hidden
 */
export namespace DefaultAssetsInternal {

    export function load() {
        return Promise.all(
            Private.definitions.map(a => {
                return IObjectManagerInternal.instance.loadObject(a.path)
                    .then(([asset]) => a.set(asset as Asset));
            })
        )
        .then(() => EngineHud.load());
    }

    export function isLoaded() {
        if (Private.isLoaded) {
            return true;
        }

        for (const a of Private.definitions) {
            if (!a.get().isLoaded()) {
                return false;
            }
        }

        if (!EngineHud.isLoaded()) {
            return false;
        }

        Private.isLoaded = true;
        return true;
    }
}
