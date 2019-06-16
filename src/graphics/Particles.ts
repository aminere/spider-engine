import { Visual } from "./Visual";
import { Range } from "../serialization/Range";
import { Reference } from "../serialization/Reference";
import { Volume } from "./volumes/Volume";
import { Color } from "./Color";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Vector3 } from "../math/Vector3";
import { Entity } from "../core/Entity";
import { ParticlesGeometry } from "./geometry/ParticlesGeometry";
import { BoxVolume } from "./volumes/BoxVolume";
import { AssetReference, AssetChangedEvent } from "../serialization/AssetReference";
import { Material } from "./Material";
import { VisualGroup } from "./VisualGroup";
import { CollisionShape } from "../collision/CollisionShape";
import { BoxCollisionShape } from "../collision/BoxCollisionShape";
import { SphereCollisionShape } from "../collision/SphereCollisionShape";
import { CollisionUtils } from "../collision/CollisionUtils";
import { MathEx } from "../math/MathEx";
import * as Attributes from "../core/Attributes";
import { defaultAssets } from "../assets/DefaultAssets";
import { Time } from "../core/Time";
import { Component } from "../core/Component";
import { Transform } from "../core/Transform";
import { Random } from "../math/Random";
import { ObjectProps } from "../core/Types";
import { ParticleShape } from "./particles/ParticleShape";
import { BillboardParticle } from "./particles/BillboardParticle";

export enum ParticleEmitDirection {
    Up,
    Forward,
    Right,
    AwayFromCenter
}

class ParticleEmitDirectionMetadata {
    static literals = {
        Up: 0,
        Forward: 1,
        Right: 2,
        AwayFromCenter: 3
    };
}

namespace Private {
    export const shapeWorldPos = new Vector3();
    export const particlePos = new Vector3();
    export const particleVelocity = new Vector3();
    export const particleColor = new Color();
    export const worldPos = new Vector3();

    export const makeDirection = {
        [ParticleEmitDirection.Up]: (
            transform: Transform, 
            _particlePos: Vector3, 
            emitCenter: Vector3, 
            result: Vector3
        ) => result.copy(transform.worldUp),

        [ParticleEmitDirection.Forward]: (
            transform: Transform, 
            _particlePos: Vector3, 
            emitCenter: Vector3, 
            result: Vector3
        ) => result.copy(transform.worldForward),

        [ParticleEmitDirection.Right]: (
            transform: Transform, 
            _particlePos: Vector3, 
            emitCenter: Vector3, 
            result: Vector3
        ) => result.copy(transform.worldRight),

        [ParticleEmitDirection.AwayFromCenter]: (
            transform: Transform, 
            _particlePos: Vector3, 
            emitCenter: Vector3, 
            result: Vector3
        ) => {
            result.copy(_particlePos).substract(emitCenter);
            const length = result.length;
            if (length > 0) {
                return result.multiply(1 / length);
            }
            // particle is exactly at center, pick random direction
            return result
                .set(Random.range(-1, 1), Random.range(-1, 1), Random.range(-1, 1))
                .normalize();
        }
    };
}

export class ParticleValueOverLife extends SerializableObject {
    life = 0;
    // tslint:disable-next-line
    value: any;

    // tslint:disable-next-line
    constructor(life?: number, value?: any) {
        super();
        this.life = life || 0;
        if (value !== undefined) {
            this.value = value;
        }
    }

    // tslint:disable-next-line
    static evaluate(track: ParticleValueOverLife[], lifeNormalized: number, target?: any) {       
        let keysAfter = track.filter(v => v.life > lifeNormalized);
        if (keysAfter.length === track.length) {
            // all keys are after the current time, get the value of the closest key in the future
            if (target) {
                target.copy(keysAfter[0].value);
            }
            return keysAfter[0].value;
        }

        let keysBefore = track.filter(v => v.life <= lifeNormalized);
        console.assert(keysBefore.length > 0);
        let srcKey = keysBefore[keysBefore.length - 1];
        if (keysBefore.length === track.length) {
            // all keys are before the current time, get the value of the closest key in the past
            if (target) {
                target.copy(srcKey.value);
            }
            return srcKey.value;
        }

        // interpolate between closest key in the past and closest key in the future
        // TODO quadratic interpolation?
        console.assert(keysAfter.length > 0);
        let destKey = keysAfter[0];
        let factor = (lifeNormalized - srcKey.life) / (destKey.life - srcKey.life);
        return srcKey.lerp(srcKey.value, destKey.value, factor, target);
    }

    // tslint:disable-next-line
    protected lerp(src: any, dest: any, factor: number, target?: any) {}   
}

export class ParticleNumberOverLife extends ParticleValueOverLife { 
    constructor(life?: number, value?: number) { 
        super(life, value || 0); 
    }
    protected lerp(src: number, dest: number, factor: number) {
        return MathEx.lerp(src, dest, factor);
    }
}

export class ParticleColorOverLife extends ParticleValueOverLife { 
    constructor(life?: number, value?: Color) { 
        super(life, value || new Color()); 
    }
    protected lerp(src: Color, dest: Color, factor: number, target?: Color) {
        return Color.lerp(src, dest, factor, target);
    }
}

@Attributes.helpUrl("https://docs.spiderengine.io/3d/particles.html")
export class Particles extends Component {   
    
    get version() { return 2; }
    get visual() { return this.entity.getComponent(Visual) as Visual; }
    get geometry() { return this.visual.geometry as ParticlesGeometry; }
    set volume(volume: Volume | undefined) { this._volume.instance = volume; }
    set shape(shape: ParticleShape | undefined) { this._shape.instance = shape; }
    set speedOverLife(samples: ParticleNumberOverLife[]) {
        this._speedOverLife.clear();
        samples.forEach(sample => this._speedOverLife.grow(sample));
    }
    set sizeOverLife(samples: ParticleNumberOverLife[]) {
        this._sizeOverLife.clear();
        samples.forEach(sample => this._sizeOverLife.grow(sample));
    }
    set colorOverLife(samples: ParticleColorOverLife[]) {
        this._colorOverLife.clear();
        samples.forEach(sample => this._colorOverLife.grow(sample));
    }
    set group(group: VisualGroup) {
        this._group.asset = group;
    }
    set material(material: Material) {
        this._material.asset = material;
    }

    duration = 6;
    isLooping = false;
    worldSpace = false;
    maxParticles = 128;
    particlesPerSecond = 30;
    life = new Range(1, 2);
    gravity = 9.8;

    @Attributes.enumLiterals(ParticleEmitDirectionMetadata.literals)
    direction = ParticleEmitDirection.Up;

    initialSpeed = new Range(1, 2);
    initialSize = new Range(1, 2);
    initialColor = new Color(1, 1, 1, 1);

    private _volume = new Reference(Volume);
    private _shape = new Reference(ParticleShape);
    private _speedOverLife = new ArrayProperty(ParticleNumberOverLife);
    private _sizeOverLife = new ArrayProperty(ParticleNumberOverLife);
    private _colorOverLife = new ArrayProperty(ParticleColorOverLife);
    private _group = new AssetReference(VisualGroup);
    private _material = new AssetReference(Material);    
    
    @Attributes.unserializable()
    private _particleCount = 0;
    @Attributes.unserializable()
    private _newParticlesCounter = 0;
    @Attributes.unserializable()
    private _isEmitting = true;
    @Attributes.unserializable()
    private _emitTime = -1;    
    @Attributes.unserializable()
    private _emitCenter = new Vector3();    

    constructor(props?: ObjectProps<Particles>) {
        super();
        if (props) {
            this.setState(props);
        }
        this.onMaterialChanged = this.onMaterialChanged.bind(this);
        this.onGroupChanged = this.onGroupChanged.bind(this);
        this._material.assetChanged.attach(this.onMaterialChanged);
        this._group.assetChanged.attach(this.onGroupChanged);
        if (!this._volume.instance) {
            this._volume.instance = new BoxVolume();
        }
        if (!this._material.asset) {
            this._material.asset = defaultAssets.materials.particles;
        }
        if (!this._shape.instance) {
            this._shape.instance = new BillboardParticle();
        }        
    }
    
    setParticleLife(index: number, life: number) {
        this.geometry.setData("remainingLife", index, life);
    }

    setEntity(entity: Entity) {
        super.setEntity(entity);
        entity.getOrSetComponent(Transform);
        entity.setComponent(Visual, {
            geometry: new ParticlesGeometry(this.maxParticles, this._shape.instance),
            material: this._material.asset,
            group: this._group.asset,
            castShadows: false,
            controller: this
        });        
        this.initEmitter();
    }

    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        let updatedInEditor = process.env.CONFIG === "editor" && this.entity;
        if (updatedInEditor) {
            if (name === "maxParticles") {
                super.setProperty(name, value);
                this.geometry.initVertexBuffer(this.maxParticles);
            } else if (name === "shape") {
                if (this._shape.instance) {
                    this._shape.instance.destroy();
                }
                super.setProperty(name, value);
                this.geometry.shape = this._shape.instance;                
            } else {
                super.setProperty(name, value);
            }
            this.initEmitter();
            this.geometry.resetData(this.maxParticles);
            this.visual.material = this._material.asset;
            this.visual.group = this._group.asset;
        } else {
            super.setProperty(name, value);                  
        }
    }

    destroy() {
        super.destroy();
        this.entity.clearComponent(Visual);        
        if (this._shape.instance) {
            this._shape.instance.destroy();
        }
        this._material.detach();
        this._group.detach();
    }

    // To be used for manually emitting particles, typically for shooting bullets
    emitParticle() {
        if (!this._volume.instance) {
            return;
        }
        this._newParticlesCounter++;
    }

    update() {    
        const deltaTime = Time.deltaTime;
        const emitVolume = this._volume.instance;
        let particlesToEmit = 0;        

        if (this._isEmitting) {
            if (this._emitTime <= 0) {
                if (this.isLooping) {
                    this._emitTime += this.duration;
                } else {
                    this._isEmitting = false;
                }
            }
            if (this._isEmitting && emitVolume) {
                this._newParticlesCounter += deltaTime * this.particlesPerSecond;            
            }
        }

        particlesToEmit = Math.floor(this._newParticlesCounter);
        if (this._particleCount + particlesToEmit > this.maxParticles) {
            particlesToEmit = this.maxParticles - this._particleCount;
        }

        let emittedParticles = 0;
        let particlesToProcess = particlesToEmit + this._particleCount;
        const { particlePos, particleVelocity, particleColor } = Private;
        for (let i = 0; i < this.maxParticles; ++i) {
            if (particlesToProcess === 0) {
                // early break if no more particles to process
                break;
            }
            const active = this.geometry.getData("active", i);
            if (active === 0) {
                // free particle, use it for emission
                if (emittedParticles < particlesToEmit) {
                    this.geometry.setData("active", i, 1);

                    const life = this.life.random();
                    this.geometry.setData("life", i, life);
                    this.geometry.setData("remainingLife", i, life);
                    this.geometry.setData("size", i, this.initialSize.random());

                    // init position
                    (emitVolume as Volume).emitPoint(particlePos);

                    // init velocity
                    (emitVolume as Volume).getCenter(this._emitCenter);
                    Private.makeDirection[this.direction](
                        this.entity.transform,
                        particlePos,
                        this._emitCenter,
                        particleVelocity
                    );
                    particleVelocity.multiply(this.initialSpeed.random());

                    if (this.worldSpace) {
                        particlePos.add(this.entity.transform.worldPosition);
                    }
                    this.geometry.setVector3("position", i, particlePos);
                    this.geometry.setVector3("velocity", i, particleVelocity);
                    this.geometry.setColor(i, this.initialColor);
                    ++emittedParticles;
                    ++this._particleCount;
                    --particlesToProcess;
                }
            } else {                
                const remainingLife = this.geometry.getData("remainingLife", i) - deltaTime;

                // apply life
                if (remainingLife < 0) {
                    // dead particle
                    this.geometry.setData("active", i, 0);
                    --this._particleCount;
                } else {
                    const life = this.geometry.getData("life", i);
                    const lifeFactor = 1 - (remainingLife / life);

                    // active particle, update it
                    this.geometry.getVector3("velocity", i, particleVelocity);

                    // apply gravity
                    particleVelocity.y += -this.gravity * deltaTime;
                    this.geometry.setData("velocity", i, particleVelocity.y, 1);

                    // apply speed
                    if (this._speedOverLife.data.length > 0) {
                        const speed = ParticleValueOverLife.evaluate(this._speedOverLife.data, lifeFactor);                        
                        particleVelocity.normalize().multiply(speed);
                    }

                    // apply velocity
                    this.geometry.getVector3("position", i, particlePos);
                    particlePos.add(particleVelocity.multiply(deltaTime));
                    this.geometry.setVector3("position", i, particlePos);

                    // apply color
                    if (this._colorOverLife.data.length > 0) {
                        ParticleValueOverLife.evaluate(this._colorOverLife.data, lifeFactor, particleColor);
                        this.geometry.setColor(i, particleColor);
                    }

                    // apply size
                    if (this._sizeOverLife.data.length > 0) {
                        const size = ParticleValueOverLife.evaluate(this._sizeOverLife.data, lifeFactor);
                        this.geometry.setData("size", i, size);
                    }

                    this.geometry.setData("remainingLife", i, remainingLife);
                }
                --particlesToProcess;
            }           
        }
        
        this._newParticlesCounter -= particlesToEmit;
        if (this._isEmitting) {
            this._emitTime -= deltaTime;
        }
        this.geometry.particleCount = this._particleCount;
    }

    checkCollisions(shape: CollisionShape, shapeTransform: Transform, onCollision: (particleIndex: number) => void) {
        const { shapeWorldPos } = Private;
        if (shape.isA(BoxCollisionShape)) {
            const box = shape as BoxCollisionShape;
            shapeWorldPos.copy(box.center).add(shapeTransform.worldPosition);
            this.checkCollisionsInternal((particleIndex, particleWorldPos) => {
                const isColliding = CollisionUtils.boxIntersectsWithSphere(
                    box,
                    shapeWorldPos,
                    particleWorldPos,
                    this.geometry.getData("size", particleIndex)
                );
                if (isColliding) {
                    onCollision(particleIndex);
                }
            });
        } else if (shape.isA(SphereCollisionShape)) {
            const sphere = shape as SphereCollisionShape;
            shapeWorldPos.copy(sphere.center).add(shapeTransform.worldPosition);
            this.checkCollisionsInternal((particleIndex, particleWorldPos) => {
                const isColliding = CollisionUtils.sphereIntersectsWithSphere(
                    shapeWorldPos,
                    sphere.radius,
                    particleWorldPos,
                    this.geometry.getData("size", particleIndex)
                );
                if (isColliding) {
                    onCollision(particleIndex);
                }
            });
        }
    }

    upgrade(json: SerializedObject, previousVersion: number) {        
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                _volume: json.properties.volume,
                _shape: json.properties.shape,
                _speedOverLife: json.properties.speedOverLife,
                _sizeOverLife: json.properties.sizeOverLife,
                _colorOverLife: json.properties.colorOverLife,
                _group: json.properties.group,
                _material: json.properties.material
            });
            delete json.properties.volume;
            delete json.properties.shape;
            delete json.properties.speedOverLife;
            delete json.properties.sizeOverLife;
            delete json.properties.colorOverLife;
            delete json.properties.group;
            delete json.properties.material;

            // Shape class renamed to Volume
            // tslint:disable-next-line
            (json.properties._volume as any).baseTypeName = "Volume";
            const volumeName = json.properties._volume.data.typeName;
            json.properties._volume.data.typeName = `${volumeName}Volume`;            
        }
        return json;
    }

    private checkCollisionsInternal(test: (particleIndex: number, worldPos: Vector3) => void) {
        let particlesToProcess = this._particleCount;
        for (let i = 0; i < this.maxParticles; ++i) {
            if (particlesToProcess === 0) {
                break;
            }
            const active = this.geometry.getData("active", i);
            if (active !== 0) {
                const { worldPos } = Private;
                this.geometry.getVector3("position", i, worldPos);
                if (!this.worldSpace) {
                    // particle is in local space, get world position
                    worldPos.add(this.entity.transform.worldPosition);
                }
                test(i, worldPos);
                --particlesToProcess;
            }
        }
    }
    
    private initEmitter() {
        this._newParticlesCounter = 0;
        this._particleCount = 0;
        this._emitTime = this.duration;
        this._isEmitting = true;
        this.geometry.worldSpace = this.worldSpace;
    }

    private onMaterialChanged(info: AssetChangedEvent) {
        if (this.entity) {
            this.visual.material = info.newAsset as Material;
        }
    }

    private onGroupChanged(info: AssetChangedEvent) {
        if (this.entity) {
            this.visual.group = info.newAsset as VisualGroup;
        }
    }
}
