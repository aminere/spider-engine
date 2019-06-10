import { UniqueObject } from "./UniqueObject";
import { SerializedObject } from "./SerializableObject";
export declare namespace EngineSettingsInternal {
    const path = "spider-engine.json";
}
export declare class EngineSettings extends UniqueObject {
    private static _instance;
    readonly version: number;
    canvasAlpha: boolean;
    startupScene?: string;
    static load(): Promise<{}>;
    static readonly instance: EngineSettings;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    save(): void;
}
