export declare class IndexedDb {
    static initialize(dbName: string, version: number): Promise<void>;
    static read(store: string, key: string): Promise<any>;
    static write(store: string, key: string, data: any): Promise<void>;
    static delete(store: string, key: string): Promise<void>;
    static clear(store: string): Promise<void>;
}
