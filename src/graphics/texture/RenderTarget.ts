
import { Debug } from "../../io/Debug";
import { Texture } from "./Texture";
import { Size, SizeType } from "../../core/Size";
import { TextureFiltering } from "../GraphicTypes";
import * as Attributes from "../../core/Attributes";
import { VoidAsyncEvent } from "ts-events";
import { Interfaces } from "../../core/Interfaces";
import { WebGL } from "../WebGL";

@Attributes.creatable(true)
@Attributes.referencable(true)
@Attributes.displayName("Render Target")
export class RenderTarget extends Texture {

    set width(width: Size) {
        if (!width.equals(this._width)) {
            this._width = width;
            if (this._frameBuffer) {
                this.resize();
            }
            this.sizeChanged.post();
        }
    }

    set height(height: Size) {
        if (!height.equals(this._height)) {
            this._height = height;
            if (this._frameBuffer) {
                this.resize();
            }
            this.sizeChanged.post();
        }
    }

    get valid() { return Boolean(this._frameBuffer); }

    /**
     * @event
     */
    @Attributes.unserializable()
    sizeChanged = new VoidAsyncEvent();

    private _rgba: boolean;
    private _width: Size;
    private _height: Size;

    @Attributes.enumLiterals(TextureFiltering)
    private _filtering = TextureFiltering.Linear;

    @Attributes.unserializable()
    private _frameBuffer: WebGLFramebuffer | null = null;
    @Attributes.unserializable()
    private _depthBuffer: WebGLRenderbuffer | null = null;
    @Attributes.unserializable()
    private _loadError = false;
    @Attributes.unserializable()
    private _actualWidth = 0;
    @Attributes.unserializable()
    private _actualHeight = 0;
    @Attributes.unserializable()
    private _isCubeMap: boolean;

    getWidth() { return this._actualWidth; }
    getHeight() { return this._actualHeight; }

    constructor(
        width?: Size, 
        height?: Size, 
        rgba?: boolean, 
        persistent?: boolean, 
        filtering?: number,
        cubeMap?: boolean
    ) {
        super();
        this._width = width ?? new Size();
        this._height = height ?? new Size();
        this._rgba = rgba ?? false;
        this.isPersistent = persistent ?? true;
        this._isCubeMap = cubeMap ?? false;
        if (filtering !== undefined) {
            this._filtering = filtering;
        }
    }

    bind(cubeMapFace?: number) {
        // start rendering to this render target
        if (!this._frameBuffer) {
            if (!this._loadError) {
                if (!this.graphicLoad()) {
                    return false;
                }
            } else {
                return false;
            }
        }

        const gl = WebGL.context;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);

        if (cubeMapFace !== undefined) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, cubeMapFace, this._textureId, 0);
        }

        gl.viewport(0, 0, this._actualWidth, this._actualHeight);
        // this is necessary otherwise depth is not cleared
        WebGL.enableDepthWrite(true);
        gl.clearColor(0, 0, 0, 1);
        // tslint:disable-next-line
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        return true;
    }

    begin(stage: number) {
        if (!this._textureId) {
            // Nothing to do, nothing has been redered into this renter target yet
            return false;
        }
        if (Interfaces.renderer.renderTarget === this) {
            // WebGL forbids rendering to a rendertarget using itself
            return false;
        }
        WebGL.context.activeTexture(WebGL.context.TEXTURE0 + stage);

        if (this._isCubeMap) {
            WebGL.context.bindTexture(WebGL.context.TEXTURE_CUBE_MAP, this._textureId);
        } else {
            WebGL.context.bindTexture(WebGL.context.TEXTURE_2D, this._textureId);
        }
        return true;
    }

    graphicLoad() {
        if (this._frameBuffer) {
            return true;
        }

        const gl = WebGL.context;
        this._frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);

        this._textureId = gl.createTexture();
        this._depthBuffer = gl.createRenderbuffer();
        this.resize();

        if (!this._isCubeMap) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._textureId, 0);
        }
        
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthBuffer);  

        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            Debug.logError("Could not create render target");
            this._loadError = true;
            return false;
        }

        return true;
    }

    graphicUnload() {
        super.graphicUnload();
        if (this._frameBuffer) {
            WebGL.context.deleteFramebuffer(this._frameBuffer);
            WebGL.context.deleteRenderbuffer(this._depthBuffer);
            this._frameBuffer = null;
            this._depthBuffer = null;
        }
    }

    private resize() {
        this._actualWidth = this._width.value;
        this._actualHeight = this._height.value;

        const gl = WebGL.context;
        if (this._isCubeMap) {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._textureId);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    
            WebGL.cubeMapFaces.forEach(t => {
                gl.texImage2D(t, 0, gl.RGBA, this._actualWidth, this._actualHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            });

            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
        } else {            
            gl.bindTexture(gl.TEXTURE_2D, this._textureId);
            if (this._width.type === SizeType.Relative) {
                this._actualWidth = Interfaces.renderer.screenSize.x * this._actualWidth;
            }
            
            if (this._height.type === SizeType.Relative) {
                this._actualHeight = Interfaces.renderer.screenSize.y * this._actualHeight;
            }    
    
            if (this._rgba) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._actualWidth, this._actualHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this._actualWidth, this._actualHeight, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
            }
    
            if (this._filtering === TextureFiltering.Nearest) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }       

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }        

        gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._actualWidth, this._actualHeight);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
}
