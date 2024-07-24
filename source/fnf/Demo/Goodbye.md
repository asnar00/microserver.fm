ᕦ(ツ)ᕤ
# Demo/Goodbye

`Goodbye` just prints "goodbye" (or something like it) right at the end.

    feature Goodbye extends Demo;
    
    def goodbye() { fm.log("kthxbye."); }

    after demo() { goodbye(); }