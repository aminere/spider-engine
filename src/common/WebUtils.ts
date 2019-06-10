import { AsyncEvent } from "ts-events";

interface WebRequest {
    request: XMLHttpRequest;
    // tslint:disable-next-line
    onSuccess: (response: any) => void;
    onError: (status: string) => void;
}

namespace Private {
    export let requests: { [id: string]: WebRequest } = {};
}

/**
 * @hidden
 */
export class WebUtils {   

    static downloadProgressChanged = new AsyncEvent<number>();
    static uploadProgressChanged = new AsyncEvent<number>();

    static request(        
        method: string,
        url: string,
        // tslint:disable-next-line
        onSuccess: (response: any) => void,
        onError: (status: string) => void,
        // tslint:disable-next-line
        data?: any,
        responseType?: string,
        headerParams?: object
    ) {
        const requestId = `${method}_${url}`;
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                let listener: WebRequest | null = null;
                if (requestId in Private.requests) {
                    listener = Private.requests[requestId];
                    delete Private.requests[requestId];
                }
                if (listener) {
                    if (request.status === 200 || request.status === 0) {
                        if (listener) {
                            if (responseType === "blob") {
                                listener.onSuccess(request.response);
                            } else {
                                listener.onSuccess(request.responseText);
                            }
                        }
                    } else {
                        listener.onError(request.statusText);
                    }
                } else {
                    if (process.env.NODE_ENV === "development") {                        
                        // tslint:disable-next-line
                        console.log(`Skipping detached request '${requestId}'`);
                    }
                }
            }
        };

        request.upload.onprogress = e => {
            if (e.lengthComputable) {       
                let percent = (e.loaded / e.total) * 100;
                WebUtils.uploadProgressChanged.post(percent);
            }
        };

        request.onprogress = e => {
            if (e.lengthComputable) {                
                let percent = (e.loaded / e.total) * 100;
                WebUtils.downloadProgressChanged.post(percent);
            }
        };

        if (responseType) {
            request.responseType = responseType as XMLHttpRequestResponseType;
        }

        Private.requests[requestId] = {
            request: request,
            onSuccess: onSuccess,
            onError: onError
        };

        request.open(method, url, true);

        if (headerParams) {
            for (const param of Object.keys(headerParams)) {
                request.setRequestHeader(param, headerParams[param]);
            }
        }
        // request.setRequestHeader("Content-Type", contentType);
        
        request.send(data);        
        return requestId;
    }

    static abortRequest(requestId: string) {
        let requestInfo = Private.requests[requestId];
        let request = requestInfo ? requestInfo.request : null;
        if (request) {
            delete Private.requests[requestId];
            request.abort();
        }
    }
}
