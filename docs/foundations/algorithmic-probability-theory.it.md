# Teoria: probabilità algoritmica e censimento delle macchine

La simulazione
[turing-census](../../simulations/foundations/turing-census/index.html)
enumera le piccole macchine di Turing, esegue ciascuna su un nastro vuoto e
conta gli output di quelle che si fermano. Questo documento raccoglie le
definizioni e i risultati pubblicati su cui il censimento poggia, nella
notazione di `js/model.js`, e li separa dalle scelte proprie del simulatore.
Uso, parametri e tabelle di riferimento:
[algorithmic-probability-simulation-guide.it.md](algorithmic-probability-simulation-guide.it.md); versione
inglese: [algorithmic-probability-theory.en.md](algorithmic-probability-theory.en.md).

## 1. Dal regresso al contare

Il [glossario](mathematical-universe-glossary.it.md) si chiude su un punto
aperto: l'informazione algoritmica misura una stringa rispetto a una macchina
universale, e la scelta di quella macchina resta a sua volta non spiegata. La
mossa di Solomonoff fu smettere di scegliere: invece di un programma, pesare
**tutti** i programmi che producono la stringa. Il censimento fa lo stesso
passo un piano più in basso. Invece di una macchina universale con una
codifica ingegnosa, prende ogni macchina di taglia limitata, senza eccezioni,
e conta. L'ordine che compare nel risultato non è stato messo a mano: è una
proprietà dello spazio delle computazioni. È il meccanismo dietro la "law
without law" di Wheeler come la formalizza Müller [2020]: se ciò che esiste è
l'insieme delle computazioni, la probabilità di un'osservazione è la sua
probabilità algoritmica, e la regolarità vince per puro peso numerico.

## 2. Probabilità algoritmica

### 2.1 La distribuzione universale

Si fissa una macchina universale U i cui programmi sono stringhe binarie
autodelimitanti. La probabilità algoritmica di una stringa x è

```
m(x) = Σ 2^(−|p|)   sui programmi p con U(p) = x
```

la probabilità che U produca x quando il nastro dei programmi è riempito a
lanci di moneta [Solomonoff 1964; Levin 1974]. m è una semimisura, non una
misura: la massa dei programmi che non si fermano va persa, e il problema
della fermata rende m non calcolabile, solo approssimabile dal basso. Levin
dimostrò che è **universale**: m domina ogni semimisura semicalcolabile a meno
di una costante moltiplicativa, quindi nessun modo calcolabile di assegnare
probabilità alle stringhe può batterla per più di un fattore costante.

### 2.2 Il teorema di codifica

Levin [1974] e Chaitin [1975] mostrarono che le due quantità centrali della
teoria coincidono a meno di una costante additiva:

```
K(x) = −log₂ m(x) + O(1)
```

dove K è la complessità di Kolmogorov con prefissi, la lunghezza del programma
più corto per x. Probabile e semplice sono la stessa cosa: una stringa è
probabile esattamente nella misura in cui è comprimibile. Per questo
Kirchherr, Li e Vitányi [1997] chiamano m "la miracolosa distribuzione
universale"; Li e Vitányi [2008] è il riferimento standard.

### 2.3 L'invarianza e il suo limite onesto

K e m dipendono da U solo attraverso costanti additive e moltiplicative
(teorema di invarianza [Solomonoff 1964; Kolmogorov 1965]). Per stringhe
lunghe le costanti svaniscono; per le stringhe corte che una simulazione può
raggiungere, dominano. Ogni tabella concreta di m(x) è quindi relativa a una
scelta dichiarata di macchine. Il censimento non sfugge a questo; rende la
scelta esplicita e uniforme (sezione 6).

## 3. Un censimento invece di una macchina universale

Delahaye e Zenil [2012] proposero il Coding Theorem Method: approssimare m non
con una macchina universale ma con l'intera famiglia uniforme delle macchine
piccole. Per lo spazio (n, 2), n stati e 2 simboli nel formalismo di Radó, si
definisce

```
D(n)(x) = (macchine che si fermano sul nastro vuoto con output x) / (macchine che si fermano)
```

e la complessità stimata K̃(x) = −log₂ D(n)(x), il numero che il tooltip della
simulazione mostra. Soler-Toscano, Zenil, Delahaye e Gauvrit [2014] hanno
calcolato D(5) da 26 mila miliardi di macchine e trovato la classifica stabile
al variare di n e coerente con la complessità misurata per compressione dove
entrambe si applicano. Il punto non è che i singoli valori siano canonici, non
lo sono, ma che una scelta dall'aria arbitraria (una macchina) è sostituita da
una simmetrica (tutte le macchine di una taglia), che lascia molto meno spazio
per contrabbandare struttura.

## 4. Il limite busy beaver

Radó [1962] definì S(n) come il massimo numero di passi che una macchina a n
stati e 2 simboli può compiere sul nastro vuoto e fermarsi comunque. I valori
noti:

| n | S(n) | Dimostrazione |
|---|---|---|
| 2 | 6 | Radó 1962 |
| 3 | 21 | Lin e Radó 1965 |
| 4 | 107 | Brady 1983 |
| 5 | 47.176.870 | campionessa di Marxen e Buntrock 1990; massimalità provata dalla collaborazione bbchallenge, 2024, verificata in Coq |

S cresce più in fretta di ogni funzione calcolabile, ed è per questo che ogni
valore è un'impresa a sé. Per il censimento il teorema conta in una direzione
sola: una macchina che sul nastro vuoto non si è fermata entro S(n) passi non
si fermerà mai. Tagliare le corse a S(n) decide quindi l'arresto in modo
**esatto**. Le tabelle (2, 2) e (3, 2) della guida sono enumerazioni complete
senza alcun caso indeciso, e nello spazio (4, 2) campionato ogni macchina
estratta è comunque classificata esattamente; solo il campionamento è
statistico.

## 5. Il modello nel simulatore

`js/model.js` codifica un'istruzione come una cifra d in 0 .. 4(n+1)−1: il bit
0 è il simbolo scritto, il bit 1 il movimento (destra o sinistra), d >> 2 lo
stato successivo, con il valore n che significa arresto. L'istruzione di
arresto scrive e si muove come le altre, come nel formalismo di Radó. Una
macchina è il vettore delle sue 2n cifre, una per coppia (stato, simbolo),
quindi lo spazio ha (4(n+1))^(2n) macchine: 20.736 per n = 2, 16.777.216 per
n = 3, 25.600.000.000 per n = 4. I primi due spazi sono enumerati con un
contachilometri; il terzo è campionato con un piccolo generatore con seme,
così una corsa è riproducibile.

L'output di una macchina che si ferma è il segmento percorso: il contenuto, al
momento dell'arresto, delle celle lette almeno una volta. Una macchina la cui
prima istruzione si arresta produce una sola cella. Registrare solo le celle
scritte, o solo il segmento tra gli 1 più esterni, sono convenzioni
altrettanto difendibili che danno tabelle diverse; i numeri della guida
appartengono a questa.

## 6. Che cosa mostra il censimento

Le tabelle complete stanno nella guida; questi sono i fatti strutturali che le
spiegano.

- **Frazione di arresto.** 47,18% per n = 2, 45,13% per n = 3, circa 43,6% nel
  campione a n = 4: un calo lento mentre lo spazio cresce.
- **Gli output di una cella sono un teorema.** Una macchina produce una cella
  esattamente quando la sua istruzione (stato 0, simbolo 0) si arresta. Le
  macchine così fatte sono 2·(4(n+1))^(2n−1) per l'output `0` e altrettante
  per `1`: 3.456 ciascuno per n = 2 e 2.097.152 ciascuno per n = 3, in accordo
  cifra per cifra con le tabelle. Il pareggio esatto tra `0` e `1` è
  strutturale.
- **La simmetria speculare è esatta.** Scambiare sinistra e destra in ogni
  istruzione è una biiezione dello spazio delle macchine che rispecchia
  l'output, quindi `011` e `110` devono pareggiare esattamente, e lo fanno. È
  un controllo incorporato dell'enumerazione.
- **Il complemento 0↔1 non è una simmetria.** Il nastro vuoto è fatto di zeri,
  quindi complementare l'alfabeto non manda lo spazio in sé stesso: a n = 3,
  `010` ottiene 58.992 macchine e `101` ne ottiene 58.576, e `000` perde
  contro `111`. Asimmetrie piccole e strutturate di questo tipo sono dati, non
  rumore.
- **Il peso cade esponenzialmente con la lunghezza.** Oltre le due celle, ogni
  cella in più costa circa un ordine di grandezza di probabilità, l'ombra
  finita di m(x) ≈ 2^(−K(x)).
- **A parità di lunghezza vince la regolarità.** A n = 3, lunghezza 3, le
  stringhe uniformi `111` e `000` stanno in cima e le alternate `010` e `101`
  in fondo. A questa scala il divario è piccolo; nei censimenti CTM più grandi
  si allarga con la lunghezza delle stringhe [Soler-Toscano et al. 2014].

## 7. Che cosa il censimento non dice

- Non calcola K(x). I valori K̃ sono legati alla famiglia (n, 2) e alla
  convenzione di output; un altro formalismo li sposta di costanti ignote. Ciò
  che si trasferisce è la classifica e la forma esponenziale, non le cifre.
- Non chiude il regresso del glossario. Nessuna singola macchina è più
  privilegiata, ma la famiglia resta una scelta: n stati, due simboli, un
  nastro, la regola di arresto di Radó. Il censimento riduce l'arbitrarietà da
  "una macchina scelta a mano" a "un formalismo scelto a mano"; la domanda
  "chi ha fissato il formalismo?" rimane, ed è la voce *macchina universale*
  del glossario riformulata.
- Il nastro vuoto non è "il nulla". Un nastro di zeri è già un contenitore
  scelto con un simbolo di default scelto, e la sezione 6 mostra che questa
  scelta lascia impronte (la simmetria 0↔1 rotta). I punti di partenza non
  sono gratis; si vedano *spazio degli stati* e *it from bit* nel glossario.
- Müller [2020] postula m(x) come legge dello stato successivo di un
  osservatore. Il censimento è la versione finita e ispezionabile di quel
  postulato: mostra la distribuzione emergere dal solo contare, ma ne eredita,
  in miniatura, ogni dipendenza.

## Bibliografia

Probabilità e complessità algoritmica

- Turing, A. M. (1936). On computable numbers, with an application to the
  Entscheidungsproblem. *Proceedings of the London Mathematical Society*
  s2-42, 230–265.
- Solomonoff, R. J. (1964). A formal theory of inductive inference, Parts I
  and II. *Information and Control* 7(1), 1–22 e 7(2), 224–254.
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
  Its Applications*, 3ª edizione. Springer.

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
- The bbchallenge collaboration (2024). Dimostrazione che S(5) = 47.176.870,
  verificata in Coq. https://bbchallenge.org

Censimenti di macchine piccole

- Delahaye, J.-P., Zenil, H. (2012). Numerical evaluation of algorithmic
  complexity for short strings: a glance into the innermost structure of
  randomness. *Applied Mathematics and Computation* 219(1), 63–77.
- Soler-Toscano, F., Zenil, H., Delahaye, J.-P., Gauvrit, N. (2014).
  Calculating Kolmogorov complexity from the output frequency distributions of
  small Turing machines. *PLoS ONE* 9(5), e96223.

Emergenza delle leggi

- Müller, M. P. (2020). Law without law: from observer states to physics via
  algorithmic information theory. *Quantum* 4, 301. arXiv:1712.01826.
