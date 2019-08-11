import { UIElement, UIOverflow } from "./UIElement";
export declare enum UIOrientation {
    Horizontal = 0,
    Vertical = 1
}
export declare class StackPanel extends UIElement {
    orientation: UIOrientation;
    overflow: UIOverflow;
}
