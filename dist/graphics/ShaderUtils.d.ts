import { SerializableObject } from "../core/SerializableObject";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Matrix44 } from "../math/Matrix44";
import { Color } from "./Color";
import { StaticCubemap } from "./StaticCubemap";
import { Matrix33 } from "../math/Matrix33";
import { Texture } from "./Texture";
import { Vector4 } from "../math/Vector4";
export declare type ShaderParamType = "vec2" | "vec3" | "vec4" | "mat4" | "mat3" | "sampler1D" | "sampler2D" | "sampler2DArray" | "samplerCube" | "float" | "int" | "bool";
export declare type ShaderParamInstanceType = Vector2 | Vector3 | Vector4 | Color | Matrix44 | Matrix33 | Texture | StaticCubemap | Number | Boolean | String;
export interface ShaderParam {
    type: ShaderParamType;
    uniformLocation: WebGLUniformLocation | null;
    arraySize?: number;
    textureStage?: number | number[];
}
export interface ShaderParams {
    [name: string]: ShaderParam;
}
export declare class ShaderUtils {
    /**
     * @hidden
     */
    static editorParamsToFocus: string;
    static applyShaderParam(gl: WebGLRenderingContext, param: ShaderParam, value: any): void;
    static buildMaterialParams(shaderParams: ShaderParams, previousParams: SerializableObject, liveCodeChange: boolean): SerializableObject;
}
