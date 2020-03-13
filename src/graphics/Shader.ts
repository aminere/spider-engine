
import * as Attributes from "../core/Attributes";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Debug } from "../io/Debug";
import { GraphicAsset } from "./GraphicAsset";
import { AsyncEvent } from "ts-events";
import { ShaderCodeInjector } from "./ShaderCodeInjector";
import { Visual } from "./Visual";
import { AssetReference } from "../serialization/AssetReference";
import { ShaderUtils, ShaderParams, ShaderParamType } from "./ShaderUtils";
import { WebGL } from "./WebGL";
import { ObjectProps } from "../core/Types";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { graphicSettings } from "./GraphicSettings";

namespace Private {
    export const attributeTypeToComponentCount = {
        float: 1,
        vec2: 2,
        vec3: 3,
        vec4: 4
    };
    export const ref = new AssetReference(GraphicAsset);
    export const refArray = new AssetReferenceArray(GraphicAsset);
    export const numberArray = new ArrayProperty(Number);    

    export function removeComments(code: string) {
        return code.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, "");
    }    
}

export interface ShaderAttribute {
    location: number;
    componentCount: number;
}

export interface ShaderAttributes {
    [name: string]: ShaderAttribute;
}

export interface ShaderInstance {
    attributes: ShaderAttributes | null;
    params: ShaderParams | null; // uniforms
    program: WebGLProgram | null;
    vertexShader: WebGLShader | null;
    fragmentShader: WebGLShader | null;
}

interface ShaderInstances {
    [bucketId: string]: ShaderInstance;
}

@Attributes.creatable(true)
@Attributes.referencable(true)
@Attributes.hasDedicatedEditor(true)
export class Shader extends GraphicAsset {
    
    get version() { return 3; }

    /**
     * @event
     */
    @Attributes.unserializable()
    codeChanged = new AsyncEvent<string>();
    
    get vertexCode() { return this._vertexCode; }    
    get fragmentCode() { return this._fragmentCode; }
    set vertexCode(vertexCode: string) {
        this._vertexCode = vertexCode;
        this.invalidateProgram();
        this.tryExtractUniforms();
    }    
    set fragmentCode(fragmentCode: string) {
        this._fragmentCode = fragmentCode;
        this.invalidateProgram();
        this.tryExtractUniforms();
    }

    @Attributes.hidden()
    protected _vertexCode!: string;
    @Attributes.hidden()
    protected _fragmentCode!: string;
    @Attributes.unserializable()
    protected _shaderError = false;

    @Attributes.unserializable()
    private _instances: ShaderInstances = {
        0: {
            attributes: null,
            params: null,
            program: null,
            vertexShader: null,
            fragmentShader: null
        }
    };

    @Attributes.unserializable()
    private _executedOnce = false;
    
    constructor(props?: ObjectProps<Shader>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    beginWithParams(materialParams: SerializableObject): boolean {
        if (!this.begin()) {
            return false;
        }

        // Apply shader params
        for (const param of Object.keys(materialParams)) {
            this.applyParam(param, materialParams[param]);
        }

        return true;
    }

    begin(): boolean {
        if (this._executedOnce) {
            if (this._shaderError) {
                return false;
            }
        } else {
            this._executedOnce = true;
        }
        const gl = WebGL.context;
        const program = this._instances[0].program;
        if (!program) {
            const vertexCode = ShaderCodeInjector.doVertexShader(this._vertexCode);
            const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexCode, "vertex");
            if (!vertexShader) {
                this._shaderError = true;
                return false;
            }
            const fragmentCode = ShaderCodeInjector.doFragmentShader(this._fragmentCode);
            const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentCode, "fragment");
            if (!fragmentShader) {
                this._shaderError = true;
                return false;
            }
            if (!this.loadInstance(gl, this._instances[0], vertexShader, fragmentShader, vertexCode, fragmentCode)) {
                return false;
            }
        } else {
            gl.useProgram(this._instances[0].program);
        }
        return true;
    }
    
    beginWithVisual(visual: Visual): ShaderInstance | null {
        if (this._executedOnce) {
            if (this._shaderError) {
                return null;
            }
        } else {
            this._executedOnce = true;
        }
        const bucketId = visual.bucketId;
        let instance = this._instances[bucketId];
        if (!instance) {
            instance = {
                program: null,
                vertexShader: null,
                fragmentShader: null,
                attributes: null,
                params: null
            };
            this._instances[bucketId] = instance;
        }
        const gl = WebGL.context;
        if (!instance.program) {
            if (!this.setupInstance(instance, gl, visual)) {
                return null;
            }
        } else {
            gl.useProgram(instance.program);
        }
        return instance;
    }

    // tslint:disable-next-line
    applyParam(name: string, value: any, bucketId?: string) {
        const instance = this._instances[bucketId || 0];
        const params = (instance ? instance.params : this._instances[0].params) as ShaderParams;
        const param = params[name];
        if (param === undefined) {
            return;
        }
        ShaderUtils.applyShaderParam(WebGL.context, param, value);
    }

    applyReferenceParam(name: string, referred: GraphicAsset, bucketId?: string) {
        const instance = this._instances[bucketId || 0];
        const params = (instance ? instance.params : this._instances[0].params) as ShaderParams;
        const param = params[name];
        if (param === undefined) {
            return;
        }
        Private.ref.setAssetFast(referred);
        ShaderUtils.applyShaderParam(WebGL.context, param, Private.ref);
    }

    applyReferenceArrayParam(name: string, referreds: GraphicAsset[], bucketId?: string) {
        const instance = this._instances[bucketId || 0];
        const params = (instance ? instance.params : this._instances[0].params) as ShaderParams;
        const param = params[name];
        if (param === undefined) {
            return;
        }
        const { refArray } = Private;
        let currentRef = 0;
        for (let i = 0; i < referreds.length && i < refArray.data.length; ++i) {
            refArray.data[i].setAssetFast(referreds[i]);
            ++currentRef;
        }
        for (let i = currentRef; i < referreds.length; ++i) {
            refArray.grow(referreds[i]);
            ++currentRef;
        }
        refArray.data.length = currentRef;
        ShaderUtils.applyShaderParam(WebGL.context, param, refArray);
    }

    applyNumberArrayParam(name: string, numbers: number[], bucketId?: string) {
        const instance = this._instances[bucketId || 0];
        const params = (instance ? instance.params : this._instances[0].params) as ShaderParams;
        const param = params[name];
        if (param === undefined) {
            return;
        }
        Private.numberArray.data = numbers;
        ShaderUtils.applyShaderParam(WebGL.context, param, Private.numberArray);
    }
    
    // tslint:disable-next-line
    setProperty(property: string, value: any) {
        super.setProperty(property, value);
        if (property === "_fragmentCode") {
            if (this._vertexCode) {
                this._instances[0].params = this.extractUniforms(this._vertexCode, this._fragmentCode);
            }
        } else if (property === "_vertexCode") {
            if (this._fragmentCode) {
                this._instances[0].params = this.extractUniforms(this._vertexCode, this._fragmentCode);
            }
        }
    }
    
    graphicUnload() {
        for (const instance of Object.values(this._instances)) {
            const { program } = instance;
            if (!program) {
                continue;
            }
            const gl = WebGL.context;
            gl.deleteShader(instance.vertexShader);
            gl.deleteShader(instance.fragmentShader);
            gl.deleteProgram(program);
            instance.vertexShader = null;
            instance.fragmentShader = null;
            instance.program = null;
            instance.params = null;
            instance.attributes = null;
        }
    }
    
    invalidateProgram() {
        this._executedOnce = false;
        this._shaderError = false;
        this.graphicUnload();
    }
    
    getAttributes(bucketId?: string) {
        return (this._instances[bucketId || 0].attributes) as ShaderAttributes;
    }
    
    getParams(bucketId?: string) {
        return (this._instances[bucketId || 0].params) as ShaderParams;
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                _vertexCode: {
                    typeName: "String",
                    data: json.properties._vertexCode
                },
                _fragmentCode: {
                    typeName: "String",
                    data: json.properties._fragmentCode
                }
            });
        } else if (previousVersion === 2) {
            // Convert to GLSL 300
            const varyings = new RegExp(/varying (vec3|vec2|vec4|float) ([a-zA-Z]+)/, "g");
            const samplers = new RegExp(/texture(2D|Cube)/, "g");
            const convertVertex = (str: string) => {
                return str
                    .replace(varyings, (x, type, attrName) => `out ${type} ${attrName}`)
                    .replace(samplers, () => "texture")
                    .replace(
                        /attribute (vec3|vec2|vec4) ([a-zA-Z]+)/g,
                        (x, type, attrName) => `in ${type} ${attrName}`
                    );
            };
            const convertFragment = (str: string) => {
                return str
                    .replace(varyings, (x, type, attrName) => `in ${type} ${attrName}`)
                    .replace(samplers, () => "texture")
                    .replace(/gl_FragColor/g, "fragColor")
                    .replace(
                        /void main/,
                        `out vec4 fragColor;
void main`
                    );
            };
            Object.assign(json.properties._vertexCode, {
                data: convertVertex(json.properties._vertexCode.data)
            });
            Object.assign(json.properties._fragmentCode, {
                data: convertFragment(json.properties._fragmentCode.data)
            });
        }
        return json;
    }
    
    protected loadInstance(
        gl: WebGLRenderingContext,
        instance: ShaderInstance,
        vertexShader: WebGLShader,
        fragmentShader: WebGLShader,
        vertexCode: string,
        fragmentCode: string
    ) {
        const program = gl.createProgram() as WebGLProgram;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            Debug.logError(`Shader error in ${this.name}:`);
            Debug.logError(gl.getProgramInfoLog(program) as string);
            this._shaderError = true;
            return false;
        }

        // extract uniform & attribute locations
        gl.useProgram(program);
        if (!instance.params) {
            instance.params = this.extractUniforms(vertexCode, fragmentCode);
        }

        let textureStage = 0;
        for (const paramName of Object.keys(instance.params)) {
            const param = instance.params[paramName];
            const location = gl.getUniformLocation(program, paramName);            
            param.uniformLocation = location;
            // console.assert(location !== null, `getUniformLocation(${param}) failed in shader '${this.templatePath}'`);

            if (location === null) {
                continue;
            }

            // setup texture stages
            const textureUniform = param.type.match(/sampler/);
            if (textureUniform) {
                const { arraySize } = param;
                if (arraySize !== undefined) {
                    param.textureStage
                        = Array.from(new Array(arraySize)).map(() => textureStage++);
                } else {
                    param.textureStage = textureStage++;
                }
            }
        }

        if (!instance.attributes) {
            instance.attributes = this.extractAttributes(vertexCode);
        }        
        for (const attribute of Object.keys(instance.attributes)) {
            const location = gl.getAttribLocation(program, attribute);
            instance.attributes[attribute].location = location;
            // console.assert(location !== null, `getAttribLocation(${attribute}) failed in shader '${this.templatePath}'`);
        }
        instance.vertexShader = vertexShader;
        instance.fragmentShader = fragmentShader;
        instance.program = program;
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
            visual.hasVertexColor
        );
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentCode, "fragment");
        if (!fragmentShader) {
            this._shaderError = true;
            return false;
        }
        return this.loadInstance(gl, instance, vertexShader, fragmentShader, vertexCode, fragmentCode);
    }

    protected createShader(type: number, code: string, logTypeName: string) {
        const gl = WebGL.context;
        const shader = gl.createShader(type) as WebGLShader;
        gl.shaderSource(shader, code);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            Debug.log(`Shader error in ${this.name}.${logTypeName}:`);
            Debug.log(gl.getShaderInfoLog(shader) as string);
            return null;
        }

        return shader;
    }

    private extractAttributes(code: string) {
        const regex = /in ((vec|float|uint|int|bool|mat|sampler|samplerCube)+[1234D]*) ([_a-zA-Z0-9]+);/;
        const matches = Private.removeComments(code).match(new RegExp(regex, "g"));

        const attributes: ShaderAttributes = {};
        if (!matches) {
            return attributes;
        }
        
        for (const match of matches) {
            const [m, type, n, name] = match.match(regex) as RegExpMatchArray;
            if (type && name) {
                const componentCount = Private.attributeTypeToComponentCount[type];
                if (componentCount !== undefined) {
                    attributes[name] = {
                        location: -1,
                        componentCount: componentCount
                    };
                } else {
                    Debug.logWarning(`Unsupported type: '${type}' for shader attribute '${name}', ignoring this attribute.`);
                }
            } else {
                Debug.logWarning(`Invalid shader attribute syntax: '${match[0]}', ignoring this attribute.`);
            }
        }
        return attributes;
    }

    private extractUniforms(vertexCode: string, fragmentCode: string) {
        const shaderParams: ShaderParams = {};
        this.parseUniforms(vertexCode, shaderParams);
        this.parseUniforms(fragmentCode, shaderParams);
        return shaderParams;
    }

    private parseUniforms(code: string, shaderParams: ShaderParams) {
        const regex = /uniform ((vec|float|uint|int|bool|mat|sampler|samplerCube)+[1234D]*) ([_a-zA-Z0-9]+)(\[([_a-zA-Z0-9]+)\])*;/;
        const _code = Private.removeComments(code);
        const matches = _code.match(new RegExp(regex, "g"));
        if (!matches) {
            return;
        }

        const parseArraySize = (arraySize?: string): number | undefined => {
            if (arraySize === undefined) {
                return undefined;
            }

            const i = parseInt(arraySize, 10);
            if (`${i}` === arraySize) {
                return i;
            }

            if (arraySize in graphicSettings.shaderDefinitions) {
                return graphicSettings.shaderDefinitions[arraySize]();
            }

            // Size is a string literal, check it it's defined somewhere
            const match = code.match(/#define [_a-zA-Z]+ ([0-9]+)/);
            if (!match) {
                return undefined;
            }

            const [m, size] = match;
            if (size === undefined) {
                return undefined;
            }

            return parseInt(size, 10);
        };

        const registerDefaultParam = (name: string, type: string, arraySize?: number) => {
            shaderParams[name] = {
                type: type as ShaderParamType,
                uniformLocation: null,
                arraySize
            };
        };

        for (const match of matches) {
            const [m, type, n, name, a, arraySize] = match.match(regex) as RegExpMatchArray;
            // save shader param
            if (type && name) {
                if (Boolean(arraySize)) {
                    const _arraySize = parseArraySize(arraySize) as number;
                    if (type === "sampler2D") {
                        shaderParams[name] = {
                            type: "sampler2DArray",
                            uniformLocation: null,
                            arraySize: _arraySize
                        };
                    } else if (type === "mat4") {
                        for (let i = 0; i < _arraySize; ++i) {
                            const paramName = `${name}[${i}]`;
                            shaderParams[paramName] = {
                                type: type as ShaderParamType,
                                uniformLocation: null
                            };
                        }
                    } else {
                        registerDefaultParam(name, type, _arraySize);
                    }
                } else {
                    registerDefaultParam(name, type);
                }
            } else {
                Debug.logWarning(`Invalid shader uniform syntax: '${match[0]}', ignoring this uniform.`);
            }
        }
    }

    private tryExtractUniforms() {
        if (this._vertexCode && this._fragmentCode) {
            this._instances[0].params = this.extractUniforms(this._vertexCode, this._fragmentCode);
        }
    }
}
