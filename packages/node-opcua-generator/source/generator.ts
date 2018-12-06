import * as fs from "fs";
import { assert } from "node-opcua-assert";
import { checkDebugFlag, make_debugLog } from "node-opcua-debug";
import { ConstructorFunc } from "node-opcua-factory";
import { normalize_require_file } from "node-opcua-utils";
import * as path from "path";
import { promisify } from "util";

const debugLog = make_debugLog(__filename);
const doDebug = checkDebugFlag(__filename);
import chalk from "chalk";

import * as prettier from "prettier";
import * as ts from "typescript";

import { get_class_jscript_filename, get_class_tscript_filename, produce_tscript_code } from "./factory_code_generator";

// tslint:disable:no-console

const fileExists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

/**
 * @module opcua.miscellaneous
 * @class Factory
 * @static
 */

function compileTscriptCode(typescriptFilename: string): string {

    const content = fs.readFileSync(typescriptFilename, "ascii");

    const compilerOptions = {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2016,

        skipLibCheck: true,

        declaration: true,
        sourceMap: true,
        strict: true,

        noImplicitAny: true,
        noImplicitReturns: true
    };

    const res1 = ts.transpileModule(content, { compilerOptions, moduleName: "myModule2" });

    const javascriptFilename = typescriptFilename.replace(/\.ts$/, ".js");
    const sourcemapFilename = typescriptFilename.replace(/\.ts$/, ".js.map");

    fs.writeFileSync(javascriptFilename, res1.outputText, "ascii");
    fs.writeFileSync(sourcemapFilename, res1.sourceMapText, "ascii");

    return res1.outputText;
}

export const verbose = false;

function get_caller_source_filename() {
    // let's find source code where schema file is described
    // to do make change this
    // the line has the following shape:
    //      'at blah (/home/toto/myfile.js:53:34)'
    const err = new Error("");
    const re = /.*\((.*):[0-9]*:[0-9]*\)/g;
    if (!err.stack) {
        return "";
    }
    console.log(err.stack.split("\n"));
    const ma = err.stack.split("\n");
    let m = re.exec(ma[8]);
    if (!m) {
        m = re.exec(ma[4]);
    }
    if (!m) {
        return "../";
        // throw new Error("Invalid: cannot find caller_source_filename : " + err.stack + "\n =============");
    }
    const schemaFile = m[1];
    return schemaFile;
}

export async function generateCode(schemaName: string, localSchemaFile: string, generatedCodeFolder?: string) {
    const schemaTypescriptFile = schemaName + "_Schema.ts";

    const currentFolder = process.cwd();
    //
    const localSchemaFileExists = await fileExists(localSchemaFile);

    if (!localSchemaFileExists) {
        throw new Error(`Cannot find source file for schema ${schemaTypescriptFile}`);
    }

    if (!generatedCodeFolder) {
        generatedCodeFolder = path.join(currentFolder, "_generated_");
    }

    const generatedCodeFolderExists = await fileExists(generatedCodeFolder);
    if (!generatedCodeFolderExists) {
        await mkdir(generatedCodeFolder);
    }

    const generatedTypescriptSource = path.join(generatedCodeFolder, "_" + schemaName + ".ts");

    const generatedSourceExists = await fileExists(generatedTypescriptSource);

    let schemaFileIsNewer = false;
    let codeGeneratorIsNewer = true;

    if (generatedSourceExists) {

        const generatedSourceMtime = new Date(fs.statSync(generatedTypescriptSource).mtime).getTime();

        const schemaFileMtime = new Date(fs.statSync(localSchemaFile).mtime).getTime();

        schemaFileIsNewer = (generatedSourceMtime <= schemaFileMtime);

        let codeGeneratorScript = path.join(__dirname, "factory_code_generator.ts");
        if (!fs.existsSync(codeGeneratorScript)) {
            codeGeneratorScript = path.join(__dirname, "factory_code_generator.js");
        }

        assert(fs.existsSync(codeGeneratorScript), "cannot get code factory_code_generator" + codeGeneratorScript);
        const codeGeneratorScriptMtime = new Date(fs.statSync(codeGeneratorScript).mtime).getTime();

        codeGeneratorIsNewer = (generatedSourceMtime <= codeGeneratorScriptMtime);
    }
    const generatedSourceIsOutdated = (!generatedSourceExists || codeGeneratorIsNewer || schemaFileIsNewer);

    if (generatedSourceIsOutdated) {

        const module = await import(localSchemaFile);
        const schema = module[schemaName + "_Schema"];

        if (!schema) {
            throw new Error(`module must export a Schema with name ${schemaName}_Schema  in ${generatedTypescriptSource}`);
        }

        debugLog(" generated_source_is_outdated ", schemaName, " to ", generatedTypescriptSource);
        if (exports.verbose) {
            console.log(" generating ", schemaName, " in ", generatedTypescriptSource);
        }
        const localSchemaFile1 = path.join("../schemas", schemaName + "_schema");
        produce_tscript_code(schema, localSchemaFile1, generatedTypescriptSource);
    }
}

export async function generateTypeScriptCodeFromSchema(schemaName: string) {
    const currentFolder = process.cwd();
    const schemafilename = path.join(currentFolder, "schemas", schemaName + "_schema.ts");
    const generatedCodeFolder = path.join(process.cwd(), "_generated_");
    await generateCode(schemaName, schemafilename, generatedCodeFolder);
}

export async function registerObject(schema: string, generateCodeFolder?: string): Promise<ConstructorFunc | null> {

    if (!schema.split) {
        console.log("error !", schema);
        // xx process.exit(1);
    }
    // we expect <schema>|<hint>
    const hintSchema = schema.split("|");
    if (hintSchema.length === 1) {
        // no hint provided
        const callerFolder = get_caller_source_filename();

        const defaultHint = path.join(path.dirname(callerFolder), "schemas");
        hintSchema.unshift(defaultHint);
        generateCodeFolder = generateCodeFolder
          ? generateCodeFolder
          : path.join(path.dirname(callerFolder), "_generated_");
    }

    const folderHint = hintSchema[0];
    schema = hintSchema[1];

    const schemaName = schema + "_Schema";
    const schemaFile = path.join(folderHint, schema + "_schema.ts");
    const module = await import(schemaFile);
    if (!module) {
        throw new Error("cannot find " + schemaFile);
    }
    const schemaObj = module[schemaName];

    await generateCode(schemaName, schemaFile, generateCodeFolder);

    return null;
}

export function unregisterObject(schema: any, folder: string) {
    const generateTypeScriptSource = get_class_tscript_filename(schema.name, folder);
    if (fs.existsSync(generateTypeScriptSource)) {
        fs.unlinkSync(generateTypeScriptSource);
        assert(!fs.existsSync(generateTypeScriptSource));
    }
}
