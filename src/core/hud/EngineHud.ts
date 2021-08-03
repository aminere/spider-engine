import { Prefab } from "../../assets/Prefab";
import { BehaviorComponent } from "../../behavior/BehaviorComponent";
import { Layout } from "../../ui/Layout";
import { Text } from "../../ui/UIText";
import { CheckBox } from "../../ui/CheckBox";
import { AnimationComponent } from "../../animation/AnimationComponent";
import { AssetLoadingDefinition } from "../../assets/AssetLoadingDefinition";
import { Asset } from "../../assets/Asset";
import { SerializableObject } from "../SerializableObject";
import { Entity, EntityInternal } from "../Entity";
import { Entities } from "../Entities";
import { IObjectManagerInternal } from "../IObjectManager";

export class HudControl extends SerializableObject {
    name: string;
    constructor(name: string) {
        super();
        this.name = name;
    }
}

export class HudNumber extends HudControl {
    initialValue: number;
    min?: number;
    max?: number;
    onChanged?: (newValue: number) => void;
    constructor(name: string, value: number, min?: number, max?: number, onChanged?: (newValue: number) => void) {
        super(name);
        this.initialValue = value;
        this.min = min;
        this.max = max;
        this.onChanged = onChanged;
    }
}

export class HudBoolean extends HudControl {
    initialValue: boolean;
    onChanged?: (newValue: boolean) => void;
    constructor(name: string, value: boolean, onChanged?: (newValue: boolean) => void) {
        super(name);
        this.initialValue = value;
        this.onChanged = onChanged;
    }
}

export class HudCommand extends HudControl {
    onTriggered: () => void;
    constructor(name: string, onTriggered: () => void) {
        super(name);
        this.onTriggered = onTriggered;
    }
}

namespace Private {

    export let hudPrefab: Prefab;
    export let hudProperty: Prefab;
    export let hud: Entity | null = null;
    export let constrolsInitializedOnce = false;

    // Assets
    let hudCommand: Prefab;
    let hudNumber: Prefab;
    let hudBoolean: Prefab;

    export const hudAssets: AssetLoadingDefinition[] = [
        {
            path: "Assets/DefaultAssets/Hud/Prefabs/EngineHud.Prefab",
            set: asset => hudPrefab = asset as Prefab,
            get: () => hudPrefab
        },
        {
            path: "Assets/DefaultAssets/Hud/Prefabs/Property.Prefab",
            set: asset => hudProperty = asset as Prefab,
            get: () => hudProperty
        }
    ];
    export const factory: { [typeName: string]: AssetLoadingDefinition } = {
        HudCommand: {
            path: "Assets/DefaultAssets/Hud/Controls/Command/Command.Prefab",
            set: asset => hudCommand = asset as Prefab,
            get: () => hudCommand
        },
        HudNumber: {
            path: "Assets/DefaultAssets/Hud/Controls/Slider/Slider.Prefab",
            set: asset => hudNumber = asset as Prefab,
            get: () => hudNumber
        },
        HudBoolean: {
            path: "Assets/DefaultAssets/Hud/Controls/CheckBox/CheckBox.Prefab",
            set: asset => hudBoolean = asset as Prefab,
            get: () => hudBoolean
        }
    };

    export function getHudAsset(typeName: string) {
        if (typeName in factory) {
            return factory[typeName].get() as Prefab;
        }
        console.assert(false, `getHudAsset('${typeName}') returned null.`);
        return null;
    }
}

export class EngineHud {

    static load() {
        return Promise.all(
            Object.keys(Private.factory).map(a => {
                return new Promise<void>((resolve, reject) => {
                    IObjectManagerInternal.instance.loadObject(Private.factory[a].path)
                        .then(tuple => {
                            Private.factory[a].set(tuple[0] as Prefab);
                            resolve();
                        })
                        .catch(reject);
                });
            })
        )
            .then(() => Promise.all(
                Private.hudAssets.map(a => {
                    return new Promise<void>((resolve, reject) => {
                        IObjectManagerInternal.instance.loadObject(a.path)
                            .then(tuple => {
                                a.set(tuple[0] as Asset);
                                resolve();
                            })
                            .catch(reject);
                    });
                })
            ));
    }

    static isLoaded() {
        for (const key of Object.keys(Private.hudAssets)) {
            if (!Private.hudAssets[key].get().isLoaded()) {
                return false;
            }
        }
        return true;
    }

    static create() {
        console.assert(!Private.hud);
        if (!Private.hudPrefab) {
            // This is an old project that didn't get upgraded!
            return null;
        }
        Private.hud = Entities.create({ prefab: Private.hudPrefab });
        return Private.hud;
    }

    static setControls(controls: HudControl[]) {
        if (!Private.hud) {
            Private.hud = EngineHud.create();
            if (!Private.hud) {
                return;
            }
        }

        // tslint:disable-next-line
        const behaviorComponent = Private.hud.getComponent(BehaviorComponent) as any;
        const list = behaviorComponent.list as Entity;
        list.removeAllChildren();
        const propertyHeight = 30;
        const padding = 4;
        let offsetY = padding;
        for (let i = 0; i < controls.length; ++i) {
            const control = controls[i];
            const controlInstance = Entities.create({ prefab: Private.getHudAsset(control.constructor.name) as Prefab });
            let instance: Entity | null = null;

            if (control.isA(HudNumber)) {
                const hudNumber = control as HudNumber;
                instance = Entities.create({ prefab: Private.hudProperty });
                ((instance.findChild("Name") as Entity).getComponent(Text) as Text).text = hudNumber.name;
                Object.assign(EntityInternal.setComponentByName(controlInstance, "Proxy"), {
                    onChanged: (newValue: number) => {
                        const _onChanged = (control as HudNumber).onChanged;
                        if (_onChanged) {
                            return _onChanged(newValue);
                        }
                    }
                });
                // tslint:disable-next-line
                const hudNumberBehavior = controlInstance.getComponent(BehaviorComponent) as any;
                hudNumberBehavior.initialValue = hudNumber.initialValue;
                hudNumberBehavior.min = hudNumber.min;
                hudNumberBehavior.max = hudNumber.max;
                Object.assign(hudNumberBehavior, { initialValue: hudNumber.initialValue });
                (instance.findChild("Value") as Entity).addChild(controlInstance);

            } else if (control.isA(HudBoolean)) {
                const hudBoolean = control as HudBoolean;
                instance = Entities.create({ prefab: Private.hudProperty });
                ((instance.findChild("Name") as Entity).getComponent(Text) as Text).text = hudBoolean.name;
                Object.assign(EntityInternal.setComponentByName(controlInstance, "Proxy"), {
                    onChanged: (newValue: boolean) => {
                        const _onChanged = (control as HudBoolean).onChanged;
                        if (_onChanged) {
                            _onChanged(newValue);
                        }
                    }
                });
                (controlInstance.getComponent(CheckBox) as CheckBox).isChecked = hudBoolean.initialValue;
                (instance.findChild("Value") as Entity).addChild(controlInstance);

            } else if (control.isA(HudCommand)) {
                instance = controlInstance;
                ((instance.findChild("Text") as Entity).getComponent(Text) as Text).text = control.name;
                Object.assign(EntityInternal.setComponentByName(instance, "Proxy"), {
                    onClicked: () => {
                        (control as HudCommand).onTriggered();
                    }
                });
            }

            if (instance) {
                (instance.getComponent(Layout) as Layout).offset.y = offsetY;
                list.addChild(instance);
                offsetY += propertyHeight + padding;
            }
        }
        const listLayout = list.getComponent(Layout) as Layout;
        listLayout.height.value = offsetY;

        // position the close button
        const closeButton = behaviorComponent.close as Entity;
        (closeButton.getComponent(Layout) as Layout).offset.y = listLayout.offset.y + offsetY;

        if (!Private.constrolsInitializedOnce) {
            list.active = true;
            const listAnim = list.getComponent(AnimationComponent) as AnimationComponent;
            listAnim.playAnimation(0);
            listAnim.animationFinished.once(() => closeButton.active = true);
            Private.constrolsInitializedOnce = true;
        }
    }

    static onSceneDestroyed() {
        Private.hud = null;
        Private.constrolsInitializedOnce = false;
    }
}
