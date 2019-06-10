
import * as Attributes from "../../core/Attributes";
import { ReferenceArray } from "../../serialization/ReferenceArray";
import { AssetReference, AssetChangedEvent } from "../../serialization/AssetReference";
import { CollisionInfo } from "../../collision/CollisionInfo";
import { UIEvents } from "./UIEvents";
import { EngineUtils } from "../../core/EngineUtils";
import { SerializedObject } from "../../core/SerializableObject";
import { Operator, OperatorInternal } from "../Operator";
import { Behavior } from "../Behavior";
import { BasePin } from "../Pin";
import { ExecutionStatus } from "../ExecutionStatus";

export class BehaviorOperator extends Operator {
    
    get version() { return 2; }

    set behavior(behavior: Behavior | null) {       
        this._behavior.asset = behavior;
    }
    get behavior() { return this._behavior.asset; }    
    get customPins() { return this._customPins; }

    @Attributes.unserializable()
    private _uniqueBehaviorInstance: Behavior | null = null;

    @Attributes.unserializable()
    private _customPins!: ReferenceArray<BasePin>;

    private _behavior = new AssetReference(Behavior);

    constructor() {
        super();
        this.onBehaviorPinsChanged = this.onBehaviorPinsChanged.bind(this);
        this.onBehaviorInlineVariableChanged = this.onBehaviorInlineVariableChanged.bind(this);
        this.onBehaviorChanged = this.onBehaviorChanged.bind(this);
        this._behavior.assetChanged.attach(this.onBehaviorChanged);
    }

    destroy() {
        let behavior = this.behavior;
        if (behavior) {
            behavior.inlineVariableChanged.detach(this.onBehaviorInlineVariableChanged);
        }
        this._behavior.detach();
        if (this._uniqueBehaviorInstance) {
            this._uniqueBehaviorInstance.destroy();
            this._uniqueBehaviorInstance = null;
        }
        super.destroy();
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this._behavior);
    }

    onStart() {
        if (!this._uniqueBehaviorInstance) {
            this._uniqueBehaviorInstance = (this.behavior as Behavior).copy(true);
            this._uniqueBehaviorInstance.ownerComponent = this.ownerBehavior.ownerComponent;
            this._uniqueBehaviorInstance.customPins = this._customPins;
            this._uniqueBehaviorInstance.start();
        } else {
            this._uniqueBehaviorInstance.sendSignal(this._uniqueBehaviorInstance.id, OperatorInternal.startPinId);
        }
        return this.checkIfBehaviorFinished();
    }

    onUpdate() {
        let behavior = this._uniqueBehaviorInstance as Behavior;
        behavior.update();
        return this.checkIfBehaviorFinished();
    }

    onSignalReceived(inputPinId: string) {
        if (this._uniqueBehaviorInstance) {
            let wasActive = this._uniqueBehaviorInstance.activeOperators.length > 0;
            this._uniqueBehaviorInstance.sendSignal(this._uniqueBehaviorInstance.id, inputPinId);            
            let isActive = this._uniqueBehaviorInstance.activeOperators.length > 0;
            if (isActive && !wasActive) {
                // if the behavior has active operators, resuscitate this operator so it gets updated
                this.ownerBehavior.activateOperator(this);
            }
        }
    }

    onCollision(info: CollisionInfo) {
        if (this._uniqueBehaviorInstance) {
            this._uniqueBehaviorInstance.onCollision(info);
        }
    }

    onUIEvent(handler: (uiOperator: UIEvents) => boolean) {
        if (this._uniqueBehaviorInstance) {
            return this._uniqueBehaviorInstance.onUIEvent(handler);
        }
        return false;
    }

    onBehaviorPinsChanged() {
        if (this.behavior) {
            this._customPins = this.behavior.customPins.copy();
        }
    }

    findPin(pinId: string) {
        let pin = super.findPin(pinId);
        if (!pin) {
            let pinRef = this._customPins ? this._customPins.data.find(p => (p.instance as BasePin).id === pinId) : undefined;
            pin = pinRef ? pinRef.instance : undefined;
        }        
        return pin;
    }

    filterPins(filter: (p: BasePin) => boolean) {
        return super.filterPins(filter).concat(this._customPins.data.filter(p => filter(p.instance as BasePin)).map(p => p.instance as BasePin));
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                _behavior: json.properties.behavior
            });
            delete json.properties.behavior;
        }
        return json;
    }

    private checkIfBehaviorFinished() {
        let behavior = this._uniqueBehaviorInstance as Behavior;
        if (behavior.activeOperators.length === 0) {
            // Refresh behavior outputs
            behavior.fetchInputData(behavior.id);
            return ExecutionStatus.Finish;
        } else {
            return ExecutionStatus.Continue;
        }
    }

    private onBehaviorInlineVariableChanged(id: string) {
        if (this._uniqueBehaviorInstance) {
            let behavior = this.behavior as Behavior;
            let updatedVariable = behavior.inlineVariables.data.find(v => v.id === id);
            if (updatedVariable) {
                this._uniqueBehaviorInstance.updateInlineVariable(id, updatedVariable);
            }
        }
    }

    private onBehaviorChanged(info: AssetChangedEvent) {
        if (this._uniqueBehaviorInstance) {
            this._uniqueBehaviorInstance.destroy();
            this._uniqueBehaviorInstance = null;
        }
        if (process.env.CONFIG === "editor") {
            // detach from previous behavior
            let oldBehavior = info.oldAsset as Behavior;
            if (oldBehavior) {
                oldBehavior.pinChanged.detach(this.onBehaviorPinsChanged);
                oldBehavior.inlineVariableChanged.detach(this.onBehaviorInlineVariableChanged);
            }
        }
        let newBehavior = info.newAsset as Behavior;
        if (newBehavior) {
            this._customPins = newBehavior.customPins.copy();
            if (process.env.CONFIG === "editor") {
                // attach to new behavior
                newBehavior.pinChanged.attach(this.onBehaviorPinsChanged);
                newBehavior.inlineVariableChanged.attach(this.onBehaviorInlineVariableChanged);
            }            
        }
    }
}
