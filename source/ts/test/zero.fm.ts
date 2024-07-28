// ᕦ(ツ)ᕤ
// zero.ts
// author: asnaroo
// compiles zero to typescript

import { _Feature, feature, on, after, before, fm } from "../util/fm.ts";

//-----------------------------------------------------------------------------
// Main

declare const main: () => void;
declare const test: () => void;

@feature class _Main extends _Feature {
    @on test() { }
    @on main() { console.log("ᕦ(ツ)ᕤ"); }
}

//-----------------------------------------------------------------------------
// Lexer

class Lex {
    value: string = "";
    type: string = "";
}

declare const isAlpha: (c: string) => boolean;
declare const isAlphanum: (c: string) => boolean;
declare const isWhitespace: (c: string) => boolean;
declare const isOperator: (c: string) => boolean;
declare const isBrace: (c: string) => boolean;
declare const isPunctuation: (c: string) => boolean;
declare const isQuote: (c: string) => boolean;
declare const isDigit: (c: string) => boolean;
declare const lexer_skip_whitespace: (source: string, i: number) => number;
declare const lexer_try_operator: (source: string, i: number) => [number, Lex]|undefined;
declare const lexer_try_brace: (source: string, i: number) => [number, Lex]|undefined;
declare const lexer_try_punctuation: (source: string, i: number) => [number, Lex]|undefined;
declare const lexer_try_string: (source: string, i: number) => [number, Lex]|undefined;
declare const lexer_try_int: (source: string, i: number) => [number, Lex]|undefined;
declare const lexer_try_name: (source: string, i: number) => [number, Lex]|undefined;
declare const lexer_step: (source: string, i: number) => [number, Lex]|undefined;
declare const lexer_run: (source: string) => Lex[];
declare const lexemes_to_string: (lexemes: Lex[]) => string;

@feature class _Lexer extends _Main {
    @on isAlpha(c: string) : boolean { return /[a-z]/i.test(c); }
    @on isAlphanum(c: string) : boolean { return /[a-z0-9]/i.test(c); }
    @on isWhitespace(c: string) : boolean { return /\s/.test(c); }
    @on isOperator(c: string) : boolean { return /[+\-*\/\^%=(),]/.test(c); }
    @on isBrace(c: string) : boolean { return /[{()}]/.test(c); }
    @on isPunctuation(c: string) : boolean { return /[,;]/.test(c); }
    @on isQuote(c: string) : boolean { return /['"]/.test(c); }
    @on isDigit(c: string) : boolean { return /[0-9]/.test(c); }
    @on lexer_skip_whitespace(source: string, i: number): number {
        while (i < source.length && isWhitespace(source[i])) i++;
        return i;
    }
    @on lexer_try_operator(source: string, i: number): [number, Lex]|undefined {
        if (isOperator(source[i])) return [i+1, { value: source[i], type: "op"}];
    }
    @on lexer_try_brace(source: string, i: number): [number, Lex]|undefined {
        if (isBrace(source[i])) return [i+1, { value: source[i], type: "brace"}];
    }
    @on lexer_try_punctuation(source: string, i: number): [number, Lex]|undefined {
        if (isPunctuation(source[i])) return [i+1, { value: source[i], type: "punc"}];
    }
    @on lexer_try_string(source: string, i: number): [number, Lex]|undefined {
        if (isQuote(source[i])) {
            let j = i;
            while (j < source.length && source[j] !== source[i]) j++;
            return [j+1, { value: source.slice(i, j), type: "string"}];
        }
    }
    @on lexer_try_int(source: string, i: number): [number, Lex]|undefined {
        if (isDigit(source[i])) {
            let j = i;
            while (j < source.length && isDigit(source[j])) j++;
            return [j, { value: source.slice(i, j), type: "int"}];
        }
    }
    @on lexer_try_name(source: string, i: number): [number, Lex]|undefined {
        if (isAlpha(source[i])) {
            let j = i;
            while (j < source.length && isAlphanum(source[j])) j++;
            return [j, { value: source.slice(i, j), type: "name"}];
        }
    }
    @on lexer_step(source: string, i: number): [number, Lex]|undefined {
        i = lexer_skip_whitespace(source, i);
        let rx = lexer_try_operator(source, i); if (rx) return rx;
        rx = lexer_try_brace(source, i); if (rx) return rx;
        rx = lexer_try_punctuation(source, i); if (rx) return rx;
        rx = lexer_try_string(source, i); if (rx) return rx;
        rx = lexer_try_int(source, i); if (rx) return rx;
        rx = lexer_try_name(source, i); if (rx) return rx;
    }
    @on lexer_run(source: string): Lex[] {
        let i = 0;
        let result: Lex[] = [];
        while (i < source.length) {
            const rx = lexer_step(source, i);
            if (rx) {
                const [j, lex] = rx;
                result.push(lex);
                i = j;
            } else {
                throw new Error(`Unexpected character ${source[i]} at position ${i}`);
            }
        }
        return result;
    }
    @on lexemes_to_string(lexemes: Lex[]) {
        let out = "";
        for(let lex of lexemes) {
            out += `{${lex.type}:${lex.value}}`;
        }
        return out;
    }
    @after test() {
        let lexemes = lexer_run("let x=10;");
        let ls = lexemes_to_string(lexemes);
        let success = ls === "{name:let}{name:x}{op:=}{int:10}{punc:;}";
        if (!success) { throw new Error("Lexer test failed"); }
    }
}

//-----------------------------------------------------------------------------
// Parser

declare const parser: (input: string[]) => string;

class AST {                     // Abstract Syntax Tree innit
    type: string ="";
    children: AST[] = [];
    index: number=0;
    lexemes: Lex[] = [];
}


declare const parser_run: (lexemes: Lex[]) => AST;

@feature class _Parser extends _Lexer {
    @on parser_run(lexemes: Lex[]): AST {
        return { type: "root", children: [], index: 0, lexemes: lexemes };
    }
}

/*
OK so lets define our grammar properly here, right?

Here's our grammar rules:

name_list = name | name "," name_list
decl = name_list ":" type ["=" expr]
decl_list = decl | decl "," decl_list
bracketed_decl = "(" decl_list ")"
name_or_op = name | op
signature_item = name_or_op | bracketed_decl
signature = signature_item | signature_item signature
mod = "on" | "after" | "before"
function_decl = mod decl_list "=" signature


    a, b : int = 10
OK we can do this tomorrow but it looks actually very similar. You start at the bottom and work your way up.

parse(
*/