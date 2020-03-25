import { BlendingModes, RenderPass, CullModes } from "./GraphicTypes";
import { Asset } from "../assets/Asset";
import { Shader } from "./shading/Shader";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { GraphicAsset } from "./GraphicAsset";
import { ShaderParamInstanceType } from "./shading/ShaderUtils";
import { IShadingContext } from "./shading/IShadingContext";
/**
 * @hidden
 */
export declare namespace MaterialInternal {
    const shaderPropertyKey = "_shader";
    const shaderParamsPropertyKey: string;
}
interface MaterialProps {
    shader?: Shader;
    shaderParams?: {
        [name: string]: ShaderParamInstanceType;
    };
    priority?: number;
    blending?: BlendingModes;
    renderPass?: RenderPass;
    cullMode?: CullModes;
    depthTest?: boolean;
}
export declare class Material extends Asset {
    get version(): number;
    get shader(): Shader | null;
    get blending(): BlendingModes;
    get renderPass(): RenderPass;
    get cullMode(): CullModes;
    get priority(): number;
    get shaderParams(): SerializableObject;
    get depthTest(): boolean;
    set shader(shader: Shader | null);
    set renderPass(renderPass: RenderPass);
    set priority(priority: number);
    set blending(blending: BlendingModes);
    set cullMode(cullMode: CullModes);
    set depthTest(depthTest: boolean);
    set shaderParams(paramDefinitions: SerializableObject);
    get buckedId(): string;
    private _blending;
    private _renderPass;
    private _cullMode;
    private _depthTest;
    private _priority;
    private _shaderParams;
    private _shader;
    private _bucketId;
    constructor(props?: MaterialProps);
    begin(context?: IShadingContext): boolean;
    uploadState(): void;
    destroy(): void;
    isLoaded(): boolean;
    queueParameter(name: string, value: any): void;
    queueReferenceParameter(name: string, referred: GraphicAsset): void;
    getParameter(name: string): any;
    applyParameter(name: string, value: any): void;
    applyReferenceParameter(name: string, referred: GraphicAsset): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private onShaderCodeChanged;
    private onShaderChanged;
    private updateRuntimeAccessors;
    private updateParamsFromShader;
}
export {};
