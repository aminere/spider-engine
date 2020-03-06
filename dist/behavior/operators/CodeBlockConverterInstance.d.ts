import { ReferenceArray } from "../../serialization/ReferenceArray";
import { SerializedObject } from "../../core/SerializableObject";
import { Converter } from "../Converter";
import { CodeBlock } from "../CodeBlock";
import { BasePin } from "../Pin";
export declare class CodeBlockConverterInstance extends Converter {
    get version(): number;
    set codeBlock(codeBlock: CodeBlock | null);
    get codeBlock(): CodeBlock | null;
    get customPins(): ReferenceArray<BasePin>;
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
