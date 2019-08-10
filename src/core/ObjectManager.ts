
import { UniqueObject } from "./UniqueObject";
import { GraphicAsset } from "../graphics/GraphicAsset";
import { Debug } from "../io/Debug";
import { IOUtils, AssetChangeAction } from "../io/IOUtils";
import { Asset } from "../assets/Asset";
import { EngineEvents } from "./EngineEvents";
import { AssetIdDatabase } from "../assets/AssetIdDatabase";
import { IFileInternal } from "../io/File/IFile";
import { IFactoryInternal } from "../serialization/IFactory";
import { IObjectManager, IObjectManagerInternal } from "./IObjectManager";

interface ObjectLoadingCallbacks {        
    loaded: (obj: UniqueObject, fromCache: boolean) => void;
    // tslint:disable-next-line
    error: (err: any) => void;
}

namespace Private {
    export let objectCache: { [path: string]: UniqueObject } = {};
    export const objectLoadingInProgress: { [path: string]: ObjectLoadingCallbacks[] } = {};

    export function loadObjectFromData(path: string, data: string) {
        const json = JSON.parse(data);
        const instance = IFactoryInternal.instance.createObject(json.typeName) as UniqueObject;
        Private.objectCache[path] = instance;

        if (instance.isA(Asset)) {
            (instance as Asset).isPersistent = true;
        }

        instance.templatePath = path;
        return instance.deserialize(json);
    }
}

export namespace ObjectManagerInternal {
    export function loadObject(
            path: string, 
            loaded: (obj: UniqueObject, fromCache: boolean) => void, 
            // tslint:disable-next-line
            error: (err: any) => void,
            ignoreCache: boolean
        ) {
        const existingInstance = Private.objectCache[path];
        if (existingInstance) {
            if (ignoreCache) {
                delete Private.objectCache[path];
            } else {
                loaded(existingInstance, true);
                return;
            }
        }

        const loadingCallbacks: ObjectLoadingCallbacks = { loaded, error };
        const existingCallbacks = Private.objectLoadingInProgress[path];
        if (existingCallbacks) {
            existingCallbacks.push(loadingCallbacks);
            // Object with same path already loading, just queue the callback
            return;
        }
        Private.objectLoadingInProgress[path] = [loadingCallbacks];
        IFileInternal.instance.read(path)
            .then(data => {
                Private.loadObjectFromData(path, data)
                    .then(instance => {
                        // Notify owners
                        for (const pendingCallback of Private.objectLoadingInProgress[path]) {
                            pendingCallback.loaded(instance as UniqueObject, false);
                        }
                        delete Private.objectLoadingInProgress[path];
                    });
            })
            .catch(err => {
                for (const pendingCallback of Private.objectLoadingInProgress[path]) {
                    pendingCallback.error(err);
                }
                delete Private.objectLoadingInProgress[path];
            });
    }

    // tslint:disable-next-line
    export function loadObjectById(id: string, loaded: (obj: UniqueObject, fromCache: boolean) => void, error: () => void) {
        const path = AssetIdDatabase.getPath(id);
        if (path) {
            loadObject(path, loaded, error, false);
        } else {
            error();
        }
    }

    export function loadObjectIgnoreCache(path: string) {
        return new Promise<[UniqueObject, boolean]>((resolve, reject) => {
            loadObject(
                path,
                obj => resolve([obj, false]),
                reject,
                true 
            );
        });
    }

    // For debugging only!
    export const objectCache = () => Private.objectCache;
}

export class ObjectManager implements IObjectManager {
    loadObject(path: string) {
        return new Promise<[UniqueObject, boolean]>((resolve, reject) => {
            ObjectManagerInternal.loadObject(
                path,
                (obj, fromCache) => resolve([obj, fromCache]),
                reject,
                false 
            );
        });
    }
    
    loadObjectById(id: string) {
        return new Promise<[UniqueObject, boolean]>((resolve, reject) => {
            ObjectManagerInternal.loadObjectById(
                id,
                (obj, fromCache) => resolve([obj, fromCache]),
                reject 
            );
        });
    }     

    getObject(id: string) {
        let path = AssetIdDatabase.getPath(id);
        if (path && path in Private.objectCache) {
            return Private.objectCache[path];
        }
        return null;
    }

    // tslint:disable-next-line
    saveObject(obj: UniqueObject) {    
        const id = obj.id;
        const path = AssetIdDatabase.getPath(id);
        if (path) {
            return this.saveObjectAtPath(obj, path);
        } else {
            Debug.log(`Could not save object with id '${id}' (could not resolve its path)`);
            return Promise.reject();
        }
    }
    
    saveObjectAtPath(
        obj: UniqueObject,
        path: string,        
        dontRecordWriteTime?: boolean
    ) {        
        return new Promise<void>((resolve, reject) => {
            const data = JSON.stringify(obj.serialize(), null, 2);
            const saved = () => {
                if (!dontRecordWriteTime) {
                    IOUtils.recordAssetChange(AssetChangeAction.update, [obj.id]);
                }
                EngineEvents.objectSaved.post(obj);
                resolve();
            };        
            IFileInternal.instance.write(path, data)
                .then(saved)
                .catch(reject);
        });        
    }    

    renameObject(oldPath: string, newPath: string) {
        IOUtils.parseFilePath(newPath, (newName, typeName) => {
            if (oldPath in Private.objectCache) {
                // update template path
                const obj = Private.objectCache[oldPath];
                delete Private.objectCache[oldPath];
                obj.templatePath = newPath;
                Private.objectCache[newPath] = obj;
    
                // update name                
                obj.name = newName;
                this.saveObjectAtPath(obj, newPath);
    
            } else {
                IOUtils.parseFilePath(oldPath, (oldName, _typeName) => {
                    if (oldName !== newName) {
                        this.loadObject(newPath)
                            .then(([obj]) => {
                                obj.name = newName;
                                this.saveObjectAtPath(obj, newPath);
                            });
                    }
                });
            }
        });        
    }

    deleteObject(obj: UniqueObject) {        
        obj.destroy();
        if (obj.templatePath) {
            delete Private.objectCache[obj.templatePath];
        }
    }

    deleteObjectById(id: string) {
        const path = AssetIdDatabase.getPath(id);
        if (path) {
            this.deleteObjectByPath(path);
        }
    }

    deleteObjectByPath(path: string) {
        const obj = Private.objectCache[path];
        if (obj) {
            this.deleteObject(obj);
            delete Private.objectCache[path];
        }     
    }

    loadGraphicObjects() {
        for (const obj of Object.values(Private.objectCache)) {
            if (obj.isA(GraphicAsset)) {
                (obj as GraphicAsset).graphicLoad();
            }
        }
    }

    unloadGraphicObjects() {
        for (const obj of Object.values(Private.objectCache)) {
            if (obj.isA(GraphicAsset)) {
                (obj as GraphicAsset).graphicUnload();
            }
        }
    }

    addToCache(obj: UniqueObject) {
        // This is typically used by the editor to cache objects right after their creation using createAsset()
        // if the instance just created is immediatly passed around as a reference, and is not in cache
        // then the next call to loadObject() will create a duplicate instance.
        // TODO improve this!!
        const path = obj.templatePath as string;
        console.assert(path);
        console.assert(!(path in Private.objectCache));
        Private.objectCache[path] = obj;
    }

    clearCache() {
        for (const obj of Object.values(Private.objectCache)) {
            obj.destroy();
        }
        Private.objectCache = {};
    }

    forEach(handler: (obj: UniqueObject) => void) {
        for (const obj of Object.values(Private.objectCache)) {
            handler(obj);
        }
    }    
}

/**
 * @hidden
 */
export namespace ObjectManagerInternal {
    export function create() {
        IObjectManagerInternal.instance = new ObjectManager();
    }
}
