import { Project } from "../core/Project";

namespace Private {
    export let savedData: object;
}

/**
 * @hidden
 */
export namespace SavedDataInternal {
    export function preload() {
        return new Promise<void>((resolve, reject) => {
            const projectId = Project.projectId;
            const save = localStorage.getItem(`saved_data_${projectId}`);
            Private.savedData = save ? JSON.parse(save) : {};
            resolve();
        });
    }
}

export class SavedData {
    static get() {        
        return Private.savedData;
    }

    static flush() {
        localStorage.setItem(`saved_data_${Project.projectId}`, JSON.stringify(Private.savedData, null, 2));
    }
}
