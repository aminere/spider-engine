import { IFile } from "./IFile";
import { Debug } from "../Debug";
import { IndexedDb } from "../IndexedDb";

export class FileIndexedDb implements IFile {    

    // tslint:disable-next-line
    read(path: string) {
        return IndexedDb.read("files", path);
    }

    // tslint:disable-next-line
    write(path: string, data: any) {
       return IndexedDb.write("files", path, data);
    }

    // tslint:disable-next-line
    delete(path: string) {
        return IndexedDb.delete("files", path);
    }

    // tslint:disable-next-line
    renameFile(oldPath: string, newPath: string) {
        Debug.log(`Renaming '${oldPath}' to '${newPath}'`);
        return this.read(oldPath)
            .then(data => this.write(newPath, data))
            .then(() => this.delete(oldPath));        
    }

    renameFolder(oldPath: string, newPath: string) {
        // Nothing to do, folders are purely virtual in the web implementation
        return Promise.resolve();
    }

    clearAllFiles() {
        return IndexedDb.clear("files");
    }
}
