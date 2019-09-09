import { Layout } from "./Layout";
import { UIFill, TextureFill, SpriteFill, MaterialFill, SpriteSheetFill, ColorFill, SpriteSheetMaterialFill } from "./UIFill";
import { Material } from "../graphics/Material";
import { Matrix44 } from "../math/Matrix44";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Shader } from "../graphics/Shader";
import { Color } from "../graphics/Color";
import { GraphicUtils } from "../graphics/GraphicUtils";
import { AssetReference } from "../serialization/AssetReference";
import { Texture } from "../graphics/Texture";
import { GeometryProvider } from "../graphics/geometry/GeometryProvider";
import { defaultAssets } from "../assets/DefaultAssets";
import { UISettings } from "./UISettings";
import { Interfaces } from "../core/Interfaces";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Mask } from "./Mask";

namespace Private {

    export const tint = new Color();
    export const maskStart = new Vector2();
    export const maskEnd = new Vector2();

    export function getUIElementVertexBuffer(layout: Layout) {
        const quad = GeometryProvider.uiQuad;
        const pos = quad.attributes.position as number[];
        const w = layout.actualWidth;
        const h = layout.actualHeight;

        let xOffset = -layout.pivot.x * w;
        let yOffset = -layout.pivot.y * h;
        if (UISettings.integerPixels) {
            xOffset = Math.floor(xOffset);
            yOffset = Math.floor(yOffset);
        }

        pos[0] = 0 + xOffset; pos[1] = 0 + yOffset; pos[2] = 0; // Top left
        pos[3] = w + xOffset; pos[4] = 0 + yOffset; pos[5] = 0; // Top right
        pos[6] = 0 + xOffset; pos[7] = h + yOffset; pos[8] = 0; // Bottom left
        pos[9] = 0 + xOffset; pos[10] = h + yOffset; pos[11] = 0; // Bottom left
        pos[12] = w + xOffset; pos[13] = 0 + yOffset; pos[14] = 0; // Top right
        pos[15] = w + xOffset; pos[16] = h + yOffset; pos[17] = 0; // Bottom right
        quad.dirtifyAttribute("position");
        return quad;
    }
}

/**
 * @hidden
 */
export interface UIFillRenderOptions {
    fill: UIFill;
    material: Material;
    modelView: Matrix44;
    vertexBuffer: VertexBuffer;
    context: WebGLRenderingContext;
    tint: Color;
    screenOffset: Vector2;
    screenPosition: Vector3;
    screenScale: number;
}

/**
 * @hidden
 */
export class UIFillUtils {

    static uiShaderTextureParam = "diffuse";
    static uiShaderColorParam = "ambient";

    static getVertexBuffer(layout: Layout, fill?: UIFill) {
        if (fill) {
            if (fill.isA(SpriteFill)) {
                let spriteFill = fill as SpriteFill;
                return spriteFill.tesselate(layout);
            } else if (fill.isA(SpriteSheetFill)) {
                let spriteSheetFill = fill as SpriteSheetFill;
                return spriteSheetFill.tesselate(layout);
            }
        }
        return Private.getUIElementVertexBuffer(layout);
    }

    static renderFill(options: UIFillRenderOptions) {
        const {
            fill: _fill,
            material: uiMaterial,
            vertexBuffer,
            modelView,
            tint,
            context,
            screenOffset,
            screenPosition,            
            screenScale,
        } = options;

        if (_fill.isA(MaterialFill)) {
            const fill = _fill as MaterialFill;
            const material = fill.material;
            if (material && material.shader) {
                material.queueParameter("projectionMatrix", uiMaterial.getParameter("projectionMatrix"));
                material.queueParameter("modelViewMatrix", modelView);
                material.queueParameter("tint", tint);
                if (material.begin()) {
                    GraphicUtils.drawVertexBuffer(context, vertexBuffer, material.shader);
                }
            }
        } else if (_fill.isA(ColorFill)) {
            const fill = _fill as ColorFill;
            const texture = defaultAssets.whiteTexture;
            uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, texture);
            uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, Private.tint.copy(fill.color).multiplyColor(tint));
            if (uiMaterial.begin()) {
                GraphicUtils.drawVertexBuffer(context, vertexBuffer, uiMaterial.shader as Shader);
            }
        } else if (_fill.isA(TextureFill)) {
            const fill = _fill as TextureFill;
            if (fill.texture) {
                const maskTexture = fill.mask ? fill.mask.texture : null;
                if (maskTexture) {
                    const { screenSize } = Interfaces.renderer;
                    uiMaterial.queueParameter("useMask", true);
                    uiMaterial.queueReferenceParameter("mask", maskTexture);
                    // convert from layout space to real screen space
                    const translationX = screenOffset.x + screenPosition.x * screenScale;
                    const translationY = screenOffset.y + screenPosition.y * screenScale;
                    const maskLayout = (fill.mask as Mask).entity.getComponent(Layout) as Layout;
                    const offsetX = maskLayout.absolutePos.x * screenScale + translationX;
                    const offsetY = maskLayout.absolutePos.y * screenScale + translationY;
                    let maskWidth = maskLayout.actualWidth * maskLayout.absoluteScale.x * screenScale;
                    let maskHeight = maskLayout.actualHeight * maskLayout.absoluteScale.y * screenScale;
                    // convert to NDC [-1, 1]. Y is inverted.
                    maskWidth = (maskWidth / screenSize.x) * 2;
                    maskHeight = (maskHeight / screenSize.y) * 2;                    
                    const screenX = ((offsetX / screenSize.x) * 2) - 1;
                    const screenY = -(((offsetY / screenSize.y) * 2) - 1);                    
                    const { maskStart, maskEnd } = Private;
                    maskStart.set(screenX, screenY - maskHeight);
                    maskEnd.set(maskStart.x + maskWidth, maskStart.y + maskHeight);
                    uiMaterial.queueParameter("maskStart", maskStart);
                    uiMaterial.queueParameter("maskEnd", maskEnd);
                } else {
                    uiMaterial.queueParameter("useMask", false);
                }
                uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, fill.texture);
                uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, Private.tint.copy(fill.color).multiplyColor(tint));
                if (uiMaterial.begin()) {
                    GraphicUtils.drawVertexBuffer(context, vertexBuffer, uiMaterial.shader as Shader);
                }
            }
        } else if (_fill.isA(SpriteFill)) {
            const fill = _fill as SpriteFill;
            const spriteTexture = fill.sprite.asset ? fill.sprite.asset.texture.asset : null;
            if (spriteTexture) {
                uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, spriteTexture);
                uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, Private.tint.copy(fill.color).multiplyColor(tint));
                if (uiMaterial.begin()) {
                    GraphicUtils.drawVertexBuffer(context, vertexBuffer, uiMaterial.shader as Shader);
                }
            }
        } else if (_fill.isA(SpriteSheetMaterialFill)) {
            const fill = _fill as SpriteSheetMaterialFill;
            const material = fill.material;
            if (material && material.shader) {
                material.queueParameter("projectionMatrix", uiMaterial.getParameter("projectionMatrix"));
                material.queueParameter("modelViewMatrix", modelView);
                material.queueParameter("tint", tint);
                if (material.begin()) {
                    GraphicUtils.drawVertexBuffer(context, vertexBuffer, material.shader);
                }
            }
        } else if (_fill.isA(SpriteSheetFill)) {
            const fill = _fill as SpriteSheetFill;
            if (fill.texture) {
                uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, fill.texture);
                uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, Private.tint.copy(fill.color).multiplyColor(tint));
                if (uiMaterial.begin()) {
                    GraphicUtils.drawVertexBuffer(context, vertexBuffer, uiMaterial.shader as Shader);
                }
            }
        }
    }

    static getFillSize(fill: UIFill, horizontal: boolean) {
        if (fill.isA(TextureFill)) {
            const textureFill = fill as TextureFill;
            const texture = textureFill.texture;
            return texture ? (horizontal ? texture.getWidth() : texture.getHeight()) : 0;
        } else if (fill.isA(SpriteFill)) {
            const spriteFill = fill as SpriteFill;
            const texture = spriteFill.sprite.asset ? spriteFill.sprite.asset.texture.asset : null;
            return texture ? (horizontal ? texture.getWidth() : texture.getHeight()) : 0;
        } else if (fill.isA(SpriteSheetFill)) {
            const spriteSheet = fill as SpriteSheetFill;
            return horizontal ? spriteSheet.tileSize.x : spriteSheet.tileSize.y;
        } else if (fill.isA(MaterialFill)) {
            const materialFill = fill as MaterialFill;
            // size from first texture
            const material = materialFill.material;
            const shader = material ? material.shader : undefined;
            if (shader) {
                const shaderParams = shader.getParams();
                const materialParams = (material as Material).shaderParams;
                for (const param of Object.keys(shaderParams)) {
                    if (shaderParams[param].type === "sampler2D" && param in materialParams) {
                        const ref = materialParams[param] as AssetReference<Texture>;
                        const texture = ref.asset;
                        return texture ? (horizontal ? texture.getWidth() : texture.getHeight()) : 0;
                    }
                }
            }
        }

        return 256;
    }
}
