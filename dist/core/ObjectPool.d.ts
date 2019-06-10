export declare class ObjectPool<T> {
    readonly size: number;
    private _objects;
    private _capacity;
    private _size;
    private _initialCapacity;
    private _creator;
    constructor(ctor: {
        new (): T;
    }, capacity: number);
    flush(): void;
    peek(index: number): T;
    get(): T;
    shrink(): void;
    private grow;
}
