import { IFile } from "./IFile";

namespace Private {
    export const files: {[path: string]: string} = {}; 
}

export class FileInMemory implements IFile {  
    read(path: string) {
        return new Promise((resolve, reject) => {
            const file = Private.files[path];
            if (file) {
                resolve(file);
            } else {
                reject(`Can't open '${path}'`);
            }       
        });
         
    }

    // tslint:disable-next-line
    write(path: string, data: any) {
        return new Promise<void>((resolve, reject) => {
            Private.files[path] = data;
            resolve();
        });
    }

    // tslint:disable-next-line
    delete(path: string) {        
        console.assert(false, "Not Implemented");
        return Promise.reject();
    }

    // tslint:disable-next-line
    renameFile(oldPath: string, newPath: string) {        
        console.assert(false, "Not Implemented");
        return Promise.reject();
    }

    // tslint:disable-next-line
    renameFolder(oldPath: string, newPath: string) {        
        console.assert(false, "Not Implemented");
        return Promise.reject();
    }

    clearAllFiles() {        
        console.assert(false, "Not Implemented");
        return Promise.reject();
    }

    temporaryGetFiles() {
        return Private.files;    
    }
}
