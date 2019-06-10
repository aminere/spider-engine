import { ObjectDeclaration } from "./ObjectDeclaration";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";
export declare class Data extends Component {
    static pinsPropertyKey: string;
    declaration: ObjectDeclaration | null;
    readonly declarationId: string | undefined;
    readonly pins: ReferenceArray<BasePin>;
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
