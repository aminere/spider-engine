import { Entity } from "./Entity";
import { Component } from "./Component";

export interface TranslatedEntityReferences {
    [entityId: string]: {
        [componentType: string]: {
            // tslint:disable-next-line
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

namespace Private {
    export let instance: IEntityUtils;
}

/**
 * @hidden
 */
export class IEntityUtilsInternal {
    static set instance(instance: IEntityUtils) {
        Private.instance = instance;
    }
    static get instance() {
        return Private.instance;
    }
}
