ᕦ(ツ)ᕤ
# microserver.fm

microserver.fm is a feature-modular demo server.

## feature modularity

Users and developers are used to talking about "features" : units of functionality related to a particular task. However, most programming languages lack first-class language structures that correspond to features.

When adding a feature, therefore, we typically make a number of changes dispersed across the codebase. Conversely, when we look at any particular point in the code, we'll usually see code from multiple features intersecting at that point. This makes it difficult to reason about features and their interactions by looking at the code.

Feature modularity addresses this by collecting all code that implements a feature into one place, the *feature clause*. The feature clause specifies all modifications to the existing program's behaviour. A program is a tree of feature clauses, each one adding detail to its parent.

A side effect of this is that code is no longer bound to *classes*; rather, code is bound to *features*. Features thus replace classes as the fundamental unit of modularity; hence the name "feature modular".

**microserver.fm** is an experiment to see how this idea plays out in practice.

## feature-modular typescript

fm.ts is implemented using a few decorators: `@feature`, `@def`, `@replace`, `@after`, `@before`, and `@on`. We'll demonstrate how they work using the classic 'hello world' example.

A feature clause in fm.ts is declared by creating a class decorated with the `@feature` decorator, as follows:

    declare const main: () => void;         // the feature 'Main' declares a new function main()

    @feature class _Main extends _Feature {
        @def main() {}
    }

This declares a new feature called `_Main`, extending the base feature (`_Feature`). Note: all feature names start with an underscore in order to avoid name collision with class names.

The `@def` decorator pokes the definition of the method `main` into the global function `main()`. This means you can just call it as if it were a normal function:

    main()

which, because `main()` is empty, prints nothing. Amazing!

If we want to add behaviour to this program, rather than editing the original definition of `main()`, we add a new feature clause that bolts the new functionality onto the existing definition.

    declare const hello: (name: string) => void;        // the feature 'Hello' declares a new function hello()

    @feature class _Hello extends _Main {
        @def hello(name: string) { console.log(`hello, ${name}!"); }
        @after main() { hello("world"); }
    }

The `@after` decorator extends the function `main()` by adding a call to a new function `hello(...)`:

    hello, world!

Notice the structure of this code: we first declare a new function using `@def`, and then we 'plug it in' to the existing program using `@after`.

Now let's add another new feature: let's be polite and say "goodbye" after we're done.

    declare const bye: () => void;

    @feature class _Goodbye extends _Main {
        @def bye() { console.log("kthxbye."); }
        @after main() { bye(); }
    }

Now, if you call `main()`, you'll get this:

    hello, world!
    kthxbye.

Similarly, you can add behaviour before an existing function using the `@before` decorator:

    declare const countdown: () => void;

    @feature class _Countdown extends _Main {
        @def countdown() { console.log("10 9 8 7 6 5 4 3 2 1"); }
        @before main() { countdown(); }
    }

which results in this output from `main()`:

    10 9 8 7 6 5 4 3 2 1
    hello, world!
    kthxbye.

Finally, the decorator `@on` extends an existing function by calling the new one in parallel with the old one. For this to work, neither the original nor the new function can return anything other than a Promise<void>. Since we can't check this at compile time, this functionality is a bit dangerous at the moment, but c'est la guerre until we figure out something better. The composite function so produced returns a `Promise.all` construct, so you can await the result if you wish.

## structs and struct extension

Because fm.ts seeks to replace object-orientation with feature modularity, fm.ts code doesn't define objects or methods. Instead, all code is expressed as functions bound to features, and all data is expressed using value-types, equivalent to C structs or straight js dictionaries (mapping name => value). To take advantage of typescript type-checking, we use interfaces.

The `colours.fm.ts` example demonstrates this using an RGB colour that we then later extend by adding an alpha property. The canonical fm.ts way of implementing this is as follows:

First, we define a base feature `_Colour` that sets up our basic RGB `Colour` struct, and a function `add_colours` that adds the r, g, and b components:

    @struct class Colour { r: number =0; g: number =0; b: number =0; }

    declare const add_colours: (c1: Colour, c2: Colour) => Colour;
    declare const test: () => void;

    @feature class _Colour extends _Feature {
        @def add_colours(c1: Colour, c2: Colour): Colour {
            return make(Colour, {r: c1.r + c2.r, g: c1.g + c2.g, b: c1.b + c2.b});
        }
        @def test() {
            const rgb1 = make(Colour, {r:1, b: 2});
            const rgb2 = make(Colour, {r:0, g: 2});
            const rgb3 = add_colours(rgb1, rgb2);
            console.log("rgb3", rgb3);
        }
    }

Note here: the `make` helper function that lets you specify parameters by name, in any order, ensuring that the defaults are applied properly, but without having to define a constructor in the class declaration.

Running `main()` with just this feature defined prints the following:

    rgb3 {
        "r": 1,
        "g": 2,
        "b": 2
    }

Next, we add a feature to extend the `Colour` structure with an alpha property `a`, and extend the `add_colours` function to also add the new `a` components.

    interface Colour { a: number; }
    @extend(Colour) class Alpha { a: number = 0.5; }

    @feature class _AlphaColour extends _Colour {
        @replace add_colours(c1: Colour, c2: Colour): Colour {
            return { ... this.existing(add_colours)(c1, c2), a: c1.a + c2.a };
        }
    }

Note here: 

- we have to extend the interface of the original `Colour` class
- we use the `@extend` decorator to add the properties of the new class to `Colour`
- we use the slightly clumsy syntax `this.existing()` which finds the definition of `add_colours` as it existed before the definition of the new feature.

Calling `main()` now prints this:

    rgb3 {
        "r": 1,
        "g": 2,
        "b": 2,
        "a": 1
    }

## disabling features

The power of this approach is that we can turn features on and off at runtime, changing the behaviour of the program. For example, we can disable the `Hello` feature like this:

    fm.disable(["Hello"]);

which changes the output of `main()` to:

    10 9 8 7 6 5 4 3 2 1
    kthxbye.

To re-enable all features, we do this:

    fm.disable([]);

## debugging

We can read out the tree of features and the list of functions, including current enable/disable states, like this:

    fm.readout();

Which prints

    Feature
    Main
        Hello
        Goodbye
        Countdown

If you disable a feature, its name is greyed out in the feature tree, and its children are not traversed.

You can also turn on logging annotation, as follows:

    fm.debug(true);

Which adds the container feature and function name to each console line:

    10 9 8 7 6 5 4 3 2 1    ◀︎ Countdown.countdown
    hello, world!                   ◀︎ Hello.hello
    kthxbye                         ◀︎ Goodbye.bye

## microserver.fm

**microserver.fm** is an exploration of feature modularity as it applies to the most basic piece of useful code - the web server. It's an experiment to learn about feature modularity in practice.

The code is in `server.fm.ts` (the ".fm" indicates that the file is feature modular, but it's just typescript). There are four features:

- Main: an empty program; browser shows "ERR_CONNECTION_REFUSED"
- Server: an empty deno server: browser returns a 404
- Get: simple fileserver; GET returns files in 'public', and maps '/' to 'index.html'
- Put: remote procedure call: PUT calls a function and returns the result

The plan is to develop `microserver.fm` gradually into a fully-fledged and useful server, adding functionality solely by adding features. We'll be looking at all aspects of the development and maintenance of the code, including logging, debugging, replicability, parallelism, robustness, and user customisability.

## how to run

Go into the folder source/ts in the main project, and start the server like this:

    deno run --config tsconfig.json --allow-read --allow-net server.fm.ts

(You need deno and typescript installed for this to work, obviously).

## implementation notes

Feature-modular typescript ("fm.ts") is ordinary typescript augmented with a set of decorators declared in `features.ts`. To use it, your .tsconfig needs to enable decorators:

    "compilerOptions" : {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
    }

## future work

- improve console.log print format for composite structs
- tests!
- structure instances tagged with supported features
- specifying client and server code in the same feature
- multiple contexts: switch between different feature-groups
- debugging workflows: automated logging, fault tracing
- reasoning about code: understanding how features interact
- namespaces and interfaces
- server-specific features: a better framework for data consistency across clients

