import { VertexBuffer } from "./VertexBuffer";
import { Shader } from "./shading/Shader";
import { IObjectManagerInternal } from "../core/IObjectManager";

export class GraphicUtils {
    public static drawVertexBuffer(vb: VertexBuffer, shader: Shader) {
        vb.begin(shader);
        vb.draw();
        vb.end(shader);
    }

    public static invalidateShaders() {
        IObjectManagerInternal.instance.forEach(o => {
            if (o.isA(Shader)) {
                (o as Shader).invalidate();
            }
        });
    }
}
