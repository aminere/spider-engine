
import * as Attributes from "../../core/Attributes";
import { BehaviorNode } from "../BehaviorNode";
import { SignalPin, PinType } from "../Pin";
import { BooleanPin, Vector2Pin, EntityReferencePin } from "../DataPins";

@Attributes.displayName("UI Events")
export class UIEvents extends BehaviorNode {    
    
    get stopPropagation() { return this._stopPropagation.getData(); }

    @Attributes.unserializable()
    _touchDown!: SignalPin;
    @Attributes.unserializable()
    _click!: SignalPin;
    @Attributes.unserializable()
    _touchMove!: SignalPin;
    @Attributes.unserializable()
    _touchUp!: SignalPin;
    @Attributes.unserializable()
    _touchEnter!: SignalPin;
    @Attributes.unserializable()
    _touchLeave!: SignalPin;    
    @Attributes.unserializable()
    _longPress!: SignalPin;    
    @Attributes.unserializable()
    _target!: EntityReferencePin;
    @Attributes.unserializable()
    _touchPos!: Vector2Pin;
    @Attributes.unserializable()
    _stopPropagation!: BooleanPin;

    constructor() {
        super();
        this.createPin("_stopPropagation", PinType.Input, BooleanPin);
        this.createPin("_click", PinType.Output, SignalPin);
        this.createPin("_touchDown", PinType.Output, SignalPin);        
        this.createPin("_touchMove", PinType.Output, SignalPin);
        this.createPin("_touchUp", PinType.Output, SignalPin);
        this.createPin("_touchEnter", PinType.Output, SignalPin);
        this.createPin("_touchLeave", PinType.Output, SignalPin);
        this.createPin("_longPress", PinType.Output, SignalPin);
        this.createPin("_target", PinType.Output, EntityReferencePin);
        this.createPin("_touchPos", PinType.Output, Vector2Pin);
    }
}
