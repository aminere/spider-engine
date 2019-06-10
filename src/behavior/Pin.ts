
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import * as Attributes from "../core/Attributes";
import { EngineUtils } from "../core/EngineUtils";

/**
 * @hidden
 */
export enum PinType {
    Input,
    Output,
    InputOutput
}

/**
 * @hidden
 */
export class PinReference extends SerializableObject {
    operatorId: string;
    pinId: string;

    constructor(operatorId?: string, pinId?: string) {
        super();
        this.operatorId = operatorId || EngineUtils.makeUniqueId();
        this.pinId = pinId || EngineUtils.makeUniqueId();
    }

    equals(other: PinReference) {
        return this.operatorId === other.operatorId && this.pinId === other.pinId;
    }
}

/**
 * @hidden
 */
export class BasePin extends SerializableObject {    
    
    get version() { return 2; }

    @Attributes.hidden()
    id: string;
    @Attributes.hidden()
    name: string;
    @Attributes.hidden()
    type: PinType;

    constructor(name?: string, type?: PinType, id?: string) {
        super();
        this.id = id || name || EngineUtils.makeUniqueId();
        this.name = name || "NewPin";
        this.type = type || PinType.Input;
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            json.properties.id = json.properties.name;
        }
        return json;
    }
}

/**
 * @hidden
 */
@Attributes.displayName("Signal")
export class SignalPin extends BasePin {
}

/**
 * @hidden
 */
export class DataPin extends BasePin {
    // tslint:disable-next-line
    setData(data: any) {}
    // tslint:disable-next-line
    getData(): any {}
}
