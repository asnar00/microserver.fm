ᕦ(ツ)ᕤ
# Demo

`Demo` is a demo program to test `fnf.ts` (*Feature Normal Form*) - the build system that processes these .md files and spits out working typescript.

    feature Demo extends Feature {

Since `Demo` is a "program", it provides a "main" function. We use `replace` because we don't want its definition to run parallel with any other features that might be defined; if you enable `Demo`, then all other features are effectively disabled.

    replace main() { fm.log("nothing to see here"); }

Although it's a pain to have to do this, we have to do this:

    }