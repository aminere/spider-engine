import { Geometry } from "./Geometry";
import { AssetReference } from "../../serialization/AssetReference";
import { Sprite } from "../../ui/Sprite";
import { VertexBuffer } from "../VertexBuffer";
export declare class SpriteGeometry extends Geometry {
    sprite: AssetReference<Sprite>;
    private _vertexBuffer;
    getVertexBuffer(): VertexBuffer;
    destroy(): void;
}
