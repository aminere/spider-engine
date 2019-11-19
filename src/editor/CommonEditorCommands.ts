import { AsyncEvent } from "ts-events";
import { Asset } from "../assets/Asset";

interface ISaveAsset {
    path?: string;
    asset: Asset;
}

export class CommonEditorCommands {
    static saveAsset = new AsyncEvent<ISaveAsset>();
}
