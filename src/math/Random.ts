import { MathEx } from "./MathEx";

export class Random {
    static range(rangeStart: number, rangeEnd: number) {
        return MathEx.lerp(rangeStart, rangeEnd, Math.random());
    } 

    static rangeInt(rangeStart: number, rangeEnd: number) {
        return Math.round(Random.range(rangeStart, rangeEnd));
    }
}
