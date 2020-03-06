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
    static set instance(instance: IFile);
    static get instance(): IFile;
    static set defaultAssets(defaultAssets: {
        [path: string]: string;
    });
    static getDefaultAsset(path: string): string;
}
