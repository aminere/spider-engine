import { Component } from "../../core/Component";
import { EntityReference } from "../../serialization/EntityReference";
import { Entity } from "../../core/Entity";

import * as Attributes from "../../core/Attributes";
import { IKNode } from "./IKNode";

export class IKChain extends Component {
    set target(entity: Entity | null) { this._target.entity = entity; }
    get target() { return this._target.entity; }

    get nodes() { return this._nodes; }

    private _target = new EntityReference();

    @Attributes.unserializable()
    private _nodes!: IKNode[];

    initialize() {
        this._nodes = this.entity.getComponents(IKNode);
    }
}
