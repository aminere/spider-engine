
export enum BlendingModes {
    None,
    Linear,
    Additive
}

/**
 * @hidden
 */
export class BlendingModesMetadata {
    static literals = {
        None: 0,
        Linear: 1,
        Additive: 2
    };
}

export enum TextureFiltering {
    Linear,
    Nearest
}

/**
 * @hidden
 */
export class TextureFilteringMetadata {
    static literals = {
        Linear: 0,
        Nearest: 1
    };
}

export enum CullModes {
    Back,
    Front,
    None
}

/**
 * @hidden
 */
export class CullModesMetadata {
    static literals = {
        Back: 0,
        Front: 1,
        None: 2
    };
}

// The order represents the actual rendering order
export enum RenderPass {
    Opaque,
    Transparent
}

/**
 * @hidden
 */
export class RenderPassMetadata {    
    static literals = {        
        Opaque: 0,
        Transparent: 1
    };
}

export enum TextureSizePow2 {
    _8,
    _16,
    _32,
    _64,
    _256,
    _512, 
    _1024,
    _2048,
    _4096
}

/**
 * @hidden
 */
export class TextureSizePow2Metadata {
    static literals = {
        _8: 8,
        _16: 16,
        _32: 32,
        _64: 64,
        _256: 256,
        _512: 512,
        _1024: 1024,
        _2048: 2048,
        _4096: 4096
    };
}

export type PrimitiveType =
    "POINTS"
    | "LINE_STRIP"
    | "LINE_LOOP"
    | "LINES"
    | "TRIANGLE_STRIP"
    | "TRIANGLE_FAN"
    | "TRIANGLES";
    