import { Component } from "../../core/Component";
import { Reference } from "../../serialization/Reference";
import { IKConstraint } from "./IKConstraints";
export declare class IKNode extends Component {
    constraint: Reference<IKConstraint>;
}
