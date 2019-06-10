import { Texture } from "../../graphics/Texture";
import * as Attributes from "../../core/Attributes";
import { FontShadow, DefaultFontShadow } from "./FontShadow";
import { WebGL } from "../../graphics/WebGL";
import { TextAlignment } from "../Alignment";

namespace Private {    
    export function wordWrap(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
        let finalLines: string[] = [];
        var words = text.split(" ");
        var line = "";
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + " ";
            let metrics = context.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
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

@Attributes.displayName("Font Texture")
export class FontTexture extends Texture {

    set scaleFactor(scale: number) {
        if (scale !== this._scaleFactor) {
            this._isDirty = true;
            this._scaleFactor = scale;
        }
    }

    set maxWidth(maxWidth: number) {
        if (maxWidth !== this._maxWidth) {
            this._isDirty = true;
            this._maxWidth = maxWidth;
        }
    }

    set family(family: string) {
        if (family !== this._fontFamily) {
            this._isDirty = true;
            this._fontFamily = family;
        }
    }

    set text(text: string) {
        if (text !== this._text) {
            this._text = text;
            if (this.tryUpdateTextureInEditor()) {
                return;
            }
            this._isDirty = true;
        }
    }

    set size(size: number) {
        if (size !== this._fontSize) {
            this._fontSize = size;
            if (this.tryUpdateTextureInEditor()) {
                return;
            }
            this._isDirty = true;
        }
    }

    set bold(bold: boolean) {
        if (bold !== this._bold) {
            this._bold = bold;
            if (this.tryUpdateTextureInEditor()) {
                return;
            }
            this._isDirty = true;
        }
    }

    set italic(italic: boolean) {
        if (italic !== this._italic) {
            this._italic = italic;
            if (this.tryUpdateTextureInEditor()) {
                return;
            }
            this._isDirty = true;
        }
    }

    set alignment(alignment: number) {
        if (this._alignment !== alignment) {
            this._alignment = alignment;
            if (this.tryUpdateTextureInEditor()) {
                return;
            }
            this._isDirty = true;
        }
    }

    set shadow(shadow: FontShadow | undefined) {
        if (this._shadow !== shadow) {
            this._shadow = shadow;
            if (this.tryUpdateTextureInEditor()) {
                return;
            }
            this._isDirty = true;
        }
    }

    private _canvas!: HTMLCanvasElement;
    private _isDirty = true;
    private _text!: string;
    private _fontSize!: number;
    private _bold!: boolean;
    private _italic!: boolean;
    private _shadow?: FontShadow;
    private _fontFamily!: string;
    private _maxWidth = 0;
    private _alignment!: number;
    // This is to compensate for the screen trying to adapt to the reference resolution
    private _scaleFactor = 1;   

    dirtify() {
        this._isDirty = true;
    }

    getWidth() {
        return this._canvas ? (this._canvas.width / this._scaleFactor) : 0;
    }
    getHeight() {
        return this._canvas ? (this._canvas.height / this._scaleFactor) : 0;
    }

    /**
     * @hidden
     */
    begin(stage: number): boolean {
        let gl = WebGL.context;
        let textureValid = true;
        if (!this._textureId) {
            if (!this._canvas) {
                this._canvas = document.createElement("canvas");
            }
            let context = this._canvas.getContext("2d");
            if (context) {
                this._textureId = gl.createTexture();
                textureValid = this.updateTexture(context);
            }
        } else if (this._isDirty) {
            let context = this._canvas.getContext("2d");
            if (context) {
                textureValid = this.updateTexture(context);
            }
        }

        if (textureValid) {
            gl.activeTexture(gl.TEXTURE0 + stage);
            gl.bindTexture(gl.TEXTURE_2D, this._textureId);
            return true;
        }
        return false;
    }

    /**
     * @hidden
     */
    destroy() {
        delete this._canvas;
        super.destroy();
    }

    private tryUpdateTextureInEditor() {
        // I forgot why this is necessary but I suspect it's to have the property grid refresh immediately
        if (process.env.CONFIG === "editor") {
            if (!this._isDirty) {
                this.updateTexture(this._canvas.getContext("2d") as CanvasRenderingContext2D);
                return true;
            }
        }
        return false;
    }

    private updateTexture(context: CanvasRenderingContext2D) {
        let gl = WebGL.context;
        let font = `${this._italic ? "italic " : ""}`;
        font += `${this._bold ? "bold " : ""}`;

        let fontSize = this._fontSize * this._scaleFactor;

        font += `${fontSize}px ${this._fontFamily}`;
        context.font = font;

        let globalLines = this._text.split("\\n");
        if (globalLines.length === 0) {
            return false;
        }
        let isMultiline = this._maxWidth > 0;
        if (isMultiline) {
            let canvasWidth = this._maxWidth * this._scaleFactor;
            let lines: string[] = [];
            for (let globalLine of globalLines) {
                lines = lines.concat(Private.wordWrap(context, globalLine, canvasWidth));
            }
            if (lines.length === 0) {
                return false;
            }
            let lineHeight = this.getTextHeight(font, lines[0]);
            this._canvas.width = canvasWidth;
            this._canvas.height = lineHeight * lines.length;
            this.drawText(context, font, lines, lineHeight);
        } else {
            let textWidth = context.measureText(globalLines[0]).width;

            for (let i = 1; i < globalLines.length; ++i) {
                textWidth = Math.max(textWidth, context.measureText(globalLines[i]).width);
            }
            if (textWidth === 0) {
                return false;
            }
            let lineHeight = this.getTextHeight(font, globalLines[0]);
            let canvasWidth = textWidth;
            let canvasHeight = lineHeight * globalLines.length;
            this._canvas.width = canvasWidth; // MathUtils.getNextPow2(textWidth);
            this._canvas.height = canvasHeight; // MathUtils.getNextPow2(this.getTextHeight(font, this._text));
            this.drawText(context, font, globalLines, lineHeight);
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._textureId);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._canvas);

        this._isDirty = false;
        return true;
    }

    private getTextHeight(font: string, text: string) {
        var d = document.createElement("span");
        d.setAttribute("style", `font: ${font};`);
        d.textContent = text;
        document.body.appendChild(d);
        let height = d.offsetHeight;
        document.body.removeChild(d);
        return height;
    }

    private drawText(context: CanvasRenderingContext2D, font: string, lines: string[], lineHeight: number) {
        // Some kind of Canvas bug, need to set font properties again after changing canvas dimensions for text to render properly!        
        context.font = font;
        context.textBaseline = "top";
        context.fillStyle = "white"; // Must be white, actual tint in done in the shader        
        
        if (this._shadow) {
            this._shadow.applyToContext(context);
        } else {
            delete context.shadowColor;
        }

        context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        for (let i = 0; i < lines.length; ++i) {
            let x = 0;
            if (this._alignment === TextAlignment.Center) {
                x = (this._canvas.width - context.measureText(lines[i]).width) / 2;
            } else if (this._alignment === TextAlignment.Right) {
                x = this._canvas.width - context.measureText(lines[i]).width;
            }
            context.fillText(lines[i], x, i * lineHeight);
        }
    }
}
