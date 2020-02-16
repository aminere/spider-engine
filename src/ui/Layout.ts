import { Rect } from "./Rect";
import { Vector2 } from "../math/Vector2";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { HorizontalAlignment, VerticalAlignment } from "./Alignment";
import { UISize } from "./UISize";
import { Matrix44 } from "../math/Matrix44";
import * as Attributes from "../core/Attributes";
import { Color } from "../graphics/Color";
import { SerializedObject } from "../core/SerializableObject";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";

@Attributes.mandatory()
@Attributes.sortOrder(0)
@Attributes.helpUrl("https://docs.spiderengine.io/2d/layout.html")
export class Layout extends Component {

    static horizontalAlignmentPropertyKey = "_horizontalAlignment";
    static verticalAlignmentPropertyKey = "_verticalAlignment";
    static rotationKey = "_rotation";
    static offsetKey = "_offset";
    static scaleKey = "_scale";
    
    get version() { return 3; }

    get offset() { return this._offset; }
    get pivot() { return this._pivot; }
    get width() { return this._width; }
    get height() { return this._height; }
    get horizontalAlignment() { return this._horizontalAlignment; }
    get verticalAlignment() { return this._verticalAlignment; }   
    set horizontalAlignment(value: number) { this._horizontalAlignment = value; }
    set verticalAlignment(value: number) { this._verticalAlignment = value; }
    get margin() { return this._margin; }
    get rotation() { return this._rotation; }
    get scale() { return this._scale; }
    get tint() { return this._tint; }
    set tint(tint: Color) { this._tint.copy(tint); }
    get inheritTint() { return this._inheritTint; }
    set inheritTint(inherit: boolean) { this._inheritTint = inherit; }

    set offset(offset: Vector3) { this._offset.copy(offset); } 
    set rotation(rotation: Quaternion) { this._rotation.copy(rotation); }
    set scale(scale: Vector2) { this._scale.copy(scale); }

    get actualWidth() { return this._actualWidth; }
    get actualHeight() { return this._actualHeight; }
    get worldMatrix() { return this._worldMatrix; }
    get finalTint() { return this._finalTint; }
    set actualWidth(w: number) { this._actualWidth = w; }
    set actualHeight(h: number) { this._actualHeight = h; }    

    get right() {
        this._worldMatrix.decompose(Vector3.dummy, Quaternion.dummy, Vector3.dummy);
        return Vector3.fromPool().copy(Vector3.right).rotate(Quaternion.dummy).normalize(); 
    }

    get forward() {         
        this._worldMatrix.decompose(Vector3.dummy, Quaternion.dummy, Vector3.dummy);
        return Vector3.fromPool().copy(Vector3.forward).rotate(Quaternion.dummy).normalize(); 
    }

    get up() {
        this._worldMatrix.decompose(Vector3.dummy, Quaternion.dummy, Vector3.dummy);
        return Vector3.fromPool().copy(Vector3.up).rotate(Quaternion.dummy).normalize(); 
    }

    get localRight() {
        return Vector3.fromPool().copy(Vector3.right).rotate(this.rotation).normalize(); 
    }

    get localForward() {         
        return Vector3.fromPool().copy(Vector3.forward).rotate(this.rotation).normalize(); 
    }

    get localUp() {        
        return Vector3.fromPool().copy(Vector3.up).rotate(this.rotation).normalize(); 
    }

    get absoluteScale() {
        return this.worldMatrix.getScale(Vector3.fromPool());
    }    

    get absolutePos() {
        return Vector3.fromPool().setFromMatrix(this.worldMatrix);
    }

    @Attributes.enumLiterals(HorizontalAlignment)
    private _horizontalAlignment = HorizontalAlignment.Left;

    @Attributes.enumLiterals(VerticalAlignment)
    private _verticalAlignment = VerticalAlignment.Top;

    private _pivot = new Vector2();
    private _offset = new Vector3();
    private _width = new UISize();
    private _height = new UISize();    
    private _margin = new Rect();
    private _rotation = new Quaternion();
    private _scale = new Vector2(1, 1);
    private _tint = new Color(1, 1, 1, 1);
    private _inheritTint = true;

    @Attributes.unserializable()
    private _worldMatrix = new Matrix44();
    @Attributes.unserializable()
    private _actualWidth = 0;
    @Attributes.unserializable()
    private _actualHeight = 0;    
    @Attributes.unserializable()
    private _finalTint = new Color(1, 1, 1, 1);

    constructor(props?: ObjectProps<Layout>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    upgrade(json: SerializedObject, previousVersion: number) {        
        if (previousVersion === 1) {
            json.properties.offset = json.properties.position;
            delete json.properties.position;
        } else if (previousVersion === 2) {
            Object.assign(json.properties, {
                _horizontalAlignment: json.properties.horizontalAlignment,
                _verticalAlignment: json.properties.verticalAlignment,
                _pivot: json.properties.pivot,
                _offset: json.properties.offset,
                _width: json.properties.width,
                _height: json.properties.height,
                _margin: json.properties.margin,
                _rotation: json.properties.rotation,
                _scale: json.properties.scale,
            });
            delete json.properties.horizontalAlignment;
            delete json.properties.verticalAlignment;
            delete json.properties.pivot;
            delete json.properties.offset;
            delete json.properties.width;
            delete json.properties.height;
            delete json.properties.margin;
            delete json.properties.rotation;
            delete json.properties.scale;
        }
        return json;
    }    
}
