
import { Entity, EntityInternal } from "../core/Entity";
import * as Attributes from "../core/Attributes";
import { Layout } from "./Layout";
import { Text } from "./UIText";
import { Button } from "./Button";
import { Material } from "../graphics/Material";
import { Matrix44 } from "../math/Matrix44";
import { Vector3 } from "../math/Vector3";
import { Shader } from "../graphics/Shader";
import { TouchEvent, Input } from "../input/Input";
import { AABB } from "../math/AABB";
import { Vector2 } from "../math/Vector2";
import { UISizeType } from "./UISize";
import { BehaviorComponent } from "../behavior/BehaviorComponent";
import { UIEvents } from "../behavior/operators/UIEvents";
import { LayoutUtils } from "./LayoutUtils";
import { UIFillUtils, UIFillRenderOptions } from "./UIFillUtils";
import { Color } from "../graphics/Color";
import { GraphicUtils } from "../graphics/GraphicUtils";
import { SerializedObject } from "../core/SerializableObject";
import { Reference } from "../serialization/Reference";
import { Resolution, CustomResolution } from "./Resolution";
import { UIElement } from "./UIElement";
import { TouchInteractions } from "./TouchInteractions";
import { CheckBox } from "./CheckBox";
import { Time } from "../core/Time";
import { Component } from "../core/Component";
import { Interfaces } from "../core/Interfaces";
import { WebGL } from "../graphics/WebGL";
import { Transform } from "../core/Transform";
import { Image } from "./Image";
import { UISettings } from "./UISettings";

/**
 * @hidden
 */
namespace Private {
    export const longPressDuration = .5;
    export const touchMovedTreshold = 3;

    export const tintColor = new Color();
    export const invModelView = new Matrix44();
    export const _2dPickingAABB = new AABB();
    export const localCoords = new Vector3();
    export let dummyLayout: Layout;
    
    export const renderOptions: UIFillRenderOptions = {
        tint: new Color(),
        screenOffset: new Vector2(),
        screenPosition: new Vector3()
    // tslint:disable-next-line
    } as any;
}

/**
 * @hidden
 */
export interface CacheEntry {
    drawOrder: number;
    element: Layout;
}

@Attributes.helpUrl("https://docs.spiderengine.io/2d/screen.html")
export class Screen extends Component {

    get version() { return 2; }

    get cache() { return this._cache; }
    get cacheSize() { return this._cacheIndex; }
    get offset() { return this._offset; }

    get translationX() { return this._translationX; }
    get translationY() { return this._translationY; }
    get scale() { return this._scale; }

    get screenTransform() { return this._screenTransform; }
    get resolution() { return this._resolution.instance; }

    @Attributes.displayName("Scaling")
    private _resolution = new Reference(Resolution);

    private _integerPixels = true;

    @Attributes.unserializable()
    @Attributes.hidden()
    private _cache: CacheEntry[] = [];

    @Attributes.unserializable()
    @Attributes.hidden()
    private _cacheIndex = 0;

    @Attributes.unserializable()
    private _offset = new Vector2();

    @Attributes.unserializable()
    private _translationX = 0;
    @Attributes.unserializable()
    private _translationY = 0;
    @Attributes.unserializable()
    private _scale = 1;
    @Attributes.unserializable()
    private _pressedElement?: UIElement;
    @Attributes.unserializable()
    private _pressDuration = -1;
    @Attributes.unserializable()
    private _initialTouchPos = new Vector2();
    @Attributes.unserializable()
    private _screenTransform = new Matrix44();

    setEntity(owner: Entity) {
        super.setEntity(owner);
        owner.clearComponent(Layout);
        owner.getOrSetComponent(Transform);
        this.onTouchPressed = this.onTouchPressed.bind(this);
        this.onTouchMoved = this.onTouchMoved.bind(this);
        this.onTouchReleased = this.onTouchReleased.bind(this);
        Input.touchPressed.attach(this.onTouchPressed);
        Input.touchMoved.attach(this.onTouchMoved);
        Input.touchReleased.attach(this.onTouchReleased);
    }

    destroy() {
        Input.touchPressed.detach(this.onTouchPressed);
        Input.touchMoved.detach(this.onTouchMoved);
        Input.touchReleased.detach(this.onTouchReleased);
        super.destroy();
    }

    getResolution(fallback: Vector2) {
        return this.resolution ? this.resolution.size : fallback;
    }

    updateTransforms() {
        const { screenSize } = Interfaces.renderer;
        this._scale = 1;
        this._translationX = 0;
        this._translationY = 0;

        this._screenTransform.copy(this.entity.transform.worldMatrix);

        const resolution = this.resolution;
        if (resolution) {
            let targetRatio = resolution.size.x / resolution.size.y;
            if (resolution.adaptiveWidth) {
                let widthInScreenSpace = screenSize.y * targetRatio;
                this._translationX = (screenSize.x - widthInScreenSpace) / 2;
                if (this._integerPixels) {
                    this._translationX = Math.floor(this._translationX);
                }
                this._scale = screenSize.y / resolution.size.y;
            } else {
                let heightInScreenSpace = screenSize.x / targetRatio;
                this._translationY = (screenSize.y - heightInScreenSpace) / 2;
                if (this._integerPixels) {
                    this._translationY = Math.floor(this._translationY);
                }
                this._scale = screenSize.x / resolution.size.x;
            }
            // convert the screen translation to resolution space
            this._screenTransform.data[12] *= this._scale;
            this._screenTransform.data[13] *= this._scale;
        }

        this._screenTransform.scaleFromCoords(this._scale, this._scale, 1);
        this._screenTransform.translateFromCoords(this._translationX, this._translationY, 0);

        // This offset is for elements that have alignment around the edges (left/right/top/bottom) - center is OK
        // They need to be kept aligned around the real edges of the screen             
        // Basically, if edges of the screen are not visible, "push" the elements around so they become visible
        // Do nothing if edges are visible (translation is positive)
        this._offset.x = Math.max(-this._translationX, 0);
        this._offset.y = Math.max(-this._translationY, 0);
        // Transform offset from screen space to resolution space, because layouting works in resolution space
        this._offset.x = this._offset.x / this._scale;
        this._offset.y = this._offset.y / this._scale;
        if (this._integerPixels) {
            this._offset.x = Math.floor(this._offset.x);
            this._offset.y = Math.floor(this._offset.y);
        }
        // update transforms
        this.entity.traverse(e => {
            let layout = e.getComponent(Layout);
            if (layout) {
                LayoutUtils.updateLayoutWorldMatrix(layout, this.getResolution(screenSize), this.offset);
            }
            return true;
        });
    }

    update() {
        let checkForLongPress = this._pressDuration >= 0;
        const pressedElement = this._pressedElement;
        if (pressedElement && checkForLongPress) {
            this._pressDuration += Time.deltaTime;
            if (this._pressDuration > Private.longPressDuration) {
                // trigger long press
                this.onEvent(pressedElement.entity, (uiOperator: UIEvents, currentHandler: Entity) => {
                    uiOperator._target.value.entity = pressedElement.entity;
                    uiOperator.sendSignal(uiOperator._longPress.name);
                    return uiOperator._stopPropagation.getData();
                });
                this._pressDuration = -1;
            }
        }
    }

    render(uiMaterial: Material) {

        const { tintColor } = Private;
        this._cacheIndex = 0;
        this.entity.traverse(child => this.addToCache(child));

        // Works great, but let see if I can do without
        // this._cache.sort((a, b) => {
        //     let aZOffset = a.element ? a.element.offset.z : 0;
        //     let bZOffset = b.element ? b.element.offset.z : 0;
        //     // use the z offset to change the order
        //     // if z offset is negative, add an additional -1 offset to make sure the element is behind its parent
        //     // For example:

        //     // before sorting
        //     // Parent draw order: 0
        //     // child draw order: 1

        //     // after sorting (if child has -1 offset)
        //     // child draw order: -1 => equivalent to "orderBasedOnHierarchy - 2"
        //     // Parent draw order: 0
        //     let aOrder = a.drawOrder + aZOffset + ((Math.sign(aZOffset + .001) - 1) / 2);
        //     let bOrder = b.drawOrder + bZOffset + ((Math.sign(bZOffset + .001) - 1) / 2);
        //     return aOrder - bOrder;
        // });

        const modelView = Matrix44.fromPool();
        const { context } = WebGL;
        const { renderOptions } = Private;
        UISettings.integerPixels = this._integerPixels;
        renderOptions.material = uiMaterial;
        renderOptions.context = context;
        renderOptions.screenOffset.set(this._translationX, this._translationY);
        renderOptions.screenPosition.copy(this.entity.transform.worldPosition);
        renderOptions.screenScale = this._scale;        

        for (let i = 0; i < this._cacheIndex; ++i) {
            const elem = this._cache[i].element;
            const worldMatrix = elem.worldMatrix;
            if (this._integerPixels) {
                worldMatrix.data[12] = Math.floor(worldMatrix.data[12]);
                worldMatrix.data[13] = Math.floor(worldMatrix.data[13]);
                worldMatrix.data[14] = Math.floor(worldMatrix.data[14]);
            }
            modelView.multiplyMatrices(this._screenTransform, worldMatrix);            
            uiMaterial.queueParameter("modelViewMatrix", modelView);

            renderOptions.modelView = modelView;
            renderOptions.tint.copy(elem.finalTint);

            const image = elem.entity.getComponent(Image);
            if (image) {
                const fill = image.fill;
                if (image.active && fill) {
                    renderOptions.fill = fill;
                    renderOptions.vertexBuffer = image.getVertexBuffer();
                    UIFillUtils.renderFill(renderOptions);
                }
                continue;
            }

            const button = elem.entity.getComponent(Button);
            if (button) {
                const fill = button.currentFill;
                if (button.active && fill) {
                    renderOptions.fill = fill;
                    renderOptions.vertexBuffer = button.getVertexBuffer();
                    UIFillUtils.renderFill(renderOptions);
                }
                continue;
            }

            const checkBox = elem.entity.getComponent(CheckBox);
            if (checkBox) {
                const fill = checkBox.currentFill;
                if (checkBox.active && fill) {
                    renderOptions.fill = fill;
                    renderOptions.vertexBuffer = checkBox.getVertexBuffer();
                    renderOptions.tint.multiplyColor(checkBox.currentColor);
                    UIFillUtils.renderFill(renderOptions);
                }
                continue;
            }

            const text = elem.entity.getComponent(Text);
            if (text) {
                const font = text.font;
                if (text.active && font) {
                    let maxWidth = 0;
                    const multiLineText = elem.width.type !== UISizeType.Auto;
                    if (multiLineText) {
                        maxWidth = elem.actualWidth;
                    }
                    font.prepareForRendering(this.scale, maxWidth);
                    uiMaterial.queueReferenceParameter(UIFillUtils.uiShaderTextureParam, font.getTexture());
                    uiMaterial.queueParameter(UIFillUtils.uiShaderColorParam, tintColor.copy(text.color).multiplyColor(elem.finalTint));
                    if (uiMaterial.begin()) {
                        GraphicUtils.drawVertexBuffer(context, text.getVertexBuffer(), uiMaterial.shader as Shader);
                    }
                }
                continue;
            }
        }
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            if (json.properties.useResolution) {
                Object.assign(json.properties, {
                    _resolution: {
                        baseTypeName: "Resolution",
                        data: {
                            typeName: "CustomResolution",
                            version: 1,
                            properties: {
                                size: JSON.parse(JSON.stringify(json.properties.resolution)),
                                adaptiveWidth: json.properties.matchHeight
                            }
                        }
                    }
                });
            }
            delete json.properties.resolution;
            delete json.properties.useResolution;
            delete json.properties.matchHeight;
        }
        return json;
    }

    private addToCache(e: Entity) {
        if (!e.active) {
            return false;
        }
        if (this._cacheIndex >= this._cache.length) {
            const newCapacity = Math.max(32, this._cache.length * 2);
            this._cache.length = newCapacity;
            for (var i = this._cacheIndex; i < newCapacity; ++i) {
                this._cache[i] = {
                    drawOrder: 999999, // ensure this element stays at the end of the cache array after cache sorting
                    element: Private.dummyLayout
                };
            }
        }
        const layout = e.getComponent(Layout);
        if (layout) {
            const cacheEntry = this._cache[this._cacheIndex];
            cacheEntry.element = layout;
            cacheEntry.drawOrder = this._cacheIndex;
            this._cacheIndex++;
        }
        return true;
    }

    private onTouchPressed(e: TouchEvent) {
        this._initialTouchPos.set(e.x, e.y);
        this.onTouchChanged(e);

        const pressedElement = this._pressedElement;
        if (pressedElement) {
            this.onEvent(pressedElement.entity, (uiOperator, currentHandler) => {
                uiOperator._target.value.entity = pressedElement.entity;
                uiOperator._touchPos.getData().set(
                    (e.x - this._translationX) / this._scale,
                    (e.y - this._translationY) / this._scale
                );
                uiOperator.sendSignal(uiOperator._touchDown.name);
                return uiOperator._stopPropagation.getData();
            });
        }
    }

    private onTouchMoved(e: TouchEvent) {
        const hoveredElement = this.onTouchChanged(e);

        if (this._pressDuration >= 0) {
            const deltaX = e.x - this._initialTouchPos.x;
            const deltaY = e.y - this._initialTouchPos.y;
            const dragDetected = Math.max(Math.abs(deltaX), Math.abs(deltaY)) > Private.touchMovedTreshold;
            if (dragDetected) {
                // Cancel the long press event
                this._pressDuration = -1;
            }
        }

        const touchMoveTarget = this._pressedElement || hoveredElement;
        if (touchMoveTarget) {
            this.onEvent(touchMoveTarget.entity, (uiOperator, currentHandler) => {
                uiOperator._target.value.entity = touchMoveTarget.entity;
                uiOperator._touchPos.getData().set(
                    (e.x - this._translationX) / this._scale,
                    (e.y - this._translationY) / this._scale
                );
                uiOperator.sendSignal(uiOperator._touchMove.name);
                return uiOperator._stopPropagation.getData();
            });
        }
    }

    private onTouchReleased(e: TouchEvent) {
        this.onTouchChanged(e);

        let pressedElement = this._pressedElement;
        if (pressedElement) {
            const entity = pressedElement.entity;
            this.onEvent(entity, (uiOperator, currentHandler) => {
                uiOperator._target.value.entity = entity;
                uiOperator._touchPos.getData().set(
                    (e.x - this._translationX) / this._scale,
                    (e.y - this._translationY) / this._scale
                );
                uiOperator.sendSignal(uiOperator._touchUp.name);
                return uiOperator._stopPropagation.getData();
            });
        }

        if (e.swipe) {
            // cancel click events for the remainder of the motion
            delete this._pressedElement;
        }

        pressedElement = this._pressedElement;
        if (pressedElement) {
            if (pressedElement.isTouchInside) {
                // trigger click
                const entity = pressedElement.entity;
                this.onEvent(entity, (uiOperator, currentHandler) => {
                    uiOperator._target.value.entity = entity;
                    uiOperator._touchPos.getData().set(
                        (e.x - this._translationX) / this._scale,
                        (e.y - this._translationY) / this._scale
                    );
                    uiOperator.sendSignal(uiOperator._click.name);
                    return uiOperator._stopPropagation.getData();
                });
            }
            delete this._pressedElement;
        }
    }

    private onTouchChanged(e: TouchEvent) {
        const { _2dPickingAABB, invModelView, localCoords } = Private;
        let firstHit = true;
        let hoveredElement: UIElement | null = null;

        for (let i = this._cacheIndex - 1; i >= 0; --i) {
            const layout = this._cache[i].element;
            const owner = layout.entity;
            const touchInteractions = owner.getComponent(TouchInteractions);
            if (!touchInteractions || !touchInteractions.active) {
                continue;
            }
            // TODO come up with a better way to extract a component from its base type!
            const uiElement = owner.getComponent(Button)
                || owner.getComponent(Image)
                || owner.getComponent(Text)
                || owner.getComponent(CheckBox);
            if (!uiElement) {
                continue;
            }
            const w = layout.actualWidth;
            const h = layout.actualHeight;
            _2dPickingAABB.min.set(-layout.pivot.x * w, -layout.pivot.y * h, -999999);
            _2dPickingAABB.max.set(w - layout.pivot.x * w, h - layout.pivot.y * h, 999999);
            invModelView.multiplyMatrices(this._screenTransform, layout.worldMatrix).invert();
            localCoords.set(e.x, e.y, 0).transform(invModelView);

            if (_2dPickingAABB.contains(localCoords)) {
                if (!uiElement.isTouchInside) {
                    if (firstHit) {
                        this.onElementHovered(e, uiElement, true);
                        hoveredElement = uiElement;
                    }
                } else {
                    if (!firstHit) {
                        this.onElementHovered(e, uiElement, false);
                    }
                }
                firstHit = false;
            } else {
                if (uiElement.isTouchInside) {
                    this.onElementHovered(e, uiElement, false);
                    hoveredElement = null;
                }
            }

            if (e.pressed === true) {
                if (uiElement.isTouchInside && !uiElement.isTouchPressed) {
                    uiElement.setTouchPressed(true);
                    this._pressedElement = uiElement;
                    this._pressDuration = 0;
                }
            } else if (e.pressed === false) {
                if (uiElement.isTouchPressed) {
                    uiElement.setTouchPressed(false);
                }
            }
        }

        return hoveredElement;
    }

    private onEvent(currentHandler: Entity | undefined, handler: (uiEvents: UIEvents, entity: Entity) => boolean) {
        EntityInternal.collectEntityOperations = true;
        while (currentHandler) {
            const behavior = currentHandler.getComponent(BehaviorComponent);
            if (behavior) {
                const stopPropagation = behavior.onUIEvent(uiOperator => handler(uiOperator, currentHandler as Entity));
                if (stopPropagation) {
                    break;
                }
            }
            // Stop traversing ancestors when reaching the screen
            if (currentHandler === this.entity) {
                break;
            }
            currentHandler = currentHandler.parent;
        }
        EntityInternal.collectEntityOperations = false;
    }

    private onElementHovered(e: TouchEvent, uiElement: UIElement, hovered: boolean) {
        uiElement.setTouchInside(hovered);
        const entity = uiElement.entity;
        this.onEvent(entity, (uiOperator, currentHandler) => {
            uiOperator._target.value.entity = entity;
            uiOperator._touchPos.getData().set(
                (e.x - this._translationX) / this._scale,
                (e.y - this._translationY) / this._scale
            );
            uiOperator.sendSignal(hovered ? uiOperator._touchEnter.name : uiOperator._touchLeave.name);
            return uiOperator._stopPropagation.getData();
        });
    }
}
