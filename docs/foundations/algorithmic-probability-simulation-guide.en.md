# A census of Turing machines

Interactive census of all the small Turing machines: every machine starts on a
blank tape, and the outputs of the ones that halt are counted. The frequencies
approximate algorithmic probability, the universal distribution of Solomonoff
and Levin. It has no dependencies and works offline.

Open it by double-clicking
[simulations/foundations/turing-census/index.html](../../simulations/foundations/turing-census/index.html)
(or from any static server); nothing to install. Theory and references:
[algorithmic-probability-theory.en.md](algorithmic-probability-theory.en.md); Italian version: [algorithmic-probability-simulation-guide.it.md](algorithmic-probability-simulation-guide.it.md).

## Idea

Take every Turing machine with **n** states and 2 symbols, run each one on a
tape of zeros, and record the string of cells it visited when it halts. No
string is privileged at the start: every machine is counted exactly once. Yet
the result is strongly ordered. Short strings come out of far more machines
than long ones, and at equal length the regular strings beat the irregular
ones. The share of machines that produce a string x approximates its
**algorithmic probability** m(x), and −log₂(share) approximates its Kolmogorov
complexity in bits. The simulation shows this hierarchy being built live, by
counting alone.

## The machines

- A machine has one instruction per (state, symbol) pair: write 0 or 1, move
  left or right, then enter one of the n states or halt. The halting
  instruction also writes and moves (Radó's busy beaver formalism), so each
  pair has 4(n+1) choices and there are (4(n+1))^(2n) machines.
- Every machine starts in state 0 on an all-zero tape. The output is the
  segment of cells it scanned, read when it halts.
- A machine still running after S(n) steps, the busy beaver record, will never
  halt. The census cuts every run at S(n), so halting is decided exactly, never
  guessed.

| States n | Machines | Mode | Step cap S(n) |
|---|---|---|---|
| 2 | 20,736 | full enumeration | 6 |
| 3 | 16,777,216 | full enumeration | 21 |
| 4 | 25,600,000,000 | seeded random sample | 107 |

The census runs in small slices, so the page stays responsive: 2 states finish
instantly, 3 states take a few seconds, and with 4 states the sample size sets
the duration. The Run button pauses and resumes it.

## Parameters and query string

| Parameter | Query | Range | Default |
|---|---|---|---|
| States n | `n` | 2–4 | 2 |
| Random seed (4 states only) | `seed` | 0–99999 | 1 |
| Sampled machines (4 states only) | `samples` | 100000–10000000 | 1000000 |
| Scale | `scale` | `lin`, `log` | `lin` |
| Language | `lang` | `it`, `en` | browser |

Example: `index.html?n=3&scale=log`.

Language and theme (System, Light, Dark) are set with the gear button at the top
right. They are saved in the browser and apply to the other simulations too.

## Readings

- **Machines run / total**: progress of the census; with 4 states the total is
  the sample size.
- **Halting machines**: count and share of the machines run so far.
- **Distinct strings**: different outputs seen so far.
- **Longest run / cap S(n)**: steps of the slowest halting machine found. In the
  full censuses it reaches S(n) exactly (6 and 21); in the 4-state sample it
  stays far below 107, because the near-champions are a handful of machines out
  of 25.6 billion.
- **Most frequent string**.

## Graph legend

- Each bar is one output string, ranked by frequency; the height is its share
  of the halting machines, on a linear or logarithmic scale. The title says how
  many of the distinct strings fit in the ranking.
- Bar colour = string length; the colour scale saturates at 5 cells.
- The bottom strip shows the total share per output length.
- Pointer on a bar: the bar turns orange, the mirrored string gets a solid
  orange outline and the 0↔1 complement a dashed one. The tooltip shows share,
  machine count, rank, the estimated complexity −log₂(share) in bits, and the
  shares of the mirror and of the complement.

## Reference results

Numbers from `js/model.js`, the same code the page runs.

### 2 states, full census

20,736 machines, 9,784 halting (47.18%), 17 distinct strings, longest run
6 = S(2). The complete census:

| Output | Machines | Share |
|---|---|---|
| 0 | 3,456 | 35.32% |
| 1 | 3,456 | 35.32% |
| 00 | 728 | 7.44% |
| 01 | 704 | 7.20% |
| 10 | 704 | 7.20% |
| 11 | 680 | 6.95% |
| 011, 110, 111 | 8 each | 0.08% each |
| 001, 010, 100, 101 | 4 each | 0.04% each |
| 1001, 1011, 1101, 1111 | 4 each | 0.04% each |

Notable: `000` never occurs, and every length-4 output starts and ends with 1.
Six steps are too few to scan four cells and leave the far ends blank.

### 3 states, full census

16,777,216 machines, 7,571,840 halting (45.13%), 95 distinct strings, longest
run 21 = S(3). Top of the ranking:

| Output | Machines | Share |
|---|---|---|
| 0 | 2,097,152 | 27.70% |
| 1 | 2,097,152 | 27.70% |
| 00 | 722,752 | 9.55% |
| 01 | 704,912 | 9.31% |
| 10 | 704,912 | 9.31% |
| 11 | 687,072 | 9.07% |
| 111 | 66,840 | 0.88% |
| 000 | 64,200 | 0.85% |
| 011 | 63,920 | 0.84% |
| 110 | 63,920 | 0.84% |
| 001 | 62,392 | 0.82% |
| 100 | 62,392 | 0.82% |
| 010 | 58,992 | 0.78% |
| 101 | 58,576 | 0.77% |

Share by output length:

| Length | Machines | Share |
|---|---|---|
| 1 | 4,194,304 | 55.39% |
| 2 | 2,819,648 | 37.24% |
| 3 | 501,232 | 6.62% |
| 4 | 50,064 | 0.66% |
| 5 | 6,224 | 0.08% |
| 6 | 336 | 0.004% |
| 7 | 32 | 0.0004% |

Beyond two cells, each extra cell costs about an order of magnitude. Mirror
pairs match exactly (01 = 10, 011 = 110, 001 = 100), while the 0↔1 complement
does not (010 ≠ 101, 000 < 111): the blank tape is made of zeros and breaks
that symmetry. The theory document explains both facts.

### 4 states, sample

Seed 1, 200,000 machines: 87,161 halting (43.58%), 88 distinct strings, longest
run 24. Top of the ranking:

| Output | Machines | Share |
|---|---|---|
| 1 | 19,956 | 22.90% |
| 0 | 19,861 | 22.79% |
| 01 | 8,821 | 10.12% |
| 00 | 8,755 | 10.04% |
| 10 | 8,646 | 9.92% |
| 11 | 8,422 | 9.66% |
| 000 | 1,411 | 1.62% |
| 111 | 1,409 | 1.62% |

In a sample the exact ties survive only up to noise: `0` and `1` differ by
sampling error, not by structure. The page defaults to 1,000,000 samples; this
table uses 200,000 so that it matches the third verification command below.

## Simplifications

- One fixed formalism. The numbers depend on the (n, 2) machine space; another
  encoding would shift them by the constants of the invariance theorem (see the
  theory document). The ranking of simple versus complex strings is what proves
  stable, not the single shares.
- No symmetry quotient. Left-right mirroring is an exact bijection of the
  machine space, so mirror strings get identical counts; that is a built-in
  check, not a discovery. The 0↔1 complement is not a symmetry, because the
  blank tape fixes 0.
- The output is the scanned segment, including the zeros the machine read but
  left untouched. Conventions that record only the written or non-blank part
  give different tables.
- Sample mode is only statistical. Each sampled machine is still decided
  exactly by the S(4) cap; the error on a share p is about 1/√(samples·0.44·p),
  roughly 1.5% for a 1% string with one million samples.

## Structure

```
simulations/foundations/turing-census/
├── index.html      page and control panel
├── css/style.css   theme tokens (light, dark, system) and responsive layout
├── js/i18n.js      it/en dictionaries and translation functions
├── js/model.js     census engine: enumeration, sampling, tallies (also usable from Node)
├── js/graph.js     Canvas renderer: ranked bars, length strip, tooltip
└── js/app.js       controls, query string, animation
```

The settings button (language and theme) is shared by all simulations and lives
in `simulations/shared/` (`js/settings.js`, `css/settings.css`).

## Verification

```
cd simulations/foundations/turing-census && node -e 'const M=require("./js/model.js"); const I=require("./js/i18n.js").I18n; const c=M.create({states:2}); M.run(c,c.total); const s=M.summary(c); console.log(c.halting, s.entries.length, c.maxUsed, I.check().length)'
```

Expected: `9784 17 6 0` (9,784 halting machines out of 20,736, 17 distinct
strings, longest run 6 = S(2), no missing dictionary keys).

```
cd simulations/foundations/turing-census && node -e 'const M=require("./js/model.js"); const c=M.create({states:3}); M.run(c,c.total); const s=M.summary(c); console.log(c.halting, s.entries.length, c.maxUsed)'
```

Expected: `7571840 95 21` (takes a few seconds; longest run 21 = S(3)).

```
cd simulations/foundations/turing-census && node -e 'const M=require("./js/model.js"); const c=M.create({states:4,seed:1,samples:200000}); M.run(c,c.target); const s=M.summary(c); console.log(c.halting, s.entries.length, c.maxUsed)'
```

Expected: `87161 88 24` (the sample is seeded, so the numbers reproduce
exactly).
