import { SerializedObject } from "../../core/SerializableObject";
import { GraphicAsset } from "../GraphicAsset";
import { AsyncEvent } from "ts-events";
import { Visual } from "../Visual";
import { ShaderParams } from "./ShaderUtils";
import { ObjectProps } from "../../core/Types";
import { Vector3 } from "../../math/Vector3";
import { IShadingContext } from "./IShadingContext";
import { Fog } from "../Fog";
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
export declare class Shader extends GraphicAsset {
    get version(): number;
    /**
     * @event
     */
    codeChanged: AsyncEvent<string>;
    get vertexCode(): string;
    get fragmentCode(): string;
    set vertexCode(vertexCode: string);
    set fragmentCode(fragmentCode: string);
    protected _vertexCode: string;
    protected _fragmentCode: string;
    protected _shaderError: boolean;
    private _instances;
    private _executedOnce;
    constructor(props?: ObjectProps<Shader>);
    begin(context?: IShadingContext): boolean;
    beginWithVisual(visual: Visual, bucketId: string, fog?: Fog): ShaderInstance | null;
    applyParam(name: string, value: any, bucketId?: string): void;
    applyReferenceParam(name: string, referred: GraphicAsset, bucketId?: string): void;
    applyReferenceArrayParam(name: string, referreds: GraphicAsset[], bucketId?: string): void;
    applyNumberArrayParam(name: string, numbers: number[], bucketId?: string): void;
    applyVec3ArrayParam(name: string, vecs: Vector3[], bucketId?: string): void;
    graphicUnload(): void;
    invalidate(): void;
    getAttributes(bucketId?: string): ShaderAttributes;
    getUniforms(bucketId?: string): ShaderParams;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    protected loadInstance(instance: ShaderInstance): boolean;
    protected useDirectionalLights(): boolean;
    private createShader;
    private setupInstance;
    private extractAttributes;
    private parseUniforms;
    private getUniform;
    private initializeUniforms;
}
