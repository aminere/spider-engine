import { SerializableObject } from "../../core/SerializableObject";

export class LensFlare extends SerializableObject {    
}

export class BasicLensFlare extends LensFlare {
    // render(gl: WebGLRenderingContext, sunPosition: Vector3, camera: Camera) {
    //     let renderer = Interfaces.renderer;
    //     let fullScreenShader = renderer.getFullScreenShader();
    //     if (!fullScreenShader.begin()) {
    //         return;
    //     }        
    //     let absoluteSunPos = Vector3.fromPool().copy(sunPosition).multiply(999999); // TODO use real far plane        
    //     let viewPosition = Vector3.fromPool();
    //     camera.getViewPosition(absoluteSunPos, viewPosition);        
    // }
}
