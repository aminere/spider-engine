
import { Vector3 } from "./Vector3";

/**
 * @hidden
 */
namespace Private {
    export namespace getClosestPointOnLine {
        export const vc = new Vector3();
        export const vd = new Vector3();
    }
}

export class MathEx {
    static PI2 = Math.PI * 2;
    static EPSILON = .000001;
    static degreesToRadians = 0.017453288; // Math.PI / 180
    static radiansToDegrees = 57.29579143; // 180.0 / Math.PI

    static toRadians(angleDegrees: number) { return angleDegrees * MathEx.degreesToRadians; }
    static toDegrees(angleRadians: number) { return angleRadians * MathEx.radiansToDegrees; }
    static clamp(value: number, min: number, max: number) { return value < min ? min : (value > max ? max : value); }
    static isZero(value: number) { return value > -MathEx.EPSILON && value < MathEx.EPSILON; }
    static isEqual(a: number, b: number) { return MathEx.isZero(Math.abs(a - b)); }
    static lerp(src: number, dest: number, factor: number) { return src + (dest - src) * factor; }
    static ceilPowerOfTwo(value: number) {
        return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
    }

    // azimuth: angle in [0 - 2PI]
    // inclination: angle in [0 - PI]
    static sphericalToCartesian(radius: number, azimuth: number, inclination: number, result: Vector3) {
        result.x = radius * Math.cos(azimuth) * Math.sin(inclination);
        result.y = radius * Math.sin(azimuth) * Math.sin(inclination);
        result.z = radius * Math.cos(inclination);
        return result;
    }

    static getClosestPointOnLine(p: Vector3, a: Vector3, b: Vector3, out: Vector3) {
        // returns the closest point on a line segment [A B]
        let { vc, vd } = Private.getClosestPointOnLine;
        vc.substractVectors(p, a);
        vd.substractVectors(b, a);
        let length = vd.length;

        vd.multiply(1 / length);
        let t = vd.dot(vc);

        if (t < 0) {
            return a;
        } else if (t > length) {
            return b;
        }

        return out.copy(vd).multiply(t).add(a);
    }

    static getNextPow2(i: number) {
        --i;
        // tslint:disable:no-bitwise
        i |= i >> 1;
        i |= i >> 2;
        i |= i >> 4;
        i |= i >> 8;
        i |= i >> 16;
        ++i;
        return i;
    }

    static isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }

    // compute euclidian modulo of m % n
    // https://en.wikipedia.org/wiki/Modulo_operation
    static euclideanModulo(n: number, m: number) {
        return ((n % m) + m) % m;
    }
}
