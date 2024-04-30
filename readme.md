ᕦ(ツ)ᕤ
# microserver.fm

microserver.fm is a feature-modular deno server.

## feature modularity

Users and developers are used to talking about "features" : units of functionality related to a particular task. 

When adding a feature, we typically make a number of changes dispersed across the code. Conversely, when we look at any particular point in the code, we'll usually see code from multiple features intersecting at that point.

Feature modularity addresses these twin issues (*dispersal of intent* and *collision of concerns*) by collecting all code that implements a feature into one place, the *feature clause*. A program is a tree of feature clauses, each one adding detail to its parent.

**microserver.fm** is an experiment to see how this idea plays out in practice.

## feature-modular typescript

Feature-modular typescript ("fm.ts") is ordinary typescript augmented with a set of decorators declared in `features.ts`. To use it, your .tsconfig needs to enable decorators:

    "compilerOptions" : {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
    }

A feature clause in fm.ts is declared by creating a class decorated with the `@feature` decorator, as follows:

    @feature(Feature) class Main {
        @on main() {
            console.log("hello world!");
        }
    }

This declares a new feature called `Main`, extending the base feature (`Feature`). The `@on` decorator turns the `main()` method into a function, and adds it to a global "context" object called `fm`.

To call `main()`, you do

    fm.main()

which results in the output

    hello world!

If we want to add behaviour to this program, rather than editing the original definition of `main()`, we add a new feature clause that bolts the new functionality onto the existing definition.

    @feature(Main) class Goodbye {
        @after main() {
            fm.goodbye();
        }
        @on goodbye() {
            console.log("kthxbye.");
        }
    }

Now, if you call `fm.main()`, you'll get some new behaviour:

    hello world!
    kthxbye.

Similarly, you can add behaviour before an existing function using the `@before` decorator:

    @feature(Main) class Countdown {
        @before main() {
            fm.countdown();
        }
        @on countdown() {
            console.log("10 9 8 7 6 5 4 3 2 1");
        }
    }

which results in this output from `fm.main()`:

    10 9 8 7 6 5 4 3 2 1
    hello world!
    kthxbye.

## microserver.fm

**microserver.fm** is an exploration of feature modularity as it applies to the most basic piece of useful code - the web server. It's an experiment to learn about feature modularity in practice.

The code is in `server.fm.ts` (the ".fm" indicates that the file is feature modular, but it's just typescript). There are four features:

- Main: an empty program; browser shows "ERR_CONNECTION_REFUSED"
- Server: an empty deno server: browser returns a 404
- Get: simple fileserver; GET returns files in 'public', and maps '/' to 'index.html'
- Put: remote procedure call: PUT calls a function and returns the result

The plan is to develop microserver.fm gradually into a fully-fledged and useful server, adding functionality solely by adding features. We'll be looking at all aspects of the development and maintenance of the code, including logging, debugging, replicability, parallelism, robustness, and user customisability.

## how to run

Go into the folder source/ts in the main project, and start the server like this:

    deno run --config tsconfig.json --allow-read --allow-net server.fm.ts

(You need deno and typescript installed for this to work, obviously).

## future work

- feature readout: print tree of features
- enable/disable: turn features on and off
- mixing client-side and server-side code into a single feature clause
- multiple contexts: switch between different feature-groups
- debugging workflows: automated logging, fault tracing
- reasoning about code: understanding how features interact
- server-specific features: a better framework for data consistency across clients

