import { ModelElement } from "./ModelElement";
import { Matrix44 } from "../../math/Matrix44";

export class ModelBone extends ModelElement {
    worldMatrix = new Matrix44();
}