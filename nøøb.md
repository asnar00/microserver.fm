ᕦ(ツ)ᕤ
# nøøb.org
author: asnaroo, Jul 16 2024

## summary

- nøøb is a non-profit research and development foundation
- purpose: to create a feature modular computing platform
- products: 
    - *zero*, a programming language
    - *one*, an operating system
    - *home*, a home server
    - *whisper*, a personal cognitive assistant
    - *escape*, an XR headset

## motivation

On an *application modular* platform (a category that includes Windows, Linux, MacOS, iOS, Android, and all known extant systems), the smallest commercially shippable unit of code (*module*) is the *application*. A user can choose what applications to use, but within an application, the choice of features is controlled by the application maker.

This results in the persistence of *unmet needs* (features that users desire, but which are not economical or advantageous to the maker); and *dark patterns* (features that hinder or harm the user, but benefit the maker).

In a *feature modular* platform, by contrast, the smallest commercially shippable unit of code is the *feature*. Users are free to keep features they like, reject features they don't like, create new features, commission others to create features, and share them with other users.

A feature modular platform, therefore, is controlled by its users, rather than by its makers.

Our belief is that a feature modular platform, if it can be realised, has the potential to be more functional, more secure, and more trustworthy than application modular platforms. 

Our mission is to prove or disprove this belief.

## organisation

nøøb is a [community interest company](https://www.gov.uk/government/publications/community-interest-companies-how-to-form-a-cic/community-interest-companies-guidance-chapters) registered in the UK.

nøøb is run and funded by me, Ashraf Nehru (otherwise known as *asnaroo*), and a group of trustees.

nøøb is fully remote, with locations in Soho, London; Sitges, Spain; and Palo Alto, California.

## business approach

It is our belief that good systems cannot be created in a vacuum; instead, they must be driven and shaped by real-world applications. Further, we observe that profit-motivated investment (in the form of venture capital or private equity) inevitably has a distorting effect on both the culture of the organisation and its research and development agenda.

Our business model is therefore to invest in individuals or companies creating real-world applications and features using our platform. To align the interests of all concerned, these individuals and companies may also take a mutual stake in nøøb itself. This keeps the profit motive "outside the castle walls", but ensures that the users of the platform can exercise control over its direction.

## research agenda

Research and development will proceed in three phases.

### Phase one: understanding the problem

The result of phase one is :

- a language that we're confident is useful for real-world applications
- a reasonably performant, accessible implementation running on the web

#### fnf.ts

`fm.ts` is *feature modular* typescript - a feature-modular dialect of typescript, written in native typescript using decorators.

`fnf.ts` is *feature normal form* typescript - a markdown-based representation, organised into features, that includes specification, documentation, tests and tutorials, as well as the code itself. `fnf.ts` markdown files are processed to extract `fm.ts` code which is then compiled using `tsc`; the compilation report is then processed to map line numbers back to the markdown file.

#### zerp

`zerp` is a simple web-based literate IDE for `fnf.ts`, written in `fnf.ts`. It lets the user view and edit code using wysiwyg markdown, while collaborating with other users. It integrates features such as local-first storage, real-time collaboration via text, audio and video, and RAG/LLM-based code transformations.

A key feature of zerp is the abilty to translate code from one language to another. This allows us to move our `fnf.ts` code to zero, or to write code in zero that we then translate back to `fnf.ts` so we can run it. This allows us to evolve the definition of the language to suit our needs, without wasting any effort.

#### zinc

`zinc` (*zero incremental compiler*) is a parser / compiler framework for zero, written using `zerp`, that:     
- is independent of LLVM and other legacy toolchains
- allows us to experiment with language features easily
- allows us to add multiple backends
- has a just-in-time / incremental workflow
- allows fast fault replication, diagnosis and patching

Initially, we'll develop a WebASM backend, followed closely by a WebGPU backend. Once that is done, we'll mechanically translate all existing `fnf.ts` code into zero.

### Phase two: creating the core platform

The result of phase two is the `home` machine: a powerful and scalable server that can run zero features without relying on any legacy code.

#### Reference hardware

We build a multi-CPU, multi-GPU server - most likely a multicore ARM CPU, and two Nvidia GPUs - and write a zinc backend for it. This lets us run zero code running on top of Linux.

#### Hypervisor

Using ideas from the [Qubes](https://www.qubes-os.org/intro/) operating system, we create a native ARM [hypervisor](https://ashw-archive.github.io/arm64-hypervisor-tutorial-1.html) that acts as the operating system, hosting each task in its own virtual machine, with features running as close to the metal as possible.

### Phase three: developing the user experience

The result of phase three is a demonstration unit that maximises rendering and processing power while allowing the user to roam freely inside and outside, with VR / display as an optional rather than mandatory part of the interface.

#### backpack machine

This is a portable gaming-laptop machine based on the reference server, in a [backback format](https://www.zotac.com/page/zotac-vr-go-4) that can be worn out in the real world while still providing decent performance and connectivity. It includes GPS, mobile internet, and swappable battery.

#### whisper prototype

This is a headset combining a contact microphone, headphones, and twin 180-degree cameras. It is controlled through subvocal audio commands (whispering), and communicates through audio only. All processing is done on the backpack. We can add an iphone app to display things if necessary.

#### escape prototype

This is a compact OLED VR headset worn in conjunction with the whisper headset. Similar to the bigscreen beyond, but adding eye-tracking. All processing and rendering is done on the backpack.