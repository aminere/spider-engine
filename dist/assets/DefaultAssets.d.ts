import { Texture2D } from "../graphics/texture/Texture2D";
import { StaticMeshAsset } from "./StaticMeshAsset";
import { Material } from "../graphics/Material";
import { Scene } from "./Scene";
import { Prefab } from "./Prefab";
import { Shader } from "../graphics/shading/Shader";
export declare namespace defaultAssets {
    namespace materials {
        let particles: Material;
        let ui: Material;
        let sky: Material;
        let cubeMap: Material;
    }
    namespace shaders {
        let renderDepth: Shader;
        let skinnedRenderDepth: Shader;
        let phong: Shader;
        let fullScreen: Shader;
        let blur: Shader;
        let compose: Shader;
        let bloom: Shader;
        let diffuse: Shader;
        let dynamicCubemap: Shader;
        let skinnedDynamicCubemap: Shader;
    }
    namespace primitives {
        let box: StaticMeshAsset;
        let sphere: StaticMeshAsset;
        let plane: StaticMeshAsset;
        let cone: StaticMeshAsset;
    }
    let whiteTexture: Texture2D;
    let transitionScene: Scene;
    let cubemapCaptureRig: Prefab;
}
/**
 * @hidden
 */
export declare namespace DefaultAssetsInternal {
    function load(): Promise<unknown[]>;
    function isLoaded(): boolean;
}
