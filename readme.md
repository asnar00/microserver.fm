ᕦ(ツ)ᕤ
# microserver.fm

microserver.fm is a feature-modular deno server.

## feature modularity

Users and developers are used to talking about "features" : units of functionality related to a particular task. However, most programming languages lack first-class language structures that correspond to features.

When adding a feature, therefore, we typically make a number of changes dispersed across the codebase. Conversely, when we look at any particular point in the code, we'll usually see code from multiple features intersecting at that point. This makes it difficult to reason about features and their interactions by looking at the code.

Feature modularity addresses this by collecting all code that implements a feature into one place, the *feature clause*. The feature clause specifies all modifications to the existing program's behaviour. A program is a tree of feature clauses, each one adding detail to its parent.

A side effect of this is that code is no longer bound to *classes*; rather, code is bound to *features*. Features thus replace classes as the fundamental unit of modularity; hence the name "feature modular".

**microserver.fm** is an experiment to see how this idea plays out in practice.

## feature-modular typescript

fm.ts is implemented using just four decorators, `@feature`, `@on`, `@after`, and `@before`. We'll demonstrate how they work using the classic 'hello world' example.

A feature clause in fm.ts is declared by creating a class decorated with the `@feature` decorator, as follows:

    @feature(Feature) class Main {
        @on main() {
        }
    }

This declares a new feature called `Main`, extending the base feature (`Feature`). (Aside: a better syntax here would be `feature Main extends Feature`, but to do that we need to get into typescript transformers, which is a future exercise). 

The `@on` decorator turns the `main()` method into a function, and adds it to a global "context" object called `fm`.

To call `main()`, you do

    fm.main()

which, because `main()` is empty, prints nothing. Amazing!

If we want to add behaviour to this program, rather than editing the original definition of `main()`, we add a new feature clause that bolts the new functionality onto the existing definition.

    @feature(Main) class Hello {
        @on hello() {
            console.log("hello world!");
        }
        @after main() {
            fm.hello();
        }
    }

Now, if you call `fm.main()`, you'll get some new behaviour:

    hello world!

Notice the structure of this code: we first declare a new function using `@on`, and then we 'plug it in' to the existing program using `@after`. This just means "add a call to `hello` to the end of `main`".

Now let's add another new feature: let's be polite and say "goodbye" after we're done.

    @feature(Main) class Goodbye {
        @on goodbye() {
            console.log("kthxbye.");
        }
        @after main() {
            fm.goodbye();
        }
    }

Now, if you call `fm.main()`, you'll get this:

    hello world!
    kthxbye.

Similarly, you can add behaviour before an existing function using the `@before` decorator:

    @feature(Main) class Countdown {
        @on countdown() {
            console.log("10 9 8 7 6 5 4 3 2 1");
        }
        @before main() {
            fm.countdown();
        }
    }

which results in this output from `fm.main()`:

    10 9 8 7 6 5 4 3 2 1
    hello world!
    kthxbye.

## disabling features

The power of this approach is that we can turn features on and off at runtime, changing the behaviour of the program. For example, we can disable the `Hello` feature like this:

    fm._manager.disable(["Hello"]);

which changes the output of `fm.main()` to:

    10 9 8 7 6 5 4 3 2 1
    kthxbye.

To re-enable all features, we'd do:

    fm._manager.disable([]);

## debugging

We can read out the tree of features and the list of functions, including current enable/disable states, like this:

    fm._manager.readout();

Which prints

    features: -----------------------------------
    Feature
    Main
        Hello
        Goodbye
        Countdown

    functions: ----------------------------------
    main: (Countdown.main before (Goodbye.main after (Hello.main after Main.main)))
    hello: Hello.hello
    bye: Goodbye.bye
    countdown: Countdown.countdown

If you disable a feature, its name is greyed out in the feature tree, and its children are not traversed.

You can also turn on logging annotation, as follows:

    fm._manager.debug(true);

Which adds the container feature and function name to each console line:

    10 9 8 7 6 5 4 3 2 1    ◀︎ Countdown.countdown
    hello world             ◀︎ Hello.hello
    kthxbye                 ◀︎ Goodbye.bye

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

- specifying client and server code in the same feature
- multiple contexts: switch between different feature-groups
- debugging workflows: automated logging, fault tracing
- reasoning about code: understanding how features interact
- namespaces and interfaces
- server-specific features: a better framework for data consistency across clients

