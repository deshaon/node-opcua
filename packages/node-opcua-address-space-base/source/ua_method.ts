

import { NodeClass } from "node-opcua-data-model";
import { NodeId } from "node-opcua-nodeid";
import { Argument, CallMethodResultOptions } from "node-opcua-types";
import { Variant, VariantLike } from "node-opcua-variant";
//
import { BaseNode } from "./base_node";
import { ISessionContext } from "./session_context";
import { UAObject } from "./ua_object";
import { UAObjectType } from "./ua_object_type";
import { UAVariable } from "./ua_variable";
import { CloneExtraInfo, CloneFilter, CloneOptions } from "./clone_options";

export declare type MethodFunctor = (
    this: UAMethod,
    inputArguments: Variant[],
    context: ISessionContext,
    callback: MethodFunctorCallback
) => void;
export declare type MethodFunctorCallback = (err: Error | null, callMethodResult: CallMethodResultOptions) => void;

export declare class UAMethod extends BaseNode {
    public readonly nodeClass: NodeClass.Method;
    public readonly typeDefinition: NodeId;
    public readonly typeDefinitionObj: UAObjectType;

    public readonly parent: UAObject | null;

    public readonly inputArguments?: UAVariable;
    public readonly outputArguments?: UAVariable;

    public readonly methodDeclarationId: NodeId;

    /**
     *
     */
    public _getExecutableFlag?: (sessionContext: ISessionContext | null) => boolean;

    public bindMethod(methodFunction: MethodFunctor): void;

    public getExecutableFlag(context: ISessionContext): boolean;

    public getInputArguments(): Argument[];

    public getOutputArguments(): Argument[];

    /**
     * @async
     * @param inputArguments
     * @param context
     * @param callback
     */
    public execute(
        object: UAObject | UAObjectType | null,
        inputArguments: VariantLike[] | null,
        context: ISessionContext,
        callback: MethodFunctorCallback
    ): void;
    public execute(
        object: UAObject | UAObjectType | null,
        inputArguments: null | VariantLike[],
        context: ISessionContext
    ): Promise<CallMethodResultOptions>;

    public clone(options: CloneOptions, optionalFilter?: CloneFilter, extraInfo?: CloneExtraInfo): UAMethod;

    public isBound(): boolean;
}
