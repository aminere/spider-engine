import { IFile } from "./IFile";
export declare class FileIndexedDb implements IFile {
    read(path: string): Promise<any>;
    write(path: string, data: any): Promise<void>;
    delete(path: string): Promise<void>;
    renameFile(oldPath: string, newPath: string): Promise<void>;
    renameFolder(oldPath: string, newPath: string): Promise<void>;
    clearAllFiles(): Promise<void>;
}
