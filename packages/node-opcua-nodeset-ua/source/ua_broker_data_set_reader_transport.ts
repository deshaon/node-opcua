// ----- this file has been automatically generated - do not edit
import { UAProperty } from "node-opcua-address-space-base"
import { DataType, Variant } from "node-opcua-variant"
import { UAString } from "node-opcua-basic-types"
import { UADataSetReaderTransport, UADataSetReaderTransport_Base } from "./ua_data_set_reader_transport"
/**
 * |                |                                                  |
 * |----------------|--------------------------------------------------|
 * |namespace       |http://opcfoundation.org/UA/                      |
 * |nodeClass       |ObjectType                                        |
 * |typedDefinition |BrokerDataSetReaderTransportType ns=0;i=21142     |
 * |isAbstract      |false                                             |
 */
export interface UABrokerDataSetReaderTransport_Base extends UADataSetReaderTransport_Base {
    queueName: UAProperty<UAString, /*z*/DataType.String>;
    resourceUri: UAProperty<UAString, /*z*/DataType.String>;
    authenticationProfileUri: UAProperty<UAString, /*z*/DataType.String>;
    requestedDeliveryGuarantee: UAProperty<any, any>;
    metaDataQueueName: UAProperty<UAString, /*z*/DataType.String>;
}
export interface UABrokerDataSetReaderTransport extends UADataSetReaderTransport, UABrokerDataSetReaderTransport_Base {
}