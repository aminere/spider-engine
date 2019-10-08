
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

export type ShaderParamType =
    "vec2"
    | "vec3"
    | "vec4"
    | "mat4"
    | "mat3"
    | "sampler1D"
    | "sampler2D"
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
    textureStage?: number;
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

        "lightMatrix": true,
        "shadowMap": true,
        "directionalLight.direction": true,
        "directionalLight.color": true,
        "directionalLight.shadow": true,
        "directionalLight.shadowBias": true,
        "directionalLight.shadowRadius": true,
        "directionalLight.shadowMapSize": true
    };

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
                if (!param.uniformLocation) {
                    return;
                }
                const singleValue = (value.constructor.name) === "Vector2";
                if (singleValue) {
                    gl.uniform2f(param.uniformLocation, value.x, value.y);
                } else {
                    gl.uniform2fv(param.uniformLocation, flattenVectors(value.data));
                }
            }
        },
        "vec3": {
            typeName: "Vector3",
            create: () => new Vector3(),
            apply: (gl, param, value) => {
                if (!param.uniformLocation) {
                    return;
                }
                const singleValue = (value.constructor.name) === "Vector3";
                if (singleValue) {
                    gl.uniform3f(param.uniformLocation, value.x, value.y, value.z);
                } else {
                    gl.uniform3fv(param.uniformLocation, flattenVectors(value.data));
                }
            }
        },
        "vec4": {
            typeName: "Color",
            create: () => new Color(),
            apply: (gl, param, value) => {
                if (!param.uniformLocation) {
                    return;
                }
                const singleValue = (value.constructor.name) === "Color";
                if (singleValue) {
                    gl.uniform4f(param.uniformLocation, value.r, value.g, value.b, value.a);
                } else {
                    gl.uniform4fv(param.uniformLocation, flattenVectors(value.data));
                }
            }
        },
        "mat4": {
            typeName: "Matrix44",
            create: () => new Matrix44(),
            apply: (gl, param, value) => {
                if (!param.uniformLocation) {
                    return;
                }
                gl.uniformMatrix4fv(param.uniformLocation, false, value.data);
            }
        },
        "mat3": {
            typeName: "Matrix33",
            create: () => new Matrix33(),
            apply: (gl, param, value) => {
                if (!param.uniformLocation) {
                    return;
                }
                gl.uniformMatrix3fv(param.uniformLocation, false, value.data);
            }
        },
        "sampler2D": {
            typeName: "Texture",
            create: () => new AssetReference<Texture>(Texture),
            apply: (gl, param, value) => {
                if (!param.uniformLocation || param.textureStage === undefined) {
                    return;
                }
                const textureRef = value as AssetReference<Texture>;
                const texture = textureRef.asset;
                if (texture && texture.begin(param.textureStage)) {
                    gl.uniform1i(param.uniformLocation, param.textureStage);
                } else {
                    if (defaultAssets.whiteTexture.begin(param.textureStage)) {
                        gl.uniform1i(param.uniformLocation, param.textureStage);
                    }
                }
            }
        },
        "sampler1D": {
            typeName: "Texture",
            create: () => new AssetReference<Texture>(Texture),
            apply: (gl, param, value) => {
                if (!param.uniformLocation || param.textureStage === undefined) {
                    return;
                }
                const textureRef = value as AssetReference<Texture>;
                const texture = textureRef.asset;
                if (texture && texture.begin(param.textureStage)) {
                    gl.uniform1i(param.uniformLocation, param.textureStage);
                } else {
                    if (defaultAssets.whiteTexture.begin(param.textureStage)) {
                        gl.uniform1i(param.uniformLocation, param.textureStage);
                    }
                }
            }
        },
        "samplerCube": {
            // TODO support generic cubemaps
            typeName: "StaticCubemap",
            create: () => new AssetReference(StaticCubemap),
            apply: (gl, param, value) => {
                if (!param.uniformLocation) {
                    return;
                }
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
                if (!param.uniformLocation) {
                    return;
                }
                const singleValue = typeof (value) === "number";
                if (singleValue) {
                    gl.uniform1f(param.uniformLocation, value);
                } else {
                    gl.uniform1fv(param.uniformLocation, value.data);
                }
            }
        },
        "int": {
            typeName: "Number",
            create: () => 0,
            apply: (gl, param, value) => {
                if (!param.uniformLocation) {
                    return;
                }
                const singleValue = typeof (value) === "number";
                if (singleValue) {
                    gl.uniform1i(param.uniformLocation, value);
                } else {
                    gl.uniform1iv(param.uniformLocation, value.data);
                }
            }
        },
        "bool": {
            typeName: "Boolean",
            create: () => false,
            apply: (gl, param, value) => {
                if (!param.uniformLocation) {
                    return;
                }
                const singleValue = typeof (value) === "boolean";
                if (singleValue) {
                    gl.uniform1i(param.uniformLocation, value);
                } else {
                    gl.uniform1iv(param.uniformLocation, value.data);
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
