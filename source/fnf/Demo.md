ᕦ(ツ)ᕤ
# Feature/Demo

`Demo` is a demo program to test `fnf.ts` (*Feature Normal Form*) - the build system that processes these .md files and spits out working typescript.

    feature Demo extends Feature;

Since `Demo` is a "program", it provides a "main" function. We use `replace` because we don't want its definition to run parallel with any other features that might be defined; if you enable `Demo`, then all other features are effectively disabled.

    def main() { fm.log("ᕦ(ツ)ᕤ"); }


_____
*child features*
____

## Hello

Says 'hello world' like all good hello world programs should.

## Countdown

To add a bit of drama, let's count down from 10 to 1 before the big hello.

## Goodbye

To be polite, let's sign off with "thanks bye!"
