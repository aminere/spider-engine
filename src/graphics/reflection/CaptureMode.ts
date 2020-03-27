
import * as Attributes from "../../core/Attributes";
import { SerializableObject } from "../../core/SerializableObject";
import { Time } from "../../core/Time";

export class CaptureMode extends SerializableObject {
    public tick() {}
    public canCapture() { return false; }
}

@Attributes.displayName("Once")
export class CaptureOnce extends CaptureMode {
    @Attributes.unserializable()
    captured = false;

    public tick() { this.captured = true; }
    public canCapture() { return !this.captured; }
}

@Attributes.displayName("Every frame")
export class CaptureAllTheTime extends CaptureMode {
    public canCapture() { return true; }
}

@Attributes.displayName("Every X Seconds")
export class CaptureByFrequency extends CaptureMode {
    frequency = .2;

    @Attributes.unserializable()
    timer = -1;

    public tick() { 
        if (this.timer < 0) {
            this.timer = this.frequency;
        } else {
            this.timer -= Time.deltaTime;
        }            
    }
    public canCapture() { return this.timer < 0; }
}
