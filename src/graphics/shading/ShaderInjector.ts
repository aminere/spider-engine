
import { Debug } from "../../io/Debug";
import { ExponentialFog } from "../Fog";
import { Interfaces } from "../../core/Interfaces";
import { WebGL } from "../WebGL";
import { graphicSettings } from "../GraphicSettings";
import { IShadingContext } from "./IShadingContext";

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

    export function unrollLoops(code: string) {
        return code.replace(
            /_loop_([0-9A-Z_]+)[\r\n]+\$([^\x05]*?)\$/g,
            (x, iterations, match) => {
                const iters = (() => {
                    if (isNaN(iterations)) {
                        if (iterations in graphicSettings.shaderDefinitions) {
                            return graphicSettings.shaderDefinitions[iterations]() as number;
                        }
                        return undefined;
                    } else {
                        return parseInt(iterations, 10);
                    }
                })();

                if (iters === undefined) {
                    return x;
                }

                const arr = Array.from(new Array(iters));
                return `${arr.map((a, i) => match.replace(/_i_/g, i)).join("")}`;
            });
    }
}

export class ShaderInjector {
    static doVertexShader(vertexCode: string, context: IShadingContext) {
        let directives = "";
        let definitions = "";
        let statements = "";
        let version = "";
        let needInjection = false;

        if (WebGL.version > 1) {
            version = "#version 300 es";
            needInjection = true;
        }

        if (Interfaces.renderer.showWireFrame) {
            definitions = `${definitions}
in vec3 barycentricCoord;
out vec3 vBarycentric;`;
            statements = `${statements}
vBarycentric = barycentricCoord;`;
            needInjection = true;
        }

        if (context.skinning) {
            directives = `${directives}
#define USE_SKINNING`;
            needInjection = true;
        }

        if (context.directionalLights) {
            directives = `${directives}
#define MAX_DIRECTIONAL_LIGHTS ${graphicSettings.maxDirectionalLights}     
            `;
            needInjection = true;
        }

        if (context.fog) {
            directives = `${directives}
#define USE_FOG`;
            if (context.fog.isA(ExponentialFog)) {
                directives = `${directives}
#define USE_EXPONENTIAL_FOG`;
            }
            needInjection = true;
        }

        if (context.shadowMap) {
            directives = `${directives}
#define USE_SHADOW_MAP`;
            needInjection = true;
        }

        if (context.envMap) {
            directives = `${directives}
#define USE_ENV_MAP`;
            needInjection = true;
        }

        if (context.vertexColor) {
            directives = `${directives}
#define USE_VERTEX_COLOR`;
            needInjection = true;
        }

        if (context.normalMap) {
            directives = `${directives}
#define USE_NORMAL_MAP`;
            needInjection = true;
        }        

        if (needInjection) {
            const sections = Private.getSections(vertexCode);
            if (sections) {
                return `${version}
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

    static doFragmentShader(fragmentCode: string, context: IShadingContext) {
        let directives = "";
        let definitions = "";
        let postProcess = "";
        let version = "";
        let fragColorLiteral = "gl_FragColor";
        let needInjection = false;

        if (WebGL.version > 1) {
            version = "#version 300 es";
            fragColorLiteral = "fragColor";
            needInjection = true;
        }

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
in vec3 vBarycentric;
#ifdef Supports_GL_OES_standard_derivatives
float edgeFactor() {
    vec3 d = fwidth(vBarycentric);
    vec3 a3 = smoothstep(vec3(0.0), d * 1.2, vBarycentric);
    return min(min(a3.x, a3.y), a3.z);
}
#endif`;

            postProcess = `${postProcess}
#ifdef Supports_GL_OES_standard_derivatives
    ${fragColorLiteral} = mix(vec4(.8, .8, .8, 1.0), ${fragColorLiteral}, edgeFactor());    
#else
    if(any(lessThan(vBarycentric, vec3(0.01)))) {
        ${fragColorLiteral} = vec4(vec3(.7), 1.0);
    }
#endif`;

            needInjection = true;
        }

        if (context.directionalLights) {
            directives = `${directives}
#define MAX_DIRECTIONAL_LIGHTS ${graphicSettings.maxDirectionalLights}     
            `;
            needInjection = true;
        }

        if (context.fog) {
            directives = `${directives}
#define USE_FOG`;
            if (context.fog.isA(ExponentialFog)) {
                directives = `${directives}
#define USE_EXPONENTIAL_FOG`;
            }
            needInjection = true;
        }

        if (context.shadowMap) {
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

        if (context.vertexColor) {
            directives = `${directives}
#define USE_VERTEX_COLOR`;
            needInjection = true;
        }

        if (context.envMap) {
            directives = `${directives}
#define USE_ENV_MAP`;
            needInjection = true;
        }    
        
        if (context.normalMap) {
            directives = `${directives}
#define USE_NORMAL_MAP`;
            needInjection = true;
        }

        fragmentCode = Private.unrollLoops(fragmentCode);

        if (needInjection) {
            const sections = Private.getSections(fragmentCode);
            if (sections) {
                return `${version}
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