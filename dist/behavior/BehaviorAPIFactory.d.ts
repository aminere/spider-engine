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
import { Quaternion } from "../math/Quaternion";
export declare class BehaviorAPIFactory {
    static variableObjectFactory: {
        Vector2: (...args: number[]) => Vector2;
        Vector3: (...args: number[]) => Vector3;
        Vector4: (...args: number[]) => Vector4;
        Color: (...args: number[]) => Color;
        Matrix44: (data?: number[] | undefined) => Matrix44;
        Quaternion: (x?: number | undefined, y?: number | undefined, z?: number | undefined, w?: number | undefined) => Quaternion;
        Map: () => Map<any, any>;
        Plane: (normal?: Vector3 | undefined, distFromOrigin?: number | undefined) => Plane;
        Triangle: (a?: Vector3 | undefined, b?: Vector3 | undefined, c?: Vector3 | undefined) => Triangle;
        Ray: (origin?: Vector3 | undefined, direction?: Vector3 | undefined, length?: number | undefined) => Ray;
        Basis: () => Basis;
        VertexBuffer: (props?: Partial<Pick<VertexBuffer, "name" | "copy" | "attributes" | "primitiveType" | "indices" | "begin" | "vertexCount" | "isDynamic" | "setAttribute" | "dirtifyAttribute" | "updateBufferDatas" | "bindBuffers" | "end" | "draw" | "load" | "unload" | "bindAttributes" | "unbindAttributes" | "hasAttribute">> | undefined) => VertexBuffer;
    };
    static createObject(typeName: string, ...args: any[]): any;
}
