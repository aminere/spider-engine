import { Visual } from "./Visual";
import { Range } from "../serialization/Range";
import { Volume } from "./volumes/Volume";
import { Color } from "./Color";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Entity } from "../core/Entity";
import { ParticlesGeometry } from "./geometry/ParticlesGeometry";
import { Material } from "./Material";
import { VisualGroup } from "./VisualGroup";
import { CollisionShape } from "../collision/CollisionShape";
import { Component } from "../core/Component";
import { Transform } from "../core/Transform";
import { ObjectProps } from "../core/Types";
import { ParticleShape } from "./particles/ParticleShape";
export declare enum ParticleEmitDirection {
    Up = 0,
    Forward = 1,
    Right = 2,
    AwayFromCenter = 3
}
export declare class ParticleValueOverLife extends SerializableObject {
    life: number;
    value: any;
    constructor(life?: number, value?: any);
    static evaluate(track: ParticleValueOverLife[], lifeNormalized: number, target?: any): any;
    protected lerp(src: any, dest: any, factor: number, target?: any): void;
}
export declare class ParticleNumberOverLife extends ParticleValueOverLife {
    constructor(life?: number, value?: number);
    protected lerp(src: number, dest: number, factor: number): number;
}
export declare class ParticleColorOverLife extends ParticleValueOverLife {
    constructor(life?: number, value?: Color);
    protected lerp(src: Color, dest: Color, factor: number, target?: Color): Color;
}
export declare class Particles extends Component {
    get version(): number;
    get visual(): Visual;
    get geometry(): ParticlesGeometry;
    set volume(volume: Volume | undefined);
    set shape(shape: ParticleShape | undefined);
    set speedOverLife(samples: ParticleNumberOverLife[]);
    set sizeOverLife(samples: ParticleNumberOverLife[]);
    set colorOverLife(samples: ParticleColorOverLife[]);
    set group(group: VisualGroup);
    set material(material: Material);
    duration: number;
    isLooping: boolean;
    worldSpace: boolean;
    maxParticles: number;
    particlesPerSecond: number;
    life: Range;
    gravity: number;
    direction: ParticleEmitDirection;
    initialSpeed: Range;
    initialSize: Range;
    initialColor: Color;
    private _volume;
    private _shape;
    private _speedOverLife;
    private _sizeOverLife;
    private _colorOverLife;
    private _group;
    private _material;
    private _particleCount;
    private _newParticlesCounter;
    private _isEmitting;
    private _emitTime;
    private _emitCenter;
    constructor(props?: ObjectProps<Particles>);
    setParticleLife(index: number, life: number): void;
    setEntity(entity: Entity): void;
    setProperty(name: string, value: any): void;
    destroy(): void;
    emitParticle(): void;
    update(): void;
    checkCollisions(shape: CollisionShape, shapeTransform: Transform, onCollision: (particleIndex: number) => void): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private checkCollisionsInternal;
    private initEmitter;
    private onMaterialChanged;
    private onGroupChanged;
}
