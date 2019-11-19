import { ExecutionStatus } from "./ExecutionStatus";
import { Vector3 } from "../math/Vector3";
import { Matrix44 } from "../math/Matrix44";
import { Quaternion } from "../math/Quaternion";
import { Color } from "../graphics/Color";
import { Ray, RaySphereCollisionResult } from "../math/Ray";
import { Basis } from "../math/Basis";
import { Plane } from "../math/Plane";
import { HudControl } from "../core/hud/EngineHud";
import { RaycastResult } from "../collision/RaycastResult";
import { EntityProps } from "../core/Entities";
import { Scene } from "../assets/Scene";
import { Asset } from "../assets/Asset";
import { Vector2 } from "../math/Vector2";
import { Entity } from "../core/Entity";
import { VoidSyncEvent } from "ts-events";
import { CollisionFilter } from "../collision/CollisionFilter";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { AABB } from "../math/AABB";
import { IHttpRequestOptions } from "../network/HTTP";
export declare class BehaviorAPI {
    static api: {
        Math: {
            PI: () => number;
            sin: (angleRadians: number) => number;
            cos: (angleRadians: number) => number;
            tan: (angleRadians: number) => number;
            sqrt: (value: number) => number;
            min: (a: number, b: number) => number;
            max: (a: number, b: number) => number;
            random: () => number;
            abs: (value: number) => number;
            sign: (value: number) => number;
            floor: (value: number) => number;
            ceil: (value: number) => number;
            round: (value: number) => number;
            acos: (value: number) => number;
            atan: (value: number) => number;
            atan2: (y: number, x: number) => number;
            pow: (base: number, exponent: number) => number;
            exp: (value: number) => number;
        };
        MathEx: {
            toRadians: (angleDegrees: number) => number;
            toDegrees: (angleRadians: number) => number;
            clamp: (value: number, min: number, max: number) => number;
            degreesToRadians: () => number;
            radiansToDegrees: () => number;
            lerp: (a: number, b: number, k: number) => number;
        };
        console: {
            log: (...args: any[]) => void;
            assert: (value: any, message?: string | undefined) => void;
            clear: () => void;
            logVector3: (value: Vector3) => void;
        };
        location: {
            reload: () => void;
        };
        window: {
            open: (url: string) => Window | null;
        };
        JSON: {
            stringify: (obj: object) => string;
            parse: (str: string) => any;
        };
        Random: {
            range: (rangeStart: number, rangeEnd: number) => number;
            rangeInt: (rangeStart: number, rangeEnd: number) => number;
        };
        Scenes: {
            load: (path: string, additive?: boolean | undefined) => Promise<Scene>;
        };
        Assets: {
            load: (path: string) => Promise<Asset>;
            loadById: (id: string) => Promise<Asset>;
        };
        Renderer: {
            screenSize: () => Vector2;
        };
        Entities: {
            create: (props?: EntityProps | undefined) => Entity;
            find: (name: string) => Entity | null;
        };
        Gamepads: {
            forEach: (handler: (gamePad: Gamepad, index: number) => void) => void;
            get: (index: number) => Gamepad | null;
        };
        Input: {
            touchX: () => number;
            touchY: () => number;
            touchPressed: () => import("ts-events").SyncEvent<import("../input/Input").TouchEvent>;
            touchMoved: () => import("ts-events").SyncEvent<import("../input/Input").TouchEvent>;
            touchReleased: () => import("ts-events").SyncEvent<import("../input/Input").TouchEvent>;
            wheelMoved: () => import("ts-events").SyncEvent<number>;
            keyChanged: () => import("ts-events").SyncEvent<import("../input/Input").KeyEvent>;
        };
        Time: {
            deltaTime: () => number;
            smoothDeltaTime: () => number;
            fps: () => number;
            currentFrame: () => number;
            time: () => number;
        };
        Project: {
            name: () => string | null;
            isOpenSource: () => boolean;
            importToEditor: () => void;
        };
        SavedData: {
            get: () => object;
            flush: () => void;
        };
        Update: {
            hook: () => VoidSyncEvent;
        };
        Game: {
            state: () => {};
        };
        ExecutionStatus: {
            Continue: () => ExecutionStatus;
            Finish: () => ExecutionStatus;
        };
        Vector3: {
            up: () => Vector3;
            right: () => Vector3;
            forward: () => Vector3;
            zero: () => Vector3;
            one: () => Vector3;
            distance: (a: Vector3, b: Vector3) => number;
            distanceSq: (a: Vector3, b: Vector3) => number;
            fromPool: () => Vector3;
        };
        Vector2: {
            zero: () => Vector2;
            one: () => Vector2;
            fromPool: () => Vector2;
        };
        Plane: {
            fromPool: () => Plane;
        };
        Basis: {
            fromMatrix: (m: Matrix44) => Basis;
        };
        Matrix44: {
            identity: () => Matrix44;
            fromPool: () => Matrix44;
        };
        Quaternion: {
            identity: () => Quaternion;
            fromPool: () => Quaternion;
            fromEulerAngles: (x: number, y: number, z: number, order?: "YXZ" | "ZYX" | "XYZ" | "ZXY" | "YZX" | "XZY" | undefined) => Quaternion;
            fromAxisAngle: (axis: Vector3, angle: number) => Quaternion;
        };
        Color: {
            white: () => Color;
            black: () => Color;
        };
        Object: {
            keys: (obj: object) => string[];
            values: (obj: object) => any[];
            entries: (obj: object) => [string, any][];
            assign: (target: object, ...sources: object[]) => object & object[];
        };
        Promise: {
            all: (promises: Promise<any>[]) => Promise<any[]>;
        };
        HorizontalAlignment: {
            Left: () => number;
            Center: () => number;
            Right: () => number;
            Stretch: () => number;
        };
        VerticalAlignment: {
            Top: () => number;
            Center: () => number;
            Bottom: () => number;
            Stretch: () => number;
        };
        Array: {
            isArray: (a: any) => boolean;
            from: (a: any) => {}[];
        };
        Physics: {
            rayCast: (ray: Ray, filter?: CollisionFilter | undefined) => RaycastResult | null;
        };
        Collision: {
            rayCastOnSphere: (ray: Ray, center: Vector3, radius: number) => RaySphereCollisionResult | null;
        };
        EngineHud: {
            setControls: (controls: HudControl[]) => void;
        };
        AABB: {
            fromVertexBuffer: (vb: VertexBuffer) => AABB;
        };
        Config: {
            isWeb: () => boolean;
            isDesktop: () => boolean;
            isProduction: () => boolean;
            isDevelopment: () => boolean;
            isEditor: () => boolean;
            isStandalone: () => boolean;
        };
        Http: {
            request: (options: IHttpRequestOptions) => Promise<any>;
        };
        Date: {
            now: () => number;
        };
    };
}
