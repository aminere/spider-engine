import { AssetReference } from "../../serialization/AssetReference";
import { Texture2D } from "./Texture2D";
import { Texture } from "./Texture";
import { SerializedObject } from "../../core/SerializableObject";
export declare class StaticCubemap extends Texture {
    get version(): number;
    pz: AssetReference<Texture2D>;
    nz: AssetReference<Texture2D>;
    py: AssetReference<Texture2D>;
    ny: AssetReference<Texture2D>;
    px: AssetReference<Texture2D>;
    nx: AssetReference<Texture2D>;
    private _config;
    setProperty(name: string, value: AssetReference<Texture2D>): void;
    isLoaded(): boolean;
    begin(stage: number): boolean;
    graphicLoad(): boolean;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private makeConfig;
    private initConfigIfNecessary;
}
