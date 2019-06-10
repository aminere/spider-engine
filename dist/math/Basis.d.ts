import { Vector3 } from "./Vector3";
import { Matrix44 } from "./Matrix44";
export declare class Basis {
    right: Vector3;
    up: Vector3;
    forward: Vector3;
    static fromMatrix(matrix: Matrix44): Basis;
    static fromNormal(normal: Vector3): Basis;
    static fromForward(forward: Vector3): Basis;
    setFromMatrix(matrix: Matrix44): this;
    setFromNormal(normal: Vector3): this;
    setFromForward(forward: Vector3): this;
}
