import "reflect-metadata";
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
export declare function defaultType(typeName: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function nullable(param: boolean): {
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
export declare function enumLiterals(enumObject: object, getDisplayName?: (literal: string) => string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function requires(typeName: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function exclusiveWith(typeName: string | string[]): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function rotationAngle(): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
