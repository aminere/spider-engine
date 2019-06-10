import { Asset } from "./Asset";
import { VoidAsyncEvent } from "ts-events";
import { AssetIdDatabase } from "./AssetIdDatabase";
import { IObjectManagerInternal } from "../core/IObjectManager";

namespace Private {
    export const loadingMap = new Map<Asset, VoidAsyncEvent[]>();
}

export namespace AssetsInternal {
    export function updateLoading() {
        const { loadingMap } = Private;
        if (loadingMap.size === 0) {
            return;
        }
        const assetsToClear: Asset[] = [];
        loadingMap.forEach((callbacks, asset) => {
            if (asset.isLoaded()) {
                for (const onLoaded of callbacks) {
                    onLoaded.post();
                }
                assetsToClear.push(asset);
            }
        });
        for (const asset of assetsToClear) {
            loadingMap.delete(asset);
        }
    }
}

export class Assets {
    static load(path: string) {
        return new Promise<Asset>((resolve, reject) => {
            IObjectManagerInternal.instance.loadObject(path)
                .then(([asset]) => {                    
                    const _asset = asset as Asset;
                    if (_asset.isLoaded()) {
                        resolve(_asset);
                    } else {
                        const { loadingMap } = Private;
                        let callbacks = loadingMap.get(_asset);
                        if (!callbacks) {
                            callbacks = [new VoidAsyncEvent()];
                            loadingMap.set(_asset, callbacks);
                        } else {
                            callbacks.push(new VoidAsyncEvent());
                        }
                        callbacks[callbacks.length - 1].once(() => resolve(_asset));
                    }
                })
                .catch(reject);
        });
    }

    static loadById(id: string) {
        const path = AssetIdDatabase.getPath(id);
        if (path) {
            return Assets.load(path);
        } else {
            return Promise.reject(`Could not resolve path for asset with id '${id}'`);
        }
    }
}
