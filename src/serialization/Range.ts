import { Random } from "../math/Random";

export class Range {
    min: number;
    max: number;

    constructor(min?: number, max?: number) {
        this.min = min || 0;
        this.max = max || 0;
    }

    random() {        
        return Random.range(this.min, this.max);
    }
}
