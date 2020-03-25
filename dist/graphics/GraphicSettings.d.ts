export declare namespace graphicSettings {
    const maxDirectionalLights = 4;
    const maxShadowCascades = 3;
    const maxShadowDistance = 100;
    const shadowCascadeEdges: number[];
    const shaderDefinitions: {
        MAX_DIRECTIONAL_LIGHTS: () => number;
        MAX_DIRECTIONAL_SHADOWMAPS: () => number;
        MAX_SHADOW_CASCADES: () => number;
    };
}
