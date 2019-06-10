import { VertexBuffer } from "../VertexBuffer";

namespace Internal {
    export let quad: VertexBuffer;    
    export let centeredQuad: VertexBuffer;
    export let uiQuad: VertexBuffer;
    export let skyBox: VertexBuffer;

    quad = new VertexBuffer();
    quad.setData(
        "position",
        [
            0, 0, 0, // Bottom left
            1, 0, 0, // Bottom right
            1, 1, 0, // Top right                
            0, 0, 0, // Bottom left                
            1, 1, 0, // Top right
            0, 1, 0, // Top left
        ]
    );
    quad.setData(
        "uv",
        [
            0, 0, // Bottom left                
            1, 0, // Bottom right
            1, 1, // Top right     
            0, 0, // Bottom left
            1, 1, // Top right
            0, 1, // Top Left            
        ]
    );        
    quad.setData(
        "normal",
        [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ]
    );  
    quad.primitiveType = "TRIANGLES";

    centeredQuad = new VertexBuffer();
    centeredQuad.setData(
        "position",
        [
            -1, -1, 0.0, // Bottom left
            1, -1, 0.0, // Bottom right                
            1, 1, 0.0, // Top right
            -1, -1, 0.0, // Bottom left
            1, 1, 0.0, // Top right            
            -1, 1, 0.0, // Top left
        ]
    );              
    centeredQuad.setData("uv", quad.data.uv);
    centeredQuad.setData("normal", quad.data.normal);
    centeredQuad.primitiveType = "TRIANGLES";

    uiQuad = new VertexBuffer();
    uiQuad.setData(
        "position",
        [
            0, 0, 0.0, // Top left
            1, 0, 0.0, // Top right
            0, 1, 0.0, // Bottom left
            0, 1, 0.0, // Bottom left
            1, 0, 0.0, // Top right
            1, 1, 0.0, // Bottom right
        ]
    );
    uiQuad.setData(
        "uv",
        [
            0, 1, // Top left
            1, 1, // Top right
            0, 0, // Bottom left
            0, 0, // Bottom left
            1, 1, // Top right
            1, 0 // Bottom right
        ]
    );
    uiQuad.primitiveType = "TRIANGLES";
}

export class GeometryProvider {
    static get quad() { return Internal.quad; }
    static get centeredQuad() { return Internal.centeredQuad; }
    static get uiQuad() { return Internal.uiQuad; }
    static get skyBox() { 
        if (!Internal.skyBox) {
            let skyBox = new VertexBuffer();
            const size = 1;
            skyBox.setData(
                "position",
                [
                    -size,  size, -size,
                    -size, -size, -size,
                     size, -size, -size,
                     size, -size, -size,
                     size,  size, -size,
                    -size,  size, -size,
                    
                    -size, -size,  size,
                    -size, -size, -size,
                    -size,  size, -size,
                    -size,  size, -size,
                    -size,  size,  size,
                    -size, -size,  size,
                    
                     size, -size, -size,
                     size, -size,  size,
                     size,  size,  size,
                     size,  size,  size,
                     size,  size, -size,
                     size, -size, -size,
                     
                    -size, -size,  size,
                    -size,  size,  size,
                     size,  size,  size,
                     size,  size,  size,
                     size, -size,  size,
                    -size, -size,  size,
                    
                    -size,  size, -size,
                     size,  size, -size,
                     size,  size,  size,
                     size,  size,  size,
                    -size,  size,  size,
                    -size,  size, -size,
                    
                    -size, -size, -size,
                    -size, -size,  size,
                     size, -size, -size,
                     size, -size, -size,
                    -size, -size,  size,
                     size, -size,  size
                ]                
            );
            skyBox.primitiveType = "TRIANGLES";
            Internal.skyBox = skyBox;
        }		
        return Internal.skyBox; 
    }

    static unload(gl: WebGLRenderingContext) {
        Internal.centeredQuad.unload(gl);
        Internal.quad.unload(gl);
        Internal.uiQuad.unload(gl);
        if (Internal.skyBox) {
            Internal.skyBox.unload(gl);
        }
    }
}
