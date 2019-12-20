import { SerializableObject } from "../../core/SerializableObject";
export declare class Shadow extends SerializableObject {
    getTypeIndex(): number;
}
export declare class PCFShadow extends Shadow {
    radius: number;
    getTypeIndex(): number;
}
export declare class PCFSoftShadow extends PCFShadow {
    getTypeIndex(): number;
}
export declare class HardShadow extends Shadow {
    getTypeIndex(): number;
}
