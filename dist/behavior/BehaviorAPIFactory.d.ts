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
export declare class BehaviorAPIFactory {
    static variableObjectFactory: {
        Vector2: (...args: number[]) => Vector2;
        Vector3: (...args: number[]) => Vector3;
        Vector4: (...args: number[]) => Vector4;
        Color: (...args: number[]) => Color;
        Matrix44: () => Matrix44;
        Map: () => Map<any, any>;
        Plane: () => Plane;
        Triangle: () => Triangle;
        Ray: () => Ray;
        Basis: () => Basis;
        VertexBuffer: () => VertexBuffer;
    };
    static createObject(typeName: string, ...args: any[]): any;
}
