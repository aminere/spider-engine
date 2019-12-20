import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { GraphicAsset } from "./GraphicAsset";
import { AsyncEvent } from "ts-events";
import { Visual } from "./Visual";
import { ShaderParams } from "./ShaderUtils";
import { ObjectProps } from "../core/Types";
export interface ShaderAttribute {
    location: number;
    componentCount: number;
}
export interface ShaderAttributes {
    [name: string]: ShaderAttribute;
}
export interface ShaderInstance {
    attributes: ShaderAttributes | null;
    params: ShaderParams | null;
    program: WebGLProgram | null;
    vertexShader: WebGLShader | null;
    fragmentShader: WebGLShader | null;
}
export declare class Shader extends GraphicAsset {
    readonly version: number;
    /**
     * @event
     */
    codeChanged: AsyncEvent<string>;
    vertexCode: string;
    fragmentCode: string;
    protected _vertexCode: string;
    protected _fragmentCode: string;
    protected _shaderError: boolean;
    protected _usedTextureStages: number;
    private _instances;
    private _executedOnce;
    constructor(props?: ObjectProps<Shader>);
    beginWithParams(materialParams: SerializableObject): boolean;
    begin(): boolean;
    beginWithVisual(visual: Visual): ShaderInstance | null;
    applyParam(name: string, value: any, bucketId?: string): void;
    applyReferenceParam(name: string, referred: GraphicAsset, bucketId?: string): void;
    applyReferenceArrayParam(name: string, referreds: GraphicAsset[], bucketId?: string): void;
    applyNumberArrayParam(name: string, numbers: number[], bucketId?: string): void;
    setProperty(property: string, value: any): void;
    graphicUnload(): void;
    invalidateProgram(): void;
    getAttributes(bucketId?: string): ShaderAttributes;
    getParams(bucketId?: string): ShaderParams;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    protected loadInstance(gl: WebGLRenderingContext, instance: ShaderInstance, vertexShader: WebGLShader, fragmentShader: WebGLShader, vertexCode: string, fragmentCode: string): boolean;
    protected setupInstance(instance: ShaderInstance, gl: WebGLRenderingContext, visual: Visual): boolean;
    protected createShader(type: number, code: string, logTypeName: string): WebGLShader | null;
    private extractAttributes;
    private extractUniforms;
    private parseUniforms;
}
