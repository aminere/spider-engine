import { Entity, EntityInternal } from "./Entity";
import { Prefab } from "../assets/Prefab";
import { Vector3 } from "../math/Vector3";
import { PRS } from "../math/PRS";
import { Quaternion } from "../math/Quaternion";
import { ScenesInternal, Scenes } from "./Scenes";
import { Transform } from "./Transform";
import { Scene } from "../assets/Scene";

export interface EntityProps {
    name?: string;
    prefab?: Prefab;
    prs?: PRS;
    children?: EntityProps[];
}

namespace Private {
    export const defaultPRS: PRS = {
        position: Vector3.zero,
        rotation: Quaternion.identity,
        scale: Vector3.one
    };

    export const emptyProps: EntityProps = {
        name: undefined,
        prefab: undefined,
        prs: undefined,
        children: undefined
    };
}

export class Entities {
    static create(props?: EntityProps) {
        const { name, prefab, prs, children } = props || Private.emptyProps;
        let instance: Entity;

        if (prefab) {
            instance = prefab.root.copy() as Entity;
            instance.name = name || prefab.name;                
        } else {
            instance = new Entity();
            if (name) {
                instance.name = name;
            }
        }

        // initialize transform        
        if (prs) {
            instance.setComponent(Transform, {
                position: prs.position || Private.defaultPRS.position,
                rotation: prs.rotation || Private.defaultPRS.rotation,
                scale: prs.scale || Private.defaultPRS.scale,
            });
        }

        // initialize children
        if (children) {
            for (const childProp of children) {
                instance.addChild(Entities.create(childProp));
            }                   
        }

        const scenes = ScenesInternal.list();
        if (scenes.length === 0) {
            Scenes.create();
            // The cast is to make the compiler happy.
            console.assert((scenes as Scene[]).length === 1);
        }

        scenes[0].root.addChild(instance);
        if (EntityInternal.collectEntityOperations) {
            EntityInternal.entitiesJustCreated.push(instance);
        }
        return instance;
    }

    static find(name: string): Entity | null {
        for (const scene of ScenesInternal.list()) {
            if (name === scene.root.name) {
                return scene.root;
            }
            const match = scene.root.findChild(name);
            if (match) {
                return match;
            }
        }
        return null;
    }

    static get(id: string): Entity | null {
        for (const scene of ScenesInternal.list()) {
            if (id === scene.root.id) {
                return scene.root;
            }
            const match = scene.root.findChildById(id);
            if (match) {
                return match;
            }            
        }
        return null;
    }
}
