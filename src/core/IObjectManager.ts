
import { UniqueObject } from "./UniqueObject";

export interface IObjectManager {
    loadObject: (path: string) => Promise<[UniqueObject, boolean]>;
    loadObjectById: (id: string) => Promise<[UniqueObject, boolean]>;
    getObject: (id: string) => UniqueObject | null;
    saveObject: (obj: UniqueObject) => Promise<void>;
    saveObjectAtPath: (obj: UniqueObject, path: string, recordWriteTime?: boolean) => Promise<void>;
    renameObject: (oldPath: string, newPath: string) => void;
    deleteObject: (obj: UniqueObject) => void;
    deleteObjectByPath: (path: string) => void;
    deleteObjectById: (id: string) => void;
    loadGraphicObjects: () => void;
    unloadGraphicObjects: () => void;
    clearCache: () => void;
    addToCache: (obj: UniqueObject) => void;
    forEach: (handler: (obj: UniqueObject) => void) => void;
}

namespace Private {
    export let instance: IObjectManager;
}

export class IObjectManagerInternal {
    static set instance(instance: IObjectManager) {
        Private.instance = instance;
    }
    static get instance() {
        return Private.instance;
    }
}
