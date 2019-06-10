import { Asset } from "../../assets/Asset";
export declare class FontMetrics extends Asset {
    widths: {
        [charCode: string]: number;
    };
    cellWidth: number;
    cellHeight: number;
    textureWidth: number;
    textureHeight: number;
    startCharacter: number;
}
