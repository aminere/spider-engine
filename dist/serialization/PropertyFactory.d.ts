import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
import { Vector4 } from "../math/Vector4";
import { Quaternion } from "../math/Quaternion";
import { Color } from "../graphics/Color";
import { Matrix44, SerializableMatrix44 } from "../math/Matrix44";
import { Matrix33 } from "../math/Matrix33";
import { AABB } from "../math/AABB";
import { UISize, SerializedUISize, UISizeType } from "../ui/UISize";
import { VertexBuffer, SerializedVertexBuffer } from "../graphics/VertexBuffer";
import { Rect } from "../ui/Rect";
import { ArrayProperty, IArrayProperty, SerializedArrayProperty } from "./ArrayProperty";
import { ReferenceBase, Reference, SerializedReference } from "./Reference";
import { ReferenceArray, ReferenceArrayBase, SerializedReferenceArray } from "./ReferenceArray";
import { FileProperty } from "./FileProperty";
import { ThumbnailProperty } from "./ThumbnailProperty";
import { EntityReference } from "./EntityReference";
import { Asset } from "../assets/Asset";
import { ComponentReference, SerializedComponentReference } from "./ComponentReference";
import { Range } from "./Range";
import { Size, SerializedSize, SizeType } from "../core/Size";
import { AssetReferenceArray, SerializedAssetReferenceArray } from "./AssetReferenceArray";
import { NativeArray, INativeArray, NativeType } from "./NativeArray";
import { SerializableObject } from "../core/SerializableObject";
import { NativeU8Array } from "./NativeU8Array";
import { Plane } from "../math/Plane";
import { Component } from "../core/Component";
import { Constructor } from "../core/Types";
export declare namespace PropertyFactoryInternal {
    const noOp = "_noOp";
}
declare class NativeSerializer<T> {
    type: Constructor<T>;
    readProperty: (json: T) => T;
    writeProperty(data: T): T;
    constructor(ctor: Constructor<T>);
}
declare class NullSerializer<T> {
    type: Constructor<T>;
    readProperty(json: T): void;
    writeProperty(data: T): string;
    constructor(ctor: Constructor<T>);
}
export declare class PropertyFactory {
    static properties: {
        Vector3: NativeSerializer<Vector3>;
        Vector2: NativeSerializer<Vector2>;
        Vector4: NativeSerializer<Vector4>;
        Quaternion: NativeSerializer<Quaternion>;
        Color: NativeSerializer<Color>;
        Matrix44: NullSerializer<Matrix44>;
        SerializableMatrix44: NativeSerializer<SerializableMatrix44>;
        Matrix33: NullSerializer<Matrix33>;
        Rect: NativeSerializer<Rect>;
        FileProperty: NativeSerializer<FileProperty>;
        ThumbnailProperty: NativeSerializer<ThumbnailProperty>;
        String: NativeSerializer<String>;
        Number: NativeSerializer<Number>;
        Boolean: NativeSerializer<Boolean>;
        Range: NativeSerializer<Range>;
        NativeArray: {
            type: typeof NativeArray;
            readProperty: (json: INativeArray) => INativeArray;
            writeProperty: (a: INativeArray) => {
                typeName: string;
                data: NativeType[];
            };
        };
        NativeU8Array: {
            type: typeof NativeU8Array;
            readProperty: (data: string | undefined) => NativeU8Array;
            writeProperty: (a: NativeU8Array) => string | undefined;
        };
        Object: {
            type: ObjectConstructor;
            readProperty: (json: object) => any;
            writeProperty: (obj: object) => object;
        };
        AABB: {
            type: typeof AABB;
            readProperty: (json: AABB) => AABB;
            writeProperty: (p: AABB) => {
                min: {
                    x: number;
                    y: number;
                    z: number;
                };
                max: {
                    x: number;
                    y: number;
                    z: number;
                };
            };
        };
        Plane: {
            type: typeof Plane;
            readProperty: (json: Plane) => Plane;
            writeProperty: (p: Plane) => {
                normal: {
                    x: number;
                    y: number;
                    z: number;
                };
                distFromOrigin: number;
            };
        };
        UISize: {
            type: typeof UISize;
            readProperty: (json: SerializedUISize) => UISize;
            writeProperty: (p: UISize) => {
                type: UISizeType;
                value: number;
            };
        };
        Size: {
            type: typeof Size;
            readProperty: (json: SerializedSize) => Size;
            writeProperty: (p: Size) => {
                type: SizeType;
                value: number;
            };
        };
        VertexBuffer: {
            type: typeof VertexBuffer;
            readProperty: (json: SerializedVertexBuffer) => VertexBuffer;
            writeProperty: (vb: VertexBuffer) => SerializedVertexBuffer;
        };
        ArrayProperty: {
            type: typeof ArrayProperty;
            readProperty: (json: SerializedArrayProperty) => ArrayProperty<any> | null | undefined;
            writeProperty: (p: IArrayProperty) => SerializedArrayProperty;
        };
        Reference: {
            type: typeof Reference;
            readProperty: (json: SerializedReference) => ReferenceBase;
            writeProperty: (p: ReferenceBase) => SerializedReference;
        };
        ReferenceArray: {
            type: typeof ReferenceArray;
            readProperty: (json: SerializedReferenceArray) => ReferenceArray<SerializableObject> | null;
            writeProperty: (p: ReferenceArrayBase) => SerializedReferenceArray;
        };
        AssetReferenceArray: {
            type: typeof AssetReferenceArray;
            readProperty: (json: SerializedAssetReferenceArray) => AssetReferenceArray<Asset> | null;
            writeProperty: (p: AssetReferenceArray<Asset>) => SerializedAssetReferenceArray;
        };
        EntityReference: {
            type: typeof EntityReference;
            readProperty: (json: string) => EntityReference;
            writeProperty: (p: EntityReference) => string | undefined;
        };
        ComponentReference: {
            type: typeof ComponentReference;
            readProperty: (json: SerializedComponentReference) => ComponentReference<Component>;
            writeProperty: (p: ComponentReference<Component>) => SerializedComponentReference;
        };
    };
}
export {};
