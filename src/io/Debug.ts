import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";

/**
 * @hidden
 */
export namespace DebugInternal {
    // tslint:disable-next-line
    export let externalLogger: (message: any) => void = () => {};
}

export class Debug {
    // tslint:disable-next-line
    static log(message: any) {        
        // tslint:disable-next-line
        console.log(message);
        DebugInternal.externalLogger(message);
    }

    static logError(message: string) {
        // tslint:disable-next-line
        console.error(message);
        DebugInternal.externalLogger(message);
    }

    static logWarning(message: string) {
        // tslint:disable-next-line
        console.warn(message);
        DebugInternal.externalLogger(message);
    }

    static logVector3(v: Vector3) {
        const log = `${v.x}, ${v.y}, ${v.z}`;
        // tslint:disable-next-line
        console.log(log);
        DebugInternal.externalLogger(log);
    }

    static logVector2(v: Vector2) {
        const log = `${v.x}, ${v.y}`;
        // tslint:disable-next-line
        console.log(log);
        DebugInternal.externalLogger(log);
    }
}
