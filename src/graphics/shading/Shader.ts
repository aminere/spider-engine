
import * as Attributes from "../../core/Attributes";
import { SerializedObject } from "../../core/SerializableObject";
import { Debug } from "../../io/Debug";
import { GraphicAsset } from "../GraphicAsset";
import { AsyncEvent } from "ts-events";
import { ShaderInjector } from "./ShaderInjector";
import { Visual } from "../Visual";
import { AssetReference } from "../../serialization/AssetReference";
import { ShaderUtils, ShaderParams, ShaderParamType } from "./ShaderUtils";
import { WebGL } from "../WebGL";
import { ObjectProps } from "../../core/Types";
import { AssetReferenceArray } from "../../serialization/AssetReferenceArray";
import { ArrayProperty } from "../../serialization/ArrayProperty";
import { graphicSettings } from "../GraphicSettings";
import { Vector3 } from "../../math/Vector3";
import { IShadingContext } from "./IShadingContext";
 
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
    export const vec3Array = new ArrayProperty(Vector3);

    export function makeInstance() {
        return {
            program: null,

            vertexShader: null,
            vertexCode: null,
            vertexUniforms: null,
            vertexAttribs: null,
            
            fragmentShader: null,
            fragmentCode: null,
            fragmentUniforms: null,

            uniforms: null,
        } as ShaderInstance;
    }

    export function makeDefaultShadingContext() {
        return {
            skinning: false,
            fog: false,
            shadowMap: false,
            vertexColor: false,
            directionalLights: false,
            envMap: false,
            normalMap: false
        } as IShadingContext;
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
    program: WebGLProgram | null;

    vertexShader: WebGLShader | null;
    vertexCode: string | null;
    vertexUniforms: ShaderParams | null;
    vertexAttribs: ShaderAttributes | null;

    fragmentShader: WebGLShader | null;
    fragmentCode: string | null;
    fragmentUniforms: ShaderParams | null;

    uniforms: ShaderParams | null;
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
        this._executedOnce = false;
        this._shaderError = false;
        this._vertexCode = vertexCode;
        Object.values(this._instances).forEach(i => {
            if (i.program) {
                // TODO see if necessary
                WebGL.context.deleteProgram(i.program);
                i.program = null;
            }
            if (i.vertexShader) {
                WebGL.context.deleteShader(i.vertexShader);
                i.vertexShader = null;
            }            
            i.vertexCode = null;
            i.vertexUniforms = null;
            i.vertexAttribs = null;
            i.uniforms = null;
            
        });
    }    
    set fragmentCode(fragmentCode: string) {
        this._executedOnce = false;
        this._shaderError = false;
        this._fragmentCode = fragmentCode;
        Object.values(this._instances).forEach(i => {
            if (i.program) {
                // TODO see if necessary
                WebGL.context.deleteProgram(i.program);
                i.program = null;
            }
            if (i.fragmentShader) {
                WebGL.context.deleteShader(i.fragmentShader);
                i.vertexShader = null;
            }      
            i.fragmentShader = null;
            i.fragmentCode = null;
            i.fragmentUniforms = null;
            i.uniforms = null;
            i.program = null;
        });
    }

    @Attributes.hidden()
    protected _vertexCode!: string;
    @Attributes.hidden()
    protected _fragmentCode!: string;
    @Attributes.unserializable()
    protected _shaderError = false;

    @Attributes.unserializable()
    private _instances = { 0: Private.makeInstance() };

    @Attributes.unserializable()
    private _executedOnce = false;
    
    constructor(props?: ObjectProps<Shader>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    begin(context?: IShadingContext): boolean {
        if (this._executedOnce) {
            if (this._shaderError) {
                return false;
            }
        } else {
            this._executedOnce = true;
        }

        const { program } = this._instances[0];
        if (program) {
            WebGL.context.useProgram(program);
            return true;
        }

        return this.setupInstance(this._instances[0], context ?? Private.makeDefaultShadingContext());
    }
    
    // tslint:disable-next-line
    beginWithVisual(visual: Visual, bucketId: string): ShaderInstance | null {
        if (this._executedOnce) {
            if (this._shaderError) {
                return null;
            }
        } else {
            this._executedOnce = true;
        }

        let instance = this._instances[bucketId];
        if (!instance) {
            instance = Private.makeInstance();
            this._instances[bucketId] = instance;
        }

        if (instance.program) {
            WebGL.context.useProgram(instance.program);
        } else {        

            const context: IShadingContext = {
                skinning: visual.isSkinned,
                fog: visual.receiveFog,
                shadowMap: visual.receiveShadows,
                vertexColor: visual.hasVertexColor,
                directionalLights: this.useDirectionalLights(),
                envMap: Boolean(visual.envMap),
                normalMap: visual.hasNormalMap
            };

            if (!this.setupInstance(instance, context)) {
                return null;
            }
        }

        return instance;
    }

    // tslint:disable-next-line
    applyParam(name: string, value: any, bucketId?: string) {
        const uniform = this.getUniform(name, bucketId);
        if (uniform === undefined) {
            return;
        }
        ShaderUtils.applyShaderParam(WebGL.context, uniform, value);
    }

    applyReferenceParam(name: string, referred: GraphicAsset, bucketId?: string) {
        const uniform = this.getUniform(name, bucketId);
        if (uniform === undefined) {
            return;
        }
        Private.ref.setAssetFast(referred);
        ShaderUtils.applyShaderParam(WebGL.context, uniform, Private.ref);
    }

    applyReferenceArrayParam(name: string, referreds: GraphicAsset[], bucketId?: string) {
        const uniform = this.getUniform(name, bucketId);
        if (uniform === undefined) {
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
        ShaderUtils.applyShaderParam(WebGL.context, uniform, refArray);
    }

    applyNumberArrayParam(name: string, numbers: number[], bucketId?: string) {
        const uniform = this.getUniform(name, bucketId);
        if (uniform === undefined) {
            return;
        }
        Private.numberArray.data = numbers;
        ShaderUtils.applyShaderParam(WebGL.context, uniform, Private.numberArray);
    }

    applyVec3ArrayParam(name: string, vecs: Vector3[], bucketId?: string) {
        const uniform = this.getUniform(name, bucketId);
        if (uniform === undefined) {
            return;
        }
        Private.vec3Array.data = vecs;
        ShaderUtils.applyShaderParam(WebGL.context, uniform, Private.vec3Array);
    }
    
    graphicUnload() {
        Object.values(this._instances).forEach(instance => {
            if (!instance.program) {
                return;
            }
            WebGL.context.deleteShader(instance.vertexShader);
            WebGL.context.deleteShader(instance.fragmentShader);
            WebGL.context.deleteProgram(instance.program);
        });
        this._instances = { 0: Private.makeInstance() };
    }
    
    invalidate() {
        this._executedOnce = false;
        this._shaderError = false;
        this.graphicUnload();
    }
    
    getAttributes(bucketId?: string) {
        return (this._instances[bucketId ?? 0].vertexAttribs) as ShaderAttributes;
    }
    
    getUniforms(bucketId?: string) {
       return (this._instances[bucketId ?? 0].uniforms as ShaderParams) ?? this.initializeUniforms();
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
    
    protected loadInstance(instance: ShaderInstance) {
        const gl = WebGL.context;

        const program = gl.createProgram() as WebGLProgram;
        gl.attachShader(program, instance.vertexShader as WebGLShader);
        gl.attachShader(program, instance.fragmentShader as WebGLShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            Debug.logError(`Shader error in ${this.name}:`);
            Debug.logError(gl.getProgramInfoLog(program) as string);
            this._shaderError = true;
            return false;
        }

        // extract uniform & attribute locations
        gl.useProgram(program);
        if (!instance.uniforms) {
            if (!instance.vertexUniforms) {
                instance.vertexUniforms = this.parseUniforms(instance.vertexCode as string);    
            }
            if (!instance.fragmentUniforms) {
                instance.fragmentUniforms = this.parseUniforms(instance.fragmentCode as string);
            }
            instance.uniforms = { ...instance.vertexUniforms, ...instance.fragmentUniforms };
        }

        let textureStage = 0;
        Object.entries(instance.uniforms as ShaderParams).forEach(([paramName, param]) => {
            const location = gl.getUniformLocation(program, paramName);
            param.uniformLocation = location;
            // console.assert(location !== null, `getUniformLocation(${param}) failed in shader '${this.templatePath}'`);

            if (location === null) {
                return;
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
        });

        if (!instance.vertexAttribs) {
            instance.vertexAttribs = this.extractAttributes(instance.vertexCode as string);
        }

        Object.entries(instance.vertexAttribs).forEach(([attrName, attribute]) => {
            attribute.location = gl.getAttribLocation(program, attrName);
            // console.assert(attribute.location !== null, `getAttribLocation(${attribute}) failed in '${this.templatePath}'`);
        });

        instance.program = program;
        return true;
    }    

    protected useDirectionalLights() {
        return false;
    }

    private createShader(type: number, code: string, logTypeName: string) {
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

    // tslint:disable-next-line
    private setupInstance(instance: ShaderInstance, context: IShadingContext) {
        if (!instance.vertexShader) {
            if (!instance.vertexCode) {
                const code = ShaderUtils.removeComments(this._vertexCode);
                instance.vertexCode = ShaderInjector.doVertexShader(code, context);
            }
            const vertexShader = this.createShader(WebGL.context.VERTEX_SHADER, instance.vertexCode, "vertex");
            if (!vertexShader) {
                this._shaderError = true;
                return false;
            }
            instance.vertexShader = vertexShader;            
        }

        if (!instance.fragmentShader) {
            if (!instance.fragmentCode) {
                const code = ShaderUtils.removeComments(this._fragmentCode);
                instance.fragmentCode = ShaderInjector.doFragmentShader(code, context);
            }
            const fragmentShader = this.createShader(WebGL.context.FRAGMENT_SHADER, instance.fragmentCode, "fragment");
            if (!fragmentShader) {
                this._shaderError = true;
                return false;
            }
            instance.fragmentShader = fragmentShader;
        }        
        return this.loadInstance(instance);
    }

    private extractAttributes(code: string) {
        const regex = /in ((vec|float|uint|int|bool|mat|sampler|samplerCube)+[1234D]*) ([_a-zA-Z0-9]+);/;
        const matches = code.match(new RegExp(regex, "g"));

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

    private parseUniforms(code: string) {
        const regex = /uniform ((vec|float|uint|int|bool|mat|sampler|samplerCube)+[1234D]*) ([_a-zA-Z0-9]+)(\[([_a-zA-Z0-9]+)\])*;/;
        const matches = code.match(new RegExp(regex, "g"));
        if (!matches) {
            return {};
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
            const match = code.match(new RegExp(`#define ${arraySize} ([0-9]+)`));
            if (!match) {
                return undefined;
            }

            const [m, size] = match;
            if (size === undefined) {
                return undefined;
            }

            return parseInt(size, 10);
        };

        const shaderParams: ShaderParams = {};
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

        return shaderParams;
    }

    private getUniform(name: string, bucketId?: string) {
        const instance = (this._instances[bucketId ?? 0] ?? this._instances[0]) as ShaderInstance;
        return (instance.uniforms as ShaderParams)[name];
    }

    private initializeUniforms() {
        const instance = this._instances[0];
        if (!instance.vertexUniforms) {
            instance.vertexUniforms = this.parseUniforms(this._vertexCode);
        }
        if (!instance.fragmentUniforms) {
            instance.fragmentUniforms = this.parseUniforms(this._fragmentCode);
        }
        const uniforms = { ...instance.vertexUniforms, ...instance.fragmentUniforms } as ShaderParams;
        instance.uniforms = uniforms;
        return uniforms;
    }
}
