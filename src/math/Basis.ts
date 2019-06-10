import { Vector3 } from "./Vector3";
import { Matrix44 } from "./Matrix44";

export class Basis {

    right = new Vector3().copy(Vector3.right);
    up = new Vector3().copy(Vector3.up);
    forward = new Vector3().copy(Vector3.forward);

    static fromMatrix(matrix: Matrix44) {
        return new Basis().setFromMatrix(matrix);
    }

    static fromNormal(normal: Vector3) {
        return new Basis().setFromNormal(normal);
    }

    static fromForward(forward: Vector3) {
        return new Basis().setFromForward(forward);
    }

    setFromMatrix(matrix: Matrix44) {
        const { data } = matrix;
        this.right.set(data[0], data[1], data[2]);
        this.up.set(data[4], data[5], data[6]);
        this.forward.set(data[8], data[9], data[10]);
        return this;
    }

    setFromNormal(normal: Vector3) {        
        this.up.copy(normal);
        let dot = this.up.dot(Vector3.forward);
        let differentFromForward = Math.abs(dot) < 1;
        if (differentFromForward) {
            this.right.crossVectors(this.up, Vector3.forward).normalize();
        } else {
            this.right.copy(Vector3.right).multiply(Math.sign(dot));
        }
        this.forward.crossVectors(this.right, this.up).normalize();
        return this;
    }

    setFromForward(forward: Vector3) {
        this.forward.copy(forward);
        let dot = forward.dot(Vector3.up);
        let differentFromUp = Math.abs(dot) < 1;
        if (differentFromUp) {
            this.right.crossVectors(Vector3.up, this.forward).normalize();
        } else {
            this.right.copy(Vector3.right).multiply(Math.sign(dot));
        }
        this.up.crossVectors(this.forward, this.right).normalize();
        return this;
    }
}
