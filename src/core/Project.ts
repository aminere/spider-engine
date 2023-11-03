
import { ProjectImportInfo } from "../common/ProjectTypes";

namespace Private {
    export let projectId: string;
}

/**
 * @hidden
 */
export namespace ProjectInternal {
    export function setProjectId(projectId: string) {
        Private.projectId = projectId;
    }
}

export class Project {

    static get projectId() {
        if (Private.projectId) {
            return Private.projectId;
        }
        const projectInfo = localStorage.getItem("project_info");
        if (projectInfo) {
            return (JSON.parse(projectInfo) as ProjectImportInfo).info.projectId;
        }
        return "default_project_id";
    }

    static get projectName(): string | null {
        const projectInfo = localStorage.getItem("project_info");
        if (projectInfo) {
            return (JSON.parse(projectInfo) as ProjectImportInfo).info.name;
        }        
        return null;
    }

    static get isOpenSource() {
        const projectInfo = localStorage.getItem("project_info");
        if (projectInfo) {
            return (JSON.parse(projectInfo) as ProjectImportInfo).info.isOpenSource;
        }
        return false;
    }

    static importToEditor() {
        const projectInfo = localStorage.getItem("project_info");
        if (!projectInfo) {
            console.assert(false, "Can't import project because import information is missing.");
            return;
        }
        const importUrl = (JSON.parse(projectInfo) as ProjectImportInfo).importUrl;    
        window.open(importUrl);
    }
}
