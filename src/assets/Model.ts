
import { Asset } from "./Asset";
import { UniqueObject } from "../core/UniqueObject";
import { Material } from "../graphics/Material";
import { StaticMeshAsset } from "./StaticMeshAsset";
import * as Attributes from "../core/Attributes";
import { AssetReference } from "../serialization/AssetReference";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { Matrix44 } from "../math/Matrix44";
import { Reference } from "../serialization/Reference";
import { Animation } from "../animation/Animation";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { SerializedObject } from "../core/SerializableObject";
import { Transform } from "../core/Transform";

export class ModelElement extends UniqueObject {
    
    get parent() { return this._parent; }

    @Attributes.unserializable()
    // tslint:disable-next-line
    userData: any = {};

    @Attributes.hidden()
    children = new ReferenceArray<ModelElement>(ModelElement);
    // @Attributes.hidden()
    transform: Transform;

    /**
     * @hidden
     */
    @Attributes.hidden()
    fbxNodeId!: number;

    @Attributes.unserializable()
    private _parent?: ModelElement;

    constructor() {
        super();
        this.transform = new Transform();
    }

    addChild(child: ModelElement) {
        this.children.grow(child);
        child._parent = this;
    }

    traverse(op: (e: ModelElement) => void) {     
        op(this);
        for (let child of this.children.data.map(r => r.instance)) {
            if (child) {
                child.traverse(op);
            }
        }
    }
}

export class ModelMesh extends ModelElement {
    
    get version() { return 2; }

    material = new AssetReference(Material);
    mesh = new AssetReference(StaticMeshAsset);

    destroy() {
        this.material.detach();
        this.mesh.detach();
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            // convert from array of ModelMeshes to an reference array of ModelElements
            let children = {
                typeName: "ModelElement",
                data: []
            };
            for (let mesh of json.properties.children.data) {
                let child = {
                    baseTypeName: "ModelElement",
                    data: {
                        typeName: json.properties.children.typeName
                    }
                };
                Object.assign(child.data, mesh);
                // tslint:disable-next-line
                (children.data as any).push(child);
            }
            json.properties.children = children;
        }
        return json;
    }
}

export class ModelBone extends ModelElement {
    worldMatrix = new Matrix44();
}

export class ModelSkinnedMesh extends ModelMesh {

    get bindMatrix() { return this._bindMatrix; }    
    set bindMatrix(bindMatrix: Matrix44) {
        this._bindMatrix.copy(bindMatrix);
    }

    /**
     * @hidden
     */
    get boneFbxIds() { return this._bonesFbxIds.data.map(d => d.valueOf()); }
    
    private _bindMatrix = new Matrix44();
    private _bonesFbxIds = new ArrayProperty(Number);

    setBones(bones: ModelBone[]) {
        this._bonesFbxIds.data.length = 0;
        for (let bone of bones) {
            this._bonesFbxIds.grow(bone.fbxNodeId);
        }
    }
}

/**
 * @hidden
 */
export interface ElementFindInfo {
    element: ModelElement;
    parentArray: Reference<ModelElement>[];
    indexInParent: number;
}

@Attributes.creatable(false)
// @Attributes.editable(false)
export class Model extends Asset {
    
    get version() { return 2; }

    get animations() { return this._animations.data.map(a => a.asset as Animation); }
    get animationRefs() { return this._animations; }

    fbxScaleFactor = 1;
    elements = new ReferenceArray(ModelElement);

    private _animations = new AssetReferenceArray(Animation);

    findElement(filter: (e: ModelElement) => boolean, parentArray?: Reference<ModelElement>[]): ElementFindInfo | null {
        const arr = parentArray || this.elements.data;
        for (let i = 0; i < arr.length; ++i) {
            const instance = (arr[i].instance as ModelElement);
            if (filter(instance)) {
                return {
                    element: instance,
                    parentArray: arr,
                    indexInParent: i
                };
            }
        }
        // recurse through children
        for (const elem of arr) {
            const subChildren = (elem.instance as ModelElement).children.data;
            const subElemInfo = this.findElement(filter, subChildren);
            if (subElemInfo) {
                return subElemInfo;
            }
        }
        return null;
    }    

    clearAnimations() {
        this._animations.data.length = 0;
    }

    addAnimation(animation: Animation) {
        this._animations.grow(animation);
    }
   
    destroy() {
        for (const element of this.elements.data) {
            if (element.instance) {
                element.instance.destroy();
            }
        }
        super.destroy();
    }

    traverse(op: (child: ModelElement) => void) {
        for (const elem of this.elements.data.map(r => r.instance)) {
            if (elem) {
               elem.traverse(op);
            }
        }
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            // convert from array of ModelMeshes to an reference array of ModelElements
            const elements = {
                typeName: "ModelElement",
                data: []
            };
            for (const mesh of json.properties.meshes.data) {
                const elem = {
                    baseTypeName: "ModelElement",
                    data: {
                        typeName: json.properties.meshes.typeName
                    }
                };
                Object.assign(elem.data, mesh);
                // tslint:disable-next-line
                (elements.data as any).push(elem);
            }
            Object.assign(json.properties, { elements: elements });
            delete json.properties.meshes;
        }
        return json;
    }
}
