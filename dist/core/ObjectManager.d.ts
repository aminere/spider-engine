import { UniqueObject } from "./UniqueObject";
import { IObjectManager } from "./IObjectManager";
export declare namespace ObjectManagerInternal {
    function loadObject(path: string, loaded: (obj: UniqueObject, fromCache: boolean) => void, error: (err: any) => void, ignoreCache: boolean): void;
    function loadObjectFromData(path: string, data: string): import("./SerializableObject").SerializableObject | Promise<import("./SerializableObject").SerializableObject>;
    function loadObjectById(id: string, loaded: (obj: UniqueObject, fromCache: boolean) => void, error: () => void): void;
    function loadObjectIgnoreCache(path: string): Promise<[UniqueObject, boolean]>;
    const objectCache: () => {
        [path: string]: UniqueObject;
    };
}
export declare class ObjectManager implements IObjectManager {
    loadObject(path: string): Promise<[UniqueObject, boolean]>;
    loadObjectById(id: string): Promise<[UniqueObject, boolean]>;
    getObject(path: string): UniqueObject;
    getObjectById(id: string): UniqueObject | null;
    saveObject(obj: UniqueObject): Promise<void>;
    saveObjectAtPath(obj: UniqueObject, path: string, recordWriteTime?: boolean): Promise<void>;
    renameObject(oldPath: string, newPath: string): void;
    deleteObject(obj: UniqueObject): void;
    deleteObjectById(id: string): void;
    deleteObjectByPath(path: string): void;
    loadGraphicObjects(): void;
    unloadGraphicObjects(): void;
    addToCache(obj: UniqueObject): void;
    clearCache(): void;
    forEach(handler: (obj: UniqueObject) => void): void;
}
/**
 * @hidden
 */
export declare namespace ObjectManagerInternal {
    function create(): void;
}
