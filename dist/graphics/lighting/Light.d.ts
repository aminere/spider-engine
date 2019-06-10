import { Entity } from "../../core/Entity";
import { SerializableObject, SerializedObject } from "../../core/SerializableObject";
import { Matrix44 } from "../../math/Matrix44";
import { Component } from "../../core/Component";
import { Projector } from "../Projector";
import { Color } from "../Color";
import { TextureSizePow2 } from "../GraphicTypes";
import { Frustum } from "../Frustum";
import { ObjectProps } from "../../core/Types";
export declare class LightType extends SerializableObject {
}
export declare class DirectionalLight extends LightType {
}
export declare class PointLight extends LightType {
    radius: number;
}
export declare class Light extends Component {
    readonly version: number;
    projector: Projector | undefined;
    type: LightType;
    intensity: number;
    color: Color;
    castShadows: boolean;
    shadowBias: number;
    shadowRadius: number;
    shadowMapSize: TextureSizePow2;
    viewMatrix: Matrix44;
    readonly frustum: Frustum | null;
    private _type;
    private _projector;
    constructor(props?: ObjectProps<Light>);
    setEntity(entity: Entity): void;
    setProperty(property: string, value: any): void;
    destroy(): void;
    getProjectionMatrix(): Matrix44;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private updateFrustum;
    private onTransformChanged;
    private onProjectorChanged;
}
