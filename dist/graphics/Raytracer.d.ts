import { DrawableTexture } from "./DrawableTexture";
import { Projector } from "./Projector";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";
export declare class Raytracer extends Component {
    target: DrawableTexture;
    projector: Projector;
    reflections: boolean;
    shadows: boolean;
    shadowRadius: number;
    shadowResolution: number;
    maxBounces: number;
    private _target;
    private _projector;
    private _initialized;
    private _savePending;
    constructor(props?: ObjectProps<Raytracer>);
    update(): void;
    destroy(): void;
    restart(): void;
    private raytrace;
    private terminate;
}
