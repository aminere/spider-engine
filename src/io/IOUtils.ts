
import { AsyncUtils } from "../core/AsyncUtils";
import { IFileInternal } from "./File/IFile";
import { EngineSettingsInternal } from "../core/EngineSettings";
import { AssetIdDatabaseInternal } from "../assets/AssetIdDatabase";

/**
 * @hidden
 */
const JSZip = require("jszip");

/**
 * @hidden
 */
export enum AssetChangeAction {
    update,
    delete,
    create
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
export class IOUtils {

    static assetChangeMetaData: AssetChangeMetaData | undefined = undefined;

    static recordAssetChange(action: AssetChangeAction, ids: string[]) {
        const timeStamp = JSON.stringify(Date.now());
        localStorage.setItem("last_asset_write_time", timeStamp);
        localStorage.setItem("asset_changed", JSON.stringify({
            timeStamp: timeStamp,
            action: action,
            ids: ids,
            metadata: IOUtils.assetChangeMetaData
        }));
        // clear metadata, it's meant to be set prior to a save operation and is valid for that save operation only
        if (IOUtils.assetChangeMetaData) {
            IOUtils.assetChangeMetaData = undefined;
        }
    }

    static parseFileName(fullFileName: string, result: (fileName: string, extension: string) => void) {
        const tokens = fullFileName.split(".");
        if (tokens.length > 1) {
            const extension = tokens.pop();
            const fileName = tokens.reduce((previous, current) => previous + "." + current);
            result(fileName, extension as string);
        } else {
            result(fullFileName, "");
        }
    }

    static parseFilePath(filePath: string, result: (fileName: string, extension: string) => void) {
        const tokens = filePath.split(/[/\\]+/);
        if (tokens.length > 1) {
            const fullFileName = tokens.slice(-1)[0];
            IOUtils.parseFileName(fullFileName, result);
        } else {
            IOUtils.parseFileName(filePath, result);
        }
    }

    static parseFolderPath(fullFilePath: string, result: (folderPath: string) => void) {
        const tokens = fullFilePath.split(/[/\\]+/);
        if (tokens.length > 1) {
            tokens.pop(); // throw away filename
            const folderPath = tokens.reduce((previous, current) => previous + "/" + current);
            result(folderPath);
        } else {
            result(fullFilePath);
        }
    }

    static parseFolderName(fullFolderPath: string, result: (folderName: string) => void) {
        const tokens = fullFolderPath.split(/[/\\]+/);
        result(tokens.pop() || "");
    }

    static importGameFromBlob(blob: Blob, success: (hasErrors: boolean) => void, error: () => void) {
        const finished = (succeeded: boolean, withErrors?: boolean) => {
            if (succeeded) {
                success(withErrors || false);
            } else {
                error();
            }
        };
        const newZip = new JSZip();
        newZip.loadAsync(blob)
            .then(
                // tslint:disable-next-line
                (zip: any) => {
                    if (process.env.PLATFORM === "web") {
                        const extractedFiles = {};
                        const paths = Object.keys(zip.files);
                        AsyncUtils.processBatch(
                            paths,
                            (path, extractSuccess, extractError) => {
                                const zipFile = zip.file(path);
                                if (zipFile) {
                                    zipFile.async("string").then(
                                        (fileData: string) => {
                                            // upgrade older projects
                                            if (["Assets/EngineSettings.json"].some(p => p === path)) {
                                                path = EngineSettingsInternal.path;
                                            } else if (["idDatabase"].some(p => p === path)) {
                                                path = AssetIdDatabaseInternal.path;
                                            }
                                            extractedFiles[path] = fileData;
                                            extractSuccess();
                                        },
                                        extractError
                                    );
                                } else {
                                    extractSuccess();
                                }
                            },
                            extractionError => {
                                const filePaths = Object.keys(extractedFiles);
                                AsyncUtils.processBatch(
                                    filePaths,
                                    (filePath, writeSuccess, writeError) => {
                                        const fileData = extractedFiles[filePath];
                                        IFileInternal.instance.write(filePath, fileData)
                                            .then(() => writeSuccess())
                                            .catch(() => writeError());
                                    },
                                    writeError => {
                                        finished(true, writeError);
                                    }
                                );
                            }
                        );
                    } else {
                        // TODO electron
                    }
                },
                () => finished(false)
            )
            .catch(() => finished(false));
    }

    static isDefaultAsset(path: string) {
        const tokens = path.split("/");
        if (tokens.length > 1) {
            // Allow all operations on default folder in development
            if (process.env.NODE_ENV !== "development") {                
                return tokens[0] === "Assets" && tokens[1] === "DefaultAssets";
            }
        }
        return false;
    }
}
