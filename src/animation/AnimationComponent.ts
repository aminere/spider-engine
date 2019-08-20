import * as Attributes from "../core/Attributes";
import { SerializedObject } from "../core/SerializableObject";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { AsyncEvent } from "ts-events";
import { Component } from "../core/Component";
import { AnimationInstance } from "./AnimationInstance";
import { AnimationUtils } from "./AnimationUtils";
import { Animation } from "./Animation";
import { ITransitionOptions, IPlayAnimationOptions } from "./AnimationTypes";
import { MathEx } from "../math/MathEx";
import { AnimationTrack } from "./tracks/AnimationTrack";
import { Debug } from "../io/Debug";
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";

/**
 * @hidden
 */
export namespace AnimationComponentInternal {
    export const animationsKey = "_animations";

    export function getAnimationInstance(id: string | number, animations: AnimationInstance[]) {
        const instance = animations[id];
        if (instance) {
            return instance as AnimationInstance;
        }
        
        for (const a of animations) {
            const anim = a.animation;
            if (anim && anim.name === id) {
                return a;
            }
        }

        return null;
    }
}

@Attributes.displayName("AnimationComponent")
@Attributes.helpUrl("https://docs.spiderengine.io/animation.html")
export class AnimationComponent extends Component {

    get version() { return 2; }
    get animations() { return this._animations.data; }

    /**
     * @event
     */
    @Attributes.unserializable()
    animationFinished = new AsyncEvent<string>();

    private _animations = new ArrayProperty(AnimationInstance);
    
    isLoaded() {
        if (!super.isLoaded()) {
            return false;
        }
        for (const animationInstance of this.animations) {
            if (!animationInstance.isLoaded()) {
                return false;
            }
        }
        return true;
    }    

    destroy() {
        for (const animationInstance of this.animations) {
            animationInstance.destroy();
        }
        super.destroy();
    }

    playAnimationByIndex(index: number, options?: IPlayAnimationOptions) {
        if (index < this.animations.length) {
            const animInstance = this.animations[index];
            AnimationUtils.playAnimation(this.entity, animInstance, options);
        }
    }

    playAnimation(id: string | number, options?: IPlayAnimationOptions) {        
        const animInstance = AnimationComponentInternal.getAnimationInstance(id, this.animations);
        if (animInstance) {
            AnimationUtils.playAnimation(this.entity, animInstance, options);
        }
    }

    /**
     * Plays an animation while attempting to transition from an existing active animation
     * @param sourceAnimId The index or the name of the source animation that is already playing
     * @param destAnimId The index or the name of the destination animation to play
     * @param options Transition options
     */
    transitionToAnimation(sourceAnimId: string | number, destAnimId: string | number, options: ITransitionOptions) {
        
        const destInstance = AnimationComponentInternal.getAnimationInstance(destAnimId, this.animations) as AnimationInstance;
        const destAnimation = destInstance ? destInstance.animation : null;        

        if (!destAnimation) {
            return;
        }

        const sourceInstance = AnimationComponentInternal.getAnimationInstance(sourceAnimId, this.animations) as AnimationInstance;
        const sourceAnimation = sourceInstance ? sourceInstance.animation : null;

        if (!sourceAnimation || MathEx.isZero(options.duration)) {
            // Nothing to transition from, just play the animation
            AnimationUtils.playAnimation(this.entity, destInstance, options);
            return;
        }

        sourceInstance.isPlaying = false;
        const defaultTransitionDuration = .3;

        // Setup the transition
        AnimationUtils.evaluateAnimation(
            sourceAnimation,
            this.entity,
            (track, entity) => {
                const destTrack = destAnimation.tracks.data.find(t => {
                    return t.propertyPath === track.propertyPath
                        && (t.targetName === track.targetName);
                });
                if (destTrack) {
                    AnimationUtils.evaluateTrack(
                        track.track.instance as AnimationTrack, 
                        track.propertyPath, 
                        entity,
                        sourceInstance.localTime,
                        (target, prop, value) => {

                            // Determine function used for blending between animation tracks
                            const blend = (() => {
                                if (value.constructor.name === "Vector3") {
                                    return (src: Vector3, dest: Vector3, factor: number) => (
                                        Vector3.fromPool().lerpVectors(src, dest, factor)
                                    );
                                } else if (value.constructor.name === "Quaternion") {
                                    return (src: Quaternion, dest: Quaternion, factor: number) => (
                                        Quaternion.fromPool().slerpQuaternions(src, dest, factor)
                                    );
                                } else if (value.constructor.name === "Number") {
                                    return (src: number, dest: number, factor: number) => (
                                       MathEx.lerp(src, dest, factor)
                                    );
                                } else {
                                    Debug.logWarning(`Animation transitions not supported for tracks of type '${value.constructor.name}'`);
                                    return null;
                                }
                            // No need to make blend function definition too complex
                            // tslint:disable-next-line                            
                            })() as any;
                            
                            if (blend) {
                                const transitionDuration = options.duration || defaultTransitionDuration;
                                const animDuration = (destInstance.animation as Animation).duration;
                                const duration = MathEx.clamp(transitionDuration, 0, animDuration - MathEx.EPSILON);
                                if (!MathEx.isZero(duration)) {
                                    destTrack.transition = {
                                        sourceValue: JSON.parse(JSON.stringify(value)),
                                        duration,
                                        blend
                                    };
                                }                                
                            }                            
                        }
                    );
                }
            }
        );

        AnimationUtils.playAnimationInstance(destInstance, options);
        AnimationUtils.fetchTargetsIfNecessary(this.entity, destInstance);
    }

    stopAllAnimations(waitForEnd?: boolean) {
        for (const animInstance of this.animations) {
            if (!animInstance.isPlaying) {
                continue;
            }

            if (waitForEnd === true) {
                animInstance.requestStop();
            } else {
                if (animInstance.animation) {
                    this.animationFinished.post(animInstance.animation.name);
                }
                animInstance.isPlaying = false;
            }
        }
    }

    stopAnimation(id: string | number, waitForEnd?: boolean) {
        const animInstance = AnimationComponentInternal.getAnimationInstance(id, this.animations);
        if (animInstance && animInstance.isPlaying) {
            if (waitForEnd === true) {
                animInstance.requestStop();
            } else {
                if (animInstance.animation) {
                    this.animationFinished.post(animInstance.animation.name);
                }
                animInstance.isPlaying = false;
            }
        }
    }
   
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { _animations: json.properties.animations });
            delete json.properties.animations;
        }
        return json;
    }

    addAnimation(animation: Animation) {
        const instance = new AnimationInstance();
        instance.animation = animation;
        this._animations.grow(instance);
    }
}
