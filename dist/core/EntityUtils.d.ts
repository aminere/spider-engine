import { Entity } from "./Entity";
import { Layout } from "../ui/Layout";
import { TranslatedEntityReferences, IEntityUtils } from "./IEntityUtils";
export declare class EntityUtils implements IEntityUtils {
    preserveWorldPosition(entity: Entity, newParent: Entity): void;
    updateLayoutMatrixIfNecessary(entity: Entity): void;
    dirtifyWorldMatrixIfNecessary(entity: Entity): void;
    updateLayoutWorldMatrix(layout: Layout): void;
    translateReferences(entity: Entity, oldIdToNewId: {}, translatedRefs?: TranslatedEntityReferences): void;
}
/**
 * @hidden
 */
export declare namespace EntityUtilsInternal {
    function create(): void;
}
