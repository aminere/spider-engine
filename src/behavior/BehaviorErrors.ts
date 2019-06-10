
import { ICodeBlock } from "./ICodeBlock";

namespace Private {
    export const errors = new Map<ICodeBlock, number>();
}

export class BehaviorErrors {
    static checkCodeBlock(codeBlock: ICodeBlock) {
        if (process.env.CONFIG === "editor") {
            if (codeBlock.runtimeError) {
                const [error, timeStamp] = codeBlock.runtimeError;
                Private.errors.set(codeBlock, timeStamp);
            } else {
                Private.errors.delete(codeBlock);
            }
        }
    }

    static forEach(callBack: (error: number, codeBlock: ICodeBlock) => void) {
        Private.errors.forEach(callBack);
    }

    static clear(codeBlock?: ICodeBlock) {
        if (codeBlock) {
            Private.errors.delete(codeBlock);
        } else {
            Private.errors.clear();
        }
    }
}
