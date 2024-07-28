// ᕦ(ツ)ᕤ
// os.ts
// all server-side stuff encapsulated here; not feature modular
// just do one thing and do it well
// author: asnaroo

import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_path from "https://deno.land/std@0.156.0/path/mod.ts";
import * as deno_fs from "https://deno.land/std@0.156.0/fs/mod.ts";

export function serve(serveFn: Function, options: { port: number }) {
    deno_http.serve(serveFn, { port: 8000 });
}

export function cwd() {
    return Deno.cwd();
}

export function readFile(path: string): string {
    return Deno.readTextFileSync(path);
}

export function writeFile(path: string, content: string) {
    deno_fs.ensureDirSync(deno_path.dirname(path));
    Deno.writeTextFileSync(path, content);
}

// only writes the file if the contents actually changed. returns true if the file was written, false if the file was not written
export function writeFileIfChanged(path: string, content: string) : boolean {
    if (fileExists(path)) {
        const currentContent = readFile(path);
        if (currentContent == content) { return false; }
    }
    writeFile(path, content);
    return true;
}

export function extension(path: string): string {
    return "." + path.split('.').pop() || '';
}

export function dirname(path: string): string {
    return deno_path.dirname(path);
}

export function basename(path: string): string {
    return deno_path.basename(path);
}

export function resolve(path: string): string {
    return deno_path.resolve(path);
}

export function nArgs() : number {
    return Deno.args.length;
}

export function arg(index: number) : string {
   return Deno.args[index];
}

export function exit(code: number) { 
    Deno.exit(code);
}

export class CmdOutput {
    code: number;
    output: string;
    error: string;
    constructor(code: number, output: string, error: string) {
        this.code = code;
        this.output = output;
        this.error = error;
    }
}

export async function runCommand(cmdAndArgs: string[]) : Promise<CmdOutput> {
    const cmd = Deno.run({
        cmd: cmdAndArgs,  // Command and arguments in an array
        stdout: "piped",  // Capture standard output
        stderr: "piped",  // Capture standard error
        env: Deno.env.toObject(),
    });
    
    // Wait for the command to complete
    const { code } = await cmd.status();
    
    // Reading the outputs
    const rawOutput = await cmd.output();
    const rawError = await cmd.stderrOutput();
    const output = new TextDecoder().decode(rawOutput); 
    const error = new TextDecoder().decode(rawError);
    return new CmdOutput(code, output, error);
}

export function lastWriteDate(file: string) : number {
    if (deno_fs.existsSync(file)) {
        const fileInfo = Deno.lstatSync(file);
        return fileInfo.mtime!.getTime()/1000;
    } else {
        return 0;
    }
}

export function creationDate(file: string) : number {
    if (deno_fs.existsSync(file)) {
        const fileInfo = Deno.lstatSync(file);
        return fileInfo.birthtime!.getTime()/1000;
    } else {
        return 0;
    }
}

export function filesInFolder(dirPath: string): string[] {
    const files: string[] = [];
    for (const dirEntry of Deno.readDirSync(dirPath)) {
        if (dirEntry.isFile) {
            files.push(dirPath + "/" + dirEntry.name);
        }
    }
    return files;
}

export function isDirectory(dirPath: string) : boolean {
    // true if dirPath exists and is a directory
    return deno_fs.existsSync(dirPath) && Deno.lstatSync(dirPath).isDirectory;
}

export function fileExists(filePath: string) : boolean {
    return deno_fs.existsSync(filePath);
}

export function relativePath(fromPath: string, toPath: string) : string {
    if (!isDirectory(fromPath)) { fromPath = dirname(fromPath); }
    return deno_path.relative(fromPath, toPath);
}

export function allFilesInFolderRec(dirPath: string, extension: string): string[] {
    let filesWithExtension: string[] = [];
    if (extension.startsWith(".")) {
        extension = extension.substring(1);
    }
    // Traverse the directory synchronously
    for (const entry of Deno.readDirSync(dirPath)) {
        const filePath = `${dirPath}/${entry.name}`;
        // Check if the entry is a file and has the correct extension
        if (entry.isFile && entry.name.endsWith(`.${extension}`)) {
            filesWithExtension.push(filePath);
        } else if (entry.isDirectory) {
            // Recursively call if it's a directory
            filesWithExtension = filesWithExtension.concat(allFilesInFolderRec(filePath, extension));
        }
    }
    return filesWithExtension;
}