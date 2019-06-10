import { GraphicAsset } from "../graphics/GraphicAsset";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { AABB } from "../math/AABB";
export declare class StaticMeshAsset extends GraphicAsset {
    vertexBuffer: VertexBuffer;
    readonly boundingBox: AABB;
    private _vertexBuffer;
    private _boundingBox;
    graphicUnload(): void;
}
