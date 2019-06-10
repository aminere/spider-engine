/**
 * @hidden
 */
export declare enum AssetChangeAction {
    update = 0,
    delete = 1,
    create = 2
}
/**
 * @hidden
 */
export interface AssetChangeMetaData {
    changedPropertyName: string;
    changedPropertyValue?: string;
}
/**
 * @hidden
 */
export interface AssetChangeInfo {
    timeStamp: string;
    action: AssetChangeAction;
    ids: string[];
    metadata?: AssetChangeMetaData;
}
/**
 * @hidden
 */
export declare class IOUtils {
    static assetChangeMetaData: AssetChangeMetaData | undefined;
    static recordAssetChange(action: AssetChangeAction, ids: string[]): void;
    static parseFileName(fullFileName: string, result: (fileName: string, extension: string) => void): void;
    static parseFilePath(filePath: string, result: (fileName: string, extension: string) => void): void;
    static parseFolderPath(fullFilePath: string, result: (folderPath: string) => void): void;
    static parseFolderName(fullFolderPath: string, result: (folderName: string) => void): void;
    static importGameFromBlob(blob: Blob, success: (hasErrors: boolean) => void, error: () => void): void;
    static isDefaultAsset(path: string): boolean;
}
