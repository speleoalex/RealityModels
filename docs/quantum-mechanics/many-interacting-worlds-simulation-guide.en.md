# Many interacting worlds

Interactive simulation of the Hall, Deckert and Wiseman model: N classical
worlds, each with the particle at a definite position, repel each other and
Newton's equations alone reproduce uncertainty, zero-point energy, packet
spreading, interference and the collapse of a measurement. It has no
dependencies and works offline.

Open it by double-clicking
[simulations/quantum-mechanics/many-interacting-worlds/index.html](../../simulations/quantum-mechanics/many-interacting-worlds/index.html)
(or from any static server); nothing to install. Theory and references:
[many-interacting-worlds-theory.en.md](many-interacting-worlds-theory.en.md);
Italian version:
[many-interacting-worlds-simulation-guide.it.md](many-interacting-worlds-simulation-guide.it.md).

## Idea

Each world n is a classical particle with position x[n] and velocity v[n].
Neighbouring worlds repel with a force that grows as the gap shrinks (the
discrete quantum potential, units ħ = m = 1). With N = 1 the repulsion is zero
and plain classical mechanics remains; the quantum behaviour is a property of
the ensemble. The formulas and the exact results are in the theory document.

## Scenarios

| Scenario | What it shows |
|---|---|
| **Oscillator: ground state** | The repulsion balances the trap ω: a configuration at rest with energy (N−1)·ħω/2 and Δx·Δp = (1−1/N)·ħ/2, both shown next to their measured values. Set N = 1 to see both vanish. |
| **Free particle: spreading** | The trap is off from t = 0. The fan of worlds spreads as Δx(t) = Δx(0)·√(1+ω²t²); the reading compares the measured ratio with the law. |
| **Two packets: interference** | Two relaxed packets launched head on at ±v₀ with no trap. Worlds never cross: the repulsion channels them into density bands with spacing about πħ/p, the interference fringes. |
| **Measurement: picking a bin** | The ground state plus a position measurement with resolution δ. One world drawn uniformly (Born rule for equal weights) fixes the outcome; the worlds within δ stay one interacting ensemble, the other bins decouple, fade and evolve on their own. Collapse is selection, never fusion. |

## Parameters and query string

| Parameter | Query | Range | Default |
|---|---|---|---|
| Scenario | `sc` | `ground`, `free`, `collision`, `measure` | `ground` |
| Worlds N | `N` | 1–80 | 20 |
| Trap frequency ω | `w` | 0.2–3 | 1 |
| Packet speed v₀ (collision only) | `v0` | 0.5–6 | 3 |
| Measurement resolution δ (measurement only) | `d` | 0.1–2 | 0.4 |
| Language | `lang` | `it`, `en` | browser |

Example: `index.html?sc=collision&N=40&w=0.5&v0=3`.

Language and theme (System, Light, Dark) are set with the gear button at the top
right. They are saved in the browser and apply to the other simulations too.

## Readings

- **Coupled worlds**: worlds still interacting with the drawn one / total. It
  drops at each measurement.
- **Δx**, **Δp**: spread of the positions and of the momenta of the coupled
  ensemble. Δp includes the osmotic term 2U/N, the part of the momentum spread
  stored in the inter-world repulsion U.
- **Δx·Δp** next to the **exact value (1−1/N)·ħ/2**: equal in the stationary
  state, larger otherwise.
- **Total energy** next to the **expected energy (N−1)·ħω/2** in the trap
  scenarios. The integrator keeps the energy drift around 10⁻¹⁶ per period in
  the ground state and below about 10⁻⁴ in the hardest collisions.
- **Δx(t)/Δx(0) vs √(1+ω²t²)** in the free scenario: the two numbers should
  match at all times.

After a measurement the kept bin is squeezed to a width of order δ with a large
repulsion energy, so Δx first collapses and then grows back fast: that is the
momentum kick a sharp position measurement must give.

## Graph legend

- Time horizontally, position vertically: one line per world. Worlds never
  cross.
- The world drawn by a measurement is thick and warm-coloured; discarded bins
  turn grey from the dashed vertical line marking the measurement time.
- Right strip: histogram of the current world density (grey for decoupled
  worlds) and, dashed, the quantum density |ψ|² expected in the stationary and
  free cases.
- Pointer on the graph: tooltip with the world index, position and, on the last
  instant, velocity.

## Structure

```
simulations/quantum-mechanics/many-interacting-worlds/
├── index.html      page and control panel
├── css/style.css   theme tokens (light, dark, system) and responsive layout
├── js/i18n.js      it/en dictionaries and translation functions
├── js/model.js     forces, ground state, integrator, measurement (also usable from Node)
├── js/graph.js     Canvas renderer: world lines, histogram, tooltip
└── js/app.js       controls, scenarios, query string, animation
```

The settings button (language and theme) is shared by all simulations and lives
in `simulations/shared/` (`js/settings.js`, `css/settings.css`).

## Simplifications

- One particle in one dimension, equally weighted worlds: the toy model of the
  2014 paper. No entanglement, no spin (see the theory document, section 5).
- The measurement splits the discarded worlds into bins no wider than δ and each
  bin keeps evolving as an independent ensemble; the kept ensemble is the one
  the readings describe.
- Velocity Verlet with adaptive substeps (the repulsion stiffens as 1/g³); a
  substep that would make worlds cross is halved and retried. The substep budget
  bounds the work per frame, so extreme parameters can slow the simulated time
  rather than the browser.

## Verification

```
cd simulations/quantum-mechanics/many-interacting-worlds && node -e 'const M=require("./js/model.js"); const I=require("./js/i18n.js").I18n; const x=M.groundState(11,1); const s=M.statistics(M.createState(x,null,1)); let sq=0; x.forEach(function(p){sq+=p*p}); console.log(sq.toFixed(6), s.energy.toFixed(6), s.product.toFixed(6), I.check().length)'
```

Expected: `5.000000 5.000000 0.454545 0` (sum rule Σx² = (N−1)/(2ω), energy
(N−1)·ω/2, product (1−1/N)/2 for N = 11, and no missing keys in the
dictionaries).

```
cd simulations/quantum-mechanics/many-interacting-worlds && node -e 'const M=require("./js/model.js"); const st=M.createState(M.groundState(21,1),null,0); const d0=M.statistics(st).dx; while(st.t<1-1e-9) M.step(st,0.05,1e6); console.log((M.statistics(st).dx/d0).toFixed(6))'
```

Expected: `1.414214` (free spreading √(1+t²) = √2 at t = 1).
