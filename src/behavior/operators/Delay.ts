
import * as Attributes from "../../core/Attributes";
import { Time } from "../../core/Time";
import { Operator } from "../Operator";
import { NumberPin } from "../DataPins";
import { PinType } from "../Pin";
import { ExecutionStatus } from "../ExecutionStatus";

export class Delay extends Operator {    

    @Attributes.unserializable()
    private _delay!: NumberPin;

    @Attributes.unserializable()
    private _remainingTime = 0;

    constructor() {
        super();
        this.createPin("_delay", PinType.Input, NumberPin);
    }

    /**
     * @hidden
     */
    onStart() {
        this._remainingTime = this._delay.getData();
        if (this._remainingTime > 0) {
            return ExecutionStatus.Continue;
        } else {
            return ExecutionStatus.Finish;
        }        
    }

    /**
     * @hidden
     */
    onUpdate() {
        this._remainingTime -= Time.deltaTime;
        if (this._remainingTime < 0) {
            return ExecutionStatus.Finish;
        } else {
            return ExecutionStatus.Continue;
        }
    }
}
