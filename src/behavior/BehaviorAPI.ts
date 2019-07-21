import { MathEx } from "../math/MathEx";
import { Debug } from "../io/Debug";
import { ExecutionStatus } from "./ExecutionStatus";
import { Vector3 } from "../math/Vector3";
import { Matrix44 } from "../math/Matrix44";
import { Quaternion, RotationOrder } from "../math/Quaternion";
import { Color } from "../graphics/Color";
import { CollisionGroup } from "../collision/CollisionGroup";
import { Ray, RaySphereCollisionResult } from "../math/Ray";
import { Basis } from "../math/Basis";
import { Plane } from "../math/Plane";
import { HudControl, EngineHud } from "../core/hud/EngineHud";
import { RaycastResult } from "../collision/RaycastResult";
import { SavedData } from "../io/SavedData";
import { Time } from "../core/Time";
import { Project } from "../core/Project";
import { Gamepads } from "../input/Gamepads";
import { Entities, EntityProps } from "../core/Entities";
import { Scenes } from "../core/Scenes";
import { Assets } from "../assets/Assets";
import { Physics } from "../physics/Physics";
import { Interfaces } from "../core/Interfaces";
import { Config } from "../core/Config";
import { Update } from "../core/Update";
import { Scene } from "../assets/Scene";
import { Asset } from "../assets/Asset";
import { Vector2 } from "../math/Vector2";
import { Entity } from "../core/Entity";
import { VoidSyncEvent } from "ts-events";
import { Random } from "../math/Random";

namespace Private {
    export const transientState = {};
}

export class BehaviorAPI {
    static api = {
        Math: {
            PI: () => Math.PI,
            sin: (angleRadians: number) => Math.sin(angleRadians),
            cos: (angleRadians: number) => Math.cos(angleRadians),
            tan: (angleRadians: number) => Math.tan(angleRadians),
            sqrt: (value: number) => Math.sqrt(value),
            min: (a: number, b: number) => Math.min(a, b),
            max: (a: number, b: number) => Math.max(a, b),
            random: () => Math.random(),
            abs: (value: number) => Math.abs(value),
            sign: (value: number) => Math.sign(value),
            floor: (value: number) => Math.floor(value),
            ceil: (value: number) => Math.ceil(value),
            round: (value: number) => Math.round(value),
            acos: (value: number) => Math.acos(value),
            atan: (value: number) => Math.atan(value),
            atan2: (y: number, x: number) => Math.atan2(y, x),
            pow: (base: number, exponent: number) => Math.pow(base, exponent)        
        },
        MathEx: {
            toRadians: (angleDegrees: number) => MathEx.toRadians(angleDegrees),
            toDegrees: (angleRadians: number) => MathEx.toDegrees(angleRadians),
            clamp: (value: number, min: number, max: number) => MathEx.clamp(value, min, max),
            degreesToRadians: () => MathEx.degreesToRadians,
            radiansToDegrees: () => MathEx.radiansToDegrees,
            lerp: (a: number, b: number, k: number) => MathEx.lerp(a, b, k)
        },
        console: {
            // tslint:disable-next-line
            log: (value: any) => Debug.log(typeof (value) === "string" ? value : JSON.stringify(value)),
            // tslint:disable-next-line
            assert: (value: any, message?: string) => console.assert(value, message),
            // tslint:disable-next-line
            clear: () => console.clear(),
            logVector3: (value: Vector3) => Debug.logVector3(value)
        },
        location: {
            reload: () => location.reload()
        },
        window: {
            open: (url: string) => window.open(url)
        },
        JSON: {
            stringify: (obj: object) => JSON.stringify(obj, null, 2),
            parse: (str: string) => JSON.parse(str)
        },
        Random: {
            range: (rangeStart: number, rangeEnd: number) => Random.range(rangeStart, rangeEnd),
            rangeInt: (rangeStart: number, rangeEnd: number) => Random.rangeInt(rangeStart, rangeEnd)
        },
        Scenes: {
            load: (path: string, additive?: boolean): Promise<Scene> => Scenes.load(path, additive)
        },
        Assets: {
            load: (path: string): Promise<Asset> => Assets.load(path),
            loadById: (id: string): Promise<Asset> => Assets.loadById(id)
        },
        Renderer: {
            screenSize: (): Vector2 => Interfaces.renderer.screenSize
        },
        Entities: {
            create: (props?: EntityProps): Entity => Entities.create(props),
            find: (name: string): Entity | null => Entities.find(name)
        },
        Gamepads: {
            forEach: (handler: (gamePad: Gamepad, index: number) => void) => Gamepads.forEach(handler),
            get: (index: number) => Gamepads.get(index)
        },
        Time: {
            deltaTime: () => Time.deltaTime,
            smoothDeltaTime: () => Time.smoothDeltaTime,
            fps: () => Time.fps,
            currentFrame: () => Time.currentFrame,
            time: () => Time.time
        },
        Project: {
            name: () => Project.projectName,
            isOpenSource: () => Project.isOpenSource,
            importToEditor: () => Project.importToEditor()
        },
        SavedData: {
            get: () => SavedData.get(),
            flush: () => SavedData.flush()
        },
        Update: {
            hook: (): VoidSyncEvent => Update.hook
        },
        Game: {
            state: () => Private.transientState
        },
        ExecutionStatus: {
            Continue: () => ExecutionStatus.Continue,
            Finish: () => ExecutionStatus.Finish
        },
        Vector3: {
            up: () => Vector3.fromPool().copy(Vector3.up),
            right: () => Vector3.fromPool().copy(Vector3.right),
            forward: () => Vector3.fromPool().copy(Vector3.forward),
            zero: () => Vector3.fromPool().copy(Vector3.zero),
            distance: (a: Vector3, b: Vector3) => Vector3.distance(a, b),
            distanceSq: (a: Vector3, b: Vector3) => Vector3.distanceSq(a, b),
            fromPool: () => Vector3.fromPool()
        },
        Plane: {
            fromPool: () => Plane.fromPool()
        },
        Basis: {
            fromMatrix: (m: Matrix44) => Basis.fromMatrix(m)
        },
        Matrix44: {
            identity: () => Matrix44.fromPool().copy(Matrix44.identity),
            fromPool: () => Matrix44.fromPool()
        },
        Quaternion: {
            identity: () => Quaternion.fromPool().copy(Quaternion.identity),
            fromPool: () => Quaternion.fromPool(),
            fromEulerAngles: (x: number, y: number, z: number, order?: RotationOrder) => Quaternion.fromEulerAngles(
                x,
                y,
                z,
                order
            ),
            fromAxisAngle: (axis: Vector3, angle: number) => Quaternion.fromAxisAngle(axis, angle)
        },
        Color: {
            white: () => Color.dummy.copy(Color.white),
            black: () => Color.dummy.copy(Color.black)
        },
        Object: {
            keys: (obj: object) => Object.keys(obj),
            values: (obj: object) => Object.values(obj),
            entries: (obj: object) => Object.entries(obj),
            assign: (target: object, ...sources: object[]) => Object.assign(target, sources)
        },
        Promise: {
            // tslint:disable-next-line
            all: (promises: Promise<any>[]) => Promise.all(promises)
        },
        HorizontalAlignment: {
            left: () => 0,
            center: () => 1,
            right: () => 2,
            stretch: () => 3
        },
        VerticalAlignment: {
            top: () => 0,
            center: () => 1,
            bottom: () => 2,
            stretch: () => 3
        },
        Array: {
            // tslint:disable-next-line
            isArray: (a: any) => Array.isArray(a),
            // tslint:disable-next-line
            from: (a: any) => Array.from(a)
        },
        Physics: {
            rayCast: (ray: Ray, include?: CollisionGroup[], exclude?: CollisionGroup[]): RaycastResult | null => (
                Physics.rayCast(ray, include, exclude)
            )
        },
        Collision: {
            rayCastOnSphere: (ray: Ray, center: Vector3, radius: number): RaySphereCollisionResult | null => (
                ray.castOnSphere(center, radius)
            )
        },
        EngineHud: {
            setControls: (controls: HudControl[]) => EngineHud.setControls(controls)
        },
        Config: {
            isWeb: () => Config.isWeb(),
            isDesktop: () => Config.isDesktop(),
            isProduction: () => Config.isProduction(),
            isDevelopment: () => Config.isDevelopment(),
            isEditor: () => Config.isEditor(),
            isStandalone: () => Config.isStandalone()
        }
    };
}
