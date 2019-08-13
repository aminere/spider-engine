
import { IKNode } from "./IKNode";
import { Vector3 } from "../../math/Vector3";
import { Quaternion } from "../../math/Quaternion";
import { Matrix44 } from "../../math/Matrix44";
import { IKSolverBase } from "./IKSolverBase";
import { MathEx } from "../../math/MathEx";

namespace Private {
    export const dummyTransform = {
        worldForward: Vector3.forward,
        worldUp: Vector3.up,
        worldMatrix: Matrix44.identity
    };
}

/**
 * Solves IK for two bones
 * - Works in 2D. Solves joint angles using cosine rule
 * - Then rotates root bone towards the target
 */
export class IKFootSolver extends IKSolverBase {
    update() {

        const entity = this.getEntity();
        const effector = this.getEffector();
        if (!entity || !effector || !entity.parent) {
            return;
        }

        const nodes = entity.getComponents(IKNode).filter(n => n.active);
        if (nodes.length < 3) {
            return;
        }
        
        const [a, b, c] = nodes;
        const [pa, pb, pc] = nodes.map(n => n.entity.transform.worldPosition);
        const target = effector.entity.transform.worldPosition;
        
        // Rotate target so as it sits on the ZY plane of the leg
        // While preserving the same distance as with the original target
        const { worldForward, worldUp, worldMatrix } = entity.parent.transform || Private.dummyTransform;
        const verticalComponent = Vector3.fromPool().copy(target).substract(pa).projectOnVector(worldUp);        
        const toTarget = Vector3.distance(Vector3.fromPool().copy(target).substract(verticalComponent), pa);        
        const localTarget2D = Vector3.fromPool().copy(worldForward).multiply(toTarget).add(pa).add(verticalComponent);

        // Can't use transform.worldToLocal() to compute local target
        // Because we don't want to feed the influence of the rotation that we are doing to the root bone.
        // So basically do the equivalent of worldToLocal() but with a zero local rotation
        const localMatrix = Matrix44.fromPool().compose(entity.transform.position, Quaternion.identity, entity.transform.scale);        
        const invWorldMatrix = Matrix44.fromPool().multiplyMatrices(worldMatrix, localMatrix).invert();
        const localTarget = Vector3.fromPool().copy(localTarget2D)
            .transform(invWorldMatrix)
            .normalize();    

        const ab = Vector3.distance(pa, pb);
        const bc = Vector3.distance(pb, pc);
        const at = Vector3.distance(pa, localTarget2D);
        const angle0 = Math.atan2(localTarget.z, -localTarget.y);

        // To compute hip angle, we must compute local position of original target
        // Not it's 2D projection
        localTarget.copy(target).transform(invWorldMatrix).normalize();
        const hipAngle = Math.atan2(localTarget.x, localTarget.z);

        const aRotation = Quaternion.fromPool();
        const bRotation = Quaternion.fromPool();
        if (at >= ab + bc) {
            // target too far, keep leg straight
            aRotation.setFromEulerAngles(-angle0, hipAngle, 0);
            bRotation.copy(Quaternion.identity);

        } else {
            // Use cosine rule to compute joint angles
            // Rotate first joint
            const t = (bc * bc - ab * ab - at * at) / (-2 * ab * at);
            const angle1 = Math.acos(MathEx.clamp(t, -1, 1));
            aRotation.setFromEulerAngles(-(angle0 + angle1), hipAngle, 0);

            // Rotate second joint
            const t2 = (at * at - ab * ab - bc * bc) / (-2 * ab * bc);
            const angle2 = Math.acos(MathEx.clamp(t2, -1, 1));
            bRotation.setFromEulerAngles(Math.PI - angle2, 0, 0);
        }

        a.entity.transform.rotation.slerp(aRotation, effector.influence);
        b.entity.transform.rotation.slerp(bRotation, effector.influence);
    }
}
