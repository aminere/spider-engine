
import * as Attributes from "../core/Attributes";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin, PinType } from "./Pin";
import { Vector2 } from "../math/Vector2";
import { SerializableObject } from "../core/SerializableObject";
import { ComponentReferencePin, ArrayPin, AssetPin } from "./DataPins";
import { EngineUtils } from "../core/EngineUtils";
import { IBehavior } from "./IBehavior";
import { Asset } from "../assets/Asset";
import { Interfaces } from "../core/Interfaces";
import { Component } from "../core/Component";
import { Constructor } from "../core/Types";

export class BehaviorNode extends SerializableObject {
    
    position = new Vector2();
    id: string;

    /**
     * @hidden
     */
    @Attributes.unserializable()
    widthInEditor!: number; // total hack, used only by the editor
    
    get pins() { return this._pins; }    
    set ownerBehavior(owner: IBehavior) { this._ownerBehavior = owner; }
    get ownerBehavior() { return this._ownerBehavior; }
    
    @Attributes.unserializable()
    private _ownerBehavior!: IBehavior;

    @Attributes.unserializable()
    private _pins = new ReferenceArray(BasePin);

    constructor() {
        super();
        this.id = EngineUtils.makeUniqueId();
    }

    onBehaviorStarted() {        
    }

    findPin(pinId: string) {
        const pin = this._pins.data.find(p => (p.instance as BasePin).id === pinId);        
        return pin ? pin.instance : undefined;   
    }

    findPinByName(pinName: string) {
        const pin = this._pins.data.find(p => (p.instance as BasePin).name === pinName);        
        return pin ? pin.instance : undefined;
    }

    filterPins(filter: (p: BasePin) => boolean) {
        return this._pins.data.filter(p => filter(p.instance as BasePin)).map(p => p.instance as BasePin);
    }

    sendSignal(outputPinName: string) {
        const pin = this.findPinByName(outputPinName);
        if (pin) {
            this._ownerBehavior.sendSignal(this.id, pin.id);
        }        
    }
    
    isLoaded() {
        return true;
    }    
    
    // tslint:disable-next-line
    protected createPin<T extends SerializableObject>(name: string, type: PinType, ctor: Constructor<T>, ...args: any[]) {
        this[name] = Interfaces.factory.createObject(ctor.name, name, type, ...args);        
        this.registerPin(this[name]);
    }
    
    protected createComponentReferencePin(name: string, type: PinType, ctor: Constructor<Component>) {
        let componentRef = new ComponentReferencePin(name, type, ctor.name);
        componentRef.componentType = ctor.name;
        this[name] = componentRef;
        this.registerPin(this[name]);
    }    
    
    protected createAssetPin(name: string, type: PinType, ctor: Constructor<Asset>) {
        let assetRef = new AssetPin(name, type, ctor.name);
        assetRef.assetType = ctor.name;
        this[name] = assetRef;
        this.registerPin(this[name]);
    }    
    
    protected createArrayPin(name: string, type: PinType, ctor: Constructor<Component>) {
        let arrayPin = new ArrayPin(name, type, ctor.name);
        arrayPin.dataType = ctor.name;
        this[name] = arrayPin;
        this.registerPin(this[name]);
    }

    private registerPin(pin: BasePin) {
        this._pins.grow(pin);
    }
}
