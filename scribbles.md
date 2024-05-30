# scribbles

Okey. Now for multi-point programming.

The obvious and most fun thing to do is to look at the hello name example.
What should the code look like?

    @feature class _HelloClient {
        @server @private @persistent("users.json") static users: any;

        @on client_main() {
            let name = input("name");
            let message = greeting(name);
            print(message);
        }

        @on greeting(name) { 
            if (recognised(name)) { return "hello, " + name + "!"; }
            else { return "fuck off"; }
        }

        @server @on recognised(name) : boolean { 
            return _HelloClient.users[name] != undefined;
        }

        @on input(..) { some html stuff }
        @on print(..) { some html stuff }
    }

`@server` : the property or function lives on the server
`@private` : the property cannot be sent to any other machine
`@persistent` : the property gets loaded from the file at startup, and autosaved when it changes.

So let's see how a chat program would work:

    @struct class Message { 
        user: string;
        text: string;
    }

    @struct class Chat {
        title: string;
        messages: Message[];
    }

    @feature class _Chat {
        @server @persistent("chat.json") static s_chat : Chat;
        @server @on post(msg: Message) {
            chat.messages.push(msg);
        }
        @on client_main() {
            display(s_chat);
        }
        @on display(chat: Chat) {
            ... generate html ...
        }
    }

`on_changed` subscribes the client to a specific variable; on the client.
I kind of think we should do subscriptions based on paths.

I think we should use websockets for everything.
Also, under the hood. What's the correct abstraction?

    monitor(path, (obj) => fn(obj);)

    monitor("chat.json", (chat) => display(chat);)
    







-------------------------------------------------------------------------------
Some daylight falling on poke-able constructors. Found a method that works.
This week goals:

1- now that we have a pathway to auto-construct, finalise Colour example.
2- get the simplest, most natural form of "multi-node" programming working.
  (which in this case would be client/server)

stretch goal
3- demonstrate a basic chat program running in this environment




TEMP:
//-----------------------------------------------------------------------------
/*
    feature RGBColour {
        struct Colour { r: number=0; g: number=0; b: number=0; }
        on add(c1: Colour, c2: Colour): Colour {
            return Colour(c1.r + c2.r, c1.g + c2.g, c1.b + c2.b);
        }
    }
*/

class Colour { r: number =0; g: number =0; b: number =0; }

declare const add_colours: (c1: Colour, c2: Colour) => Colour; 

@feature class _RGBColour extends _Feature {
    @on colour(r: number=0, g: number=0, b: number=0): Colour {
        return construct(Colour, {r, g, b });
    }
    @on add_colours(c1: Colour, c2: Colour): Colour {
        return colour(c1.r + c2.r, c1.g + c2.g, c1.b + c2.b);
    }
}

//-----------------------------------------------------------------------------
/*
    feature RGBAColour extends RGBColour {
        struct Colour { a: number=1; }
        on add(c1: Colour, c2: Colour): Colour {
            return { add(c1, c2) .. c1.a + c2.a);
        }
    }
*/

interface Colour { a: number; }
@extend(Colour) class Alpha { a: number = 1; }

declare const colour: (r?: number, g?: number, b?: number, a?:number) => Colour; 

@feature class _RGBAColour extends _RGBColour {
    @on colour(r: number=0, g: number=0, b: number=0, a: number=1): Colour {
        return construct(Colour, { r, g, b, a });
    }
    @on add_colours(c1: Colour, c2: Colour): Colour {
        return colour(c1.r + c2.r, c1.g + c2.g, c1.b + c2.b, c1.a + c2.a);
    }
}

function main() {
    let col = new Colour();
    console.log(col);
}

main();
_____________________________________________________________________
Thoughts on multi-point.

we have bits of state that are owned (published) by various nodes
we want to specify operations on those *bits of state*, regardless of where the state is stored, or where the operation takes place.

Yo define a "machine" using this syntax:

    node Drone
        cam: Image;                // stream of incoming images
        target: Location;          // stream of commands
    
So we can write simple, matter-of-fact stuff like

    feature DroneFollow
        on follow (drone: Node, person: Image, distance: Scalar)
            drone.cam >> image: Image
            find (person) in (image) >> region: ImageRegion
            find location of (region) relative to (drone) >> location: Location
            (location, distance) >> drone.target

enteresting, or

    feature DroneFollow
        on follow (drone: Node, person: Image, distance: Scalar)
            image: Image << drone.cam
            region: ImageRegion << find (person) in (image)
            location: Location << find gps coord of (region) relative to (drone)
            drone.approach << location, distance;

These are just streams being hooked into one another; there's no mention of where the computation takes place, *except* where we refer to a stream that's bound to a particular node (in this case, the input `drone.cam` and the output `drone.target`). And because only those variables are physically 'pinned" as it were, the others can exist anywhere.

So the decision about where each computation takes place can be based on:

    - which machines are fast enough to run the workload?
    - which machines have enough spare capacity?
    - how long does it take to get data from point A to point B?
    
So "expensive" operations such as `find (person) in (image)` can end up moving around.

In this example, imagine that we start with an inexpensive drone, that can't do much more than stream a camera feed back to base. In this case, we'd want `find person` to run on the server, and ... stream the camera feed back to it. Not especially controversial.

But, we moan, well, all that video information is a pain because it uses bandwidth, and it limits how far away we can fly, there's latency, etc etc.

No problem, we go out and buy a super drone that has a bunch of GPUs on board. Hey presto, now the whole of `follow` can run on the drone, the server just sends it `follow` commands (the code doesn't have to change; we just replace the call with a proxy).

This is, I think a super cool capability, and it's what we're building this week.
Once we have this, we're going to write proper client/server code that looks and feels sensible.

_____________________________________________________________________
There's a flavour of this where all nodes are explicitly specified.
So you have client ("nothing") and server, and any other machines eg. drone.

I don't mind this for now.

When we declare a variable "shared", we assign it to a specific node.

    So we say

    @shared(server) var xyz;

(inside the feature obviously)

    and then we can use xyz wherever we like.

Functions are "pinned" as follows:

    if it modifies (var), then it has to run on var's owner. 
        we generate a proxy on the client that forwards to the owner.
            we standardise on a websocket substrate.
    if it reads (var), then we have to subscribe to var's owner.

So we have

    class Chat {
        users: User[] = [];
        messages: Message[] = [];
    }

    class Message {
        username: string;
        text: string;
    }

    @feature class _Chat {
        chat: Chat;
        username: string;
        @on start() {
            join(username, chat);
        }
        @on join(username, chat) {
            chat.users.push(find_user(username));
        }
        @on post(username: string, text: string) {
            chat.messages.push(new Message(username, text));
            for (let u in chat.users)  { u.display(message); }
        }
        @on display(message: Message) {
            add_to_display(html_from_message(message));
        }
    }

Then we basically have to mark functions as running on one machine or another, like this:

    server.assign([_Chat.chat, post])



    
        

_____________________________________________________________________
zerp interface thoughts:

There's actually two forms here:

.fm.ts : decorator-based feature-modular native typescript
.zero  : proper zero that translates to typescript/wasm/whatever

Processor takes .md and converts it to .fm.ts (extract code snippets).
So no code generation going on, just straight copy-paste.

Next: write the editor for those .md documents, using .md format.

Once this editor is running, then you can add a "translate to zero" button
in the interface that just uses an LLM to go either way.

This is the way :-D

Be able to write the code in either native typescript or in zero;
and use the LLM to back and forth between them. Straight translation.
So easy. Oh yeah oh yeah. That's how it will work.

So the code snippets are actually ```lang```, and there can be more than one in the same section.
They get displayed as a single snippet with a language selector.

_____________________________________________________________________
microclub interface thoughts.

- single conversation strand
- easy to post short-form posts (similar to substack)
- create side-chains

I mean really it's just a slack group, but with some nice features that promote medium-length writing (like a 2 minute read).

Write something quick for the club.

Then each one can have a side-chain conversation.

Other thought was:

people => projects. get one project up there. they make content.



_____________________________________________________________________
strategy:

1- feature modular typescript, enough to write real things with and learn.
doesn't have to be perfect, just has to work.

2- *written in fm.ts* : zerp.fm 

Just a demonstration of how that code looks in literate style.

3- once that's done: a zero-to-ts compiler, ready for wasm / wgpu backend

4- then, zerp in zero.

This is the way.

_____________________________________________________________________

_____________________________________________________________________
SUPER STUPID (but great) IDEA:

- zero can compile to c, python, or typescript
- it can borrow their syntax!

So you can do "zero.py" style:

    feature Hello:
        on hello(name: string):
            log(f"hello, {name}")
        after main():
            hello("world")

Or you can use "zero.ts" style:

    feature Hello {
        on hello(name: string) {
            log(`hello, ${name}`);
        }
        after main() {
            hello("world");
        }
    }

Or you can use "zero.cpp" style:

    feature Hello {
        on hello(string name) {
            log << "hello, " << name;
        }
        after main() {
            hello("world");
        }
    }

I think that's nice and easy, don't you? All of which means that we can do zero.ts, and write code in zero, and translate it to ts if we want to. Nice one. That way we can get it running nice and quickly in the browser, and the syntax works properly, but it's more about making it easier to get to grips with it if you're coming from one of those languages.

Do we just want to be outputting py/ts/cpp? Well, maybe, because then we can interoperate with the entire existing codebases in those languages, for free.

It's hard to know exactly where to draw that line.

_____________________________________________________________________


_____________________________________________________________________
fm.ts object system

"value types": interfaces.

Let's look at the fucking example: ideal syntax.

    feature RGBColour {
        struct Colour {
            r: number = 0;
            g: number = 0;
            b: number = 0;
        }
        on add(a: Colour, b: Colour) : Colour {
            return { r: a.r+b.r, g: a.g+b.r, b: a.b+b.r} as Colour;
        }
    }

    feature AlphaColour extends RGBColour {
        struct Colour {
            a: number = 0;
        }
        after add(a: Colour, b: Colour) : Colour {
            return extend(_result, { a: a.a + b.a })
        }
    }

So this is the thing we want to figure out.



_____________________________________________________________________
## idea of "streams

Idea is that each node in the system publishes a set of streams.
A stream is a time-stamped sequence of object values (straight JSON or binary).
"time-stamped" here means it is tagged with a global clock value.

A Node is either a single machine or a cluster of machines. The first machine in a cluster is the manager. It receives a clock from its parent and distributes it to all children.

So a cluster might look like this:

    server
    +-- asnaroo
        +-- laptop
        +-- phone
        +-- headset
        +-- drone
    +-- 8bitkick
        +-- headset
    +-- dinguskhan
        +-- desktop
        +-- laptop
        +-- phone
    +-- mrdoob
        +-- phone

However, any node can only be seen by its parent, its children, and its siblings. So if "asnaroo" asks to see the system graph, he'll see this:

    server
    +-- asnaroo
        +-- laptop
        +-- phone
        +-- headset
        +-- drone
    +-- 8bitkick
    +-- dinguskhan
    +-- mrdoob

In other words, each node can query:

    parent
    siblings
    children

Each Node type in the tree can publish a set of streams. A stream is defined by a static object type, that changes over time. For instance:

    Phone {
        pos: Gps;
        clock: Time;
        cam: Image;
        mic: Audio;
        cap: Image;
        log: Text;
    }

    Drone {
        pos: Gps;
        orientation: Angle;
        clock: Time;
        cam: Image;
        mic: Audio;
        log: Text;
        battery: number;
    }

And nodes can publish "abstract streams", such as:

    asnaroo {
        message: string;
        cam: Image;
    }

    server {
        chat: Chat;     // Chat = class { messages: string[]; }
    }

Now of course, devices can also accept commands:

    Drone {
        fly_to(pos);
        rotate_to(direction);
        take_off();
        return_to_base();
        land();
        acquire_target();
        tase_target();
    }

But those commands can only be issued by their immediate parent. So asnaroo can only control asnaroo's drone, not mrdoob's phone.

So if you take the "stream directory" for a chat session, you might see something like:

    server : chat(path)
    asnaroo : mesh, audio, text
    8bitkick : image, text

___________________________________________________________________________________
## chat example for multi-point

    class Message {
        user: string;
        text: string;
    }

    class Chat {
        title: string;
        messages: Message[];
    }

    @feature class Chat extends Main {
        @shared static chat: Chat;

        @on post(message: Message) {
            SuperChat.chat.messages.push(message);
        }

        @every(1) render() {
            display(SuperChat.chat);
        }

        @on display(chat: Chat) {
            ... generate HTML ...
        }
    }

Note a conflict issue between classes and features. We have to figure out the fucking object system. It's super annoying.




    











_____________________________________________________________________
thinking about multi-point programming

We add a new modifier/decorator `shared` that does all the heavy lifting. Here, it marks `chat` as a shared object that lives on the server, with each subscribed client's local copy kept automatically up to date.

        shared chat: Chat;

`join` calls `get_shared`, which sets the local copy of `chat` to the current state of the server's copy, and adds the client to the list of subscribers to that object.

        on async join(chatPath: string) {
            chat = await get_shared<Chat>(chatPath);
        }

Because `post` modifies a shared variable, when a client calls it, the code runs an auto-generated proxy that sends the parameters (full copies of state?) plus the fn name (`post`) to the server. The server rebroadcasts the request (including the timestamped message) to all subscribed clients (including the originator) that run the code as if it was local. The server runs the code as well, but all non-shared functions eg `update_display` compile to stubs. (needs work)

        on post(message: Message) {
            chat.messages.push(message);
        }

`onKeyPressed` is a pure client function, even though it calls a shared function.

        on keypressed(key: string) {
            if (key == 'Enter') {
                post(new Message(...));
            }
        }

And then of course, on the client, we can modify `join` and `post` to update displays:

        after join(chatPath) { initialise_display(); }
        after post(message) { update_display(message); }

        on initialise_display() { ... }
        on update_display(message: Message) { ... }

So the basic idea is:

    any function that MODIFIES a shared variable is marked "push-var"
    any function that READS a shared variable subscribes to it.

    we need to move towards this "reactive" idea.
___
think about this:

what happens if each user is a cluster of machines; they're all running the same code.
they all have to subscribe to those objects.

So this idea of "shared" = "lives on server", and "non-shared" = lives on local machine isn't quite the whole story.

It's more like each variable "lives on machine X" => "is owned by X".

So, for example, imagine that we have a laptop and a phone; the phone runs a colour selection UI.

    cluster = { laptop, phone }

    on async change_background() {
        ui = await open_colour_ui();
        
    }


    on async open_colour_ui() {
        ... code to make a colour wheel ...
        ... set up events ...
        return object
    }

    on async get_colour_from_ui(ui) {
        return ui.c
    }

_____________________________________________________________________
This idea of STREAMS though is also an interesting way to think about it.




_____________________________________________________________________
OK so. Small aside for a silly but long-returned-to application:

name: 
wltm

observation: standing around in gay pubs is boring
but apps waste too much time

can we have something in-between dating apps and the pub, please?

wltm (would like to meet) is for people who want to meet people, not waste time

super simple interface: 

- you put in a picture (face and upper body) and your top/bottomness
- we show you pictures of real people near you; if you like them, you rank them
- you tell it when you next have a half hour to kill (could be now)
- at that time, we find you the best mutual match and you video chat.
- if there's people coming online that are ranked, we let you know.
- key is: when it's time, you don't know who you're going to chat with. It's a ...
    surprise!
- variation of this works in physical spaces : "go to this pub at this time"
- "holiday mode" : I'm in town X for Y days
- "you should go to X for Y days" eg. bear week { because everyone else is }

OH MY GOD
_____________________________________________________________________
observation: scheduling microclub meetings is hard. that's the task to solve here.
that's what we'll do.

next microclub.org will be:

1- feature modular typescript IDE
2- source code editable in itself
3- runs on mobile
4- is based around a "club meeting schedule"
   (you tell it where you are and when you're free)
   also: tell it best times of day for you
5- video chat with transcript; with 
6- integrated screencast

and let's develop this concept as a framework.
Let's see what happens.

Fundamentally, you have an open structure in which you have

    Nodes   (the machines)

In this case, each Node is a user that's online and paying attention right now.
Each Node publishes one or more streams (sequence of objects at X fps).
If you need a stream, you negotiate it with the publisher, and it streams to you.

Stream types are :

    - video/audio
    - KVM
    - animated meshes
    - commands
    - document-share

If you want to run some code on a machine, you hand it the code (i.e. the features), and it runs it locally.

Each Node publishes a sort of "menu" of what it streams it accepts and can provide.

For instance: let's say you're working on your laptop, and you have a phone and a 360 camera, and a VR headset, and a drone.

Drone = accepts command/position/orientation stream, returns video/audio/gps stream
360Cam = accepts command stream, returns still / video (image stream)
VRHeadset = accepts an animated mesh, returns video/pose stream



_____________________________________________________________________
testing: I think that's a good one to look at next.
the other is: auto-logging.

I definitely want better logging happening, and I want it auto-generated.



_____________________________________________________________________
Thoughts about multi-point programming.
Let's call it "heterogenous cluster programming".

A "homogenous cluster" is an array of the same type of unit.
A "heterogenous cluster" is an array of homogenous clusters.

unit = 
    a single sequential processor
OR  a single i/o device
OR  a *cluster* : an array of units, plus comms

So for instance, a client + server is a unit in which:

unit:
    client:
        gpu[]
        cpu[]
        camera
        display
        keyboard
        mouse/trackpad
    server
        gpu[]
        cpu[]
        database
        LLM

"database" is as interesting one in that there's an idea of "permanence".

Quite like the idea of a "functional unit" = something with an input, that produces output.

    instructions + data => (cpu) => data

    request + data => (database) => data

In this way, we can think of the user as a unit as well.

    display + audio => (user) => keyboard + trackpad + mic + cam

so (keyboard, mic, trackpad, display) are "channels" carrying something
and (user, database, llm) are different "functions" that turn A into B;
they're _stateful_ things : you can send them "const-requests" that just return stuff
and don't change their state, but you can also send them "do-this" requests
that do change their state.

And of course those "functions" can be spread across multiple physical machines.

And there could be multiple users, and multiple channels. 

For instance: a single large screen viewed by 20,000 viewers. (audience), while they interact by sending messages or photographs back to the system.

let's take chat as an example:

the "chat" is the database; you're making operations on it (add message, edit, delete). 

N users, and a central object (the "chat").
We can imagine two scenarios: server, and serverless (info only exists on clients).

So there's clearly some notion of "persistence" or "centrality"; something that persists beyond a single run, versus something that's dynamic, session, or client lifespan.

So let's make those "visible" somehow: 

server.object => eg. the chat
client.object => eg. settings
client.dynamic => eg. the view interface

but remember again that we're dealing with a "network" of machines. Quite interesting to think of (for example) a drone camera, that we can command ("go to xyz/rot") and receive a video/audio stream from.

If we think about it, each "user" will be a cluster of machines, something like:

- central server
- user server
- user laptop
- user tablet
- user phone
- user headset
- 360 camera
- drone

The point is, all these machines have to collaborate to provide the final output.
Then it's just "who wants to see what".

So for instance:

    client[1].video

    client[2]: render client[1].video

So we can imagine all this happening on a single machine. We'd like this to feel the same regardless of how many users / devices per user there are.

_____________________________________________________________________
The "ideal collaborative programming interface"

1- it's time/feature organised
2- it has space for conversation, trying stuff out, notes, scribbles, as well as the final product.
3- ideally, one flows seamlessy into the other
4- AI is just a participant in this process, so it still works if it fails or underperforms

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
