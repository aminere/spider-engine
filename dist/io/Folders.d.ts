import { UniqueObject } from "../core/UniqueObject";
import { Folder } from "./Folder";
export declare class Folders extends UniqueObject {
    assets: Folder;
    externals: Folder;
    constructor();
}
/**
 * @hidden
 */
export declare namespace FoldersInternal {
    let folders: Folders;
    const foldersPath = "Assets/folders.json";
    const externalsPath = "External Assets";
    function load(): Promise<[Folders, boolean]>;
    function save(): Promise<void>;
}
