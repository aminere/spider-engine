
import * as Attributes from "../../core/Attributes";
import { ReferenceArray } from "../../serialization/ReferenceArray";
import { AssetReference, AssetChangedEvent } from "../../serialization/AssetReference";
import { VertexBuffer } from "../../graphics/VertexBuffer";
import { EngineUtils } from "../../core/EngineUtils";
import { SerializedObject } from "../../core/SerializableObject";
import { WebGL } from "../../graphics/WebGL";
import { BehaviorUtils } from "../BehaviorUtils";
import { Converter } from "../Converter";
import { CodeBlock, CodeBlockInternal } from "../CodeBlock";
import { BasePin } from "../Pin";
import { CodeBlockConverter } from "../CodeBlockConverter";
import { BehaviorAPI } from "../BehaviorAPI";
import { BehaviorAPIFactory } from "../BehaviorAPIFactory";

export class CodeBlockConverterInstance extends Converter {
    
    get version() { return 2; }
    
    get codeBlock() { return this._codeBlock.asset; }
    get codeBlockRef() { return this._codeBlock; }
    get customPins() { return this._customPins; }

    @Attributes.unserializable()
    private _customPins!: ReferenceArray<BasePin>;

    @Attributes.unserializable()
    private _stateVariables!: object;

    @Attributes.unserializable()
    private _stateInitialized = false;

    private _codeBlock = new AssetReference(CodeBlockConverter);

    constructor() {
        super();
        this.sendSignal = this.sendSignal.bind(this);
        this.onCodeBlockPinsChanged = this.onCodeBlockPinsChanged.bind(this);
        this.onCodeBlockChanged = this.onCodeBlockChanged.bind(this);
        this._codeBlock.assetChanged.attach(this.onCodeBlockChanged);
    }

    destroy() {
        if (this._stateInitialized) {
            this.executeFunction("onDestroy");

            // attempt to release graphic resources if any
            for (let variable of Object.keys(this._stateVariables)) {
                let value = this._stateVariables[variable].value;
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

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this._codeBlock);
    }

    convert() {
        let codeBlock = this.codeBlock as CodeBlock;
        if (codeBlock.runtimeError) {
            return;
        }
        this.executeFunction("convert");
    }

    onSignalReceived(inputPinId: string) {
        let codeBlock = this.codeBlock as CodeBlock;
        if (codeBlock.runtimeError) {
            return;
        }
        this.executeFunction("onSignalReceived", inputPinId);
    }

    onCodeBlockPinsChanged() {
        if (this.codeBlock) {
            this._customPins = this.codeBlock.pins.copy();
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
        let codeBlock = this.codeBlock as CodeBlock;
        try {
            let standaloneFunctionName = `${functionName}_${CodeBlockInternal.trimId(codeBlock.id)}`;
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
        let oldBlock = info.oldAsset as CodeBlock;
        if (oldBlock) {
            oldBlock.pinChanged.detach(this.onCodeBlockPinsChanged);
        }
        let newBlock = info.newAsset as CodeBlock;
        if (newBlock) {
            this._customPins = newBlock.pins.copy();
            this._stateInitialized = false;
            newBlock.pinChanged.attach(this.onCodeBlockPinsChanged);
        }
    }
    
    private initializeStateIfNecessary() {
        if (!this._stateInitialized) {
            this._stateVariables = BehaviorUtils.initializeCodeBlockInstanceState(
                this.codeBlock as CodeBlock,
                this.ownerBehavior.ownerComponent.entity,
                this._customPins,
                this.sendSignal
            );
            this._stateInitialized = true;
        }
    }
}
