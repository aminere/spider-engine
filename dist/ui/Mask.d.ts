import { Component } from "../core/Component";
import { Texture } from "../graphics/Texture";
export declare class Mask extends Component {
    get texture(): Texture | null;
    set texture(texture: Texture | null);
    private _texture;
}
