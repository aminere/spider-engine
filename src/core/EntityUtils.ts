
import { EntityReference } from "../serialization/EntityReference";
import { ComponentReference } from "../serialization/ComponentReference";
import { Entity } from "./Entity";
import { SerializerUtils } from "../serialization/SerializerUtils";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { SerializableObject } from "./SerializableObject";
import { Reference } from "../serialization/Reference";
import { Geometry } from "../graphics/geometry/Geometry";
import { SkinnedMesh } from "../graphics/geometry/SkinnedMesh";
import { Component } from "./Component";
import { Matrix44 } from "../math/Matrix44";
import { Layout } from "../ui/Layout";
import { LayoutUtils } from "../ui/LayoutUtils";
import { Screen } from "../ui/Screen";
import { HorizontalAlignment, VerticalAlignment } from "../ui/Alignment";
import { Vector3 } from "../math/Vector3";
import { TranslatedEntityReferences, IEntityUtils, IEntityUtilsInternal } from "./IEntityUtils";
import { IRendererInternal } from "../graphics/IRenderer";

namespace Private {
    export function translateEntityRef(entityRef: EntityReference, oldIdToNewId: {}, translatedRefs?: TranslatedEntityReferences) {
        if (entityRef.id) {
            if (entityRef.id in oldIdToNewId) {
                entityRef.id = oldIdToNewId[entityRef.id];
                return true;
            }
        }
        return false;
    }

    export function translateComponentRef(componentRef: ComponentReference<Component>, oldIdToNewId: {}) {
        if (componentRef.entityId) {
            if (componentRef.entityId in oldIdToNewId) {
                componentRef.entityId = oldIdToNewId[componentRef.entityId];
                return true;
            }
        }
        return false;
    }

    export function recordTranslatedReference(
        translatedRefs: TranslatedEntityReferences | undefined,
        entityId: string,
        componentType: string,
        propertyName: string,
        // tslint:disable-next-line
        newValue: any
    ) {
        if (translatedRefs) {
            if (!(entityId in translatedRefs)) {
                translatedRefs[entityId] = {};
            }
            if (!(componentType in translatedRefs[entityId])) {
                translatedRefs[entityId][componentType] = [];
            }
            translatedRefs[entityId][componentType][propertyName] = newValue;
        }
    }

    export let invParentMatrix = new Matrix44();
    export let localScale = new Vector3();    
}

export class EntityUtils implements IEntityUtils {
    
    preserveWorldPosition(entity: Entity, newParent: Entity) {
        const transform = entity.transform;
        if (transform) {
            let parentWorldMatrix = newParent.transform ? newParent.transform.worldMatrix : null;
            if (!parentWorldMatrix) {
                // Entity is most likely added straight to the root
                parentWorldMatrix = Matrix44.identity;
            }
            const { invParentMatrix } = Private;
            const worldMatrix = transform.worldMatrix;
            invParentMatrix.copy(parentWorldMatrix).invert();
            transform.position.setFromMatrix(worldMatrix).transform(invParentMatrix);
            const absoluteScale = transform.worldScale;
            invParentMatrix.getScale(transform.scale); // .applyQuaternion(transform.localRotation);
            transform.scale.x *= absoluteScale.x;
            transform.scale.y *= absoluteScale.y;
            transform.scale.z *= absoluteScale.z;
            invParentMatrix.multiply(worldMatrix).getRotation(transform.rotation);

        } else {
            const layout = entity.getComponent(Layout);
            if (layout) {
                const parentLayout = newParent.getComponent(Layout) as Layout;
                let parentWorldMatrix = parentLayout ? parentLayout.worldMatrix : null;
                if (!parentWorldMatrix) {
                    let screen = newParent.getComponent(Screen);
                    if (screen) {
                        parentWorldMatrix = Matrix44.fromPool().copy(Matrix44.identity).translateFromCoords(
                            screen.offset.x, screen.offset.y, 0
                        );
                    }
                } else {
                    // Take parent pivot into account
                    // tslint:disable-next-line
                    /*
                    parentWorldMatrix.translateFromCoords(
                        -Math.floor(parentLayout.pivot.x * parentLayout.actualWidth),
                        -Math.floor(parentLayout.pivot.y * parentLayout.actualHeight),
                        0
                    );
                    /*/
                    parentWorldMatrix.translateFromCoords(
                        -parentLayout.pivot.x * parentLayout.actualWidth,
                        -parentLayout.pivot.y * parentLayout.actualHeight,
                        0
                    );
                    // tslint:disable-next-line
                    //*/
                }
                if (parentWorldMatrix) {
                    const { invParentMatrix, localScale } = Private;
                    const worldMatrix = layout.worldMatrix;
                    layout.horizontalAlignment = HorizontalAlignment.Left;
                    layout.verticalAlignment = VerticalAlignment.Top;
                    layout.margin.set(0, 0, 0, 0);
                    invParentMatrix.copy(parentWorldMatrix).invert();
                    layout.offset.setFromMatrix(worldMatrix).transform(invParentMatrix);
                    let absoluteScale = layout.absoluteScale;
                    invParentMatrix.getScale(localScale);
                    localScale.x *= absoluteScale.x;
                    localScale.y *= absoluteScale.y;
                    layout.scale.set(localScale.x, localScale.y);
                    invParentMatrix.multiply(worldMatrix).getRotation(layout.rotation);
                }
            }
        }
    }

    updateLayoutMatrixIfNecessary(entity: Entity) {
        entity.traverse(
            e => {
                let layout = e.getComponent(Layout);
                if (layout) {
                    this.updateLayoutWorldMatrix(layout);
                    return true;
                }
                return false;
            },
            true
        );
    }

    dirtifyWorldMatrixIfNecessary(entity: Entity) {
        const transform = entity.transform;
        if (transform) {
            transform.dirtifyWorldMatrix();
        }
    }

    updateLayoutWorldMatrix(layout: Layout) {
        const screen = layout.entity.getAncestorOfType(Screen);
        if (screen) {
            LayoutUtils.updateLayoutWorldMatrix(
                layout, 
                screen.getResolution(IRendererInternal.instance.screenSize), 
                screen.offset
            );
        }
    }

    translateReferences(entity: Entity, oldIdToNewId: {}, translatedRefs?: TranslatedEntityReferences) {
        entity.traverse(
            e => {
                e.iterateComponents(component => {
                    for (const property of Object.keys(component)) {
                        const typeName = SerializerUtils.getSerializablePropertyTypeName(component, property);
                        if (typeName === "EntityReference") {
                            const entityRef = component[property] as EntityReference;
                            if (Private.translateEntityRef(entityRef, oldIdToNewId)) {
                                Private.recordTranslatedReference(
                                    translatedRefs, 
                                    e.id, 
                                    component.constructor.name, 
                                    property, 
                                    entityRef
                                );
                            }
                        } else if (typeName === "ComponentReference") {
                            const componentRef = component[property] as ComponentReference<Component>;
                            if (Private.translateComponentRef(componentRef, oldIdToNewId)) {
                                Private.recordTranslatedReference(
                                    translatedRefs, 
                                    e.id, 
                                    component.constructor.name, 
                                    property, 
                                    componentRef
                                );
                            }
                        } else if (typeName === "ReferenceArray") {
                            const refArray = component[property] as ReferenceArray<SerializableObject>;
                            for (const ref of refArray.data) {
                                const obj = ref.instance;
                                if (!obj) {
                                    continue;
                                }
                                for (const _property of Object.keys(obj)) {
                                    const subTypeName = SerializerUtils.getSerializablePropertyTypeName(obj, _property);
                                    if (subTypeName === "EntityReference") {
                                        const entityRef = obj[_property] as EntityReference;
                                        if (Private.translateEntityRef(entityRef, oldIdToNewId)) {
                                            Private.recordTranslatedReference(
                                                translatedRefs, 
                                                e.id, 
                                                component.constructor.name, 
                                                property, 
                                                refArray
                                            );
                                        }
                                    } else if (subTypeName === "ComponentReference") {
                                        const componentRef = obj[_property] as ComponentReference<Component>;
                                        if (Private.translateComponentRef(componentRef, oldIdToNewId)) {
                                            Private.recordTranslatedReference(
                                                translatedRefs, 
                                                e.id, 
                                                component.constructor.name, 
                                                property, 
                                                refArray
                                            );
                                        }
                                    }
                                }
                            }

                            // surgically handle visual.skinnedMesh.skeleton instead
                            // of writing slow generic code since engine code is slow moving
                        } else if (property === "_geometry" && typeName === "Reference") {
                            const geometryRef = component[property] as Reference<Geometry>;
                            if (geometryRef.instance && geometryRef.instance.isA(SkinnedMesh)) {
                                const skinnedMesh = geometryRef.instance as SkinnedMesh;
                                const entityRef = skinnedMesh[SkinnedMesh.skeletonPropertyKey] as EntityReference;
                                if (Private.translateEntityRef(entityRef, oldIdToNewId)) {
                                    Private.recordTranslatedReference(
                                        translatedRefs, 
                                        e.id, 
                                        component.constructor.name, 
                                        property, 
                                        component[property]
                                    );
                                }
                            }
                        }
                    }
                });
                return true;
            },
            true
        );
    }

    sortComponents(components: Component[]) {
        return components.sort((a, b) => {
            const _sortOrderA = Reflect.getMetadata("sortOrder", a.constructor);
            const sortOrderA = _sortOrderA === undefined ? -1 : _sortOrderA;
            const _sortOrderB = Reflect.getMetadata("sortOrder", b.constructor);
            const sortOrderB = _sortOrderB === undefined ? -1 : _sortOrderB;
            return sortOrderB - sortOrderA;
        });
    }
}

/**
 * @hidden
 */
export namespace EntityUtilsInternal {
    export function create() {
        IEntityUtilsInternal.instance = new EntityUtils();
    }
}