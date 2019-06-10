import { ObjectDeclaration } from "./ObjectDeclaration";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { Asset } from "../assets/Asset";
export declare class ObjectDefinition extends Asset {
    declaration: ObjectDeclaration | null;
    readonly declarationId: string | undefined;
    readonly pins: ReferenceArray<BasePin>;
    _pins: ReferenceArray<BasePin>;
    private _declaration;
    constructor();
    isLoaded(): boolean;
    destroy(): void;
    setProperty(name: string, value: any): void;
    getPins(): ReferenceArray<BasePin>;
    setPins(pins: ReferenceArray<BasePin>): void;
    findPinByName(name: string): BasePin | undefined;
    private onDeclarationPinChanged;
    private onDeclarationChanged;
}
