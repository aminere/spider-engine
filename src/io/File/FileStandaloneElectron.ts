import { IFile } from "./IFile";

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
        // Nothing to do, no asset changes are permitted in standalone
        return Promise.reject();
    }

    // tslint:disable-next-line
    delete(path: string) {
        // Nothing to do, no asset changes are permitted in standalone
        return Promise.reject();
    }

    renameFile(oldPath: string, newPath: string) {
        // Nothing to do, no asset changes are permitted in standalone
        return Promise.reject();
    }

    renameFolder(oldPath: string, newPath: string) {
        // Nothing to do, no asset changes are permitted in standalone
        return Promise.reject();
    }

    clearAllFiles() {
        // TODO??
        return Promise.reject();
    }
}
