import { BasePin, DataPin } from "./Pin";
import { 
    ComponentReferencePin, 
    ArrayPin, 
    AssetPin, 
    PrefabPin, 
    ObjectReferencePin, 
    TDataPin 
} from "./DataPins";
import { Entity } from "../core/Entity";
import { Asset } from "../assets/Asset";
import { EngineUtils } from "../core/EngineUtils";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { ObjectDeclaration } from "./ObjectDeclaration";
import { BehaviorAPIFactory } from "./BehaviorAPIFactory";
import { ICodeBlock } from "./ICodeBlock";
import { Component } from "../core/Component";
import { Transform } from "../core/Transform";
import { BehaviorAPI } from "./BehaviorAPI";
import { CodeBlockInternal } from "./CodeBlock";

/**
 * @hidden
 */
export interface ObjectDefinitionProperties {
    // tslint:disable-next-line
    [name: string]: any;
}

/**
 * @hidden
 */
export interface IObjectDefinition {
    getPins: () => ReferenceArray<BasePin>;
    setPins: (pins: ReferenceArray<BasePin>) => void;
    findPinByName: (name: string) => BasePin | undefined;
}

/**
 * @hidden
 */
export class BehaviorUtils {
    static pinsHaveSameType(pin1: BasePin, pin2: BasePin) {
        let sameConstructor = pin1.constructor.name === pin2.constructor.name;
        if (sameConstructor) {
            if (pin1.isA(ComponentReferencePin)) {
                let type1 = (pin1 as ComponentReferencePin<Component>).componentType;
                let type2 = (pin2 as ComponentReferencePin<Component>).componentType;
                return type1 === type2 || type1 === "Component" || type2 === "Component";

            } else if (pin1.isA(AssetPin)) {
                return (pin1 as AssetPin<Asset>).assetType
                    === (pin2 as AssetPin<Asset>).assetType;

            } else if (pin1.isA(ArrayPin)) {
                return (pin1 as ArrayPin<DataPin>).dataType === (pin2 as ArrayPin<DataPin>).dataType
                    && (pin1 as ArrayPin<DataPin>).declarationId === (pin2 as ArrayPin<DataPin>).declarationId;

            } else if (pin1.isA(ObjectReferencePin)) {
                return (pin1 as ObjectReferencePin).declarationId === (pin2 as ObjectReferencePin).declarationId;

            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    static isPinLoaded(pin: BasePin) {
        if (pin.isA(PrefabPin)) {
            let prefabRef = (pin as PrefabPin).value;
            if (!EngineUtils.isAssetRefLoaded(prefabRef)) {
                return false;
            }
        } else if (pin.isA(AssetPin)) {
            let assetRef = (pin as AssetPin<Asset>).value;
            if (!EngineUtils.isAssetRefLoaded(assetRef)) {
                return false;
            }
        } else if (pin.isA(ArrayPin)) {
            let arrayProp = (pin as ArrayPin<DataPin>).value;
            for (let subPin of arrayProp.data) {
                if (!BehaviorUtils.isPinLoaded(subPin)) {
                    return false;
                }
            }
        } else if (pin.isA(ObjectReferencePin)) {
            let assetRef = (pin as ObjectReferencePin).value;
            if (!EngineUtils.isAssetRefLoaded(assetRef)) {
                return false;
            }
        }
        return true;
    }

    static buildPins(obj: IObjectDefinition, definition: ObjectDeclaration) {
        let pins = new ReferenceArray(BasePin);
        // Synchronize custom pins on the component with the ones on the behavior
        for (let newPinRef of definition.pins.data) {
            let newPin = newPinRef.instance;
            if (newPin) {
                // Do no lose previous information for unchanged pins (same name and same type)
                let existingPinToKeep: BasePin | undefined = undefined;
                if (obj.getPins()) {
                    let oldPinRef = obj.getPins().data.find(p => {
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
                    pins.grow(existingPinToKeep);
                } else {
                    pins.grow(newPin.copy());
                }
            }
        }
        obj.setPins(pins);
    }

    // tslint:disable-next-line
    static updatePinAccessors(obj: IObjectDefinition) {
        for (let pinRef of obj.getPins().data.filter(p => (p.instance as BasePin).isA(DataPin))) {
            let pinName = (pinRef.instance as DataPin).name;
            Object.defineProperty(obj, pinName, {
                get: () => {
                    let pin = obj.findPinByName(pinName) as DataPin;
                    return pin[TDataPin.runtimeValueAccessor];
                },
                set: value => {
                    let pin = obj.findPinByName(pinName) as DataPin;
                    pin[TDataPin.runtimeValueAccessor] = value;
                },
                configurable: true
            });
        }
    }

    static initializeCodeBlockInstanceState(
        codeBlock: ICodeBlock, 
        ownerEntity: Entity, 
        customPins: ReferenceArray<BasePin>, 
        sendSignal: (signal: string) => void
    ): {
        this: { [accessor: string]: Entity },
        transform: { [accessor: string]: Transform }
    } {        
        // Initialize the state variables
        // Always make "this" (the owner entity) and its transform accessible as state variables        
        const stateVariables = {
            this: { [TDataPin.runtimeValueAccessor]: ownerEntity },
            transform: { [TDataPin.runtimeValueAccessor]: ownerEntity.transform }
        };

        // Add the pins to the state
        const dataPins = customPins.data
            .filter(p => p.instance !== undefined && p.instance.isA(DataPin))
            .map(p => p.instance as DataPin);

        for (const dataPin of dataPins) {
            stateVariables[dataPin.name] = dataPin;
        }

        // execute state variable declarations
        let initStateFunctionName = `initState_${CodeBlockInternal.trimId(codeBlock.id)}`;
        if (initStateFunctionName in window) {
            window[initStateFunctionName](
                stateVariables,
                BehaviorAPI.api,
                BehaviorAPIFactory.createObject,
                sendSignal
            );
        }

        return stateVariables;
    }

    static getVariables(codeBlock: ICodeBlock) {
        return codeBlock.pins.data
            .map(p => p.instance as BasePin)
            .filter(p => p !== undefined)
            .reduce(
                (prev, cur) => ({ ...prev, ...{ [cur.name]: cur.constructor.name } }),
                {
                    this: "Entity",
                    transform: "Transform"
                }
            );
    }
}
