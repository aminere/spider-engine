
import { SerializableObject } from "../core/SerializableObject";

/**
 * @hidden
 */
export class IObjectArray {
  // tslint:disable-next-line
  grow!: (instance?: any) => void;
  typeName!: () => string;
  // tslint:disable-next-line
  getData!: () => any[];
}

/**
* @hidden
*/
export class ObjectArray<T extends SerializableObject> extends IObjectArray {

  data: T[];

  // tslint:disable-next-line
  constructor(ctor: { new(...args: any[]): T; }, data?: T[]) {
    super();
    this.grow = (instance?: T, ...args: any[]) => { this.data.push(instance ? instance : new ctor(...args)); };
    this.typeName = () => { return ctor.name; };
    this.getData = () => { return this.data; };
    this.data = data || [];
  }
}
