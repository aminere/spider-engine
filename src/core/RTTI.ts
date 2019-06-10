
interface TypeNode {
    typeName: string;
    parent?: TypeNode;
    derivedTypes: TypeNode[];
}

interface RawTypeInfo {
    typeName: string;
    derivedTypes: string[];
    depth: number;
}

namespace Private {
    export const rootTypeName = "SerializableObject";      
    export const rawTypeInfos: RawTypeInfo[] = [];
    export let typeTree: TypeNode;  
    
    export function findTypeNode(node: TypeNode, typeName: string): TypeNode | undefined {
        if (node.typeName === typeName) {
            return node;
        }

        for (const derived of node.derivedTypes) {
            const match = findTypeNode(derived, typeName);
            if (match) {
                return match;
            }
        }

        return undefined;
    }

    export function getTypesUnderNode(node: TypeNode, types: string[]) {
        for (const derived of node.derivedTypes) {
            types.push(derived.typeName);
            getTypesUnderNode(derived, types);
        }
    }
}

/**
 * @hidden
 */
export namespace RTTIInternal {
    export function buildTypeTree() {
        Private.typeTree = {
            typeName: Private.rootTypeName,
            derivedTypes: []
        };

        const getDepth = (typeName: string): number => {
            let currentType = typeName;
            let depth = 0;
            while (currentType !== Private.rootTypeName) {
                ++depth;
                const parentTypes = Private.rawTypeInfos.filter(e => (
                    e.derivedTypes.some(d => d === currentType)
                ));
                const parentType = parentTypes.length ? parentTypes[0] : undefined;                
                if (!parentType) {
                    // type was not registered using Factory::registerObject!
                    console.assert(
                        false, 
                        `Cannot find parent type for '${currentType}', please register it using Factory.registerObject()`
                    );
                    return -1;
                }
                currentType = parentType.typeName;
            }
            return depth;
        };

        // determine depth for each type
        for (const info of Private.rawTypeInfos) {
            info.depth = getDepth(info.typeName);
        }

        // sort types by depth
        Private.rawTypeInfos.sort((a, b) => a.depth - b.depth);

        // add to the type tree
        for (const type of Private.rawTypeInfos) {
            const node = Private.findTypeNode(Private.typeTree, type.typeName);
            if (node) {
                for (const derived of type.derivedTypes) {
                    node.derivedTypes.push({
                        parent: node,
                        typeName: derived,
                        derivedTypes: []
                    });
                }
            }
        }
    }

    export function registerRawTypeInfo(parentTypeName: string, typeName: string) {
        const infos = Private.rawTypeInfos.filter(e => e.typeName === parentTypeName);
        const info = infos.length ? infos[0] : undefined;
        if (info) {
            info.derivedTypes.push(typeName);
        } else {
            Private.rawTypeInfos.push({
                typeName: parentTypeName,
                derivedTypes: [typeName],
                depth: -1
            });
        }
    }    
}

export class RTTI {
    static isObjectOfType(thisTypeName: string, typeName: string) {
        let typeNode = Private.findTypeNode(Private.typeTree, thisTypeName);
        while (typeNode) {
            if (typeNode.typeName === typeName) {
                return true;
            }
            typeNode = typeNode.parent;
        }
        return false;
    }

    static getAncestorTypes(typeName: string, stopAtTypeName?: string) {
        const ancestorTypes: string[] = [];
        let typeNode = Private.findTypeNode(Private.typeTree, typeName);
        while (typeNode && typeNode.parent && typeNode.parent.typeName !== stopAtTypeName) {
            ancestorTypes.push(typeNode.parent.typeName);
            typeNode = Private.findTypeNode(Private.typeTree, typeNode.parent.typeName);
        }
        return ancestorTypes;
    }

    static getDerivedObjectTypes(typeName: string) {
        const derivedTypes: string[] = [];
        const node = Private.findTypeNode(Private.typeTree, typeName);
        if (node) {
            Private.getTypesUnderNode(node, derivedTypes);
        }
        return derivedTypes;
    }    
}
