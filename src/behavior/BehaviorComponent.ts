
import { Behavior } from "./Behavior";
import { Entity } from "../core/Entity";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { Debug } from "../io/Debug";
import { AssetReference, AssetChangedEvent } from "../serialization/AssetReference";
import { EngineUtils } from "../core/EngineUtils";
import { CollisionInfo } from "../collision/CollisionInfo";
import { BehaviorUtils } from "./BehaviorUtils";
import { OperatorInternal, Operator } from "./Operator";
import { UIEvents } from "./operators/UIEvents";
import * as Attributes from "../core/Attributes";
import { SerializedObject } from "../core/SerializableObject";
import { Component } from "../core/Component";
import { IBehaviorComponent } from "./IBehaviorComponent";

/**
 * @hidden
 */
// tslint:disable-next-line
var CommonEditorEvents: any = undefined;
if (process.env.CONFIG === "editor") {
    CommonEditorEvents = require("../editor/CommonEditorEvents").CommonEditorEvents;
}

@Attributes.helpUrl("https://docs.spiderengine.io/behavior.html")
export class BehaviorComponent extends Component implements IBehaviorComponent {
    
    get version() { return 3; }
    
    autoStart = true;

    get behavior() { return this._behavior.asset; }
    set behavior(behavior: Behavior | null) {        
        this._behavior.asset = behavior; 
    }
    get customPins() { return this._customPins; }
    get activeOperators(): Operator[] { 
        return this.behavior ? this.behavior.activeOperators : [];        
    }

    // must initialize this here so it gets serialized before the behavior!! Critical to make sure 
    // new pins added to the behavior are additively merged with existing pins in this component
    // (see onBehaviorChanged -> buildCustomPins)
    // DO NOT CHANGE THE ORDER OF DEFINITION OF _customPins relative to _behavior!!
    // _customPins must always be defined first.
    @Attributes.hidden()
    private _customPins = new ReferenceArray(BasePin);

    @Attributes.unserializable()
    private _uniqueBehaviorInstance: Behavior | null = null;
    
    private _behavior = new AssetReference(Behavior);    
    
    constructor() {
        super();
        this.onBehaviorPinChanged = this.onBehaviorPinChanged.bind(this);
        this.onBehaviorInlineVariableChanged = this.onBehaviorInlineVariableChanged.bind(this);
        this.onBehaviorChanged = this.onBehaviorChanged.bind(this);
        this._behavior.assetChanged.attach(this.onBehaviorChanged);
    }

    isLoaded() {
        if (!super.isLoaded()) {
            return false;
        }
        if (this._customPins) {
            for (let pinRef of this._customPins.data) {
                if (!BehaviorUtils.isPinLoaded(pinRef.instance as BasePin)) {
                     return false;
                }            
            }
        }
        return EngineUtils.isAssetRefLoaded(this._behavior);
    }

    destroy() {
        let behavior = this.behavior;
        if (behavior) {
            behavior.pinChanged.detach(this.onBehaviorPinChanged);
            behavior.inlineVariableChanged.detach(this.onBehaviorInlineVariableChanged);
        }
        if (this._uniqueBehaviorInstance) {
            this._uniqueBehaviorInstance.destroy();
            this._uniqueBehaviorInstance = null;
        }
        this._behavior.detach();
        super.destroy();
    }

    start() {      
        let behavior = this.behavior;
        if (!behavior) {
            return;
        }  
        if (!this._uniqueBehaviorInstance) {
            this._uniqueBehaviorInstance = behavior.copy(true);
            this._uniqueBehaviorInstance.ownerComponent = this;
            if (this._customPins) {
                this._uniqueBehaviorInstance.customPins = this._customPins;
            } else {
                Debug.logWarning("BehaviorComponent.start: undefined customPins");
            }
            this._uniqueBehaviorInstance.start();
        } else {
            this._uniqueBehaviorInstance.sendSignal(this._uniqueBehaviorInstance.id, OperatorInternal.startPinId);
        }
    }

    update() {
        let behavior = this.behavior;
        if (!behavior) {
            return;
        }
        if (!this._uniqueBehaviorInstance) {
            if (this.autoStart) {
                this.start();
            }
        } else {
            this._uniqueBehaviorInstance.update();
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

    sendSignal(signalName: string) {
        // This is added because gameplay sometimes need to send a signal right after instantiating an Entity, for example
        // let myEntity = Engine.createEntity(myPrefab);
        // myEntity.getComponent("BehaviorComponent").sendSignal("someSignal");
        // In this case the behavior must be started within this SendSignal call.
        if (!this._uniqueBehaviorInstance) {
            this.start();
        }
        let behavior = this._uniqueBehaviorInstance as Behavior;
        let pin = behavior.customPins.data.find(p => (p.instance as BasePin).name === signalName);
        if (pin) {
            behavior.sendSignal(behavior.id, (pin.instance as BasePin).id);
        } else {
            Debug.logWarning(`Could not fire signal '${signalName}' (pin not found)`);
        }        
    }

    getPins() {
        return this._customPins;
    }
    
    setPins(pins: ReferenceArray<BasePin>) {
        this._customPins = pins;
    }

    findPinByName(name: string) {
        for (var pinRef of this._customPins.data) {
            let pin = pinRef.instance as BasePin;
            if (pin.name === name) {
                return pin;
            }
        }
        return undefined;
    }

    upgrade(json: SerializedObject, previousVersion: number) {        
        if (previousVersion === 1) {
            Object.assign(json.properties, { 
                _behavior: json.properties.behavior
            });
            delete json.properties.behavior;
        } else if (previousVersion === 2) {
            // custom pins was being initialized after the behavior which fucks the deserialization sequence
            // make sure the custom pins are defined before the behavior            
            let customPins = json.properties._customPins;
            let behavior = json.properties._behavior;
            delete json.properties._customPins;
            delete json.properties._behavior;
            // Also since custom pins is not a dynamic property anymore its json needs to be adjusted
            json.properties._customPins = customPins.data;
            json.properties._behavior = behavior;
        }
        return json;
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
                oldBehavior.pinChanged.detach(this.onBehaviorPinChanged);
                oldBehavior.inlineVariableChanged.detach(this.onBehaviorInlineVariableChanged);
            }
        }
        let newBehavior = info.newAsset as Behavior;
        if (newBehavior) {
            if (process.env.CONFIG === "editor") {
                // attach to new behavior
                newBehavior.pinChanged.attach(this.onBehaviorPinChanged);
                newBehavior.inlineVariableChanged.attach(this.onBehaviorInlineVariableChanged);
            }
            this.buildCustomPins(newBehavior);
        }
    }

    private buildCustomPins(behavior: Behavior) {
        let customPins = new ReferenceArray(BasePin);
        let newPinIds: string[] = [];
        // Synchronize custom pins on the component with the ones on the behavior
        for (let newPinRef of behavior.customPins.data) {
            let newPin = newPinRef.instance;
            if (newPin) {
                // Do no lose previous information for unchanged pins (same id and same type)
                let existingPinToKeep: BasePin | undefined = undefined;
                if (this._customPins) {
                    let oldPinRef = this._customPins.data.find(p => {
                        return (p.instance as BasePin).id === (newPin as BasePin).id;
                    });
                    let oldPin = oldPinRef ? oldPinRef.instance : undefined;
                    if (oldPin) {
                        if (oldPin.type === newPin.type && BehaviorUtils.pinsHaveSameType(oldPin, newPin)) {
                            existingPinToKeep = oldPin;
                            // In case the name changed, grab it
                            existingPinToKeep.name = newPin.name;
                        }
                    }
                }

                if (existingPinToKeep) {
                    customPins.grow(existingPinToKeep);
                } else {
                    customPins.grow(newPin.copy());
                    newPinIds.push(newPin.id);
                }
            }
        }
        this._customPins = customPins;
        BehaviorUtils.updatePinAccessors(this);
        return newPinIds;
    }

    private onBehaviorPinChanged() {
        let behavior = this.behavior as Behavior;
        let newPinIds = this.buildCustomPins(behavior);
        if (this._uniqueBehaviorInstance) {
            this._uniqueBehaviorInstance.customPins = this._customPins;
        }
        if (CommonEditorEvents) {
            CommonEditorEvents.behaviorComponentPinsChanged.post({
                ownerId: behavior.id,
                pinIds: newPinIds
            });        
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
}
