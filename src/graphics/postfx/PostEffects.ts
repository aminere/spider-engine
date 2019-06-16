import { SerializableObject } from "../../core/SerializableObject";
import { Size, SizeType } from "../../core/Size";
import * as Attributes from "../../core/Attributes";
import { Reference } from "../../serialization/Reference";
import { Vector3 } from "../../math/Vector3";
import { Vector2 } from "../../math/Vector2";
import { defaultAssets } from "../../assets/DefaultAssets";
import { Interfaces } from "../../core/Interfaces";
import { RenderTarget } from "../RenderTarget";
import { VertexBuffer } from "../VertexBuffer";
import { GraphicUtils } from "../GraphicUtils";

export class Bloom extends SerializableObject {
    intensity = .2;

    render(gl: WebGLRenderingContext, inputRT: RenderTarget, fullScreenQuad: VertexBuffer): RenderTarget | null {
        return null;
    }
}

export class FastBloom extends Bloom {
    set downSample(downSample: number) {
        let newValue = Math.max(downSample, 1);
        if (this._buffer1 && newValue !== this._downSample) {
            let referenceWidth = this._buffer1.getWidth() * this._downSample;
            let referenceHeight = this._buffer1.getHeight() * this._downSample;
            let newWidth = referenceWidth / newValue;
            let newHeight = referenceHeight / newValue;
            let width = new Size(SizeType.Absolute, newWidth);
            let height = new Size(SizeType.Absolute, newHeight);
            this._buffer1.width = width;
            this._buffer1.height = height;
            this._buffer2.width = width;
            this._buffer2.height = height;
        }
        this._downSample = newValue;
    }

    threshold = .9;    
    
    private _downSample = 8;

    @Attributes.unserializable()
    private _buffer1!: RenderTarget;
    @Attributes.unserializable()
    private _buffer2!: RenderTarget;

    render(gl: WebGLRenderingContext, inputRT: RenderTarget, fullScreenQuad: VertexBuffer) {
        if (!this._buffer1) {
            let actualWidth = inputRT.getWidth() / this._downSample;
            let actualHeight = inputRT.getHeight() / this._downSample;
            let width = new Size(SizeType.Absolute, actualWidth);
            let height = new Size(SizeType.Absolute, actualHeight);
            this._buffer1 = new RenderTarget(width, height, false, false);
            this._buffer2 = new RenderTarget(width, height, false, false);
        }

        // downsample and extract bright intensities
        let renderer = Interfaces.renderer;
        const { fullScreen } = defaultAssets.shaders;
        if (!fullScreen.begin()) {
            return null;
        }
        renderer.renderTarget = this._buffer1;
        fullScreen.applyReferenceParameter("texture", inputRT);
        fullScreen.applyParameter("threshold", this.threshold);
        GraphicUtils.drawVertexBuffer(gl, fullScreenQuad, fullScreen);
       
        const { blur } = defaultAssets.shaders;
        if (!blur.begin()) {
            return null;
        }

        // horizontal pass
        let pixelSize = Vector2.fromPool().set(1 / this._buffer1.getWidth(), 1 / this._buffer1.getHeight());
        renderer.renderTarget = this._buffer2;
        blur.applyParameter("horizontal", true);
        blur.applyReferenceParameter("texture", this._buffer1);
        blur.applyParameter("pixelSize", pixelSize);                            
        GraphicUtils.drawVertexBuffer(gl, fullScreenQuad, blur);

        // vertical pass
        renderer.renderTarget = this._buffer1;
        blur.applyParameter("horizontal", false);
        blur.applyReferenceParameter("texture", this._buffer2);
        GraphicUtils.drawVertexBuffer(gl, fullScreenQuad, blur);
        return this._buffer1;
    }

    destroy() {
        if (this._buffer1) {
            this._buffer1.destroy();
        }
        if (this._buffer2) {
            this._buffer2.destroy();
        }
    }

}

export class Desaturate extends SerializableObject {
}

export class FastDesaturate extends Desaturate {
    rgbWeights = new Vector3(.3, .59, .11);
}

export class PostEffects extends SerializableObject {
    get bloom() { return this._bloom.instance; }
    // get desaturate() { return this._desaturate.instance; }

    private _bloom = new Reference(Bloom);
    // private _desaturate = new Reference(DesaturateBase);

    destroy() {
        let bloom = this.bloom;
        if (bloom) {
            bloom.destroy();
        }
    }
} 
