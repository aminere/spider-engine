import { Component } from "./Component";
import { Constructor } from "./Types";
export declare class Components {
    static ofType<T extends Component>(ctor: Constructor<T>): T[];
    static ofTypes(ctors: Constructor<Component>[]): {
        [typeName: string]: Component[];
    };
}
