import { Entity } from "../../core/Entity";
import { SerializableObject } from "../../core/SerializableObject";
import { Reference } from "../../serialization/Reference";
import { Matrix44 } from "../../math/Matrix44";
import { Component } from "../../core/Component";
import { Projector } from "../Projector";
import { Color } from "../Color";
import { TextureSizePow2 } from "../GraphicTypes";
import { Frustum } from "../Frustum";
export declare class LightType extends SerializableObject {
}
export declare class DirectionalLight extends LightType {
}
export declare class PointLight extends LightType {
    radius: number;
}
export declare class Light extends Component {
    projector: Projector | undefined;
    intensity: number;
    color: Color;
    castShadows: boolean;
    shadowBias: number;
    shadowRadius: number;
    shadowMapSize: TextureSizePow2;
    type: Reference<LightType>;
    viewMatrix: Matrix44;
    readonly frustum: Frustum | null;
    private _projector;
    constructor();
    setEntity(entity: Entity): void;
    setProperty(property: string, value: any): void;
    destroy(): void;
    getProjectionMatrix(): Matrix44;
    private updateFrustum;
    private onTransformChanged;
    private onProjectorChanged;
}
