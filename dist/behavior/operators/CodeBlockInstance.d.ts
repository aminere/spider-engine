import { ReferenceArray } from "../../serialization/ReferenceArray";
import { AssetReference } from "../../serialization/AssetReference";
import { SerializedObject } from "../../core/SerializableObject";
import { Operator } from "../Operator";
import { CodeBlock } from "../CodeBlock";
import { BasePin } from "../Pin";
/**
 * @hidden
 */
export declare class CodeBlockInstance extends Operator {
    get version(): number;
    get codeBlock(): CodeBlock | null;
    get codeBlockRef(): AssetReference<CodeBlock>;
    get customPins(): ReferenceArray<BasePin>;
    get stateVariables(): object;
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
    setCodeBlock(codeBlock: CodeBlock | null, inline?: boolean): void;
    private executeFunction;
    private onCodeBlockChanged;
    private initializeStateIfNecessary;
}
