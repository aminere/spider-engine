
/**
 * @hidden
 */
export class FileProperty {

    format: string;
    data?: string;
    fileName?: string;

    constructor(format: string, data?: string, fileName?: string) {
        this.format = format;
        this.fileName = fileName;
        this.data = data;
    }    
}
