
import { AsyncEvent } from "ts-events";
import { IOUtils, AssetChangeAction } from "../io/IOUtils";
import { IFileInternal } from "../io/File/IFile";
import { EngineError } from "../core/EngineError";

interface IdToPath {
    [id: string]: string;
}

namespace Private {
    export let idDatabase: IdToPath = {};
    export let defaultAssetIds: IdToPath = {};
}

/**
 * @hidden
 */
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
}

export class AssetIdDatabase {    
    static getPath = (id: string): string | undefined => {
        return Private.idDatabase[id];
    }
}
