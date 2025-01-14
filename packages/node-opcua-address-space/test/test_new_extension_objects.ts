import * as path from "path";
import * as should from "should";
import { nodesets } from "node-opcua-nodesets";
import { getExtensionObjectConstructor } from "node-opcua-client-dynamic-extension-object";
import { resolveNodeId } from "node-opcua-nodeid";
//
import { AddressSpace, adjustNamespaceArray } from "..";
import {PseudoSession } from "..";
import { generateAddressSpace } from "../distNodeJS";
import  {spy} from "sinon";

const describe = require("node-opcua-leak-detector").describeWithLeakDetector;
describe("Test Extension Object in pure 1.04 version (only DataTypeDefinition available)", () => {
    let addressSpace: AddressSpace;
    before(async () => {
        addressSpace = AddressSpace.create();
        await generateAddressSpace(addressSpace, [
            nodesets.standard,
            path.join(__dirname, "../test_helpers/test_fixtures/datatype_as_per_1.04.xml")
        ]);
        adjustNamespaceArray(addressSpace);
    });
    after(()=>{
        addressSpace.dispose();
    });

    it("WY1- should extract", async () => {
        const nsA = addressSpace.getNamespaceIndex("http://A");
        const dataTypeNodeId = addressSpace.findDataType("MyStructure", nsA);
        should.exist(dataTypeNodeId);
        const o = addressSpace.constructExtensionObject(dataTypeNodeId, {});
    });

    it("WY2- PseudoSession & getExtensionObjectConstructor ", async () => {
        const session = new PseudoSession(addressSpace);
        const browseSpy = spy(session, "browse");
        const browseNextSpy = spy(session, "browseNext");

        const dataTypeNodeId = resolveNodeId("ns=1;i=3001");
        const F = await getExtensionObjectConstructor(session, dataTypeNodeId);
        should.exist(F)
        F.should.be.a.Function;
        const o = new F({});
        console.log(o.toJSON());
        
        console.log("browseSpy =  ", browseSpy.callCount,"browseNextSpy =  ", browseNextSpy.callCount);
    });
    it("WY3- PseudoSession & getExtensionObjectConstructor with requestedMaxReferencesPerNode", async () => {
        const session = new PseudoSession(addressSpace);
        const browseSpy = spy(session, "browse");
        const browseNextSpy = spy(session, "browseNext");

        session.requestedMaxReferencesPerNode = 2;

        console.log("§§§§§§§§§§§§§§§§§§§§§§§§§§§§§");

        const dataTypeNodeId = resolveNodeId("ns=1;i=3001");
        const F = await getExtensionObjectConstructor(session, dataTypeNodeId);
        should.exist(F)
        F.should.be.a.Function;
        const o = new F({});
        console.log(o.toJSON());   
        console.log("browseSpy =  ", browseSpy.callCount,"browseNextSpy =  ", browseNextSpy.callCount); 

    });
});

