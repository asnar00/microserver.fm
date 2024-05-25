// ᕦ(ツ)ᕤ
// colours.fm.ts
// feature modular struct extension

import { _Feature, feature, on, after, before, fm, console_separator} from "./fm.ts";

interface Colour {
    r: number; g: number; b: number;
}

//declare const colour: (r: number, g: number, b: number) => Colour;
declare const add_colours: (c1: Colour, c2: Colour) => Colour; 

@feature class _RGBColour extends _Feature {
    @on colour(r: number=0, g: number=0, b: number=0): Colour {
        return {r, g, b} as Colour;
    }
    @on add_colours(c1: Colour, c2: Colour): Colour {
        return colour(c1.r + c2.r, c1.g + c2.g, c1.b + c2.b);
    }
}

interface Colour {
    a: number;
}
declare const colour: (r?: number, g?: number, b?: number, a?:number) => Colour;

@feature class _RGBAColour extends _RGBColour {
    @on colour(r: number=0, g: number=0, b: number=0, a: number=1): Colour {
        return {r, g, b, a} as Colour;
    }
    @on add_colours(c1: Colour, c2: Colour): Colour {
        return colour(c1.r + c2.r, c1.g + c2.g, c1.b + c2.b, c1.a + c2.a);
    }
}

function main() {
    let col1  = colour(1, 0, 0.5);
    console.log("col1:", col1);
    let col2 = colour(1, 0.5, 1, 0.5);
    console.log("col2:", col2);
    let col3 = add_colours(col1, col2);
    console.log("col3:", col3);
}

main();
