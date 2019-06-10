import { UniqueObject } from "../core/UniqueObject";
import { ArrayProperty } from "../serialization/ArrayProperty";

import * as Attributes from "../core/Attributes";
import { IOUtils } from "./IOUtils";

export class Folder extends UniqueObject {

    @Attributes.hidden()
    ids = new ArrayProperty(String);

    @Attributes.hidden()
    folders = new ArrayProperty(Folder);

    @Attributes.unserializable()
    parent?: Folder;

    @Attributes.hidden()
    assetVersion = 1;

    isAncestor(potentialAncestor: Folder): boolean {
        if (this.parent === potentialAncestor) {
            return true;
        }
        if (this.parent) {
            return this.parent.isAncestor(potentialAncestor);
        }
        return false;
    }

    findFolder(name: string) {
        return this.folders.data.find(f => f.name === name);        
    }

    assignParentNodes() {
        for (let f of this.folders.data) {
            f.parent = this;
            f.assignParentNodes();
        }
    }    
}

/**
 * @hidden
 */
export namespace FolderInternal {
    export function getFolderPath(folder: Folder) {
        let parent = folder.parent;
        let path = folder.name;
        while (parent) {
            path = `${parent.name}/${path}`;
            parent = parent.parent;
        }
        return path;
    }

    export function isDefault(folder: Folder) {
        const path = getFolderPath(folder);
        return IOUtils.isDefaultAsset(path);
    }
}
