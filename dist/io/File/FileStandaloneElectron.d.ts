import { IFile } from "./IFile";
/**
 * @hidden
 */
export declare class FileStandaloneElectron implements IFile {
    read(path: string): Promise<unknown>;
    write(path: string, data: any): Promise<void>;
    delete(path: string): Promise<void>;
    renameFile(oldPath: string, newPath: string): Promise<void>;
    renameFolder(oldPath: string, newPath: string): Promise<void>;
    clearAllFiles(): Promise<never>;
}
