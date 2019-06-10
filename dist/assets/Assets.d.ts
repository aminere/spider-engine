import { Asset } from "./Asset";
/**
 * @hidden
 */
export declare namespace AssetsInternal {
    function updateLoading(): void;
}
export declare class Assets {
    static load(path: string): Promise<Asset>;
    static loadById(id: string): Promise<Asset>;
}
