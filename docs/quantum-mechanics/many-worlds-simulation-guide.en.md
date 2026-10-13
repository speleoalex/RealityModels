# Multiverse with convergences

Interactive simulation of a multiverse in which the branches produced by quantum
measurements can **reconverge** instead of only forming a tree. It has no
dependencies and works offline.

Open it by double-clicking
[simulations/quantum-mechanics/many-worlds/index.html](../../simulations/quantum-mechanics/many-worlds/index.html)
(or from any static server); nothing to install. Theory and references:
[many-worlds-convergence-theory.en.md](many-worlds-convergence-theory.en.md); Italian version: [many-worlds-simulation-guide.it.md](many-worlds-simulation-guide.it.md).

## Idea

In the many-worlds interpretation every measurement with **N** outcomes splits
every world into N branches, and after **t** measurements the tree has N^t worlds.
Here a world is described only by its **record** k, the sum of the outcomes (each
outcome is worth 0..N−1). Two branches that reach the same k at the same step are
the same world and converge, so the structure becomes a lattice with (N−1)·t+1
nodes at step t.

The record is drawn as x = 2k − (N−1)·t, centred on zero (for N=2 it changes by ±1 at
every measurement, as in a random walk).

## The three regimes

| Regime | What it shows |
|---|---|
| **Tree** | Naive counting: every measurement splits every world, N^t distinct worlds, all with probability N^−t. Hovering a world highlights its history (outcomes) and the worlds with the same record, the ones the other regimes would merge. At most 4096 worlds are drawn (T ≤ 12 for N=2, 7 for N=3, 6 for N=4). |
| **Classical convergence** | Worlds with the same record merge and their **probabilities** add: p(k) = (outcome sequences giving k) / N^t. The distribution is a bell of width σ ∝ √t. |
| **Quantum convergence** | Worlds with the same record merge and their **amplitudes** add, so they interfere. Some branches cancel (dashed), some worlds are left with zero probability (empty circles) and the distribution spreads as t, faster than in the classical case. |

The lattice is computed once for all regimes; the regime only decides what to
draw.

## Model

The quantum regime is a **coined quantum walk** on the record k, exactly
unitary.

- every node carries N amplitude components ψ(k, c), one per outcome;
- at every step the DFT coin U[c][d] = exp(2πi·c·d/N)/√N (Hadamard for N=2) mixes
  the components of each node, then component c moves to node k+c:
  ψ_{t+1}(k+c, c) = Σ_d U[c][d]·ψ_t(k, d);
- the system starts in state |0⟩ of node k=0;
- node probability p(k) = Σ_c |ψ(k, c)|²; flow along branch c of node k:
  |(Uψ)_c|², computed after the coin and before the shift.

Component c of node k+c comes only from node k. The amplitudes of converging
branches therefore sit in different components and interfere at the coin of the
next step. The sum of the probabilities stays 1 at every step.

The **phase disorder** D ∈ [0, 1] rotates every node by a random phase
|φ| ≤ π·D before the coin (seeded generator, reproducible). The evolution stays
unitary. With large D the interference becomes incoherent and the spreading turns
diffusive again (σ ∝ √t), as in the classical regime.

In the classical case the flow along each branch is p(k)/N and the probabilities add.

## Parameters and query string

| Parameter | Query | Range | Default |
|---|---|---|---|
| Outcomes per measurement N | `n` | 2–4 | 2 |
| Measurements T | `T` | 1–40 (tree: see limit above) | 20 |
| Regime | `reg` | `tree`, `classical`, `quantum` | `quantum` |
| Phase disorder D | `dis` | 0–1 | 0 |
| Random seed | `seed` | 0–99999 | 1 |
| Displayed measurement t | `step` | 0–T | T |
| View | `view` | `graph`, `table` | `graph` |
| Language | `lang` | `it`, `en` | browser |

Example: `index.html?n=2&T=30&reg=quantum&step=30`.

Language and theme (System, Light, Dark) are set with the gear button at the top
right. They are saved in the browser and apply to the other simulations too.

## Readings

They all refer to the displayed step t.

- **Tree worlds** N^t and **distinct worlds** (N−1)·t+1.
- **Effective worlds** 1/Σp²: how many worlds really "weigh" (N^t if all the
  worlds of the tree had the same weight, much less in the lattice).
- **Spread σ**: standard deviation of the record x.
- **Branches cancelled by interference**: branches leaving step t−1 with quantum
  flow below 10⁻⁹.
- **Worlds with zero probability**: nodes of step t with quantum probability below
  10⁻⁹.

Classical and quantum readings appear in every regime, so they can be compared.

## Graph legend

- Time horizontally, record x vertically (tree view: fan of worlds).
- Node size and colour grow with probability, relative to the maximum of the
  step. Branch opacity is proportional to the flow.
- Dashes and empty circles: branches and worlds cancelled by interference.
- Pointer on a node: the node, the branches converging into it and the nodes they
  come from turn orange. The tooltip shows the record, outcome sequences and the
  two probabilities.
- Histogram at the bottom: distribution at step t. In the quantum regime the
  orange outline is the classical distribution.
- **Table** view: the same numbers for step t, with the ratio quantum p /
  classical p.

## Structure

```
simulations/quantum-mechanics/many-worlds/
├── index.html      page and control panel
├── css/style.css   theme tokens (light, dark, system) and responsive layout
├── js/i18n.js      it/en dictionaries and translation functions
├── js/model.js     lattice, quantum walk, statistics (also usable from Node)
├── js/graph.js     Canvas renderer, tooltip, histogram
└── js/app.js       controls, query string, animation
```

The settings button (language and theme) is shared by all simulations and lives in
`simulations/shared/` (`js/settings.js`, `css/settings.css`).

## Simplifications

- Convergence is imposed by construction: two histories are "the same world" if
  they have the same record. The criterion is deliberately coarse and allows an
  exact, computable lattice.
- If the amplitudes of converging branches were added directly, without a coin,
  the dynamics would not be unitary. The coined quantum walk is the standard way to
  make propagation on a lattice unitary.
- The initial state |0⟩ with the Hadamard coin gives an asymmetric distribution, a
  known property of the Hadamard walk.
- The tree view is only counting and simulates nothing beyond the lattice.

## Verification

```
cd simulations/quantum-mechanics/many-worlds && node -e 'const M=require("./js/model.js"); const I=require("./js/i18n.js").I18n; const L=M.buildLattice({outcomes:2,steps:3}); console.log(L[3].map(n=>n.pQuantum.toFixed(3)).join(" "), I.check().length)'
```

Expected: `0.125 0.625 0.125 0.125 0` (known distribution of the Hadamard walk at
t=3 and no missing keys in the dictionaries).
