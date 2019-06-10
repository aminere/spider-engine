import { Operator } from "../Operator";
import { ExecutionStatus } from "../ExecutionStatus";
export declare class GamepadRecorder extends Operator {
    private _frameSkip;
    private _gamePadIndex;
    private _dataStore;
    private _data;
    constructor();
    onStart(): ExecutionStatus;
    onUpdate(): ExecutionStatus;
    destroy(): void;
}
