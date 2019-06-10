import { UniqueObject } from "../core/UniqueObject";
import { ArrayProperty } from "../serialization/ArrayProperty";
export declare class Folder extends UniqueObject {
    ids: ArrayProperty<String>;
    folders: ArrayProperty<Folder>;
    parent?: Folder;
    assetVersion: number;
    isAncestor(potentialAncestor: Folder): boolean;
    findFolder(name: string): Folder | undefined;
    assignParentNodes(): void;
}
export declare namespace FolderInternal {
    function getFolderPath(folder: Folder): string;
    function isDefault(folder: Folder): boolean;
}
