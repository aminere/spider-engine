import { VoidSyncEvent } from "ts-events";
/**
 * @hidden
 */
export declare namespace UpdateInternal {
    function update(): void;
}
export declare class Update {
    /**
     * @event
     */
    static get hook(): VoidSyncEvent;
}
