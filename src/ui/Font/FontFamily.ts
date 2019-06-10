import { Font } from "./Font";
import { Reference } from "../../serialization/Reference";
import { FontShadow, DefaultFontShadow } from "./FontShadow";
import { FontTexture } from "./FontTexture";
import * as Attributes from "../../core/Attributes";

export class FontFamily extends Font {

    family = "Arial";
    size = 14;
    bold = false;
    italic = false;

    set shadow(shadow: FontShadow | undefined) {
        const previous = this._shadow.instance;
        this._shadow.instance = shadow;
        if (previous) {
            previous.propertyChanged.detach(this.onShadowPropertyChanged);
        }
        if (shadow) {
            shadow.propertyChanged.attach(this.onShadowPropertyChanged);
        }
        this.texture.shadow = shadow;
    }

    @Attributes.unserializable()
    texture: FontTexture;
    
    private _shadow = new Reference(FontShadow);

    constructor() {
        super();

        this.texture = new FontTexture();
        this.texture.size = this.size;
        this.texture.family = this.family;

        this.onShadowPropertyChanged = this.onShadowPropertyChanged.bind(this);
        this.shadow = new DefaultFontShadow();
    }

    setText(text: string) {
        this.texture.text = text;
    }

    setAlignment(alignment: number) {
        this.texture.alignment = alignment;
    }   

    getTexture() {
        return this.texture;
    }

    getWidth() {
        return this.texture.getWidth();
    }

    getHeight() {
        return this.texture.getHeight();
    }

    /**
     * @hidden
     */
    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === "family") {
            this.texture.family = value;
        } else if (name === "size") {
            this.texture.size = value;
        } else if (name === "bold") {
            this.texture.bold = value;
        } else if (name === "italic") {
            this.texture.italic = value;
        } else if (name === "_shadow") {            
            this.shadow = value.instance;
        }
    }

    /**
     * @hidden
     */
    prepareForRendering(screenScaleFactor: number, maxWidth: number) {
        this.texture.scaleFactor = screenScaleFactor;
        this.texture.maxWidth = maxWidth;
    }

    /**
     * @hidden
     */
    destroy() {
        this.texture.destroy();
        if (this._shadow.instance) {
            this._shadow.instance.propertyChanged.detach(this.onShadowPropertyChanged);
        }
        super.destroy();
    }

    private onShadowPropertyChanged(property: string) {
        this.texture.dirtify();
    }
}
