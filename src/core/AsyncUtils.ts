
import { EngineUtils } from "./EngineUtils";
import { Debug } from "../io/Debug";

/**
 * @hidden
 */
interface AsyncBatchListeners {
    [listenerId: string]: (withErrors: boolean) => void;
}

/**
 * @hidden
 */
namespace Internal {
    export let batchListeners: AsyncBatchListeners = {};
}

/**
 * @hidden
 */
export class AsyncUtils {    

    static processBatch<T>(
        items: T[],        
        processItem: (item: T, success: () => void, error: () => void) => void,
        completed: (hasErrors: boolean) => void
    ) {
        let listenedId = EngineUtils.makeUniqueId();
        let processed = 0;
        let hasErrors = false;
        let onProcessed = () => {
            ++processed;
            if (processed >= items.length) {
                if (listenedId in Internal.batchListeners) {
                    Internal.batchListeners[listenedId](hasErrors);
                    delete Internal.batchListeners[listenedId];
                } else {                    
                    if (process.env.NODE_ENV === "development") {        
                        Debug.log(`Skipping detached Async Batch request '${listenedId}'`);                
                    }                    
                }
            }
        };
        if (items.length > 0) {
            Internal.batchListeners[listenedId] = completed;
            for (let item of items) {
                processItem(item, onProcessed, () => {
                    hasErrors = true;
                    onProcessed();
                });
            }
        } else {
            completed(false);
        }
        return listenedId;
    }

    static detachBatchListener(listenerId: string) {
        delete Internal.batchListeners[listenerId];
    }
}
