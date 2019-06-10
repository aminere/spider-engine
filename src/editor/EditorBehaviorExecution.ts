import { CodeBlock } from "../behavior/CodeBlock";

/**
 * @hidden
 */
export namespace EditorBehaviorExecution {
    export let generateRuntimeCode = (codeBlock: CodeBlock) => {
        console.assert(false, "Not implemented in this run-time");
        return "";
    };
}
