
import { Reference } from "../serialization/Reference";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { EngineUtils } from "../core/EngineUtils";
import * as Attributes from "../core/Attributes";
import { AnimationTrack } from "./tracks/AnimationTrack";
import { AnimationTrackTransition } from "./AnimationTypes";

export class AnimationTrackDefinition extends SerializableObject {

    get version() { return 5; }
    get id() { return this._id; }    

    propertyPath!: string;
    @Attributes.hidden()
    track!: Reference<AnimationTrack>;
    targetName?: string;

    @Attributes.unserializable()    
    transition!: AnimationTrackTransition;

    private _id: string;
    
    constructor() {
        super();
        this._id = EngineUtils.makeUniqueId();
    }    

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            if (json.properties.propertyPath && json.properties.propertyPath.data.indexOf("Visual/material") >= 0) {
                json.properties.propertyPath.data 
                    = json.properties.propertyPath.data.replace("Visual/material", "Visual/_material");
            }            
        } else if (previousVersion === 2) {
            if (json.properties.propertyPath && json.properties.propertyPath.data.indexOf("UIImage/fill") >= 0) {
                json.properties.propertyPath.data 
                    = json.properties.propertyPath.data.replace("UIImage/fill", "UIImage/_fill");
            }    
        } else if (previousVersion === 3) {
            if (json.properties.propertyPath && json.properties.propertyPath.data.indexOf("UIImage/") >= 0) {
                json.properties.propertyPath.data 
                    = json.properties.propertyPath.data.replace("UIImage/", "Image/");
            } 
            if (json.properties.propertyPath && json.properties.propertyPath.data.indexOf("UIText/") >= 0) {
                json.properties.propertyPath.data 
                    = json.properties.propertyPath.data.replace("UIText/", "Text/");
            } 
        } else if (previousVersion === 4) {
            json.properties.propertyPath.data = json.properties.propertyPath.data
                .replace(/Transform\/local(Position|Rotation|Scale)/, (i: string, j: string) => {
                    return `Transform/${j.toLowerCase()}`;
                });
        }
        return json;
    }
}
