import { Component } from "../../core/Component";
import { Entity } from "../../core/Entity";
export declare class IKEffector extends Component {
    influence: number;
    private _influence;
    setEntity(entity: Entity): void;
}
