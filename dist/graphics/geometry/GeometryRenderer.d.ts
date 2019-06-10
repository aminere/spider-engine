import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { AABB } from "../../math/AABB";
import { BoxCollisionShape } from "../../collision/BoxCollisionShape";
import { Asset } from "../../assets/Asset";
import { Color } from "../Color";
import { Camera } from "../Camera";
import { Material } from "../Material";
export declare class GeometryRenderer {
    static defaultAssets: {
        path: string;
        set: (asset: Asset) => Material;
    }[];
    static init(): Promise<void>;
    static unload(): void;
    static applyProjectionMatrix(projection: Matrix44): void;
    static setViewMatrix(view: Matrix44): void;
    static begin(): boolean;
    static drawLine(start: Vector3, end: Vector3, color: Color, worldMatrix: Matrix44): void;
    static drawCone(radius: number, height: number, distFromOrigin: number, forward: Vector3, up: Vector3, color: Color, worldMatrix: Matrix44): void;
    static drawCross(p: Vector3, color: Color): void;
    static drawBillboard(p: Vector3, size: number, forward: Vector3, color: Color, camera: Camera): void;
    static drawQuad(topLeft: Vector3, topRight: Vector3, botLeft: Vector3, botRight: Vector3, color: Color, worldMatrix: Matrix44): void;
    static drawCircle(color: Color, worldMatrix: Matrix44): void;
    static drawAABB(aabb: AABB, color: Color, worldMatrix: Matrix44): void;
    static drawBox(box: BoxCollisionShape, color: Color, worldMatrix: Matrix44): void;
    static drawSphere(center: Vector3, radius: number, color: Color, worldMatrix: Matrix44): void;
    static drawPlane(normal: Vector3, distToOrigin: number, color: Color, worldMatrix: Matrix44): void;
    static draw2DRect(minX: number, minY: number, maxX: number, maxY: number, color: Color, matrix: Matrix44): void;
    static draw2DCross(x: number, y: number, size: number, color: Color, matrix: Matrix44): void;
}
