import { CodeBlock } from "./CodeBlock";
import * as Attributes from "../core/Attributes";

@Attributes.displayName("Converter")
export class CodeBlockConverter extends CodeBlock {
    constructor() {
        super();
        this._code = `
function convert() {                
}
`;
    }
}
