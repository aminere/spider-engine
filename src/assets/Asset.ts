
import { UniqueObject } from "../core/UniqueObject";
import { AsyncEvent } from "ts-events";
import * as Attributes from "../core/Attributes";
import { IObjectManagerInternal } from "../core/IObjectManager";

export class Asset extends UniqueObject {
    
    @Attributes.unserializable()
    isPersistent = false;

    @Attributes.unserializable()
    deleted = new AsyncEvent<string>();

    isLoaded() {
        return true;
    }
    
    save() {
        if (!this.isPersistent) {
            return Promise.resolve();
        } else {
            return IObjectManagerInternal.instance.saveObject(this);
        }
    }
    
    destroy() {
        this.deleted.post(this.id);
        super.destroy();
    }    
}

export interface SerializedAsset {
    typeName: string;
    id?: string;
}
