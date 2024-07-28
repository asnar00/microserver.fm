ᕦ(ツ)ᕤ
# Goodbye

`Goodbye` just prints "goodbye" (or something like it) right at the end.

    feature Goodbye extends Demo;
    
`goodbye` offers a non-traditional earthling message of farewell:

    def goodbye() { console.log("kthxbye."); }

And we want to issue this after everything else is complete:

    after demo() { goodbye(); }