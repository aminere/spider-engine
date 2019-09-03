
import { Asset } from "./Asset";
import { SerializedObjectType } from "../serialization/SerializedTypes";
import * as Attributes from "../core/Attributes";
import { GamepadDataLoad, SerializedGamepadData } from "./GamepadDataLoad";
import { IObjectManagerInternal } from "../core/IObjectManager";

@Attributes.displayName("Gamepad Data")
export class GamepadData extends Asset {
    
    get version() { return 1; }

    set data(data: GamepadDataLoad) {
        this._data = data;
        IObjectManagerInternal.instance.saveObject(this);
    }

    get data() {
        return this._data;
    }

    private _data: GamepadDataLoad = {};

    serialize(): SerializedGamepadData {
        return {
            typeName: this.constructor.name,
            version: this.version,
            id: this.id,
            name: this.name,
            data: this._data
        };
    }

    deserialize(_json: SerializedObjectType) {
        let json = _json as SerializedGamepadData;
        this.id = json.id;
        this.name = json.name;
        this._data = json.data;
        return Promise.resolve(this);
    }
}
