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
import { Shadow, PCFSoftShadow } from "./Shadow";

export class Light extends Component {

    get version() { return 3; }
    
    set type(type: LightType) { this._type.instance = type; }
    get type() { return this._type.instance as LightType; }

    get castShadows() { return Boolean(this._shadows.instance); }    
    get shadow() { return this._shadows.instance; }

    intensity = 1;
    color = new Color(1, 1, 1, 1);

    @Attributes.enumLiterals(
        TextureSizePow2, 
        name => name.substring(1) // Trim the _ from the display name
    )
    
    @Attributes.nullable(false)
    private _type = new Reference(LightType);
    private _shadows = new Reference(Shadow, new PCFSoftShadow());
    
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
        } else if (previousVersion === 2) {
            Object.assign(json.properties, {
                _shadows: {
                    baseTypeName: "Shadow",
                    data: (() => {
                        if (json.properties.castShadows) {
                            return {
                                typeName: "PCFSoftShadow",
                                version: 1,
                                properties: {
                                    radius: json.properties.shadowRadius
                                }
                            };
                        } else {
                            return undefined;
                        }
                    })()
                }
            });
            delete json.properties.castShadows;
            delete json.properties.shadowRadius;
            delete json.properties.shadowMapSize;
        }
        return json;
    }
}
