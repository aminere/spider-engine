import { DataPin, PinType } from "./Pin";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Color } from "../graphics/Color";
import { AssetReference } from "../serialization/AssetReference";
import { EntityReference } from "../serialization/EntityReference";
import { ComponentReference } from "../serialization/ComponentReference";
import * as Attributes from "../core/Attributes";
import { CollisionInfo } from "../collision/CollisionInfo";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { Asset } from "../assets/Asset";
import { Prefab } from "../assets/Prefab";
import { ObjectReference } from "../serialization/ObjectReference";
import { SerializedObject } from "../core/SerializableObject";
import { Ray } from "../math/Ray";
import { Component } from "../core/Component";
import { Interfaces } from "../core/Interfaces";

namespace Private {
    export let defaultComponentType = "Transform";
    export let defaultAssetType = "Material";
}

export class TDataPin<T> extends DataPin {

    static runtimeValueAccessor = "_value";

    value!: T;

    constructor(id?: string, type?: PinType) {
        super(id, type);
        Object.defineProperty(
            this,
            TDataPin.runtimeValueAccessor,
            {
                get: () => this.value,
                set: value => this.value = value,
                configurable: true
            }
        );
    }
    setData(data: T) { this.value = data; }
    getData() { return this.value; }
}

@Attributes.displayName("Number")
export class NumberPin extends TDataPin<number> {
    constructor(id?: string, type?: PinType, value?: number) { super(id, type); this.value = value || 0; }
}

@Attributes.displayName("String")
export class StringPin extends TDataPin<string> {
    constructor(id?: string, type?: PinType) { super(id, type); this.value = ""; }
}

@Attributes.displayName("Boolean")
export class BooleanPin extends TDataPin<boolean> {
    constructor(id?: string, type?: PinType) { super(id, type); this.value = false; }
}

@Attributes.displayName("Vector2")
export class Vector2Pin extends TDataPin<Vector2> {
    constructor(id?: string, type?: PinType) { super(id, type); this.value = new Vector2(); }
    setData(data: Vector2) {
        this.value.copy(data);
    }
}

@Attributes.displayName("Vector3")
export class Vector3Pin extends TDataPin<Vector3> {
    constructor(id?: string, type?: PinType) { super(id, type); this.value = new Vector3(); }
    setData(data: Vector3) {
        this.value.copy(data);
    }
}

@Attributes.displayName("Vector4")
export class Vector4Pin extends TDataPin<Vector4> {
    constructor(id?: string, type?: PinType) { super(id, type); this.value = new Vector4(); }
    setData(data: Vector4) {
        this.value.copy(data);
    }
}

@Attributes.displayName("Color")
export class ColorPin extends TDataPin<Color> {
    constructor(id?: string, type?: PinType) { super(id, type); this.value = new Color(); }
    setData(data: Color) {
        this.value.copy(data);
    }
}

@Attributes.displayName("Ray")
export class RayPin extends TDataPin<Ray> {
    constructor(id?: string, type?: PinType) { super(id, type); this.value = new Ray(); }
    setData(data: Ray) {
        this.value.copy(data);
    }
}

@Attributes.displayName("Prefab")
export class PrefabPin extends TDataPin<AssetReference<Prefab>> {
    constructor(id?: string, type?: PinType) {
        super(id, type);
        this.value = new AssetReference(Prefab);
        Object.defineProperty(
            this,
            TDataPin.runtimeValueAccessor, 
            {
                get: () => this.value.asset,
                set: value => this.value.asset = value
            }
        );
    }
}

@Attributes.displayName("Entity")
export class EntityReferencePin extends TDataPin<EntityReference> {
    constructor(id?: string, type?: PinType) {
        super(id, type);
        this.value = new EntityReference();
        Object.defineProperty(
            this,
            TDataPin.runtimeValueAccessor,
            {
                get: () => this.value.entity,
                set: value => this.value.entity = value
            }
        );
    }
}

@Attributes.displayName("Component")
export class ComponentReferencePin<T extends Component> extends TDataPin<ComponentReference<T>> {
    
    get version() { return 3; }

    get componentType() { return this._componentType; }
    set componentType(type: string) {
        this.value = Interfaces.factory.createComponentReference(type) as ComponentReference<T>;
        this._componentType = type;
    }

    private _componentType: string;

    constructor(id?: string, type?: PinType, componentType?: string) {
        super(id, type);
        this._componentType = componentType || Private.defaultComponentType;
        Object.defineProperty(
            this,
            TDataPin.runtimeValueAccessor,
            {
                get: () => this.value.component,
                set: value => this.value.component = value
            }
        );
    }

    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === "_componentType" && !this.value) {
            this.componentType = value;
        }
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            json = super.upgrade(json, previousVersion);

        } else if (previousVersion === 2) {
            // tslint:disable-next-line
            let type = json.properties["_componentType"] as any;
            if (type === "UIImage") {
                Object.assign(json.properties, { _componentType: "Image" });
            } else if (type === "UIText") {
                Object.assign(json.properties, { _componentType: "Text" });
            }
        }
        return json;
    }
}

@Attributes.displayName("CollisionInfo")
export class CollisionInfoPin extends TDataPin<CollisionInfo> {
    constructor(id?: string, type?: PinType) { super(id, type); }
}

export class ObjectReferencePin extends TDataPin<ObjectReference> {
    get declarationId() { return this._declarationId; }
    set declarationId(declarationId: string) {
        this.value = new ObjectReference(declarationId);
        this._declarationId = declarationId;
    }

    @Attributes.hidden()
    private _declarationId!: string;

    constructor(declarationId: string, id?: string, type?: PinType) {
        super(id, type);
        this.value = new ObjectReference(declarationId);
        Object.defineProperty(
            this,
            TDataPin.runtimeValueAccessor,
            {
                get: () => this.value.asset,
                set: value => this.value.asset = value
            }
        );
    }

    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === "_declarationId" && this.value.declarationId !== value) {
            this.value = new ObjectReference(value);
        }
    }
}

@Attributes.displayName("Array")
export class ArrayPin<T extends DataPin> extends TDataPin<ArrayProperty<T>> {

    get dataType() { return this._dataType; }
    set dataType(type: string | undefined) {
        if (type) {
            this.value = Interfaces.factory.createObjectArray(type) as ArrayProperty<T>;
        }
        this._dataType = type;
        delete this._declarationId;
    }

    get declarationId() { return this._declarationId; }
    set declarationId(declarationId: string | undefined) {
        if (declarationId) {
            if (!this.value || this.value.typeName() !== "ObjectReferencePin") {
                this.value = Interfaces.factory.createObjectArray("ObjectReferencePin") as ArrayProperty<T>;
            }
            // override growth function
            this.value.grow = (instance?: T) => {
                if (!instance) {                    
                    // No idea why casting from ObjectReferencePin to T (DataPin) doesn't work
                    // tslint:disable-next-line
                    instance = new ObjectReferencePin(declarationId) as any;                    
                } else {
                    // tslint:disable-next-line
                    ((instance as any) as ObjectReferencePin).declarationId = declarationId;
                }

                this.value.data.push(instance as T);
            };
        }
        this._declarationId = declarationId;
        delete this._dataType;
    }

    private _dataType?: string;
    private _declarationId?: string;

    @Attributes.unserializable()
    private _isDirty = true;
    @Attributes.unserializable()
    // tslint:disable-next-line
    private _runtimeData!: any[];

    constructor(id?: string, type?: PinType, declarationId?: string) {
        super(id, type);
        Object.defineProperty(
            this,
            TDataPin.runtimeValueAccessor,
            {
                get: () => {
                    if (this._isDirty) {
                        this._runtimeData = this.value.data.map(e => e[TDataPin.runtimeValueAccessor]);
                        this._isDirty = false;
                    }
                    return this._runtimeData;
                },
                // tslint:disable-next-line
                set: (data: any[]) => {
                    this.value.data = data.map(d => {
                        // tslint:disable-next-line                    
                        let pin: any = new TDataPin<any>();
                        pin.value = d;
                        return pin as T;
                    });
                    this._isDirty = true;
                }
            }
        );
    }

    setData(data: ArrayProperty<T>) {
        super.setData(data);
        this._isDirty = true;
    }

    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === "_dataType" && !this.value) {
            this.dataType = value;
            // Need to go through this to make sure the grow() function has been overriden
        } else if (name === "_declarationId") {
            this.declarationId = value;
        }
    }
}

@Attributes.displayName("Asset")
export class AssetPin<T extends Asset> extends TDataPin<AssetReference<T>> {

    get assetType() { return this._assetType; }
    set assetType(type: string) {
        this.value = Interfaces.factory.createAssetReference(type) as AssetReference<T>;
        this._assetType = type;
    }

    private _assetType: string;

    constructor(id?: string, type?: PinType, assetType?: string) {
        super(id, type);
        this._assetType = assetType || Private.defaultAssetType;
        Object.defineProperty(
            this,
            TDataPin.runtimeValueAccessor,
            {
                get: () => this.value.asset,
                set: value => this.value.asset = value
            }
        );
    }

    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === "_assetType" && !this.value) {
            this.assetType = value;
        }
    }
}
