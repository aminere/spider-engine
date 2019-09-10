
export interface IHttpRequestOptions {
    method: string;
    url: string;
    // tslint:disable-next-line
    body?: any;
    responseType?: XMLHttpRequestResponseType;
    headerParams?: object;
    onProgress?: (ev: ProgressEvent) => void;
    onUploadProgress?: (ev: ProgressEvent) => void;
}

export class Http {
    static request(options: IHttpRequestOptions) {
        const {
            method,
            url,
            body,
            responseType,
            headerParams,
            onProgress,
            onUploadProgress
        } = options;

        // tslint:disable-next-line
        return new Promise<any>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.onreadystatechange = () => {
                if (request.readyState === XMLHttpRequest.DONE) {
                    if (request.status === 200 || request.status === 0) {
                        if (responseType === "blob") {
                            resolve(request.response);
                        } else {
                            resolve(request.responseText);
                        }
                    } else {
                        reject(request.statusText);
                    }                    
                }
            };

            if (responseType) {
                request.responseType = responseType;
            }

            if (onProgress) {
                request.onprogress = onProgress;
            }

            if (onUploadProgress) {
                request.upload.onprogress = onUploadProgress;
            }            

            request.open(method, url, true);
            if (headerParams) {
                for (const param of Object.keys(headerParams)) {
                    request.setRequestHeader(param, headerParams[param]);
                }
            }
            
            request.send(body);  
        });        
    }
}
