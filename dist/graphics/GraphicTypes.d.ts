export declare enum BlendingModes {
    None = 0,
    Linear = 1,
    Additive = 2
}
export declare enum TextureFiltering {
    Linear = 0,
    Nearest = 1
}
export declare enum CullModes {
    Back = 0,
    Front = 1,
    None = 2
}
export declare enum RenderPass {
    Opaque = 0,
    Transparent = 1
}
export declare enum TextureSizePow2 {
    _8 = 8,
    _16 = 16,
    _32 = 32,
    _64 = 64,
    _256 = 256,
    _512 = 512,
    _1024 = 1024,
    _2048 = 2048,
    _4096 = 4096
}
export declare type PrimitiveType = "POINTS" | "LINE_STRIP" | "LINE_LOOP" | "LINES" | "TRIANGLE_STRIP" | "TRIANGLE_FAN" | "TRIANGLES";
