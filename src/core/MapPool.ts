import { Debug } from "../io/Debug";

/**
 * @hidden
 */
export class MapPool<KeyType, ValueType> {
    private _maps: Map<KeyType, ValueType>[];
    private _capacity: number;
    private _size = 0;
    private _initialCapacity: number;

    constructor(capacity: number) {
        this._initialCapacity = capacity;
        this._capacity = capacity;
        this._maps = [];
        this._maps.length = capacity;
        for (var i = 0; i < capacity; ++i) {
            this._maps[i] = new Map<KeyType, ValueType>();
        }
    }

    flush() {
        for (var i = 0; i < this._size; ++i) {
            this._maps[i].clear();
        }
        this._size = 0;
    }

    get() {
        if (this._size === this._capacity) {
            this.grow();
        }
        return this._maps[this._size++];
    }

    shrink() {
        this._capacity = this._initialCapacity;
        this._maps.length = this._capacity;
        this._size = Math.min(this._size, this._capacity);
    }

    private grow() {
        Debug.log(`MapPool capacity reached, doubling the pool. Consider allocation a bigger pool.`);
        let newCapacity = this._capacity * 2;
        this._maps.length = newCapacity;
        for (var i = this._capacity; i < newCapacity; ++i) {
            this._maps[i] = new Map<KeyType, ValueType>();
        }
        this._capacity = newCapacity;
    }
}
