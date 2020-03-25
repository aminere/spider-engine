import { Particles } from "../graphics/particles/Particles";
import { CollisionShape } from "./CollisionShape";
import { CollisionTestPriority } from "./CollisionTestPriority";
import { Transform } from "../core/Transform";
import { SerializedObject } from "../core/SerializableObject";
import { Entity } from "../core/Entity";
import { ObjectProps } from "../core/Types";
export declare class ParticlesCollisionShape extends CollisionShape {
    get version(): number;
    tag: string;
    set particlesEntity(particlesEntity: Entity);
    get particles(): Particles | null;
    private _particles;
    constructor(props?: ObjectProps<ParticlesCollisionShape>);
    getTestPriority(): CollisionTestPriority;
    checkCollisions(other: CollisionShape, myTransform: Transform, otherTransform: Transform, onCollision: (particleIndex?: number) => void): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
