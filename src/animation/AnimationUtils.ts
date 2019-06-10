import { AnimationTrack } from "./tracks/AnimationTrack";
import { SerializableObject } from "../core/SerializableObject";
import { Visual } from "../graphics/Visual";
import { Entity, EntityInternal } from "../core/Entity";
import { Material } from "../graphics/Material";
import { Animation } from "./Animation";
import { AnimationTargets, AnimationInstance } from "./AnimationInstance";

namespace Private {
    export function animateProperty(obj: SerializableObject, tokens: string[], currentToken: number, track: AnimationTrack, time: number) {
        if (currentToken === tokens.length - 1) {
            if (obj) {
                const value = track.getSample(time, obj[tokens[currentToken]]);
                if (value !== undefined) {
                    obj[tokens[currentToken]] = value;
                }
            }
        } else {
            if (obj) {
                const subProperty = tokens[currentToken];
                if (obj.constructor.name === "Visual" && subProperty === "_material") {
                    const visual = obj as Visual;
                    if (!visual.animatedMaterial && visual.material) {
                        // Creating unique animatedMaterial instance
                        visual.animatedMaterial = visual.material.copy() as Material;                        
                    }
                    // +2 instead of +1 because we skip the AssetReference.asset property and go straight to the material
                    Private.animateProperty(visual.animatedMaterial as Material, tokens, currentToken + 2, track, time);
                } else {
                    Private.animateProperty(obj[subProperty], tokens, currentToken + 1, track, time);
                }
            }
        }
    }
}

export class AnimationUtils {
    static applyTrack(track: AnimationTrack, propertyPath: string, entity: Entity, time: number) {
        let tokens = track.tokenCache[propertyPath];
        if (!tokens) {
            tokens = propertyPath.split("/");
            track.tokenCache[propertyPath] = tokens;
        }
        if (tokens.length > 1) {
            const typeName = tokens[0];
            const component = EntityInternal.getComponentByName(entity, typeName);
            if (component) {
                Private.animateProperty(component, tokens, 1, track, time);
            }
        }
    }

    static applyAnimation(animation: Animation, rootTarget: Entity, time: number, targets?: AnimationTargets) {
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
            AnimationUtils.applyTrack(track.track.instance, track.propertyPath, target, time);
        }
    }

    static playAnimation(owner: Entity, anim: AnimationInstance, reset?: boolean, loopCount?: number) {
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
        if (loopCount !== undefined) {
            anim.loopCount = loopCount;
        }

        // fetch targets
        anim.targets = {};
        for (const a of (anim.animation as Animation).tracks.data) {
            if (a.targetName) {
                const target = owner.name === a.targetName ? owner : owner.findChild(a.targetName);
                if (target) {
                    anim.targets[a.targetName] = target;
                }
            }
        }
    }
}
