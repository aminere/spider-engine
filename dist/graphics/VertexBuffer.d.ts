import { Shader, ShaderAttributes } from "./Shader";
import { PrimitiveType } from "./GraphicTypes";
import { ObjectProps } from "../core/Types";
export declare type VertexAttribute = "position" | "uv" | "uv1" | "normal" | "color" | "tangentBinormal" | "skinIndex" | "skinWeight" | "barycentricCoord";
declare type VertexAttributes = {
    [P in VertexAttribute]?: number[];
};
export declare class VertexBuffer {
    vertexCount: number;
    primitiveType: PrimitiveType;
    isDynamic: boolean;
    name: string | undefined;
    attributes: VertexAttributes;
    readonly id: string;
    indices: number[] | undefined;
    private _attributes;
    private _vertexCount;
    private _primitiveType;
    private _metaData;
    private _isLoaded;
    private _id;
    private _isDynamic;
    private _name?;
    private _indices?;
    private _indicesMetaData?;
    constructor(props?: ObjectProps<VertexBuffer>);
    copy(): VertexBuffer;
    setAttribute(attribute: VertexAttribute, data: number[]): void;
    dirtifyAttribute(attribute: VertexAttribute): void;
    updateBufferDatas(gl: WebGLRenderingContext): void;
    begin(gl: WebGLRenderingContext, shader: Shader): void;
    bindBuffers(gl: WebGLRenderingContext): void;
    end(gl: WebGLRenderingContext, shader: Shader): void;
    draw(gl: WebGLRenderingContext): void;
    load(gl: WebGLRenderingContext): void;
    unload(gl: WebGLRenderingContext): void;
    bindAttributes(gl: WebGLRenderingContext, attributes: ShaderAttributes): void;
    unbindAttributes(gl: WebGLRenderingContext, attributes: ShaderAttributes): void;
    hasAttribute(attribute: string): boolean;
    private updateBufferDataIfNecessary;
    private loadBarycentricCoords;
    private hasBarycentricCoords;
}
export interface SerializedVertexBuffer {
    attributes: VertexAttributes;
    vertexCount: number;
    primitiveType: PrimitiveType;
    isDynamic: boolean;
    name?: string;
    indices?: number[];
}
export {};
