import { Matrix44 } from "../math/Matrix44";
import { SerializedObject } from "./SerializableObject";
import { Component } from "./Component";
import { ObjectProps } from "./Types";
export declare class Bone extends Component {
    readonly version: number;
    worldMatrix: Matrix44;
    inverseMatrix: Matrix44;
    fbxId: number;
    constructor(props?: ObjectProps<Bone>);
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
