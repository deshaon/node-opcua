// ----- this file has been automatically generated - do not edit
import { UAProperty } from "node-opcua-address-space-base"
import { DataType } from "node-opcua-variant"
import { UAAlarmCondition, UAAlarmCondition_Base } from "./ua_alarm_condition"
/**
 * |                |                                                  |
 * |----------------|--------------------------------------------------|
 * |namespace       |http://opcfoundation.org/UA/                      |
 * |nodeClass       |ObjectType                                        |
 * |typedDefinition |LimitAlarmType ns=0;i=2955                        |
 * |isAbstract      |false                                             |
 */
export interface UALimitAlarm_Base extends UAAlarmCondition_Base {
    highHighLimit?: UAProperty<number, /*z*/DataType.Double>;
    highLimit?: UAProperty<number, /*z*/DataType.Double>;
    lowLimit?: UAProperty<number, /*z*/DataType.Double>;
    lowLowLimit?: UAProperty<number, /*z*/DataType.Double>;
    baseHighHighLimit?: UAProperty<number, /*z*/DataType.Double>;
    baseHighLimit?: UAProperty<number, /*z*/DataType.Double>;
    baseLowLimit?: UAProperty<number, /*z*/DataType.Double>;
    baseLowLowLimit?: UAProperty<number, /*z*/DataType.Double>;
}
export interface UALimitAlarm extends UAAlarmCondition, UALimitAlarm_Base {
}