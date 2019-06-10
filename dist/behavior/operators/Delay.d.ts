import { Operator } from "../Operator";
import { ExecutionStatus } from "../ExecutionStatus";
export declare class Delay extends Operator {
    private _delay;
    private _remainingTime;
    constructor();
    /**
     * @hidden
     */
    onStart(): ExecutionStatus;
    /**
     * @hidden
     */
    onUpdate(): ExecutionStatus;
}
