import "reflect-metadata";
import { EnumLiterals } from "./EnumLiterals";
export declare function hidden(): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function unserializable(): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function editable(param: boolean): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function creatable(param: boolean): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function referencable(param: boolean): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function mandatory(): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function hasDedicatedEditor(param: boolean): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function displayName(name: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function sortOrder(order: number): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function helpUrl(url: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function enumLiterals(literals: EnumLiterals, getDisplayName?: (literal: string) => string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function requires(typeName: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
