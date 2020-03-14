
import { Reference } from "../serialization/Reference";
import { Material } from "./Material";
import { Geometry, GraphicUpdateResult } from "./geometry/Geometry";
import { AssetReference } from "../serialization/AssetReference";
import { Camera } from "./camera/Camera";
import { VisualGroup } from "./VisualGroup";
import { SkinnedMesh } from "./geometry/SkinnedMesh";
import { Shader } from "./shading/Shader";
import { SerializedObject } from "../core/SerializableObject";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";
import { Entity } from "../core/Entity";
import { Transform } from "../core/Transform";
import * as Attributes from "../core/Attributes";

@Attributes.helpUrl("https://docs.spiderengine.io/3d/visual.html")
export class Visual extends Component {
    
    get version() { return 5; }

    get material() { return this._material.asset; }
    get geometry() { return this._geometry.instance; }
    get group() { return this._group.asset; }    

    get castShadows() { return this._castShadows; }
    set castShadows(cast: boolean) { this._castShadows = cast; }

    get receiveShadows() { return this._receiveShadows; }
    set receiveShadows(receive: boolean) {
        this._receiveShadows = receive;
    }

    get receiveFog() { return this._receiveFog; }
    set receiveFog(receive: boolean) {
        this._receiveFog = receive;
    }

    set geometry(geometry: Geometry | undefined) { 
        // if (Boolean(geometry?.isA(SkinnedMesh)) !== this.isSkinned
        // || Boolean(geometry?.getVertexBuffer()?.hasAttribute("color")) !== this.hasVertexColor
        // ) {
        //     this._bucketId = null;
        // }
        this._geometry.instance = geometry; 
    }

    set material(material: Material | null) { this._material.asset = material; }
    set group(group: VisualGroup | null) { this._group.asset = group; }

    get vertexBuffer() { 
        return this.geometry?.getVertexBuffer() ?? null; 
    }

    get animatedMaterial() { return this._uniqueAnimatedMaterialInstance; }
    set animatedMaterial(animatedMaterial: Material | undefined) { 
        this._uniqueAnimatedMaterialInstance = animatedMaterial; 
    }

    get worldTransform() {
        return this.geometry?.getWorldTransform(this.entity.transform) ?? this.entity.transform.worldMatrix;
    }

    get bucketId() {        
        let id = 0;
        if (this._receiveShadows) {
            id = 1;
        }
        if (this._receiveFog) {
            // tslint:disable-next-line
            id |=  1 << 1;
        }        
        if (this.isSkinned) {
            // tslint:disable-next-line
            id |= 1 << 2; 
        }
        if (this.hasVertexColor) {
            // tslint:disable-next-line
            id |= 1 << 3;
        }

        if (this.isReflective) {
             // tslint:disable-next-line
            id |= 1 << 4;
        }

        if (this.hasNormalMap) {
             // tslint:disable-next-line
            id |= 1 << 5;
        }

        return `${id}`;
    }

    get isSkinned() {
        return Boolean(this.geometry?.isA(SkinnedMesh));
    }

    get isReflective() {
        // tslint:disable-next-line
        return ((this.material?.shaderParams as any).reflectivity ?? 0) > 0;
    }

    get hasNormalMap() {
        // tslint:disable-next-line
        return Boolean((this.material?.shaderParams as any)?.normalMap?.asset);
    }

    get hasVertexColor() {
       return Boolean(this.geometry?.getVertexBuffer()?.hasAttribute("color"));
    }

    private _castShadows = true;
    private _receiveShadows = true;
    private _receiveFog = true;

    private _group = new AssetReference(VisualGroup);
    private _geometry = new Reference(Geometry);
    private _material = new AssetReference(Material);

    @Attributes.unserializable()
    @Attributes.hidden()
    private _uniqueAnimatedMaterialInstance?: Material;    

    constructor(props?: ObjectProps<Visual>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    setEntity(entity: Entity) {
        super.setEntity(entity);
        entity.getOrSetComponent(Transform);
    }

    graphicUpdate(camera: Camera) {
        return this.geometry?.graphicUpdate(camera, this.entity.transform)
            ?? GraphicUpdateResult.Unchanged;
    }

    destroy() {
        this.geometry?.destroy();
        this._uniqueAnimatedMaterialInstance?.destroy();
        this._material.detach();
        this._group.detach();
        super.destroy();
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {        
        if (previousVersion === 1) {
            Object.assign(json.properties, { 
                _group: json.properties.group,
                _material: json.properties.material
            });
            let geometry = json.properties.geometry.data;
            if (geometry && geometry.typeName !== "Particles") {
                // Too different to convert
                Object.assign(json.properties, { 
                    _geometry: json.properties.geometry,
                });
            }
            delete json.properties.group;
            delete json.properties.material;
            delete json.properties.geometry;
        } else if (previousVersion === 2) {
            // Skybox geometry doesn't exist anymore
            const geometryData = json.properties._geometry.data;
            if (geometryData && geometryData.typeName === "SkyBox") {
                delete json.properties._geometry.data;
            }
        } else if (previousVersion === 3) {
            // Quad became QuadGeometry
            const geometryData = json.properties._geometry.data;
            if (geometryData && geometryData.typeName === "Quad") {
                geometryData.typeName = "QuadGeometry";
            }
        } else if (previousVersion === 4) {
            Object.assign(json.properties, { 
                _castShadows: json.properties.castShadows,
                _receiveShadows: json.properties.receiveShadows,
                _receiveFog: json.properties.receiveFog
            });
            delete json.properties.castShadows;
            delete json.properties.receiveShadows;
            delete json.properties.receiveFog;
        }
        return json;
    }
}
