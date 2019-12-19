import { Debug } from "../io/Debug";

export class ObjectPool<T extends object> {

    get size() { return this._size; }

    private _objects: T[];
    private _capacity: number;
    private _size = 0;
    private _initialCapacity: number;
    private _creator: () => T;

    constructor(ctor: { new(): T }, capacity: number) {
        this._initialCapacity = capacity;
        this._capacity = capacity;
        this._objects = [];
        this._objects.length = capacity;
        for (let i = 0; i < capacity; ++i) {
            this._objects[i] = new ctor();
        }
        this._creator = () => new ctor();
    }

    flush() {
        this._size = 0;
    }

    peek(index: number) {
        return this._objects[index];
    }

    get() {
        if (this._size === this._capacity) {
            this.grow();
        }
        return this._objects[this._size++];
    }

    shrink() {
        this._capacity = this._initialCapacity;
        this._objects.length = this._capacity;
        this._size = Math.min(this._size, this._capacity);
    }

    private grow() {
        Debug.log(`${this._objects[0].constructor.name} pool capacity reached, doubling the pool. Consider allocating a bigger pool.`);
        let newCapacity = this._capacity * 2;
        this._objects.length = newCapacity;
        for (var i = this._capacity; i < newCapacity; ++i) {
            this._objects[i] = this._creator();
        }
        this._capacity = newCapacity;
    }
}
