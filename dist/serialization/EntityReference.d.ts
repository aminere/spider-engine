import { Entity } from "../core/Entity";
export declare class EntityReference {
    id: string | undefined;
    entity: Entity | null;
    private _id?;
    private _entity;
    private _resolved;
    constructor(id?: string);
}
