/**
 * @hidden
 */
export declare namespace ProjectInternal {
    function setProjectId(projectId: string): void;
}
export declare class Project {
    static get projectId(): string;
    static get projectName(): string | null;
    static get isOpenSource(): boolean;
    static importToEditor(): void;
}
