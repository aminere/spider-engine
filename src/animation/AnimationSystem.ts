import { Components } from "../core/Components";
import { Time } from "../core/Time";
import { AnimationComponent } from "./AnimationComponent";
import { AnimationUtils } from "./AnimationUtils";

export class AnimationSystem {
    static update() {

        Components.ofType(AnimationComponent).forEach(animator => {

            animator.animations.forEach(instance => {
                const { animation } = instance;
                if (!animation) {
                    return;
                }

                if (!instance.isPlaying) {
                    if (instance.autoPlay && !instance.hasPlayedOnce) {
                        AnimationUtils.playAnimation(animator.entity, instance);
                    } else {
                        return;
                    }
                }

                instance.localTime += Time.deltaTime * instance.speed;
                AnimationUtils.applyAnimation(animation, animator.entity, instance.localTime, instance.targets);

                if (instance.localTime < animation.duration) {
                    return;
                }

                if (instance.loopCount > 0) {
                    ++instance.playCount;
                    if (instance.playCount === instance.loopCount) {
                        animator.animationFinished.post(animation.name);
                        instance.isPlaying = false;
                    } else {
                        instance.localTime -= animation.duration;
                    }
                } else {
                    if (instance.stopRequested) {
                        animator.animationFinished.post(animation.name);
                        instance.isPlaying = false;
                    } else {
                        instance.localTime -= animation.duration;
                    }
                }
            });
        });
    }
}
