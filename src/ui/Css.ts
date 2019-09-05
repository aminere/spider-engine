import { Component } from "../core/Component";
import * as Attributes from "../core/Attributes";

export class Css extends Component {
    content = "";

    @Attributes.unserializable()
    private _element: HTMLStyleElement | null = null;

    update() {
        if (!this._element) {
            const element = document.createElement("style");
            element.type = "text/css";
            element.innerText = this.content;
            document.head.appendChild(element);
            this._element = element;
        }
    }

    destroy() {
        if (this._element) {
            if (this._element.parentNode) {
                this._element.parentNode.removeChild(this._element);
            }
            this._element = null;
        }
    }
}
