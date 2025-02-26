import { assert } from "node-opcua-assert";
import { AttributeIds, BrowseDirection, makeResultMask, NodeClassMask } from "node-opcua-data-model";
import { DataValue } from "node-opcua-data-value";
import { make_debugLog } from "node-opcua-debug";
import { DataTypeFactory, EnumerationDefinitionSchema, FieldCategory, FieldInterfaceOptions, getBuildInType, StructuredTypeSchema, TypeDefinition } from "node-opcua-factory";
import { NodeId, makeExpandedNodeId, resolveNodeId } from "node-opcua-nodeid";
import { browseAll, BrowseDescriptionLike, IBasicSession } from "node-opcua-pseudo-session";
import { StatusCodes } from "node-opcua-status-code";
import { EnumDefinition, DataTypeDefinition, StructureDefinition, StructureType } from "node-opcua-types";
//
import { _findEncodings } from "./private/find_encodings";


const debugLog = make_debugLog(__filename);

async function findSuperType(session: IBasicSession, dataTypeNodeId: NodeId): Promise<NodeId> {
    const nodeToBrowse3: BrowseDescriptionLike = {
        browseDirection: BrowseDirection.Inverse,
        includeSubtypes: false,
        nodeClassMask: NodeClassMask.DataType,
        nodeId: dataTypeNodeId,
        referenceTypeId: resolveNodeId("HasSubtype"),
        resultMask: makeResultMask("NodeId | ReferenceType | BrowseName | NodeClass")
    };
    const result3 = await browseAll(session, nodeToBrowse3);

    /* istanbul ignore next */
    if (result3.statusCode !== StatusCodes.Good) {
        throw new Error("Cannot find superType for " + dataTypeNodeId.toString());
    }
    result3.references = result3.references || [];

    /* istanbul ignore next */
    if (result3.references.length !== 1) {
        console.log(result3.toString());
        throw new Error("Invalid dataType with more than one superType " + dataTypeNodeId.toString());
    }
    return result3.references[0].nodeId;
}
async function findDataTypeCategory(
    session: IBasicSession,
    cache: { [key: string]: CacheForFieldResolution },
    dataTypeNodeId: NodeId
): Promise<FieldCategory> {
    const subTypeNodeId = await findSuperType(session, dataTypeNodeId);
    debugLog("subTypeNodeId  of ", dataTypeNodeId.toString(), " is ", subTypeNodeId.toString());
    const key = subTypeNodeId.toString();
    if (cache[key]) {
        return cache[key].category;
    }
    let category: FieldCategory;
    if (subTypeNodeId.namespace === 0 && subTypeNodeId.value <= 29) {
        // well known node ID !
        switch (subTypeNodeId.value) {
            case 22 /* Structure */:
                category = FieldCategory.complex;
                break;
            case 29 /* Enumeration */:
                category = FieldCategory.enumeration;
                break;
            default:
                category = FieldCategory.basic;
                break;
        }
        return category;
    }
    // must drill down ...
    return await findDataTypeCategory(session, cache, subTypeNodeId);
}

async function findDataTypeBasicType(
    session: IBasicSession,
    cache: { [key: string]: CacheForFieldResolution },
    dataTypeNodeId: NodeId
): Promise<TypeDefinition> {
    const subTypeNodeId = await findSuperType(session, dataTypeNodeId);

    debugLog("subTypeNodeId  of ", dataTypeNodeId.toString(), " is ", subTypeNodeId.toString());

    const key = subTypeNodeId.toString();
    if (cache[key]) {
        return cache[key].schema;
    }
    if (subTypeNodeId.namespace === 0 && subTypeNodeId.value < 29) {
        switch (subTypeNodeId.value) {
            case 22: /* Structure */
            case 29 /* Enumeration */:
                throw new Error("Not expecting Structure or Enumeration");
            default:
                break;
        }
        const nameDataValue: DataValue = await session.read({
            attributeId: AttributeIds.BrowseName,
            nodeId: subTypeNodeId
        });
        const name = nameDataValue.value.value.name!;
        return getBuildInType(name);
    }
    // must drill down ...
    return await findDataTypeBasicType(session, cache, subTypeNodeId);
}


export interface CacheForFieldResolution {
    fieldTypeName: string;
    schema: TypeDefinition;
    category: FieldCategory;
}

async function readBrowseName(session: IBasicSession, nodeId: NodeId): Promise<string> {
    const dataValue = await session.read({ nodeId, attributeId: AttributeIds.BrowseName });
    if (dataValue.statusCode !== StatusCodes.Good) {
        const message =
            "cannot extract BrowseName of nodeId = " + nodeId.toString() + " statusCode = " + dataValue.statusCode.toString();
        debugLog(message);
        throw new Error(message);
    }
    return dataValue.value!.value.name;
}

async function resolveFieldType(
    session: IBasicSession,
    dataTypeNodeId: NodeId,
    dataTypeFactory: DataTypeFactory,
    cache: { [key: string]: CacheForFieldResolution }
): Promise<CacheForFieldResolution | null> {
    if (dataTypeNodeId.namespace === 0 && dataTypeNodeId.value === 22) {
        return null;
    }
    const key = dataTypeNodeId.toString();
    const v = cache[key];
    if (v) {
        return v;
    }

    if (dataTypeNodeId.value === 0) {
        const v3: CacheForFieldResolution = {
            category: FieldCategory.basic,
            fieldTypeName: "Variant",
            schema: dataTypeFactory.getSimpleType("Variant")
        };
        cache[key] = v3;
        return v3;
    }

    const fieldTypeName = await readBrowseName(session, dataTypeNodeId);

    let schema: TypeDefinition | undefined;
    let category: FieldCategory = FieldCategory.enumeration;

    if (dataTypeFactory.hasStructuredType(fieldTypeName!)) {
        schema = dataTypeFactory.getStructuredTypeSchema(fieldTypeName);
        category = FieldCategory.complex;
    } else if (dataTypeFactory.hasSimpleType(fieldTypeName!)) {
        category = FieldCategory.basic;
        schema = dataTypeFactory.getSimpleType(fieldTypeName!);
    } else if (dataTypeFactory.hasEnumeration(fieldTypeName!)) {
        category = FieldCategory.enumeration;
        schema = dataTypeFactory.getEnumeration(fieldTypeName!)!;
    } else {
        debugLog(" type " + fieldTypeName + " has not been seen yet, let resolve it");
        category = await findDataTypeCategory(session, cache, dataTypeNodeId);
        debugLog(" type " + fieldTypeName + " has not been seen yet, let resolve it => (category = ", category, " )");

        switch (category) {
            case FieldCategory.basic:
                schema = await findDataTypeBasicType(session, cache, dataTypeNodeId);
                /* istanbul ignore next */
                if (!schema) {
                    console.log("Cannot find basic type " + fieldTypeName);
                }
                break;
            default:
            case FieldCategory.enumeration:
            case FieldCategory.complex:
                const dataTypeDefinitionDataValue = await session.read({
                    attributeId: AttributeIds.DataTypeDefinition,
                    nodeId: dataTypeNodeId
                });

                /* istanbul ignore next */
                if (dataTypeDefinitionDataValue.statusCode !== StatusCodes.Good) {
                    throw new Error(" Cannot find dataType Definition ! with nodeId =" + dataTypeNodeId.toString());
                }
                const definition = dataTypeDefinitionDataValue.value.value;

                if (category === FieldCategory.enumeration) {
                    if (definition instanceof EnumDefinition) {
                        const e = new EnumerationDefinitionSchema({
                            enumValues: definition.fields,
                            name: fieldTypeName
                        });
                        dataTypeFactory.registerEnumeration(e);

                        schema = e;
                    }
                } else {
                    schema = await convertDataTypeDefinitionToStructureTypeSchema(
                        session,
                        dataTypeNodeId,
                        fieldTypeName,
                        definition,
                        dataTypeFactory,
                        cache
                    );
                }
                // xx const schema1 = dataTypeFactory.getStructuredTypeSchema(fieldTypeName);
                break;
        }
    }

    /* istanbul ignore next */
    if (!schema) {
        throw new Error(
            "expecting a schema here fieldTypeName=" + fieldTypeName + " " + dataTypeNodeId.toString() + " category = " + category
        );
    }

    const v2: CacheForFieldResolution = {
        category,
        fieldTypeName,
        schema
    };
    cache[key] = v2;
    return v2;
}

async function _setupEncodings(
    session: IBasicSession,
    dataTypeNodeId: NodeId,
    schema: StructuredTypeSchema
): Promise<StructuredTypeSchema> {
    // read abstract flag
    const isAbstractDV = await session.read({ nodeId: dataTypeNodeId, attributeId: AttributeIds.IsAbstract });
    schema.dataTypeNodeId = dataTypeNodeId;
    schema.id = dataTypeNodeId;

    if (isAbstractDV.statusCode === StatusCodes.Good && isAbstractDV.value.value === false) {
        const encodings = await _findEncodings(session, dataTypeNodeId);
        schema.encodingDefaultBinary = makeExpandedNodeId(encodings.binaryEncodingNodeId);
        schema.encodingDefaultXml = makeExpandedNodeId(encodings.xmlEncodingNodeId);
        schema.encodingDefaultJson = makeExpandedNodeId(encodings.jsonEncodingNodeId);
    }
    return schema;
}

export async function convertDataTypeDefinitionToStructureTypeSchema(
    session: IBasicSession,
    dataTypeNodeId: NodeId,
    name: string,
    definition: DataTypeDefinition,
    dataTypeFactory: DataTypeFactory,
    cache: { [key: string]: CacheForFieldResolution }
): Promise<StructuredTypeSchema> {
    if (definition instanceof StructureDefinition) {
        const fields: FieldInterfaceOptions[] = [];

        const isUnion = definition.structureType === StructureType.Union;

        switch (definition.structureType) {
            case StructureType.Union:
                // xx console.log("Union Found : ", name);
                fields.push({
                    fieldType: "UInt32",
                    name: "SwitchField"
                });
                break;
            case StructureType.Structure:
            case StructureType.StructureWithOptionalFields:
                break;
        }

        let switchValue = 1;
        let switchBit = 0;

        const bitFields: { name: string; length?: number }[] | undefined = isUnion ? undefined : [];

        for (const fieldD of definition.fields!) {
            const rt = (await resolveFieldType(session, fieldD.dataType, dataTypeFactory, cache))!;
            if (!rt) {
                console.log("convertDataTypeDefinitionToStructureTypeSchema cannot handle field", fieldD.name, "in", name);
                continue;
            }
            const { schema, category, fieldTypeName } = rt;

            const field: FieldInterfaceOptions = {
                fieldType: fieldTypeName!,
                name: fieldD.name!,
                schema
            };

            if (fieldD.isOptional) {
                field.switchBit = switchBit++;
                bitFields?.push({ name: fieldD.name! + "Specified", length: 1 });
            }
            if (isUnion) {
                field.switchValue = switchValue;
                switchValue += 1;
            }

            assert(fieldD.valueRank === -1 || fieldD.valueRank === 1 || fieldD.valueRank === 0);
            if (fieldD.valueRank === 1) {
                field.isArray = true;
            } else {
                field.isArray = false;
            }
            field.category = category;
            field.schema = schema;
            fields.push(field);
        }

        const a = await resolveFieldType(session, definition.baseDataType, dataTypeFactory, cache);
        const baseType = a ? a.fieldTypeName : "ExtensionObject";

        const os = new StructuredTypeSchema({
            baseType,
            bitFields,
            fields,
            id: 0,
            name
        });
        const structuredTypeSchema = await _setupEncodings(session, dataTypeNodeId, os);
        return structuredTypeSchema;
    }
    throw new Error("Not Implemented");
}
