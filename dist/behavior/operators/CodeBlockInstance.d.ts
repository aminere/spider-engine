import { ReferenceArray } from "../../serialization/ReferenceArray";
import { SerializedObject } from "../../core/SerializableObject";
import { Operator } from "../Operator";
import { CodeBlock } from "../CodeBlock";
import { BasePin } from "../Pin";
/**
 * @hidden
 */
export declare class CodeBlockInstance extends Operator {
    readonly version: number;
    codeBlock: CodeBlock | null;
    readonly customPins: ReferenceArray<BasePin>;
    readonly stateVariables: object;
    private _customPins;
    private _stateVariables;
    private _onStartExecutionPending;
    private _initStateExecutionPending;
    private _stateInitialized;
    private _codeBlock;
    constructor();
    isLoaded(): boolean;
    destroy(): void;
    onBehaviorStarted(): void;
    onStart(): any;
    onUpdate(): any;
    onFinish(): void;
    onSignalReceived(inputPinName: string): void;
    onCodeBlockPinsChanged(): void;
    findPin(pinId: string): BasePin | undefined;
    filterPins(filter: (p: BasePin) => boolean): BasePin[];
    findPinByName(pinName: string): BasePin | undefined;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private executeFunction;
    private onCodeBlockChanged;
    private initializeStateIfNecessary;
}
