ᕦ(ツ)ᕤ
# Demo/Goodbye

`Goodbye` just prints "goodbye" (or something like it) right at the end.

    feature Goodbye extends Demo;
    
    def goodbye() { console.log("kthxbye."); }

    after async demo() { goodbye(); }