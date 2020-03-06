/**
 * @hidden
 */
export declare class NativeU8Array {
    set length(length: number);
    array: Uint8Array;
    constructor(data?: string);
    serialize(): string | undefined;
}
