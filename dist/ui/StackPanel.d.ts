import { UIElement, UIOverflow } from "./UIElement";
export declare enum UIOrientation {
    Horizontal = 0,
    Vertical = 1
}
/**
 * @hidden
 */
export declare class UIOrientationMetadata {
    static literals: {
        Horizontal: number;
        Vertical: number;
    };
}
/**
 * @hidden
 */
export declare class StackPanel extends UIElement {
    orientation: UIOrientation;
    overflow: UIOverflow;
}
