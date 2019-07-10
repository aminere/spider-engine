import { UIElement, UIOverflow } from "./UIElement";
import * as Attributes from "../core/Attributes";

export enum UIOrientation {
    Horizontal,
    Vertical
}

@Attributes.displayName("Stack Panel")
export class StackPanel extends UIElement {

    @Attributes.enumLiterals(UIOrientation)
    orientation = UIOrientation.Horizontal;

    @Attributes.enumLiterals(UIOverflow)
    overflow = UIOverflow.Clip;
}
