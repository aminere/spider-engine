
import { Component } from "../../core/Component";
import { Reference } from "../../serialization/Reference";
import { IKConstraint } from "./IKConstraints";
import * as Attributes from "../../core/Attributes";

export class IKNode extends Component {
    constraint = new Reference(IKConstraint);
}
