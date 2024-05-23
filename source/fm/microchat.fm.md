ᕦ(ツ)ᕤ
# Program

extends: nothing. children: [Server](#Server)

## Purpose

The `Program` feature stands for the whole program.

## How to use

Call `main`, and it should print the nøøb sigil.

    main() => "ᕦ(ツ)ᕤ"

## Implementation

`main` is just an empty function that does nothing, other than log the nøøb sigil to the console.

    on main() { 
        log("ᕦ(ツ)ᕤ"); 
    }

`log` is the same as console.log, just less typing.

    on log(...args: any[]) { 
        console.log(args); 
    }

# Server
extends: [Program](#Program). children: [Get](#Get), [Hello](#Hello)

## Purpose

`Server` implements a basic deno server with rudimentary 'get' support, enough to return index.html, style.css, any font, and main.js.

## How to use

Start the server with

    main()

And then it should respond to a `curl` request correctly:

    curl(...) => "expected result"

## Implementation

`main` calls `startServer`

    after async main() {
        startServer();
    }

`startServer` starts the deno server, passing each incoming request to `handler`.

    on async startServer() {
        deno_http.serve(handler, { port: 8000 });
    }

`handler` handles any request from the client, and returns a Response. To start with, it just returns `notFound`.

    on async handler(req: Request): Promise<Response|undefined> {
        return notFound();
    }

`notFound` returns a 404 "not found" response to the client

    on async notFound() : Promise<Response> {
        return new Response("Not found", { status: 404 });
    }

# Get

`Get` handles get requests for basic public files, such as index.html and .js files.

    before async handler(req: Request): Promise<Response|undefined> {
        if (request.method == "GET") { return get(request); }
    }

    on async get(req: Request): Promise<Response|undefined> {
        let path = getLocalPath(req);
        return deno_file.serveFile(req, path);
    }

    const publicFolder = "...";

    on getLocalPath(req: Request): string {
        let path = pathFromUrl(req.url);
        return translatePath(path);
    }

    on pathFromUrl(url: string): string { ... }
    on translatePath(path: string): string { ... }

# Hello
    
    feature Hello extends [Main](./main.fm.md)

This prints the message "hello world" in heading 1 style. 

The new behaviour adds to the end of the `main()` function:

    after main() { 
        hello("world"); 
    }

`hello` takes a string and outputs a greeting in header 1 style.

    on hello(name: string) { 
        print("h1", `hello, ${name}!`); 
    }

`print` displays a list of arguments as a text string.

    on print(style: string, ...args: any[]) { 
        display(textElement(style, join(args))); 
    }

`format` converts a list of arbitrary-type arguments to a single string.

    on format(...args: any[]): string {
        return args.map(arg => toString(arg)).join(' '); 
    }

`toString` converts a single arg of any type to a string.

    on toString(arg: any) {
        if (typeof arg === 'object') { 
            return objectToString(arg); 
        }
        else { 
            return String(arg); 
        }
    }

`objectToString` converts something of type `object` to a string.

    on objectToString(arg: object) {
        try { 
            return JSON.stringify(arg, null, 2); 
        } 
        catch (error) { 
            return String(arg); 
        }
    }

`textElement` creates an HTML text element of the chosen style.

    on textElement(style: string, text: string) : HTMLElement {
        return element(`<${style}>${text}</${style}>`);
    }


`element` returns a generic HTML element made from an arbitrary HTML string.

    on element(html: string) : HTMLElement {
        let el = document.createElement('div');
        el.innerHTML = html;  
        return el.firstChild as HTMLElement;
    }

`display` adds an HTML element to the top-level 'container' element in the document, or throws an error if it can't find it.

We find the container element once at the start to avoid finding it every time:

    static container: HTMLElement | null;

    before main() {
        findContainer();
    }

    on findContainer() {
        container = document.getElementById("container");
        if (!container) { throw new Exception("failed to find container"); }
    }

... and `display` just appends it to that element.

    on display(element: HTMLElement) {
        container.appendChild(element);
    }