import { UIElement } from "./UIElement";
import { Color } from "../graphics/Color";
import * as Attributes from "../core/Attributes";
import { Reference } from "../serialization/Reference";
import { Font } from "./Font/Font";
import { Layout } from "./Layout";
import { TextAlignment, TextAlignmentMetadata } from "./Alignment";
import { BitmapFont } from "./Font/BitmapFont";
import { SerializedObject } from "../core/SerializableObject";
import { FontFamily } from "./Font/FontFamily";
import { VertexBuffer } from "../graphics/VertexBuffer";

@Attributes.helpUrl("https://docs.spiderengine.io/2d/text.html")
export class Text extends UIElement {

    get version() { return 7; }
    
    set text(text: string) {
        this._text = text || "";
        if (this.font) {
            this.font.setText(text);
        }
    }

    set alignment(alignment: number) {
        this._alignment = alignment;
        if (this.font) {
            this.font.setAlignment(alignment);
        }
    }

    set color(color: Color) {
        this._color.copy(color);
    }

    get text() { return this._text; }
    get color() { return this._color; }
    get font() { return this._font.instance; }    

    private _color: Color;
    private _font: Reference<Font>;
    private _text!: string;    

    @Attributes.enumLiterals(TextAlignmentMetadata.literals)
    private _alignment: TextAlignment;

    constructor() {
        super();
        this._font = new Reference(Font, new FontFamily());
        this.text = "Empty Text";
        this._color = new Color(1, 1, 1, 1);
        this._alignment = TextAlignment.Left;
    }

    /**
     * @hidden
     */
    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === "_text") {
            this.text = value;        
        } else if (name === "_alignment") {
            this.alignment = value;
        } else if (name === "_font") {
            let font = (value as Reference<Font>).instance;
            if (font) {
                font.setText(this._text);
                font.setAlignment(this._alignment);
            }
        }
    }

    /**
     * @hidden
     */
    destroy() {
        if (this.font) {
            this.font.destroy();
        }
        super.destroy();
    }

    isLoaded() {
        if (!super.isLoaded()) {
            return false;
        }
        if (this.font) {
            return this.font.isLoaded();
        }
        return true;
    }

    getVertexBuffer(): VertexBuffer {
        if (this.font) {
            if (this.font.isA(BitmapFont)) {
                let layout = this.entity.getComponent(Layout) as Layout;
                return (this.font as BitmapFont).tesselate(layout.pivot.x, layout.pivot.y);
            }
        }
        return super.getVertexBuffer();
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            delete json.properties.font;
            delete json.properties.yOffset;
        } else if (previousVersion === 2) {
            Object.assign(json.properties, { _text: json.properties.text });
            delete json.properties.text;
        } else if (previousVersion === 3) {
            Object.assign(json.properties, {
                font: {
                    baseTypeName: "Font",
                    data: {
                        typeName: "FontFamily",
                        properties: {
                            family: json.properties.fontFamily
                        }
                    }
                }
            });
            delete json.properties.fontFamily;
        } else if (previousVersion === 4) {
            Object.assign(json.properties, {
                _font: json.properties.font,
                _bold: json.properties.bold,
                _italic: json.properties.italic,
                _tint: json.properties.tint
            });
            Object.assign(json.properties._font.data.properties, {
                size: json.properties.size
            });
            delete json.properties.font;
            delete json.properties.size;
            delete json.properties.bold;
            delete json.properties.italic;
            delete json.properties.tint;
        } else if (previousVersion === 5) {
            Object.assign(json.properties, { _color: json.properties._tint });
            delete json.properties._tint;
        } else if (previousVersion === 6) {
            let font = json.properties._font.data;
            if (font && font.typeName === "FontFamily") {
                Object.assign(font.properties, { 
                    bold: json.properties._bold,
                    italic: json.properties._italic
                });
            }
            delete json.properties._bold;
            delete json.properties._italic;
        }
        return json;
    }
}
