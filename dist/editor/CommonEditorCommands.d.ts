import { AsyncEvent } from "ts-events";
import { Asset } from "../assets/Asset";
interface ISaveAsset {
    path?: string;
    asset: Asset;
}
export declare class CommonEditorCommands {
    static saveAsset: AsyncEvent<ISaveAsset>;
}
export {};
