import { VoidSyncEvent } from "ts-events";
export declare namespace UpdateInternal {
    function update(): void;
}
export declare class Update {
    /**
     * @event
     */
    static readonly hook: VoidSyncEvent;
}
