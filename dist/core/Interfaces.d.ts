import { IRenderer } from "../graphics/IRenderer";
import { IFactory } from "../serialization/IFactory";
import { IFile } from "../io/File/IFile";
import { ISerializer } from "../serialization/ISerializer";
import { IObjectManager } from "./IObjectManager";
export declare class Interfaces {
    static get renderer(): IRenderer;
    static get factory(): IFactory;
    static get file(): IFile;
    static get serializer(): ISerializer;
    static get objectManager(): IObjectManager;
}
