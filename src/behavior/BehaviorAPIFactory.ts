
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
import { ObjectProps } from "../core/Types";

export class BehaviorAPIFactory {

    static variableObjectFactory = {
        Vector2: (...args: number[]) => new Vector2(...args),
        Vector3: (...args: number[]) => new Vector3(...args),
        Vector4: (...args: number[]) => new Vector4(...args),
        Color: (...args: number[]) => new Color(...args),
        Matrix44: (data?: number[]) => new Matrix44(data),
        Quaternion: (x?: number, y?: number, z?: number, w?: number) => new Quaternion(x, y, z, w),
        Map: () => new Map(),
        Plane: (normal?: Vector3, distFromOrigin?: number) => new Plane(normal, distFromOrigin),
        Triangle: (a?: Vector3, b?: Vector3, c?: Vector3) => new Triangle(a, b, c),
        Ray: (origin?: Vector3, direction?: Vector3, length?: number) => new Ray(origin, direction, length),
        Basis: () => new Basis(),
        VertexBuffer: (props?: ObjectProps<VertexBuffer>) => new VertexBuffer(props)        
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
