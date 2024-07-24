ᕦ(ツ)ᕤ
# Demo/Hello

`Hello` just prints 'hello world' to the log:

    feature Hello extends Demo;

First we define a function `hello` that just prints "hello world" to the log:

    def hello() { fm.log("hello world!"); }

And then we plug it in so that it gets run whenever `main` gets run.

    on demo() { hello(); }

Now this should pass a couple of tests:

    demo() ==> "you stinka!"
    demo() ==>
