export declare enum BlendingModes {
    None = 0,
    Linear = 1,
    Additive = 2
}
/**
 * @hidden
 */
export declare class BlendingModesMetadata {
    static literals: {
        None: number;
        Linear: number;
        Additive: number;
    };
}
export declare enum TextureFiltering {
    Linear = 0,
    Nearest = 1
}
/**
 * @hidden
 */
export declare class TextureFilteringMetadata {
    static literals: {
        Linear: number;
        Nearest: number;
    };
}
export declare enum CullModes {
    Back = 0,
    Front = 1,
    None = 2
}
/**
 * @hidden
 */
export declare class CullModesMetadata {
    static literals: {
        Back: number;
        Front: number;
        None: number;
    };
}
export declare enum RenderPass {
    Opaque = 0,
    Transparent = 1
}
/**
 * @hidden
 */
export declare class RenderPassMetadata {
    static literals: {
        Opaque: number;
        Transparent: number;
    };
}
export declare enum TextureSizePow2 {
    _8 = 0,
    _16 = 1,
    _32 = 2,
    _64 = 3,
    _256 = 4,
    _512 = 5,
    _1024 = 6,
    _2048 = 7,
    _4096 = 8
}
/**
 * @hidden
 */
export declare class TextureSizePow2Metadata {
    static literals: {
        _8: number;
        _16: number;
        _32: number;
        _64: number;
        _256: number;
        _512: number;
        _1024: number;
        _2048: number;
        _4096: number;
    };
}
export declare type PrimitiveType = "POINTS" | "LINE_STRIP" | "LINE_LOOP" | "LINES" | "TRIANGLE_STRIP" | "TRIANGLE_FAN" | "TRIANGLES";
