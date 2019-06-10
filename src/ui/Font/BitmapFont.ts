
import * as Attributes from "../../core/Attributes";
import { Font } from "./Font";
import { AssetReference } from "../../serialization/AssetReference";
import { Texture2D } from "../../graphics/Texture2D";
import { VertexBuffer } from "../../graphics/VertexBuffer";
import { Texture } from "../../graphics/Texture";
import { EngineUtils } from "../../core/EngineUtils";
import { SerializedObject } from "../../core/SerializableObject";
import { FontMetrics } from "./FontMetrics";
import { WebGL } from "../../graphics/WebGL";
import { TextAlignment } from "../Alignment";

namespace Internal {
    export function wordWrap(metrics: FontMetrics, text: string, maxWidth: number) {
        let finalLines: string[] = [];
        var words = text.split(" ");
        var line = "";
        for (let n = 0; n < words.length; n++) {
            var testLine = line + words[n] + " ";
            let lineWidth = 0;
            for (let i = 0; i < testLine.length; ++i) {
                let charCode = testLine.charCodeAt(i);
                let charW = metrics.widths[charCode];
                lineWidth += charW;
            }
            if (lineWidth > maxWidth && n > 0) {
                finalLines.push(line);
                line = words[n] + " ";
            } else {
                line = testLine;
            }
        }
        finalLines.push(line);
        return finalLines;
    }
}

export class BitmapFont extends Font {    
    get version() { return 2; }

    texture = new AssetReference(Texture2D);
    metrics = new AssetReference(FontMetrics);
    lineHeight = 16;
    spacing = 0;

    @Attributes.unserializable()
    private _vertexBuffer!: VertexBuffer;
    @Attributes.unserializable()
    private _text!: string;
    @Attributes.unserializable()
    private _isDirty = true;
    @Attributes.unserializable()
    private _maxWidth = 0;
    @Attributes.unserializable()
    private _width = 0;
    @Attributes.unserializable()
    private _height = 0;
    @Attributes.unserializable()
    private _pivotX = 0;
    @Attributes.unserializable()
    private _pivotY = 0;
    @Attributes.unserializable()
    private _alignment!: number;   

    getTexture() {
        return this.texture.asset as Texture;
    }

    getWidth() {
        return this._width;
    }

    getHeight() {
        return this._height;
    }

    setText(text: string) {
        if (text !== this._text) {
            this._text = text;
            this._isDirty = true;
        }
    }

    setAlignment(alignment: number) {
        if (alignment !== this._alignment) {
            this._alignment = alignment;
            this._isDirty = true;
        }
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this.texture)
            && EngineUtils.isAssetRefLoaded(this.metrics);
    }

    /**
     * @hidden
     */
    destroy() {
        this.texture.detach();
        if (this._vertexBuffer) {
            this._vertexBuffer.unload(WebGL.context);
        }
        super.destroy();
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            json.properties.metrics.typeName = "FontMetrics";
        }
        return json;
    }

    /**
     * @hidden
     */
    tesselate(pivotX: number, pivotY: number) {
        if (!this._vertexBuffer) {
            this._vertexBuffer = new VertexBuffer();
            this._vertexBuffer.isDynamic = true;
            this._vertexBuffer.primitiveType = "TRIANGLES";
            this._vertexBuffer.setData("position", []);
            this._vertexBuffer.setData("uv", []);
        }

        let texture = this.getTexture();
        let metrics = this.metrics.asset;
        if (pivotX !== this._pivotX) {
            this._pivotX = pivotX;
            this._isDirty = true;
        }
        if (pivotY !== this._pivotY) {
            this._pivotY = pivotY;
            this._isDirty = true;
        }

        let globalLines = this._text.split("\\n");
        if (this._isDirty && texture && metrics && globalLines.length > 0) {
            let isMultiline = this._maxWidth > 0;
            if (isMultiline) {
                let lines: string[] = [];
                for (var globalLine of globalLines) {
                    lines = lines.concat(Internal.wordWrap(metrics, globalLine, this._maxWidth));
                }                
                this._width = this._maxWidth;
                this._height = this.lineHeight * lines.length;
                this.drawText(lines, this.lineHeight);
            } else {
                this._height = this.lineHeight * globalLines.length;
                this._width = 0;
                this._width = this.drawText(globalLines, this.lineHeight);
            }

            this._vertexBuffer.dirtifyData("position");
            this._vertexBuffer.dirtifyData("uv");
            this._isDirty = false;
        }

        return this._vertexBuffer;
    }

    /**
     * @hidden
     */
    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === "metrics") {
            if (!this._isDirty) {
                this._isDirty = true;
            }
        } else if (name === "lineHeight") {
            if (!this._isDirty) {
                this._isDirty = true;
            }
        } else if (name === "spacing") {
            if (!this._isDirty) {
                this._isDirty = true;
            }
        }
    }

    /**
     * @hidden
     */
    prepareForRendering(screenScaleFactor: number, maxWidth: number) {
        // Scale factor is useless for bitmap fonts
        if (this._maxWidth !== maxWidth) {
            this._maxWidth = maxWidth;
            this._isDirty = true;
        }
    }

    private drawText(lines: string[], lineHeight: number) {        
        let texture = this.getTexture();
        let metrics = this.metrics.asset as FontMetrics;
        const rowSize = texture.getWidth() / Math.max(metrics.cellWidth, 1);
        const numRows = texture.getHeight() / Math.max(metrics.cellHeight, 1);        
        const startCharacter = metrics.startCharacter;
        const characterCount = lines.reduce((prev, cur) => prev + cur.length, 0);
        const vertexCount = characterCount * 6;
        this._vertexBuffer.vertexCount = vertexCount;
        let pos = this._vertexBuffer.data.position;
        let uv = this._vertexBuffer.data.uv;
        pos.length = vertexCount * 3;
        uv.length = vertexCount * 2;
        const tileSizeX = 1 / rowSize;
        const tileSizeY = 1 / numRows;
        let textWidth = 0;
        let lineWidths: number[] = [];
        for (let i = 0; i < lines.length; ++i) {
            let line = lines[i];
            let lineWidth = 0;
            for (let j = 0; j < line.length; ++j) {
                let charCode = line.charCodeAt(j);
                let charW = metrics.widths[charCode];
                lineWidth += charW;
                if (j > 0 && j < this._text.length) {
                    lineWidth += this.spacing;
                }
            }
            lineWidths[i] = lineWidth;
            if (lineWidth > textWidth) {
                textWidth = lineWidth;
            }
        }
        let xOffset = -this._pivotX * (this._width || textWidth);
        let yOffset = -this._pivotY * (lineHeight * lines.length);        
        let currentChar = 0;
        for (let i = 0; i < lines.length; ++i) {
            let line = lines[i];
            let currentX = 0;
            if (this._alignment === TextAlignment.Center) {
                currentX = ((this._width || textWidth) - lineWidths[i]) / 2;
            } else if (this._alignment === TextAlignment.Right) {
                currentX = (this._width || textWidth) - lineWidths[i];
            }
            for (let j = 0; j < line.length; ++j) {
                let charCode = line.charCodeAt(j);
                let charW = metrics.widths[charCode];
                let currentTile = charCode - startCharacter;
                let row = Math.floor(currentTile / rowSize);
                let col = Math.round(currentTile) % rowSize;
    
                let index = currentChar * 18;
                let left = currentX;
                let top = i * lineHeight;
                pos[index + 0] = xOffset + left; pos[index + 1] = yOffset + top; pos[index + 2] = 0; // Top left
                pos[index + 3] = xOffset + left + charW; pos[index + 4] = yOffset + top; pos[index + 5] = 0; // Top right
                pos[index + 6] = xOffset + left; pos[index + 7] = yOffset + top + lineHeight; pos[index + 8] = 0; // Bottom left
                pos[index + 9] = xOffset + left; pos[index + 10] = yOffset + top + lineHeight; pos[index + 11] = 0; // Bottom left
                pos[index + 12] = xOffset + left + charW; pos[index + 13] = yOffset + top; pos[index + 14] = 0; // Top right
                pos[index + 15] = xOffset + left + charW; pos[index + 16] = yOffset + top + lineHeight; pos[index + 17] = 0; // Bottom right
    
                let charUvW = charW / texture.getWidth();
                let charUvH = lineHeight / texture.getHeight();
                index = currentChar * 12;
                uv[index + 0] = tileSizeX * col; uv[index + 1] = 1 - (tileSizeY * row); // Top left               
                uv[index + 2] = tileSizeX * col + charUvW; uv[index + 3] = 1 - (tileSizeY * row); // Top right                
                uv[index + 4] = tileSizeX * col; uv[index + 5] = 1 - (tileSizeY * row + charUvH); // Bottom left
                uv[index + 6] = tileSizeX * col; uv[index + 7] = 1 - (tileSizeY * row + charUvH); // Bottom left
                uv[index + 8] = tileSizeX * col + charUvW; uv[index + 9] = 1 - (tileSizeY * row); // Top right
                uv[index + 10] = tileSizeX * col + charUvW; uv[index + 11] = 1 - (tileSizeY * row + charUvH); // Bottom right
    
                currentX += charW + this.spacing;
                ++currentChar;
            }
        }        
        return textWidth;
    }
}
