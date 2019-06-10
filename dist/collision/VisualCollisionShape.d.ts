import { CollisionShape } from "./CollisionShape";
import { Transform } from "../core/Transform";
import { Visual } from "../graphics/Visual";
import { Entity } from "../core/Entity";
import { ObjectProps } from "../core/Types";
export declare class VisualCollisionShape extends CollisionShape {
    tag: string;
    visualEntity: Entity;
    readonly visual: Visual | null;
    private _visual;
    constructor(props?: ObjectProps<VisualCollisionShape>);
    checkCollisions(other: CollisionShape, myTransform: Transform, otherTransform: Transform, onCollision: (particleIndex?: number) => void): void;
}
