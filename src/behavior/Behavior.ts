
import * as Attributes from "../core/Attributes";
import { Asset } from "../assets/Asset";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { Operator, OperatorInternal } from "./Operator";
import { PinReference, PinType, SignalPin, BasePin, DataPin } from "./Pin";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { Vector2 } from "../math/Vector2";
import { CodeBlockInstance } from "./operators/CodeBlockInstance";
import { BehaviorOperator } from "./operators/BehaviorOperator";
import { Debug } from "../io/Debug";
import { InlineVariable } from "./InlineVariable";
import { VoidAsyncEvent, AsyncEvent } from "ts-events";
import { BehaviorNode } from "./BehaviorNode";
import { Converter } from "./Converter";
import { CollisionInfo } from "../collision/CollisionInfo";
import { Collision } from "./operators/Collision";
import { UIEvents } from "./operators/UIEvents";
import { IBehaviorComponent } from "./IBehaviorComponent";
import { BehaviorUtils } from "./BehaviorUtils";
import { ExecutionStatus } from "./ExecutionStatus";
import { CodeBlockConverterInstance } from "./operators/CodeBlockConverterInstance";
import { SerializedObjectType } from "../serialization/SerializedTypes";
import { SerializedObject } from "../core/SerializableObject";
import { Reference } from "../serialization/Reference";
import { BehaviorErrors } from "./BehaviorErrors";
import { Connection, ConnectionType } from "./Connection";
import { IBehavior } from "./IBehavior";

interface RuntimePinReference {
    operatorId: string; 
    pinId: string;
}

interface DataConnectionMap {
    [destOperatorId: string]: {
        [destDataPinId: string]: RuntimePinReference
    };
}

interface SignalConnectionMap {
    [srcOperatorId: string]: {
        [srcSignalPinId: string]: RuntimePinReference[]
    };
}

/**
 * @hidden
 */
// tslint:disable-next-line
var CommonEditorEvents: any = undefined;
if (process.env.CONFIG === "editor") {
    CommonEditorEvents = require("../editor/CommonEditorEvents").CommonEditorEvents;
}

@Attributes.hasDedicatedEditor(true)
export class Behavior extends Asset implements IBehavior {
    
    get version() { return 2; }

    get operators(): Reference<BehaviorNode>[] { return this._operators.data; }
    get connections() { return this._connections.data; }
    get pins() { return this._pins; }
    get customPins() { return this._customPins; }
    get inlineVariables() { return this._inlineVariables; }
    get activeOperators() { return this._activeOperators; }

    set customPins(customPins: ReferenceArray<BasePin>) { this._customPins = customPins; }
    set ownerComponent(owner: IBehaviorComponent) {
        this._ownerComponent = owner;
    }

    // IBehavior
    get ownerComponent() {
        return this._ownerComponent;
    }

    inputsPosition = new Vector2();
    outputsPosition = new Vector2(150, 150);

    /**
     * @event
     */
    @Attributes.unserializable()
    pinChanged = new VoidAsyncEvent();

    /**
     * @event
     */
    @Attributes.unserializable()
    inlineVariableChanged = new AsyncEvent<string>();

    private _operators = new ReferenceArray(BehaviorNode);
    private _customPins = new ReferenceArray(BasePin);
    private _connections = new ArrayProperty(Connection);
    private _inlineVariables = new ArrayProperty(InlineVariable);

    @Attributes.unserializable()
    private _pins = new ReferenceArray(BasePin);

    @Attributes.unserializable()
    private _signalConnectionMap!: SignalConnectionMap;

    @Attributes.unserializable()
    private _dataConnectionMap!: DataConnectionMap;

    @Attributes.unserializable()
    private _ownerComponent!: IBehaviorComponent;

    @Attributes.unserializable()
    private _activeOperators: Operator[] = [];

    @Attributes.unserializable()
    private _finishedOperators: Operator[] = [];

    static isConnectionValid(behavior: Behavior, src: PinReference, dest: PinReference) {
        if (src.operatorId !== dest.operatorId) {
            const srcPin = behavior.findPin(src.operatorId, src.pinId);
            const destPin = behavior.findPin(dest.operatorId, dest.pinId);
            if (srcPin && destPin) {
                const behaviorId = behavior.id;
                if (src.operatorId === behaviorId || dest.operatorId === behaviorId) {
                    // connection between the behavior and an operator
                    if (srcPin.type === destPin.type) {
                        return BehaviorUtils.pinsHaveSameType(srcPin, destPin);
                    }
                } else {
                    // connection between operators
                    if (srcPin.type !== destPin.type) {
                        return BehaviorUtils.pinsHaveSameType(srcPin, destPin);
                    }
                }
            }
        }
        return false;
    }

    constructor() {
        super();
        this._pins.grow(new SignalPin(OperatorInternal.startPinId, PinType.Input));
    }

    // IBehavior interface
    sendSignal(operatorId: string, pinId: string) {
        const signal = this._signalConnectionMap[operatorId];
        if (Boolean(signal)) {
            const pinReferences = signal[pinId];
            if (Boolean(pinReferences)) {
                for (const pinReference of pinReferences) {
                    const operator = this.findOperator(pinReference.operatorId);
                    if (operator) {
                        this.fetchInputData(operator.id);
                        this.activateInputPin(operator as Operator, pinReference.pinId);
                        if (process.env.CONFIG === "editor") {
                            this.recordSignalFired(operatorId, pinId, operator.id, pinReference.pinId);
                        }
                    }
                }
            }
        }
    }

    fetchInputData(operatorId: string) {
        const operatorInfo = this._dataConnectionMap[operatorId];
        if (!operatorInfo) {            
            // let operator = this.findOperator(operatorId);
            // if (operator) {
            //     let dataInputs = operator.filterPins(p => p.type === PinType.Input && p.isA(DataPin));
            //     dataInputs.forEach(p => (p as DataPin).setData(undefined));
            // }            
            return;
            // TODO make sure all pins are set to undefined in the other common scenario!
        }
        for (let inputDataPinId of Object.keys(operatorInfo)) {
            const dataSource = operatorInfo[inputDataPinId];
            let srcPin: BasePin | undefined;
            let srcConverter: Converter | undefined = undefined;
            if (dataSource.operatorId === this.id) {
                srcPin = this.findBehaviorPin(dataSource.pinId);
            } else {
                // check operators
                const operator = this.findOperator(dataSource.operatorId);
                if (operator) {
                    srcPin = operator.findPin(dataSource.pinId);
                    if (operator.isA(Converter)) {
                        srcConverter = operator as Converter;
                    }
                } else {
                    srcPin = this.findVariablePin(dataSource.operatorId);
                }
            }
            if (!srcPin) {
                continue;
            }
            if (srcPin.isA(DataPin)) {
                const expectedSourcePinType = (dataSource.operatorId === this.id) ? PinType.Input : PinType.Output;
                if (srcPin.type !== expectedSourcePinType) {
                    Debug.log(`Trying to get data from an input pin ${srcPin.name}`);
                } else {
                    if (srcConverter) {
                        // perform a conversion on the spot before fetching the data
                        this.fetchInputData(srcConverter.id);
                        srcConverter.convert();
                        this.checkCodeBlockError(srcConverter);
                    }
                    const data = (srcPin as DataPin).getData();
                    const destPin = this.findPin(operatorId, inputDataPinId);
                    if (destPin) {
                        if (destPin.isA(DataPin)) {
                            const expectedDestPinType = (operatorId === this.id) ? PinType.Output : PinType.Input;
                            if (destPin.type !== expectedDestPinType) {
                                Debug.log(`Trying to set data on an output pin ${destPin.name}`);
                            } else {
                                (destPin as DataPin).setData(data);
                            }
                        } else {
                            Debug.log(`Trying to set data on a signal pin ${destPin.name}`);
                        }
                    }
                }
            } else {
                Debug.log(`Trying to get data from a signal pin ${srcPin.name}`);
            }
        }
    }    

    activateOperator(operator: Operator) {
        if (this._activeOperators.indexOf(operator) >= 0) {
            return;
        }
        if (process.env.CONFIG === "editor") {
            const info = {
                timeStamp: Date.now(),
                entityId: this._ownerComponent.entity.id,
                behaviorPath: this.templatePath,
                operatorIds: [operator.id]
            };
            localStorage.setItem("secondary_editor_operator_activated", JSON.stringify(info));
            // also notify locally in case there is a local behavior editor
            CommonEditorEvents.operatorActivated.post(info);
        }
        this._activeOperators.push(operator);
    }
    // End IBehavior    

    // tslint:disable-next-line
    setProperty(name: string, value: any) {        
        super.setProperty(name, value);
        if (name === "_operators") {
            for (const _operator of this._operators.data) {
                if (_operator.instance) {
                    _operator.instance.ownerBehavior = this;
                }
            }
        }
    }

    isLoaded() {
        for (const operatorRef of this._operators.data) {
            const operator = operatorRef.instance as BehaviorNode;
            if (!operator.isLoaded()) {
                return false;
            }
        }

        for (const v of this._inlineVariables.data) {
            if (!BehaviorUtils.isPinLoaded(v.data.instance as BasePin)) {
                return false;
            }
        }
        return true;
    }

    start() {

        this.buildConnectionMaps();

        // This is a one-time start event, to be typically used for attaching to events
        for (const node of this._operators.data) {
            const operator = (node.instance as BehaviorNode);
            this.fetchInputData(operator.id);
            operator.onBehaviorStarted();
        }

        // Fire the start signal
        const signal = this._signalConnectionMap[this.id];
        if (Boolean(signal)) {
            const startPinSignal = signal[OperatorInternal.startPinId];
            if (Boolean(startPinSignal)) {
                for (const destPin of startPinSignal) {
                    const operator = this.findOperator(destPin.operatorId);
                    if (operator) {
                        this.activateInputPin(operator as Operator, destPin.pinId);
                        if (process.env.CONFIG === "editor") {
                            this.recordSignalFired(this.id, OperatorInternal.startPinId, operator.id, destPin.pinId);
                        }
                    }
                }
            }
        }
    }

    update() {

        this._finishedOperators.length = 0;
        for (const operator of this._activeOperators) {
            this.fetchInputData(operator.id);
            const status = operator.onUpdate();
            this.checkCodeBlockError(operator);
            if (status === ExecutionStatus.Finish) {
                this._finishedOperators.push(operator);
            }
        }

        if (this._finishedOperators.length > 0) {
            const finishedOperatorIds: string[] = [];
            for (const operator of this._finishedOperators) {
                const index = this._activeOperators.indexOf(operator);
                console.assert(index >= 0);
                this._activeOperators.splice(index, 1);
                this.finishOperator(operator);
                if (process.env.CONFIG === "editor") {
                    finishedOperatorIds.push(operator.id);
                }
            }
            if (process.env.CONFIG === "editor") {
                // TODO behaviors compete for this and it gets frequently overwritten
                // use a higher level structure that keeps track of them and writes in the storage every 10ms or so
                const info = {
                    timeStamp: Date.now(),
                    entityId: this._ownerComponent.entity.id,
                    behaviorPath: this.templatePath,
                    operatorIds: finishedOperatorIds
                };
                localStorage.setItem("secondary_editor_operator_deactivated", JSON.stringify(info));
                // also notify locally in case there is a local behavior editor
                CommonEditorEvents.operatorDeactivated.post(info);
            }
        }
    }

    addConnection(connection: Connection) {
        this._connections.grow(connection);
    }

    removeConnection(connection: Connection) {
        const index = this._connections.data.indexOf(connection);
        if (index >= 0) {
            this._connections.data.splice(index, 1);
        }
        return this.clearOrphanVariables();
    }

    removeVariable(variable: InlineVariable) {
        // remove connections to this variable
        for (let i = 0; i < this._connections.data.length;) {
            const c = this._connections.data[i];
            if (c.src.operatorId === variable.id || c.dest.operatorId === variable.id) {
                this._connections.data.splice(i, 1);
            } else {
                ++i;
            }
        }

        for (let i = 0; i < this._inlineVariables.data.length; ++i) {
            const v = this._inlineVariables.data[i];
            if (v.id === variable.id) {
                this._inlineVariables.data.splice(i, 1);
                break;
            }
        }
    }

    removeNode(node: BehaviorNode) {
        const removedConnections: Connection[] = [];
        // remove connections to this operator
        for (let i = 0; i < this._connections.data.length;) {
            const c = this._connections.data[i];
            if (c.src.operatorId === node.id || c.dest.operatorId === node.id) {
                removedConnections.push(c);
                this._connections.data.splice(i, 1);
            } else {
                ++i;
            }
        }

        for (let i = 0; i < this._operators.data.length; ++i) {
            const o = this._operators.data[i];
            if (o.instance && o.instance === node) {
                this._operators.data.splice(i, 1);
                break;
            }
        }
        return {
            removedConnections: removedConnections,
            removedVariables: this.clearOrphanVariables()
        };
    }

    clearOrphanVariables() {
        const removedVariables: InlineVariable[] = [];
        // Remove orphan variables not connected to anything
        for (let i = 0; i < this._inlineVariables.data.length;) {
            let remainingConnections = 0;
            const variable = this._inlineVariables.data[i];
            for (const c of this._connections.data) {
                if (c.src.operatorId === variable.id || c.dest.operatorId === variable.id) {
                    ++remainingConnections;
                }
            }
            if (remainingConnections === 0) {
                this._inlineVariables.data.splice(i, 1);
                removedVariables.push(variable);
            } else {
                ++i;
            }
        }
        return removedVariables;
    }

    addNode(operator: BehaviorNode) {
        this._operators.grow(operator);
        operator.ownerBehavior = this;
    }

    addVariable(variable: InlineVariable) {
        this._inlineVariables.grow(variable);
    }

    findOperator(id: string) {
        // TODO optimize by making operatos in a dictionary instead of an array
        for (const operator of this._operators.data) {
            if (operator.instance && operator.instance.id === id) {
                return operator.instance;
            }
        }
        return undefined;
    }

    findVariable(id: string) {
        // TODO optimize by making operatos in a dictionary instead of an array
        return this._inlineVariables.data.find(v => v.id === id);
    }

    findPin(operatorId: string, pinId: string) {
        if (operatorId === this.id) {
            return this.findBehaviorPin(pinId);
        } else {
            // check operators
            const operator = this.findOperator(operatorId);
            if (operator) {
                return operator.findPin(pinId);
            } else {
                return this.findVariablePin(operatorId);
            }
        }
    }

    copy(preserveId?: boolean) {
        const oldId = this.id;
        const clone: Behavior = super.copy() as Behavior;
        if (preserveId !== true) {
            // We must preserve the connections that use the old ID
            const newId = clone.id;
            for (const connection of clone._connections.data) {
                if (connection.src.operatorId === oldId) {
                    connection.src.operatorId = newId;
                } else if (connection.dest.operatorId === oldId) {
                    connection.dest.operatorId = newId;
                }
            }
        } else {
            clone.id = oldId;
        }
        return clone;
    }    
    
    deserialize(json: SerializedObjectType) {
        if (process.env.CONFIG === "editor") {
            for (const op of this.operators) {
                if (op.instance) {
                    op.instance.destroy();
                }
            }
        }
        return super.deserialize(json) as Behavior;
    }

    updateInlineVariable(id: string, other: InlineVariable) {
        const myVar = this._inlineVariables.data.find(v => v.id === id);
        if (myVar) {
            const myPin = myVar.data.instance as DataPin;
            const otherPin = other.data.instance as DataPin;
            myPin.setData(otherPin.getData());
        }
    }
    
    destroy() {
        for (const operatorRef of this._operators.data) {
            const operator = operatorRef.instance as Operator;
            operator.destroy();
        }
        super.destroy();
    }

    onCollision(info: CollisionInfo) {
        for (const operatorRef of this._operators.data) {
            const operator = operatorRef.instance as BehaviorNode;
            if (operator.isA(Collision)) {
                (operator as Collision).onCollision(info);
            } else if (operator.isA(BehaviorOperator)) {
                (operator as BehaviorOperator).onCollision(info);
            }
        }
    }

    onUIEvent(handler: (uiOperator: UIEvents) => boolean) {
        let stopPropagation = false;
        for (const operatorRef of this._operators.data) {
            const operator = operatorRef.instance as BehaviorNode;
            if (operator.isA(UIEvents)) {
                const _stopPropagation = handler(operator as UIEvents);
                if (_stopPropagation) {
                    stopPropagation = true;
                    break;
                }
            } else if (operator.isA(BehaviorOperator)) {
                const _stopPropagation = (operator as BehaviorOperator).onUIEvent(handler);
                if (_stopPropagation) {
                    stopPropagation = true;
                    break;
                }
            }
        }
        return stopPropagation;
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            // tslint:disable-next-line
            for (const operator of (json.properties as any)._operators.data) {
                if (operator.data.typeName === "ScreenToWorldRay") {
                    operator.data.typeName = "ScreenToRay";
                }
            }
        }
        return json;
    }

    private startOperator(operator: Operator) {
        const status = operator.onStart();
        this.checkCodeBlockError(operator);
        if (status === ExecutionStatus.Continue) {
            this.activateOperator(operator);
        } else {
            this.finishOperator(operator);
        }
    }
    
    private finishOperator(operator: Operator) {
        operator.onFinish();
        // activate finish pin
        this.sendSignal(operator.id, OperatorInternal.finishPinId);
    }

    private checkCodeBlockError(operator: BehaviorNode) {
        if (process.env.CONFIG === "editor") {
            if (operator.isA(CodeBlockInstance)) {
                const codeBlock = (operator as CodeBlockInstance).codeBlock;
                if (codeBlock) {
                    BehaviorErrors.checkCodeBlock(codeBlock);
                }
            } else if (operator.isA(CodeBlockConverterInstance)) {
                const codeBlock = (operator as CodeBlockConverterInstance).codeBlock;
                if (codeBlock) {
                    BehaviorErrors.checkCodeBlock(codeBlock);
                }
            }
        }
    }

    private activateInputPin(operator: Operator, pinId: string) {
        if (pinId === OperatorInternal.startPinId) {
            this.startOperator(operator);
        } else {
            const pin = operator.findPin(pinId);
            if (pin) {
                operator.onSignalReceived(pin.name);
                this.checkCodeBlockError(operator);
            }
        }
    }

    private buildConnectionMaps() {
        // Build connection maps
        this._signalConnectionMap = {};
        this._dataConnectionMap = {};
        for (const connection of this._connections.data) {
            // TODO call clearInvalidConnections in project export!!
            if (!Behavior.isConnectionValid(this, connection.src, connection.dest)) {
                if (process.env.NODE_ENV === "development") {
                    Debug.logWarning(`Skipping invalid connection in '${this.templatePath}'`);
                }
                continue;
            }
            if (connection.type === ConnectionType.Signal) {
                // Store connection from source to destination, because signals are sent from souce to dest
                const srcOperatorId = connection.src.operatorId;
                const srcPinId = connection.src.pinId;
                const destPinReference = {
                    operatorId: connection.dest.operatorId,
                    pinId: connection.dest.pinId
                };
                if (srcOperatorId in this._signalConnectionMap) {
                    if (srcPinId in this._signalConnectionMap[srcOperatorId]) {
                        this._signalConnectionMap[srcOperatorId][srcPinId].push(destPinReference);
                    } else {
                        Object.assign(this._signalConnectionMap[srcOperatorId], { [srcPinId]: [destPinReference] });
                    }
                } else {
                    Object.assign(this._signalConnectionMap, { [srcOperatorId]: { [srcPinId]: [destPinReference] } });
                }
            } else {
                // Store connection from dest to source, because the destination initiates the data fetching
                const destOperatorId = connection.dest.operatorId;
                const destPinId = connection.dest.pinId;
                const srcPinReference = {
                    operatorId: connection.src.operatorId,
                    pinId: connection.src.pinId
                };
                if (destOperatorId in this._dataConnectionMap) {
                    if (destPinId in this._dataConnectionMap[destOperatorId]) {
                        this._dataConnectionMap[destOperatorId][destPinId] = srcPinReference;
                    } else {
                        Object.assign(this._dataConnectionMap[destOperatorId], { [destPinId]: srcPinReference });
                    }
                } else {
                    Object.assign(this._dataConnectionMap, { [destOperatorId]: { [destPinId]: srcPinReference } });
                }
            }
        }
    }

    private findBehaviorPin(pinId: string) {
        let pin = this._pins.data.find(p => p.instance ? p.instance.id === pinId : false);
        if (!pin) {
            pin = this._customPins.data.find(p => p.instance ? p.instance.id === pinId : false);
        }
        return pin ? pin.instance : undefined;
    }

    private findVariablePin(variableId: string) {
        const variable = this.findVariable(variableId);
        return variable ? variable.data.instance : undefined;
    }

    private recordSignalFired(srcOperatorId: string, srcPinId: string, destOperatorId: string, destPinId: string) {
        const signalFiredInfo = {
            timeStamp: Date.now(),
            entityId: this._ownerComponent.entity.id,
            behaviorPath: this.templatePath,
            srcOperatorId: srcOperatorId,
            srcPinId: srcPinId,
            destOperatorId: destOperatorId,
            destPinId: destPinId
        };
        localStorage.setItem("secondary_editor_signal_fired", JSON.stringify(signalFiredInfo));
        // also notify locally in case there is a local behavior editor
        CommonEditorEvents.signalFired.post(signalFiredInfo);
    }
}
