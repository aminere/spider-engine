import { ModelElement } from "./ModelElement";
import { SerializableMatrix44 } from "../../math/Matrix44";

export class ModelBone extends ModelElement {
    worldMatrix = new SerializableMatrix44();
}