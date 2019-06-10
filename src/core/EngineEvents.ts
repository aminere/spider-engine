
import { AsyncEvent } from "ts-events";
import { Asset } from "../assets/Asset";
import { UniqueObject } from "./UniqueObject";

export class EngineEvents {
    static assetLoaded = new AsyncEvent<Asset>();    
    static objectSaved = new AsyncEvent<UniqueObject>();
}
