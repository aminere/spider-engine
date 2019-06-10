import { AssetReference } from "../serialization/AssetReference";
import { GraphicAsset } from "./GraphicAsset";
import { Texture2D } from "./Texture2D";
export declare class StaticCubemap extends GraphicAsset {
    front: AssetReference<Texture2D>;
    back: AssetReference<Texture2D>;
    top: AssetReference<Texture2D>;
    bottom: AssetReference<Texture2D>;
    left: AssetReference<Texture2D>;
    right: AssetReference<Texture2D>;
    private _textureId;
    private _config;
    setProperty(name: string, value: AssetReference<Texture2D>): void;
    isLoaded(): boolean;
    begin(stage: number): boolean;
    graphicLoad(): boolean;
    graphicUnload(): void;
    private makeConfig;
    private initConfigIfNecessary;
}
