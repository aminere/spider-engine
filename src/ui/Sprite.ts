import { Asset } from "../assets/Asset";
import { AssetReference } from "../serialization/AssetReference";
import { Texture2D } from "../graphics/texture/Texture2D";
import { Vector2 } from "../math/Vector2";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { EngineUtils } from "../core/EngineUtils";
import * as Attributes from "../core/Attributes";
import { uiSettings } from "./UISettings";

export enum SpriteRenderMode {
    Stretch,
    Tile
}

export class Sprite extends Asset {
    texture = new AssetReference(Texture2D);
    borderSize = new Vector2();

    @Attributes.enumLiterals(SpriteRenderMode)
    renderMode = SpriteRenderMode.Stretch;

    @Attributes.enumLiterals(SpriteRenderMode)
    borderMode = SpriteRenderMode.Stretch;

    destroy() {
        this.texture.detach();
        super.destroy();
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this.texture);
    }

    tesselateInPixelsUnits(vb: VertexBuffer, offsetX: number, offsetY: number, width: number, height: number) {
        let texture = this.texture.asset;
        if (texture) {
            this.tesselateInternal(
                vb,
                width,
                height,
                texture.getWidth(),
                texture.getHeight(),
                this.borderSize.x,
                this.borderSize.y,
                offsetX,
                offsetY
            );
        }        
    }

    tesselateInWorldUnits(vb: VertexBuffer) {
        let texture = this.texture.asset;
        if (texture) {
            this.tesselateInternal(vb, 1, 1, 1, 1, this.borderSize.x / texture.getWidth(), this.borderSize.y / texture.getHeight(), 0, 0);
        }       
    }

    private tesselateInternal(
        vb: VertexBuffer,
        w: number,
        h: number,
        originalW: number,
        originalH: number,
        borderW: number,
        borderH: number,
        offsetX: number,
        offsetY: number
    ) {
        // all the tiles except the center
        let numTiles = 8;
        let numCenterRows = 0;
        let numCenterCols = 0;
        if (this.renderMode === SpriteRenderMode.Tile) {
            let originalCenterW = originalW - 2 * borderW;
            let centerW = w - 2 * borderW;
            let horizontalFactor = centerW / originalCenterW;
            let integerH = Math.floor(horizontalFactor);
            let fractionalH = horizontalFactor - integerH;
            numCenterCols = integerH;
            if (fractionalH > 0) {
                ++numCenterCols;
            }
            let originalCenterH = originalH - 2 * borderH;
            let centerH = h - 2 * borderH;
            let verticalFactor = centerH / originalCenterH;
            let integerV = Math.floor(verticalFactor);
            let fractionalV = verticalFactor - integerV;
            numCenterRows = integerV;
            if (fractionalV > 0) {
                ++numCenterRows;
            }
            numCenterCols = Math.max(numCenterCols, 1);
            numCenterRows = Math.max(numCenterRows, 1);
            let numCenterTiles = numCenterRows * numCenterCols;
            numTiles += numCenterTiles;
        } else {
            // only one tile in the center
            numTiles++;
        }
        const numVertices = numTiles * 6;
        const pos = vb.attributes.position as number[];
        pos.length = numVertices * 3;
        const uv = vb.attributes.uv as number[];
        uv.length = numVertices * 2;
        vb.vertexCount = numVertices;

        // POSITIONS            
        let idx = this.makeQuadPos(
            pos, 0,
            0, 0,
            borderW, borderH,
            offsetX, offsetY
        ); // Top left corner

        idx = this.makeQuadPos(
            pos, idx,
            borderW, 0,
            w - 2 * borderW, borderH,
            offsetX, offsetY
        ); // Top bar

        idx = this.makeQuadPos(
            pos, idx,
            w - borderW, 0,
            borderW, borderH,
            offsetX, offsetY
        ); // Top right corner

        idx = this.makeQuadPos(
            pos, idx,
            0, borderH,
            borderW, h - 2 * borderH,
            offsetX, offsetY
        ); // Left bar

        // Center part
        if (this.renderMode === SpriteRenderMode.Tile) {
            let currentX = borderW;
            let currentY = borderH;
            let originalCenterW = originalW - 2 * borderW;
            let originalCenterH = originalH - 2 * borderH;
            for (let i = 0; i < numCenterRows; ++i) {
                let currentH = originalCenterH;
                if (currentY + currentH > h - borderH) {
                    currentH = Math.max(h - borderH - currentY, 0);
                }
                for (let j = 0; j < numCenterCols; ++j) {
                    let currentW = originalCenterW;
                    if (currentX + currentW > w - borderW) {
                        currentW = Math.max(w - borderW - currentX, 0);
                    }
                    idx = this.makeQuadPos(
                        pos, idx,
                        currentX, currentY,
                        currentW, currentH,
                        offsetX, offsetY
                    );
                    currentX += originalCenterW;
                }
                currentX = borderW;
                currentY += originalCenterH;
            }
        } else {
            idx = this.makeQuadPos(
                pos, idx,
                borderW, borderH,
                w - 2 * borderW, h - 2 * borderH,
                offsetX, offsetY
            );
        }

        idx = this.makeQuadPos(
            pos, idx,
            w - borderW, borderH,
            borderW, h - 2 * borderH,
            offsetX, offsetY
        ); // Right bar

        idx = this.makeQuadPos(
            pos, idx,
            0, h - borderH,
            borderW, borderH,
            offsetX, offsetY
        ); // Bottom left corner

        idx = this.makeQuadPos(
            pos, idx,
            borderW, h - borderH,
            w - 2 * borderW, borderH,
            offsetX, offsetY
        ); // Bottom bar        

        idx = this.makeQuadPos(
            pos, idx,
            w - borderW, h - borderH,
            borderW, borderH,
            offsetX, offsetY
        ); // Bottom right corner    

        console.assert(idx ===  vb.vertexCount * 3);

        // UVS            
        const borderUvW = borderW / originalW;
        const borderUvH = borderH / originalH;
        idx = this.makeQuadUv(
            uv, 0,
            0, 1,
            borderUvW, 1 - borderUvH
        ); // Top left corner

        idx = this.makeQuadUv(
            uv, idx,
            borderUvW, 1,
            1 - borderUvW, 1 - borderUvH
        ); // Top bar  

        idx = this.makeQuadUv(
            uv, idx,
            1 - borderUvW, 1,
            1, 1 - borderUvH
        ); // Top right corner

        idx = this.makeQuadUv(
            uv, idx,
            0, 1 - borderUvH,
            borderUvW, borderUvH
        ); // Left bar

        // Center part
        if (this.renderMode === SpriteRenderMode.Tile) {
            let currentX = borderW;
            let currentY = borderH;
            let originalCenterW = originalW - 2 * borderW;
            let originalCenterH = originalH - 2 * borderH;            
            for (let i = 0; i < numCenterRows; ++i) {
                let currentH = originalCenterH;
                let uvX2 = 1 - borderUvW;
                let uvY2 = borderUvH;
                if (currentY + currentH > h - borderH) {
                    currentH = h - borderH - currentY;
                    uvY2 += (originalCenterH - currentH) / originalH;
                }
                for (let j = 0; j < numCenterCols; ++j) {
                    let currentW = originalCenterW;
                    if (currentX + currentW > w - borderW) {
                        currentW = w - borderW - currentX;
                        uvX2 -= (originalCenterW - currentW) / originalW;
                    }
                    idx = this.makeQuadUv(
                        uv, idx,
                        borderUvW, 1 - borderUvH,
                        uvX2, uvY2
                    );
                    currentX += originalCenterW;
                }
                currentX = borderW;
                currentY += originalCenterH;
            }
        } else {
            idx = this.makeQuadUv(
                uv, idx,
                borderUvW, 1 - borderUvH,
                1 - borderUvW, borderUvH
            );
        }

        idx = this.makeQuadUv(
            uv, idx,
            1 - borderUvW, 1 - borderUvH,
            1, borderUvH
        ); // Right bar

        idx = this.makeQuadUv(
            uv, idx,
            0, borderUvH,
            borderUvW, 0
        ); // Bottom left corner

        idx = this.makeQuadUv(
            uv, idx,
            borderUvW, borderUvH,
            1 - borderUvW, 0
        ); // Bottom bar    

        idx = this.makeQuadUv(
            uv, idx,
            1 - borderUvW, borderUvH,
            1, 0
        ); // Bottom right corner

        console.assert(idx === vb.vertexCount * 2);
        vb.dirtifyAttribute("position");
        vb.dirtifyAttribute("uv");
    }

    private makeQuadPos(a: number[], index: number, x: number, y: number, w: number, h: number, offsetX: number, offsetY: number) {        
        let left = x + offsetX;
        let right = x + w + offsetX;
        let top = y + offsetY;
        let bottom = y + h + offsetY;
        if (uiSettings.integerPixels) {
            left = Math.floor(left);
            right = Math.floor(right);
            top = Math.floor(top);
            bottom = Math.floor(bottom);
        }
        
        a[index + 0] = left; a[index + 1] = top; a[index + 2] = 0;
        a[index + 3] = right; a[index + 4] = top; a[index + 5] = 0;
        a[index + 6] = left; a[index + 7] = bottom; a[index + 8] = 0;
        a[index + 9] = left; a[index + 10] = bottom; a[index + 11] = 0;
        a[index + 12] = right; a[index + 13] = top; a[index + 14] = 0;
        a[index + 15] = right; a[index + 16] = bottom; a[index + 17] = 0;
        return index + 18;
    }

    private makeQuadUv(a: number[], index: number, x1: number, y1: number, x2: number, y2: number) {
        a[index + 0] = x1; a[index + 1] = y1;
        a[index + 2] = x2; a[index + 3] = y1;
        a[index + 4] = x1; a[index + 5] = y2;
        a[index + 6] = x1; a[index + 7] = y2;
        a[index + 8] = x2; a[index + 9] = y1;
        a[index + 10] = x2; a[index + 11] = y2;
        return index + 12;
    }
}
