import { UIElement } from "./UIElement";
import { Reference } from "../serialization/Reference";
import { UIFill } from "./UIFill";
import * as Attributes from "../core/Attributes";
import { Layout } from "./Layout";
import { UIFillUtils } from "./UIFillUtils";
import { SerializedObject } from "../core/SerializableObject";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { ObjectProps } from "../core/Types";

@Attributes.helpUrl("https://docs.spiderengine.io/2d/image.html")
export class Image extends UIElement {    
    get version() { return 2; }

    get fill() { return this._fill.instance; }
    set fill(fill: UIFill | undefined) { this._fill.instance = fill; }

    private _fill = new Reference(UIFill);

    constructor(props?: ObjectProps<Image>) {
        super();
        if (props) {
            this.setState(props);
        }
    }  

    isLoaded() {
        if (this._fill.instance) {
            return this._fill.instance.isLoaded();
        }
        return true;
    }

    getVertexBuffer(): VertexBuffer {
        return UIFillUtils.getVertexBuffer(this.entity.getComponent(Layout) as Layout, this._fill.instance);
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {        
        if (previousVersion === 1) {
            Object.assign(json.properties, { 
                _fill: json.properties.fill
            });
            delete json.properties.fill;
        }
        return json;
    }
}    
