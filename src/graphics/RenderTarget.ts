
import { Debug } from "../io/Debug";
import { Texture } from "./Texture";
import { Size, SizeType } from "../core/Size";
import { TextureFiltering } from "./GraphicTypes";
import * as Attributes from "../core/Attributes";
import { VoidAsyncEvent } from "ts-events";
import { Interfaces } from "../core/Interfaces";
import { WebGL } from "./WebGL";

@Attributes.creatable(true)
@Attributes.referencable(true)
@Attributes.displayName("Render Target")
export class RenderTarget extends Texture {

    set width(width: Size) {
        if (!width.equals(this._width)) {
            this._width = width;
            if (this._frameBuffer) {
                this.resize(WebGL.context);
            }
            this.sizeChanged.post();
        }
    }

    set height(height: Size) {
        if (!height.equals(this._height)) {
            this._height = height;
            if (this._frameBuffer) {
                this.resize(WebGL.context);
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
    private _frameBuffer!: WebGLFramebuffer | null;
    @Attributes.unserializable()
    private _depthBuffer!: WebGLRenderbuffer | null;
    @Attributes.unserializable()
    private _loadError = false;
    @Attributes.unserializable()
    private _actualWidth!: number;
    @Attributes.unserializable()
    private _actualHeight!: number;

    getWidth() { return this._actualWidth; }
    getHeight() { return this._actualHeight; }

    constructor(width?: Size, height?: Size, rgba?: boolean, persistent?: boolean, filtering?: number) {
        super();
        this._width = width || new Size();
        this._height = height || new Size();
        this._rgba = rgba !== undefined ? rgba : false;
        this.isPersistent = persistent !== undefined ? persistent : true;
        if (filtering !== undefined) {
            this._filtering = filtering;
        }
    }

    bind(gl: WebGLRenderingContext) {
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

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.viewport(0, 0, this._actualWidth, this._actualHeight);
        gl.depthMask(true);
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
        let gl = WebGL.context;
        gl.activeTexture(gl.TEXTURE0 + stage);
        gl.bindTexture(gl.TEXTURE_2D, this._textureId);
        return true;
    }

    graphicLoad() {
        if (this._frameBuffer) {
            return true;
        }

        let gl = WebGL.context;
        this._frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);

        this._textureId = gl.createTexture();
        this._depthBuffer = gl.createRenderbuffer();
        this.resize(gl);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._textureId, 0);
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
            let gl = WebGL.context;
            gl.deleteFramebuffer(this._frameBuffer);
            gl.deleteRenderbuffer(this._depthBuffer);
            this._frameBuffer = null;
            this._depthBuffer = null;
        }
    }

    private resize(gl: WebGLRenderingContext) {
        this._actualWidth = this._width.value;
        if (this._width.type === SizeType.Relative) {
            this._actualWidth = Interfaces.renderer.screenSize.x * this._actualWidth;
        }

        this._actualHeight = this._height.value;
        if (this._height.type === SizeType.Relative) {
            this._actualHeight = Interfaces.renderer.screenSize.y * this._actualHeight;
        }

        gl.bindTexture(gl.TEXTURE_2D, this._textureId);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

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

        gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._actualWidth, this._actualHeight);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
}
