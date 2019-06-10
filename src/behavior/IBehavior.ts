
import { IBehaviorComponent } from "./IBehaviorComponent";
import { Operator } from "./Operator";

export interface IBehavior {
    readonly ownerComponent: IBehaviorComponent;
    sendSignal: (operatorId: string, pinId: string) => void;    
    fetchInputData: (operatorId: string) => void;
    activateOperator: (operator: Operator) => void;
}
