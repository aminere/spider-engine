import { SerializableObject } from "../../core/SerializableObject";
export declare class CaptureMode extends SerializableObject {
    tick(): void;
    canCapture(): boolean;
}
export declare class CaptureOnce extends CaptureMode {
    captured: boolean;
    tick(): void;
    canCapture(): boolean;
}
export declare class CaptureAllTheTime extends CaptureMode {
    canCapture(): boolean;
}
export declare class CaptureByFrequency extends CaptureMode {
    frequency: number;
    timer: number;
    tick(): void;
    canCapture(): boolean;
}
