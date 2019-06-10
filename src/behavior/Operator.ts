
import * as Attributes from "../core/Attributes";
import { ExecutionStatus } from "./ExecutionStatus";
import { SignalPin, PinType } from "./Pin";
import { BehaviorNode } from "./BehaviorNode";

export namespace OperatorInternal {
    export const startPinId = "_start";
    export const finishPinId = "_finish";
}

export class Operator extends BehaviorNode {    

    @Attributes.unserializable()
    private _start!: SignalPin;
    @Attributes.unserializable()
    private _finish!: SignalPin;

    constructor() {
        super();
        this.createPin(OperatorInternal.startPinId, PinType.Input, SignalPin);
        this.createPin(OperatorInternal.finishPinId, PinType.Output, SignalPin);
    }
   
    onStart() {
        return ExecutionStatus.Finish;
    }

    onUpdate() {
        return ExecutionStatus.Finish;
    }

    onFinish() {
    }

    onSignalReceived(inputPinId: string) {
        // TODO assert that pin is an input signal pin
    }    
}
