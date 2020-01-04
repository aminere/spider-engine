import { CodeBlock } from "../behavior/CodeBlock";
import { Debug } from "../io/Debug";

/**
 * @hidden
 */
export namespace EditorBehaviorExecution {
    export let generateRuntimeCode = (codeBlock: CodeBlock) => {
        // Debug.logWarning("EditorBehaviorExecution not implemented in this run-time");
        codeBlock.sourceInfo = {};
        return "";
    };
}
