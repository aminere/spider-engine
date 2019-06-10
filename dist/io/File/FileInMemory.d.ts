import { IFile } from "./IFile";
export declare class FileInMemory implements IFile {
    read(path: string): Promise<{}>;
    write(path: string, data: any): Promise<void>;
    delete(path: string): Promise<never>;
    renameFile(oldPath: string, newPath: string): Promise<never>;
    renameFolder(oldPath: string, newPath: string): Promise<never>;
    clearAllFiles(): Promise<never>;
    temporaryGetFiles(): {
        [path: string]: string;
    };
}
