import * as Attributes from "../core/Attributes";
import { AssetReference } from "../serialization/AssetReference";
import { GraphicAsset } from "./GraphicAsset";
import { Texture2D } from "./Texture2D";
import { EngineUtils } from "../core/EngineUtils";
import { WebGL } from "./WebGL";

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
export class StaticCubemap extends GraphicAsset {    

    front = new AssetReference(Texture2D);
    back = new AssetReference(Texture2D);
    top = new AssetReference(Texture2D);
    bottom = new AssetReference(Texture2D);
    left = new AssetReference(Texture2D);
    right = new AssetReference(Texture2D);

    @Attributes.unserializable()
    private _textureId!: WebGLTexture | null;

    @Attributes.unserializable()
    private _config!: CubemapConfigItem[];

    setProperty(name: string, value: AssetReference<Texture2D>) {
        super.setProperty(name, value); 

        if (this._textureId) {
            let textureToReload = value.asset;
            if (textureToReload) {
                this.initConfigIfNecessary();
                let info = this._config.find(c => c.id === name);
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
        let gl = WebGL.context;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._textureId);
        return true;
    }

    graphicLoad(): boolean {
        if (this._textureId) {
            return true;
        }        

        let gl = WebGL.context;
        this._textureId = gl.createTexture();     
        this.initConfigIfNecessary();
        for (let textureInfo of this._config) {
            let texture = textureInfo.texture.asset;
            if (texture) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._textureId);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
                gl.texImage2D(textureInfo.side, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, (texture as Texture2D).image);
            }
        }
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._textureId);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);        
        return true;
    }
    
    graphicUnload() {
        if (this._textureId) {
            let gl = WebGL.context;
            gl.deleteTexture(this._textureId);
            this._textureId = null;
        }
    }

    private makeConfig(gl: WebGLRenderingContext) {
        return [
            { id: "front", texture: this.front, side: gl.TEXTURE_CUBE_MAP_POSITIVE_Z },
            { id: "back", texture: this.back, side: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z },
            { id: "top", texture: this.top, side: gl.TEXTURE_CUBE_MAP_POSITIVE_Y },
            { id: "bottom", texture: this.bottom, side: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y },
            { id: "left", texture: this.left, side: gl.TEXTURE_CUBE_MAP_NEGATIVE_X },
            { id: "right", texture: this.right, side: gl.TEXTURE_CUBE_MAP_POSITIVE_X }
        ];
    }

    private initConfigIfNecessary() {
        if (!this._config) {
            this._config = this.makeConfig(WebGL.context);
        }
    }
}
