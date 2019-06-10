import { DataPin, PinType } from "./Pin";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Color } from "../graphics/Color";
import { AssetReference } from "../serialization/AssetReference";
import { EntityReference } from "../serialization/EntityReference";
import { ComponentReference } from "../serialization/ComponentReference";
import { CollisionInfo } from "../collision/CollisionInfo";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { Asset } from "../assets/Asset";
import { Prefab } from "../assets/Prefab";
import { ObjectReference } from "../serialization/ObjectReference";
import { SerializedObject } from "../core/SerializableObject";
import { Ray } from "../math/Ray";
import { Component } from "../core/Component";
export declare class TDataPin<T> extends DataPin {
    static runtimeValueAccessor: string;
    value: T;
    constructor(id?: string, type?: PinType);
    setData(data: T): void;
    getData(): T;
}
export declare class NumberPin extends TDataPin<number> {
    constructor(id?: string, type?: PinType, value?: number);
}
export declare class StringPin extends TDataPin<string> {
    constructor(id?: string, type?: PinType);
}
export declare class BooleanPin extends TDataPin<boolean> {
    constructor(id?: string, type?: PinType);
}
export declare class Vector2Pin extends TDataPin<Vector2> {
    constructor(id?: string, type?: PinType);
    setData(data: Vector2): void;
}
export declare class Vector3Pin extends TDataPin<Vector3> {
    constructor(id?: string, type?: PinType);
    setData(data: Vector3): void;
}
export declare class Vector4Pin extends TDataPin<Vector4> {
    constructor(id?: string, type?: PinType);
    setData(data: Vector4): void;
}
export declare class ColorPin extends TDataPin<Color> {
    constructor(id?: string, type?: PinType);
    setData(data: Color): void;
}
export declare class RayPin extends TDataPin<Ray> {
    constructor(id?: string, type?: PinType);
    setData(data: Ray): void;
}
export declare class PrefabPin extends TDataPin<AssetReference<Prefab>> {
    constructor(id?: string, type?: PinType);
}
export declare class EntityReferencePin extends TDataPin<EntityReference> {
    constructor(id?: string, type?: PinType);
}
export declare class ComponentReferencePin<T extends Component> extends TDataPin<ComponentReference<T>> {
    readonly version: number;
    componentType: string;
    private _componentType;
    constructor(id?: string, type?: PinType, componentType?: string);
    setProperty(name: string, value: any): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class CollisionInfoPin extends TDataPin<CollisionInfo> {
    constructor(id?: string, type?: PinType);
}
export declare class ObjectReferencePin extends TDataPin<ObjectReference> {
    declarationId: string;
    private _declarationId;
    constructor(declarationId: string, id?: string, type?: PinType);
    setProperty(name: string, value: any): void;
}
export declare class ArrayPin<T extends DataPin> extends TDataPin<ArrayProperty<T>> {
    dataType: string | undefined;
    declarationId: string | undefined;
    private _dataType?;
    private _declarationId?;
    private _isDirty;
    private _runtimeData;
    constructor(id?: string, type?: PinType, declarationId?: string);
    setData(data: ArrayProperty<T>): void;
    setProperty(name: string, value: any): void;
}
export declare class AssetPin<T extends Asset> extends TDataPin<AssetReference<T>> {
    assetType: string;
    private _assetType;
    constructor(id?: string, type?: PinType, assetType?: string);
    setProperty(name: string, value: any): void;
}
