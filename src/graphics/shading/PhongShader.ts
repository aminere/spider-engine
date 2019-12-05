
import * as Attributes from "../../core/Attributes";
import { Shader, ShaderInstance } from "../Shader";
import { ShaderParams } from "../ShaderUtils";

/**
 * @hidden
 */
export namespace PhongShaderInternal {
    export const diffuseKey = "diffuse";
    export const diffuseMapKey = "diffuseMap";
}

@Attributes.displayName("Phong Shader")
export class PhongShader extends Shader {    

    protected loadInstance(
        gl: WebGLRenderingContext,
        instance: ShaderInstance,
        vertexShader: WebGLShader,
        fragmentShader: WebGLShader,
        vertexCode: string,
        fragmentCode: string
    ) {
        const result = super.loadInstance(gl, instance, vertexShader, fragmentShader, vertexCode, fragmentCode);
        if (!result) {
            return false;
        }

        const params = instance.params as ShaderParams;
        const program = instance.program as WebGLProgram;
        const lightParams: ShaderParams = {
            "directionalLight.direction": { type: "vec3", uniformLocation: null },
            "directionalLight.color": { type: "vec4", uniformLocation: null },
            "directionalLight.shadow": { type: "bool", uniformLocation: null },
            "directionalLight.shadowBias": { type: "float", uniformLocation: null },
            "directionalLight.shadowRadius": { type: "float", uniformLocation: null },
            "directionalLight.shadowMapSize": { type: "vec2", uniformLocation: null }
        };        
        for (const param of Object.keys(lightParams)) {
            const location = gl.getUniformLocation(program, param);
            lightParams[param].uniformLocation = location;
            console.assert(location !== null, `getUniformLocation(${param}) failed in shader '${this.templatePath}'`);
        }
        Object.assign(params, lightParams);
        return true;
    }
}
