
import * as Attributes from "../core/Attributes";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";

@Attributes.requires("UIElement")
export class TouchInteractions extends Component {

    constructor(props?: ObjectProps<TouchInteractions>) {
        super();
        if (props) {
            this.setState(props);
        }
    }
}
