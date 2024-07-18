ᕦ(ツ)ᕤ
# Goodbye

`Goodbye` just prints "goodbye" (or something like it) right at the end.

    feature Goodbye Extends Demo {
        def goodbye() { fm.log("kthxbye."); }
        after main() { goodbye(); }
    }