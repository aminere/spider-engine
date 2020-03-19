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

    static ofTypes(ctors: Constructor<Component>[]): { [typeName: string]: Component[] } { 
        // TODO optimize / cache components
        const components = ctors.reduce(
            (prev, cur) => ({ ...prev, ...{ [cur.name]: [] } }),
            {}
        );

        ScenesInternal.list().forEach(scene => {
            scene.root.traverse(e => {
                if (!e.active || e.transient) {
                    return false;
                }
                for (const ctor of ctors) {
                    const component = e.getComponent(ctor);
                    if (component && component.active) {
                        components[ctor.name].push(component);
                    }
                }
                return true;
            });
        });

        return components;
    }
}
