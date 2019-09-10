export interface IHttpRequestOptions {
    method: string;
    url: string;
    body?: any;
    responseType?: XMLHttpRequestResponseType;
    headerParams?: object;
    onProgress?: (ev: ProgressEvent) => void;
    onUploadProgress?: (ev: ProgressEvent) => void;
}
export declare class Http {
    static request(options: IHttpRequestOptions): Promise<any>;
}
