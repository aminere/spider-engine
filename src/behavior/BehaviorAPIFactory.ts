
import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
import { Vector4 } from "../math/Vector4";
import { Color } from "../graphics/Color";
import { Matrix44 } from "../math/Matrix44";
import { Plane } from "../math/Plane";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Triangle } from "../math/Triangle";
import { Ray } from "../math/Ray";
import { Basis } from "../math/Basis";
import { Interfaces } from "../core/Interfaces";
import { Quaternion } from "../math/Quaternion";

export class BehaviorAPIFactory {

    static variableObjectFactory = {
        Vector2: (...args: number[]) => new Vector2(...args),
        Vector3: (...args: number[]) => new Vector3(...args),
        Vector4: (...args: number[]) => new Vector4(...args),
        Color: (...args: number[]) => new Color(...args),
        Matrix44: () => new Matrix44(),
        Quaternion: () => new Quaternion(),
        Map: () => new Map(),
        Plane: () => new Plane(),
        Triangle: () => new Triangle(),
        Ray: () => new Ray(),
        Basis: () => new Basis(),
        VertexBuffer: () => new VertexBuffer()        
    };

    // tslint:disable-next-line
    static createObject(typeName: string, ...args: any[]) {
        let doIt = BehaviorAPIFactory.variableObjectFactory[typeName];
        if (doIt) {
            return doIt(...args);
        } else {
            return Interfaces.factory.createObject(typeName, ...args);
        }
    }
}
