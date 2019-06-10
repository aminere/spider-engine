import { Asset } from "../assets/Asset";
import { AssetReference } from "../serialization/AssetReference";
import { Texture2D } from "../graphics/Texture2D";
import { Vector2 } from "../math/Vector2";
import { VertexBuffer } from "../graphics/VertexBuffer";
export declare enum SpriteRenderMode {
    Stretch = 0,
    Tile = 1
}
/**
 * @hidden
 */
export declare class SpriteRenderModeMetadata {
    static literals: {
        Stretch: number;
        Tile: number;
    };
}
export declare class Sprite extends Asset {
    texture: AssetReference<Texture2D>;
    borderSize: Vector2;
    renderMode: SpriteRenderMode;
    borderMode: SpriteRenderMode;
    /**
     * @hidden
     */
    destroy(): void;
    isLoaded(): boolean;
    /**
     * @hidden
     */
    tesselateInPixelsUnits(vb: VertexBuffer, offsetX: number, offsetY: number, width: number, height: number): void;
    /**
     * @hidden
     */
    tesselateInWorldUnits(vb: VertexBuffer): void;
    private tesselateInternal;
    private makeQuadPos;
    private makeQuadUv;
}
