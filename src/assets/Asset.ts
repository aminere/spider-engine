
import { UniqueObject } from "../core/UniqueObject";
import { AsyncEvent } from "ts-events";
import * as Attributes from "../core/Attributes";
import { Debug } from "../io/Debug";

/**
 * @hidden
 */
// tslint:disable-next-line
var CommonEditorCommands: any = undefined;
if (process.env.CONFIG === "editor") {
    CommonEditorCommands = require("../editor/CommonEditorCommands").CommonEditorCommands;
}

export class Asset extends UniqueObject {
    
    @Attributes.unserializable()
    isPersistent = false;

    @Attributes.unserializable()
    deleted = new AsyncEvent<string>();

    isLoaded() {
        return true;
    }    
    
    destroy() {
        this.deleted.post(this.id);
        super.destroy();
    }

    save(folderPath?: string) {
        if (CommonEditorCommands) {
            CommonEditorCommands.saveAsset.post({
                path: (folderPath ? `${folderPath}/${this.name}.${this.constructor.name}` : null) || this.templatePath,
                asset: this
            });
        } else {
            Debug.logWarning("Asset saving is not yet implemented on this platform");
        }
    }
}

export interface SerializedAsset {
    typeName: string;
    id?: string;
}
