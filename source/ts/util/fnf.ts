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
    return fnfFilename.replaceAll(".fnf.md", ".fm.ts").replaceAll("/fnf/", "/ts/fnf/");
}

function convertMarkdownToCode(markdown: string, mdFilename: string) : string {
    const filename = fnfToTsFilename(mdFilename);
    let lineMap : number[] = [];        // maps 0-based output line number to markdown line number
    let testLineMap : number[] = [];    // maps test lines to markdown line numbers
    const importStr = `import { _source, _output, _assert }  from "${cwd}/util/test.js";`;
    const prefix = `// ᕦ(ツ)ᕤ\n// ${filename}.ts\n// created from ${mdFilename}\n\n${importStr}\n\n_source("${mdFilename}");\n\n`;
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
    
    const testName = os.basename(filename).replaceAll(".fm.ts", "") + "_test";
    code += `\nexport async function ${testName}() {\n` + testCode + "}\n";
    return prefix + code;
}

async function processFile(filename: string) {
    const markdown = os.readFile(filename);
    const code = convertMarkdownToCode(markdown, filename);
    const outFile = fnfToTsFilename(filename);
    os.writeFile(outFile, code);
    console.log(`Wrote ${outFile}`);
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

async function main() {
    console.log("cwd", cwd);
    const filename = os.arg(0);
    const outFile = await processFile(filename);
    const result = await buildFile(outFile);
    const log = processBuildLog(result);
    console.log(log);
}

main();