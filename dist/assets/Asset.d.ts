import { UniqueObject } from "../core/UniqueObject";
import { AsyncEvent } from "ts-events";
export declare class Asset extends UniqueObject {
    isPersistent: boolean;
    deleted: AsyncEvent<string>;
    isLoaded(): boolean;
    destroy(): void;
    save(folderPath?: string): void;
}
export interface SerializedAsset {
    typeName: string;
    id?: string;
}
