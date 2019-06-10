import { IRenderer } from "../graphics/IRenderer";
import { IFactory } from "../serialization/IFactory";
import { IFile } from "../io/File/IFile";
import { ISerializer } from "../serialization/ISerializer";
import { IObjectManager } from "./IObjectManager";
export declare class Interfaces {
    static readonly renderer: IRenderer;
    static readonly factory: IFactory;
    static readonly file: IFile;
    static readonly serializer: ISerializer;
    static readonly objectManager: IObjectManager;
}
