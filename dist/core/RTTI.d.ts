export declare namespace RTTIInternal {
    function buildTypeTree(): void;
    function registerRawTypeInfo(parentTypeName: string, typeName: string): void;
}
export declare class RTTI {
    static isObjectOfType(thisTypeName: string, typeName: string): boolean;
    static getAncestorTypes(typeName: string, stopAtTypeName?: string): string[];
    static getDerivedObjectTypes(typeName: string): string[];
}
