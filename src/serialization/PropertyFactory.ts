import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
import { Vector4 } from "../math/Vector4";
import { Quaternion } from "../math/Quaternion";
import { Color } from "../graphics/Color";
import { Matrix44 } from "../math/Matrix44";
import { Matrix33 } from "../math/Matrix33";
import { AABB } from "../math/AABB";
import { UISize, SerializedUISize, UISizeType } from "../ui/UISize";
import { VertexBuffer, SerializedVertexBuffer, VertexAttribute } from "../graphics/VertexBuffer";
import { Rect } from "../ui/Rect";
import { ArrayProperty, IArrayProperty, SerializedArrayProperty } from "./ArrayProperty";
import { Debug } from "../io/Debug";
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
import { AssetReference } from "./AssetReference";
import { SerializerUtils } from "./SerializerUtils";
import { SerializedPropertyType } from "./SerializedTypes";
import { NativeArray, INativeArray, NativeArrayFactory, NativeType } from "./NativeArray";
import { SerializedObject, SerializableObject } from "../core/SerializableObject";
import { NativeU8Array } from "./NativeU8Array";
import { Plane } from "../math/Plane";
import { Component } from "../core/Component";
import { RTTI } from "../core/RTTI";
import { Interfaces } from "../core/Interfaces";

// Serializer for when the json layout exactly matches the object definition
// Definition must only contain native types (number, string, native arrays, etc.)
// Do not use on complex types!
/**
 * @hidden
 */
export class NativeSerializer<T> {
    // tslint:disable-next-line
    type: { new(...args: any[]): T; };
    readProperty: (json: T) => T;
    writeProperty(data: T) { return data; }

    // tslint:disable-next-line
    constructor(ctor: { new(...args: any[]): T; }) {
        this.type = ctor;
        this.readProperty = (json: T) => {

            // temporary conversion from old format
            // TODO delete this obsolete stuff
            // if (this.type.name === "Matrix44" && Array.isArray(json)) {
            //     console.assert(false);
            //     let m = new Matrix44();
            //     // tslint:disable-next-line
            //     m.data = json as any;
            //     // tslint:disable-next-line
            //     return m as any;

            // } else if (this.type.name === "Vector3" && "x" in json && json.constructor.name === "Object") {
            //     console.assert(false);
            //     Object.assign(json, {
            //         // tslint:disable-next-line
            //         "_x": json["x"], "_y": json["y"], "_z": json["z"]
            //     });
            //     // tslint:disable-next-line
            //     delete json["x"]; delete json["y"]; delete json["z"];

            // } else if (this.type.name === "Quaternion" && "x" in json && json.constructor.name === "Object") {
            //     console.assert(false);
            //     Object.assign(json, {
            //         // tslint:disable-next-line
            //         "_x": json["x"], "_y": json["y"], "_z": json["z"], "_w": json["w"]
            //     });
            //     // tslint:disable-next-line
            //     delete json["x"]; delete json["y"]; delete json["z"]; delete json["w"];
            // }

            if (typeof (json) === "object") {
                return new ctor(...Object.keys(json).map(k => json[k]));
            } else {
                return json;
            }
        };
    }
}

/**
 * @hidden
 */
export interface IProperty {
    // tslint:disable-next-line
    type: any;
    readProperty: (json: SerializedPropertyType) => void;
    // tslint:disable-next-line
    writeProperty: (p: any) => SerializedPropertyType;
}

/**
 * @hidden
 */
export class PropertyFactory {

    static properties = {
        Vector3: new NativeSerializer(Vector3),
        Vector2: new NativeSerializer(Vector2),
        Vector4: new NativeSerializer(Vector4),
        Quaternion: new NativeSerializer(Quaternion),
        Color: new NativeSerializer(Color),
        Matrix44: new NativeSerializer(Matrix44),
        Matrix33: new NativeSerializer(Matrix33),
        Rect: new NativeSerializer(Rect),
        FileProperty: new NativeSerializer(FileProperty),
        ThumbnailProperty: new NativeSerializer(ThumbnailProperty),
        String: new NativeSerializer(String),
        Number: new NativeSerializer(Number),
        Boolean: new NativeSerializer(Boolean),
        Range: new NativeSerializer(Range),

        NativeArray: {
            type: NativeArray,
            readProperty: (json: INativeArray) => {
                return NativeArrayFactory.create(json.typeName, json.data);
            },
            writeProperty: (a: INativeArray): {
                typeName: string,
                data: NativeType[]
            } => {
                return {
                    typeName: a.typeName,
                    data: a.data
                };
            }
        },

        NativeU8Array: {
            type: NativeU8Array,
            readProperty: (data: string | undefined) => {
                return new NativeU8Array(data);
            },
            writeProperty: (a: NativeU8Array) => {
                return a.serialize();
            }
        },

        Object: {
            type: Object,
            readProperty: (json: object) => {
                return JSON.parse(JSON.stringify(json));
            },
            writeProperty: (obj: object) => {
                return obj;
            }
        },

        // AABB
        AABB: {
            type: AABB,
            readProperty: (json: AABB) => {
                const { min, max } = json;
                return new AABB(new Vector3(min.x, min.y, min.z), new Vector3(max.x, max.y, max.z));
            },
            writeProperty: (p: AABB) => {
                return {
                    min: { x: p.min.x, y: p.min.y, z: p.min.z },
                    max: { x: p.max.x, y: p.max.y, z: p.max.z }
                };
            }
        },

        // Plane
        Plane: {
            type: Plane,
            readProperty: (json: Plane) => {
                const { normal, distFromOrigin } = json;
                return new Plane(new Vector3(normal.x, normal.y, normal.z), distFromOrigin);
            },
            writeProperty: (p: Plane) => {
                const { x, y, z } = p.normal;
                return {
                    normal: { x: x, y: y, z: z },
                    distFromOrigin: p.distFromOrigin
                };
            }
        },

        // UISize
        UISize: {
            type: UISize,
            readProperty: (json: SerializedUISize) => {
                let uiSize = new UISize();
                // attempt to convert from old format
                if (typeof(json.type) === "object") {
                    // tslint:disable-next-line
                    uiSize.type = (json.type as any).value;
                } else {
                    uiSize.type = json.type;
                }
                uiSize.value = json.value;
                return uiSize;
            },
            writeProperty: (p: UISize): {
                type: UISizeType,
                value: number
            } => {
                return {
                    type: p.type,
                    value: p.value
                };
            }
        },

        // Size
        Size: {
            type: Size,
            readProperty: (json: SerializedSize) => {
                let size = new Size();
                // attempt to convert from old format
                if (typeof(json.type) === "object") {
                    // tslint:disable-next-line
                    size.type = (json.type as any).value;
                } else {
                    size.type = json.type;
                }                
                size.value = json.value;
                return size;
            },
            writeProperty: (p: Size): {
                type: SizeType,
                value: number
            } => {
                return {
                    type: p.type,
                    value: p.value
                };
            }
        },

        // VertexBuffer
        VertexBuffer: {
            type: VertexBuffer,
            readProperty: (json: SerializedVertexBuffer) => {
                let vb = new VertexBuffer();
                for (let attribute of Object.keys(json.attributes)) {
                    vb.setData(attribute as VertexAttribute, json.attributes[attribute]);
                }                
                vb.primitiveType = json.primitiveType;
                vb.isDynamic = json.isDynamic;
                vb.name = json.name;
                vb.indices = json.indices;
                return vb;
            },

            writeProperty: (vb: VertexBuffer): SerializedVertexBuffer => {
                return {
                    attributes: vb.data,
                    vertexCount: vb.vertexCount,
                    primitiveType: vb.primitiveType,
                    isDynamic: vb.isDynamic,
                    name: vb.name,
                    indices: vb.indices
                };
            }
        },       

        // ArrayProperty
        ArrayProperty: {
            type: ArrayProperty,
            readProperty: (json: SerializedArrayProperty) => {
                // tslint:disable-next-line
                let data: any[] = [];
                data.length = json.data.length;
                for (let i = 0; i < json.data.length; ++i) {
                    SerializerUtils.deserializeProperty(data, i, json.typeName, json.data[i]);
                }

                if (RTTI.isObjectOfType(json.typeName, "SerializableObject")) {
                    return Interfaces.factory.createObjectArray(json.typeName, data);
                } else {

                    if (json.typeName in PropertyFactory.properties) {
                        return new ArrayProperty(PropertyFactory.properties[json.typeName].type, data);
                    } else {
                        Debug.logError(`Unknown type: ${json.typeName}`);
                        return undefined;
                    }
                }
            },

            writeProperty: (p: IArrayProperty): SerializedArrayProperty => {
                let isObject = RTTI.isObjectOfType(p.typeName(), "SerializableObject");
                return {
                    typeName: p.typeName(),                    
                    data: p.getData().map(d => {
                        let element = SerializerUtils.serializeProperty(d, p.typeName());
                        if (isObject) {
                            // No need to serialize the typeName for every single object in the array, 
                            // TypeName is known at the array level.
                            delete element.typeName;
                        }
                        return element;
                    })
                };
            }
        },

        // Reference
        Reference: {
            type: Reference,
            readProperty: (json: SerializedReference) => {
                if (json.data) {
                    let obj = Interfaces.factory.createObject(json.data.typeName as string);
                    if (obj !== null) {
                        obj.deserialize(json.data);
                    }
                    return Interfaces.factory.createReference(json.baseTypeName, obj as SerializableObject) as ReferenceBase;
                } else {
                    return Interfaces.factory.createReference(json.baseTypeName) as ReferenceBase;
                }
            },
            writeProperty: (p: ReferenceBase): SerializedReference => {
                let instance = p.getInstance();
                return {
                    baseTypeName: p.baseTypeName(),
                    data: instance ? instance.serialize() as SerializedObject : undefined
                };
            }
        },

        // ReferenceArray
        ReferenceArray: {
            type: ReferenceArray,
            readProperty: (json: SerializedReferenceArray) => {
                let data = json.data.map(d => PropertyFactory.properties.Reference.readProperty(d));
                return Interfaces.factory.createReferenceArray(json.typeName, data);
            },
            writeProperty: (p: ReferenceArrayBase): SerializedReferenceArray => {
                return {
                    typeName: p.typeName(),
                    data: p.getData().map(r => PropertyFactory.properties.Reference.writeProperty(r))
                };
            }
        },

        // AssetReferenceArray
        AssetReferenceArray: {
            type: AssetReferenceArray,
            readProperty: (json: SerializedAssetReferenceArray) => {
                let data: AssetReference<Asset>[] = [];
                data.length = json.data.length;
                for (let i = 0; i < json.data.length; ++i) {
                    SerializerUtils.deserializeProperty(data, i, "AssetReference", json.data[i]);
                }
                return Interfaces.factory.createAssetReferenceArray(json.typeName, data);
            },
            writeProperty: (p: AssetReferenceArray<Asset>): SerializedAssetReferenceArray => {
                return {
                    typeName: p.typeName(),
                    data: p.data.map(r => SerializerUtils.serializeProperty(r))
                };
            }
        },

        // EntityReference
        EntityReference: {
            type: EntityReference,
            readProperty: (json: string) => new EntityReference(json),
            writeProperty: (p: EntityReference) => p.id
        },

        // ComponentReference
        ComponentReference: {
            type: ComponentReference,
            readProperty: (json: SerializedComponentReference) => {

                // TODO remove after all projects are saved
                // TODO remove this obsolete stuff
                // if (json.componentTypeName === "UIImage") {
                //     console.assert(false);
                //     json.componentTypeName = "Image";
                // } else if (json.componentTypeName === "UIText") {
                //     console.assert(false);
                //     json.componentTypeName = "Text";
                // }

                let typeName = json.componentTypeName;
                let ref = Interfaces.factory.createComponentReference(typeName) as ComponentReference<Component>;
                ref.entityId = json.entityId;
                return ref;
            },
            writeProperty: (p: ComponentReference<Component>): SerializedComponentReference => {
                return {
                    entityId: p.entityId,
                    componentTypeName: p.componentTypeName
                };
            }
        }
    };
}
