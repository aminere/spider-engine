
import { Asset } from "../assets/Asset";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { Entity, EntityInternal } from "../core/Entity";
import { AnimationTrack } from "./tracks/AnimationTrack";
import { AnimationTrackDefinition } from "./AnimationTrackDefinition";
import * as Attributes from "../core/Attributes";

@Attributes.editable(false)
export class Animation extends Asset {

    set duration(duration: number) { this._duration = duration; }
    get duration() { return this._duration; }

    /**
     * @hidden
     */
    set imported(imported: boolean) { this._imported = imported; }
    /**
     * @hidden
     */
    get imported() { return this._imported; }

    @Attributes.hidden()
    tracks = new ArrayProperty(AnimationTrackDefinition);

    // @Attributes.hidden()
    private _duration = 0;

    @Attributes.hidden()
    private _imported = false;

    isLoaded() {
        for (const trackDef of this.tracks.data) {
            let track = trackDef.track.instance as AnimationTrack;
            if (!track.isLoaded()) {
                return false;
            }
        }
        return true;
    }

    /**
     * @hidden
     */
    static getPropertyAtPath(entity: Entity, path: string) {

        // tslint:disable-next-line
        const internalGetPropertyAtPath = (obj: object, tokens: string[], currentToken: number): any => {
            const currentProperty = tokens[currentToken];
            if (currentProperty in obj) {
                if (currentToken === tokens.length - 1) {
                    return obj[currentProperty];
                } else {
                    console.assert(typeof (obj) === "object");
                    return internalGetPropertyAtPath(obj[currentProperty], tokens, currentToken + 1);
                }
            } else {
                return undefined;
            }
        };

        const tokens = path.split("/");
        if (tokens.length > 1) {
            const typeName = tokens[0];
            const component = EntityInternal.getComponentByName(entity, typeName);
            if (component) {
                return internalGetPropertyAtPath(component, tokens, 1);
            }
        }
    }
}    