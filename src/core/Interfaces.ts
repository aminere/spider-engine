
import { IRendererInternal, IRenderer } from "../graphics/IRenderer";
import { IFactoryInternal, IFactory } from "../serialization/IFactory";
import { IFileInternal, IFile } from "../io/File/IFile";
import { ISerializerInternal, ISerializer } from "../serialization/ISerializer";
import { IObjectManagerInternal, IObjectManager } from "./IObjectManager";

export class Interfaces {
    static get renderer(): IRenderer { return IRendererInternal.instance; }
    static get factory(): IFactory { return IFactoryInternal.instance; }
    static get file(): IFile { return IFileInternal.instance; }
    static get serializer(): ISerializer { return ISerializerInternal.instance; }
    static get objectManager(): IObjectManager { return IObjectManagerInternal.instance; }
}
