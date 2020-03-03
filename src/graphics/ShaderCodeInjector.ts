
import { Debug } from "../io/Debug";
import { ExponentialFog } from "./Fog";
import { ScenesInternal } from "../core/Scenes";
import { Interfaces } from "../core/Interfaces";
import { WebGL } from "./WebGL";
import { graphicSettings } from "./GraphicSettings";

/**
 * @hidden
 */
namespace Private {
    export function getSections(glsl: string) {
        let qualifierMatches = glsl.match(/precision[' ']+(highp|mediump|lowp)[' ']+(float|int)[' ']*;/g);
        let qualifiers = qualifierMatches ? qualifierMatches.join("\n") : "";
        let closingBracketIndex = glsl.lastIndexOf("}");
        if (closingBracketIndex >= 0) {
            let coreMeat = glsl;
            if (qualifierMatches && qualifierMatches.length > 0) {
                let lastQualifier = qualifierMatches[qualifierMatches.length - 1];
                let lastQualifierIndex = glsl.indexOf(lastQualifier);
                coreMeat = glsl.substring(lastQualifierIndex + lastQualifier.length, closingBracketIndex);
            } else {
                coreMeat = glsl.substring(0, closingBracketIndex);
            }
            return {
                qualifiers: qualifiers,
                coreMeat: coreMeat
            };
        } else {
            Debug.logError(`Invalid fragment shader syntax - could not locate closing bracket of entry block`);
            return null;
        }
    }
}

export class ShaderCodeInjector {
    static doVertexShader(
        vertexCode: string, 
        useSkinning?: boolean,
        useFog?: boolean,
        useShadowMap?: boolean,
        useVertexColor?: boolean
    ) {
        let directives = "";
        let definitions = "";
        let statements = "";
        let needInjection = WebGL.version > 1;

        if (Interfaces.renderer.showWireFrame) {
            definitions = `${definitions}
attribute vec3 barycentricCoord;
varying vec3 vBarycentric;`;
            statements = `${statements}
vBarycentric = barycentricCoord;`;
            needInjection = true;
        }
        
        if (useSkinning === true) {
            directives = `${directives}
#define USE_SKINNING`;
            needInjection = true;
        }

        if (useFog === true) {
            let fog = ScenesInternal.list()[0].fog;
            if (fog) {
                directives = `${directives}
#define USE_FOG`;
                if (fog.isA(ExponentialFog)) {
                    directives = `${directives}
#define USE_EXPONENTIAL_FOG`;                    
                }
                needInjection = true;
            }
        }      

        if (useShadowMap === true) {
            directives = `${directives}
#define USE_SHADOW_MAP`;
            needInjection = true;
        }

        if (useVertexColor === true) {
            directives = `${directives}
#define USE_VERTEX_COLOR`;
            needInjection = true;
        }

        if (needInjection) {
            let sections = Private.getSections(vertexCode);
            if (sections) {
                return `${WebGL.version === 2 ? "#version 300 es" : ""}
${directives}
${sections.qualifiers}
${definitions}
${sections.coreMeat}
${statements}
}
`;
            }
        }
        return vertexCode;
    }

    static doFragmentShader(
        fragmentCode: string, 
        useFog?: boolean,
        useShadowMap?: boolean,
        useVertexColor?: boolean,
        useDirectionalLights?: boolean
    ) {
        let directives = "";
        let definitions = "";
        let postProcess = "";
        let needInjection = WebGL.version > 1;        

        if (Interfaces.renderer.showWireFrame) {
            // Wireframe visualization
            if (WebGL.extensions.OES_standard_derivatives) {
                if (WebGL.version === 1) {
                    directives = `${directives}
#extension GL_OES_standard_derivatives: enable`;
                }
                directives = `${directives}
#define Supports_GL_OES_standard_derivatives                
                `;
            }

            definitions = `${definitions}
varying vec3 vBarycentric;
#ifdef Supports_GL_OES_standard_derivatives
float edgeFactor() {
    vec3 d = fwidth(vBarycentric);
    vec3 a3 = smoothstep(vec3(0.0), d * 1.2, vBarycentric);
    return min(min(a3.x, a3.y), a3.z);
}
#endif`;

            postProcess = `${postProcess}
#ifdef Supports_GL_OES_standard_derivatives
    gl_FragColor = mix(vec4(.8, .8, .8, 1.0), gl_FragColor, edgeFactor());    
#else
    if(any(lessThan(vBarycentric, vec3(0.01)))) {
        gl_FragColor = vec4(vec3(.7), 1.0);
    }
#endif`;

            needInjection = true;
        }

        if (useDirectionalLights) {
            directives = `${directives}
#define MAX_DIRECTIONAL_LIGHTS ${graphicSettings.maxDirectionalLights}     
            `;
            needInjection = true;
        }

        if (useFog === true) {
            let fog = ScenesInternal.list()[0].fog;
            if (fog) {
                directives = `${directives}
#define USE_FOG`;
                if (fog.isA(ExponentialFog)) {
                    directives = `${directives}
#define USE_EXPONENTIAL_FOG`;                    
                }
                needInjection = true;
            }
        }      

        if (useShadowMap === true) {
            if (Interfaces.renderer.showShadowCascades) {
                directives = `${directives}
#define SHOW_SHADOW_CASCADES`;
                needInjection = true;
            }

            directives = `${directives}
#define USE_SHADOW_MAP
#define MAX_DIRECTIONAL_SHADOWMAPS ${graphicSettings.maxDirectionalLights * graphicSettings.maxShadowCascades}
#define MAX_SHADOW_CASCADES ${graphicSettings.maxShadowCascades}`;
            needInjection = true;
        }
        
        if (useVertexColor === true) {
            directives = `${directives}
#define USE_VERTEX_COLOR`;
            needInjection = true;
        }

        if (needInjection) {
            let sections = Private.getSections(fragmentCode);
            if (sections) {
                return `${WebGL.version === 2 ? "#version 300 es" : ""}
${sections.qualifiers}
${directives}
${definitions}
${sections.coreMeat}
${postProcess}
}
`;
            }
        }

        return fragmentCode;
    }
}