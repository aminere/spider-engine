import { Asset } from "../assets/Asset";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { VoidSyncEvent } from "ts-events";
import { SerializedObject } from "../core/SerializableObject";
import { ICodeBlock } from "./ICodeBlock";
/**
 * @hidden
 */
export declare namespace CodeBlockInternal {
    const codeProperty = "_code";
    const trimId: (id: string) => string;
}
export declare class CodeBlock extends Asset implements ICodeBlock {
    get version(): number;
    get pins(): ReferenceArray<BasePin>;
    get code(): string;
    get program(): any;
    get hasCompileErrors(): boolean;
    get runtimeError(): [string, number] | undefined;
    get functions(): {
        [functioName: string]: Function;
    };
    get isLoading(): boolean;
    set code(code: string);
    /**
     * @event
     */
    pinChanged: VoidSyncEvent;
    /**
     * @hidden
     */
    sourceInfo: any;
    protected _pins: ReferenceArray<BasePin>;
    protected _code: string;
    private _program;
    private _functions;
    private _isLoaded;
    private _isLoading;
    private _standaloneScript;
    private _scriptUrl;
    private _hasCompileErrors;
    private _runtimeError?;
    logRuntimeError(message: string): void;
    logCompileError(message: string): void;
    clearRuntimeErrors(): void;
    isLoaded(): boolean;
    destroy(): void;
    setProperty(property: string, value: any): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private clearErrors;
}
