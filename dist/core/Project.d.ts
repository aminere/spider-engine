/**
 * @hidden
 */
export declare namespace ProjectInternal {
    function setProjectId(projectId: string): void;
}
export declare class Project {
    static readonly projectId: string;
    static readonly projectName: string | null;
    static readonly isOpenSource: boolean;
    static importToEditor(): void;
}
