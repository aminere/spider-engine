export declare class Color {
    static black: Color;
    static white: Color;
    static red: Color;
    static green: Color;
    static blue: Color;
    static yellow: Color;
    static pink: Color;
    static orange: Color;
    static grey: Color;
    static dummy: Color;
    r: number;
    g: number;
    b: number;
    a: number;
    private _array;
    static lerp(src: Color, dest: Color, factor: number, target?: Color): Color;
    constructor(r?: number, g?: number, b?: number, a?: number);
    set(r: number, g: number, b: number, a?: number): this;
    setFromArray(a: number[]): this;
    setFromChromeColor(r: number, g: number, b: number, a: number): this;
    toChromeColor(): {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    asArray(): number[];
    copy(other: Color): this;
    equals(other: Color): boolean;
    setAlpha(a: number): this;
    multiplyColor(other: Color): this;
    multiply(scalar: number): this;
    add(other: Color): this;
    setHSL(h: number, s: number, l: number): this;
}
