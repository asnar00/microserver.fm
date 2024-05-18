# scribbles

So let's think about the next step with this.

We want to program in 

_____________________________________________________________________
Things that the framework needs:

1. a decent declaration syntax:

@feature class MyFeature extends ParentFeature

2. simple set of decorators:

    @def : define
    @on  : replace (sneak _existing)
    @after : bolt on afterwards (sneak _result)
    @before : bolt on before

3. multi-machine remote execution:

    chat example:
    clients = [..]
    server = ..

    a = func(params)                : execute locally
    a = server.func(params)         : execute on the server
    a = client[name].func(params)   : execute on a specific machine
    a = clients.func(params)        : execute on all machines (returns array)

4. proper handling of objects:

    @shared class Shared {
        @property x : number = 0;
    };

    shared.x = 5                    : broadcast to all clients

5. reactive UI, eg. documents, chat UI, that kind of thing:

    documentPanel(shared markdown);     => whenever it changes, do something.

    so we want to listen to an event coming from the outside, and do something.
