import { VertexBuffer } from "../VertexBuffer";

namespace Private {
    export let quad: VertexBuffer;
    export let centeredQuad: VertexBuffer;
    export let uiQuad: VertexBuffer;
    export let skyBox: VertexBuffer;

    quad = new VertexBuffer({
        attributes: {
            position: [
                0, 0, 0, // Bottom left
                1, 0, 0, // Bottom right
                1, 1, 0, // Top right                
                0, 0, 0, // Bottom left                
                1, 1, 0, // Top right
                0, 1, 0, // Top left
            ],
            uv: [
                0, 0, // Bottom left                
                1, 0, // Bottom right
                1, 1, // Top right     
                0, 0, // Bottom left
                1, 1, // Top right
                0, 1, // Top Left            
            ],
            normal:
                [
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1
                ]
        },
        primitiveType: "TRIANGLES"
    });

    centeredQuad = new VertexBuffer({
        attributes: {
            position: [
                -1, -1, 0.0, // Bottom left
                1, -1, 0.0, // Bottom right                
                1, 1, 0.0, // Top right
                -1, -1, 0.0, // Bottom left
                1, 1, 0.0, // Top right            
                -1, 1, 0.0, // Top left
            ],
            uv: quad.attributes.uv as number[],
            normal: quad.attributes.normal as number[]
        },
        primitiveType: "TRIANGLES"
    });

    uiQuad = new VertexBuffer({
        attributes: {
            position: [
                0, 0, 0.0, // Top left
                1, 0, 0.0, // Top right
                0, 1, 0.0, // Bottom left
                0, 1, 0.0, // Bottom left
                1, 0, 0.0, // Top right
                1, 1, 0.0, // Bottom right    
            ],
            uv: [
                0, 1, // Top left
                1, 1, // Top right
                0, 0, // Bottom left
                0, 0, // Bottom left
                1, 1, // Top right
                1, 0 // Bottom right
            ]
        },
        primitiveType: "TRIANGLES"
    });
}

export class GeometryProvider {
    static get quad() { return Private.quad; }
    static get centeredQuad() { return Private.centeredQuad; }
    static get uiQuad() { return Private.uiQuad; }
    static get skyBox() {
        if (!Private.skyBox) {
            const size = 1;
            const skyBox = new VertexBuffer({
                attributes: {
                    position: [
                        -size, size, -size,
                        -size, -size, -size,
                        size, -size, -size,
                        size, -size, -size,
                        size, size, -size,
                        -size, size, -size,

                        -size, -size, size,
                        -size, -size, -size,
                        -size, size, -size,
                        -size, size, -size,
                        -size, size, size,
                        -size, -size, size,

                        size, -size, -size,
                        size, -size, size,
                        size, size, size,
                        size, size, size,
                        size, size, -size,
                        size, -size, -size,

                        -size, -size, size,
                        -size, size, size,
                        size, size, size,
                        size, size, size,
                        size, -size, size,
                        -size, -size, size,

                        -size, size, -size,
                        size, size, -size,
                        size, size, size,
                        size, size, size,
                        -size, size, size,
                        -size, size, -size,

                        -size, -size, -size,
                        -size, -size, size,
                        size, -size, -size,
                        size, -size, -size,
                        -size, -size, size,
                        size, -size, size
                    ]
                },
                primitiveType: "TRIANGLES"

            });
            Private.skyBox = skyBox;
        }
        return Private.skyBox;
    }

    static unload(gl: WebGLRenderingContext) {
        Private.centeredQuad.unload(gl);
        Private.quad.unload(gl);
        Private.uiQuad.unload(gl);
        if (Private.skyBox) {
            Private.skyBox.unload(gl);
        }
    }
}
