import { ObjectDeclaration } from "./ObjectDeclaration";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import { BehaviorUtils } from "./BehaviorUtils";
import { AssetReference, AssetChangedEvent } from "../serialization/AssetReference";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";

export class Data extends Component {

    static pinsPropertyKey = "_pins";

    set declaration(decl: ObjectDeclaration | null) {        
        this._declaration.asset = decl;        
    }
    get declaration() { return this._declaration.asset; }
    get declarationId() { return this._declaration.id; }
    get pins() { return this._pins; }    

    // Sadly these need to be public, short story to share functionality with Data Component through BehavioUtils
    _pins = new ReferenceArray(BasePin);   

    private _declaration = new AssetReference(ObjectDeclaration);    

    constructor(props?: ObjectProps<Data>) {
        super();
        if (props) {
            this.setState(props);
        }
        this.onDeclarationPinChanged = this.onDeclarationPinChanged.bind(this);
        this.onDeclarationChanged = this.onDeclarationChanged.bind(this);
        this._declaration.assetChanged.attach(this.onDeclarationChanged);
    }

    destroy() {
        if (this.declaration) {
            this.declaration.pinChanged.detach(this.onDeclarationPinChanged);
        }
        this._declaration.detach();
        super.destroy();
    }

    // tslint:disable-next-line
    setProperty(name: string, value: any) {
        super.setProperty(name, value);
        if (name === Data.pinsPropertyKey) {
            BehaviorUtils.updatePinAccessors(this);
        }
    }

    getPins() {
        return this._pins;
    }
    
    setPins(pins: ReferenceArray<BasePin>) {
        this._pins = pins;
    }

    findPinByName(name: string) {
        return this._pins.data
            .map(r => r.instance as BasePin)
            .find(p => p.name === name);
    }

    isLoaded() {
        if (!super.isLoaded()) {
            return false;
        }
        for (var pinRef of this._pins.data) {
            if (!BehaviorUtils.isPinLoaded(pinRef.instance as BasePin)) {
                 return false;
            }            
        }
        return true;
    }
    
    private onDeclarationPinChanged(pinId: string) {
        BehaviorUtils.buildPins(this, this.declaration as ObjectDeclaration);
    }

    private onDeclarationChanged(info: AssetChangedEvent) {
        let oldDecl = info.oldAsset as ObjectDeclaration;
        if (oldDecl) {
            oldDecl.pinChanged.detach(this.onDeclarationPinChanged);
        }
        let decl = info.newAsset as ObjectDeclaration;
        if (decl) {
            BehaviorUtils.buildPins(this, decl);
            decl.pinChanged.attach(this.onDeclarationPinChanged);
        }
    }
}
