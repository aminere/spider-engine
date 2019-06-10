
import { ICodeBlock } from "./ICodeBlock";

namespace Internal {
    export const errors = new Map<ICodeBlock, number>();
}

export class BehaviorErrors {
    static checkCodeBlock(codeBlock: ICodeBlock) {
        if (process.env.CONFIG === "editor") {
            if (codeBlock.runtimeError) {
                const [error, timeStamp] = codeBlock.runtimeError;
                Internal.errors.set(codeBlock, timeStamp);
            } else {
                Internal.errors.delete(codeBlock);
            }
        }
    }

    static forEach(callBack: (error: number, codeBlock: ICodeBlock) => void) {
        Internal.errors.forEach(callBack);
    }

    static clear(codeBlock?: ICodeBlock) {
        if (codeBlock) {
            Internal.errors.delete(codeBlock);
        } else {
            Internal.errors.clear();
        }
    }
}
