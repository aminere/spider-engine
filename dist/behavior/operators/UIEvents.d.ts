import { BehaviorNode } from "../BehaviorNode";
import { SignalPin } from "../Pin";
import { BooleanPin, Vector2Pin, EntityReferencePin } from "../DataPins";
export declare class UIEvents extends BehaviorNode {
    readonly stopPropagation: boolean;
    _touchDown: SignalPin;
    _click: SignalPin;
    _touchMove: SignalPin;
    _touchUp: SignalPin;
    _touchEnter: SignalPin;
    _touchLeave: SignalPin;
    _longPress: SignalPin;
    _target: EntityReferencePin;
    _touchPos: Vector2Pin;
    _stopPropagation: BooleanPin;
    constructor();
}
