
import { UniqueObject } from "./UniqueObject";

import { EngineUtils } from "./EngineUtils";
import { SerializerUtils } from "../serialization/SerializerUtils";
import { SerializedObject } from "./SerializableObject";
import { SerializedObjectType } from "../serialization/SerializedTypes";
import { Transform } from "./Transform";
import { Component } from "./Component";
import { IEntityUtilsInternal } from "./IEntityUtils";
import { IFactoryInternal } from "../serialization/IFactory";
import { ObjectProps, Constructor } from "./Types";
import * as Attributes from "../core/Attributes";

/**
 * @hidden
 */
// tslint:disable-next-line
var CommonEditorEvents: any = undefined;
if (process.env.CONFIG === "editor") {
    CommonEditorEvents = require("../editor/CommonEditorEvents").CommonEditorEvents;
}

export interface SerializedEntity {
    id: string;
    name: string;
    active: boolean;    
    components?: { [typeName: string]: SerializedObject };
    children?: SerializedEntity[];
    prefabId?: string;
}

/**
 * @hidden
 */
export namespace EntityInternal {
    export const entitiesJustDestroyed: Entity[] = [];
    export const entitiesJustCreated: Entity[] = [];
    export let collectEntityOperations = false;    

    // tslint:disable-next-line
    function clearComponent(entity: any, typeName: string) {
        const instance = entity._components[typeName];
        if (instance) {
            instance.destroy();
            delete entity._components[typeName];
            return true;
        }
        return false;
    }
    
    // tslint:disable-next-line
    export function destroyEntity(entity: any) {
        // Components with a controller are destroyed by it (their controller)
        const components = Object.keys(entity._components).map(k => entity._components[k]).filter(c => !c.controller);
        for (const component of components) {
            component.destroy();
        }
        for (const child of [...entity.children]) {
            child.destroy();
        }        
        entity._components = {};
        entity.children = [];
    }

    // tslint:disable-next-line
    export function setComponentFromInstance(entity: any, instance: Component) {
        const typeName = instance.constructor.name;
        const previous = entity._components[typeName];
        if (previous) {
            instance.onReplace(previous);
            previous.destroy();
        }
        entity._components[typeName] = instance;
        instance.setEntity(entity);
    }

    // tslint:disable-next-line
    export function setComponentByName(entity: any, typeName: string, props?: any) {
        const component = IFactoryInternal.instance.createObject(typeName, props) as Component;
        setComponentFromInstance(entity, component);
        if (CommonEditorEvents) {
            CommonEditorEvents.componentAddedOrRemovedByRuntime.post(entity);
        }
        return component;
    }

    // tslint:disable-next-line
    export function getComponentByName(entity: any, typeName: string): Component | null {
        return entity._components[typeName] || null;
    }

    // tslint:disable-next-line
    export function clearComponentByName(entity: any, typeName: string) {
        if (clearComponent(entity, typeName)) {
            if (CommonEditorEvents) {
                CommonEditorEvents.componentAddedOrRemovedByRuntime.post(entity);
            }
        }
    }
}

export class Entity extends UniqueObject {

    get transform() { return this.getComponent(Transform) as Transform; }
    get active() { return this._active; }
    set active(active: boolean) {
        if (CommonEditorEvents) {
            if (active !== this._active) {
                CommonEditorEvents.entityActivated.post({ entity: this, active });
            }
        }
        this._active = active;
    }
    children: Entity[] = [];
    parent?: Entity;   
    prefabId?: string;

    @Attributes.unserializable()
    transient = false;

    private _components: { [typeName: string]: Component } = {};
    private _tags: { [tag: string]: boolean } = {};
    private _active = true;    

    isLoaded() {
        let isLoaded = true;
        this.traverse(
            e => {
                for (const component of Object.values(e._components)) {                    
                    if (!component.isLoaded()) {
                        isLoaded = false;
                        return false;
                    }
                }
                return true;
            },
            true
        );
        return isLoaded;
    }
    
    setComponent<T extends Component>(ctor: new (props?: ObjectProps<T>) => T, props?: ObjectProps<T>) {
        const instance = new ctor(props);
        EntityInternal.setComponentFromInstance(this, instance);
        return this;
    }
    
    setComponentByName(name: string, props?: ObjectProps<Component>) {
        EntityInternal.setComponentByName(this, name, props);        
        return this;
    }

    getComponent<T extends Component>(ctor: Constructor<T>) {
        return EntityInternal.getComponentByName(this, ctor.name) as (T | null);
    }

    getComponentByName(name: string) {
        return EntityInternal.getComponentByName(this, name);
    }

    clearComponent<T extends Component>(ctor: Constructor<T>) {
        EntityInternal.clearComponentByName(this, ctor.name);
        return this;
    }  

    updateComponent<T extends Component>(ctor: Constructor<T>, props: ObjectProps<T>) {
        return this.updateComponentByName(ctor.name, props);
    }

    updateComponentByName(name: string, props: ObjectProps<Component>) {
        const component = this.getComponentByName(name);
        if (component) {
            component.setState(props);
        }
        return this;
    }
    
    getOrSetComponent<T extends Component>(ctor: Constructor<T>): T {
        return this.getOrSetComponentByName(ctor.name) as T;
    }

    getOrSetComponentByName(name: string) {
        return EntityInternal.getComponentByName(this, name) || EntityInternal.setComponentByName(this, name);
    }
    
    getComponents<T extends Component>(ctor: Constructor<T>) {
        const components: T[] = [];
        this.getComponentsInChildren(ctor.name, components);
        return components;
    }     

    addChild(c: Entity, preserveWorldPosition: boolean = false) {
        const oldParent = c.parent;
        if (oldParent) {
            if (preserveWorldPosition) {                
                IEntityUtilsInternal.instance.preserveWorldPosition(c, this);
            }
            oldParent.removeChild(c);
        }

        c.parent = this;
        this.children.push(c);

        IEntityUtilsInternal.instance.dirtifyWorldMatrixIfNecessary(c);
        IEntityUtilsInternal.instance.updateLayoutMatrixIfNecessary(c);
        
        if (CommonEditorEvents) {
            CommonEditorEvents.entityHierarchyChanged.post();
        }
        return this;
    }

    insertChild(c: Entity, index: number, preserveWorldPosition: boolean = false) {
        const oldParent = c.parent;
        if (oldParent) {
            if (preserveWorldPosition) {
                IEntityUtilsInternal.instance.preserveWorldPosition(c, this);
            }
            oldParent.removeChild(c);
        }

        c.parent = this;
        this.children.splice(index, 0, c);
        
        IEntityUtilsInternal.instance.dirtifyWorldMatrixIfNecessary(c);
        IEntityUtilsInternal.instance.updateLayoutMatrixIfNecessary(c);

        if (CommonEditorEvents) {
            CommonEditorEvents.entityHierarchyChanged.post();
        }
        return this;
    }

    removeChild(c: Entity) {
        delete c.parent;
        const index = this.children.indexOf(c);
        this.children.splice(index, 1);
        if (CommonEditorEvents) {
            CommonEditorEvents.entityHierarchyChanged.post();
        }
        return this;
    }

    removeAllChildren() {
        for (const c of [...this.children]) {
            c.destroy();
        }
        return this;
    }

    /**
     * @hidden
     */
    findChildById(id: string): Entity | undefined {
        if (this.id === id) {
            return this;
        }
        for (const child of this.children) {
            if (child.id === id) {
                return child;
            }
        }
        for (const child of this.children) {
            const grandChild = child.findChildById(id);
            if (grandChild) {
                return grandChild;
            }
        }
        return undefined;
    }

    findChild(name: string): Entity | undefined {
        for (const child of this.children) {
            if (child.name === name) {
                return child;
            }
        }
        for (const child of this.children) {
            const grandChild = child.findChild(name);
            if (grandChild) {
                return grandChild;
            }
        }
        return undefined;
    }

    filterChildren(filter: (child: Entity) => boolean) {
        const entities: Entity[] = [];
        this.traverse(e => {
            if (filter(e)) {
                entities.push(e);
            }
            return true;
        });
        return entities;
    }
    
    isAncestor(potentialAncestor: Entity): boolean {
        if (this.parent === potentialAncestor) {
            return true;
        }
        if (this.parent) {
            return this.parent.isAncestor(potentialAncestor);
        }
        return false;
    }

    setTag(tag: string) {
        Object.assign(this._tags, {
            [tag]: true
        });
        return this;
    }

    hasTag(tag: string) {
        return tag in this._tags;
    }

    traverse(handler: (e: Entity) => boolean, includeSelf: boolean = false) {
        let _continue = true;
        if (includeSelf) {
            _continue = handler(this);
        }
        if (_continue !== false) {
            this.traverseInternal(this, handler);
        }        
    }

    traverseAncestors(handler: (e: Entity) => boolean, includeSelf: boolean = false) {
        let _continue = true;
        if (includeSelf) {
            _continue = handler(this);
        }
        if (_continue !== false) {
            this.traverseAncestorsInternal(this, handler);
        }
    }

    iterateComponents(handler: (component: Component) => void) {
        for (const component of Object.values(this._components)) {
            handler(component);
        }
    }

    getAncestor(typeName: string): Component | null {
        const c = EntityInternal.getComponentByName(this, typeName);
        if (c && c.active) {
            return c;
        } else if (!this.parent) {
            return null;
        } else {
            return this.parent.getAncestor(typeName);
        }
    }
    
    getAncestorOfType<T extends Component>(ctor: Constructor<T>): T | null {
        return this.getAncestor(ctor.name) as (T | null);
    }

    destroy() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        if (EntityInternal.collectEntityOperations) {
            EntityInternal.entitiesJustDestroyed.push(this);
        } else {
            EntityInternal.destroyEntity(this);
        }
    }

    hasComponentByName(typeName: string) {
        return typeName in this._components;
    }

    hasComponent<T>(ctor: Constructor<T>) {
        return this.hasComponentByName(ctor.name);
    }
    
    serialize() {
        // This is done by the Scene
        console.assert(false);
        return { typeName: "InvalidEntityData", version: 1, properties: {} };
    }
  
    deserialize(json: SerializedObjectType) {
        // This is done by the Scene
        console.assert(false);
        return Promise.reject();
    }

    /**
     * @hidden
     */
    copyWithIdMap(oldIdToNewId: {}) {
        return this.copyInternal(oldIdToNewId, undefined);
    }
    
    copy(oldIdToNewId?: {}, persistent?: boolean) {
        return this.copyInternal(undefined, oldIdToNewId);
    }

    /**
     * @hidden
     */
    initializeActive(active: boolean) {
        this._active = active;
    }

    private copyInternal(idMapToRespect?: {}, _generatedIdMap?: {}) {
        const copy = new Entity();
        copy.prefabId = this.prefabId;        
        SerializerUtils.deserializeEntity(copy, SerializerUtils.serializeEntity(this, true));

        const generatedIdMap = idMapToRespect || _generatedIdMap || {};

        // Determine IDs of entities in the copy
        copy.traverse(
            e => {
                if (idMapToRespect) {
                    const id = idMapToRespect[e.id];
                    if (id) {
                        e.id = id;
                        return true;
                    } else {
                        // This is most likely an entity being instantiated from a prefab whose hiearchy changed
                        // (new entities were added to the prefab)
                        // Generate new ids for the instances of those entities
                    }
                }

                const newId = EngineUtils.makeUniqueId();
                generatedIdMap[e.id] = newId;
                e.id = newId;
                return true;
            },
            true
        );

        // Translate entity references in the copy to their corresponding copied entity
        IEntityUtilsInternal.instance.translateReferences(copy, generatedIdMap);
        return copy;
    }

    private getComponentsInChildren(typeName: string, components: Component[]) {
        if (!this.active || this.transient) {
            return;
        }

        const component = EntityInternal.getComponentByName(this, typeName);
        if (component && component.active) {
            components.push(component);
        }

        for (const child of this.children) {
            child.getComponentsInChildren(typeName, components);
        }
    }

    private traverseInternal(entity: Entity, handler: (e: Entity) => boolean) {
        for (const child of entity.children) {
            if (handler(child)) {
                this.traverseInternal(child, handler);
            }
        }
    }

    private traverseAncestorsInternal(entity: Entity, handler: (e: Entity) => boolean) {
        if (entity.parent) {
            if (handler(entity.parent)) {
                this.traverseAncestorsInternal(entity.parent, handler);
            }
        }
    }
}
