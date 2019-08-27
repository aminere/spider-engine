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

namespace Private {

    export let tint = new Color();

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

    static renderFill(
        _fill: UIFill,
        uiMaterial: Material,
        modelView: Matrix44,
        vertexBuffer: VertexBuffer,
        gl: WebGLRenderingContext,
        tint: Color
    ) {
        if (_fill.isA(MaterialFill)) {
            let fill = _fill as MaterialFill;
            let material = fill.material;
            if (material && material.shader) {
                material.queueParameter("projectionMatrix", uiMaterial.getParameter("projectionMatrix"));
                material.queueParameter("modelViewMatrix", modelView);
                material.queueParameter("tint", tint);
                if (material.begin()) {
                    GraphicUtils.drawVertexBuffer(gl, vertexBuffer, material.shader);
                }
            }
        } else if (_fill.isA(ColorFill)) {
            let fill = _fill as ColorFill;
            let texture = defaultAssets.whiteTexture;
            uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, texture);
            uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, Private.tint.copy(fill.color).multiplyColor(tint));
            if (uiMaterial.begin()) {
                GraphicUtils.drawVertexBuffer(gl, vertexBuffer, uiMaterial.shader as Shader);
            }
        } else if (_fill.isA(TextureFill)) {
            let fill = _fill as TextureFill;
            if (fill.texture) {
                uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, fill.texture);
                uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, Private.tint.copy(fill.color).multiplyColor(tint));
                if (uiMaterial.begin()) {
                    GraphicUtils.drawVertexBuffer(gl, vertexBuffer, uiMaterial.shader as Shader);
                }
            }
        } else if (_fill.isA(SpriteFill)) {
            let fill = _fill as SpriteFill;
            let spriteTexture = fill.sprite.asset ? fill.sprite.asset.texture.asset : null;
            if (spriteTexture) {
                uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, spriteTexture);
                uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, Private.tint.copy(fill.color).multiplyColor(tint));
                if (uiMaterial.begin()) {
                    GraphicUtils.drawVertexBuffer(gl, vertexBuffer, uiMaterial.shader as Shader);
                }
            }
        } else if (_fill.isA(SpriteSheetMaterialFill)) {
            let fill = _fill as SpriteSheetMaterialFill;
            let material = fill.material;
            if (material && material.shader) {
                material.queueParameter("projectionMatrix", uiMaterial.getParameter("projectionMatrix"));
                material.queueParameter("modelViewMatrix", modelView);
                material.queueParameter("tint", tint);
                if (material.begin()) {
                    GraphicUtils.drawVertexBuffer(gl, vertexBuffer, material.shader);
                }                
            }
        } else if (_fill.isA(SpriteSheetFill)) {
            let fill = _fill as SpriteSheetFill;
            if (fill.texture) {
                uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, fill.texture);
                uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, Private.tint.copy(fill.color).multiplyColor(tint));
                if (uiMaterial.begin()) {
                    GraphicUtils.drawVertexBuffer(gl, vertexBuffer, uiMaterial.shader as Shader);                
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
