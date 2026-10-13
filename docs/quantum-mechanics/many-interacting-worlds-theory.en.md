# Theory: many interacting worlds

The [many-interacting-worlds](../../simulations/quantum-mechanics/many-interacting-worlds/index.html)
simulation implements the proposal of Hall, Deckert and Wiseman [2014]: quantum
mechanics as the statistics of N classical worlds that repel each other. This
document gives the equations with the notation of `js/model.js`, lists the exact
results the simulator checks against, and separates published theory from the
simulator's working choices. Usage and parameters:
[many-interacting-worlds-simulation-guide.en.md](many-interacting-worlds-simulation-guide.en.md);
Italian version:
[many-interacting-worlds-theory.it.md](many-interacting-worlds-theory.it.md).

## 1. From the wave function to trajectories

Madelung [1927] rewrote the Schrödinger equation as a fluid: with
ψ = √ρ · exp(iS/ħ), the density ρ and the velocity field v = ∇S/m obey classical
hydrodynamics plus one extra term, the **quantum potential**

```
Q = -(ħ²/2m) · (∂²√ρ/∂x²) / √ρ
```

Bohm [1952] read the same equations as mechanics: point particles follow
trajectories guided by ψ, and every quantum effect enters through the force
-∂Q/∂x. In both readings the wave function remains a fundamental object.

The many interacting worlds (MIW) approach drops it. Take N worlds, each a
classical particle with a definite position x[n] and velocity v[n], and let ρ be
approximated by the empirical density of the worlds themselves. Q then becomes an
**inter-world potential**: each world feels its neighbours, and the force that in
Bohm's theory came from ψ now comes from a repulsion between nearby worlds. The
wave function, if one still wants it, is an emergent description of the ensemble;
nothing in the dynamics refers to it. Precursors with a continuum of trajectories
are Poirier [2010] and Schiff and Poirier [2012]; the finite-N theory with its
toy force is Hall, Deckert and Wiseman [2014]; the "mass density of worlds"
reading is discussed by Sebens [2015] and Boström [2015].

## 2. The model in one dimension

Units ħ = m = 1. The N worlds keep a fixed order x[0] < x[1] < ... < x[N-1],
with gaps g[n] = x[n+1] - x[n], inverse gaps s[n] = 1/g[n] (s[-1] = s[N-1] = 0)
and differences D[n] = s[n] - s[n-1]. The inter-world potential used by HDW and
by `model.js` is

```
U = (1/8) · Σ_n D[n]²
```

which is the discrete form of the average of Q over equally weighted worlds. Its
gradient is exact and local (only nearest gaps enter), so forces cost O(N):

```
dU/dx[m] = (1/4) · ( D[m]·(s[m]² + s[m-1]²) - D[m+1]·s[m]² - D[m-1]·s[m-1]² )
```

with out-of-range D treated as zero. Each world then follows Newton's equation
in the external potential V(x) = ω²x²/2 (ω = 0 for a free particle) plus this
repulsion:

```
a[m] = -dU/dx[m] - ω²·x[m]
```

The repulsion diverges as 1/g³ when two worlds approach, so worlds never cross
and the ordering is preserved for all times. With N = 1 the potential U vanishes
identically: a single world is purely classical. Quantum behaviour is a
collective property of the ensemble, not of any one world.

## 3. Exact results at finite N

These are theorems of the toy model, not large-N approximations, and the
simulator displays each one next to the measured value.

**Stationary oscillator.** A configuration at rest is stationary when
dU/dx[m] = -ω²x[m] for every m, which reduces to D[n] = -2ω·x[n] and hence to
the recurrence s[n] = s[n-1] - 2ω·x[n] closed by s[N-1] = 0. `groundState`
solves it by shooting on the leftmost world. The configuration satisfies the sum
rule

```
Σ_n x[n]² = (N-1)/(2ω)
```

**Zero-point energy.** The energy of that configuration is exactly

```
E = (N-1)·ω/2
```

which tends to the quantum ground state energy ω/2 per world as N grows, and is
zero for N = 1: the zero-point energy is the energy stored in the repulsion.

**Uncertainty relation.** Define the momentum spread of the ensemble as
Δp² = Var(v) + 2U/N. The second term plays the role of the osmotic (quantum)
part of the momentum in stochastic and Bohmian mechanics: it is the part stored
in the inter-world interaction. For the stationary oscillator the product is
exactly

```
Δx·Δp = (1 - 1/N)·ħ/2
```

approaching the Heisenberg bound ħ/2 from below as N grows, and vanishing for
N = 1 [Hall, Deckert and Wiseman 2014, eq. 22].

**Free spreading.** Switching the trap off (ω = 0) at t = 0 from the stationary
configuration gives the exact solution x[n](t) = x[n](0)·√(1+ω²t²), the same
law as the width of a quantum Gaussian packet. The repulsion converts U into
kinetic energy, exactly as the quantum packet converts Q into spreading.

**Interference.** Two packets launched against each other do not pass through
one another (worlds cannot cross): the repulsion channels the worlds into bands
of alternating high and low density with spacing close to πħ/p, the analogue of
the fringes of the two-packet interference pattern. This result is numerical,
not closed form, and reproduces the behaviour reported by HDW.

## 4. Measurement: collapse as conditioning

MIW has no collapse postulate. All N worlds are equally real; an observer lives
in one of them and sees the definite position of that world. A position
measurement with resolution δ does two things:

- **Born rule.** The recorded outcome is the position of the world the observer
  happens to inhabit. With equally weighted worlds this is a uniform draw among
  the N, and since the density of worlds approximates |ψ|², the frequency of
  outcomes near x approximates |ψ(x)|²: the Born rule is counting worlds.
- **Conditioning.** After the record "the particle is within δ of X", the worlds
  compatible with the record form a sub-ensemble that keeps interacting. The
  incompatible worlds do not vanish and are not merged: their coupling with the
  compatible ones becomes irrelevant to the observer, and in the simulator each
  discarded bin evolves on its own from that moment.

So the "collapse as intersection of realities" intuition holds in one precise
sense: the post-measurement state is the **selection of the sub-ensemble** of
worlds that agree with the record, and Δx collapses from the width of the whole
ensemble to at most δ. It is never a fusion: no two worlds ever become one, and
the discarded worlds go on existing. This mechanism is different from the
branch **convergence** explored in the
[many-worlds convergence](many-worlds-convergence-theory.en.md) simulation,
where distinct histories merge into one node and amplitudes add: here nothing
merges and nothing interferes at the measurement, the ensemble is only split.

The squeezing has a cost: conditioning leaves the kept worlds packed at
distances of order δ with a large interaction energy U, which immediately
reconverts into spread. That is the Heisenberg kick of a sharp position
measurement, visible in the simulator as the kept bin exploding outwards.

## 5. What the toy model leaves out

- **The large-N limit.** That the HDW dynamics converges to the Schrödinger
  equation as N tends to infinity is argued and checked numerically, but a general
  proof is open. Finite N gives small deviations from quantum mechanics, which
  HDW present as a potentially testable feature.
- **One particle in one dimension.** Entangled systems need worlds that are
  points in configuration space; ordering arguments and the simple 1/g force do
  not carry over directly, and interacting multi-particle MIW is an active
  research problem [Hall, Deckert and Wiseman 2014, sec. VII; Herrmann et al.
  2018 study numerical schemes].
- **Equal weights.** The model gives every world the same weight; non-uniform
  weights would change both the potential and the Born-rule counting.
- **Spin and identical particles** have no MIW formulation in this toy model.
- **The force is one choice among many.** U is the simplest discretisation of
  the quantum potential for ordered worlds on a line; other interactions with the
  same continuum limit exist and differ at finite N.

## Bibliography

Hydrodynamic and pilot-wave formulations

- Madelung, E. (1927). Quantentheorie in hydrodynamischer Form. *Zeitschrift für
  Physik* 40, 322-326.
- Bohm, D. (1952). A suggested interpretation of the quantum theory in terms of
  "hidden" variables, I and II. *Physical Review* 85(2), 166-179 and 180-193.
- Holland, P. R. (1993). *The Quantum Theory of Motion*. Cambridge University
  Press.

Trajectory ensembles without a wave function

- Poirier, B. (2010). Bohmian mechanics without pilot waves. *Chemical Physics*
  370(1-3), 4-14.
- Schiff, J., Poirier, B. (2012). Quantum mechanics without wavefunctions.
  *Journal of Chemical Physics* 136, 031102.

Many interacting worlds

- Hall, M. J. W., Deckert, D.-A., Wiseman, H. M. (2014). Quantum phenomena
  modelled by interactions between many classical worlds. *Physical Review X* 4,
  041013. arXiv:1402.6144.
- Sebens, C. T. (2015). Quantum mechanics as classical physics. *Philosophy of
  Science* 82(2), 266-291. arXiv:1403.0014.
- Boström, K. J. (2015). Quantum mechanics as a deterministic theory of a
  continuum of worlds. *Quantum Studies: Mathematics and Foundations* 2,
  315-347. arXiv:1410.5653.
- Herrmann, H., Hall, M. J. W., Wiseman, H. M., Deckert, D.-A. (2018). Ground
  states in the many interacting worlds approach. arXiv:1712.01918.
