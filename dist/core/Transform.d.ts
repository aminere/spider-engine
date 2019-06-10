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
    const xKey = "_x";
    const yKey = "_y";
    const zKey = "_z";
    const wKey = "_w";
}
export declare class Transform extends Component {
    readonly version: number;
    /**
     * @event
     */
    changed: VoidSyncEvent;
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    readonly localMatrix: Matrix44;
    readonly worldMatrix: Matrix44;
    readonly invWorldMatrix: Matrix44;
    readonly worldRight: Vector3;
    readonly worldForward: Vector3;
    readonly worldUp: Vector3;
    readonly right: Vector3;
    readonly forward: Vector3;
    readonly up: Vector3;
    readonly worldPosition: Vector3;
    readonly worldRotation: Quaternion;
    readonly worldScale: Vector3;
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
    private attachToPosition;
    private attachToScale;
    private attachToRotation;
}
