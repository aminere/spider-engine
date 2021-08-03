import { Asset } from "../assets/Asset";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { Operator } from "./Operator";
import { PinReference, BasePin } from "./Pin";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { Vector2 } from "../math/Vector2";
import { InlineVariable } from "./InlineVariable";
import { VoidAsyncEvent, AsyncEvent } from "ts-events";
import { BehaviorNode } from "./BehaviorNode";
import { CollisionInfo } from "../collision/CollisionInfo";
import { UIEvents } from "./operators/UIEvents";
import { IBehaviorComponent } from "./IBehaviorComponent";
import { SerializedObjectType } from "../serialization/SerializedTypes";
import { SerializedObject } from "../core/SerializableObject";
import { Reference } from "../serialization/Reference";
import { Connection } from "./Connection";
import { IBehavior } from "./IBehavior";
export declare class Behavior extends Asset implements IBehavior {
    get version(): number;
    get operators(): Reference<BehaviorNode>[];
    get connections(): Connection[];
    get pins(): ReferenceArray<BasePin>;
    get customPins(): ReferenceArray<BasePin>;
    get inlineVariables(): ArrayProperty<InlineVariable>;
    get activeOperators(): Operator[];
    set customPins(customPins: ReferenceArray<BasePin>);
    set ownerComponent(owner: IBehaviorComponent);
    get ownerComponent(): IBehaviorComponent;
    inputsPosition: Vector2;
    outputsPosition: Vector2;
    /**
     * @event
     */
    pinChanged: VoidAsyncEvent;
    /**
     * @event
     */
    inlineVariableChanged: AsyncEvent<string>;
    private _operators;
    private _customPins;
    private _connections;
    private _inlineVariables;
    private _pins;
    private _signalConnectionMap;
    private _dataConnectionMap;
    private _ownerComponent;
    private _activeOperators;
    private _finishedOperators;
    static isConnectionValid(behavior: Behavior, src: PinReference, dest: PinReference): boolean;
    constructor();
    sendSignal(operatorId: string, pinId: string): void;
    fetchInputData(operatorId: string): void;
    activateOperator(operator: Operator): void;
    setProperty(name: string, value: any): void;
    isLoaded(): boolean;
    start(): void;
    update(): void;
    addConnection(connection: Connection): void;
    removeConnection(connection: Connection): InlineVariable[];
    removeVariable(variable: InlineVariable): void;
    removeNode(node: BehaviorNode): {
        removedConnections: Connection[];
        removedVariables: InlineVariable[];
    };
    clearOrphanVariables(): InlineVariable[];
    addNode(operator: BehaviorNode): void;
    addVariable(variable: InlineVariable): void;
    findOperator(id: string): BehaviorNode | undefined;
    findVariable(id: string): InlineVariable | undefined;
    findPin(operatorId: string, pinId: string): BasePin | undefined;
    copy(preserveId?: boolean): Behavior;
    deserialize(json: SerializedObjectType): Behavior;
    updateInlineVariable(id: string, other: InlineVariable): void;
    destroy(): void;
    onCollision(info: CollisionInfo): void;
    onUIEvent(handler: (uiOperator: UIEvents) => boolean): boolean;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private startOperator;
    private finishOperator;
    private checkCodeBlockError;
    private activateInputPin;
    private buildConnectionMaps;
    private findBehaviorPin;
    private findVariablePin;
    private recordSignalFired;
}
