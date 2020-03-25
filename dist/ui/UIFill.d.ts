import { Material } from "../graphics/Material";
import { Sprite } from "./Sprite";
import { Color } from "../graphics/Color";
import { Texture } from "../graphics/texture/Texture";
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
    get version(): number;
    get material(): Material | null;
    set material(material: Material | null);
    private _material;
    isLoaded(): boolean;
    destroy(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class SpriteFill extends UIFill {
    get version(): number;
    get color(): Color;
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
    get version(): number;
    get texture(): Texture | null;
    set texture(texture: Texture | null);
    get textureRef(): AssetReference<Texture>;
    get color(): Color;
    set color(color: Color);
    get mask(): Mask | null;
    set mask(mask: Mask | null);
    private _color;
    private _texture;
    private _mask;
    constructor(texture?: Texture, color?: Color);
    isLoaded(): boolean;
    destroy(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class ColorFill extends UIFill {
    get version(): number;
    get color(): Color;
    set color(color: Color);
    private _color;
    constructor(color?: Color);
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class SpriteSheetFill extends UIFill {
    get version(): number;
    get texture(): Texture | null;
    get tileSize(): Vector2;
    get currentTile(): number;
    set spriteSheet(sheet: SpriteSheet | null);
    get spriteSheet(): SpriteSheet | null;
    set currentTile(tile: number);
    get color(): Color;
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
    get material(): Material | null;
    set material(material: Material | null);
    private _material;
    isLoaded(): boolean;
    destroy(): void;
}
