import { Asset } from "../assets/Asset";
import { Texture2D } from "../graphics/Texture2D";
import { Vector2 } from "../math/Vector2";
import { SerializedObject } from "../core/SerializableObject";
export declare class SpriteSheet extends Asset {
    readonly version: number;
    texture: Texture2D | null;
    tileSize: Vector2;
    readonly tileCount: number;
    private _texture;
    private _tileSize;
    private _tileCount;
    isLoaded(): boolean;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
