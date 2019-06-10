import { Converter } from "../Converter";
export declare class ScreenToRay extends Converter {
    private _screenPos;
    private _camera;
    private _ray;
    constructor();
    convert(): void;
}
