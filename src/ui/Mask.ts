
import { Component } from "../core/Component";
import * as Attributes from "../core/Attributes";
import { AssetReference } from "../serialization/AssetReference";
import { Texture } from "../graphics/texture/Texture";

@Attributes.exclusiveWith([
    "Image", 
    "Text", 
    "Button", 
    "CheckBox"
])
export class Mask extends Component {
    get texture() { return this._texture.asset; }
    set texture(texture: Texture | null) { this._texture.asset = texture; }

    private _texture = new AssetReference(Texture);
}
