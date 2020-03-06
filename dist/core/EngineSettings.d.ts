import { UniqueObject } from "./UniqueObject";
import { SerializedObject } from "./SerializableObject";
/**
 * @hidden
 */
export declare namespace EngineSettingsInternal {
    const path = "spider-engine.json";
}
export declare class EngineSettings extends UniqueObject {
    private static _instance;
    get version(): number;
    canvasAlpha: boolean;
    startupScene?: string;
    useCustomDefaultAssets?: boolean;
    static load(): Promise<unknown>;
    static get instance(): EngineSettings;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    save(): void;
}
