import { Vector3 } from "./Vector3";
import { MathEx } from "./MathEx";
import { ObjectPool } from "../core/ObjectPool";

/**
 * @hidden
 */
namespace Internal {
    export let dummy = new Vector3();
    export let dummy2 = new Vector3();
    export let dummy3 = new Vector3();
    export let dummy4 = new Vector3();
    export let dummy5 = new Vector3();
}

export class Triangle {

    static pool = new ObjectPool(Triangle, 64);

    a = new Vector3();
    b = new Vector3();
    c = new Vector3();

    static fromPool() {
        return Triangle.pool.get();
    }

    constructor(a?: Vector3, b?: Vector3, c?: Vector3) {
        this.set(
            a || Vector3.zero,
            b || Vector3.zero,
            c || Vector3.zero
        );
    }

    set(a: Vector3, b: Vector3, c: Vector3) {
        this.a.copy(a);
        this.b.copy(b);
        this.c.copy(c);
        return this;
    }

    contains(p: Vector3, tolerance?: number) {        
        const coords = this.getBarycentricCoords(p);
        let _tolerance = tolerance || 0.005;
        return (coords.y >= 0 - _tolerance) 
        && (coords.z >= 0 - _tolerance) 
        && (coords.y + coords.z <= 1 + _tolerance);
        /*
            // PXD's version using angle sum (I like it better) - TODO compare which method is best!
            double total_angles = 0.0f;       
            // make the 3 vectors
            D3DVECTOR v1 = point-a;
            D3DVECTOR v2 = point-b;
            D3DVECTOR v3 = point-c;

            normalizeVector(v1);
            normalizeVector(v2);
            normalizeVector(v3);

            total_angles += acos(dot(v1,v2));   
            total_angles += acos(dot(v2,v3));
            total_angles += acos(dot(v3,v1)); 

            // allow a small margin because of the limited precision of
            // floating point math.
            if (fabs(total_angles-2*PI) <= 0.005)
             return (TRUE);

            return(FALSE);
        */
    }

    getClosestPoint(p: Vector3) {
        let { dummy, dummy2, dummy3, dummy4, dummy5 } = Internal;
        let ab = dummy, bc = dummy2, ca = dummy3, diff = dummy4;
        MathEx.getClosestPointOnLine(p, this.a, this.b, ab);
        MathEx.getClosestPointOnLine(p, this.b, this.c, bc);
        MathEx.getClosestPointOnLine(p, this.c, this.a, ca);
        let fAB = diff.substractVectors(p, ab).length;
        let fBC = diff.substractVectors(p, bc).length;
        let fMin = fAB;
        if (fBC < fMin) {
            fMin = fBC;
            dummy5.copy(bc);
        } else {
            dummy5.copy(ab);
        }

        let fCA = diff.substractVectors(p, ca).length;
        if (fCA < fMin) {
            dummy5.copy(ca);
        }
        return dummy5;
    }

    getBarycentricCoords(p: Vector3) {
        let { dummy, dummy2, dummy3, dummy4 } = Internal;
        let v0 = dummy, v1 = dummy2, v2 = dummy3;
        v0.substractVectors(this.b, this.a);
        v1.substractVectors(this.c, this.a);
        v2.substractVectors(p, this.a);
        let d00 = v0.dot(v0);
        let d01 = v0.dot(v1);
        let d11 = v1.dot(v1);
        let d20 = v2.dot(v0);
        let d21 = v2.dot(v1);
        let det = (d00 * d11 - d01 * d01);
        if (det !== 0) {
            let v = (d11 * d20 - d01 * d21) / det;
            let w = (d00 * d21 - d01 * d20) / det;
            let u = 1.0 - v - w;
            return dummy4.set(u, v, w);
        } else {
            return dummy4.set(0, Number.MAX_VALUE, Number.MAX_VALUE);
        }        
    }    
}
