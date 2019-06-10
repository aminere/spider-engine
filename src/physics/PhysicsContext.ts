
import { Vector3 } from "../math/Vector3";
import * as Cannon from "cannon";
import * as Attributes from "../core/Attributes";
import { Time } from "../core/Time";
import { Component } from "../core/Component";

export enum PhysicsBroadPhaseType {
    Naive,
    Grid,
    SAP
}

/**
 * @hidden
 */
export class PhysicsBroadPhaseTypeMetadata {
    static literals = {
        Naive: 0,
        Grid: 1,
        SAP: 2
    };
}

class PhysicsBroadPhaseFactory {
    static create(type: number) {
        switch (type) {
            case PhysicsBroadPhaseType.Grid:
                return new Cannon.GridBroadphase();
            case PhysicsBroadPhaseType.SAP:
                return new Cannon.SAPBroadphase();
            default:
                return new Cannon.NaiveBroadphase();
        }
    }
}

interface ContactEvent {
    bodyA: Cannon.Body;
    bodyB: Cannon.Body;
    target: Cannon.World;
}

export class PhysicsContext extends Component {

    set broadPhase(broadPhase: number) {
        this._broadPhase = broadPhase;
        if (this._world) {
            this._world.broadphase = PhysicsBroadPhaseFactory.create(this._broadPhase);            
        }
    }

    set gravity(gravity: Vector3) {
        this._gravity = gravity;
        if (this._world) {
            this._world.gravity.set(this._gravity.x, this._gravity.y, this._gravity.z);
        }
    }

    set solverIterations(iterations: number) {
        this._solverIterations = iterations;
        if (this._world) {
            this._world.solver.iterations = this._solverIterations;
        }
    }

    get world() { return this._world; }
    set world(world: Cannon.World) { this._world = world; }

    private _gravity = new Vector3(0, -9.8, 0);

    @Attributes.enumLiterals(PhysicsBroadPhaseTypeMetadata.literals)
    private _broadPhase = PhysicsBroadPhaseType.Naive;

    private _solverIterations = 10;

    @Attributes.unserializable()
    private _world!: Cannon.World;

    update() {
        if (!this._world) {
            this._world = new Cannon.World();
            this._world.gravity.set(this._gravity.x, this._gravity.y, this._gravity.z);
            this._world.broadphase = PhysicsBroadPhaseFactory.create(this._broadPhase);
            this._world.solver.iterations = this._solverIterations;
            // this._world.quatNormalizeFast = false;
            // this._world.quatNormalizeSkip = 0;
            this._world.defaultContactMaterial.contactEquationStiffness = 1e9;
            this._world.defaultContactMaterial.contactEquationRelaxation = 4;      
            this.beginContact = this.beginContact.bind(this);
            this.endContact = this.endContact.bind(this);
            this._world.addEventListener("beginContact", this.beginContact);
            this._world.addEventListener("endContact", this.endContact);            
            // this._world.defaultContactMaterial.friction = 0;
            // Create a slippery material (friction coefficient = 0.0)
            // let physicsMaterial = new Cannon.Material("slipperyMaterial");
            // var physicsContactMaterial = new Cannon.ContactMaterial(
            //     physicsMaterial,
            //     physicsMaterial,
            //     {
            //         friction: 0,
            //         restitution: .3
            //     }
            // );
            // // We must add the contact materials to the world
            // this._world.addContactMaterial(physicsContactMaterial);
            // let solver = new Cannon.GSSolver();
            // solver.iterations = 7;
            // solver.tolerance = .1;
            // this._world.solver = new Cannon.SplitSolver(solver);
        }

        this._world.step(1 / 60, Time.deltaTime, 3);
    }
    
    destroy() {
        if (this._world) {
            this._world.removeEventListener("beginContact", this.beginContact);
            this._world.removeEventListener("endContact", this.endContact);
        }
    }

    private beginContact(e: ContactEvent) {}
    private endContact(e: ContactEvent) {}
}
