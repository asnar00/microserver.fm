// ᕦ(ツ)ᕤ
// fnf.fm.ts
// feature-normal-form typescript
// author: asnaroo

import * as os from "./os.ts";

const cwd = os.cwd();

// Check if a filename has been provided as an argument
if (os.nArgs() < 1) {
    console.error("Usage: deno run --allow-read fnf.fm.ts <filename>");
    os.exit(1);
}

function fnfToTsFilename(fnfFilename: string) : string {
    return fnfFilename.replaceAll(".md", ".fm.ts").replaceAll("/fnf/", "/ts/fnf/");
}

function fixFeatureCode(code: string) : string {
    let importStr = `import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "${cwd}/util/fm.ts";`;
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
    } 

    code = code.replace(/^\s*feature\b/gm, '@feature export class');
    code = code.replace(/^\s*on\b/gm, '@on');
    code = code.replace(/^\s*def\b/gm, '@def');
    code = code.replace(/^\s*replace\b/gm, '@replace');
    code = code.replace(/^\s*after\b/gm, '@after');
    code = code.replace(/^\s*before\b/gm, '@before');
    code = code.replace(/^\s*struct\b/gm, '@struct');
    code = code.replace(/^\s*extend\b/gm, '@extend');
    // get a list of all functions declared in the feature
    const regex = /@(\w+)\s+(\w+)\s*\((.*?)\)\s*(?::\s*(\w+))?\s*\{/g;
    const results = [];
    let declarations = "";
    for (const match of code.matchAll(regex)) {
        const keyword = match[1];
        const funcName = match[2];
        const funcParams = match[3];
        const funcResult = match[4] || 'void'; 
        const decl = `export declare const ${funcName}: (${funcParams}) => ${funcResult};`;
        declarations += decl + "\n";
    }

    code = importStr + "\n\n" + declarations + "\n" + code;
    return code;
}

function convertMarkdownToCode(markdown: string, mdFilename: string) : string {
    const filename = fnfToTsFilename(mdFilename);
    let lineMap : number[] = [];        // maps 0-based output line number to markdown line number
    let testLineMap : number[] = [];    // maps test lines to markdown line numbers
    const importStr = `import { _source, _output, _assert }  from "${cwd}/util/test.js";`;
    const prefix = `// ᕦ(ツ)ᕤ\n// ${filename}\n// created from ${mdFilename}\n\n${importStr}\n\n_source("${mdFilename}");\n\n`;
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
                    outLine = `    _output(await ${parts[0]}, ${i+1});`;
                } else if (parts.length == 2) {
                    outLine = `    _assert(await ${parts[0]}, ${parts[1]}, ${i+1});`;
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
    
    code = fixFeatureCode(code);

    const testName = os.basename(filename).replaceAll(".fm.ts", "") + "_test";
    code += `\nexport async function ${testName}() {\n` + testCode + "}\n";
    return prefix + code;
}

async function processFile(filename: string, sourceFile: string) {
    const outFile = fnfToTsFilename(filename);
    const outDate = os.datestamp(outFile);
    const sourceDate = os.datestamp(sourceFile);
    if (sourceDate > outDate || os.datestamp(filename) > outDate) {
        console.log(`Processing ${filename}`);
        const markdown = os.readFile(filename);
        const code = convertMarkdownToCode(markdown, filename);
        os.writeFile(outFile, code);
    }
    return outFile;
}

function processBuildLog(log: string) : string {
    const lines : string[] = log.split("\n");
    let sourcePath = "";
    let sourceLines : string[] = [];
    let mdPath = "";
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
            if (filename != sourcePath) {
                sourcePath = os.resolve(filename);
                sourceLines = os.readFile(sourcePath).split("\n");
                // find the line that starts with "fm.source" using findIndex
                const iSource = sourceLines.findIndex(l => l.startsWith("_source"));
                if (iSource >= 0) {
                    const iQuote = sourceLines[iSource].indexOf("\"");
                    const iEndQuote = sourceLines[iSource].indexOf("\"", iQuote+1);
                    mdPath = sourceLines[iSource].substring(iQuote+1, iEndQuote);
                } else {
                    mdPath = sourcePath;
                }
            }
            const sourceLine = sourceLines[lineNumber-1];
            const iComment = sourceLine.indexOf("//@ ");
            if (iComment >= 0) {
                const originalLine = parseInt(sourceLine.substring(iComment+4));
                outLine = `${mdPath}(${originalLine},${colNumber+4}): error: ${line.substring(index+7)}`;
            }
        }
        out += outLine + "\n";
    }
    return out;
}

async function buildFile(filename: string) : Promise<string>{
    const cmdOut = await os.runCommand(["tsc", filename]);
    return cmdOut.output;
}

async function processFolder(folder: string) {
    console.log("Processing folder", folder);
    const sourceFile = folder.replaceAll("/fnf", "/ts/util/fnf.ts");
    const files = await os.allFilesInFolderRec(folder, ".md");
    for(const file of files) {
        console.log("Checking", file.replaceAll(folder+"/", ""));
        await processFile(file, sourceFile);
    }
}

async function main() {
    console.log("cwd", cwd);
    const folder = cwd.replace("/ts", "/fnf");
    console.log("folder", folder);
    await processFolder(folder);
    //const filename = os.arg(0);
    //const outFile = await processFile(filename);
    //const result = await buildFile(outFile);
    //const log = processBuildLog(result);
    //console.log(log);
}

main();