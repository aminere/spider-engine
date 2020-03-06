import { VoidSyncEvent } from "ts-events";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Matrix44 } from "../math/Matrix44";
import { SerializedObject } from "./SerializableObject";
import { Component } from "./Component";
import { ObjectProps } from "./Types";
/**
 * @hidden
 */
export declare namespace TransformInternal {
    const positionKey = "_position";
    const rotationKey = "_rotation";
    const scaleKey = "_scale";
}
export declare class Transform extends Component {
    get version(): number;
    /**
     * @event
     */
    changed: VoidSyncEvent;
    get position(): Vector3;
    get rotation(): Quaternion;
    get scale(): Vector3;
    set position(position: Vector3);
    set rotation(rotation: Quaternion);
    set scale(scale: Vector3);
    set eventsEnabled(enabled: boolean);
    get localMatrix(): Matrix44;
    get worldMatrix(): Matrix44;
    get invWorldMatrix(): Matrix44;
    get worldRight(): Vector3;
    get worldForward(): Vector3;
    get worldUp(): Vector3;
    get right(): Vector3;
    get forward(): Vector3;
    get up(): Vector3;
    get worldPosition(): Vector3;
    set worldPosition(worldPosition: Vector3);
    get worldRotation(): Quaternion;
    get worldScale(): Vector3;
    private _position;
    private _rotation;
    private _scale;
    private _worldMatrix;
    private _invWorldMatrix;
    private _worldMatrixDirty;
    private _invWorldMatrixDirty;
    private _localMatrix;
    private _localMatrixDirty;
    private _disableDirtification;
    private _eventsEnabled;
    constructor(props?: ObjectProps<Transform>);
    /**
     * @hidden
     */
    setProperty(name: string, value: any): void;
    translate(translation: Vector3): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    worldToLocal(worldPos: Vector3, localPosOut: Vector3): Vector3;
    localToWorld(localPos: Vector3, worldPosOut: Vector3): Vector3;
    worldToLocalDirection(worldDirection: Vector3, localDirOut: Vector3): Vector3;
    worldToLocalRotation(worldRotation: Quaternion, localRotation: Quaternion): Quaternion;
    dirtifyWorldMatrix(): void;
    setLocalMatrix(matrix: Matrix44): void;
    reset(): void;
    onReplace(previous: Transform): void;
    private attachToPosition;
    private attachToScale;
    private attachToRotation;
}
