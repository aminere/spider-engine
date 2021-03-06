import { Projector } from "./Projector";
import { Transform } from "../../core/Transform";
import { SerializedObject } from "../../core/SerializableObject";
import { Matrix44 } from "../../math/Matrix44";
export declare class OrthographicProjector extends Projector {
    get version(): number;
    get size(): number;
    set size(size: number);
    private _size;
    private _projectionMatrix;
    getProjectionMatrix(): Matrix44;
    updateFrustum(transform: Transform, ratio: number): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
