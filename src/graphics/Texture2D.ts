
import { Debug } from "../io/Debug";
import { Texture } from "./Texture";
import { MathEx } from "../math/MathEx";
import { TextureFiltering } from "./GraphicTypes";
import { Color } from "./Color";
import * as Attributes from "../core/Attributes";
import { SerializedObject } from "../core/SerializableObject";
import { WebGL } from "./WebGL";
import { ObjectProps } from "../core/Types";
import { Vector2 } from "../math/Vector2";

/**
 * @hidden
 */
// tslint:disable-next-line
var CommonEditorEvents: any = undefined;
if (process.env.CONFIG === "editor") {
    CommonEditorEvents = require("../editor/CommonEditorEvents").CommonEditorEvents;
}

export enum TexturePublishFormat {
    JPEG,
    PNG
}
/**
 * @hidden
 */
export class TexturePublishFormatMetadata {
    static literals = {
        JPEG: 0,
        PNG: 1
    };
}

namespace Private {
    export const textureDataPropertyKey = "_textureData";
}

@Attributes.displayName("Texture 2D")
@Attributes.referencable(true)
export class Texture2D extends Texture {
    
    get version() { return 3; }

    get image() { return this._image; }
    get publishFormat() { return this._publishFormat; }
    set publishFormat(format: number) { this._publishFormat = format; }

    set textureData(data: string) {
        if (this._textureId) {
            this.graphicUnload();            
        }
        this._textureDataLoaded = false;
        this._textureData = data;
        delete this._canvas;
        delete this._pixels;
        this.loadTextureData(() => {
            if (CommonEditorEvents) {
                CommonEditorEvents.textureDataLoaded.post(this);
            }
        });
    }

    get textureData() { return this._textureData as string; }

    @Attributes.enumLiterals(TextureFiltering)
    protected _filtering = TextureFiltering.Linear;

    protected _repeat = true;
    private _mipMaps = true;

    @Attributes.enumLiterals(TexturePublishFormat)
    private _publishFormat = TexturePublishFormat.JPEG;

    @Attributes.hidden()
    private _textureData?: string;
    @Attributes.unserializable()
    private _textureDataLoaded = false;
    @Attributes.unserializable()
    private _image!: HTMLImageElement;    
    @Attributes.unserializable()
    private _canvas!: HTMLCanvasElement;
    @Attributes.unserializable()
    private _pixels!: Uint8ClampedArray;

    constructor(props?: ObjectProps<Texture2D>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    getWidth() { return this._textureDataLoaded ? this._image.width : 0; }
    getHeight() { return this._textureDataLoaded ? this._image.height : 0; }

    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === Private.textureDataPropertyKey) {            
            this.textureData = value;            
        } else {
            if (this._textureId) {
                this.setupTexture();
            }
        }
    }   

    isLoaded() {
        return this._textureDataLoaded;
    }

    begin(stage: number) {
        if (!this._textureId) {
            if (!this._textureDataLoaded) {
                return false;
            } else if (!this.graphicLoad()) {
                return false;
            }
        }

        let gl = WebGL.context;
        gl.activeTexture(gl.TEXTURE0 + stage);
        gl.bindTexture(gl.TEXTURE_2D, this._textureId);
        return true;
    }

    loadTextureData(loaded: () => void) {
        if (this._textureDataLoaded) {
            loaded();
            return;
        }        
        this._image = new Image();
        // Debug.log(`Loading ${this.templatePath}`);
        this._image.onload = () => {            
            // Debug.log(`${this.templatePath} Loaded!`);
            this._textureDataLoaded = true;
            loaded();
        };
        this._image.src = this._textureData as string;
    }

    graphicLoad() {
        if (this._textureId) {
            return true;
        }        
        if (!this.setupTexture()) {
            return false;
        }
        return true;
    }

    getPixel(x: number, y: number, colorOut: Color) {
        if (!this._canvas) {
            this._canvas = document.createElement("canvas");
            this._canvas.width = this._image.width;
            this._canvas.height = this._image.height;
            let context = this._canvas.getContext("2d");
            if (context) {
                context.drawImage(this._image, 0, 0);
                this._pixels = context.getImageData(0, 0, this._canvas.width, this._canvas.height).data;
            }
        }
        let index = (y * this._canvas.width * 4) + (x * 4);
        colorOut.r = this._pixels[index + 0];
        colorOut.g = this._pixels[index + 1];
        colorOut.b = this._pixels[index + 2];
        colorOut.a = this._pixels[index + 3];
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 2) {
            Object.assign(json.properties, { _mipMaps: json.properties._generateMipMaps });
            delete json.properties._generateMipMaps;
        }
        return json;
    }

    private setupTexture() {
        console.assert(this.isLoaded());
        if (!this.isLoaded()) {
            Debug.logWarning(`Trying to render with a texture that is not loaded yet '${this.templatePath}'`);
            return false;
        }
        let gl = WebGL.context;
        if (!this._textureId) {
            this._textureId = gl.createTexture();
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._textureId);        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._image);

        if (this._filtering === TextureFiltering.Nearest) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }    

        let mipmapsSupported = WebGL.version > 1;
        if (!mipmapsSupported) {
            mipmapsSupported = MathEx.isPowerOf2(this._image.width) && MathEx.isPowerOf2(this._image.height);
        }
        
        if (mipmapsSupported) {
            const repeat = this._repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat);

            if (this._mipMaps) {
                if (this._filtering === TextureFiltering.Nearest) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                }                
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                if (this._filtering === TextureFiltering.Nearest) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                } 
            }
        } else {

            // WebGL 1 doesn't support repeat mode on non-pow-2 textures, must use clamp to edge.            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            
            if (this._filtering === TextureFiltering.Nearest) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            } 
        }        
        
        return true;
    }
}
