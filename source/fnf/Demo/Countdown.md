ᕦ(ツ)ᕤ
# Countdown

`Countdown` just prints the numbers 10 .. 1 before the rest of the whatever.

    feature Countdown extends Demo;

Really, `countdown` should print the numbers one at a time, one per second, but we'll add that behaviour later.

    on countdown() { fm.log("10 9 8 7 6 5 4 3 2 1"); }

We want this to happen before everything else in the program:

    before main() { countdown(); }