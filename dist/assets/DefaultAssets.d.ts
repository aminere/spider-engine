import { Texture2D } from "../graphics/Texture2D";
import { StaticMeshAsset } from "./StaticMeshAsset";
import { Material } from "../graphics/Material";
import { Scene } from "./Scene";
import { Shader } from "../graphics/Shader";
export declare class DefaultAssets {
    static readonly whiteTexture: Texture2D;
    static readonly boxMesh: StaticMeshAsset;
    static readonly sphereMesh: StaticMeshAsset;
    static readonly planeMesh: StaticMeshAsset;
    static readonly coneMesh: StaticMeshAsset;
    static readonly uiMaterial: Material;
    static readonly blurShader: Shader;
    static readonly fullScreenShader: Shader;
    static readonly particlesMaterial: Material;
    static readonly phongShader: Shader;
    static readonly composeShader: Shader;
    static readonly renderDepthShader: Shader;
    static readonly skinnedRenderDepthShader: Shader;
    static readonly cubeMapMaterial: Material;
    static readonly skyMaterial: Material;
    static readonly transitionScene: Scene;
    static load(): Promise<void>;
    static readonly loaded: boolean;
}
