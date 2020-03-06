import { SerializableObject } from "../SerializableObject";
import { Entity } from "../Entity";
export declare class HudControl extends SerializableObject {
    name: string;
    constructor(name: string);
}
export declare class HudNumber extends HudControl {
    initialValue: number;
    min?: number;
    max?: number;
    onChanged?: (newValue: number) => void;
    constructor(name: string, value: number, min?: number, max?: number, onChanged?: (newValue: number) => void);
}
export declare class HudBoolean extends HudControl {
    initialValue: boolean;
    onChanged?: (newValue: boolean) => void;
    constructor(name: string, value: boolean, onChanged?: (newValue: boolean) => void);
}
export declare class HudCommand extends HudControl {
    onTriggered: () => void;
    constructor(name: string, onTriggered: () => void);
}
export declare class EngineHud {
    static load(): Promise<unknown[]>;
    static isLoaded(): boolean;
    static create(): Entity | null;
    static setControls(controls: HudControl[]): void;
    static onSceneDestroyed(): void;
}
