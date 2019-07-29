import { AnimationTrack } from "./tracks/AnimationTrack";
import { SerializableObject } from "../core/SerializableObject";
import { Visual } from "../graphics/Visual";
import { Entity, EntityInternal } from "../core/Entity";
import { Material } from "../graphics/Material";
import { Animation } from "./Animation";
import { AnimationTargets, AnimationInstance } from "./AnimationInstance";
import { AnimationTrackDefinition } from "./AnimationTrackDefinition";
import { MathEx } from "../math/MathEx";

namespace Private {
    export function evaluateProperty(
        obj: SerializableObject, 
        tokens: string[], 
        currentToken: number, 
        track: AnimationTrack, 
        time: number,
        // tslint:disable-next-line
        handler: (property: string, value: any) => void
    ) {
        if (currentToken === tokens.length - 1) {
            if (obj) {
                const value = track.getSample(time, obj[tokens[currentToken]]);
                if (value !== undefined) {
                    handler(tokens[currentToken], value);                    
                }
            }
        } else {
            if (obj) {
                const subProperty = tokens[currentToken];
                if (obj.constructor.name === "Visual" && subProperty === "_material") {
                    const visual = obj as Visual;
                    let animatedMaterial = visual.animatedMaterial as Material;
                    if (!animatedMaterial && visual.material) {
                        // Creating unique animatedMaterial instance
                        animatedMaterial = visual.material.copy() as Material;                        
                        visual.animatedMaterial = animatedMaterial;
                    }
                    // +2 instead of +1 because we skip the AssetReference.asset property and go straight to the material
                    Private.evaluateProperty(animatedMaterial, tokens, currentToken + 2, track, time, handler);
                } else {
                    Private.evaluateProperty(obj[subProperty], tokens, currentToken + 1, track, time, handler);
                }
            }
        }
    }
}

export class AnimationUtils {

    static evaluateTrack(
        track: AnimationTrack, 
        propertyPath: string, 
        entity: Entity, 
        time: number,
        // tslint:disable-next-line
        handler: (component: any, property: string, value: any) => void
    ) {
        let tokens = track.tokenCache[propertyPath];
        if (!tokens) {
            tokens = propertyPath.split("/");
            track.tokenCache[propertyPath] = tokens;
        }
        if (tokens.length > 1) {
            const typeName = tokens[0];
            const component = EntityInternal.getComponentByName(entity, typeName);
            if (component) {
                Private.evaluateProperty(
                    component,
                    tokens, 
                    1, 
                    track, 
                    time, 
                    (prop, value) => handler(component, prop, value)
                );
            }
        }
    }

    static applyTrack(
        track: AnimationTrackDefinition,
        entity: Entity, 
        time: number
    ) {
        AnimationUtils.evaluateTrack(
            track.track.instance as AnimationTrack,
            track.propertyPath,
            entity,
            time,
            (target, prop, value) => {
                if (track.transition) {                    
                    if (time < track.transition.duration) {
                        const blendFactor = time / track.transition.duration;
                        target[prop] = track.transition.blend(track.transition.sourceValue, value, blendFactor);
                    } else {
                        // Transition is over, evaluate at factor = 1 then clear it
                        target[prop] = track.transition.blend(track.transition.sourceValue, value, 1);
                        delete track.transition;
                    }
                } else {
                    target[prop] = value;
                }
            }
        );
    }    

    static evaluateAnimation(
        animation: Animation, 
        rootTarget: Entity, 
        handler: (track: AnimationTrackDefinition, target: Entity) => void,
        targets?: AnimationTargets        
    ) {
        for (const track of animation.tracks.data) {
            if (!track.track.instance) {
                continue;
            }
            let target: Entity | undefined = rootTarget;
            if (track.targetName) {
                if (targets) {
                    target = targets[track.targetName];
                } else {
                    // This is most likely in the editor when scrubbing through the timeline in edit mode
                    target = rootTarget.name === track.targetName ? rootTarget : rootTarget.findChild(track.targetName);
                }
                if (!target) {
                    // Track target not found
                    // TODO log warning??
                    continue;
                }
            }

            handler(track, target);
        }
    }

    static applyAnimation(animation: Animation, rootTarget: Entity, time: number, targets?: AnimationTargets) {
        AnimationUtils.evaluateAnimation(
            animation,
            rootTarget,
            (track, target) => {
                AnimationUtils.applyTrack(track, target, time);
            },
            targets
        );
    }

    static playAnimation(owner: Entity, anim: AnimationInstance, reset?: boolean, loopCount?: number) {
        AnimationUtils.playAnimationInstance(owner, anim, reset, loopCount);
        AnimationUtils.fetchTargetsIfNecessary(owner, anim);
        AnimationUtils.resetAnimationTransition(anim);
    }

    static playAnimationInstance(owner: Entity, anim: AnimationInstance, reset?: boolean, loopCount?: number) {
        const _reset = reset !== undefined ? reset : true;
        if (_reset) {
            anim.localTime = 0;
        } else {
            if (!anim.isPlaying) {
                anim.localTime = 0;
            }
        }
        anim.isPlaying = true;
        anim.playCount = 0;
        anim.loopCount = (loopCount !== undefined) ? loopCount : 0;
    }

    static fetchTargetsIfNecessary(entity: Entity, anim: AnimationInstance) {
        if (anim.targets) {
            return;
        }
        anim.targets = {};
        for (const a of (anim.animation as Animation).tracks.data) {
            if (a.targetName) {
                const target = entity.name === a.targetName ? entity : entity.findChild(a.targetName);
                if (target) {
                    anim.targets[a.targetName] = target;
                }
            }
        }        
    }

    static resetAnimationTransition(anim: AnimationInstance) {
        // reset transition information
        for (const a of (anim.animation as Animation).tracks.data) {            
            delete a.transition;
        }
    }
}
