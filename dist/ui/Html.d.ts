import { Component } from "../core/Component";
import { Reference } from "../serialization/Reference";
import { SerializableObject } from "../core/SerializableObject";
import { ArrayProperty } from "../serialization/ArrayProperty";
declare enum HtmlContainer {
    div = 0,
    span = 1,
    button = 2
}
export declare class Content extends SerializableObject {
    value: string;
}
export declare class InnerText extends Content {
}
export declare class InnerHtml extends Content {
}
export declare class KeyValue extends SerializableObject {
    key: string;
    value: string;
}
export declare class Html extends Component {
    container: HtmlContainer;
    content: Reference<Content>;
    classList: ArrayProperty<String>;
    attributes: ArrayProperty<KeyValue>;
    style: ArrayProperty<KeyValue>;
    eventListeners: ArrayProperty<KeyValue>;
    private _element;
    update(): void;
    destroy(): void;
}
export {};
