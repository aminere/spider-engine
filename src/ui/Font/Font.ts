
import { SerializableObject } from "../../core/SerializableObject";
import { Texture } from "../../graphics/texture/Texture";

export class Font extends SerializableObject {
    getTexture(): Texture {
        console.assert(false, "Calling Abstract Method");
        // tslint:disable-next-line
        return (0 as any) as Texture;
    }

    setText(text: string) {
    }

    setAlignment(alignment: number) {
    }

    getWidth() {
        return 0;
    }

    getHeight() {
        return 0;
    }

    isLoaded() {
        return true;
    }

    /**
     * @hidden
     */
    prepareForRendering(screenScaleFactor: number, maxWidth: number) {
    }
}
