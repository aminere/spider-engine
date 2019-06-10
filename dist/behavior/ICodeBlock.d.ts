import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
export interface ICodeBlock {
    readonly id: string;
    readonly runtimeError?: [string, number];
    code: string;
    pins: ReferenceArray<BasePin>;
    sourceInfo: any;
    logCompileError: (error: string) => void;
    clearRuntimeErrors: () => void;
}
