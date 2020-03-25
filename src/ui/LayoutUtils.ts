import { Layout } from "./Layout";
import { UISize, UISizeType } from "./UISize";
import { Image } from "./Image";
import { Button } from "./Button";
import { Text } from "./UIText";
import { Vector2 } from "../math/Vector2";
import { HorizontalAlignment, VerticalAlignment } from "./Alignment";
import { UIFillUtils } from "./UIFillUtils";
import { CheckBox } from "./CheckBox";
import { Mask } from "./Mask";

/**
 * @hidden
 */
export class LayoutUtils {
    
    static getLayoutActualSize(
        layout: Layout,
        parentSize: number,
        stretch: boolean,
        size: UISize,
        margin: number,
        horizontal: boolean
    ) {
        let actualSize = 0;
        if (!stretch) {
            if (size.type === UISizeType.Auto) {
                const image = layout.entity.getComponent(Image);
                if (image && image.fill) {
                    return UIFillUtils.getFillSize(image.fill, horizontal);
                }

                const button = layout.entity.getComponent(Button);
                if (button && button.currentFill) {
                    return UIFillUtils.getFillSize(button.currentFill, horizontal);
                }

                const checkBox = layout.entity.getComponent(CheckBox);
                if (checkBox && checkBox.currentFill) {
                    return UIFillUtils.getFillSize(checkBox.currentFill, horizontal);
                }

                const text = layout.entity.getComponent(Text);
                const font = text ? text.font : null;
                if (font) {
                    return horizontal ? font.getWidth() : font.getHeight();
                }

                const mask = layout.entity.getComponent(Mask);
                if (mask) {                    
                    const texture = mask.texture;
                    return texture ? (horizontal ? texture.getWidth() : texture.getHeight()) : 0;
                }
            } else if (size.type === UISizeType.Relative) {
                actualSize = (parentSize * size.value) - margin;
            } else if (size.type === UISizeType.Absolute) {
                actualSize = size.value;
            }
        } else {
            actualSize = parentSize - margin;
        }
        return actualSize;
    }

    static updateLayoutWorldMatrix(layout: Layout, resolution: Vector2, offset: Vector2) {
        let size = resolution;
        let parentWidth = size.x;
        let parentHeight = size.y;
        let parentLayout = layout.entity.parent ? layout.entity.parent.getComponent(Layout) : undefined;
        let x = layout.offset.x;
        let y = layout.offset.y;
        if (parentLayout) {
            parentWidth = parentLayout.actualWidth;
            parentHeight = parentLayout.actualHeight;
            x -= parentLayout.pivot.x * parentWidth;
            y -= parentLayout.pivot.y * parentHeight;
        }

        layout.actualWidth = LayoutUtils.getLayoutActualSize(
            layout,
            parentWidth,
            layout.horizontalAlignment === HorizontalAlignment.Stretch,
            layout.width,
            layout.margin.left + layout.margin.right,
            true
        );

        layout.actualHeight = LayoutUtils.getLayoutActualSize(
            layout,
            parentHeight,
            layout.verticalAlignment === VerticalAlignment.Stretch,
            layout.height,
            layout.margin.top + layout.margin.bottom,
            false
        );

        // Only apply the resolution adjustment offset for elements that are direct children of the screen  
        // This is shaping to be a horrible hack might need to rethink in the future      
        let applyOffset = layout.entity.parent && !layout.entity.parent.hasComponent(Layout);
        let stretchX = layout.horizontalAlignment === HorizontalAlignment.Stretch;
        if (stretchX) {
            x += layout.margin.left;
        } else if (layout.horizontalAlignment === HorizontalAlignment.Left) {
            x += layout.margin.left;
            if (applyOffset) {
                x += offset.x;
            }
        } else if (layout.horizontalAlignment === HorizontalAlignment.Right) {
            x += parentWidth - layout.margin.right;
            if (applyOffset) {
                x -= offset.x;
            }
        } else if (layout.horizontalAlignment === HorizontalAlignment.Center) {
            x += parentWidth / 2;
        }

        let stretchY = layout.verticalAlignment === VerticalAlignment.Stretch;
        if (stretchY) {
            y += layout.margin.top;
        } else if (layout.verticalAlignment === VerticalAlignment.Bottom) {
            y += parentHeight - layout.margin.bottom;
            if (applyOffset) {
                y -= offset.y;
            }
        } else if (layout.verticalAlignment === VerticalAlignment.Top) {
            y += layout.margin.top;
            if (applyOffset) {
                y += offset.y;
            }
        } else if (layout.verticalAlignment === VerticalAlignment.Center) {
            y += parentHeight / 2;
        }

        layout.worldMatrix.setRotation(layout.rotation);
        layout.worldMatrix.scaleFromCoords(layout.scale.x, layout.scale.y, 1);
        layout.worldMatrix.translateFromCoords(
            x + (stretchX ? layout.pivot.x * layout.actualWidth : 0), // in stretch mode, cancel the pivot effect on the position
            y + (stretchY ? layout.pivot.y * layout.actualHeight : 0), // in stretch mode, cancel the pivot effect on the position
            0
        );

        layout.finalTint.copy(layout.tint);

        if (parentLayout) {
            layout.worldMatrix.multiplyMatrices(parentLayout.worldMatrix, layout.worldMatrix);
            if (layout.inheritTint) {
                layout.finalTint.multiplyColor(parentLayout.finalTint);
            }
        }
    }
}
