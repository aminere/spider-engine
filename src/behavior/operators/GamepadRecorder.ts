import * as Attributes from "../../core/Attributes";
import { GamepadData } from "../../assets/GamepadData";
import { Gamepads } from "../../input/Gamepads";
import { Time } from "../../core/Time";
import { Operator } from "../Operator";
import { NumberPin, AssetPin } from "../DataPins";
import { PinType } from "../Pin";
import { ExecutionStatus } from "../ExecutionStatus";
import { GamepadDataLoad } from "../../assets/GamepadDataLoad";

@Attributes.displayName("Gamepad Recorder")
export class GamepadRecorder extends Operator {    
    
    @Attributes.unserializable()
    private _frameSkip!: NumberPin;
    @Attributes.unserializable()
    private _gamePadIndex!: NumberPin;
    @Attributes.unserializable()
    private _dataStore!: AssetPin<GamepadData>;

    @Attributes.unserializable()
    private _data!: GamepadDataLoad;    

    constructor() {
        super();
        this.createPin("_frameSkip", PinType.Input, NumberPin);        
        this.createPin("_gamePadIndex", PinType.Input, NumberPin);        
        this.createAssetPin("_dataStore", PinType.Input, GamepadData); 
    }

    onStart() {
        this._data = {};
        return ExecutionStatus.Continue;
    }

    onUpdate() {
        let frameSkip  = (this._frameSkip.value + 1);
        let currentFrame = Time.currentFrame;
        if (currentFrame % frameSkip === 0) {
            let gamePadIndex  = this._gamePadIndex.value;
            let gamePad = Gamepads.get(gamePadIndex);
            if (gamePad) {
                this._data[currentFrame] = {
                    buttons: gamePad.buttons.map(b => b),
                    axes: JSON.parse(JSON.stringify(gamePad.axes))
                };
            }            
        }
        return ExecutionStatus.Continue;
    }

    destroy() {
        // save data
        let dataAsset = this._dataStore.value.asset;
        if (dataAsset) {
            dataAsset.data = this._data;
        }        
    }
}
