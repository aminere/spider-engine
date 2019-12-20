import { Entity } from "../../core/Entity";
import { SerializedObject } from "../../core/SerializableObject";
import { Component } from "../../core/Component";
import { Color } from "../Color";
import { ObjectProps } from "../../core/Types";
import { LightType } from "./LightType";
import { Shadow } from "./Shadow";
export declare class Light extends Component {
    readonly version: number;
    type: LightType;
    readonly castShadows: boolean;
    readonly shadow: Shadow | undefined;
    intensity: number;
    color: Color;
    shadowBias: number;
    private _type;
    private _shadows;
    constructor(props?: ObjectProps<Light>);
    setEntity(entity: Entity): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
