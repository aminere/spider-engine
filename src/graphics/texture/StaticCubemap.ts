import * as Attributes from "../../core/Attributes";
import { AssetReference } from "../../serialization/AssetReference";
import { Texture2D } from "./Texture2D";
import { EngineUtils } from "../../core/EngineUtils";
import { WebGL } from "../WebGL";
import { Texture } from "./Texture";
import { SerializedObject } from "../../core/SerializableObject";

/**
 * @hidden
 */
interface CubemapConfigItem {
    id: string;
    texture: AssetReference<Texture2D>;
    side: number;
}

@Attributes.creatable(true)
@Attributes.referencable(true)
@Attributes.displayName("Static Cubemap")
export class StaticCubemap extends Texture {    

    get version() { return 2; }

    pz = new AssetReference(Texture2D);
    nz = new AssetReference(Texture2D);
    py = new AssetReference(Texture2D);
    ny = new AssetReference(Texture2D);
    px = new AssetReference(Texture2D);
    nx = new AssetReference(Texture2D);

    @Attributes.unserializable()
    private _config!: CubemapConfigItem[];

    setProperty(name: string, value: AssetReference<Texture2D>) {
        super.setProperty(name, value); 

        if (this._textureId) {
            const textureToReload = value.asset;
            if (textureToReload) {
                this.initConfigIfNecessary();
                const info = this._config.find(c => c.id === name);
                if (info) {
                    textureToReload.loadTextureData().then(() => {
                        const gl = WebGL.context;
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._textureId);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
                        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
                        gl.texImage2D(
                            (info as CubemapConfigItem).side, 
                            0, 
                            gl.RGBA, 
                            gl.RGBA, 
                            gl.UNSIGNED_BYTE, 
                            (textureToReload as Texture2D).image
                        );      
                    });
                }
            }            
        }
    }

    isLoaded() {
        this.initConfigIfNecessary();
        return this._config.every(c => EngineUtils.isAssetRefLoaded(c.texture));
    }

    begin(stage: number): boolean {
        if (!this._textureId) {
            if (!this.graphicLoad()) {
                return false;
            }
        }
        const gl = WebGL.context;
        gl.activeTexture(gl.TEXTURE0 + stage);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._textureId);
        return true;
    }

    graphicLoad(): boolean {
        if (this._textureId) {
            return true;
        }        

        const gl = WebGL.context;
        this._textureId = gl.createTexture();     
        this.initConfigIfNecessary();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._textureId);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        for (const textureInfo of this._config) {
            const texture = textureInfo.texture.asset;
            if (texture) {
                gl.texImage2D(textureInfo.side, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            }
        }
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return true;
    }    

    upgrade(json: SerializedObject, previousVersion: number) {        
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                pz: json.properties.front,
                nz: json.properties.back,
                py: json.properties.top,
                ny: json.properties.bottom,
                px: json.properties.right,
                nx: json.properties.left                
            });
            delete json.properties.front;
            delete json.properties.back;
            delete json.properties.top;
            delete json.properties.bottom;
            delete json.properties.left;
            delete json.properties.right;
        }
        return json;
    }

    private makeConfig() {
        const gl = WebGL.context;
        return [
            { id: "pz", texture: this.pz, side: gl.TEXTURE_CUBE_MAP_POSITIVE_Z },
            { id: "nz", texture: this.nz, side: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z },
            { id: "py", texture: this.py, side: gl.TEXTURE_CUBE_MAP_POSITIVE_Y },
            { id: "ny", texture: this.ny, side: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y },
            { id: "px", texture: this.px, side: gl.TEXTURE_CUBE_MAP_POSITIVE_X },
            { id: "nx", texture: this.nx, side: gl.TEXTURE_CUBE_MAP_NEGATIVE_X }
        ];
    }

    private initConfigIfNecessary() {
        if (!this._config) {
            this._config = this.makeConfig();
        }
    }
}
