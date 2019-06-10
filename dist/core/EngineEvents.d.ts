import { AsyncEvent } from "ts-events";
import { Asset } from "../assets/Asset";
import { UniqueObject } from "./UniqueObject";
export declare class EngineEvents {
    static assetLoaded: AsyncEvent<Asset>;
    static objectSaved: AsyncEvent<UniqueObject>;
}
