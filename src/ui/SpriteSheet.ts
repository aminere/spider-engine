import { Asset } from "../assets/Asset";
import { AssetReference } from "../serialization/AssetReference";
import { Texture2D } from "../graphics/Texture2D";
import { Vector2 } from "../math/Vector2";
import { EngineUtils } from "../core/EngineUtils";
import * as Attributes from "../core/Attributes";
import { SerializedObject } from "../core/SerializableObject";

namespace Private {
    export function countTiles(texture: Texture2D, tileSize: Vector2) {        
        let rowSize = texture.getWidth() / Math.max(tileSize.x, 1);
        let numRows = texture.getHeight() / Math.max(tileSize.y, 1);
        return numRows * rowSize;
    }
}

@Attributes.displayName("Sprite Sheet")
export class SpriteSheet extends Asset {
    
    get version() { return 2; }

    get texture() { return this._texture.asset; }
    set texture(texture: Texture2D | null) {
        this._texture.asset = texture;
        if (texture) {
            this._tileCount = Private.countTiles(texture, this._tileSize);
        }
    }

    get tileSize() { return this._tileSize; }
    set tileSize(tileSize: Vector2) {
        this._tileSize.copy(tileSize);
        if (this.texture) {
            this._tileCount = Private.countTiles(this.texture, this._tileSize);
        }
    }
    
    get tileCount() { return this._tileCount; }

    private _texture = new AssetReference(Texture2D);
    private _tileSize = new Vector2(32, 32);
    private _tileCount = 4;

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this._texture);
    }

    upgrade(json: SerializedObject, previousVersion: number) {        
        if (previousVersion === 1) {
            Object.assign(json.properties, {
                _tileSize: json.properties.tileSize,
                _tileCount: json.properties.tileCount
            });
            delete json.properties.tileSize;
            delete json.properties.tileCount;
        }
        return json;
    }
}
