
import { Reference } from "../serialization/Reference";
import { Material } from "./Material";
import { Geometry, GraphicUpdateResult } from "./geometry/Geometry";
import { AssetReference } from "../serialization/AssetReference";
import { Camera } from "./Camera";
import { VisualGroup } from "./VisualGroup";
import { SkinnedMesh } from "./geometry/SkinnedMesh";
import * as Attributes from "../core/Attributes";
import { Shader } from "./Shader";
import { SerializedObject } from "../core/SerializableObject";
import { VertexBuffer } from "./VertexBuffer";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";
import { Entity } from "../core/Entity";
import { Transform } from "../core/Transform";

@Attributes.helpUrl("https://docs.spiderengine.io/3d/visual.html")
export class Visual extends Component {
    
    get version() { return 4; }

    get material() { return this._material.asset; }
    get geometry() { return this._geometry.instance; }
    get group() { return this._group.asset; }    

    set geometry(geometry: Geometry | undefined) { this._geometry.instance = geometry; }
    set material(material: Material | null) { this._material.asset = material; }
    set group(group: VisualGroup | null) { this._group.asset = group; }

    get vertexBuffer(): VertexBuffer | null { 
        return this._geometry.instance ? this._geometry.instance.getVertexBuffer() : null; 
    }

    get animatedMaterial() { return this._uniqueAnimatedMaterialInstance; }
    set animatedMaterial(animatedMaterial: Material | undefined) { this._uniqueAnimatedMaterialInstance = animatedMaterial; }

    get worldTransform() {
        let geom = this._geometry.instance;
        if (geom) {
            return geom.getWorldTransform(this.entity.transform);
        }
        return this.entity.transform.worldMatrix;
    }

    get bucketId() {
        let id = 0;
        if (this.receiveShadows) {
            id = 1;
        }
        if (this.receiveFog) {
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
        return `${id}`;
    }

    get isSkinned() {
        if (this._geometry.instance) {
            return this._geometry.instance.isA(SkinnedMesh);
        }
        return false;
    }

    get hasVertexColor() {
       let vb = this.geometry ? this.geometry.getVertexBuffer() : undefined;
       return vb ? vb.hasAttribute("color") : false;
    }

    castShadows = true;
    receiveShadows = true;
    receiveFog = true;

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

    graphicUpdate(camera: Camera, shader: Shader, deltaTime: number) {
        let geom = this._geometry.instance;
        if (geom) {
            return geom.graphicUpdate(camera, shader, this.bucketId, this.entity.transform, deltaTime);            
        }
        return GraphicUpdateResult.Unchanged;
    }

    destroy() {
        let geom = this._geometry.instance;
        if (geom) {
            geom.destroy();
        }
        if (this._uniqueAnimatedMaterialInstance) {
            this._uniqueAnimatedMaterialInstance.destroy();
        }
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
        }
        return json;
    }
}
