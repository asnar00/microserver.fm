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

## research plan

Research and development will proceed as follows:

## core track

The core track develops the programming language and the tooling workflows.

### fnf.ts

`fnf.ts` (*feature normal form* for typescript) explores `fm.ts`, a feature-modular dialect of typescript; and a *literate* approach to expressing programs in `fm.ts` that combines specification, documentation, tests, and other meta-code artefacts with the code, in a human-first presentation format based on markdown.

### zerp

Written in `fnf.ts`, `zerp` (the 'zero repl') is a wysiwyg editor for `fnf.ts` programs, exploring feature-modular workflows for editing, exploration, deployment, testing, logging, fault replication and diagnosis, and so on. `zerp` also acts as a framework for deploying LLM-based coding tools, with the goal of being able to translate code from `fnf.ts` to `zero` and back.

### zero

Having hopefully gained enough road mileage with `fnf.ts`, we apply the lessons learned to v2.0 of the specification document for the zero programming language (as gleaned from the prompts to `zerp`). This, along with motivating examples for each language feature, becomes the "base level" going forward.

### zinc

Once this is done, we're ready to build ourselves a compiler! `zinc` (the zero incremental compiler) processes fnf zero code (freshly output by the translation engine in `zerp`) and turns it into whatever we like, in a just-in-time / incremental fashion that effectively drives compile times to .. zero.

### zinc => wasm

We then add a backend for `wasm` (*web assembly*) so people can write and run zero programs in their browser, at a tolerably decent speed. At which point, we can see if what we have is "delightful" enough to proceed.

### zinc => WebGPU

Once `zinc` is working on WebASM, the logical next step is to add a backend for WebGPU, and put in the tooling to make them interoperate. This is essential because GPU considerations have to push on the language design.

## platform track

The platform track focuses on getting zero / one running on an actual physical platform, free of dependencies on legacy code.

### zinc => ARM

A native ARM code generator (and optimiser) that lets us compile zero programs to run on MacOS / Linux. 

### zinc => vulkan

Although Vulkan is a legacy dependency, it means that at least zero programs will be able to run natively on linux.

### hypervisor

Based on ideas from the Qubes operating system, we use zero/zerp/zinc to create a hypervisor-level task scheduler, running on a reference ARM-based system, removing our Linux dependency.

### zinc => native GPU

This brings zero code to the GPU on our reference system, removing the dependency on Vulkan (and all legacy APIs etc).

## UI (User Interface) track

### whisper

`whisper` is a head-mounted, audio-operated "personal cognitive assistant" - basically, a pair of headphones coupled with a 360-degree camera, streaming to a backpack computer. This form gives us portability, and enough power to explore technologies slightly beyond the curve of mobile.

### escape

`escape` is a head-mounted VR headset: a small, light OLED HMD like the bigscreen beyond, used in conjunction with `whisper`. Inside-out tracking uses `whisper` 360-cameras, and all UI elements carry over from `whisper`. We eschew eye-tracking and use head movements / aiming instead. The key is that it's hella high resolution and runs at 240Hz, but the graphics complexity is scalable so everything can run that fast.