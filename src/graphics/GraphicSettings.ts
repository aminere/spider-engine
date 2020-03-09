
export namespace graphicSettings {
    export const maxDirectionalLights = 4;
    export const maxShadowCascades = 3;
    export const maxShadowDistance = 100;

    export const shadowCascadeEdges = (() => {
        return [maxShadowDistance * .1, maxShadowDistance * .25, maxShadowDistance];
    })();

    export const shaderDefinitions = {
        MAX_DIRECTIONAL_LIGHTS: () => maxDirectionalLights,        
        MAX_DIRECTIONAL_SHADOWMAPS: () => maxDirectionalLights * maxShadowCascades,
        MAX_SHADOW_CASCADES: () => maxShadowCascades
    };
}
