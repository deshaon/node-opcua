const opcua = require("..");
const should = require("should");
describe("module 'node-opcua' module sanity test", function () {
    it("module 'node-opcua' should not export any null properties", function () {
        Object.keys(opcua).forEach(function (x) {
            should.exist(opcua[x], x + " should be defined");
        });
    });
});
