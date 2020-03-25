import { Geometry, GraphicUpdateResult } from "./Geometry";
import { Matrix44 } from "../../math/Matrix44";
import { Vector3 } from "../../math/Vector3";
import { Transform } from "../../core/Transform";
import { Color } from "../Color";
import { VertexBuffer } from "../VertexBuffer";
import { Camera } from "../camera/Camera";
import { ParticleShape } from "../particles/ParticleShape";
/**
 * @hidden
 */
export declare type ColorOffset = "color";
/**
 * @hidden
 */
export declare type Vector3Offset = "position" | "velocity";
/**
 * @hidden
 */
export declare type DataOffset = Vector3Offset | ColorOffset | "life" | "remainingLife" | "size" | "active";
export declare class ParticlesGeometry extends Geometry {
    get vb(): VertexBuffer;
    set worldSpace(worldSpace: boolean);
    set particleCount(count: number);
    set shape(shape: ParticleShape | undefined);
    private _vb;
    private _interleavedData;
    private _worldTransform;
    private _worldSpace;
    private _particleCount;
    private _maxParticles;
    private _shape?;
    constructor(maxParticles?: number, shape?: ParticleShape);
    destroy(): void;
    getVertexBuffer(): VertexBuffer;
    getWorldTransform(transform: Transform): Matrix44;
    graphicUpdate(camera: Camera, transform: Transform): GraphicUpdateResult;
    initVertexBuffer(maxParticles: number): void;
    resetData(maxParticles: number): void;
    getData(name: DataOffset, particleIndex: number, localOffset?: number): number;
    setData(name: DataOffset, particleIndex: number, value: number, localOffset?: number): void;
    setVector3(name: Vector3Offset, particleIndex: number, value: Vector3): void;
    getVector3(name: Vector3Offset, particleIndex: number, result: Vector3): void;
    setColor(particleIndex: number, value: Color): void;
    getColor(particleIndex: number, result: Color): void;
    private onParticleShapePropertyChanged;
}
