import { Shader, ShaderAttributes } from "./shading/Shader";
import { PrimitiveType } from "./GraphicTypes";
import { ObjectProps } from "../core/Types";
export declare type VertexAttribute = "position" | "uv" | "uv2" | "uv3" | "uv4" | "normal" | "tangents" | "color" | "skinIndex" | "skinWeight" | "barycentricCoord";
declare type VertexAttributes = {
    [P in VertexAttribute]?: number[];
};
export declare class VertexBuffer {
    set vertexCount(count: number);
    get vertexCount(): number;
    set primitiveType(type: PrimitiveType);
    get primitiveType(): PrimitiveType;
    set isDynamic(dynamic: boolean);
    get isDynamic(): boolean;
    set name(name: string | undefined);
    get name(): string | undefined;
    get attributes(): VertexAttributes;
    set attributes(attributes: VertexAttributes);
    get id(): string;
    get indices(): number[] | undefined;
    set indices(indices: number[] | undefined);
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
    updateBufferDatas(): void;
    begin(shader: Shader): void;
    bindBuffers(): void;
    end(shader: Shader): void;
    draw(): void;
    load(): void;
    unload(): void;
    bindAttributes(attributes: ShaderAttributes): void;
    unbindAttributes(attributes: ShaderAttributes): void;
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
