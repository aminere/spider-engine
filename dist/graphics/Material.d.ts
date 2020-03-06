import { BlendingModes, RenderPass, CullModes } from "./GraphicTypes";
import { Asset } from "../assets/Asset";
import { Shader } from "./Shader";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { GraphicAsset } from "./GraphicAsset";
import { ShaderParamInstanceType } from "./ShaderUtils";
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
    set blending(blending: BlendingModes);
    set renderPass(renderPass: RenderPass);
    set cullMode(cullMode: CullModes);
    set priority(priority: number);
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
    constructor(props?: MaterialProps);
    begin(): boolean;
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
}
export {};
