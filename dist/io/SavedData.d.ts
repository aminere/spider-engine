export declare namespace SavedDataInternal {
    function preload(): Promise<void>;
}
export declare class SavedData {
    static get(): object;
    static flush(): void;
}
