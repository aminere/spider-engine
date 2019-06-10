import { Component } from "./Component";
import { ScenesInternal } from "./Scenes";
import { Constructor } from "./Types";

export class Components {
    static ofType<T extends Component>(ctor: Constructor<T>): T[] { 
        // TODO optimize / cache components
        let components: T[] = [];
        for (const scene of ScenesInternal.list()) {
            components = components.concat(scene.root.getComponents(ctor));
        }
        return components;
    }
}
