import { Debug } from "./Debug";
import { EngineError } from "../core/EngineError";

namespace Private {
    export let database: IDBDatabase;
}

export class IndexedDb {

    static initialize(dbName: string, version: number) {
        return new Promise<void>((resolve, reject) => {
            // tslint:disable-next-line
            const { indexedDB, mozIndexedDB, webkitIndexedDB, msIndexedDB } = window as any;
            const dbFactory: IDBFactory = indexedDB || mozIndexedDB || webkitIndexedDB || msIndexedDB;
            if (!dbFactory) {
                reject(EngineError.IndexedDbCreationFailed);
                return;
            }
            const request = dbFactory.open(dbName, version);
            request.onupgradeneeded = e => {
                const db = request.result;
                if (db.objectStoreNames.contains("files") === false) {
                    db.createObjectStore("files");
                }
            };
            request.onsuccess = e => {
                Private.database = request.result;
                resolve();
            };
            request.onerror = e => reject(EngineError.IndexedDbCreationFailed);
        });
    }

    static read(store: string, key: string) {
        // tslint:disable-next-line
        return new Promise<any>((resolve, reject) => {
            const transaction = Private.database.transaction([store], "readonly");
            const objectStore = transaction.objectStore(store);
            if (process.env.NODE_ENV === "development") {
                // Debug.log(`Reading '${key}'`);
            }
            const request = objectStore.get(key);
            request.onsuccess = e => {
                if (request.result) {
                    // Debug.log(`Read Success (${key}), data: '${0}'`);
                    resolve(request.result);
                } else {
                    if (process.env.NODE_ENV === "development") {
                        Debug.logError(`Read Error (${key})`);
                    }
                    reject(request.result);
                }
            };
            request.onerror = e => reject(request.result);
        });
    }

    // tslint:disable-next-line
    static write(store: string, key: string, data: any) {
        return new Promise<void>((resolve, reject) => {
            const transaction = Private.database.transaction([store], "readwrite");
            const objectStore = transaction.objectStore(store);
            if (process.env.NODE_ENV === "development") {
                // Debug.log(`Writing '${key}', data: '${0}'`);
            }
            const request = objectStore.put(data, key);
            request.onsuccess = e => {
                // Debug.log(`Write Success (${key})`);
                resolve();
            };
            request.onerror = e => {
                Debug.logError(`Write Error (${key})`);
                reject(request.result);
            };
        });
    }
    
    static delete(store: string, key: string) {
        return new Promise<void>((resolve, reject) => {
            const transaction = Private.database.transaction([store], "readwrite");
            const objectStore = transaction.objectStore(store);
            const request = objectStore.delete(key);
            request.onsuccess = e => resolve();
            request.onerror = e => reject(request.result);
        });
    }

    static clear(store: string) {
        return new Promise<void>((resolve, reject) => {
            Debug.log(`Indexed db clear all..`);
            const transaction = Private.database.transaction([store], "readwrite");
            const objectStore = transaction.objectStore(store);
            const request = objectStore.clear();
            request.onsuccess = e => {
                Debug.log(`Indexed db cleared.`);
                resolve();
            };
            request.onerror = e => {
                Debug.logError(`Could not clear the Indexed db.`);
                reject();
            };
        });
    }
}
