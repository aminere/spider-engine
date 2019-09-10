import { Material } from "../graphics/Material";
import { Sprite } from "./Sprite";
import { Color } from "../graphics/Color";
import { Texture } from "../graphics/Texture";
import { AssetReference } from "../serialization/AssetReference";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Vector2 } from "../math/Vector2";
import { SpriteSheet } from "./SpriteSheet";
import { Layout } from "./Layout";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Mask } from "./Mask";
export declare class UIFill extends SerializableObject {
    isLoaded(): boolean;
}
export declare class MaterialFill extends UIFill {
    readonly version: number;
    material: Material | null;
    private _material;
    isLoaded(): boolean;
    destroy(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class SpriteFill extends UIFill {
    readonly version: number;
    readonly color: Color;
    sprite: AssetReference<Sprite>;
    private _color;
    private _vertexBuffer;
    private _isDirty;
    private _width;
    private _height;
    private _offsetX;
    private _offsetY;
    private _renderMode;
    private _borderMode;
    private _textureId;
    constructor(sprite?: Sprite);
    isLoaded(): boolean;
    destroy(): void;
    tesselate(layout: Layout): VertexBuffer;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class TextureFill extends UIFill {
    static maskPropertyKey: string;
    readonly version: number;
    texture: Texture | null;
    readonly textureRef: AssetReference<Texture>;
    color: Color;
    mask: Mask | null;
    private _color;
    private _texture;
    private _mask;
    constructor(texture?: Texture, color?: Color);
    isLoaded(): boolean;
    destroy(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class ColorFill extends UIFill {
    color: Color;
    constructor(color?: Color);
}
export declare class SpriteSheetFill extends UIFill {
    readonly version: number;
    readonly texture: Texture | null;
    readonly tileSize: Vector2;
    currentTile: number;
    spriteSheet: SpriteSheet | null;
    readonly color: Color;
    private _color;
    private _spriteSheet;
    private _currentTile;
    private _vertexBuffer;
    private _isDirty;
    private _offsetX;
    private _offsetY;
    private _currentTesselatedTile;
    constructor(spriteSheet?: SpriteSheet);
    isLoaded(): boolean;
    destroy(): void;
    tesselate(layout: Layout): VertexBuffer;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class SpriteSheetMaterialFill extends SpriteSheetFill {
    material: Material | null;
    private _material;
    isLoaded(): boolean;
    destroy(): void;
}
