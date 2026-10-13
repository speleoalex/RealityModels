# Glossary: mathematical universe, information and the regress of containers

Terms that recur in discussions of Tegmark's mathematical universe hypothesis,
the background of every simulation in the project (see
[README.md](../../README.md)), and in the "regress of containers" argument:
nothing produces a bit, the bit needs a space that contains it, the space needs
a theory that describes it, and so on. Section 1 summarises the argument, the
following sections define the terms grouped by area. References in square
brackets point to the bibliography at the end. Italian version:
[mathematical-universe-glossary.it.md](mathematical-universe-glossary.it.md).

## 1. The argument in brief

1. **Nothing produces a bit.** To be nothing, nothing must exclude something.
   An exclusion is a distinction, and a distinction is a bit. Pure nothing is
   therefore logically unstable [Spencer-Brown 1969]. Set theory carries this
   out literally: from the empty set one builds 0, 1, 2 and all of arithmetic
   (von Neumann ordinals).
2. **A bit needs a container.** A bit is a choice between two alternatives, so
   the state space {0, 1} precedes the value. The content of a string is
   defined only relative to a machine that reads it (algorithmic information).
   The truth of a language is defined only in a metalanguage [Tarski 1933] and
   no system certifies itself [Gödel 1931]. Every floor needs the floor above.
3. **The tower.** Value → state space → set theory → logic → ... The regress
   is vicious only if every floor must be produced *before* the next, that is,
   if it is a process in time. If the floors coexist outside time, the tower
   is the cumulative hierarchy V of set theorists, where mathematicians have
   worked for a century without anything breaking.
4. **The three exits.** No container is needed (Tegmark: structures do not sit
   in boxes, they simply are); close the loop (Wheeler, Müller: bits generate
   the observer who gives bits their meaning); the regress is real and benign
   (reality is open upward, "the whole" is not an object).
5. **The objection to Tegmark.** If every structure needs a metastructure,
   "the set of all structures" is contradictory (Cantor, Russell) and the MUH
   does not close. The retreat to the CUH repairs nothing: computability does
   not remove the interpreter, it only names it (the universal machine), which
   is itself a structure.

## 2. Hypotheses about the nature of reality

**MUH (Mathematical Universe Hypothesis).** Max Tegmark's thesis: physical
reality *is* a mathematical structure, not merely described by one
[Tegmark 2008, 2014]. It follows from the ERH (External Reality Hypothesis,
there is an external reality independent of observers) through the argument
that a complete description free of human "baggage" (words, intuitions) can be
nothing but a mathematical structure. Consequence: every mathematical structure
exists physically on the same footing as ours.

**CUH (Computable Universe Hypothesis).** A restriction of the MUH proposed by
Tegmark himself [2008]: only mathematical structures defined by computable
relations exist physically, that is, relations a Turing machine can evaluate in
a finite number of steps. Its purpose is to avoid undecidable structures and
the problems tied to Gödel. The price: it excludes the continuum and much of
physics as it is written, and moves the problem onto the machine that runs the
computation (see *universal machine*).

**Level IV multiverse.** The highest of Tegmark's four multiverse levels
[2003]: I, regions beyond the cosmic horizon; II, other inflationary bubbles
with different constants; III, Everett's branches (see
[many-worlds-convergence-theory.en.md](../quantum-mechanics/many-worlds-convergence-theory.en.md));
IV, all mathematical structures. Level IV is the MUH taken as a multiverse: our
universe is one structure among the others.

**Many interacting worlds (MIW).** Hall, Deckert and Wiseman's proposal
[2014]: quantum mechanics as the statistics of N classical worlds, each with
definite positions, that repel each other; the wave function is emergent and
collapse is the selection of the sub-ensemble of worlds compatible with the
record. Unlike Everett's branches the worlds never split or merge. Theory and
simulation:
[many-interacting-worlds-theory.en.md](../quantum-mechanics/many-interacting-worlds-theory.en.md).

**Mathematical structure.** A set of abstract elements with relations among
them (for example: the integers with addition, a graph, a differentiable
manifold). Two structures with the same relations are the same structure,
whatever the elements are called. In the MUH "being contained in" is a
relation between structures, not the position of an object in a space.

**Structural realism.** A position in philosophy of science: what theories
capture of reality is the structure of relations, not the intrinsic nature of
objects [Ladyman 1998]. In the "ontic" version relations are all there is. The
MUH is its limiting case.

**Block universe.** Spacetime exists all at once, past, present and future, and
the flow of time is a property of the point of view, not of the world. Theory
and simulations:
[block-universe-relativity-theory.en.md](../relativity/block-universe-relativity-theory.en.md).
In the regress argument the block matters because, if the floors of the tower
coexist outside time like slices of spacetime, the regress is not a process
that has to "finish".

**It from bit.** John A. Wheeler's slogan [1990]: every "it", every physical
thing, derives in the end from yes/no answers to questions posed by observers,
that is, from bits. The physical world is information before it is matter.

**Self-excited circuit.** Wheeler's diagram, a U with an eye on one arm
looking at the other: the universe produces observers, and observers through
their measurements give the universe its reality [Wheeler 1983]. Also called
the "participatory universe". It is the second exit from the regress: not a
tower but a loop, in which the container of the bits is the observer that
emerges from the bits.

**Law without law.** Wheeler's phrase for a world in which physical laws are
not given a priori but emerge. Taken up by Markus Müller [2020] in a formal
theory: what is fundamental are observer states, and the probability of the
next state is given by Solomonoff's algorithmic probability; a regular
external world emerges as a compact description. It closes the loop without
presupposing an external physical space.

## 3. Information and computation

**Bit.** The smallest unit of information: the answer to a question with two
equally possible outcomes [Shannon 1948]. A bit is not an isolated symbol but
a *choice* between two alternatives: without the set of alternatives there is
no bit. This is the foothold of step 2 of the argument.

**State space.** The set of all possible configurations of a system. For one
bit it is {0, 1}; for n bits it has 2ⁿ elements; for a quantum system it is a
Hilbert space. The value of a state makes sense only relative to the space that
contains it, which is therefore logically prior.

**Algorithmic information (Kolmogorov complexity).** The information content
of a string is the length of the shortest program that produces it on a fixed
universal machine [Solomonoff 1964; Kolmogorov 1965; Chaitin 1966]. Changing
the machine changes the measure by at most an additive constant (invariance
theorem): the dependence on the interpreter is softened but not removed, and
for short strings the constant dominates.

**Universal (Turing) machine.** A machine that can simulate any other Turing
machine by reading its description [Turing 1936]. It is the "interpreter" that
algorithmic information presupposes and that the CUH names without removing:
the universal machine is itself a mathematical structure, and the question
"what contains it?" starts again.

**Computable.** A function is computable if some Turing machine calculates it
for every input in a finite number of steps. A relation is decidable if its
characteristic function is computable. The CUH asks for decidable relations.

**Interpreter.** Any system that assigns a meaning to a string of symbols: a
machine, a formal language, an observer. In the regress every floor acts as
interpreter for the one below.

## 4. Logic and set theory

**Distinction (Laws of Form).** For George Spencer-Brown [1969] the primordial
act is "draw a distinction": separating an inside from an outside. His
notation has a single symbol, the mark, which serves at once as distinction and
as operator. The first possible distinction is nothing/not-nothing, and it is
the content of step 1.

**Empty set and von Neumann ordinals.** The set with no elements, ∅. From it
the natural numbers are defined by nesting alone: 0 = ∅, 1 = {∅},
2 = {∅, {∅}}, n + 1 = n ∪ {n} [von Neumann 1923]. With the Zermelo-Fraenkel
axioms the integers, rationals, reals and all ordinary mathematics follow.
This is the technical sense in which "nothing is the only free brick".

**Leibniz's medal.** In 1697 Leibniz proposed to Duke Rudolph Augustus of
Brunswick a medal celebrating binary arithmetic with the motto *Omnibus ex
nihilo ducendis sufficit unum*, "to derive everything from nothing, one is
enough" [Leibniz 1697]. He saw in 0 and 1 an image of creation.

**Principles of identity and non-contradiction.** Everything is identical to
itself; a proposition and its negation are not both true. They are the hidden
assumption of step 1: for nothing to "exclude" something these rules are
already needed, so the regress starts below the bit, not above it.

**Carroll's tortoise.** In Lewis Carroll's dialogue [1895] the Tortoise accepts
the premises "A" and "if A then B" but refuses to conclude B until the rule
"if A and (if A then B) then B" is added, and then asks for the rule that
justifies that one, without end. It shows that a rule of inference cannot be
reduced to a premise: every rule needs a metarule.

**Undefinability of truth (Tarski).** In a sufficiently rich formal language
there is no predicate "is true" that holds for all its sentences; the truth of
the sentences of a language is defined only in a more expressive metalanguage
[Tarski 1933]. Every floor needs the floor above.

**Incompleteness theorems (Gödel).** First: every consistent formal system
containing arithmetic has true sentences it does not prove. Second: such a
system cannot prove its own consistency [Gödel 1931]. A system does not certify
itself; certification, if any, comes from a stronger system.

**Cumulative hierarchy V.** The construction of all sets in stages: V₀ = ∅,
V₍α+1₎ = power set of Vα, and at limits the union of what was built before
[Zermelo 1930]. Each stage is a set contained in the next; the totality V is
not a set but a proper class. It is the tower of containers realised in
current mathematics.

**Proper class.** A collection too large to be a set: the class of all sets,
of all ordinals, of all structures. One can talk about it but not treat it as
an object, on pain of paradox.

**Cantor's theorem.** No set is in one-to-one correspondence with its power
set, which always has greater cardinality [Cantor 1891]. Consequence: there is
no set of all sets, since its subsets would outnumber it.

**Russell's paradox.** The set of all sets that do not belong to themselves
belongs to itself if and only if it does not [Russell 1902]. It brought down
naive set theory and motivated the Zermelo-Fraenkel axioms. Together with
Cantor, it forbids "the totality of all structures" from being itself a
structure.

**Grothendieck universe.** A set U closed under the usual operations (power
set, unions, pairs) inside which all ordinary mathematics can be done as if U
were "everything" [Grothendieck et al. 1972]. Its existence is equivalent to
that of a strongly inaccessible cardinal. Every universe is contained in a
larger one: no floor is the last.

**Large cardinals.** Infinite cardinals whose existence does not follow from
the Zermelo-Fraenkel axioms and must be postulated (inaccessible, measurable
and others) [Kanamori 2003]. Each large cardinal axiom raises the tower by one
floor and proves the consistency of the floor below. This is how mathematicians
live in a hierarchy with no roof.

## 5. Philosophical terms

**Ex nihilo.** "From nothing". Leibniz's question "why is there something
rather than nothing?" [Leibniz 1714] is the starting point of the argument;
step 1 answers that nothing is not a stable option.

**Infinite regress.** A chain of justifications, causes or containers with no
first term. It is *vicious* if the existence or justification of each link
depends on the completion of the chain, which never completes; it is *benign*
if the links coexist and none waits for the others. The distinction decides
whether the tower of containers is a problem or a description.

**Self-reference.** A system that describes, contains or justifies itself. It
appears negatively in the paradoxes (Russell) and in the limits of formal
systems (Gödel, Tarski), and positively in the "loop" exit of Wheeler and
Müller, where it must explain why the loop holds.

**Metalanguage, metarule, metastructure.** The language in which one speaks
about a language, the rule that governs the use of a rule, the structure in
which a structure is defined. The prefix "meta" marks the floor above in the
tower.

**Outside time.** To exist without existence being a dated event. Mathematics
is the typical case: 2 did not "come after" 1. It is the condition under which
the regress stops being a process and becomes a hierarchy.

## Bibliography

Mathematical universe and multiverse

- Tegmark, M. (2003). Parallel universes. *Scientific American* 288(5), 40–51.
- Tegmark, M. (2008). The mathematical universe. *Foundations of Physics*
  38(2), 101–150. arXiv:0704.0646.
- Tegmark, M. (2014). *Our Mathematical Universe*. Knopf.
- Ladyman, J. (1998). What is structural realism? *Studies in History and
  Philosophy of Science* 29(3), 409–424.
- Hall, M. J. W., Deckert, D.-A., Wiseman, H. M. (2014). Quantum phenomena
  modelled by interactions between many classical worlds. *Physical Review X*
  4, 041013. arXiv:1402.6144.

Information and the observer

- Shannon, C. E. (1948). A mathematical theory of communication. *Bell System
  Technical Journal* 27, 379–423 and 623–656.
- Solomonoff, R. J. (1964). A formal theory of inductive inference.
  *Information and Control* 7, 1–22 and 224–254.
- Kolmogorov, A. N. (1965). Three approaches to the quantitative definition of
  information. *Problems of Information Transmission* 1(1), 1–7.
- Chaitin, G. J. (1966). On the length of programs for computing finite binary
  sequences. *Journal of the ACM* 13(4), 547–569.
- Turing, A. M. (1936). On computable numbers, with an application to the
  Entscheidungsproblem. *Proceedings of the London Mathematical Society*
  s2-42, 230–265.
- Wheeler, J. A. (1983). Law without law. In Wheeler, J. A., Zurek, W. H.
  (eds.), *Quantum Theory and Measurement*, 182–213. Princeton University
  Press.
- Wheeler, J. A. (1990). Information, physics, quantum: the search for links.
  In Zurek, W. H. (ed.), *Complexity, Entropy, and the Physics of
  Information*, 3–28. Addison-Wesley.
- Müller, M. P. (2020). Law without law: from observer states to physics via
  algorithmic information theory. *Quantum* 4, 301. arXiv:1712.01826.

Logic and sets

- Spencer-Brown, G. (1969). *Laws of Form*. Allen & Unwin.
- Leibniz, G. W. (1697). Letter to Duke Rudolph Augustus of Brunswick,
  2 January 1697 (design of the binary arithmetic medal).
- Leibniz, G. W. (1714). *Principes de la nature et de la grâce fondés en
  raison*, § 7.
- Carroll, L. (1895). What the Tortoise said to Achilles. *Mind* 4(14),
  278–280.
- Cantor, G. (1891). Über eine elementare Frage der Mannigfaltigkeitslehre.
  *Jahresbericht der Deutschen Mathematiker-Vereinigung* 1, 75–78.
- Russell, B. (1902). Letter to Frege, 16 June 1902. In van Heijenoort, J.
  (ed., 1967), *From Frege to Gödel*, 124–125. Harvard University Press.
- von Neumann, J. (1923). Zur Einführung der transfiniten Zahlen. *Acta
  Litterarum ac Scientiarum* 1, 199–208.
- Zermelo, E. (1930). Über Grenzzahlen und Mengenbereiche. *Fundamenta
  Mathematicae* 16, 29–47.
- Gödel, K. (1931). Über formal unentscheidbare Sätze der Principia Mathematica
  und verwandter Systeme I. *Monatshefte für Mathematik und Physik* 38,
  173–198.
- Tarski, A. (1933). Pojęcie prawdy w językach nauk dedukcyjnych. English
  translation: The concept of truth in formalized languages, in *Logic,
  Semantics, Metamathematics* (1956), 152–278. Oxford University Press.
- Grothendieck, A., Artin, M., Verdier, J.-L. (1972). *Théorie des topos et
  cohomologie étale des schémas (SGA 4)*, vol. 1, Exposé I, appendix
  "Univers". Springer.
- Kanamori, A. (2003). *The Higher Infinite*, 2nd ed. Springer.
