import { Asset } from "../assets/Asset";
import { Texture2D } from "../graphics/Texture2D";
import { Vector2 } from "../math/Vector2";
import { SerializedObject } from "../core/SerializableObject";
export declare class SpriteSheet extends Asset {
    get version(): number;
    get texture(): Texture2D | null;
    set texture(texture: Texture2D | null);
    get tileSize(): Vector2;
    set tileSize(tileSize: Vector2);
    get tileCount(): number;
    private _texture;
    private _tileSize;
    private _tileCount;
    isLoaded(): boolean;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
