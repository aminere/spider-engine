import { Asset } from "./Asset";

export interface AssetLoadingDefinition {
    path: string;
    set: (asset: Asset) => void;
    get: () => Asset;
}
