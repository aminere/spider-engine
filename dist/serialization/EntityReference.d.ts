import { Entity } from "../core/Entity";
export declare class EntityReference {
    get id(): string | undefined;
    set id(id: string | undefined);
    get entity(): Entity | null;
    set entity(entity: Entity | null);
    private _id?;
    private _entity;
    private _resolved;
    constructor(id?: string);
}
