import { Layout } from "./Layout";
import { UISize } from "./UISize";
import { Vector2 } from "../math/Vector2";
/**
 * @hidden
 */
export declare class LayoutUtils {
    static getLayoutActualSize(layout: Layout, parentSize: number, stretch: boolean, size: UISize, margin: number, horizontal: boolean): number;
    static updateLayoutWorldMatrix(layout: Layout, resolution: Vector2, offset: Vector2): void;
}
