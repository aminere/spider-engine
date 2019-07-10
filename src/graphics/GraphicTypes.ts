
export enum BlendingModes {
    None,
    Linear,
    Additive
}

export enum TextureFiltering {
    Linear,
    Nearest
}

export enum CullModes {
    Back,
    Front,
    None
}

// The order represents the actual rendering order
export enum RenderPass {
    Opaque,
    Transparent
}

export enum TextureSizePow2 {
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

export type PrimitiveType =
    "POINTS"
    | "LINE_STRIP"
    | "LINE_LOOP"
    | "LINES"
    | "TRIANGLE_STRIP"
    | "TRIANGLE_FAN"
    | "TRIANGLES";
    