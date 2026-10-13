# RealityModels: physics simulations

Visual simulations of theories and interpretations of reality: quantum mechanics,
time, energy. The common thread is a mathematical block universe with many worlds,
close to Max Tegmark's mathematical universe hypothesis: all of spacetime exists at
once, motion is geometry and quantum branches are parts of the same structure.

Each simulation is a self-contained offline HTML page: open its `index.html` in a
browser, a double click is enough. No server, no installation.

To hand out a simulation as one file, build the single-file versions:

```
node tools/build-standalone.js
```

It writes `<simulation>.standalone.html` next to each `index.html`, with all
CSS and JavaScript (three.js included) embedded. That file runs anywhere on its
own; only the links to the docs need the repository.

To publish the project on the web, upload it to any host with PHP 7.4 or later and
open `index.php`. It lists the simulations and documents it finds on disk, so new
ones appear without editing it, and shows each Markdown document as a page.
URLs: `index.php?sim=<subject>/<name>`, `index.php?doc=<subject>/<name>`,
`&lang=it|en`.

The project is online at
[www.sparkilla.com/apps/RealityModels](https://www.sparkilla.com/apps/RealityModels/).

Italian version: [README.it.md](README.it.md).

## Simulations

### Relativity

A moving body and a body at rest in the block universe, 2+1 spacetime.
Guide: [block-universe-simulations-guide.en.md](docs/relativity/block-universe-simulations-guide.en.md). Theory:
[block-universe-relativity-theory.en.md](docs/relativity/block-universe-relativity-theory.en.md).

| Simulation | Content |
|---|---|
| [length-contraction](simulations/relativity/length-contraction/index.html) | Length contraction as the section of a tilted world tube. |
| [time-dilation](simulations/relativity/time-dilation/index.html) | Adds clock ticks and readings: time dilation. |
| [accelerated-motion](simulations/relativity/accelerated-motion/index.html) | A Born-rigid body that accelerates, brakes and stops: curved world tube. |

### Quantum mechanics

Guides: [many-worlds-simulation-guide.en.md](docs/quantum-mechanics/many-worlds-simulation-guide.en.md),
[many-interacting-worlds-simulation-guide.en.md](docs/quantum-mechanics/many-interacting-worlds-simulation-guide.en.md). Theory:
[many-worlds-convergence-theory.en.md](docs/quantum-mechanics/many-worlds-convergence-theory.en.md),
[many-interacting-worlds-theory.en.md](docs/quantum-mechanics/many-interacting-worlds-theory.en.md).

| Simulation | Content |
|---|---|
| [many-worlds](simulations/quantum-mechanics/many-worlds/index.html) | Many worlds: a tree of branches versus branches that merge when they share the same record (classical lattice and quantum walk with interference). |
| [many-interacting-worlds](simulations/quantum-mechanics/many-interacting-worlds/index.html) | Many interacting worlds: N classical worlds that repel each other reproduce uncertainty, zero-point energy, spreading, interference and collapse as selection of a sub-ensemble (Hall, Deckert and Wiseman, 2014). |

### Foundations

Glossary of the terms behind the project (MUH, CUH, it from bit, cumulative
hierarchy, regress of containers):
[mathematical-universe-glossary.en.md](docs/foundations/mathematical-universe-glossary.en.md).

Guide: [algorithmic-probability-simulation-guide.en.md](docs/foundations/algorithmic-probability-simulation-guide.en.md). Theory:
[algorithmic-probability-theory.en.md](docs/foundations/algorithmic-probability-theory.en.md).

| Simulation | Content |
|---|---|
| [turing-census](simulations/foundations/turing-census/index.html) | Census of all the small Turing machines: the halting outputs build the universal distribution, simple strings win by counting alone. |

## Language and theme

The gear in the top-right corner opens the settings: language (Italian, English) and
theme (system, light, dark). Choices are saved in the browser and shared by all
simulations. `?lang=it` or `?lang=en` in the URL takes precedence.

## Structure

```
README.md, README.it.md
docs/<subject>/
  <topic>-theory.{it,en}.md               theory, formulas, references
  <topic>-simulation(s)-guide.{it,en}.md  usage, parameters, numerical checks
  <topic>-glossary.{it,en}.md             terms, references
simulations/<subject>/<simulation>/
  index.html, css/, js/                   one simulation
simulations/shared/
  lib/                                    three.js r121 and OrbitControls (local copies)
  js/settings.js, css/settings.css        language and theme panel
tools/build-standalone.js                 builds the single-file versions
index.php                                 web front end: navigates simulations and docs
```

Subjects: `relativity`, `quantum-mechanics`, `foundations`.
