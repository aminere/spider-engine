
// Not used anymore, TODO cleanup
// import { ArrayProperty } from "../serialization/ArrayProperty";
// import { VisualGroup } from "./Group";

// export interface GroupSelector {
//     [groupId: string]: boolean;
// }

// export enum GroupSelectionState {
//     All,
//     None,
//     Some
// }

// export class GroupSelection {
//     private _groups: GroupSelector = {};
//     private _state = GroupSelectionState.All;

//     set groups(groups: GroupSelector) { this._groups = groups; }
//     set state(state: GroupSelectionState) { this._state = state; }
//     get state() { return this._state; }    

//     hasGroup(id: string) { 
//         if (this._state === GroupSelectionState.Some) {            
//             return id in this._groups;
//         } else {
//             return this._state === GroupSelectionState.All; 
//         }
//     }

//     addGroup(id: string) {
//         this._groups[id] = true;
//         this._state = GroupSelectionState.Some;
//     }

//     removeGroup(id: string) {
//         delete this._groups[id];
//         if (Object.keys(this._groups).length === 0) {
//             this._state = GroupSelectionState.None;
//         }
//     }
// }
