import * as async from "async";
import { checkDebugFlag, make_debugLog } from "node-opcua-debug";
import { CallbackT, ErrorCallback } from "node-opcua-status-code";
import { IAddressSpace } from "node-opcua-address-space-base";

import { adjustNamespaceArray } from "../../src/nodeset_tools/adjust_namespace_array";
import { NodeSetLoader } from "./load_nodeset2";

const doDebug = checkDebugFlag(__filename);
const debugLog = make_debugLog(__filename);
/**
 * @param addressSpace the addressSpace to populate
 * @xmlFiles: a lis of xml files
 * @param xmlLoader - a helper function to return the content of the xml file
 */
export function generateAddressSpaceRawCallback(
    addressSpace: IAddressSpace,
    xmlFiles: string | string[],
    xmlLoader: (nodeset2xmlUri: string, callback: CallbackT<string>) => void,
    callback?: ErrorCallback
): void {
    // istanbul ignore next
    if (!callback) {
        throw new Error("Internal Error; :callback missing");
    }
    const nodesetLoader = new NodeSetLoader(addressSpace);

    if (!Array.isArray(xmlFiles)) {
        xmlFiles = [xmlFiles];
    }

    // read xml files in parallel
    async.map(
        xmlFiles,
        (xmlFile: string, callback1: (err?: Error | null, xmlData?: string) => void) => {
            xmlLoader(xmlFile, callback1);
        },
        (err, xmlDataArray) => {
            if (err) {
                callback!(err);
                return;
            }

            async.forEachSeries(
                xmlDataArray!,
                (xmlData: string | undefined, callback1: (err?: Error) => void) => {
                    if (!xmlData) {
                        return callback1(err!);
                    }
                    nodesetLoader.addNodeSet(xmlData!, callback1);
                },
                (err?: Error | null) => {
                    nodesetLoader.terminate(() => {
                        adjustNamespaceArray(addressSpace);
                        callback!();
                    });
                }
            );
        }
    );
    // however process them in series
}
export type XmlLoaderFunc = (nodeset2xmlUri: string, callback: CallbackT<string>) => void;

export function generateAddressSpaceRaw(
    addressSpace: IAddressSpace,
    xmlFiles: string | string[],
    xmlLoader: XmlLoaderFunc
): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
        generateAddressSpaceRawCallback(addressSpace, xmlFiles, xmlLoader, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
    return promise;
}
