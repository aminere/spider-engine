
import { Asset } from "../Asset";
import * as Attributes from "../../core/Attributes";
import { ReferenceArray } from "../../serialization/ReferenceArray";
import { Animation } from "../../animation/Animation";
import { AssetReferenceArray } from "../../serialization/AssetReferenceArray";
import { SerializedObject } from "../../core/SerializableObject";
import { ModelElement } from "./ModelElement";

@Attributes.creatable(false)
// @Attributes.editable(false)
export class Model extends Asset {
    
    get version() { return 2; }

    get animations() { return this._animations.data.map(a => a.asset as Animation); }
    get animationRefs() { return this._animations; }

    fbxScaleFactor = 1;
    elements = new ReferenceArray(ModelElement);

    private _animations = new AssetReferenceArray(Animation);

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

    isLoaded() {
        for (const element of this.elements.data) {
            if (element.instance && !element.instance.isLoaded()) {
                return false;
            }
        }
        return true;
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
