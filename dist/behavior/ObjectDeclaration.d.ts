import { Asset } from "../assets/Asset";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { AsyncEvent } from "ts-events";
export declare class ObjectDeclaration extends Asset {
    get pins(): ReferenceArray<BasePin>;
    pinChanged: AsyncEvent<string>;
    private _pins;
}
