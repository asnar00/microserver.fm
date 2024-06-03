// ᕦ(ツ)ᕤ
// zero.ts
// author: asnaroo
// compiles zero to typescript
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { _Feature, feature, on, after } from "../fm.js";
let _Main = class _Main extends _Feature {
    test() { }
    main() { console.log("ᕦ(ツ)ᕤ"); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Main.prototype, "test", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Main.prototype, "main", null);
_Main = __decorate([
    feature
], _Main);
//-----------------------------------------------------------------------------
// Lexer
class Lex {
    constructor() {
        this.value = "";
        this.type = "";
    }
}
let _Lexer = class _Lexer extends _Main {
    isAlpha(c) { return /[a-z]/i.test(c); }
    isAlphanum(c) { return /[a-z0-9]/i.test(c); }
    isWhitespace(c) { return /\s/.test(c); }
    isOperator(c) { return /[+\-*\/\^%=(),]/.test(c); }
    isBrace(c) { return /[{()}]/.test(c); }
    isPunctuation(c) { return /[,;]/.test(c); }
    isQuote(c) { return /['"]/.test(c); }
    isDigit(c) { return /[0-9]/.test(c); }
    lexer_skip_whitespace(source, i) {
        while (i < source.length && isWhitespace(source[i]))
            i++;
        return i;
    }
    lexer_try_operator(source, i) {
        if (isOperator(source[i]))
            return [i + 1, { value: source[i], type: "op" }];
    }
    lexer_try_brace(source, i) {
        if (isBrace(source[i]))
            return [i + 1, { value: source[i], type: "brace" }];
    }
    lexer_try_punctuation(source, i) {
        if (isPunctuation(source[i]))
            return [i + 1, { value: source[i], type: "punc" }];
    }
    lexer_try_string(source, i) {
        if (isQuote(source[i])) {
            let j = i;
            while (j < source.length && source[j] !== source[i])
                j++;
            return [j + 1, { value: source.slice(i, j), type: "string" }];
        }
    }
    lexer_try_int(source, i) {
        if (isDigit(source[i])) {
            let j = i;
            while (j < source.length && isDigit(source[j]))
                j++;
            return [j, { value: source.slice(i, j), type: "int" }];
        }
    }
    lexer_try_name(source, i) {
        if (isAlpha(source[i])) {
            let j = i;
            while (j < source.length && isAlphanum(source[j]))
                j++;
            return [j, { value: source.slice(i, j), type: "name" }];
        }
    }
    lexer_step(source, i) {
        i = lexer_skip_whitespace(source, i);
        let rx = lexer_try_operator(source, i);
        if (rx)
            return rx;
        rx = lexer_try_brace(source, i);
        if (rx)
            return rx;
        rx = lexer_try_punctuation(source, i);
        if (rx)
            return rx;
        rx = lexer_try_string(source, i);
        if (rx)
            return rx;
        rx = lexer_try_int(source, i);
        if (rx)
            return rx;
        rx = lexer_try_name(source, i);
        if (rx)
            return rx;
    }
    lexer_run(source) {
        let i = 0;
        let result = [];
        while (i < source.length) {
            const rx = lexer_step(source, i);
            if (rx) {
                const [j, lex] = rx;
                result.push(lex);
                i = j;
            }
            else {
                throw new Error(`Unexpected character ${source[i]} at position ${i}`);
            }
        }
        return result;
    }
    lexemes_to_string(lexemes) {
        let out = "";
        for (let lex of lexemes) {
            out += `{${lex.type}:${lex.value}}`;
        }
        return out;
    }
    test() {
        let lexemes = lexer_run("let x=10;");
        let ls = lexemes_to_string(lexemes);
        let success = ls === "{name:let}{name:x}{op:=}{int:10}{punc:;}";
        if (!success) {
            throw new Error("Lexer test failed");
        }
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], _Lexer.prototype, "isAlpha", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], _Lexer.prototype, "isAlphanum", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], _Lexer.prototype, "isWhitespace", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], _Lexer.prototype, "isOperator", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], _Lexer.prototype, "isBrace", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], _Lexer.prototype, "isPunctuation", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], _Lexer.prototype, "isQuote", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], _Lexer.prototype, "isDigit", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Number)
], _Lexer.prototype, "lexer_skip_whitespace", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Object)
], _Lexer.prototype, "lexer_try_operator", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Object)
], _Lexer.prototype, "lexer_try_brace", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Object)
], _Lexer.prototype, "lexer_try_punctuation", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Object)
], _Lexer.prototype, "lexer_try_string", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Object)
], _Lexer.prototype, "lexer_try_int", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Object)
], _Lexer.prototype, "lexer_try_name", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Object)
], _Lexer.prototype, "lexer_step", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], _Lexer.prototype, "lexer_run", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], _Lexer.prototype, "lexemes_to_string", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Lexer.prototype, "test", null);
_Lexer = __decorate([
    feature
], _Lexer);
class AST {
    constructor() {
        this.type = "";
        this.children = [];
        this.index = 0;
        this.lexemes = [];
    }
}
let _Parser = class _Parser extends _Lexer {
    parser_run(lexemes) {
        return { type: "root", children: [], index: 0, lexemes: lexemes };
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", AST)
], _Parser.prototype, "parser_run", null);
_Parser = __decorate([
    feature
], _Parser);
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
