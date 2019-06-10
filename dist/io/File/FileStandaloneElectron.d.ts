import { IFile } from "./IFile";
/**
 * @hidden
 */
export declare class FileStandaloneElectron implements IFile {
    read(path: string): Promise<{}>;
    write(path: string, data: any): Promise<never>;
    delete(path: string): Promise<never>;
    renameFile(oldPath: string, newPath: string): Promise<never>;
    renameFolder(oldPath: string, newPath: string): Promise<never>;
    clearAllFiles(): Promise<never>;
}
