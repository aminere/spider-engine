
import { AsyncEvent } from "ts-events";
import { Entity } from "../core/Entity";
import { Texture2D } from "../graphics/texture/Texture2D";

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

export class CommonEditorEvents {
    static behaviorComponentPinsChanged = new AsyncEvent<PinsChangedInfo>();
    static componentAddedOrRemovedByRuntime = new AsyncEvent<Entity>();
    static entityHierarchyChanged = new AsyncEvent<Entity>();
    static assetReferenceCleared = new AsyncEvent<string>();
    static textureDataLoaded = new AsyncEvent<Texture2D>();
    static operatorActivated = new AsyncEvent<OperatorActivationInfo>();
    static operatorDeactivated = new AsyncEvent<OperatorActivationInfo>();
    static signalFired = new AsyncEvent<SignalFiredInfo>();
    static entityActivated = new AsyncEvent<{ entity: Entity; active: boolean; }>();
}
