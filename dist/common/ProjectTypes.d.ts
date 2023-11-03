export interface CompactProjectInfo {
    projectId: string;
    name: string;
    userId: string;
    description: string;
    isOpenSource: boolean;
    thumbnailTimestamp: number;
    sourceFileId: string;
    defaultAssetsVersion?: string;
    runtimeIteration?: string;
}
export interface ProjectImportInfo {
    importUrl: string;
    info: CompactProjectInfo;
}
