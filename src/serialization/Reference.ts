
import { SerializableObject, SerializedObject } from "../core/SerializableObject";

/**
 * @hidden
 */
export class ReferenceBase {
  baseTypeName!: () => string;  
  getInstance!: () => SerializableObject | undefined;
}

/**
 * @hidden
 */
export class Reference<T extends SerializableObject> extends ReferenceBase {
    instance?: T;

    constructor(ctor: { new(): T; }, instance?: T) {    
        super();
        this.baseTypeName = () =>  ctor.name;
        this.getInstance = () => this.instance;
        this.instance = instance || undefined;        
    }    
}

/**
 * @hidden
 */
export interface SerializedReference {
    baseTypeName: string;
    data?: SerializedObject;
}
