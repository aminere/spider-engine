import { AsyncEvent } from "ts-events";
import { Entity } from "../core/Entity";
import { Texture2D } from "../graphics/Texture2D";
export interface PinsChangedInfo {
    ownerId: string;
    pinIds: string[];
}
export interface OperatorActivationInfo {
    entityId: string;
    behaviorPath: string;
    operatorIds: string[];
}
export interface SignalFiredInfo {
    entityId: string;
    behaviorPath: string;
    srcOperatorId: string;
    srcPinId: string;
    destOperatorId: string;
    destPinId: string;
}
export declare class CommonEditorEvents {
    static behaviorComponentPinsChanged: AsyncEvent<PinsChangedInfo>;
    static componentAddedOrRemovedByRuntime: AsyncEvent<Entity>;
    static entityHierarchyChanged: AsyncEvent<Entity>;
    static assetReferenceCleared: AsyncEvent<string>;
    static textureDataLoaded: AsyncEvent<Texture2D>;
    static operatorActivated: AsyncEvent<OperatorActivationInfo>;
    static operatorDeactivated: AsyncEvent<OperatorActivationInfo>;
    static signalFired: AsyncEvent<SignalFiredInfo>;
    static entityActivated: AsyncEvent<Entity>;
}
