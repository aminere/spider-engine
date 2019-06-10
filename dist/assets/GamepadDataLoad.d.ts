export interface GamepadDataLoad {
    [frame: number]: {
        axes: number[];
        buttons: GamepadButton[];
    };
}
export interface SerializedGamepadData {
    typeName: string;
    version: number;
    id: string;
    name: string;
    data: GamepadDataLoad;
}
