
import * as Attributes from "../../core/Attributes";
import { Asset } from "../../assets/Asset";

@Attributes.displayName("Font Metrics")
@Attributes.creatable(false)
export class FontMetrics extends Asset {
    widths: { [charCode: string]: number; } = {};
    cellWidth = 32;
    cellHeight = 32;
    textureWidth = 512;
    textureHeight = 256;
    startCharacter = 32;
}