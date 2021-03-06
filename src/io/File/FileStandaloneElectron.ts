import { IFile } from "./IFile";
import { Debug } from "../Debug";

// tslint:disable-next-line
let fs: any = undefined;
if (process.env.PLATFORM === "electron") {
    fs = require("fs");
}

/**
 * @hidden
 */
export class FileStandaloneElectron implements IFile {    
    read(path: string) {
        return new Promise((resolve, reject) => {
            // tslint:disable-next-line
            fs.readFile(path, (err: any, data: any) => {
                if (!err) {
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        });
    }

    // tslint:disable-next-line
    write(path: string, data: any) {
        return new Promise<void>((resolve, reject) => {
            // tslint:disable-next-line
            fs.writeFile(path, data, (err: any) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    // tslint:disable-next-line
    delete(path: string) {
        return new Promise<void>((resolve, reject) => {
            // tslint:disable-next-line
            fs.unlink(path, (err: any) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    renameFile(oldPath: string, newPath: string) {
        return new Promise<void>((resolve, reject) => {
            // tslint:disable-next-line
            fs.rename(oldPath, newPath, (err: any) => {
                if (err) {
                    Debug.log(`Failed renaming '${oldPath}' to '${newPath}': ${err}`);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    renameFolder(oldPath: string, newPath: string) {
        return this.renameFile(oldPath, newPath);
    }

    clearAllFiles() {
        // TODO??
        return Promise.reject();
    }
}
