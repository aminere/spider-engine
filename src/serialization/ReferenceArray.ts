
import { ReferenceBase, Reference, SerializedReference } from "./Reference";
import { SerializableObject } from "../core/SerializableObject";
import { Constructor } from "../core/Types";

export class ReferenceArrayBase {
  // tslint:disable-next-line
  grow!: (instance?: any) => void;
  typeName!: () => string;
  getData!: () => ReferenceBase[];  
}

export class ReferenceArray<T extends SerializableObject> extends ReferenceArrayBase {

    data: Reference<T>[];

    private _clone: () => ReferenceArray<T>;

    constructor(ctor: Constructor<T>, data?: Reference<T>[]) {
        super();
        this.grow = (instance?: T) => this.data.push(new Reference(ctor, instance));
        this.typeName = () => ctor.name;
        this.getData = () => this.data;
        this.data = data || [];

        this._clone = () => {
            let clone = new ReferenceArray(ctor);
            for (var d of this.data) {
                if (d.instance) {
                    clone.grow(d.instance.copy());
                }
            }
            return clone;
        };
    }

    get(index: number) { 
        return this.data[index].instance; 
    }

    copy() {
        return this._clone();
    }

    clear() {
        this.data.length = 0;
    }
}

export interface SerializedReferenceArray {
    typeName: string;
    data: SerializedReference[];
}
