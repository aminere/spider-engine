import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
/**
 * @hidden
 */
export declare namespace DebugInternal {
    let externalLogger: (message: any) => void;
}
export declare class Debug {
    static log(message: any): void;
    static logError(message: string): void;
    static logWarning(message: string): void;
    static logVector3(v: Vector3): void;
    static logVector2(v: Vector2): void;
}
