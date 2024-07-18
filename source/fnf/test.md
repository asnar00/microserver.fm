ᕦ(ツ)ᕤ
# test.fnf

This is a file that tests the fnf utility. It contains some markdown text, and some code snippets.

Code snippets are indented using four spaces, like this: 

    function main() {
        console.log("hello world");
    }

All that fnf is going to do is to bloop out the indented lines and spit them out into a single file. Like, that's literally all. We might do some other shit like rearrange statements or collect the outermost statements into a `_test` function but that's it for now. Let's see what happens!

Oh yeah, don't forget to call main() like this:

    main();

The other thing that you can do in fnf is to evaluate stuff. For instance, if we define a simple function like this:

    function add(a: number, b: number) : number {
        return a + b;
    }

Then we should be able to *evaluate* the result like this:

    add(10, 5) ==>

Which should output "15" with the line number attached to it; and you should also be able to test things, so the following should pass without comment:

    add(10, 5) ==> 15

whereas the following should output a failure message in the console with the correct line in this text attached.

    add(10, 5) ==> 16



