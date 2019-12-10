import { Entity } from "../../core/Entity";
import { SerializedObject } from "../../core/SerializableObject";
import { Reference } from "../../serialization/Reference";
import * as Attributes from "../../core/Attributes";
import { Component } from "../../core/Component";
import { Color } from "../Color";
import { TextureSizePow2 } from "../GraphicTypes";
import { ObjectProps } from "../../core/Types";
import { Transform } from "../../core/Transform";
import { LightType } from "./LightType";
import { DirectionalLight } from "./DirectionalLight";

export class Light extends Component {

    get version() { return 2; }
    
    set type(type: LightType) { this._type.instance = type; }
    get type() { return this._type.instance as LightType; }

    intensity = 1;
    color = new Color(1, 1, 1, 1);
    castShadows = true;

    @Attributes.hidden()
    shadowBias = .00005;

    shadowRadius = 4;

    @Attributes.enumLiterals(
        TextureSizePow2, 
        name => name.substring(1) // Trim the _ from the display name
    )
    shadowMapSize = TextureSizePow2._2048;
    
    @Attributes.nullable(false)
    private _type = new Reference(LightType);
    
    constructor(props?: ObjectProps<Light>) {
        super();        
        if (props) {
            this.setState(props);
        }
        if (!this._type.instance) {
            this._type.instance = new DirectionalLight();
        }
    }

    setEntity(entity: Entity) {
        super.setEntity(entity);
        entity.getOrSetComponent(Transform);
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                _type: json.properties.type
            });
            delete json.properties.type;
        }
        return json;
    }
}
