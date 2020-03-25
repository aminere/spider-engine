import { SerializableObject } from "../../core/SerializableObject";
import { Vector3 } from "../../math/Vector3";
import { RenderTarget } from "../texture/RenderTarget";
import { VertexBuffer } from "../VertexBuffer";
export declare class Bloom extends SerializableObject {
    intensity: number;
    render(inputRT: RenderTarget, fullScreenQuad: VertexBuffer): RenderTarget | null;
}
export declare class FastBloom extends Bloom {
    set downSample(downSample: number);
    threshold: number;
    private _downSample;
    private _buffer1;
    private _buffer2;
    render(inputRT: RenderTarget, fullScreenQuad: VertexBuffer): RenderTarget | null;
    destroy(): void;
}
export declare class Desaturate extends SerializableObject {
}
export declare class FastDesaturate extends Desaturate {
    rgbWeights: Vector3;
}
export declare class PostEffects extends SerializableObject {
    get bloom(): Bloom | undefined;
    private _bloom;
    destroy(): void;
}
