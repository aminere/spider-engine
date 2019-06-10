import { ExecutionStatus } from "./ExecutionStatus";
import { BehaviorNode } from "./BehaviorNode";
/**
 * @hidden
 */
export declare namespace OperatorInternal {
    const startPinId = "_start";
    const finishPinId = "_finish";
}
export declare class Operator extends BehaviorNode {
    private _start;
    private _finish;
    constructor();
    onStart(): ExecutionStatus;
    onUpdate(): ExecutionStatus;
    onFinish(): void;
    onSignalReceived(inputPinId: string): void;
}
