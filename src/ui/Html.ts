import { Component } from "../core/Component";
import { Reference } from "../serialization/Reference";
import { SerializableObject } from "../core/SerializableObject";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { Interfaces } from "../core/Interfaces";
import { CodeBlockInternal } from "../behavior/CodeBlock";
import * as Attributes from "../core/Attributes";

enum HtmlContainer {
    div,
    span,
    button
}

export class Content extends SerializableObject {
    // TODO mark as rich string to get a better editor experience
    value = "";
}

export class InnerText extends Content { }
export class InnerHtml extends Content { }

export class KeyValue extends SerializableObject {
    key = "";
    value = "";
}

namespace Private {
    export let preCanvasLayer: HTMLDivElement;
    export let postCanvasLayer: HTMLDivElement;
}

export class Html extends Component {

    @Attributes.enumLiterals(HtmlContainer)
    container = HtmlContainer.div;

    content = new Reference(Content);

    classList = new ArrayProperty(String);
    attributes = new ArrayProperty(KeyValue);
    style = new ArrayProperty(KeyValue);
    eventListeners = new ArrayProperty(KeyValue);

    @Attributes.unserializable()
    private _element: HTMLElement | null = null;

    update() {
        if (!this._element) {
            const container = HtmlContainer[this.container];
            const element = document.createElement(container);
            element.id = this.id;

            if (this.content.instance) {
                if (this.content.instance.isA(InnerText)) {
                    element.innerText = this.content.instance.value;
                } else {
                    element.innerHTML = this.content.instance.value;
                }
            }

            this.classList.data.forEach(c => element.classList.add(c.valueOf()));
            this.attributes.data.forEach(a => element.setAttribute(a.key, a.value));
            this.style.data.forEach(a => element.style[a.key] = a.value);            

            const canvas = Interfaces.renderer.canvas;
            if (canvas.parentNode) {
                canvas.parentNode.appendChild(element);
            } else {
                // TODO warning? - detached canvas
            }

            this.eventListeners.data.forEach(e => {
                const event = e.key;
                const handlerCode = e.value;                
                const trimmedId = CodeBlockInternal.trimId(element.id);
                const hook = `function handler_${event}_${trimmedId}(e) { ${handlerCode} }
                document.getElementById('${element.id}').addEventListener('${event}', handler_${event}_${trimmedId});
                `;
                const script = document.createElement("script");
                script.id = `${element.id}_${event}_Script`;
                script.appendChild(document.createTextNode(hook));
                document.head.appendChild(script);
            });

            this._element = element;
        }
    }

    destroy() {
        if (this._element) {
            if (this._element.parentNode) {
                this._element.parentNode.removeChild(this._element);
            }

            this.eventListeners.data.forEach(e => {
                const script = document.getElementById(`${this.id}_${e.key}_Script`);
                if (script) {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }
            });

            this._element = null;
        }
    }
}
