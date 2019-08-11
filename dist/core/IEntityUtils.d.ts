import { Entity } from "./Entity";
import { Component } from "./Component";
export interface TranslatedEntityReferences {
    [entityId: string]: {
        [componentType: string]: {
            [propertyName: string]: any;
        };
    };
}
export interface IEntityUtils {
    preserveWorldPosition: (entity: Entity, newParent: Entity) => void;
    updateLayoutMatrixIfNecessary: (entity: Entity) => void;
    dirtifyWorldMatrixIfNecessary: (entity: Entity) => void;
    translateReferences: (entity: Entity, oldIdToNewId: {}, translatedRefs?: TranslatedEntityReferences) => void;
    sortComponents: (components: Component[]) => Component[];
}
/**
 * @hidden
 */
export declare class IEntityUtilsInternal {
    static instance: IEntityUtils;
}
