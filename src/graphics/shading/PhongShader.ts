
import * as Attributes from "../../core/Attributes";
import { Shader, ShaderInstance } from "../Shader";
import { ShaderParams, ShaderParam } from "../ShaderUtils";
import { ShaderCodeInjector } from "../ShaderCodeInjector";
import { Visual } from "../Visual";
import { graphicSettings } from "../GraphicSettings";

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
        
        const lightParams = Array.from(new Array(graphicSettings.maxDirectionalLights)).map((a, i) => {
            return {
                [`directionalLights[${i}].direction`]: { type: "vec3", uniformLocation: null },
                [`directionalLights[${i}].color`]: { type: "vec4", uniformLocation: null },
                [`directionalLights[${i}].shadow`]: { type: "bool", uniformLocation: null },
                [`directionalLights[${i}].shadowType`]: { type: "int", uniformLocation: null },
                [`directionalLights[${i}].shadowRadius`]: { type: "float", uniformLocation: null },
                [`directionalLights[${i}].intensity`]: { type: "float", uniformLocation: null }
            } as { [name: string]: ShaderParam };
        });

        for (const lightParam of lightParams) {
            for (const param of Object.keys(lightParam)) {
                const location = gl.getUniformLocation(program, param);
                lightParam[param].uniformLocation = location;
                console.assert(location !== null, `getUniformLocation(${param}) failed in shader '${this.templatePath}'`);
            }
            Object.assign(params, lightParam);
        }

        return true;
    }

    protected setupInstance(instance: ShaderInstance, gl: WebGLRenderingContext, visual: Visual) {
        const vertexCode = ShaderCodeInjector.doVertexShader(
            this._vertexCode, 
            visual.isSkinned,
            visual.receiveFog,
            visual.receiveShadows,
            visual.hasVertexColor
        );
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexCode, "vertex");
        if (!vertexShader) {
            this._shaderError = true;
            return false;
        }
        const fragmentCode = ShaderCodeInjector.doFragmentShader(
            this._fragmentCode, 
            visual.receiveFog,
            visual.receiveShadows,
            visual.hasVertexColor,
            true
        );
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentCode, "fragment");
        if (!fragmentShader) {
            this._shaderError = true;
            return false;
        }
        return this.loadInstance(gl, instance, vertexShader, fragmentShader, vertexCode, fragmentCode);
    }
}
