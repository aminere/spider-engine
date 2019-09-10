import { SerializableMatrix44 } from "../math/Matrix44";
import { SerializedObject } from "./SerializableObject";
import { Component } from "./Component";
import { ObjectProps } from "./Types";
import * as Attributes from "../core/Attributes";

export class Bone extends Component {    
    
    get version() { return 2; }

    worldMatrix = new SerializableMatrix44();
    inverseMatrix = new SerializableMatrix44();    

    @Attributes.hidden()
    fbxId = 0;

    constructor(props?: ObjectProps<Bone>) {
        super();
        if (props) {
            this.setState(props);
        }
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                worldMatrix: json.properties.boneWorldMatrix,
                inverseMatrix: json.properties.boneInverseMatrix,
            });
            delete json.properties.boneWorldMatrix;
            delete json.properties.boneInverseMatrix;
        }
        return json;
    }
}
