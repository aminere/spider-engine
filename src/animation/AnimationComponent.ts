import * as Attributes from "../core/Attributes";
import { SerializedObject } from "../core/SerializableObject";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { AsyncEvent } from "ts-events";
import { Component } from "../core/Component";
import { AnimationInstance } from "./AnimationInstance";
import { AnimationUtils } from "./AnimationUtils";
import { Animation } from "./Animation";

export namespace AnimationComponentInternal {
    export const animationsKey = "_animations";
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

    playAnimationByIndex(index: number, reset?: boolean) {
        if (index < this.animations.length) {
            const animInstance = this.animations[index];
            AnimationUtils.playAnimation(this.entity, animInstance, reset);
        }
    }

    playAnimation(id: string | number, reset?: boolean, loopCount?: number) {
        let animInstance = this.animations[id];
        if (!animInstance) {
            for (const a of this.animations) {
                const anim = a.animation;
                if (anim && anim.name === id) {
                    animInstance = a;
                    break;
                }
            }
        }
        if (animInstance) {
            AnimationUtils.playAnimation(this.entity, animInstance, reset, loopCount);
        }
    }

    stopAllAnimations(waitForEnd?: boolean) {
        for (const animInstance of this.animations) {
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
        let animInstance = this.animations[id];
        if (!animInstance) {
            for (const a of this.animations) {
                const anim = a.animation;
                if (anim && anim.name === id) {
                    animInstance = a;
                    break;
                }
            }
        }
        if (animInstance) {
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
