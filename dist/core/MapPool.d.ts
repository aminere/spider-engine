/**
 * @hidden
 */
export declare class MapPool<KeyType, ValueType> {
    private _maps;
    private _capacity;
    private _size;
    private _initialCapacity;
    constructor(capacity: number);
    flush(): void;
    get(): Map<KeyType, ValueType>;
    shrink(): void;
    private grow;
}
