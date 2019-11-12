
import { Texture } from "./Texture";
import { Color } from "./Color";
import { Debug } from "../io/Debug";
import * as Attributes from "../core/Attributes";
import { NativeU8Array } from "../serialization/NativeU8Array";
import { TextureFiltering } from "./GraphicTypes";
import { WebGL } from "./WebGL";

@Attributes.creatable(true)
@Attributes.referencable(true)
@Attributes.displayName("Drawable Texture")
export class DrawableTexture extends Texture {

    set rgba(rgba: boolean) {
        this._rgba = rgba;
        this._structureDirty = true;
    }

    get rgba() { return this._rgba; }

    set width(width: number) {
        if (width !== this._width) {
            this._width = width;
            this._structureDirty = true;
        }
    }

    set height(height: number) {
        if (height !== this._height) {
            this._height = height;
            this._structureDirty = true;
        }
    }

    set data(data: Uint8Array) {
        this._data.array = data;
        this._pixelsDirty = true;
    }

    get data() { 
        return this._data.array;
    }

    private _width = 1024;
    private _height = 768;
    private _rgba = false;
    @Attributes.enumLiterals(TextureFiltering)
    private _filtering = TextureFiltering.Linear;
    @Attributes.hidden()
    private _data = new NativeU8Array();

    @Attributes.unserializable()
    private _structureDirty = true;
    @Attributes.unserializable()
    private _pixelsDirty = true;
    @Attributes.unserializable()
    private _bytesPerPixel!: number;

    getWidth() { return this._width; }
    getHeight() { return this._height; }

    begin(stage: number): boolean {
        let gl = WebGL.context;
        if (!this._textureId) {
            this._textureId = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0 + stage);
            gl.bindTexture(gl.TEXTURE_2D, this._textureId);
            if (this._filtering === TextureFiltering.Nearest) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            this.updateStructure();
            this.uploadTexturePixels();
        } else {
            gl.activeTexture(gl.TEXTURE0 + stage);
            gl.bindTexture(gl.TEXTURE_2D, this._textureId);
            if (this._structureDirty) {
                this.updateStructure();
            }
            if (this._pixelsDirty) {
                this.uploadTexturePixels();
            }
        }
        return true;
    }

    setPixel(x: number, y: number, color: Color) {
        if (x < 0 || x > this._width) {
            Debug.logWarning(`DrawableTexture.putPixel: pixel is out of bounds (x = ${x}, width = ${this._width})`);
            return;
        }
        if (y < 0 || y > this._height) {
            Debug.logWarning(`DrawableTexture.putPixel: pixel is out of bounds (y = ${x}, height = ${this._height})`);
            return;
        }
        if (this._structureDirty) {
            this.updateStructure();
        }

        let index = (this._width * this._bytesPerPixel * y) + (x * this._bytesPerPixel);
        this._data.array[index + 0] = color.r * 255;
        this._data.array[index + 1] = color.g * 255;
        this._data.array[index + 2] = color.b * 255;
        if (this.rgba) {
            this._data.array[index + 3] = color.a * 255;
        }
        this._pixelsDirty = true;
    }

    private updateStructure() {
        this._bytesPerPixel = this._rgba ? 4 : 3;
        this._data.length = this._width * this._height * this._bytesPerPixel;
        this._structureDirty = false;
    }

    private uploadTexturePixels() {
        let gl = WebGL.context;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        let format = this._rgba ? gl.RGBA : gl.RGB;
        gl.texImage2D(gl.TEXTURE_2D, 0, format, this._width, this._height, 0, format, gl.UNSIGNED_BYTE, this._data.array);
        this._pixelsDirty = false;
    }
}
