import { Converter } from "../Converter";
export declare class RayCastOnPlane extends Converter {
    private _ray;
    private _planeNormal;
    private _planeDist;
    private _intersects;
    private _intersection;
    private _plane;
    constructor();
    convert(): void;
}
