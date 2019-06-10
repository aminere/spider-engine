import { MathEx } from "../math/MathEx";

namespace Private {
    // Cap deltatime for when browser is idle   
    export const deltaTimeCap = 1 / 10;    
    export let previousTime = performance.now();
    export let time = 0;
    export let deltaTime = 0;    
    export let smoothDeltaTime = 0;
    export let frameTimer = 0;
    export let frameCount = 0;
    export let fps = 0;
    export let currentFrame = 0;    
}

export namespace TimeInternal {
    export function updateDeltaTime() {
        const time = performance.now();
        const deltaTime = Math.min((time - Private.previousTime) / 1000.0, Private.deltaTimeCap);
        Private.smoothDeltaTime = MathEx.lerp(Private.deltaTime, deltaTime, .5);
        Private.deltaTime = deltaTime;
        Private.time += deltaTime;
        Private.previousTime = time;

        // calc FPS
        Private.frameTimer += Private.deltaTime;
        Private.frameCount++;
        if (Private.frameTimer >= 1) {
            Private.fps = Private.frameCount / Private.frameTimer;
            Private.frameCount = 0;
            Private.frameTimer = 0;
        }
    }

    export function resetCurrentFrame() {
        Private.currentFrame = 0;
    }

    export function incrementCurrentFrame() {
        ++Private.currentFrame;
    }
}

export class Time {
    static get time() { return Private.time; }
    static get deltaTime() { return Private.deltaTime; }
    static get smoothDeltaTime() { return Private.smoothDeltaTime; }
    static get fps() { return Private.fps; }
    static get currentFrame() { return Private.currentFrame; }
}
