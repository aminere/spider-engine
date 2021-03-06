import { IFile, IFileInternal } from "./IFile";

export class FileStandaloneWeb implements IFile {    

    read(path: string) {        
        const defaultAsset = IFileInternal.getDefaultAsset(path);
        if (defaultAsset) {
            return Promise.resolve(defaultAsset);
        }
        return new Promise((resolve, reject) => {            
            const rawFile = new XMLHttpRequest();
            rawFile.onreadystatechange = () => {
                if (rawFile.readyState === XMLHttpRequest.DONE) {
                    if (rawFile.status === 200 || rawFile.status === 0) {
                        resolve(rawFile.responseText);
                    } else {
                        reject(`Can't open '${path}', status: ${rawFile.status}`);
                    }
                }
            };
            rawFile.open("GET", path, true);
            rawFile.send(null);
        });
    }

    // tslint:disable-next-line
    write(path: string, data: any) {
        // Nothing to do, no asset changes are permitted in standalone
        return Promise.reject();
    }

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
        // Nothing to do, no asset changes are permitted in standalone
        return Promise.reject();
    }
}
