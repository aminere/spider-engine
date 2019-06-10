import { Vector3 } from "./Vector3";
export declare class MathEx {
    static PI2: number;
    static EPSILON: number;
    static degreesToRadians: number;
    static radiansToDegrees: number;
    static toRadians(angleDegrees: number): number;
    static toDegrees(angleRadians: number): number;
    static clamp(value: number, min: number, max: number): number;
    static isZero(value: number): boolean;
    static isEqual(a: number, b: number): boolean;
    static lerp(src: number, dest: number, factor: number): number;
    static ceilPowerOfTwo(value: number): number;
    static sphericalToCartesian(radius: number, azimuth: number, inclination: number, result: Vector3): Vector3;
    static getClosestPointOnLine(p: Vector3, a: Vector3, b: Vector3, out: Vector3): Vector3;
    static getNextPow2(i: number): number;
    static isPowerOf2(value: number): boolean;
    static euclideanModulo(n: number, m: number): number;
}
