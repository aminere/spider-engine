
import * as Attributes from "./Attributes";
import { VoidSyncEvent } from "ts-events";
import { Vector3, Vector3Internal } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Matrix44 } from "../math/Matrix44";
import { SerializedObject } from "./SerializableObject";
import { Vector4 } from "../math/Vector4";
import { Component } from "./Component";
import { ObjectProps } from "./Types";

namespace Private {
    export let changeCallbacks: VoidSyncEvent[] = [];
}

/**
 * @hidden
 */
export namespace TransformInternal {
    export const positionKey = "_position";
    export const rotationKey = "_rotation";
    export const scaleKey = "_scale";
}

@Attributes.mandatory()
@Attributes.sortOrder(0)
export class Transform extends Component {
    
    get version() { return 2; }

    /**
     * @event
     */
    @Attributes.unserializable()
    changed = new VoidSyncEvent();

    get position() { return this._position; }
    get rotation() { return this._rotation; }
    get scale() { return this._scale; }
    set position(position: Vector3) { this._position.copy(position); }
    set rotation(rotation: Quaternion) { this._rotation.copy(rotation); }
    set scale(scale: Vector3) { this._scale.copy(scale); }
    set eventsEnabled(enabled: boolean) { this._eventsEnabled = enabled; }

    get localMatrix() {
        if (this._localMatrixDirty) {
            this._localMatrix.compose(this._position, this._rotation, this._scale);
            this._localMatrixDirty = false;
        }
        return this._localMatrix;
    }

    get worldMatrix() {
        if (this._worldMatrixDirty) {
            this._worldMatrix.copy(this.localMatrix);
            let parentTransform = this.entity.parent ? this.entity.parent.transform : undefined;
            if (parentTransform) {
                this._worldMatrix.multiplyMatrices(parentTransform.worldMatrix, this._worldMatrix);
            }
            this._worldMatrixDirty = false;
        }
        return this._worldMatrix;
    }

    get invWorldMatrix() {
        if (this._invWorldMatrixDirty) {
            this._invWorldMatrix.getInverse(this.worldMatrix);
            this._invWorldMatrixDirty = false;
        }
        return this._invWorldMatrix;
    }

    get worldRight() {
        this.worldMatrix.decompose(Vector3.dummy, Quaternion.dummy, Vector3.dummy);
        return Vector3.fromPool().copy(Vector3.right).rotate(Quaternion.dummy).normalize();
    }

    get worldForward() {
        this.worldMatrix.decompose(Vector3.dummy, Quaternion.dummy, Vector3.dummy);
        return Vector3.fromPool().copy(Vector3.forward).rotate(Quaternion.dummy).normalize();
    }

    get worldUp() {
        this.worldMatrix.decompose(Vector3.dummy, Quaternion.dummy, Vector3.dummy);
        return Vector3.fromPool().copy(Vector3.up).rotate(Quaternion.dummy).normalize();
    }

    get right() {
        return Vector3.fromPool().copy(Vector3.right).rotate(this.rotation).normalize();
    }

    get forward() {
        return Vector3.fromPool().copy(Vector3.forward).rotate(this.rotation).normalize();
    }

    get up() {
        return Vector3.fromPool().copy(Vector3.up).rotate(this.rotation).normalize();
    }

    get worldPosition() {
        return Vector3.fromPool().setFromMatrix(this.worldMatrix);
    }

    set worldPosition(worldPosition: Vector3) {
        this._position.copy(worldPosition);
        const parentTransform = this.entity.parent ? this.entity.parent.transform : null;
        if (parentTransform) {
            const invParentMatrix = Matrix44.fromPool().copy(parentTransform.worldMatrix).invert();
            this._position.transform(invParentMatrix);
        }
    }

    get worldRotation() {
        return this.worldMatrix.getRotation(Quaternion.fromPool());
    }

    get worldScale() {
        return this.worldMatrix.getScale(Vector3.fromPool());
    }
    
    private _position = new Vector3();    
    private _rotation = new Quaternion();
    private _scale = new Vector3(1, 1, 1);

    @Attributes.unserializable()
    private _worldMatrix = new Matrix44();
    @Attributes.unserializable()
    private _invWorldMatrix = new Matrix44();
    @Attributes.unserializable()
    private _worldMatrixDirty = true;
    @Attributes.unserializable()
    private _invWorldMatrixDirty = true;
    @Attributes.unserializable()
    private _localMatrix = new Matrix44();
    @Attributes.unserializable()
    private _localMatrixDirty = true;
    @Attributes.unserializable()
    private _disableDirtification = false;
    @Attributes.unserializable()
    private _eventsEnabled = true;

    constructor(props?: ObjectProps<Transform>) {
        super();
        if (props) {
            this.setState(props);
        }
        this.attachToPosition();
        this.attachToRotation();
        this.attachToScale();
    }

    /**
     * @hidden
     */
    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === TransformInternal.positionKey) {
            this.attachToPosition();
            this.dirtifyWorldMatrix();
        } else if (name === TransformInternal.rotationKey) {
            this.attachToRotation();
            this.dirtifyWorldMatrix();
        } else if (name === TransformInternal.scaleKey) {
            this.attachToScale();
            this.dirtifyWorldMatrix();
        }
    }

    translate(translation: Vector3) {
        this.position.add(translation);
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                [TransformInternal.positionKey]: json.properties.position,
                [TransformInternal.rotationKey]: json.properties.rotation,
                [TransformInternal.scaleKey]: json.properties.scale
            });
            delete json.properties.position;
            delete json.properties.rotation;
            delete json.properties.scale;
        }
        return json;
    }

    worldToLocal(worldPos: Vector3, localPosOut: Vector3) {
        return localPosOut.copy(worldPos).transform(this.invWorldMatrix);
    }

    localToWorld(localPos: Vector3, worldPosOut: Vector3) {
        return worldPosOut.copy(localPos).transform(this.worldMatrix);
    }

    worldToLocalDirection(worldDirection: Vector3, localDirOut: Vector3) {
        return Vector4.fromPool()
            .set(worldDirection.x, worldDirection.y, worldDirection.z, 0)
            .transform(this.invWorldMatrix)
            .getVec3(localDirOut);
    }

    worldToLocalRotation(worldRotation: Quaternion, localRotation: Quaternion) {
        return localRotation.copy(worldRotation).multiply(Quaternion.dummy.setFromMatrix(this.invWorldMatrix));
    }

    dirtifyWorldMatrix() {
        if (this._disableDirtification) {
            return;
        }
        this._localMatrixDirty = true;
        this._worldMatrixDirty = true;
        this._invWorldMatrixDirty = true;
        if (this.entity) {
            this.entity.traverse(({ transform }) => {
                if (!transform) {
                    return false;
                }
                transform._worldMatrixDirty = true;
                transform._invWorldMatrixDirty = true;
                Private.changeCallbacks.push(transform.changed);
                return true;
            });
        }

        if (this._eventsEnabled) {
            Private.changeCallbacks.forEach(c => c.post());
            this.changed.post();
        }
        Private.changeCallbacks.length = 0;        
    }    

    setLocalMatrix(matrix: Matrix44) {
        this._localMatrix.copy(matrix);
        this._localMatrix.decompose(this._position, this._rotation, this._scale);
        this._localMatrixDirty = false;
        this._worldMatrixDirty = true;
    }

    reset() {
        this._disableDirtification = true;
        this._position.copy(Vector3.zero);
        this._rotation.copy(Quaternion.identity);
        this._scale.copy(Vector3.one);
        this._disableDirtification = false;
        this.dirtifyWorldMatrix();
    }

    onReplace(previous: Transform) {
        this.changed = previous.changed;
        this.changed.post();
    }

    private attachToPosition() {
        Object.defineProperty(this._position, "x", {
            set: value => { this._position[Vector3Internal.xKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._position[Vector3Internal.xKey]
        });
        Object.defineProperty(this._position, "y", {
            set: value => { this._position[Vector3Internal.yKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._position[Vector3Internal.yKey]
        });
        Object.defineProperty(this._position, "z", {
            set: value => { this._position[Vector3Internal.zKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._position[Vector3Internal.zKey]
        });
    }

    private attachToScale() {
        Object.defineProperty(this._scale, "x", {
            set: value => { this._scale[Vector3Internal.xKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._scale[Vector3Internal.xKey]
        });
        Object.defineProperty(this._scale, "y", {
            set: value => { this._scale[Vector3Internal.yKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._scale[Vector3Internal.yKey]
        });
        Object.defineProperty(this._scale, "z", {
            set: value => { this._scale[Vector3Internal.zKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._scale[Vector3Internal.zKey]
        });
    }

    private attachToRotation() {
        Object.defineProperty(this._rotation, "x", {
            set: value => { this._rotation[Vector3Internal.xKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._rotation[Vector3Internal.xKey]
        });
        Object.defineProperty(this._rotation, "y", {
            set: value => { this._rotation[Vector3Internal.yKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._rotation[Vector3Internal.yKey]
        });
        Object.defineProperty(this._rotation, "z", {
            set: value => { this._rotation[Vector3Internal.zKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._rotation[Vector3Internal.zKey]
        });
        Object.defineProperty(this._rotation, "w", {
            set: value => { this._rotation[Vector3Internal.wKey] = value; this.dirtifyWorldMatrix(); },
            get: () => this._rotation[Vector3Internal.wKey]
        });
    }
}