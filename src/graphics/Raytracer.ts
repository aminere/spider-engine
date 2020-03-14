import { AssetReference } from "../serialization/AssetReference";
import { DrawableTexture } from "./texture/DrawableTexture";
import { Reference } from "../serialization/Reference";
import { Projector } from "./camera/Projector";
import { Debug } from "../io/Debug";
import * as Attributes from "../core/Attributes";
import { ScenesInternal } from "../core/Scenes";
import { Component } from "../core/Component";
import { Interfaces } from "../core/Interfaces";
import { ObjectProps } from "../core/Types";
import { IObjectManagerInternal } from "../core/IObjectManager";

namespace Private {
    export let worker: Worker | null = null;
}

export class Raytracer extends Component {

    set target(target: DrawableTexture) { this._target.asset = target; }
    set projector(projector: Projector) { this._projector.instance = projector; }
    reflections = true;
    shadows = true;
    shadowRadius = .6;
    shadowResolution = 6;
    maxBounces = 3;

    private _target = new AssetReference(DrawableTexture);
    private _projector = new Reference(Projector);

    @Attributes.unserializable()
    private _initialized = false;

    constructor(props?: ObjectProps<Raytracer>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    update() {
        if (this._initialized) {            
            return;
        }
        let { worker } = Private;
        if (!worker) {
            this.raytrace();            
        } else {
            Debug.logWarning(
                `Only one raytracing worker allowed, ignoring Raytracer component on Entity '${this.entity.name}`
            );
        }
    }

    destroy() {
        super.destroy();
        this.terminate();
    }

    restart() {
        this.terminate();
        this.raytrace();
    }

    private raytrace() {
        let target = this._target.asset as DrawableTexture;
        let projector = this._projector.instance;
        if (!target || !projector) {
            return;
        }
        const env = process.env.NODE_ENV === "development" ? "dev" : "prod";
        let worker = new Worker(`/dist/spider_raytracer_${env}.js`);
        let config = {
            config: process.env.CONFIG,
            scenePath: ScenesInternal.list()[0].templatePath,
            targetWidth: target.getWidth(),
            targetHeight: target.getHeight(),
            rgba: target.rgba,
            projector: projector.serialize(),
            worldMatrix: this.entity.transform.worldMatrix,
            settings: {
                reflections: this.reflections,
                shadows: this.shadows,
                shadowRadius: this.shadowRadius,
                shadowResolution: this.shadowResolution,
                maxBounces: this.maxBounces
            }
        };

        // temporary hack to get worker to run in standalone
        if (process.env.CONFIG === "standalone") {
            Object.assign(config, {
                // tslint:disable-next-line
                standaloneFiles: (Interfaces.file as any).temporaryGetFiles()
            });
        }

        worker.postMessage(config);
        worker.onmessage = e => {
            if (e.data) {
                target.data = new Uint8Array(e.data as ArrayBuffer);
            } else {
                Debug.log("Raytracer finished.");
                Private.worker = null;
            }
        };
        Private.worker = worker;
        this._initialized = true;
    }

    private terminate() {
        if (this._initialized && Private.worker) {
            Debug.log("Terminating Raytracer..");
            Private.worker.terminate();
            Private.worker = null;
            this._initialized = false;            
        }        
    }
}
