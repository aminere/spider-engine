export declare class AsyncUtils {
    static processBatch<T>(items: T[], processItem: (item: T, success: () => void, error: () => void) => void, completed: (hasErrors: boolean) => void): string;
    static detachBatchListener(listenerId: string): void;
}
