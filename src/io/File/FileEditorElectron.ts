

import { IFile } from "./IFile";
import { Debug } from "../Debug";

// tslint:disable-next-line
let fs: any = undefined;
if (process.env.PLATFORM === "electron") {
    fs = require("fs");
}

export class FileEditorElectron implements IFile {
    read(path: string) {
        return new Promise((resolve, reject) => {
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
            fs.writeFile(path, data, (err: any) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    delete(path: string) {
        return new Promise<void>((resolve, reject) => {
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
        // TODO?
        return Promise.reject();
    }
}
