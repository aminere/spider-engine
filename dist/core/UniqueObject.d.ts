import { SerializableObject } from "./SerializableObject";
export declare class UniqueObject extends SerializableObject {
    id: string;
    name: string;
    templatePath?: string;
    constructor();
    copy(): UniqueObject;
}
