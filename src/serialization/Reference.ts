
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Constructor } from "../core/Types";

export class ReferenceBase {
  baseTypeName!: () => string;  
  getInstance!: () => SerializableObject | undefined;
}

export class Reference<T extends SerializableObject> extends ReferenceBase {
    instance?: T;

    constructor(ctor: Constructor<T>, instance?: T) {    
        super();
        this.baseTypeName = () =>  ctor.name;
        this.getInstance = () => this.instance;
        this.instance = instance;        
    }    
}

export interface SerializedReference {
    baseTypeName: string;
    data?: SerializedObject;
}
