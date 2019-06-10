import { Entity, EntityInternal } from "./Entity";
import { Prefab } from "../assets/Prefab";
import { Vector3 } from "../math/Vector3";
import { PRS } from "../math/PRS";
import { Quaternion } from "../math/Quaternion";
import { ScenesInternal, Scenes } from "./Scenes";
import { Transform } from "./Transform";
import { Scene } from "../assets/Scene";
import { Component } from "./Component";
import { ObjectProps } from "./Types";

namespace Private {
    export const defaultPRS: PRS = {
        position: Vector3.zero,
        rotation: Quaternion.identity,
        scale: Vector3.one
    };
}

export interface EntityProps {
    prefab?: Prefab;
    prs?: PRS;
    children?: EntityProps[];
}

export class Entities {
    static create(props?: EntityProps) {        
        let instance: Entity;
        const prefab = props ? props.prefab : null;
        if (prefab) {
            instance = prefab.root.copy() as Entity;
            instance.name = prefab.name;                
        } else {
            instance = new Entity();
        }

        // initialize transform        
        const prs = props ? props.prs : null;
        if (prs) {
            instance.setComponent(Transform, {
                position: prs.position || Private.defaultPRS.position,
                rotation: prs.rotation || Private.defaultPRS.rotation,
                scale: prs.scale || Private.defaultPRS.scale,
            });
        }

        // initialize children
        const children = props ? props.children : null;
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

        const sceneCount = scenes.length;
        scenes[sceneCount - 1].root.addChild(instance);
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
