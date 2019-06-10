import { Asset } from "../assets/Asset";
import * as Attributes from "../core/Attributes";
import { SyncEvent } from "ts-events";
import { Constructor } from "../core/Types";

/**
 * @hidden
 */
// tslint:disable-next-line
var EditorEvents: any = undefined;
if (process.env.CONFIG === "editor") {
    EditorEvents = require("../editor/CommonEditorEvents").CommonEditorEvents;
}

export enum AssetReferenceState {    
    Loading,
    Resolved
}

export interface AssetChangedEvent {
    oldAsset: Asset | null;
    newAsset: Asset | null;
}

export class AssetReference<T extends Asset> {

    typeName: () => string;

    get id() { return this._id; }
    set id(id: string | undefined) { 
        this._id = id;
        this._state = AssetReferenceState.Loading;
    }
    get asset() { return this._asset; }
    set asset(asset: T | null) { 
        let oldAsset = this._asset;
        if (process.env.CONFIG === "editor") {
            if (oldAsset) {
                oldAsset.deleted.detach(this.onAssetDeleted);
            }
        }
        this._asset = asset;
        this._state = AssetReferenceState.Resolved;
        if (asset) {            
            if (process.env.CONFIG === "editor") {
                this._id = asset.id;
                // attach to new asset
                asset.deleted.attach(this.onAssetDeleted);
            } else {
                this._id = asset.templatePath;
            }
        } else {
            this._id = undefined;
        }
        if (asset !== oldAsset) {
            this.assetChanged.post({ oldAsset: oldAsset, newAsset: asset });
        }
    }
    get state() { return this._state; }
    set state(state: AssetReferenceState) { this._state = state; }
    get isResolved() { return this._state === AssetReferenceState.Resolved; }

    /**
     * @event
     */
    @Attributes.unserializable()
    assetChanged = new SyncEvent<AssetChangedEvent>();

    private _id?: string;

    @Attributes.unserializable()
    private _asset: T | null = null;

    @Attributes.unserializable()
    private _state = AssetReferenceState.Resolved;

    constructor(ctor: Constructor<T>, instance?: T) {  
        this.typeName = () => ctor.name;
        this.onAssetDeleted = this.onAssetDeleted.bind(this);
        if (instance) {
            this._asset = instance;
            this._id = instance.id;
            this._state = AssetReferenceState.Resolved;
        }
    }

    clear() {
        this.asset = null;
    }

    // doesn't attach nor detach from change events, doesn't keep track of the asset ID
    // particularily useful for changes triggered by the renderer or at runtime by the behavior system
    // which don't need to be kept track of because they are not supposed to be persistent
    // If in editor, when the play session is over, the scene is reloaded anyway    
    setAssetFast(asset: T | null) {        
        this._asset = asset;
    }

    detach() {
        if (process.env.CONFIG === "editor") {
            if (this._asset) {
                this._asset.deleted.detach(this.onAssetDeleted);
            }            
        }        
        this._asset = null;
    }

    private onAssetDeleted(id: string) {
        this.detach();
        if (EditorEvents) {
            EditorEvents.assetReferenceCleared.post(id);
        }
    }
}
