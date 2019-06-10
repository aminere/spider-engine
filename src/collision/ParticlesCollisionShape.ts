
import { Particles } from "../graphics/Particles";
import { ComponentReference } from "../serialization/ComponentReference";
import { CollisionShape } from "./CollisionShape";
import { CollisionTestPriority } from "./CollisionTestPriority";
import { Transform } from "../core/Transform";
import { SerializedObject } from "../core/SerializableObject";
import { Entity } from "../core/Entity";
import { ObjectProps } from "../core/Types";

export class ParticlesCollisionShape extends CollisionShape {
    
    get version() { return 2; }

    tag = "Particles";

    set particlesEntity(particlesEntity: Entity) { this._particles.component = particlesEntity.getComponent(Particles); }
    get particles() { return this._particles.component; }
    
    private _particles = new ComponentReference<Particles>(Particles);    

    constructor(props?: ObjectProps<ParticlesCollisionShape>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    getTestPriority() { return CollisionTestPriority.Particles; }

    checkCollisions(
        other: CollisionShape, 
        myTransform: Transform, 
        otherTransform: Transform, 
        onCollision: (particleIndex?: number) => void
    ) {
        const particles = this._particles.component;
        if (particles) {
            particles.checkCollisions(other, otherTransform, onCollision);
        }
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { _particles: json.properties.particles });
            delete json.properties.particles;
        }
        return json;
    }
}
