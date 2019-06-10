
import * as Attributes from "../../core/Attributes";
import { CollisionInfo } from "../../collision/CollisionInfo";
import { BehaviorNode } from "../BehaviorNode";
import { CollisionInfoPin } from "../DataPins";
import { SignalPin, PinType } from "../Pin";

export class Collision extends BehaviorNode {    
    
    @Attributes.unserializable()
    private _collision!: SignalPin;
    @Attributes.unserializable()
    private _collisionInfo!: CollisionInfoPin;

    constructor() {
        super();
        this.createPin("_collision", PinType.Output, SignalPin);        
        this.createPin("_collisionInfo", PinType.Output, CollisionInfoPin);
    }

    onCollision(info: CollisionInfo) {
        this._collisionInfo.setData(info);
        this.sendSignal(this._collision.name);
    }
}
