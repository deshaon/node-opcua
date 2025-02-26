// ----- this file has been automatically generated - do not edit
import { Variant } from "node-opcua-variant"
import { UInt32, UAString } from "node-opcua-basic-types"
import { DTPubSubGroup } from "./dt_pub_sub_group"
import { DTEndpointDescription } from "./dt_endpoint_description"
import { DTKeyValuePair } from "./dt_key_value_pair"
import { DTStructure } from "./dt_structure"
import { DTDataSetReader } from "./dt_data_set_reader"
/**
 * |           |                                                  |
 * |-----------|--------------------------------------------------|
 * | namespace |http://opcfoundation.org/UA/                      |
 * | nodeClass |DataType                                          |
 * | name      |ReaderGroupDataType                               |
 * | isAbstract|false                                             |
 */
export interface DTReaderGroup extends DTPubSubGroup  {
  name: UAString; // String ns=0;i=12
  enabled: boolean; // Boolean ns=0;i=1
  securityMode: Variant; // Variant ns=0;i=302
  securityGroupId: UAString; // String ns=0;i=12
  securityKeyServices: DTEndpointDescription[]; // ExtensionObject ns=0;i=312
  maxNetworkMessageSize: UInt32; // UInt32 ns=0;i=7
  groupProperties: DTKeyValuePair[]; // ExtensionObject ns=0;i=14533
  transportSettings: DTStructure; // ExtensionObject ns=0;i=22
  messageSettings: DTStructure; // ExtensionObject ns=0;i=22
  dataSetReaders: DTDataSetReader[]; // ExtensionObject ns=0;i=15623
}