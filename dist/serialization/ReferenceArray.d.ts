import { ReferenceBase, Reference, SerializedReference } from "./Reference";
import { SerializableObject } from "../core/SerializableObject";
import { Constructor } from "../core/Types";
export declare class ReferenceArrayBase {
    grow: (instance?: any) => void;
    typeName: () => string;
    getData: () => ReferenceBase[];
}
export declare class ReferenceArray<T extends SerializableObject> extends ReferenceArrayBase {
    data: Reference<T>[];
    private _clone;
    constructor(ctor: Constructor<T>, data?: Reference<T>[]);
    get(index: number): T | undefined;
    copy(): ReferenceArray<T>;
    clear(): void;
}
export interface SerializedReferenceArray {
    typeName: string;
    data: SerializedReference[];
}
