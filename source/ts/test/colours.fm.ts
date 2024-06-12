// ᕦ(ツ)ᕤ
// colours.fm.ts
// feature modular struct extension

import { _Feature, feature, on, after, before, struct, extend, make, fm } from "../util/fm.js";

// -----------------------------------------------------------------------------

@struct class Colour { r: number =0; g: number =0; b: number =0; }
declare const add_colours: (c1: Colour, c2: Colour) => Colour;
declare const main: () => void;

@feature class _Colour extends _Feature {
    @on add_colours(c1: Colour, c2: Colour): Colour {
        return make(Colour, {r: c1.r + c2.r, g: c1.g + c2.g, b: c1.b + c2.b});
    }
    @on main() {
        const rgb1 = make(Colour, {r:1, b: 2});
        const rgb2 = make(Colour, {r:0, g: 2});
        const rgb3 = add_colours(rgb1, rgb2);
        console.log("rgb3", rgb3);
    }
}


// -----------------------------------------------------------------------------

interface Colour { a: number; }
@extend(Colour) class Alpha { a: number = 0.5; }

@feature class _AlphaColour extends _Colour {
    @on add_colours(c1: Colour, c2: Colour): Colour {
        return { ... this.existing(add_colours)(c1, c2), a: c1.a + c2.a };
    }
}

main();



