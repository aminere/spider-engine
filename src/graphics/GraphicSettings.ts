
export namespace GraphicSettings {
    export const maxDirectionalLights = 4;
    export const maxShadowCascades = 3;
    export const maxShadowDistance = 100;

    export const shadowCascadeEdges = (() => {
        return [maxShadowDistance * .1, maxShadowDistance * .25, maxShadowDistance];
    })();
}
