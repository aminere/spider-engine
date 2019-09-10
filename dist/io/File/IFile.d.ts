export interface IFile {
    read: (path: string) => Promise<any>;
    write: (path: string, data: any) => Promise<void>;
    delete: (path: string) => Promise<void>;
    renameFile: (oldPath: string, newPath: string) => Promise<void>;
    renameFolder: (oldPath: string, newPath: string) => Promise<void>;
    clearAllFiles: () => Promise<void>;
}
/**
 * @hidden
 */
export declare class IFileInternal {
    static instance: IFile;
    static defaultAssets: {
        [path: string]: string;
    };
    static getDefaultAsset(path: string): string;
}
