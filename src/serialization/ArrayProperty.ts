
/**
 * @hidden
 */
export class IArrayProperty {
  // tslint:disable-next-line
  grow!: (instance?: any) => void;
  typeName!: () => string;
  // tslint:disable-next-line
  getData!: () => any[];
}

/**
 * @hidden
 */
export class ArrayProperty<T> extends IArrayProperty {
  
  data: T[];

  // tslint:disable-next-line
  constructor(ctor: { new(...args: any[]): T; }, data?: T[]) {
    super();
    this.grow = (instance?: T) => this.data.push(instance ? instance : new ctor());
    this.typeName = () => ctor.name;
    this.getData = () => this.data;
    this.data = data || [];
  }

  clear() {
    this.data.length = 0;
  }
}

/**
 * @hidden
 */
export interface SerializedArrayProperty {
  typeName: string;
  // tslint:disable-next-line
  data: any[];
}
