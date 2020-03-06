import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin, PinType } from "./Pin";
import { Vector2 } from "../math/Vector2";
import { SerializableObject } from "../core/SerializableObject";
import { IBehavior } from "./IBehavior";
import { Asset } from "../assets/Asset";
import { Component } from "../core/Component";
import { Constructor } from "../core/Types";
export declare class BehaviorNode extends SerializableObject {
    position: Vector2;
    id: string;
    /**
     * @hidden
     */
    widthInEditor: number;
    get pins(): ReferenceArray<BasePin>;
    set ownerBehavior(owner: IBehavior);
    get ownerBehavior(): IBehavior;
    private _ownerBehavior;
    private _pins;
    constructor();
    onBehaviorStarted(): void;
    findPin(pinId: string): BasePin | undefined;
    findPinByName(pinName: string): BasePin | undefined;
    filterPins(filter: (p: BasePin) => boolean): BasePin[];
    sendSignal(outputPinName: string): void;
    isLoaded(): boolean;
    protected createPin<T extends SerializableObject>(name: string, type: PinType, ctor: Constructor<T>, ...args: any[]): void;
    protected createComponentReferencePin(name: string, type: PinType, ctor: Constructor<Component>): void;
    protected createAssetPin(name: string, type: PinType, ctor: Constructor<Asset>): void;
    protected createArrayPin(name: string, type: PinType, ctor: Constructor<Component>): void;
    private registerPin;
}
