import { UniqueObject } from "./UniqueObject";
import { SerializedObject } from "./SerializableObject";
import { SerializedObjectType } from "../serialization/SerializedTypes";
import { Transform } from "./Transform";
import { Component } from "./Component";
import { ObjectProps, Constructor } from "./Types";
export interface SerializedEntity {
    id: string;
    name: string;
    active: boolean;
    components?: {
        [typeName: string]: SerializedObject;
    };
    children?: SerializedEntity[];
    prefabId?: string;
}
/**
 * @hidden
 */
export declare namespace EntityInternal {
    const entitiesJustDestroyed: Entity[];
    const entitiesJustCreated: Entity[];
    let collectEntityOperations: boolean;
    function destroyEntity(entity: any): void;
    function setComponentFromInstance(entity: any, instance: Component): void;
    function setComponentByName(entity: any, typeName: string, props?: any): Component;
    function getComponentByName(entity: any, typeName: string): Component | null;
    function clearComponentByName(entity: any, typeName: string): void;
}
export declare class Entity extends UniqueObject {
    get transform(): Transform;
    get active(): boolean;
    set active(active: boolean);
    children: Entity[];
    parent?: Entity;
    prefabId?: string;
    private _components;
    private _tags;
    private _active;
    isLoaded(): boolean;
    setComponent<T extends Component>(ctor: new (props?: ObjectProps<T>) => T, props?: ObjectProps<T>): this;
    setComponentByName(name: string, props?: ObjectProps<Component>): this;
    getComponent<T extends Component>(ctor: Constructor<T>): T | null;
    getComponentByName(name: string): Component | null;
    clearComponent<T extends Component>(ctor: Constructor<T>): this;
    updateComponent<T extends Component>(ctor: Constructor<T>, props: ObjectProps<T>): this;
    updateComponentByName(name: string, props: ObjectProps<Component>): this;
    getOrSetComponent<T extends Component>(ctor: Constructor<T>): T;
    getOrSetComponentByName(name: string): Component;
    getComponents<T extends Component>(ctor: Constructor<T>): T[];
    addChild(c: Entity, preserveWorldPosition?: boolean): this;
    insertChild(c: Entity, index: number, preserveWorldPosition?: boolean): this;
    removeChild(c: Entity): this;
    removeAllChildren(): this;
    /**
     * @hidden
     */
    findChildById(id: string): Entity | undefined;
    findChild(name: string): Entity | undefined;
    filterChildren(filter: (child: Entity) => boolean): Entity[];
    isAncestor(potentialAncestor: Entity): boolean;
    setTag(tag: string): this;
    hasTag(tag: string): boolean;
    traverse(handler: (e: Entity) => boolean, includeSelf?: boolean): void;
    traverseAncestors(handler: (e: Entity) => boolean, includeSelf?: boolean): void;
    iterateComponents(handler: (component: Component) => void): void;
    getAncestor(typeName: string): Component | null;
    getAncestorOfType<T extends Component>(ctor: Constructor<T>): T | null;
    destroy(): void;
    hasComponent(typeName: string): boolean;
    hasComponentByType<T>(ctor: Constructor<T>): boolean;
    serialize(): {
        typeName: string;
        version: number;
        properties: {};
    };
    deserialize(json: SerializedObjectType): Promise<never>;
    /**
     * @hidden
     */
    copyWithIdMap(oldIdToNewId: {}): Entity;
    copy(oldIdToNewId?: {}, persistent?: boolean): Entity;
    /**
     * @hidden
     */
    initializeActive(active: boolean): void;
    private copyInternal;
    private getComponentsInChildren;
    private traverseInternal;
    private traverseAncestorsInternal;
}
