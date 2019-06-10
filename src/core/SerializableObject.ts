
import { SerializedObjectType } from "../serialization/SerializedTypes";
import { RTTI } from "./RTTI";
import { ISerializerInternal } from "../serialization/ISerializer";
import { IFactoryInternal } from "../serialization/IFactory";
import { ObjectProps } from "./Types";

export interface SerializedProperty {
    typeName?: string;
    // tslint:disable-next-line
    data: any;
}

export interface SerializedObject {
    typeName?: string;
    version: number;
    properties: { [propertyName: string]: SerializedProperty };
}

export class SerializableObject {

    // tslint:disable-next-line
    isA<T>(type: { new(...args: any[]): T }) {
        return RTTI.isObjectOfType(this.constructor.name, type.name);
    }    

    copy() {
        let copy = IFactoryInternal.instance.createObject(this.constructor.name) as SerializableObject;
        copy.deserialize(this.serialize());
        return copy;
    }   
    
    destroy() {
    }

    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        this[name] = value;        
    }   

    serialize(): SerializedObjectType {
        return ISerializerInternal.instance.serializeObject(this);
    }

    deserialize(json: SerializedObjectType): Promise<SerializableObject> {
        ISerializerInternal.instance.deserializeObject(this, json as SerializedObject);
        return Promise.resolve(this);
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        return json;
    }

    setState<T extends SerializableObject>(props: ObjectProps<T>) {
        Object.entries(props).forEach(([key, value]) => {
            Object.assign(this, { [key]: value });
        });
    }
}
