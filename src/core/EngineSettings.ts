
import { UniqueObject } from "./UniqueObject";
import { SerializedObject } from "./SerializableObject";
import { IObjectManagerInternal } from "./IObjectManager";
import { EngineError } from "./EngineError";
import { AssetIdDatabase } from "../assets/AssetIdDatabase";

/**
 * @hidden
 */
export namespace EngineSettingsInternal {
    export const path = "spider-engine.json";
}

export class EngineSettings extends UniqueObject {

    private static _instance: EngineSettings;
    
    get version() { return 3; }

    canvasAlpha = true;
    startupScene?: string = undefined; // must be assigned for deserializer to write into it.
    useCustomDefaultAssets?: boolean = undefined;

    static load() {
        return new Promise<void>((resolve, reject) => {
            IObjectManagerInternal.instance.loadObject(EngineSettingsInternal.path)
                .then(([settings]) => {
                    this._instance = settings as EngineSettings;
                    resolve();
                })
                .catch(() => {
                    if (process.env.CONFIG === "editor") {
                        reject(EngineError.EngineSettingsLoadFailed);
                    } else {
                        // create fresh settings
                        this._instance = new EngineSettings(); 
                        // tslint:disable-next-line
                        console.warn("spider-engine.json not found. Falling back to factory settings.");
                        resolve();
                    }
                });
        });
    }

    static get instance() {
        return this._instance;
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            delete json.properties.startupScenePath;
        } else if (previousVersion === 2) {
            console.assert(process.env.CONFIG === "editor");
            Object.assign(json.properties, { 
                // tslint:disable-next-line
                startupScene: AssetIdDatabase.getPath((json.properties as any).startupSceneId) 
            });
            console.assert(json.properties.startupScene);
            delete json.properties.startupSceneId;
        }
        return json;
    }

    save() {        
        IObjectManagerInternal.instance.saveObjectAtPath(this, EngineSettingsInternal.path);
    }
}
