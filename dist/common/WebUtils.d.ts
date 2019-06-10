import { AsyncEvent } from "ts-events";
/**
 * @hidden
 */
export declare class WebUtils {
    static downloadProgressChanged: AsyncEvent<number>;
    static uploadProgressChanged: AsyncEvent<number>;
    static request(method: string, url: string, onSuccess: (response: any) => void, onError: (status: string) => void, data?: any, responseType?: string, headerParams?: object): string;
    static abortRequest(requestId: string): void;
}
