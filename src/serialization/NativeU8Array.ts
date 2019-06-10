
/**
 * @hidden
 */
export class NativeU8Array {
    set length(length: number) {
        if (!this.array || length !== this.array.length) {
            this.array = new Uint8Array(length);
        }
    }

    array!: Uint8Array;

    constructor(data?: string) {
        if (data) { 
            let buf = Buffer.from(data, "base64");
            this.array = new Uint8Array(buf);
        }
    }

    serialize() {
        if (this.array) {
            let buf = Buffer.from(this.array.buffer);
            return buf.toString("base64");
        }
        return undefined;
    }
}
