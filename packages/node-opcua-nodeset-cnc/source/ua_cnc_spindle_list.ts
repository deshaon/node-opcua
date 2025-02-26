// ----- this file has been automatically generated - do not edit
import { UAObject } from "node-opcua-address-space-base"
import { DataType, Variant } from "node-opcua-variant"
import { NodeId } from "node-opcua-nodeid"
import { UInt32, UAString } from "node-opcua-basic-types"
import { UADataItem } from "node-opcua-nodeset-ua/source/ua_data_item"
import { UAAnalogItem } from "node-opcua-nodeset-ua/source/ua_analog_item"
import { UACncSpindle, UACncSpindle_actSpeed, UACncSpindle_cmdSpeed } from "./ua_cnc_spindle"
import { DTCncPosition } from "./dt_cnc_position"
import { UACncPositionVariable } from "./ua_cnc_position_variable"
export interface UACncSpindleList_$CncSpindle$ extends Omit<UACncSpindle, "actChannel"|"actGear"|"actLoad"|"actOverride"|"actPower"|"actSpeed"|"actStatus"|"actTorque"|"actTurnDirection"|"anglePos"|"cmdGear"|"cmdOverride"|"cmdSpeed"|"cmdTorque"|"isInactive"|"isVirtual"> { // Object
      /**
       * actChannel
       * NodeId of the channel object (CncChannelType)
       * that administrates this drive to expose driveb s
       * channel affiliation.
       */
      actChannel: UADataItem<NodeId, /*z*/DataType.NodeId>;
      /**
       * actFeedrate
       * Feedrate actual value.
       */
      actFeedrate: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * actGear
       * Gear stage actual value.
       */
      actGear: UADataItem<UInt32, /*z*/DataType.UInt32>;
      /**
       * actGFunctions
       * Active G function.
       */
      actGFunctions: UADataItem<UInt32[], /*z*/DataType.UInt32>;
      /**
       * actJogIncrement
       * Active JOG increment.
       */
      actJogIncrement: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * actLoad
       * Drive load actual value.
       */
      actLoad: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * actMainProgramFile
       * Path of active CNC main program.
       */
      actMainProgramFile: UADataItem<UAString, /*z*/DataType.String>;
      /**
       * actMainProgramFileOffset
       * File offset of active CNC main program file.
       */
      actMainProgramFileOffset: UADataItem<UInt32, /*z*/DataType.UInt32>;
      /**
       * actMainProgramLine
       * Line number of active CNC main program.
       */
      actMainProgramLine: UADataItem<UAString, /*z*/DataType.String>;
      /**
       * actMainProgramName
       * Name of active CNC main program.
       */
      actMainProgramName: UADataItem<UAString, /*z*/DataType.String>;
      /**
       * actMFunctions
       * Active M function.
       */
      actMFunctions: UADataItem<UInt32[], /*z*/DataType.UInt32>;
      /**
       * actModalOffsetFunction
       * active zero offset function
       */
      actModalOffsetFunction: UADataItem<UInt32, /*z*/DataType.UInt32>;
      actOperationMode: UADataItem<any, any>;
      /**
       * actOverride
       * Override actual value.
       */
      actOverride: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * actPower
       * Drive power actual value.
       */
      actPower: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * actProgramBlock
       * previous, actual and subsequent CNC program lines
       */
      actProgramBlock: UADataItem<UAString[], /*z*/DataType.String>;
      /**
       * actProgramFile
       * Path of active CNC program file (main or
       * subprogram).
       */
      actProgramFile: UADataItem<UAString, /*z*/DataType.String>;
      /**
       * actProgramFileOffset
       * File offset of active CNC program file (main or
       * subprogram).
       */
      actProgramFileOffset: UADataItem<UInt32, /*z*/DataType.UInt32>;
      /**
       * actProgramLine
       * Line number of active CNC program (main or
       * subprogram).
       */
      actProgramLine: UADataItem<UAString, /*z*/DataType.String>;
      /**
       * actProgramName
       * Name of active CNC program (main or subprogram).
       */
      actProgramName: UADataItem<UAString, /*z*/DataType.String>;
      /**
       * actProgramStatus
       * Active channel program status
       */
      actProgramStatus: UADataItem<any, any>;
      /**
       * actSpeed
       * Speed actual value.
       */
      actSpeed: UACncSpindle_actSpeed<number, /*z*/DataType.Double>;
      /**
       * actStatus
       * Actual spindle state.
       */
      actStatus: UADataItem<any, any>;
      /**
       * actTorque
       * Drive torque actual value.
       */
      actTorque: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * actTurnDirection
       * Turn direction actual value.
       */
      actTurnDirection: UADataItem<any, any>;
      /**
       * anglePos
       * Spindle angular position values in case of
       * interpolated (position controlled) spindle
       * movement. Returns zeros in case of regular
       * spindle operation (velocity controlled).
       */
      anglePos: UACncPositionVariable<DTCncPosition>;
      /**
       * blockMode
       * block mode active
       */
      blockMode: UADataItem<boolean, /*z*/DataType.Boolean>;
      /**
       * cmdFeedrate
       * feedrate setpoint value
       */
      cmdFeedrate: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * cmdGear
       * Gear stage setpoint value.
       */
      cmdGear: UADataItem<UInt32, /*z*/DataType.UInt32>;
      cmdOperationMode: UADataItem<any, any>;
      /**
       * cmdOverride
       * Override setpoint value.
       */
      cmdOverride: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * cmdSpeed
       * Speed setpoint value.
       */
      cmdSpeed: UACncSpindle_cmdSpeed<number, /*z*/DataType.Double>;
      /**
       * cmdTorque
       * Drive torque setpoint value.
       */
      cmdTorque: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * dryRunFeed
       * test feedrate
       */
      dryRunFeed: UAAnalogItem<number, /*z*/DataType.Double>;
      /**
       * feedHold
       * feed hold active
       */
      feedHold: UADataItem<boolean, /*z*/DataType.Boolean>;
      /**
       * isInactive
       * Drive inactive state (true in case of inactive
       * drive, else false).
       */
      isInactive: UADataItem<boolean, /*z*/DataType.Boolean>;
      /**
       * isVirtual
       * Virtual axis (no hardware present; true in case
       * of virtual axis, else fals).
       */
      isVirtual: UADataItem<boolean, /*z*/DataType.Boolean>;
      /**
       * toolId
       * active tool ID
       */
      toolId: UADataItem<UInt32, /*z*/DataType.UInt32>;
}
/**
 * List of CNC spindle objects.
 *
 * |                |                                                  |
 * |----------------|--------------------------------------------------|
 * |namespace       |http://opcfoundation.org/UA/CNC                   |
 * |nodeClass       |ObjectType                                        |
 * |typedDefinition |11:CncSpindleListType ns=11;i=1009                |
 * |isAbstract      |false                                             |
 */
export interface UACncSpindleList_Base {
}
export interface UACncSpindleList extends UAObject, UACncSpindleList_Base {
}