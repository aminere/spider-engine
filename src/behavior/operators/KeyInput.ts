
import * as Attributes from "../../core/Attributes";
import { KeyEvent, Input } from "../../input/Input";
import { BehaviorNode } from "../BehaviorNode";
import { NumberPin } from "../DataPins";
import { SignalPin, PinType } from "../Pin";

@Attributes.displayName("Key Input")
export class KeyInput extends BehaviorNode {    

    @Attributes.unserializable()
    private _keyCode!: NumberPin;
    @Attributes.unserializable()
    private _keyDown!: SignalPin;
    @Attributes.unserializable()
    private _keyUp!: SignalPin;

    constructor() {
        super();
        this.createPin("_keyCode", PinType.Output, NumberPin);
        this.createPin("_keyDown", PinType.Output, SignalPin);
        this.createPin("_keyUp", PinType.Output, SignalPin);
    }

    onBehaviorStarted() {        
        this.onKeyChanged = this.onKeyChanged.bind(this);
        Input.keyChanged.attach(this.onKeyChanged);
    }

    destroy() {
        Input.keyChanged.detach(this.onKeyChanged);
        super.destroy();
    }

    private onKeyChanged(info: KeyEvent) {
        this._keyCode.setData(info.keyCode);
        if (info.pressed) {
            this.sendSignal(this._keyDown.name);
        } else {
            this.sendSignal(this._keyUp.name);
        }
    }
}
