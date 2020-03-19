
import { Shader, ShaderAttributes } from "./shading/Shader";
import { Debug } from "../io/Debug";
import { EngineUtils } from "../core/EngineUtils";
import { PrimitiveType } from "./GraphicTypes";
import { WebGL } from "./WebGL";
import { Interfaces } from "../core/Interfaces";
import { ObjectProps } from "../core/Types";

export type VertexAttribute =
    "position"
    | "uv"
    | "uv2"
    | "uv3"
    | "uv4"
    | "normal"
    | "tangents"
    | "color"
    | "skinIndex"
    | "skinWeight"
    | "barycentricCoord";

interface VertexMetadata {
    glBuffer: WebGLBuffer | null;    
    isDirty: boolean;
}

type VertexAttributes = { [P in VertexAttribute]?: number[] };

export class VertexBuffer {

    set vertexCount(count: number) { this._vertexCount = count; }
    get vertexCount() { return this._vertexCount; }
    set primitiveType(type: PrimitiveType) { this._primitiveType = type; }
    get primitiveType() { return this._primitiveType; }
    set isDynamic(dynamic: boolean) { this._isDynamic = dynamic; }
    get isDynamic() { return this._isDynamic; }
    set name(name: string | undefined) { this._name = name; }
    get name() { return this._name; }

    get attributes() { return this._attributes; }
    set attributes(attributes: VertexAttributes) {
        Object.entries(attributes).forEach(([attribute, data]) => {
            // TODO type check the attribute!
            this.setAttribute(attribute as VertexAttribute, data as number[]);
        });
    }

    get id() { return this._id; }
    get indices() { return this._indices; }
    set indices(indices: number[] | undefined) {
        this._indices = indices;
        if (indices) {
            this._indicesMetaData = {
                glBuffer: null,
                isDirty: true
            };
        } else {
            delete this._indicesMetaData;
        }        
    }

    private _attributes: VertexAttributes = {};
    private _vertexCount = 0;
    private _primitiveType!: PrimitiveType;

    private _metaData: { [attribute: string]: VertexMetadata } = {};
    private _isLoaded = false;
    private _id: string;
    private _isDynamic = false;
    private _name?: string;
    private _indices?: number[];
    private _indicesMetaData?: VertexMetadata;

    constructor(props?: ObjectProps<VertexBuffer>) {
        this._id = EngineUtils.makeUniqueId();
        if (props) {
            Object.entries(props).forEach(([key, value]) => {
                Object.assign(this, { [key]: value });
            });
        }
    }

    copy() {
        return Interfaces.serializer.copyVertexBuffer(this);
    }

    setAttribute(attribute: VertexAttribute, data: number[]) {
        this._attributes[attribute] = data;
        if (attribute in this._metaData) {
            this._metaData[attribute].isDirty = true;
        } else {
            this._metaData[attribute] = {
                glBuffer: null,
                isDirty: true
            };
        }        
        if (attribute === "position") {
            this._vertexCount = data.length / 3;
        }
    }

    dirtifyAttribute(attribute: VertexAttribute) {
        if (attribute in this._metaData) {
            this._metaData[attribute].isDirty = true;
            if (attribute === "position") {
                if (Interfaces.renderer.showWireFrame) {
                    // sync barycentric coords in editor to keep wireframe mode functional
                    this.loadBarycentricCoords();
                }
            }
        } else {
            Debug.log(`Attribute '${attribute}' not found on VertexBuffer'`);
        }
    }

    updateBufferDatas() {
        for (const attribute of Object.keys(this._metaData)) {
            this.updateBufferDataIfNecessary(attribute);
        }
    }

    begin(shader: Shader) {
        this.bindBuffers();
        this.bindAttributes(shader.getAttributes());
    }

    bindBuffers() {
        if (!this._isLoaded) {
            this.load();
            if (Interfaces.renderer.showWireFrame) {
                this.loadBarycentricCoords();
            }
            this._isLoaded = true;
        } else {
            const showWireFrame = Interfaces.renderer.showWireFrame;
            if (showWireFrame !== this.hasBarycentricCoords()) {
                if (showWireFrame) {
                    this.loadBarycentricCoords();
                } else {
                    // remove barycentric coords buffer
                    WebGL.context.deleteBuffer(this._metaData.barycentricCoord.glBuffer);
                    delete this._attributes.barycentricCoord;
                    delete this._metaData.barycentricCoord;
                }
            }
        }

        if (this._indicesMetaData) {
            WebGL.context.bindBuffer(WebGL.context.ELEMENT_ARRAY_BUFFER, this._indicesMetaData.glBuffer);
        }
    }    

    end(shader: Shader) {
        this.unbindAttributes(shader.getAttributes());
    }

    draw() {
        if (this._vertexCount === 0) {
            return;
        }
        const primitive = WebGL.primitiveTypes[this._primitiveType];
        const gl = WebGL.context;
        if (this._indices) {            
            gl.drawElements(primitive, this._indices.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(primitive, 0, this._vertexCount);
        }
    }

    load() {
        const gl = WebGL.context;
        for (const [attribute, value] of Object.entries(this._attributes)) {
            const buffer = gl.createBuffer();
            if (!buffer) {
                continue;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(value as number[]),
                this._isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
            );
            this._metaData[attribute].glBuffer = buffer;
            this._metaData[attribute].isDirty = false;
        }
        if (this._indices) {
            const buffer = gl.createBuffer();
            if (buffer) {
                const metadata = this._indicesMetaData as VertexMetadata;
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices), gl.STATIC_DRAW);
                metadata.glBuffer = buffer;
                metadata.isDirty = false;
            }
        }
    }

    unload() {
        if (!this._isLoaded) {
            return;
        }
        const gl = WebGL.context;
        for (const attribute of Object.keys(this._attributes)) {
            const { glBuffer } = this._metaData[attribute];
            if (glBuffer) {
                gl.deleteBuffer(glBuffer);
                this._metaData[attribute].glBuffer = null;
            }
        }        
        if (this._indices) {
            const metadata = this._indicesMetaData as VertexMetadata;
            const { glBuffer } = metadata;
            if (glBuffer) {
                gl.deleteBuffer(glBuffer);
                metadata.glBuffer = null;
            }
        }
        this._isLoaded = false;
    }

    bindAttributes(attributes: ShaderAttributes) {
        const gl = WebGL.context;
        for (const [attribute, value] of Object.entries(this._metaData)) {
            const location = attributes[attribute]?.location;
            if (location === undefined || location < 0) {
                // TODO log warning attribute not defined in shader??
                continue;
            }
            const { glBuffer } = value;
            if (!glBuffer) {
                continue;
            }
            if (!this.updateBufferDataIfNecessary(attribute)) {
                gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
            }
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, attributes[attribute].componentCount, gl.FLOAT, false, 0, 0);
        }
    }

    unbindAttributes(attributes: ShaderAttributes) {      
        // must disable vertex attributes, otherwise they might be used by an unrelated drawcall!  
        for (const [attribute, value] of Object.entries(this._metaData)) {
            const location = attributes[attribute]?.location;
            if (location === undefined || location < 0) {
                // TODO log warning attribute not defined in shader??
                continue;
            }
            WebGL.context.disableVertexAttribArray(location);
        }
    }
    
    hasAttribute(attribute: string) {
        return attribute in this._metaData;
    }

    private updateBufferDataIfNecessary(attribute: string) {
        const attr = this._metaData[attribute];
        if (!attr.isDirty) {
            return false;
        }
        const gl = WebGL.context;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._metaData[attribute].glBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._attributes[attribute]),
            this._isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
        );
        this._metaData[attribute].isDirty = false;
        return true;
    }

    private loadBarycentricCoords() {
        if (!this._attributes.position || this.primitiveType !== "TRIANGLES") {
            return;
        }
        const exists = this.hasBarycentricCoords();
        const coords = exists ? (this._attributes.barycentricCoord as number[]) : [];
        coords.length = this._attributes.position.length;
        if (this._indices) {
            // let triangleCount = this._indices.length / 3;
            // TODO - not sure there is a way to generate barycentric coords reliably when using an index buffer
        } else {
            const triangleCount = coords.length / 9;
            for (let i = 0; i < triangleCount; ++i) {
                const index = i * 9;
                coords[index + 0] = 1; coords[index + 1] = 0; coords[index + 2] = 0; // vertex 1
                coords[index + 3] = 0; coords[index + 4] = 1; coords[index + 5] = 0; // vertex 2
                coords[index + 6] = 0; coords[index + 7] = 0; coords[index + 8] = 1; // vertex 3
            }
        }

        if (exists) {
            this.dirtifyAttribute("barycentricCoord");
        } else {
            this.setAttribute("barycentricCoord", coords);
            const gl = WebGL.context;
            const buffer = gl.createBuffer();
            if (buffer) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), this._isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
                this._metaData.barycentricCoord.glBuffer = buffer;
                this._metaData.barycentricCoord.isDirty = false;
            }
        }
    }

    private hasBarycentricCoords() {
        return "barycentricCoord" in this._attributes;
    }
}

export interface SerializedVertexBuffer {
    attributes: VertexAttributes;
    vertexCount: number;
    primitiveType: PrimitiveType;
    isDynamic: boolean;
    name?: string;
    indices?: number[];
}
