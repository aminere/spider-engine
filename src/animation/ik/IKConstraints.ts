import { SerializableObject } from "../../core/SerializableObject";
import * as Attributes from "../../core/Attributes";

export class IKConstraint extends SerializableObject {

}

@Attributes.displayName("Ball Joint")
export class IKBallJoint extends IKConstraint {

    set rotationRange(range: number) { this._rotationRange = range; }
    get rotationRange() { return this._rotationRange; }

    /**
     * Range in which the IK bone is allowed to rotate
     */
    @Attributes.rotationAngle()
    private _rotationRange = Math.PI;
}

@Attributes.displayName("Hinge Joint")
export class IKHingeJoint extends IKConstraint {

}
