import { Entity } from "../../core/Entity";
import { SerializedObject } from "../../core/SerializableObject";
import { Component } from "../../core/Component";
import { Color } from "../Color";
import { ObjectProps } from "../../core/Types";
import { LightType } from "./LightType";
import { Shadow } from "./Shadow";
export declare class Light extends Component {
    get version(): number;
    set type(type: LightType);
    get type(): LightType;
    get castShadows(): boolean;
    get shadow(): Shadow | undefined;
    intensity: number;
    color: Color;
    private _type;
    private _shadows;
    constructor(props?: ObjectProps<Light>);
    setEntity(entity: Entity): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
