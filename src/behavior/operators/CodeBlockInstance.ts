
import * as Attributes from "../../core/Attributes";
import { ReferenceArray } from "../../serialization/ReferenceArray";
import { AssetReference, AssetChangedEvent } from "../../serialization/AssetReference";
import { VertexBuffer } from "../../graphics/VertexBuffer";
import { EngineUtils } from "../../core/EngineUtils";
import { SerializedObject } from "../../core/SerializableObject";
import { BehaviorUtils } from "../BehaviorUtils";
import { Operator } from "../Operator";
import { CodeBlock, CodeBlockInternal } from "../CodeBlock";
import { BasePin, DataPin } from "../Pin";
import { ExecutionStatus } from "../ExecutionStatus";
import { BehaviorAPI } from "../BehaviorAPI";
import { BehaviorAPIFactory } from "../BehaviorAPIFactory";
import { TDataPin } from "../DataPins";

/**
 * @hidden
 */
export class CodeBlockInstance extends Operator {
    
    get version() { return 2; }

    get codeBlock() { return this._codeBlock.asset; }
    get codeBlockRef() { return this._codeBlock; }

    get customPins() { return this._customPins; }
    get stateVariables() { return this._stateVariables; }

    @Attributes.unserializable()
    private _customPins!: ReferenceArray<BasePin>;

    @Attributes.unserializable()
    private _stateVariables!: object;
    @Attributes.unserializable()
    private _onStartExecutionPending = false;
    @Attributes.unserializable()
    private _initStateExecutionPending = false;
    @Attributes.unserializable()
    private _stateInitialized = false;

    private _codeBlock = new AssetReference(CodeBlock);

    constructor() {
        super();
        this.sendSignal = this.sendSignal.bind(this);
        this.onCodeBlockPinsChanged = this.onCodeBlockPinsChanged.bind(this);
        this.onCodeBlockChanged = this.onCodeBlockChanged.bind(this);
        this._codeBlock.assetChanged.attach(this.onCodeBlockChanged);    
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this._codeBlock);
    }

    destroy() {
        if (this._stateInitialized) {
            this.executeFunction("onDestroy");

            // attempt to release graphic resources if any
            for (const variable of Object.values(this._stateVariables)) {

                // This is intended for state variables owned by this code block instance
                // Ignore data pins
                if (variable.isA && variable.isA(DataPin)) {
                    continue;
                }

                const value = variable[TDataPin.runtimeValueAccessor];
                if (value && value.constructor && value.constructor.name === "VertexBuffer") {
                    (value as VertexBuffer).unload();
                }
            }
        }

        if (this._codeBlock.asset) {
            this._codeBlock.asset.pinChanged.detach(this.onCodeBlockPinsChanged);
        }
        this._codeBlock.detach();
        super.destroy();
    }

    onBehaviorStarted() {
        this.initializeStateIfNecessary();
        this.executeFunction("onBehaviorStarted");
    }

    // Called everytime the start pin is activated
    onStart() {

        const codeBlock = this.codeBlock as CodeBlock;

        this.initializeStateIfNecessary();
        if (codeBlock.runtimeError) {
            this._onStartExecutionPending = true;
            return ExecutionStatus.Continue;
        }

        if (codeBlock.runtimeError || codeBlock.isLoading) {
            this._onStartExecutionPending = true;
            return ExecutionStatus.Continue;
        }

        const result = this.executeFunction("onStart");
        if (result !== undefined) {
            return result;
        } else {
            if (codeBlock.runtimeError) {
                this._onStartExecutionPending = true;
                return ExecutionStatus.Continue;
            } else {
                return ExecutionStatus.Finish;
            }
        }
    }

    onUpdate() {
        const codeBlock = this.codeBlock as CodeBlock;
        if (codeBlock.runtimeError || codeBlock.isLoading) {
            return ExecutionStatus.Continue;
        }

        if (this._initStateExecutionPending) {
            this.initializeStateIfNecessary();
            if (codeBlock.runtimeError) {
                return ExecutionStatus.Continue;
            } else {
                this._initStateExecutionPending = false;
            }
        }

        if (this._onStartExecutionPending) {
            const onStartResult = this.executeFunction("onStart");
            if (onStartResult !== undefined) {
                this._onStartExecutionPending = false;
                return onStartResult;
            } else {
                if (codeBlock.runtimeError) {
                    return ExecutionStatus.Continue;
                } else {
                    return ExecutionStatus.Finish;
                }
            }
        }

        const result = this.executeFunction("onUpdate");
        if (result !== undefined) {
            return result;
        } else {
            if (codeBlock.runtimeError) {
                return ExecutionStatus.Continue;
            } else {
                return ExecutionStatus.Finish;
            }
        }
    }

    onFinish() {
        this.executeFunction("onFinish");
    }

    onSignalReceived(inputPinName: string) {
        const codeBlock = this.codeBlock as CodeBlock;
        if (codeBlock.runtimeError) {
            return;
        }
        this.executeFunction("onSignalReceived", inputPinName);
    }

    onCodeBlockPinsChanged() {
        const codeBlock = this.codeBlock as CodeBlock;
        this._customPins = codeBlock.pins.copy();
        this._stateInitialized = false;
    }

    findPin(pinId: string) {
        let pin = super.findPin(pinId);
        if (!pin) {
            const pinRef = this._customPins ? this._customPins.data.find(p => (p.instance as BasePin).id === pinId) : undefined;
            pin = pinRef ? pinRef.instance : undefined;
        }
        return pin;
    }

    filterPins(filter: (p: BasePin) => boolean) {
        return super.filterPins(filter).concat(this._customPins.data.filter(p => filter(p.instance as BasePin)).map(p => p.instance as BasePin));
    }

    findPinByName(pinName: string) {
        let pin = super.findPin(pinName);
        if (!pin) {
            const pinRef = this._customPins.data.find(p => (p.instance as BasePin).name === pinName);
            pin = pinRef ? pinRef.instance : undefined;
        }
        return pin;
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                _codeBlock: json.properties.codeBlock
            });
            delete json.properties.codeBlock;
        }
        return json;
    }

    setCodeBlock(codeBlock: CodeBlock | null, inline?: boolean) {
        this._codeBlock.asset = codeBlock;
        this._codeBlock.inline = Boolean(inline);
    }

    // tslint:disable-next-line
    private executeFunction(functionName: string, ...params: any[]) {
        const codeBlock = this.codeBlock as CodeBlock;
        try {
            // Old method, for reference
            // if (process.env.CONFIG === "editor") {
            //     let func = codeBlock.functions[functionName];
            //     if (func) {
            //         // TODO
            //         /* return func.call(
            //             func, 
            //             spiderContext(),
            //             this._stateVariables,
            //             BehaviorAPI.api,
            //             VariableObjectFactory.createObject,
            //             ...params
            //         ); */
            //         return func(
            //             spiderContext(),
            //             this._stateVariables,
            //             BehaviorAPI.api,
            //             VariableObjectFactory.createObject,
            //             ...params
            //         );
            //     }
            // }
            const standaloneFunctionName = `${functionName}_${CodeBlockInternal.trimId(codeBlock.id)}`;
            if (standaloneFunctionName in window) {
                this.initializeStateIfNecessary();
                return window[standaloneFunctionName](
                    this._stateVariables,
                    BehaviorAPI.api,
                    BehaviorAPIFactory.createObject,
                    this.sendSignal,
                    ...params
                );
            }
            return undefined;
        } catch (e) {
            codeBlock.logRuntimeError(`Runtime Error: '${e.stack}'`);
        }
    }

    private onCodeBlockChanged(info: AssetChangedEvent) {
        const oldBlock = info.oldAsset as CodeBlock;
        if (oldBlock) {
            oldBlock.pinChanged.detach(this.onCodeBlockPinsChanged);
        }
        const newBlock = info.newAsset as CodeBlock;
        if (newBlock) {
            this._customPins = newBlock.pins.copy();
            this._stateInitialized = false;
            newBlock.pinChanged.attach(this.onCodeBlockPinsChanged);
        }       
    }

    private initializeStateIfNecessary() {
        if (!this._stateInitialized) {
            const codeBlock = this.codeBlock as CodeBlock;
            try {
                this._stateVariables = BehaviorUtils.initializeCodeBlockInstanceState(
                    codeBlock,
                    this.ownerBehavior.ownerComponent.entity,
                    this._customPins,
                    this.sendSignal
                );
                this._stateInitialized = true;
            } catch (e) {
                this._initStateExecutionPending = true;
                codeBlock.logRuntimeError(`Runtime Error: '${e.stack}'`);
            }
        }
    }
}
