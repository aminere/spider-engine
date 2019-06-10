
import * as Attributes from "../../core/Attributes";
import { TouchEvent, Input } from "../../input/Input";
import { BehaviorNode } from "../BehaviorNode";
import { NumberPin, BooleanPin, Vector2Pin } from "../DataPins";
import { SignalPin, PinType } from "../Pin";

@Attributes.displayName("Touch Input")
export class TouchInput extends BehaviorNode {

    @Attributes.unserializable()
    private _x!: NumberPin;
    @Attributes.unserializable()
    private _y!: NumberPin;
    @Attributes.unserializable()
    private _wheelDelta!: NumberPin;
    @Attributes.unserializable()
    private _button!: NumberPin;
    @Attributes.unserializable()
    private _isPressed!: BooleanPin;
    @Attributes.unserializable()
    private _pressed!: SignalPin;
    @Attributes.unserializable()
    private _released!: SignalPin;
    @Attributes.unserializable()
    private _moved!: SignalPin;
    @Attributes.unserializable()
    private _wheel!: SignalPin;
    @Attributes.unserializable()
    private _swipe!: SignalPin;
    @Attributes.unserializable()
    private _swipeVelocity!: Vector2Pin;

    constructor() {
        super();
        this.createPin("_x", PinType.Output, NumberPin);
        this.createPin("_y", PinType.Output, NumberPin);
        this.createPin("_wheelDelta", PinType.Output, NumberPin);
        this.createPin("_button", PinType.Output, NumberPin);
        this.createPin("_isPressed", PinType.Output, BooleanPin);
        this.createPin("_pressed", PinType.Output, SignalPin);
        this.createPin("_released", PinType.Output, SignalPin);
        this.createPin("_moved", PinType.Output, SignalPin);
        this.createPin("_wheel", PinType.Output, SignalPin);
        this.createPin("_swipe", PinType.Output, SignalPin);
        this.createPin("_swipeVelocity", PinType.Output, Vector2Pin);
    }

    onBehaviorStarted() {
        this.onTouchPressed = this.onTouchPressed.bind(this);
        this.onTouchMoved = this.onTouchMoved.bind(this);
        this.onTouchReleased = this.onTouchReleased.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        Input.touchPressed.attach(this.onTouchPressed);
        Input.touchMoved.attach(this.onTouchMoved);
        Input.touchReleased.attach(this.onTouchReleased);
        Input.wheelMoved.attach(this.onMouseWheel);
        this._x.setData(Input.touchX);
        this._y.setData(Input.touchY);
    }

    destroy() {
        Input.touchPressed.detach(this.onTouchPressed);
        Input.touchMoved.detach(this.onTouchMoved);
        Input.touchReleased.detach(this.onTouchReleased);
        Input.wheelMoved.detach(this.onMouseWheel);
        super.destroy();
    }

    private onTouchPressed(e: TouchEvent) {
        this._x.setData(e.x);
        this._y.setData(e.y);
        this._button.setData(e.button);
        this._isPressed.setData(e.pressed);
        this.sendSignal(this._pressed.name);
    }

    private onTouchMoved(e: TouchEvent) {
        this._x.setData(e.x);
        this._y.setData(e.y);
        this.sendSignal(this._moved.name);
    }

    private onTouchReleased(e: TouchEvent) {
        this._x.setData(e.x);
        this._y.setData(e.y);
        this._button.setData(e.button);
        this._isPressed.setData(e.pressed);
        if (e.swipe) {
            this._swipeVelocity.value.copy(e.swipeVelocity);
            this.sendSignal(this._swipe.name);
        }
        this.sendSignal(this._released.name);
    }

    private onMouseWheel(delta: number) {
        this._wheelDelta.setData(delta);
        this.sendSignal(this._wheel.name);
    }
}
