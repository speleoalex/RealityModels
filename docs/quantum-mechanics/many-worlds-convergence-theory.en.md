# Theory: many worlds, tree and convergences

The [many-worlds](../../simulations/quantum-mechanics/many-worlds/index.html)
simulation compares three hypotheses: the "Tree", "Classical convergence" and
"Quantum convergence" regimes. This document describes them with the notation of
`js/model.js` and, for each one, separates published theory from the simulator's
working hypotheses. References in square brackets point to the bibliography at the
end. Usage and parameters: [many-worlds-simulation-guide.en.md](many-worlds-simulation-guide.en.md); Italian
version: [many-worlds-convergence-theory.it.md](many-worlds-convergence-theory.it.md).

## 1. The starting point: quantum measurement

A quantum state evolves deterministically and linearly (Schrödinger equation).
When an observable with N possible outcomes is measured, the Born rule gives
outcome c the probability |a_c|², where a_c is the amplitude of component c
[Born 1926]. In the standard formulation measurement is a second, discontinuous
kind of evolution: the state "collapses" onto the observed component [von Neumann
1932]. The three simulated hypotheses give different answers to the question
"what happens to the other N−1 components?".

The simulator keeps things minimal. At every step t it repeats the same
measurement with N equiprobable outcomes (c = 0, …, N−1), and a world carries only
its **record** k = Σ c, the sum of the outcomes. The graph shows the record
centred, x = 2k − (N−1)·t, so the distribution starts at x = 0 and stays
symmetric.

## 2. "Tree" regime: the many-worlds interpretation

### 2.1 The theory

Everett [1957] proposed to drop collapse. The universal wave function never
reduces, and after a measurement the observer is also in superposition, with one
copy per outcome. Each copy has a memory ("relative state") consistent with its
own outcome and cannot notice the others. The name "many worlds" and the spread of
the idea are due to DeWitt [1970; DeWitt and Graham 1973].

Branches become independent through **decoherence**. Interaction with the
environment (photons, gas, apparatus) ties each outcome to nearly orthogonal
environment states, and within extremely short times the interference terms
between branches become unobservable [Zeh 1970; Zurek 1991, 2003; Joos et al.
2003]. In the modern version of the interpretation the "worlds" are emergent
structures in the wave function, identified by decoherence, and need not be
postulated [Wallace 2012; Saunders et al. 2010; Vaidman 2021].

### 2.2 The model in the simulator

The "Tree" regime only counts. Every measurement multiplies the worlds by N, so
after t measurements there are

```
treeWorlds = N^t
```

distinct worlds, each with weight (squared modulus of the amplitude) N^(−t) and
identified by its outcome sequence (the base-N digits of the node index). Node
colour and the histogram at the bottom show how the worlds are distributed over
the record k: the fraction with record k is the multinomial coefficient divided by
N^t, i.e. the classical probability of the next regime. Hovering a world
highlights those with the same record, which stay distinct in the tree even
though their "content" is identical.

The limit of 4096 nodes (T ≤ 12 for N = 2) is purely graphical.

## 3. "Classical convergence" regime: worlds with the same record are the same world

### 3.1 The hypothesis

The simulator explores the hypothesis that the structure is not a tree. Two
branches that reach the same state (here: same record k at the same step t) are a
single world. The graph of worlds becomes a **lattice** with

```
distinct = (N−1)·t + 1
```

nodes at step t instead of N^t: linear growth, not exponential.

The idea is not part of the standard many-worlds interpretation, but it touches
the literature at several points:

- Everett identified branches with the observer's **memory sequences** [Everett
  1957, §5]. If the observer records only the total, two histories with the same
  total have the same memory.
- In the **consistent histories** formalism [Griffiths 1984; Omnès 1992;
  Gell-Mann and Hartle 1990] a history is a sequence of projectors. With a coarse
  graining that distinguishes only the record, histories with the same record
  become the same coarse-grained history. The condition that lets such histories
  be given classical probabilities (decoherence of histories) is exactly what
  separates this regime from the next.
- In the modern many-worlds interpretation, branches with the same macroscopic
  record and a different environment stay distinct, because what separates them
  is the state of the environment and not the observer's memory [Wallace 2012,
  ch. 3]. The classical regime therefore amounts to assuming that the record is
  the only information that survives.

### 3.2 The model in the simulator

If the probabilities of converging branches add without interference, the record
performs a **classical random walk** [Feller 1968, ch. III]: each step adds a c
uniform in {0, …, N−1}. The number of outcome sequences reaching node k (`paths`)
follows the recursion

```
paths_{t+1}(k + c) += paths_t(k)        for c = 0, …, N−1
```

(for N = 2 this is Pascal's triangle and the lattice is the Galton board), and

```
pClassical(k, t) = paths_t(k) / N^t
flowClassical[c] = pClassical / N
```

c has mean (N−1)/2 and variance (N²−1)/12, so x = 2k − (N−1)·t has mean 0 and
standard deviation

```
sigmaClassical = sqrt( t · (N²−1) / 3 )
```

that is, σ = √t for N = 2. The distribution widens as the square root of time
(diffusion) and by the central limit theorem tends to a Gaussian. The effective
number of worlds 1/Σp² (`effectiveClassical`) also grows as √t.

## 4. "Quantum convergence" regime: the amplitudes of converging branches add

### 4.1 The theory

If two branches really merge into the same state, quantum mechanics does not add
their probabilities. The **amplitudes** add, and the probability is the squared
modulus of the sum. This is the superposition principle in the form of Feynman's
sum over paths [Feynman 1948; Feynman and Hibbs 1965]: the amplitude of reaching a
point is the sum of the amplitudes of all histories that reach it, and different
histories interfere. Decoherence removes the interference and brings back the
classical regime; without decoherence, branches can cancel or reinforce each
other.

The many-worlds literature has explicitly discussed bringing "already separated"
branches of a measurement back into interference. Deutsch [1985] proposed a
thought experiment: an observer (a quantum computer) performs a measurement,
records the outcome and is then made to interfere with itself, which shows an
observable difference between collapse and no collapse. Hanson [2003] instead
studied what happens to the Born rule if small-amplitude worlds are "mangled" by
interference with larger worlds. In both cases branch convergence is a theoretical
possibility and does not describe the ordinary dynamics of macroscopic objects.

### 4.2 The model in the simulator: coined quantum walk

The usual way to propagate an amplitude on a lattice unitarily is the **coined
quantum walk** [Aharonov, Davidovich and Zagury 1993; Meyer 1996; Ambainis et al.
2001; Nayak and Vishwanath 2000; Kempe 2003; Venegas-Andraca 2012]. Adding the
amplitudes of converging branches directly is not enough, because the resulting
map does not preserve the norm. So each node gets an internal degree of freedom
with N components, the "coin", which here coincides with the outcome of the last
measurement.

The state at step t is the set of complex amplitudes ψ_t(k, c). One step works
like this:

1. **coin**: at every node the unitary matrix U is applied, here the discrete Fourier
   transform (function `dftCoin`)

   ```
   U[c][d] = exp(2πi · c · d / N) / sqrt(N)
   ```

   which for N = 2 is the Hadamard matrix; the DFT coin is the usual choice for
   coins with N > 2 faces [Mackay et al. 2002; Tregenna et al. 2003];
2. **shift**: component c moves to node k + c:

   ```
   ψ_{t+1}(k + c, c) = Σ_d U[c][d] · ψ_t(k, d)
   ```

The initial state is ψ_0(0, 0) = 1. The readings are

```
pQuantum(k, t)  = Σ_c |ψ_t(k, c)|²
flowQuantum[c]  = |(U ψ_t(k, ·))_c|²       (probability leaving along outcome c)
```

Branches converging on a node arrive in different coin components and meet in the
coin of the next step, where the amplitudes add and interfere. The sum of the
probabilities stays 1 at every step. In the graph, nodes with pQuantum < 10⁻⁹ are
empty and edges with flowQuantum < 10⁻⁹ dashed: these are the branches cancelled
by interference (`suppressedNodes`, `suppressedEdges`).

For N = 2 the model is the Hadamard walk, whose exact values are known: at step 3,
on the records x = −3, −1, 1, 3, the probabilities are 1/8, 5/8, 1/8, 1/8 [Kempe
2003, §3]. The distribution is asymmetric because the initial coin state |0⟩ is
not symmetric, a known property of the walk. The Hadamard walk with a localised
initial state also coincides with the "Feynman checkerboard", the discretisation
of the Dirac equation in 1+1 dimensions [Feynman and Hibbs 1965, problem 2-6;
Meyer 1996].

### 4.3 The observable difference: ballistic spreading

The main result of quantum walk theory is that the standard deviation grows
**linearly** with t (ballistic propagation), while in the classical walk it grows
as √t [Nayak and Vishwanath 2000; Ambainis et al. 2001]. Konno's limit theorem
[2002] gives the shape of the distribution: two peaks at the front, non-Gaussian.
In the simulator `sigmaQuantum` grows as ≈ 0.46·t for N = 2, and
`effectiveQuantum` (effective number of worlds) grows linearly instead of as √t.
Values computed by `buildLattice` and `statistics`:

| N | t | D | tree worlds | distinct nodes | classical effective no. | quantum effective no. | classical σ | quantum σ |
|---|---|---|---|---|---|---|---|---|
| 2 | 40 | 0 | 1.1·10¹² | 41 | 11.25 | 11.66 | 6.32 | 18.40 |
| 2 | 40 | 0.3 | 1.1·10¹² | 41 | 11.25 | 15.48 | 6.32 | 11.53 |
| 2 | 40 | 1 | 1.1·10¹² | 41 | 11.25 | 6.75 | 6.32 | 5.80 |
| 3 | 40 | 0 | 1.2·10¹⁹ | 81 | 18.35 | 34.58 | 10.33 | 28.35 |
| 4 | 30 | 0 | 1.2·10¹⁸ | 91 | 21.77 | 34.86 | 12.25 | 29.01 |

(seed 1; for N = 2 and D = 0 the quantum effective number is close to the
classical one because the Hadamard distribution puts much of the probability on
the two peaks).

## 5. Phase disorder: from quantum to classical

The parameter D ∈ [0, 1] multiplies the amplitudes of every node, before the coin,
by a random phase e^{iφ} with |φ| ≤ π·D, drawn at every step from a seeded
generator (`seededRandom`). The evolution stays unitary, but converging branches
arrive with random relative phases. This is a minimal model of **decoherence**:
the environment "marks" each branch with a phase the other branch does not know.

The quantum walk literature distinguishes two cases:

- **static disorder** (phases fixed in time, different for each node): produces
  Anderson localisation [Anderson 1958] and the distribution stays confined near
  the origin;
- **dynamic disorder** (new phases at every step, as here): destroys interference
  and brings propagation back to the diffusive regime σ ∝ √t of the classical walk
  [Brun, Carteret and Ambainis 2003; Kendon and Tregenna 2003]. Schreiber et al.
  [2011] observed both behaviours with photons.

The simulator uses dynamic disorder. For D → 1 `sigmaQuantum` again grows as √t
(≈ 0.93·√t for N = 2, versus √t in the classical regime), the empty nodes and
dashed edges change with the seed and the histogram approaches the classical
outline. D therefore interpolates between regime 4 (D = 0) and a "noisy" version
of regime 3. It is the same transition by which, in the many-worlds
interpretation, decoherence makes branches effectively independent [Zurek 2003].

## 6. What the model does not say

- The measurements are all identical and equiprobable and the only state is the
  record k: the model does not describe any particular physical system.
- "Same record = same world" is the hypothesis being explored. In the standard
  interpretation branches stay distinct because of the environment (§3.1).
- The coin is a modelling choice, needed for unitarity. Different coins (for
  example the Grover coin for N ≥ 3) give different distributions [Tregenna et al.
  2003].
- The tree view counts worlds and simulates nothing: each node weighs N^(−t), with
  no amplitudes.

## References

Many-worlds interpretation and decoherence

- Everett, H. (1957). "Relative State" Formulation of Quantum Mechanics. *Reviews
  of Modern Physics* 29(3), 454–462.
- DeWitt, B. S. (1970). Quantum mechanics and reality. *Physics Today* 23(9),
  30–35.
- DeWitt, B. S., Graham, N. (eds.) (1973). *The Many-Worlds Interpretation
  of Quantum Mechanics*. Princeton University Press.
- Deutsch, D. (1985). Quantum theory as a universal physical theory.
  *International Journal of Theoretical Physics* 24(1), 1–41.
- Hanson, R. (2003). When worlds collide: quantum probability from observer
  selection? *Foundations of Physics* 33(7), 1129–1150.
- Saunders, S., Barrett, J., Kent, A., Wallace, D. (eds.) (2010). *Many
  Worlds? Everett, Quantum Theory, and Reality*. Oxford University Press.
- Wallace, D. (2012). *The Emergent Multiverse: Quantum Theory according to the
  Everett Interpretation*. Oxford University Press.
- Vaidman, L. (2021). Many-Worlds Interpretation of Quantum Mechanics. In
  *The Stanford Encyclopedia of Philosophy*,
  https://plato.stanford.edu/entries/qm-manyworlds/
- Zeh, H. D. (1970). On the interpretation of measurement in quantum theory.
  *Foundations of Physics* 1(1), 69–76.
- Zurek, W. H. (1991). Decoherence and the transition from quantum to classical.
  *Physics Today* 44(10), 36–44.
- Zurek, W. H. (2003). Decoherence, einselection, and the quantum origins of the
  classical. *Reviews of Modern Physics* 75(3), 715–775.
- Joos, E., Zeh, H. D., Kiefer, C., Giulini, D., Kupsch, J., Stamatescu, I.-O.
  (2003). *Decoherence and the Appearance of a Classical World in Quantum
  Theory*, 2nd ed. Springer.

Consistent histories and coarse graining

- Griffiths, R. B. (1984). Consistent histories and the interpretation of
  quantum mechanics. *Journal of Statistical Physics* 36(1–2), 219–272.
- Omnès, R. (1992). Consistent interpretations of quantum mechanics. *Reviews of
  Modern Physics* 64(2), 339–382.
- Gell-Mann, M., Hartle, J. B. (1990). Quantum mechanics in the light of quantum
  cosmology. In W. H. Zurek (ed.), *Complexity, Entropy and the Physics of
  Information*, Addison-Wesley, 425–458.

Measurement, Born rule, sum over paths

- Born, M. (1926). Zur Quantenmechanik der Stoßvorgänge. *Zeitschrift für Physik*
  37, 863–867.
- von Neumann, J. (1932). *Mathematische Grundlagen der Quantenmechanik*.
  Springer.
- Feynman, R. P. (1948). Space-time approach to non-relativistic quantum
  mechanics. *Reviews of Modern Physics* 20(2), 367–387.
- Feynman, R. P., Hibbs, A. R. (1965). *Quantum Mechanics and Path Integrals*.
  McGraw-Hill.

Classical random walk

- Feller, W. (1968). *An Introduction to Probability Theory and Its
  Applications*, vol. 1, 3rd ed. Wiley.

Quantum walks

- Aharonov, Y., Davidovich, L., Zagury, N. (1993). Quantum random walks.
  *Physical Review A* 48(2), 1687–1690.
- Meyer, D. A. (1996). From quantum cellular automata to quantum lattice gases.
  *Journal of Statistical Physics* 85(5–6), 551–574.
- Nayak, A., Vishwanath, A. (2000). Quantum walk on the line.
  arXiv:quant-ph/0010117.
- Ambainis, A., Bach, E., Nayak, A., Vishwanath, A., Watrous, J. (2001).
  One-dimensional quantum walks. *Proceedings of the 33rd ACM Symposium on
  Theory of Computing (STOC)*, 37–49.
- Konno, N. (2002). Quantum random walks in one dimension. *Quantum Information
  Processing* 1(5), 345–354.
- Mackay, T. D., Bartlett, S. D., Stephenson, L. T., Sanders, B. C. (2002).
  Quantum walks in higher dimensions. *Journal of Physics A* 35(12), 2745–2753.
- Kempe, J. (2003). Quantum random walks: an introductory overview.
  *Contemporary Physics* 44(4), 307–327. arXiv:quant-ph/0303081.
- Tregenna, B., Flanagan, W., Maile, R., Kendon, V. (2003). Controlling discrete
  quantum walks: coins and initial states. *New Journal of Physics* 5, 83.
- Venegas-Andraca, S. E. (2012). Quantum walks: a comprehensive review. *Quantum
  Information Processing* 11(5), 1015–1106. arXiv:1201.4780.

Disorder, decoherence and localisation in quantum walks

- Anderson, P. W. (1958). Absence of diffusion in certain random lattices.
  *Physical Review* 109(5), 1492–1505.
- Brun, T. A., Carteret, H. A., Ambainis, A. (2003). Quantum random walks with
  decoherent coins. *Physical Review A* 67, 032304.
- Kendon, V., Tregenna, B. (2003). Decoherence can be useful in quantum walks.
  *Physical Review A* 67, 042315.
- Schreiber, A., Cassemiro, K. N., Potoček, V., Gábris, A., Jex, I., Silberhorn,
  C. (2011). Decoherence and disorder in quantum walks: from ballistic spread to
  localization. *Physical Review Letters* 106, 180403.
