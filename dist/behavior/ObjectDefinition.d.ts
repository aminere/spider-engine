import { ObjectDeclaration } from "./ObjectDeclaration";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { IObjectDefinition } from "./BehaviorUtils";
import { Asset } from "../assets/Asset";
import { ObjectProps } from "../core/Types";
export declare class ObjectDefinition extends Asset implements IObjectDefinition {
    set declaration(decl: ObjectDeclaration | null);
    get declaration(): ObjectDeclaration | null;
    get declarationId(): string | undefined;
    get pins(): ReferenceArray<BasePin>;
    _pins: ReferenceArray<BasePin>;
    private _declaration;
    constructor(props?: ObjectProps<ObjectDefinition>);
    isLoaded(): boolean;
    destroy(): void;
    setProperty(name: string, value: any): void;
    getPins(): ReferenceArray<BasePin>;
    setPins(pins: ReferenceArray<BasePin>): void;
    findPinByName(name: string): BasePin | undefined;
    private onDeclarationPinChanged;
    private onDeclarationChanged;
}
