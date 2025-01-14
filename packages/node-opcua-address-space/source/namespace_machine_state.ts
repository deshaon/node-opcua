import { UAObject, UAObjectType, BaseNode } from "node-opcua-address-space-base";
import { UAState, UATransition, UATransition_Base } from "node-opcua-nodeset-ua";
import { UATransitionEx } from "./interfaces/state_machine/ua_transition_ex";
export interface INamespaceMachineState {
    addState(component: UAObject | UAObjectType, stateName: string, stateNumber: number, isInitialState?: boolean): UAState;
    addTransition(
        component: UAObject | UAObjectType,/* StateMachine | StateMachineType,*/
        fromState: string,
        toState: string,
        transitionNumber: number
    ): UATransitionEx;
}

