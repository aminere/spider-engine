import { Texture2D } from "../graphics/Texture2D";
import { StaticMeshAsset } from "./StaticMeshAsset";
import { Material } from "../graphics/Material";
import { Scene } from "./Scene";
import { Prefab } from "./Prefab";
import { Shader } from "../graphics/Shader";
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
    }
    namespace primitives {
        let box: StaticMeshAsset;
        let sphere: StaticMeshAsset;
        let plane: StaticMeshAsset;
        let cone: StaticMeshAsset;
    }
    let whiteTexture: Texture2D;
    let transitionScene: Scene;
    let hudPrefab: Prefab;
    let hudProperty: Prefab;
}
/**
 * @hidden
 */
export declare namespace DefaultAssetsInternal {
    function load(): Promise<void>;
    function isLoaded(): boolean;
}
