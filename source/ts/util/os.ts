// ᕦ(ツ)ᕤ
// os.ts
// all server-side stuff encapsulated here; not feature modular
// just do one thing and do it well
// author: asnaroo

import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";
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

export function extension(path: string): string {
    return "." + path.split('.').pop() || '';
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
    console.log("runCommand", cmdAndArgs);
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

export function datestamp(file: string) {
    if (deno_fs.existsSync(file)) {
        const fileInfo = Deno.lstatSync(file);
        return fileInfo.mtime!;
    } else {
        return 0;
    }
}

export async function allFilesInFolderRec(dirPath: string, extension: string): Promise<string[]> {
    const filesWithExtension: string[] = [];
    if (extension.startsWith(".")) { extension = extension.substring(1); }
    for await (const entry of deno_fs.walk(dirPath, { includeDirs: false, exts: [extension] })) {
        if (entry.isFile) {
            filesWithExtension.push(entry.path);
        }
    }
    return filesWithExtension;
}