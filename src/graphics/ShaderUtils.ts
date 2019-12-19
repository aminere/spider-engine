
import { SerializableObject } from "../core/SerializableObject";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Matrix44 } from "../math/Matrix44";
import { Color } from "./Color";
import { SerializerUtils } from "../serialization/SerializerUtils";
import { AssetReference } from "../serialization/AssetReference";
import { StaticCubemap } from "./StaticCubemap";
import { Asset } from "../assets/Asset";
import { Matrix33 } from "../math/Matrix33";
import { Texture } from "./Texture";
import { defaultAssets } from "../assets/DefaultAssets";
import { Vector4 } from "../math/Vector4";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";

export type ShaderParamType =
    "vec2"
    | "vec3"
    | "vec4"
    | "mat4"
    | "mat3"
    | "sampler1D"
    | "sampler2D"
    | "sampler2DArray"
    | "samplerCube"
    | "float"
    | "int"
    | "bool";

export type ShaderParamInstanceType =
    Vector2
    | Vector3
    | Vector4
    | Color
    | Matrix44
    | Matrix33
    | Texture
    | StaticCubemap
    | Number
    | Boolean
    | String;

export interface ShaderParam {
    type: ShaderParamType;
    uniformLocation: WebGLUniformLocation | null;
    arraySize?: number;
    textureStage?: number | number[];
}

export interface ShaderParams {
    [name: string]: ShaderParam;
}

interface ShaderParamFactory {
    [type: string]: {
        typeName: string;
        // tslint:disable-next-line
        create: () => any;
        // tslint:disable-next-line
        apply: (gl: WebGLRenderingContext, param: ShaderParam, value: any) => void;
    };
}

interface IMatrix {
    data: number[];
}

namespace Private {

    // Very important - all uniforms set in Renderer.render() must be listed here
    // otherwise materials may ovewrite whatever the renderer has set, in 
    // the shader.applyParameter() that are done right before vertexBuffer.draw. 
    // (see Renderer.doRenderPass())
    export const engineManagedParams: { [param: string]: boolean } = {
        "screenSize": true,
        "projectionMatrix": true,
        "viewMatrix": true,
        "worldMatrix": true,
        "normalMatrix": true,
        "modelViewMatrix": true,
        "boneTexture": true,
        "boneTextureSize": true,
        "boneMatrices": true,
        "bindMatrix": true,
        "bindMatrixInverse": true,
        "fogColor": true,
        "fogDensity": true,
        "fogNear": true,
        "fogFar": true,

        "time": true,
        "deltaTime": true,
        "frame": true,

        // Lighting
        "directionalLightMatrices": true,
        "directionalShadowMaps": true,
        "directionalLightCount": true,
        "shadowCascadeEdges": true
    };

    const textureStages: number[] = [];

    function flattenVectors(vectorArray: Vector3[]) {
        let flattened = vectorArray.reduce((previous, current) => previous.concat(current.asArray()), [] as number[]);
        return flattened;
    }

    function flattenMatrices(matrixArray: IMatrix[]) {
        let flattened = matrixArray.reduce((previous, current) => previous.concat(current.data), [] as number[]);
        return flattened;
    }

    export const shaderParamFactory: ShaderParamFactory = {
        "vec2": {
            typeName: "Vector2",
            create: () => new Vector2(),
            apply: (gl, param, value) => {
                if (param.arraySize) {
                    gl.uniform2fv(param.uniformLocation, flattenVectors(value.data));
                } else {
                    gl.uniform2f(param.uniformLocation, value.x, value.y);
                }
            }
        },
        "vec3": {
            typeName: "Vector3",
            create: () => new Vector3(),
            apply: (gl, param, value) => {
                if (param.arraySize) {
                    gl.uniform3fv(param.uniformLocation, flattenVectors(value.data));
                } else {
                    gl.uniform3f(param.uniformLocation, value.x, value.y, value.z);
                }
            }
        },
        "vec4": {
            typeName: "Color",
            create: () => new Color(),
            apply: (gl, param, value) => {
                if (param.arraySize) {
                    gl.uniform4fv(param.uniformLocation, flattenVectors(value.data));
                } else {
                    gl.uniform4f(param.uniformLocation, value.r, value.g, value.b, value.a);
                }
            }
        },
        "mat4": {
            typeName: "Matrix44",
            create: () => new Matrix44(),
            apply: (gl, param, value) => {
                gl.uniformMatrix4fv(param.uniformLocation, false, value.data);
            }
        },
        "mat3": {
            typeName: "Matrix33",
            create: () => new Matrix33(),
            apply: (gl, param, value) => {
                gl.uniformMatrix3fv(param.uniformLocation, false, value.data);
            }
        },
        "sampler2D": {
            typeName: "Texture",
            create: () => new AssetReference<Texture>(Texture),
            apply: (gl, param, value) => {
                if (param.textureStage === undefined) {
                    return;
                }
                const textureStage = param.textureStage as number;
                const textureRef = value as AssetReference<Texture>;
                const texture = textureRef.asset;
                if (texture && texture.begin(textureStage)) {
                    gl.uniform1i(param.uniformLocation, textureStage);
                } else {
                    if (defaultAssets.whiteTexture.begin(textureStage)) {
                        gl.uniform1i(param.uniformLocation, textureStage);
                    }
                }
            }
        },
        "sampler2DArray": {
            typeName: "Texture",
            create: () => new AssetReferenceArray<Texture>(Texture),
            apply: (gl, param, value) => {
                if (param.textureStage === undefined) {
                    return;
                }
                const textureStage = param.textureStage as number[];
                const textureRefs = value as AssetReferenceArray<Texture>;
                textureStages.length = 0;
                for (let i = 0; i < textureRefs.data.length; ++i) {
                    const stage = textureStage[i];
                    const texture = textureRefs.data[i].asset;
                    if (texture && texture.begin(stage)) {
                        textureStages.push(stage);
                    }
                }
                gl.uniform1iv(param.uniformLocation, textureStages);                
            }
        },
        "sampler1D": {
            typeName: "Texture",
            create: () => new AssetReference<Texture>(Texture),
            apply: (gl, param, value) => {
                if (param.textureStage === undefined) {
                    return;
                }
                const textureRef = value as AssetReference<Texture>;
                const texture = textureRef.asset;
                const textureStage = param.textureStage as number;
                if (texture && texture.begin(textureStage)) {
                    gl.uniform1i(param.uniformLocation, textureStage);
                } else {
                    if (defaultAssets.whiteTexture.begin(textureStage)) {
                        gl.uniform1i(param.uniformLocation, textureStage);
                    }
                }
            }
        },
        "samplerCube": {
            // TODO support generic cubemaps
            typeName: "StaticCubemap",
            create: () => new AssetReference(StaticCubemap),
            apply: (gl, param, value) => {
                const cubemap = (value as AssetReference<StaticCubemap>).asset;
                if (cubemap && cubemap.begin(0)) {
                    gl.uniform1i(param.uniformLocation, 0);
                }
            }
        },
        "float": {
            typeName: "Number",
            create: () => 0,
            apply: (gl, param, value) => {
                if (param.arraySize) {
                    gl.uniform1fv(param.uniformLocation, value.data);
                } else {
                    gl.uniform1f(param.uniformLocation, value);
                }
            }
        },
        "int": {
            typeName: "Number",
            create: () => 0,
            apply: (gl, param, value) => {
                if (param.arraySize) {
                    gl.uniform1iv(param.uniformLocation, value.data);
                } else {
                    gl.uniform1i(param.uniformLocation, value);
                }
            }
        },
        "bool": {
            typeName: "Boolean",
            create: () => false,
            apply: (gl, param, value) => {
                if (param.arraySize) {
                    gl.uniform1iv(param.uniformLocation, value.data);
                } else {
                    gl.uniform1i(param.uniformLocation, value);
                }
            }
        },
    };
}

export class ShaderUtils {

    /**
     * @hidden
     */
    static editorParamsToFocus = "__EditorParamsToFocus__";

    // tslint:disable-next-line
    static applyShaderParam(gl: WebGLRenderingContext, param: ShaderParam, value: any) {
        if (!param.uniformLocation) {
            return;
        }
        Private.shaderParamFactory[param.type].apply(gl, param, value);
    }

    static buildMaterialParams(shaderParams: ShaderParams, previousParams: SerializableObject, liveCodeChange: boolean) {
        if (!shaderParams) {
            console.assert(false);
            return previousParams;
        }
        const materialParams = new SerializableObject();
        for (const paramName of Object.keys(shaderParams)) {

            if (paramName in Private.engineManagedParams) {
                // this parameter cannot be exposed and is managed by the engine.
                continue;
            }

            const shaderTypeName = shaderParams[paramName].type;
            if (shaderTypeName === "mat4") {
                // don't expose matrices, they are almost certainly handled by the engine.
                continue;
            }

            // Do no lose previous value for unchanged shader parameters (same name and same type)
            let keepExistingValue = false;
            if (paramName in previousParams) {
                let previousTypeName = SerializerUtils.getPropertyTypeName(previousParams[paramName]);
                if (previousTypeName === "AssetReference") {
                    // Resolve the actual asset type
                    let assetRef = previousParams[paramName] as AssetReference<Asset>;
                    previousTypeName = assetRef.typeName();
                }
                let expectedTypeName = Private.shaderParamFactory[shaderTypeName].typeName;
                keepExistingValue = (previousTypeName === expectedTypeName);
            }

            if (keepExistingValue) {
                materialParams[paramName] = previousParams[paramName];
            } else {
                materialParams[paramName] = Private.shaderParamFactory[shaderTypeName].create();
                if (liveCodeChange) {
                    if (process.env.CONFIG === "editor") {
                        // highlight freshly added uniforms in the property grid
                        if (ShaderUtils.editorParamsToFocus in materialParams) {
                            Object.assign(materialParams[ShaderUtils.editorParamsToFocus], { [paramName]: true });
                        } else {
                            Object.assign(materialParams, { [ShaderUtils.editorParamsToFocus]: { [paramName]: true } });
                        }
                    }
                }
            }
        }
        return materialParams;
    }
}
