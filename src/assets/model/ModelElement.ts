import { UniqueObject } from "../../core/UniqueObject";
import { ReferenceArray } from "../../serialization/ReferenceArray";
import { Transform } from "../../core/Transform";
import * as Attributes from "../../core/Attributes";

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

    isLoaded() {
        return true;
    }
}
