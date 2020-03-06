import { ObjectDeclaration } from "./ObjectDeclaration";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { IObjectDefinition } from "./BehaviorUtils";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";
export declare class Data extends Component implements IObjectDefinition {
    static pinsPropertyKey: string;
    set declaration(decl: ObjectDeclaration | null);
    get declaration(): ObjectDeclaration | null;
    get declarationId(): string | undefined;
    get pins(): ReferenceArray<BasePin>;
    _pins: ReferenceArray<BasePin>;
    private _declaration;
    constructor(props?: ObjectProps<Data>);
    destroy(): void;
    setProperty(name: string, value: any): void;
    getPins(): ReferenceArray<BasePin>;
    setPins(pins: ReferenceArray<BasePin>): void;
    findPinByName(name: string): BasePin | undefined;
    isLoaded(): boolean;
    private onDeclarationPinChanged;
    private onDeclarationChanged;
}
