import { MathEx } from "../math/MathEx";

namespace Private {
    export function hue2rgb(p: number, q: number, t: number) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * 6 * (2 / 3 - t);
        }
        return p;
    }
}

export class Color {

    static black = new Color();
    static white = new Color(1.0, 1.0, 1.0);
    static red = new Color(1.0, 0.0, 0.0);
    static green = new Color(0.0, 1.0, 0.0);
    static blue = new Color(0.0, 0.0, 1.0);
    static yellow = new Color(1.0, 1.0, 0.0);
    static pink = new Color(1.0, 0.0, 1.0);
    static orange = new Color(1.0, 0.5, 0.0);
    static grey = new Color(.7, .7, .7);
    static dummy = new Color();

    r!: number;
    g!: number;
    b!: number;
    a!: number;

    private _array!: number[];

    constructor(r?: number, g?: number, b?: number, a?: number) {
        this.set(r || 0, g || 0, b || 0, a);
    }

    set(r: number, g: number, b: number, a?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a !== undefined ? a : 1;
        return this;
    }

    setFromArray(a: number[]) {
        this.r = a.length > 0 ? a[0] : 0;
        this.g = a.length > 1 ? a[1] : 0;
        this.b = a.length > 2 ? a[2] : 0;
        this.a = a.length > 3 ? a[3] : 1;
        return this;
    }

    setFromChromeColor(r: number, g: number, b: number, a: number) {
        this.r = r / 255;
        this.g = g / 255;
        this.b = b / 255;
        this.a = a;
        return this;
    }

    toChromeColor() {
        return {
            r: Math.round(this.r * 255),
            g: Math.round(this.g * 255),
            b: Math.round(this.b * 255),
            a: this.a,
        };
    }

    asArray() {
        if (!this._array) {
            this._array = [this.r, this.g, this.b, this.a];
            return this._array;
        }

        this._array[0] = this.r;
        this._array[1] = this.g;
        this._array[2] = this.b;
        this._array[3] = this.a;
        return this._array;
    }

    copy(other: Color) {
        return this.set(other.r, other.g, other.b, other.a);
    }

    equals(other: Color) {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    setAlpha(a: number) {
        this.a = a;
        return this;
    }

    multiplyColor(other: Color) {
        this.r *= other.r;
        this.g *= other.g;
        this.b *= other.b;
        this.a *= other.a;
        return this;
    }

    multiply(scalar: number) {
        this.r = Math.min(this.r * scalar, 1);
        this.g = Math.min(this.g * scalar, 1);
        this.b = Math.min(this.b * scalar, 1);
        this.a = Math.min(this.a * scalar, 1);        
        return this;
    }

    add(other: Color) {
        this.r = Math.min(this.r + other.r, 1);
        this.g = Math.min(this.g + other.g, 1);
        this.b = Math.min(this.b + other.b, 1);
        this.a = Math.min(this.a + other.a, 1);
        return this;
    }

    setHSL(h: number, s: number, l: number) {
        // h,s,l ranges are in 0.0 - 1.0
        h = MathEx.euclideanModulo(h, 1);
        s = MathEx.clamp(s, 0, 1);
        l = MathEx.clamp(l, 0, 1);
        if (s === 0) {
            this.r = this.g = this.b = l;
        } else {
            var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
            var q = (2 * l) - p;

            this.r = Private.hue2rgb(q, p, h + 1 / 3);
            this.g = Private.hue2rgb(q, p, h);
            this.b = Private.hue2rgb(q, p, h - 1 / 3);
        }
        return this;
    }

    lerp(dest: Color, factor: number) {        
        return this.lerpColors(this, dest, factor);
    }

    lerpColors(a: Color, b: Color, factor: number) {        
        this.r = MathEx.lerp(a.r, b.r, factor);
        this.g = MathEx.lerp(a.g, b.g, factor);
        this.b = MathEx.lerp(a.b, b.b, factor);
        this.a = MathEx.lerp(a.a, b.a, factor);
        return this;
    }
}
