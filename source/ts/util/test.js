"use strict";
exports.__esModule = true;
exports._assert = exports._output = exports._source = void 0;
var s_sourcePath = "";
function _source(path) { s_sourcePath = path; }
exports._source = _source;
function _output(value, line) {
    console.log(value, "(".concat(s_sourcePath, ":").concat(line, ")"));
}
exports._output = _output;
function _assert(value, expected, line) {
    if (value != expected) {
        console.error("expected ".concat(expected, ", got ").concat(value, " (").concat(s_sourcePath, ":").concat(line, ")"));
    }
}
exports._assert = _assert;
