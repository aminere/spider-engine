
export interface IFile {
    // tslint:disable-next-line
    read: (path: string) => Promise<any>;
    // tslint:disable-next-line
    write: (path: string, data: any) => Promise<void>;
    delete: (path: string) => Promise<void>;
    renameFile: (oldPath: string, newPath: string) => Promise<void>;
    renameFolder: (oldPath: string, newPath: string) => Promise<void>;    
    clearAllFiles: () => Promise<void>;
}
namespace Private {
    export let instance: IFile;
}

export class IFileInternal {
    static set instance(instance: IFile) {
        Private.instance = instance;
    }
    static get instance() {
        return Private.instance;
    }
}
