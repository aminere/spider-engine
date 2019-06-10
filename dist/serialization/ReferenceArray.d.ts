import { ReferenceBase, Reference, SerializedReference } from "./Reference";
import { SerializableObject } from "../core/SerializableObject";
/**
 * @hidden
 */
export declare class ReferenceArrayBase {
    grow: (instance?: any) => void;
    typeName: () => string;
    getData: () => ReferenceBase[];
}
/**
 * @hidden
 */
export declare class ReferenceArray<T extends SerializableObject> extends ReferenceArrayBase {
    data: Reference<T>[];
    private _clone;
    constructor(ctor: {
        new (): T;
    }, data?: Reference<T>[]);
    get(index: number): T | undefined;
    copy(): ReferenceArray<T>;
    clear(): void;
}
/**
 * @hidden
 */
export interface SerializedReferenceArray {
    typeName: string;
    data: SerializedReference[];
}
