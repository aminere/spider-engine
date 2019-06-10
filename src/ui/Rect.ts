
export class Rect {
    left: number;
    top: number;    
    right: number;
    bottom: number;
    
    constructor(left?: number, top?: number, right?: number, bottom?: number) {
        this.left = left || 0;
        this.top = top || 0;
        this.right = right || 0;
        this.bottom = bottom || 0;
    }

    set(left: number, top: number, right: number, bottom: number) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
}
