import { Asset } from "./Asset";
import { SerializedObjectType } from "../serialization/SerializedTypes";
import { GamepadDataLoad, SerializedGamepadData } from "./GamepadDataLoad";
export declare class GamepadData extends Asset {
    readonly version: number;
    data: GamepadDataLoad;
    private _data;
    serialize(): SerializedGamepadData;
    deserialize(_json: SerializedObjectType): Promise<this>;
}
