import { SerializableObject } from "../../core/SerializableObject";
import * as Attributes from "../../core/Attributes";

export class Shadow extends SerializableObject {    
    getTypeIndex() { return -1; }
}

@Attributes.displayName("Smooth")
export class PCFShadow extends Shadow {
    radius = 2;
    getTypeIndex() { return 1; }
}

@Attributes.displayName("Smoothest")
export class PCFSoftShadow extends PCFShadow {    
    getTypeIndex() { return 0; }
}

@Attributes.displayName("Hard")
export class HardShadow extends Shadow {
    getTypeIndex() { return 2; }
}
