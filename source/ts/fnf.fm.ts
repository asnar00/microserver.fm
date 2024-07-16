// ᕦ(ツ)ᕤ
// fnf.fm.ts
// feature-normal-form typescript
// author: asnaroo

import { basename, resolve } from "https://deno.land/std@0.156.0/path/mod.ts";

// Check if a filename has been provided as an argument
if (Deno.args.length < 1) {
    console.error("Usage: deno run --allow-read fnf.fm.ts <filename>");
    Deno.exit(1);
}

function convertMarkdownToCode(markdown: string, mdFilename: string) : string {
    const filename = basename(mdFilename).replace(".fnf.md", "");
    let lineMap : number[] = [];        // maps 0-based output line number to markdown line number
    let testLineMap : number[] = [];    // maps test lines to markdown line numbers
    const prefix = `// ᕦ(ツ)ᕤ\n// ${filename}.ts\n// created from ${mdFilename}\n\n`;
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
                    outLine = `    _output(await ${parts[0]}, "${mdFilename}:${i+1});"`;
                } else if (parts.length == 2) {
                    outLine = `    _assert(await ${parts[0]}, ${parts[1]}, "${mdFilename}:${i+1});"`;
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
    code = code.split("\n").map((line, i) => `${line} //@ ${lineMap[i]}`).join("\n");
    testCode = testCode.split("\n").map((line, i) => `${line} //@ ${testLineMap[i]}`).join("\n");
    
    const testName = filename + "_test";
    code += `\nasync function ${testName}() {\n` + testCode + "}\n";
    return prefix + code;
}

async function processFile(filename: string) {
    const markdown = await Deno.readTextFileSync(filename);
    const code = convertMarkdownToCode(markdown, filename);
    const outFile = filename.replaceAll(".fnf.md", ".fm.ts");
    await Deno.writeTextFile(outFile, code);
    console.log(`Wrote ${outFile}`);
}

async function main() {
    const filename = resolve(Deno.args[0]);
    await processFile(filename);
}

main();