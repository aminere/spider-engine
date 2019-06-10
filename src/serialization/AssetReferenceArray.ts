
import { Asset } from "../assets/Asset";
import { AssetReference } from "./AssetReference";
import { SerializedAssetReference } from "./SerializedTypes";

/**
 * @hidden
 */
export class AssetReferenceArray<T extends Asset> {

    data: AssetReference<T>[];
    grow: (instance?: T) => void;
    typeName: () => string;

    // tslint:disable-next-line
    constructor(ctor: { new(...args: any[]): T; }, data?: AssetReference<T>[]) {
        this.grow = (instance?: T) => this.data.push(new AssetReference(ctor, instance));
        this.typeName = () => ctor.name;
        this.data = data || [];
    }    

    detach() {
        for (const ref of this.data) {
            ref.detach();
        }
    }
}

/**
 * @hidden
 */
export interface SerializedAssetReferenceArray {
    typeName: string;
    data: SerializedAssetReference[];
}