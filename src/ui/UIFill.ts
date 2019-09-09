
import * as Attributes from "../core/Attributes";
import { Material } from "../graphics/Material";
import { Sprite, SpriteRenderMode } from "./Sprite";
import { Color } from "../graphics/Color";
import { Texture } from "../graphics/Texture";
import { AssetReference } from "../serialization/AssetReference";
import { EngineUtils } from "../core/EngineUtils";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Vector2 } from "../math/Vector2";
import { SpriteSheet } from "./SpriteSheet";
import { Layout } from "./Layout";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { WebGL } from "../graphics/WebGL";
import { UISettings } from "./UISettings";
import { ComponentReference } from "../serialization/ComponentReference";
import { Mask } from "./Mask";

export class UIFill extends SerializableObject {
    isLoaded() {
        return true;
    }
}

@Attributes.displayName("Material")
export class MaterialFill extends UIFill {
    
    get version() { return 2; }

    get material() { return this._material.asset; }
    set material(material: Material | null) { this._material.asset = material; }

    private _material = new AssetReference(Material);

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this._material);
    }

    destroy() {
        this._material.detach();
        super.destroy();
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { _material: json.properties.material });
            delete json.properties.material;
        }
        return json;
    }
}

@Attributes.displayName("Sprite")
export class SpriteFill extends UIFill {

    get version() { return 2; }
    get color() { return this._color; }    

    sprite = new AssetReference(Sprite);

    private _color = new Color(1, 1, 1, 1);

    @Attributes.unserializable()
    private _vertexBuffer!: VertexBuffer;
    @Attributes.unserializable()
    private _isDirty = true;
    @Attributes.unserializable()
    private _width = 0;
    @Attributes.unserializable()
    private _height = 0;
    @Attributes.unserializable()
    private _offsetX = 0;
    @Attributes.unserializable()
    private _offsetY = 0;
    @Attributes.unserializable()
    private _renderMode = SpriteRenderMode.Stretch;
    @Attributes.unserializable()
    private _borderMode = SpriteRenderMode.Stretch;
    @Attributes.unserializable()
    private _textureId: string | undefined;

    constructor(sprite?: Sprite) {
        super();
        if (sprite) {
            this.sprite.asset = sprite;
        }
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this.sprite);
    }

    destroy() {
        if (this._vertexBuffer) {
            this._vertexBuffer.unload(WebGL.context);
        }
        this.sprite.detach();
        super.destroy();
    }

    tesselate(layout: Layout) {
        if (!this._vertexBuffer) {
            this._vertexBuffer = new VertexBuffer();
            this._vertexBuffer.isDynamic = true;
            this._vertexBuffer.primitiveType = "TRIANGLES";
            this._vertexBuffer.setAttribute("position", []);
            this._vertexBuffer.setAttribute("uv", []);
        }

        if (layout.actualWidth !== this._width) {
            this._width = layout.actualWidth;
            this._isDirty = true;
        }

        if (layout.actualHeight !== this._height) {
            this._height = layout.actualHeight;
            this._isDirty = true;
        }

        const xOffset = -layout.pivot.x * layout.actualWidth;
        const yOffset = -layout.pivot.y * layout.actualHeight;        

        if (xOffset !== this._offsetX) {
            this._offsetX = xOffset;
            this._isDirty = true;
        }

        if (yOffset !== this._offsetY) {
            this._offsetY = yOffset;
            this._isDirty = true;
        }

        let sprite = this.sprite.asset;
        let texture = sprite ? sprite.texture.asset : null;
        if (sprite && texture) {
            if (sprite.renderMode !== this._renderMode) {
                this._renderMode = sprite.renderMode;
                this._isDirty = true;
            }
            if (sprite.borderMode !== this._borderMode) {
                this._borderMode = sprite.borderMode;
                this._isDirty = true;
            }
            if (sprite.texture.id !== this._textureId) {
                this._textureId = sprite.texture.id;
                this._isDirty = true;
            }
            if (this._isDirty) {
                sprite.tesselateInPixelsUnits(this._vertexBuffer, xOffset, yOffset, layout.actualWidth, layout.actualHeight);
                this._isDirty = false;
            }
        }

        return this._vertexBuffer;
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { _color: json.properties.tint });
            delete json.properties.tint;
        }
        return json;
    }
}

@Attributes.displayName("Texture")
export class TextureFill extends UIFill {

    static maskPropertyKey = "_mask";

    get version() { return 3; }
    get texture() { return this._texture.asset; }
    set texture(texture: Texture | null) { this._texture.asset = texture; }
    get textureRef() { return this._texture; }
    get color() { return this._color; }
    set color(color: Color) { this._color.copy(color); }
    get mask() { return this._mask.component; }    
    set mask(mask: Mask | null) { this._mask.component = mask; }

    private _color = new Color(1, 1, 1, 1);
    private _texture = new AssetReference(Texture);
    private _mask = new ComponentReference(Mask);

    constructor(texture?: Texture, color?: Color) {
        super();
        if (texture) {
            this.texture = texture;
        }
        if (color) {
            this._color.copy(color);
        }
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this._texture);
    }

    destroy() {
        this._texture.detach();
        super.destroy();
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { _texture: json.properties.texture });
            delete json.properties.texture;
        } else if (previousVersion === 2) {
            Object.assign(json.properties, { _color: json.properties.tint });
            delete json.properties.tint;
        }
        return json;
    }
}

@Attributes.displayName("Color")
export class ColorFill extends UIFill {
    color = new Color(1, 1, 1, 1);

    constructor(color?: Color) {
        super();
        if (color) {
            this.color.copy(color);
        }
    }
}

@Attributes.displayName("SpriteSheet")
export class SpriteSheetFill extends UIFill {   
    get version() { return 2; }

    get texture(): Texture | null { return this._spriteSheet.asset ? this._spriteSheet.asset.texture : null; }
    get tileSize() { return this._spriteSheet.asset ? this._spriteSheet.asset.tileSize : Vector2.zero; }
    get currentTile() { return this._currentTile; }

    set spriteSheet(sheet: SpriteSheet | null) { this._spriteSheet.asset = sheet; }
    get spriteSheet() { return this._spriteSheet.asset; }
    set currentTile(tile: number) { this._currentTile = tile; }    
    get color() { return this._color; }

    private _color = new Color(1, 1, 1, 1);
    private _spriteSheet = new AssetReference(SpriteSheet);
    private _currentTile = 0;

    @Attributes.unserializable()
    private _vertexBuffer!: VertexBuffer;
    @Attributes.unserializable()
    private _isDirty = true;
    @Attributes.unserializable()
    private _offsetX = 0;
    @Attributes.unserializable()
    private _offsetY = 0;
    @Attributes.unserializable()
    private _currentTesselatedTile = 0;

    constructor(spriteSheet?: SpriteSheet) {
        super();
        if (spriteSheet) {
            this._spriteSheet.asset = spriteSheet;
        }
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this._spriteSheet);
    }

    destroy() {
        if (this._vertexBuffer) {
            this._vertexBuffer.unload(WebGL.context);
        }
        this._spriteSheet.detach();
        super.destroy();
    }

    tesselate(layout: Layout) {
        if (!this._vertexBuffer) {
            this._vertexBuffer = new VertexBuffer();
            this._vertexBuffer.isDynamic = true;            
            this._vertexBuffer.setAttribute("position", [
                0, 0, 0.0, // Top left
                1, 0, 0.0, // Top right
                0, 1, 0.0, // Bottom left
                0, 1, 0.0, // Bottom left
                1, 0, 0.0, // Top right
                1, 1, 0.0, // Bottom right
            ]);
            this._vertexBuffer.setAttribute("uv", [
                0, 1, // Top left
                1, 1, // Top right
                0, 0, // Bottom left
                0, 0, // Bottom left
                1, 1, // Top right
                1, 0 // Bottom right
            ]);
            this._vertexBuffer.primitiveType = "TRIANGLES";
        }

        let texture = this.texture;
        if (texture) {
            let xOffset = -layout.pivot.x * layout.actualWidth;
            let yOffset = -layout.pivot.y * layout.actualHeight;
            if (UISettings.integerPixels) {
                xOffset = Math.floor(xOffset);
                yOffset = Math.floor(yOffset);
            }

            if (xOffset !== this._offsetX) {
                this._offsetX = xOffset;
                this._isDirty = true;
            }

            if (yOffset !== this._offsetY) {
                this._offsetY = yOffset;
                this._isDirty = true;
            }

            if (this._currentTesselatedTile !== this._currentTile) {
                this._currentTesselatedTile = this._currentTile;
                this._isDirty = true;
            }

            if (this._isDirty) {
                const pos = this._vertexBuffer.attributes.position as number[];
                pos[0] = 0 + xOffset; pos[1] = 0 + yOffset; pos[2] = 0; // Top left
                pos[3] = layout.actualWidth + xOffset; pos[4] = 0 + yOffset; pos[5] = 0; // Top right
                pos[6] = 0 + xOffset; pos[7] = layout.actualHeight + yOffset; pos[8] = 0; // Bottom left
                pos[9] = 0 + xOffset; pos[10] = layout.actualHeight + yOffset; pos[11] = 0; // Bottom left
                pos[12] = layout.actualWidth + xOffset; pos[13] = 0 + yOffset; pos[14] = 0; // Top right
                pos[15] = layout.actualWidth + xOffset; pos[16] = layout.actualHeight + yOffset; pos[17] = 0; // Bottom right                

                const rowSize = texture.getWidth() / Math.max(this.tileSize.x, 1);
                const numRows = texture.getHeight() / Math.max(this.tileSize.y, 1);
                const row = Math.floor(this.currentTile / rowSize);
                const col = Math.round(this.currentTile) % rowSize;
                const uv = this._vertexBuffer.attributes.uv as number[];
                const tileSizeX = 1 / rowSize;
                const tileSizeY = 1 / numRows;
                // Add a half pixel offset except for the first cells, this fixes seams between cells.
                const halfPixelX = ((1 / texture.getWidth()) / 2) * (col > 0 ? 1 : 0);
                const halfPixelY = ((1 / texture.getHeight()) / 2) * (row > 0 ? 1 : 0);
                // Top left
                uv[0] = tileSizeX * col + halfPixelX;
                uv[1] = 1 - (tileSizeY * row + halfPixelY);
                // Top right
                uv[2] = tileSizeX * col + tileSizeX - halfPixelX;
                uv[3] = 1 - (tileSizeY * row + halfPixelY);
                // Bottom left
                uv[4] = tileSizeX * col + halfPixelX;
                uv[5] = 1 - (tileSizeY * row + tileSizeY - halfPixelY);
                // Bottom left
                uv[6] = tileSizeX * col + halfPixelX;
                uv[7] = 1 - (tileSizeY * row + tileSizeY - halfPixelY);
                // Top right
                uv[8] = tileSizeX * col + tileSizeX - halfPixelX;
                uv[9] = 1 - (tileSizeY * row + halfPixelY);
                // Bottom right
                uv[10] = tileSizeX * col + tileSizeX - halfPixelX;
                uv[11] = 1 - (tileSizeY * row + tileSizeY - halfPixelY);
                this._vertexBuffer.dirtifyAttribute("position");
                this._vertexBuffer.dirtifyAttribute("uv");
                this._isDirty = false;
            }
        }

        return this._vertexBuffer;
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { _color: json.properties.tint });
            delete json.properties.tint;
        }
        return json;
    }
}

@Attributes.displayName("SpriteSheet Material")
export class SpriteSheetMaterialFill extends SpriteSheetFill {

    get material() { return this._material.asset; }
    set material(material: Material | null) {
        this._material.asset = material;
    }

    private _material = new AssetReference(Material);

    isLoaded() {
        if (!super.isLoaded()) {
            return false;
        }
        return EngineUtils.isAssetRefLoaded(this._material);
    }

    destroy() {
        this._material.detach();
        super.destroy();
    }
}
