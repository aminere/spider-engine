import { Asset } from "../assets/Asset";
import { AssetReference } from "../serialization/AssetReference";
import { Texture2D } from "../graphics/texture/Texture2D";
import { Vector2 } from "../math/Vector2";
import { VertexBuffer } from "../graphics/VertexBuffer";
export declare enum SpriteRenderMode {
    Stretch = 0,
    Tile = 1
}
export declare class Sprite extends Asset {
    texture: AssetReference<Texture2D>;
    borderSize: Vector2;
    renderMode: SpriteRenderMode;
    borderMode: SpriteRenderMode;
    destroy(): void;
    isLoaded(): boolean;
    tesselateInPixelsUnits(vb: VertexBuffer, offsetX: number, offsetY: number, width: number, height: number): void;
    tesselateInWorldUnits(vb: VertexBuffer): void;
    private tesselateInternal;
    private makeQuadPos;
    private makeQuadUv;
}
