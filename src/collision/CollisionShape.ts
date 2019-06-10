import { SerializableObject } from "../core/SerializableObject";
import { CollisionTestPriority } from "./CollisionTestPriority";
import { Transform } from "../core/Transform";

export class CollisionShape extends SerializableObject {
    
    getTestPriority() { 
        return CollisionTestPriority.Normal; 
    }
    
    checkCollisions(
        other: CollisionShape, 
        myTransform: Transform, 
        otherTransform: Transform, 
        onCollision: (particleIndex?: number) => void
    ) {
        
    }
}
