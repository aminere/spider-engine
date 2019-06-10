
import { AsyncEvent } from "ts-events";
import { IOUtils, AssetChangeAction } from "../io/IOUtils";
import { AsyncUtils } from "../core/AsyncUtils";
import { IFileInternal } from "../io/File/IFile";
import { FolderInternal, Folder } from "../io/Folder";
import { FoldersInternal } from "../io/Folders";
import { EngineError } from "../core/EngineError";

/**
 * @hidden
 */
interface IdToPath {
    [id: string]: string;
}

namespace Private {
    export let idDatabase: IdToPath = {};
    export let defaultAssetIds: IdToPath = {};
    export let externalsIdDatabase: { [externalName: string]: IdToPath } = {};
}

export class AssetIdDatabaseInternal {
    static get fileName() { return "ids.json"; }
    static get path() { return `Assets/${AssetIdDatabaseInternal.fileName}`; }
    static events = {
        assetsDeleted: new AsyncEvent<string[]>(),
        assetMoved: new AsyncEvent<string>()
    };

    static set defaultAssetIds(defaultAssetIds: IdToPath) {
        Private.defaultAssetIds = defaultAssetIds;
        Private.idDatabase = { ...Private.defaultAssetIds };
    }    
    static get idDatabase() {
        return Private.idDatabase;
    }

    static load() {
        return new Promise<void>((resolve, reject) => {
            IFileInternal.instance.read(AssetIdDatabaseInternal.path)
                .then(data => {
                    Private.idDatabase = { ...Private.defaultAssetIds, ...JSON.parse(data) };
                    resolve();
                })
                .catch(() => reject(EngineError.AssetIdsLoadFailed));
        });
    }

    static reload() {
        Private.idDatabase = { ...Private.defaultAssetIds };
        return AssetIdDatabaseInternal.load();
    }

    static getPath(id: string) {
        let path = Private.idDatabase[id];
        if (path) {
            return path;
        }

        if (process.env.CONFIG === "editor") {
            // look into externals                
            for (const external of Object.keys(Private.externalsIdDatabase)) {
                const externalIds = Private.externalsIdDatabase[external];
                path = externalIds[id];
                if (path) {
                    return path;
                }
            }
        }

        return null;
    }

    static setPath(id: string, path: string) {
        Private.idDatabase[id] = path;
        AssetIdDatabaseInternal.save().then(() => {
            IOUtils.recordAssetChange(AssetChangeAction.create, [id]);
        });
    }

    static setPaths(idDatabase: { [id: string]: string }, notify?: boolean) {
        Object.assign(Private.idDatabase, idDatabase);

        const _notify = notify !== undefined ? notify : true;
        if (_notify) {
            AssetIdDatabaseInternal.save().then(() => {
                IOUtils.recordAssetChange(AssetChangeAction.create, Object.keys(idDatabase));
            });
        }
    }

    static save() {
        return IFileInternal.instance.write(
            AssetIdDatabaseInternal.path,
            JSON.stringify(Private.idDatabase, null, 2)
        );
    }

    static deleteId(id: string) {
        delete Private.idDatabase[id];
        AssetIdDatabaseInternal.save().then(() => {
            IOUtils.recordAssetChange(AssetChangeAction.delete, [id]);
        });
        AssetIdDatabaseInternal.events.assetsDeleted.post([id]);
    }

    static deleteIds(ids: String[], notify?: boolean) {
        for (let id of ids) {
            let _id = id.valueOf();
            delete Private.idDatabase[_id];
        }

        const _notify = notify !== undefined ? notify : true;
        if (_notify) {
            let idsAsStringArray = ids.map(i => i.valueOf());
            AssetIdDatabaseInternal.events.assetsDeleted.post(idsAsStringArray);
            AssetIdDatabaseInternal.save().then(() => {
                IOUtils.recordAssetChange(AssetChangeAction.delete, idsAsStringArray);
            });
        }
    }

    static loadExternalIds() {
        Private.externalsIdDatabase = {};
        const externals = FoldersInternal.folders.externals.folders.data;
        return new Promise<void>(resolve => {
            AsyncUtils.processBatch(
                externals,
                (external, success) => {
                    AssetIdDatabaseInternal.addExternalIdDatabase(
                        external.name,
                        FolderInternal.getFolderPath(external)
                    ).then(success);
                },
                () => resolve()
            );
        });
    }

    static addExternalIdDatabase(name: string, path: string) {
        return new Promise(resolve => {
            IFileInternal.instance.read(`${path}/${AssetIdDatabaseInternal.path}`)
                .then(data => {
                    const extenalIds = JSON.parse(data);
                    Private.externalsIdDatabase[name] = extenalIds;
                    resolve();
                })
                .catch(resolve);
        });
    }

    static deleteExternalIds(external: string) {
        delete Private.externalsIdDatabase[external];
    }
}

export class AssetIdDatabase {    
    static getPath(id: string) {
        return AssetIdDatabaseInternal.getPath(id);
    }
}
