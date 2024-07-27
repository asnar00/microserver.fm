// ᕦ(ツ)ᕤ
// fnf.fm.ts
// feature-normal-form typescript
// this should actually all be fm.ts!!!
// author: asnaroo

import * as os from "./os.js";

const s_verbose = false;

function vlog(...args: any[]) {
    if (s_verbose) { console.log(...args); }
}

const s_cwd = os.cwd();
const s_parentFolder = os.dirname(s_cwd);
const s_buildFolder = s_parentFolder.replace("source", "build/fnf");
const s_importFolder = s_parentFolder + "/ts/import";
console.log("import folder", s_importFolder);
let s_declarations : Map<string, Declaration> = new Map();
let s_sourceMap : Map<string, number[]> = new Map();


// Check if a filename has been provided as an argument
if (os.nArgs() < 1) {
    console.error("Usage: deno run --allow-read fnf.fm.ts <filename>");
    os.exit(1);
}

function fnfToTsFilename(fnfFilename: string) : string {
    return fnfFilename.replaceAll(".md", ".fm.ts").replaceAll("/fnf/", "/ts/fnf/");
}

function tsToFnfFilename(tsFilename: string) : string {
    return tsFilename.replaceAll(".fm.ts", ".md").replaceAll("/ts/fnf/", "/fnf/");
}

class Declaration {
    keyword: string = "";
    funcName: string = "";
    funcParams: string = "";
    funcResult: string = "";
    constructor(keyword: string, funcName: string, funcParams: string, funcResult: string) {
        this.keyword = keyword;
        this.funcName = funcName;
        this.funcParams = funcParams;
        this.funcResult = funcResult;
    }
    toString() : string {
       return `declare const ${this.funcName}: (${this.funcParams}) => ${this.funcResult};`;
    }
    fromDeclString(declString: string) {
        const regexp = /declare\s+const\s+(\w+):\s+\(([^)]*)\)\s+=>\s+([^;]+);/;
        const match = declString.match(regexp);
        if (match) {
            this.funcName = match[1];
            this.funcParams = match[2];
            this.funcResult = match[3];
        } else {
            vlog("No match found:", declString);
        }
    }
}

function getDeclarations(code: string) : Declaration[] {
    const regex = /@(\w+)\s+(\w+)\s*\((.*?)\)\s*(?::\s*(\w+))?\s*\{/g;
    const results = [];
    let declarations : Declaration[] = [];
    for (const match of code.matchAll(regex)) {
        const keyword = match[1];
        if (keyword == "def") {
            const funcName = match[2];
            const funcParams = match[3];
            const funcResult = match[4] || 'void'; 
            declarations.push(new Declaration(keyword, funcName, funcParams, funcResult));
        }
    }
    return declarations;
}

// look through code, find all function names from the declarations so far
function findFunctions(code: string): string {
    let handled: string[] = [];
    let result: string = "";
    // regexp that matches any alphaNumberic word followed by "(", but not preceded by a "."
    const regex = /(?<!\.)\b(\w+)\(/g;
    // find all matches
    const results = [];
    for (const match of code.matchAll(regex)) {
        const funcName = match[1];
        if (!handled.includes(funcName)) {
            handled.push(funcName);
            if (s_declarations.has(funcName)) {
                const decl : Declaration = s_declarations.get(funcName)!;
                result += decl.toString() + "\n";
            } else {
                vlog("Function not found:", funcName);
            }
        }
    }
    return result;
}

function fixFeatureCode(code: string, filename: string) : string {
    const relPath = os.relativePath(filename, s_cwd);
    let importStr = `import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "${relPath}/util/fm.js";`;
    // extract feature names
    const match = code.match(/feature\s+(\w+)\s*(?:extends\s+(\w+))?/);
    if (match) {
        const featureName = match[1];
        const parentFeatureName = match[2] || "";  // Default to empty string if not present
        code = code.replaceAll(featureName, "_"+featureName);
        if (parentFeatureName != "") {
            code = code.replaceAll(parentFeatureName, "_"+parentFeatureName);
            if (parentFeatureName != "Feature") {
                importStr += `\nimport { _${parentFeatureName} } from "../${parentFeatureName}.fm.js";`;
            }
        }
        // replace feature X [extends Y]; with feature X extends Y {
        code = code.replace(/\bfeature\s+(\w+)\s*(extends\s+\w+)?\s*;/g, "feature $1 $2 {");
        code += "\n}\n";
    }

    code = code.replace(/^\s*feature\b/gm, '@feature export class');
    code = code.replace(/^\s*on\b/gm, '@on');
    code = code.replace(/^\s*def\b/gm, '@def');
    code = code.replace(/^\s*replace\b/gm, '@replace');
    code = code.replace(/^\s*after\b/gm, '@after');
    code = code.replace(/^\s*before\b/gm, '@before');
    code = code.replace(/^\s*struct\b/gm, '@struct');
    code = code.replace(/^\s*extend\b/gm, '@extend');
   
    const declarations = getDeclarations(code);
    for(const decl of declarations) {
        s_declarations.set(decl.funcName, decl);
    }

    const functionDecls = findFunctions(code);

    const featureName = os.basename(filename).replaceAll(".fm.ts", "");
    const loadModuleCode = `export function _import() { console.log("${featureName}._import()"); }`;

    code = importStr + "\n\n" + loadModuleCode + "\n\n" + functionDecls + "\n" + code;
    return code;
}

function convertMarkdownToCode(markdown: string, mdFilename: string) : string {
    const filename = fnfToTsFilename(mdFilename);
    let lineMap : number[] = [];        // maps 0-based output line number to markdown line number
    let testLineMap : number[] = [];    // maps test lines to markdown line numbers
    let prefix = `// ᕦ(ツ)ᕤ\n// ${filename.replaceAll(s_parentFolder, "")}\n// created from ${mdFilename.replaceAll(s_parentFolder, "")}\n\n`;
    let code = "";
    let testCode = "";
    // split markdown into lines, test cases separated into testCode
    const lines = markdown.split("\n");
    for(let i=0; i < lines.length; i++) {
        let line = lines[i];
        if (line.startsWith("    ")) {
            line = line.substring(4).trimEnd();
            if (line.indexOf("==>") >= 0) {
                const parts = line.split("==>").map(p => p.trim());
                let outLine = line;
                if (parts.length == 1 || parts[1] == "") {
                    outLine = `    fm._output(await ${parts[0]}, ${i+1});`;
                } else if (parts.length == 2) {
                    outLine = `    fm._assert(await ${parts[0]}, ${parts[1]}, ${i+1});`;
                }
                testCode += outLine + "\n";
                testLineMap.push(i+1);
            } else {
                code += line + "\n";
                lineMap.push(i+1);
            }
        }
    }

    // affix line numbers to all code and test code
    code = code.split("\n").map((line, i) => lineMap[i] ? `${line} //@ ${lineMap[i]}` : line).join("\n");
    testCode = testCode.split("\n").map((line, i) => testLineMap[i] ? `${line} //@ ${testLineMap[i]}` : line).join("\n");
    
    code = fixFeatureCode(code, filename);

    const testName = os.basename(filename).replaceAll(".fm.ts", "") + "_test";
    const testSourceLine = `    fm._source("${mdFilename.replaceAll(s_parentFolder, "")}");`;
    if (code.indexOf("@feature") >= 0) {
        // find index of last "}" in code
        let i = code.length-1; while(i >= 0 && code[i] != "}") i--;
        // insert test code before last "}"
        testCode = `async _test() {\n${testSourceLine}\n${testCode}}\n`;
        code = code.substring(0, i) + testCode + code.substring(i);
    } else {
        code += `\nexport async function ${testName}() {\n${testSourceLine}\n${testCode}}\n"`;
    }

    // update the source map
    clearSourceMaps(filename);
    let result = prefix + code;
    const resultLines = result.split("\n");
    for(let iLine=0; iLine < resultLines.length; iLine++) {
        let resultLine = resultLines[iLine];
        const iComment = resultLine.indexOf("//@ ");
        if (iComment >= 0) {
            const originalLine = parseInt(resultLine.substring(iComment+4));
            setSourceMap(filename, iLine+1, originalLine);
            resultLine = resultLine.substring(0, iComment);
            resultLines[iLine] = resultLine;
        }
    }
    return resultLines.join("\n");
}

function writeImportFile(mdFilename: string) {
    const featureName = os.basename(mdFilename).replaceAll(".md", "");
    const importFileOut = s_importFolder + `/${featureName}.fm.ts`;
    const importFile = os.relativePath(importFileOut, fnfToTsFilename(mdFilename).replaceAll(".ts", ".js"));
    let importStr = `import { _${featureName} } from '${importFile}';`;
    const subFolder = mdFilename.replace(".md", "");
    if (os.isDirectory(subFolder)) {
        const files = os.filesInFolder(subFolder);
        // sort files by ascending creation date
        files.sort((a, b) => os.creationDate(a) - os.creationDate(b));
        for(const file of files) {
            const subFeatureName = os.basename(file).replaceAll(".md", "");
            importStr += `\nimport './${subFeatureName}.fm.js';`;
        }
    }
    os.writeFile(importFileOut, importStr);
}

function writeImportAllFile() {
    const fnfFolder = s_parentFolder + "/fnf";
    let files = os.filesInFolder(fnfFolder);
    files = files.sort((a, b) => os.creationDate(a) - os.creationDate(b));
    let importStr = "";
    for(const file of files) {
        const featureName = os.basename(file).replaceAll(".md", "");
        importStr += `import './${featureName}.fm.js';\n`;
    }
    const importOutFile = s_importFolder + "/all.ts";
    os.writeFile(importOutFile, importStr);
}

function processFile(filename: string, sourceFile: string) {
    const outFile = fnfToTsFilename(filename);
    const outDate = os.lastWriteDate(outFile);
    const sourceDate = os.lastWriteDate(sourceFile);
    if (sourceDate > outDate || os.lastWriteDate(filename) > outDate) {
        vlog(`  Processing ${filename}`);
        const markdown = os.readFile(filename);
        const code = convertMarkdownToCode(markdown, filename);
        os.writeFile(outFile, code);
        //writeImportFile(filename);
    }
    return outFile;
}

function processBuildLog(log: string) : string {
    const lines : string[] = log.split("\n");
    let out = "";
    for(const line of lines) {
        const index = line.indexOf(": error");
        let outLine = line;
        if (index >= 0) {
            const source = os.resolve(line.substring(0, index));
            // search backwards from index for first "("
            let i = index;
            while(i >= 0 && line[i] != "(") i--;
            const filename = line.substring(0, i);
            const iComma = line.indexOf(",", i);
            const lineNumber = parseInt(line.substring(i+1, iComma));
            const colNumber = parseInt(line.substring(iComma+1, index-1));
            const [mdPath, mdLine]= getSourceMap(filename, lineNumber);
            outLine = `${mdPath}(${mdLine},${colNumber+4}): error: ${line.substring(index+7)}`;
        }
        out += outLine + "\n";
    }
    return out.trim();
}

async function buildAllFiles() : Promise<string>{
    vlog("----- build -----");
    const cmdOut = await os.runCommand(["tsc"]);
    return cmdOut.output;
}

async function processFolder(folder: string) {
    vlog("Processing folder", folder);
    const sourceFile = folder.replaceAll("/fnf", "/ts/util/fnf.ts");
    let files = await os.allFilesInFolderRec(folder, ".md");
    files.sort((a, b) => os.creationDate(a) - os.creationDate(b));
    for(const file of files) {
        await processFile(file, sourceFile);
    }
}

function saveDeclarations() {
    const decls : string[] = [];
    for(const [key, value] of s_declarations) {
        decls.push(value.toString());
    }
    os.writeFile(s_buildFolder + "/declarations.d.ts", decls.join("\n"));
}

function loadDeclarations() {
    const declFile = s_buildFolder + "/declarations.d.ts";
    if (os.fileExists(declFile)) {
        const decls = os.readFile(declFile).split("\n");
        for(const decl of decls) {
            const d = new Declaration("", "", "", "");
            d.fromDeclString(decl);
            s_declarations.set(d.funcName, d);
        }
    }
}

function clearSourceMaps(filename: string): void {
    const fname = filename.replaceAll(s_parentFolder, "");
    s_sourceMap.forEach((value, key) => {
        if (key.includes(fname)) {
            s_sourceMap.delete(key);
        }
    });
}

function setSourceMap(tsFile: string, tsLine: number, mdLine: number) {
    tsFile = tsFile.replaceAll(s_parentFolder, "");
    let lines: number[] = s_sourceMap.get(tsFile) || [];
    if (tsLine >= lines.length) {
        lines = lines.concat(new Array(tsLine - lines.length + 1).fill(0));
    }
    lines[tsLine] = mdLine;
    s_sourceMap.set(tsFile, lines);
}

function getSourceMap(tsFile: string, tsLine: number) : [string, number] {
    tsFile = "/ts/" + tsFile;
    const mdFile = tsToFnfFilename(tsFile);
    tsFile = tsFile.replaceAll(s_parentFolder, "");
    const lines: number[] = s_sourceMap.get(tsFile) || [];
    if (tsLine < lines.length) { return [mdFile, lines[tsLine]]; }
    return [tsFile, tsLine]; // not found
}

function saveSourceMap(jsonFilename: string) {
    const json = JSON.stringify(Array.from(s_sourceMap.entries()));
    os.writeFile(jsonFilename, json);
}

function loadSourceMap(jsonFilename: string) {
    if (os.fileExists(jsonFilename)) {
        const json = os.readFile(jsonFilename);
        const entries = JSON.parse(json);
        s_sourceMap = new Map(entries);
    }
}

async function main() {
    vlog("cwd", s_cwd);
    const folder = s_cwd.replace("/ts", "/fnf");
    vlog("folder", folder);
    loadSourceMap(s_buildFolder + "/sourceMap.json");
    loadDeclarations();
    await processFolder(folder);
    saveDeclarations();
    saveSourceMap(s_buildFolder + "/sourceMap.json");
    //writeImportAllFile();
    const result = await buildAllFiles();
    const log = processBuildLog(result);
    if (log != "") {
        console.log("--------- build errors ---------");
        console.log(log);
        console.log("--------------------------------");
    } else {
        console.log("--------- build successful ---------");
    }
}

main();