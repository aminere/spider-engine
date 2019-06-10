import { Asset } from "../assets/Asset";
import * as Attributes from "../core/Attributes";

@Attributes.creatable(false)
@Attributes.referencable(false)
export class GraphicAsset extends Asset {
    destroy() {
        this.graphicUnload();
        super.destroy();
    }

    graphicLoad() {
        return true;
    }

    graphicUnload() {        
    }
}
