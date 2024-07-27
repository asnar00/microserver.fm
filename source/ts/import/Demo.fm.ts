import { _Demo, _import as _Demo_import } from "../fnf/Demo.fm.js";
import { _Hello, _import as _Hello_import } from "../fnf/Demo/Hello.fm.js";
import { _Goodbye, _import as _Goodbye_import } from "../fnf/Demo/Goodbye.fm.js";
import { _Countdown, _import as _Countdown_import } from "../fnf/Demo/Countdown.fm.js";

export function _import() {
    _Demo_import();
    _Hello_import();
    _Goodbye_import();
    _Countdown_import();
}