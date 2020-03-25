
import { Texture } from "./Texture";
import * as Attributes from "../../core/Attributes";
import { WebGL } from "../WebGL";

@Attributes.referencable(false)
export class MemoryTexture extends Texture {

    private _data: Float32Array;
    private _width: number;
    private _height: number;
    private _internalFormat: number;
    private _format: number;
    private _type: number;

    @Attributes.unserializable()
    private _isDirty = true;

    constructor(
        data: Float32Array, 
        width: number, 
        height: number, 
        internalFormat: number, 
        format: number, 
        type: number
    ) {
        super();
        this._data = data;
        this._width = width;
        this._height = height;
        this._internalFormat = internalFormat;
        this._format = format;
        this._type = type;
        this.isPersistent = false;
    }

    getWidth() { return this._width; }
    getHeight() { return this._height; }

    begin(stage: number): boolean {
        let gl = WebGL.context;
        if (!this._textureId) {
            this._textureId = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0 + stage);
            gl.bindTexture(gl.TEXTURE_2D, this._textureId);
            // Important: WebGL doens't seem to support linear filtering for float textures.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            this.updateTexture();
        } else {
            gl.activeTexture(gl.TEXTURE0 + stage);
            gl.bindTexture(gl.TEXTURE_2D, this._textureId);
            if (this._isDirty) {
                this.updateTexture();
                this._isDirty = false;
            }
        }
        return true;
    }

    dirtify() {
        this._isDirty = true;
    }

    private updateTexture() {        
        let gl = WebGL.context;        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(
            gl.TEXTURE_2D, 
            0, 
            this._internalFormat, 
            this._width, 
            this._height, 
            0, 
            this._format,
            this._type, 
            this._data
        );
    }
}
