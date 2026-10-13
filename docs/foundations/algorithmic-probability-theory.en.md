# Theory: algorithmic probability and the machine census

The [turing-census](../../simulations/foundations/turing-census/index.html)
simulation enumerates the small Turing machines, runs each one on a blank tape
and counts the outputs of those that halt. This document gives the definitions
and published results the census rests on, in the notation of `js/model.js`,
and separates them from the simulator's own choices. Usage, parameters and
reference tables:
[algorithmic-probability-simulation-guide.en.md](algorithmic-probability-simulation-guide.en.md); Italian
version: [algorithmic-probability-theory.it.md](algorithmic-probability-theory.it.md).

## 1. From the regress to counting

The [glossary](mathematical-universe-glossary.en.md) ends on an open point:
algorithmic information measures a string relative to a universal machine, and
the choice of that machine is itself unexplained. Solomonoff's move was to stop
choosing: instead of one program, weigh **all** programs that produce the
string. The census takes the same step one floor lower. Instead of one
universal machine with a clever encoding, it takes every machine of a bounded
size, with no exceptions, and counts. Whatever order appears in the result was
not put in by hand: it is a property of the space of computations. This is the
mechanism behind Wheeler's "law without law" as Müller [2020] formalises it:
if what exists is all computations, the probability of an observation is its
algorithmic probability, and regularity wins by sheer weight of numbers.

## 2. Algorithmic probability

### 2.1 The universal distribution

Fix a universal machine U whose programs are self-delimiting binary strings.
The algorithmic probability of a string x is

```
m(x) = Σ 2^(−|p|)   over the programs p with U(p) = x
```

the probability that U produces x when its program tape is filled by coin
tosses [Solomonoff 1964; Levin 1974]. m is a semimeasure, not a measure: the
mass of the non-halting programs is lost, and the halting problem makes m
uncomputable, only approximable from below. Levin proved it is **universal**:
m dominates every semicomputable semimeasure up to a multiplicative constant,
so no computable way of assigning probabilities to strings can beat it by more
than a constant factor.

### 2.2 The coding theorem

Levin [1974] and Chaitin [1975] showed that the two central quantities of the
theory coincide up to an additive constant:

```
K(x) = −log₂ m(x) + O(1)
```

where K is prefix Kolmogorov complexity, the length of the shortest program
for x. Probable and simple are the same thing: a string is likely to the exact
extent that it is compressible. Kirchherr, Li and Vitányi [1997] call m "the
miraculous universal distribution" for this reason; Li and Vitányi [2008] is
the standard reference.

### 2.3 Invariance and its honest limit

K and m depend on U only through additive and multiplicative constants
(invariance theorem [Solomonoff 1964; Kolmogorov 1965]). For long strings the
constants fade; for the short strings a simulation can reach, they dominate.
Any concrete table of m(x) is therefore relative to a stated choice of
machines. The census does not escape this; it makes the choice explicit and
uniform (section 6).

## 3. A census instead of a universal machine

Delahaye and Zenil [2012] proposed the Coding Theorem Method: approximate m
not with one universal machine but with the full uniform family of small
machines. For the (n, 2) space, n states and 2 symbols in Radó's formalism,
define

```
D(n)(x) = (machines that halt on the blank tape with output x) / (machines that halt)
```

and the estimated complexity K̃(x) = −log₂ D(n)(x), the number the simulation's
tooltip shows. Soler-Toscano, Zenil, Delahaye and Gauvrit [2014] computed
D(5) from 26 trillion machines and found the ranking stable across n and
consistent with compression-based complexity where both apply. The point is
not that the single values are canonical, they are not, but that an
arbitrary-looking choice (one machine) is replaced by a symmetric one (all
machines of a size), which leaves far less room for smuggling structure in.

## 4. The busy beaver bound

Radó [1962] defined S(n) as the maximum number of steps an n-state 2-symbol
machine can run on the blank tape and still halt. The known values:

| n | S(n) | Proof |
|---|---|---|
| 2 | 6 | Radó 1962 |
| 3 | 21 | Lin and Radó 1965 |
| 4 | 107 | Brady 1983 |
| 5 | 47,176,870 | champion Marxen and Buntrock 1990; proved maximal by the bbchallenge collaboration, 2024, machine-checked in Coq |

S grows faster than every computable function, which is why each value is a
separate feat. For the census the theorem matters in one direction: a machine
on the blank tape that has not halted within S(n) steps never halts. Capping
runs at S(n) therefore decides halting **exactly**. The (2, 2) and (3, 2)
tables in the guide are complete enumerations with no undecided case, and in
the sampled (4, 2) space every drawn machine is still classified exactly; only
the sampling is statistical.

## 5. The model in the simulator

`js/model.js` encodes an instruction as a digit d in 0 .. 4(n+1)−1: bit 0 is
the written symbol, bit 1 the move (right or left), d >> 2 the next state,
with the value n meaning halt. The halting instruction writes and moves like
any other, as in Radó's formalism. A machine is the vector of its 2n digits,
one per (state, symbol) pair, so the space has (4(n+1))^(2n) machines: 20,736
for n = 2, 16,777,216 for n = 3, 25,600,000,000 for n = 4. The first two are
enumerated with an odometer; the third is sampled with a small seeded
generator, so a run is reproducible.

The output of a halting machine is the scanned segment: the content, at the
moment of halting, of the cells it read at least once. A machine whose first
instruction halts outputs a single cell. Recording only the written cells, or
only the segment between the outermost 1s, are equally defensible conventions
that give different tables; the guide's numbers belong to this one.

## 6. What the census shows

The guide holds the full tables; these are the structural facts behind them.

- **Halting fraction.** 47.18% for n = 2, 45.13% for n = 3, about 43.6% in the
  n = 4 sample: a slow decline as the space grows.
- **Single-cell outputs are a theorem.** A machine outputs one cell exactly
  when its (state 0, symbol 0) instruction halts. There are 2·(4(n+1))^(2n−1)
  such machines for output `0` and as many for `1`: 3,456 each for n = 2 and
  2,097,152 each for n = 3, matching the tables digit for digit. The exact tie
  between `0` and `1` is structural.
- **Mirror symmetry is exact.** Swapping left and right in every instruction
  is a bijection of the machine space that mirrors the output, so `011` and
  `110` must tie exactly, and do. This is a built-in check of the enumeration.
- **The 0↔1 complement is not a symmetry.** The blank tape is made of zeros,
  so complementing the alphabet does not map the space onto itself: at n = 3,
  `010` gets 58,992 machines and `101` gets 58,576, and `000` loses to `111`.
  Small, structured asymmetries of this kind are data, not noise.
- **Weight falls exponentially with length.** Beyond two cells, each extra
  cell costs about an order of magnitude of probability, the finite shadow of
  m(x) ≈ 2^(−K(x)).
- **Regularity wins at equal length.** At n = 3, length 3, the uniform strings
  `111` and `000` sit at the top and the alternating `010` and `101` at the
  bottom. The gap is small at this scale; in the larger CTM censuses it widens
  with string length [Soler-Toscano et al. 2014].

## 7. What the census does not say

- It does not compute K(x). The values K̃ are tied to the (n, 2) family and to
  the output convention; another formalism shifts them by unknown constants.
  What transfers is the ranking and the exponential shape, not the digits.
- It does not close the regress of the glossary. No single machine is
  privileged any more, but the family is still a choice: n states, two
  symbols, one tape, Radó's halting rule. The census shrinks the arbitrariness
  from "one machine picked by hand" to "one formalism picked by hand"; the
  question "who fixed the formalism?" remains, and it is the glossary's
  *universal machine* entry restated.
- The blank tape is not "nothing". A tape of zeros is already a chosen
  container with a chosen default symbol, and section 6 shows that this choice
  leaves fingerprints (the broken 0↔1 symmetry). Starting points do not come
  for free; see *state space* and *it from bit* in the glossary.
- Müller [2020] postulates m(x) as the law of an observer's next state. The
  census is the finite, inspectable version of that postulate: it shows the
  distribution emerging from counting, but it inherits, in miniature, every
  dependence the postulate has.

## Bibliography

Algorithmic probability and complexity

- Turing, A. M. (1936). On computable numbers, with an application to the
  Entscheidungsproblem. *Proceedings of the London Mathematical Society*
  s2-42, 230–265.
- Solomonoff, R. J. (1964). A formal theory of inductive inference, Parts I
  and II. *Information and Control* 7(1), 1–22 and 7(2), 224–254.
- Kolmogorov, A. N. (1965). Three approaches to the quantitative definition of
  information. *Problems of Information Transmission* 1(1), 1–7.
- Levin, L. A. (1974). Laws of information conservation (non-growth) and
  aspects of the foundation of probability theory. *Problems of Information
  Transmission* 10(3), 206–210.
- Chaitin, G. J. (1975). A theory of program size formally identical to
  information theory. *Journal of the ACM* 22(3), 329–340.
- Kirchherr, W., Li, M., Vitányi, P. (1997). The miraculous universal
  distribution. *The Mathematical Intelligencer* 19(4), 7–15.
- Li, M., Vitányi, P. (2008). *An Introduction to Kolmogorov Complexity and
  Its Applications*, 3rd edition. Springer.

Busy beaver

- Radó, T. (1962). On non-computable functions. *Bell System Technical
  Journal* 41(3), 877–884.
- Lin, S., Radó, T. (1965). Computer studies of Turing machine problems.
  *Journal of the ACM* 12(2), 196–212.
- Brady, A. H. (1983). The determination of the value of Rado's noncomputable
  function Sigma(k) for four-state Turing machines. *Mathematics of
  Computation* 40(162), 647–665.
- Marxen, H., Buntrock, J. (1990). Attacking the Busy Beaver 5. *Bulletin of
  the EATCS* 40, 247–251.
- The bbchallenge collaboration (2024). Proof that S(5) = 47,176,870,
  machine-checked in Coq. https://bbchallenge.org

Census of small machines

- Delahaye, J.-P., Zenil, H. (2012). Numerical evaluation of algorithmic
  complexity for short strings: a glance into the innermost structure of
  randomness. *Applied Mathematics and Computation* 219(1), 63–77.
- Soler-Toscano, F., Zenil, H., Delahaye, J.-P., Gauvrit, N. (2014).
  Calculating Kolmogorov complexity from the output frequency distributions of
  small Turing machines. *PLoS ONE* 9(5), e96223.

Emergence of laws

- Müller, M. P. (2020). Law without law: from observer states to physics via
  algorithmic information theory. *Quantum* 4, 301. arXiv:1712.01826.
