import { ReferenceArray } from "../../serialization/ReferenceArray";
import { SerializedObject } from "../../core/SerializableObject";
import { Converter } from "../Converter";
import { CodeBlock } from "../CodeBlock";
import { BasePin } from "../Pin";
export declare class CodeBlockConverterInstance extends Converter {
    readonly version: number;
    codeBlock: CodeBlock | null;
    readonly customPins: ReferenceArray<BasePin>;
    private _customPins;
    private _stateVariables;
    private _stateInitialized;
    private _codeBlock;
    constructor();
    destroy(): void;
    isLoaded(): boolean;
    convert(): void;
    onSignalReceived(inputPinId: string): void;
    onCodeBlockPinsChanged(): void;
    findPin(pinId: string): BasePin | undefined;
    filterPins(filter: (p: BasePin) => boolean): BasePin[];
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private executeFunction;
    private onCodeBlockChanged;
    private initializeStateIfNecessary;
}
