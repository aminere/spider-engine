import { Entity } from "./Entity";
import { Prefab } from "../assets/Prefab";
import { PRS } from "../math/PRS";
export interface EntityProps {
    name?: string;
    prefab?: Prefab;
    prs?: PRS;
    children?: EntityProps[];
}
export declare class Entities {
    static create(props?: EntityProps): Entity;
    static find(name: string): Entity | null;
    static get(id: string): Entity | null;
}
