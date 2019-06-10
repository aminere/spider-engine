import { BasePin } from "./Pin";
import { Entity } from "../core/Entity";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { ObjectDeclaration } from "./ObjectDeclaration";
import { ICodeBlock } from "./ICodeBlock";
import { Transform } from "../core/Transform";
/**
 * @hidden
 */
export interface ObjectDefinitionProperties {
    [name: string]: any;
}
/**
 * @hidden
 */
export interface IObjectDefinition {
    getPins: () => ReferenceArray<BasePin>;
    setPins: (pins: ReferenceArray<BasePin>) => void;
    findPinByName: (name: string) => BasePin | undefined;
}
/**
 * @hidden
 */
export declare class BehaviorUtils {
    static pinsHaveSameType(pin1: BasePin, pin2: BasePin): boolean;
    static isPinLoaded(pin: BasePin): boolean;
    static buildPins(obj: IObjectDefinition, definition: ObjectDeclaration): void;
    static updatePinAccessors(obj: IObjectDefinition): void;
    static initializeCodeBlockInstanceState(codeBlock: ICodeBlock, ownerEntity: Entity, customPins: ReferenceArray<BasePin>, sendSignal: (signal: string) => void): {
        this: {
            [accessor: string]: Entity;
        };
        transform: {
            [accessor: string]: Transform;
        };
    };
    static getVariables(codeBlock: ICodeBlock): {
        this: string;
        transform: string;
    };
}
