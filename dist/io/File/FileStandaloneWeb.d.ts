import { IFile } from "./IFile";
export declare class FileStandaloneWeb implements IFile {
    constructor(defaultAssets: {
        [path: string]: string;
    });
    read(path: string): Promise<{}>;
    write(path: string, data: any): Promise<never>;
    delete(path: string): Promise<never>;
    renameFile(oldPath: string, newPath: string): Promise<never>;
    renameFolder(oldPath: string, newPath: string): Promise<never>;
    clearAllFiles(): Promise<never>;
}
