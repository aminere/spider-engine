
import { UniqueObject } from "../core/UniqueObject";
import { Folder } from "./Folder";
import { ObjectManagerInternal } from "../core/ObjectManager";
import { IObjectManagerInternal } from "../core/IObjectManager";

export class Folders extends UniqueObject {
    assets: Folder;
    externals: Folder;

    constructor() {
        super();
        this.assets = new Folder();
        this.externals = new Folder();
    }
}

export namespace FoldersInternal {
    export let folders: Folders;
    export const foldersPath = "Assets/folders.json";
    export const externalsPath = "External Assets";

    export function load() {
        return new Promise<[Folders, boolean]>(resolve => {
            ObjectManagerInternal.loadObjectIgnoreCache(foldersPath)
                .then(tuple => {
                    folders = tuple[0] as Folders;
                    folders.assets.assignParentNodes();
                    folders.externals.assignParentNodes();
                    resolve([folders, false]);
                })
                .catch(() => {
                    folders = new Folders();
                    folders.assets.name = "Assets";
                    folders.externals.name = externalsPath;
                    if (process.env.PLATFORM === "electron") {
                        // build folder database from folder structure on disk, in the data folder                        
                    }
                    save().then(() => resolve([folders, true]));
                });
        });
    }

    export function save() {
        return IObjectManagerInternal.instance.saveObjectAtPath(folders, foldersPath);
    }
}
