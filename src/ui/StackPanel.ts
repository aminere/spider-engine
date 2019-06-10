import { UIElement, UIOverflow, UIOverflowMetadata } from "./UIElement";
import * as Attributes from "../core/Attributes";

export enum UIOrientation {
    Horizontal,
    Vertical
}
/**
 * @hidden
 */
export class UIOrientationMetadata {
    static literals = {
        Horizontal: 0,
        Vertical: 1        
    };
}

/**
 * @hidden
 */
@Attributes.displayName("Stack Panel")
export class StackPanel extends UIElement {

    @Attributes.enumLiterals(UIOrientationMetadata.literals)
    orientation = UIOrientation.Horizontal;

    @Attributes.enumLiterals(UIOverflowMetadata.literals)
    overflow = UIOverflow.Clip;
}
