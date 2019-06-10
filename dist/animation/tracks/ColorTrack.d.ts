import { SingleTrack } from "./SingleTrack";
import { ColorKey } from "../keys/ColorKey";
import { Color } from "../../graphics/Color";
import { AnimationKey } from "../keys/AnimationKey";
export declare class ColorTrack extends SingleTrack<ColorKey> {
    constructor();
    createKey(time: number, value: Color, created?: (key: AnimationKey) => void): void;
    getSample(time: number, target: Color): Color | undefined;
}
