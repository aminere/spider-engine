import { DrawableTexture } from "./texture/DrawableTexture";
import { Projector } from "./camera/Projector";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";
export declare class Raytracer extends Component {
    set target(target: DrawableTexture);
    set projector(projector: Projector);
    reflections: boolean;
    shadows: boolean;
    shadowRadius: number;
    shadowResolution: number;
    maxBounces: number;
    private _target;
    private _projector;
    private _initialized;
    constructor(props?: ObjectProps<Raytracer>);
    update(): void;
    destroy(): void;
    restart(): void;
    private raytrace;
    private terminate;
}
