
import * as Attributes from "../../core/Attributes";
import { Shader, ShaderInstance } from "./Shader";
import { ShaderParams, ShaderParam } from "./ShaderUtils";
import { graphicSettings } from "../GraphicSettings";
import { WebGL } from "../WebGL";

/**
 * @hidden
 */
export namespace PhongShaderInternal {
    export const diffuseKey = "diffuse";
    export const diffuseMapKey = "diffuseMap";
    export const ambientKey = "ambient";
    export const emissiveKey = "emissive";
}

@Attributes.displayName("Phong Shader")
export class PhongShader extends Shader {    

    protected loadInstance(instance: ShaderInstance) {
        const result = super.loadInstance(instance);
        if (!result) {
            return false;
        }

        const uniforms = instance.uniforms as ShaderParams;
        const program = instance.program as WebGLProgram;
        
        const lightUniforms = Array.from(new Array(graphicSettings.maxDirectionalLights)).map((a, i) => {
            return {
                [`directionalLights[${i}].color`]: { type: "vec4", uniformLocation: null },
                [`directionalLights[${i}].shadow`]: { type: "bool", uniformLocation: null },
                [`directionalLights[${i}].shadowType`]: { type: "int", uniformLocation: null },
                [`directionalLights[${i}].shadowRadius`]: { type: "float", uniformLocation: null },
                [`directionalLights[${i}].intensity`]: { type: "float", uniformLocation: null }
            } as { [name: string]: ShaderParam };
        });

        for (const lightParam of lightUniforms) {
            for (const param of Object.keys(lightParam)) {
                const location = WebGL.context.getUniformLocation(program, param);
                lightParam[param].uniformLocation = location;
                console.assert(location !== null, `getUniformLocation(${param}) failed in shader '${this.templatePath}'`);
            }
            Object.assign(uniforms, lightParam);
        }

        return true;
    }

    protected useDirectionalLights() {
        return true;
    }
}
