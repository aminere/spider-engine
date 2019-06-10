import { ICodeBlock } from "./ICodeBlock";
export declare class BehaviorErrors {
    static checkCodeBlock(codeBlock: ICodeBlock): void;
    static forEach(callBack: (error: number, codeBlock: ICodeBlock) => void): void;
    static clear(codeBlock?: ICodeBlock): void;
}
