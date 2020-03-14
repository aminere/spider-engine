
import { Components } from "./Components";
import { Raytracer } from "../graphics/Raytracer";
import { Particles } from "../graphics/particles/Particles";
import { GamepadsInternal } from "../input/Gamepads";
import { AnimationSystem } from "../animation/AnimationSystem";
import { TimeInternal } from "./Time";
import { PhysicsContext } from "../physics/PhysicsContext";
import { RigidBody } from "../physics/RigidBody";
import { BehaviorComponent } from "../behavior/BehaviorComponent";
import { EntityInternal } from "./Entity";
import { Screen } from "../ui/Screen";
import { CollisionSystem } from "../collision/CollisionSystem";
import { VoidSyncEvent } from "ts-events";
import { Constructor } from "./Types";
import { Component } from "./Component";
import { IKSolver } from "../animation/ik/IKSolver";
import { AnimationComponent } from "../animation/AnimationComponent";
import { Collider } from "../collision/Collider";
import { CharacterCollider } from "../collision/CharacterCollider";
import { Html } from "../ui/Html";
import { Css } from "../ui/Css";

namespace Private {
    export const updateHook = new VoidSyncEvent();
}

/**
 * @hidden
 */
export namespace UpdateInternal {    

    function iterateComponents<T extends Component>(
        ctor: Constructor<T>,
        components: { [typeName: string]: Component[] },
        handler: (component: T) => void
    ) {
        (components[ctor.name] as T[]).forEach(handler);
    }

    export function update() {        
        GamepadsInternal.scanGamepads();

        let components = Components.ofTypes([
            PhysicsContext,
            BehaviorComponent,
            AnimationComponent
        ]);

        iterateComponents(PhysicsContext, components, context => {
            context.update();
            context.entity.getComponents(RigidBody).forEach(rigidBody => (
                rigidBody.update(context)
            ));
        });       
        
        EntityInternal.collectEntityOperations = true;

        AnimationSystem.update(components.AnimationComponent as AnimationComponent[]);

        iterateComponents(BehaviorComponent, components, component => component.update());

        try {
            Private.updateHook.post();
        } catch (e) {
            // tslint:disable-next-line
            console.error("Runtime Error");
            // tslint:disable-next-line
            console.error(e.toString());
            Private.updateHook.detach();
        }
        
        EntityInternal.collectEntityOperations = false;

        for (const entity of EntityInternal.entitiesJustDestroyed) {
            EntityInternal.destroyEntity(entity);
        }
        EntityInternal.entitiesJustDestroyed.length = 0;

        // This is to make sure that entities created in behavior.update()
        // have had a chance to initialize their state through their behavior.
        // This is not ideal, a better handling would be to not render these new entities until next frame
        // If this is not done, these entities may be rendered at the world origin (uninitialized transform) and then pop
        // into position on the next frame.
        for (const entity of EntityInternal.entitiesJustCreated) {
            const behavior = entity.getComponent(BehaviorComponent);
            if (behavior && behavior.active) {
                behavior.update();
            }
        }
        EntityInternal.entitiesJustCreated.length = 0;
        
        // We're doing another lookup here because BehaviorComponent.update() might
        // have deactivated some components
        components = Components.ofTypes([
            IKSolver,
            Particles,
            Screen,
            Raytracer,
            Collider,
            CharacterCollider,
            Html,
            Css
        ]);

        iterateComponents(IKSolver, components, component => component.update());
        iterateComponents(Particles, components, component => component.update());
        iterateComponents(Screen, components, component => component.update());
        iterateComponents(Html, components, component => component.update());
        iterateComponents(Css, components, component => component.update());
        iterateComponents(Raytracer, components, component => component.update());

        CollisionSystem.update(
            components.Collider as Collider[],
            components.CharacterCollider as CharacterCollider[]
        );

        TimeInternal.incrementCurrentFrame();
    }
}

export class Update {
    /**
     * @event
     */
    static get hook() { return Private.updateHook; }
}
