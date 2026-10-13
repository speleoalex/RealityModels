# Teoria: molti mondi, albero e convergenze

La simulazione
[many-worlds](../../simulations/quantum-mechanics/many-worlds/index.html) mette a
confronto tre ipotesi: i regimi «Albero», «Convergenza classica» e «Convergenza
quantistica». Qui sono descritte con le notazioni di `js/model.js` e, per ognuna,
si separa la teoria pubblicata dalle ipotesi di lavoro del simulatore. I riferimenti
tra parentesi quadre rimandano alla bibliografia in fondo. Uso e parametri:
[many-worlds-simulation-guide.it.md](many-worlds-simulation-guide.it.md); versione inglese:
[many-worlds-convergence-theory.en.md](many-worlds-convergence-theory.en.md).

## 1. Il punto di partenza: la misura quantistica

Uno stato quantistico evolve in modo deterministico e lineare (equazione di
Schrödinger). Se si misura un'osservabile con N esiti possibili, la regola di Born
dà all'esito c la probabilità |a_c|², dove a_c è l'ampiezza della componente c
[Born 1926]. Nella formulazione standard la misura è un secondo tipo di evoluzione,
discontinua: lo stato «collassa» sulla componente osservata [von Neumann 1932]. Le
tre ipotesi simulate rispondono in modo diverso alla domanda «che fine fanno le
altre N−1 componenti?».

Il simulatore riduce tutto al minimo. A ogni passo t ripete la stessa misura con N
esiti equiprobabili (c = 0, …, N−1), e un mondo porta con sé solo il suo
**record** k = Σ c, la somma degli esiti. Il grafico mostra il record centrato,
x = 2k − (N−1)·t, così la distribuzione parte da x = 0 e resta simmetrica.

## 2. Regime «Albero»: l'interpretazione a molti mondi

### 2.1 La teoria

Everett [1957] propose di eliminare il collasso. La funzione d'onda universale non
si riduce mai e dopo una misura anche l'osservatore è in sovrapposizione, con una
copia per esito. Ogni copia ha una memoria («relative state») coerente con il
proprio esito e non può accorgersi delle altre. Il nome «many worlds» e la
diffusione dell'idea si devono a DeWitt [1970; DeWitt e Graham 1973].

I rami diventano indipendenti per **decoerenza**. L'interazione con l'ambiente
(fotoni, gas, apparati) lega ogni esito a stati dell'ambiente quasi ortogonali, e
in tempi brevissimi i termini d'interferenza tra rami diventano inosservabili
[Zeh 1970; Zurek 1991, 2003; Joos e altri 2003]. Nella versione moderna
dell'interpretazione i «mondi» sono strutture emergenti nella funzione d'onda,
individuate dalla decoerenza, e non vanno postulati [Wallace 2012; Saunders e
altri 2010; Vaidman 2021].

### 2.2 Il modello nel simulatore

Il regime «Albero» si limita a contare. Ogni misura moltiplica i mondi per N, e
dopo t misure ci sono

```
treeWorlds = N^t
```

mondi distinti, ciascuno di peso (modulo quadro dell'ampiezza) N^(−t) e
identificato dalla sequenza di esiti (le cifre in base N dell'indice del nodo). Il
colore dei nodi e l'istogramma in basso mostrano come i mondi si distribuiscono
sul record k: la frazione con record k è il coefficiente multinomiale diviso N^t,
cioè la probabilità classica del regime successivo. Passando il puntatore su un
mondo si evidenziano quelli con lo stesso record, che nell'albero restano distinti
anche se il loro «contenuto» è identico.

Il limite di 4096 nodi (T ≤ 12 per N = 2) è solo grafico.

## 3. Regime «Convergenza classica»: i mondi con lo stesso record sono lo stesso mondo

### 3.1 L'ipotesi

Il simulatore esplora l'ipotesi che la struttura non sia un albero. Due rami che
arrivano nello stesso stato (qui: stesso record k allo stesso passo t) sono un solo
mondo. Il grafo dei mondi diventa un **reticolo** con

```
distinct = (N−1)·t + 1
```

nodi al passo t invece di N^t: crescita lineare, non esponenziale.

L'idea non fa parte dell'interpretazione a molti mondi standard, ma tocca la
letteratura in più punti:

- Everett individuava i rami con le **sequenze di memoria** dell'osservatore
  [Everett 1957, §5]. Se l'osservatore registra solo il totale, due storie con lo
  stesso totale hanno la stessa memoria.
- Nel formalismo delle **storie consistenti** [Griffiths 1984; Omnès 1992;
  Gell-Mann e Hartle 1990] una storia è una sequenza di proiettori. Scegliendo un
  «grano grosso» (coarse graining) che distingue solo il record, le storie con lo
  stesso record diventano la stessa storia a grana grossa. La condizione che
  permette di dare a queste storie probabilità classiche (decoerenza delle storie)
  è proprio ciò che separa questo regime dal successivo.
- Nell'interpretazione a molti mondi moderna, rami con lo stesso record
  macroscopico e ambiente diverso restano distinti, perché a separarli è lo stato
  dell'ambiente e non la memoria dell'osservatore [Wallace 2012, cap. 3]. Il regime
  classico equivale quindi a supporre che il record sia l'unica informazione che
  sopravvive.

### 3.2 Il modello nel simulatore

Se le probabilità dei rami che convergono si sommano senza interferenza, il record
fa un **cammino aleatorio classico** [Feller 1968, cap. III]: a ogni passo si
aggiunge un c uniforme in {0, …, N−1}. Il numero di sequenze di esiti che arrivano
al nodo k (`paths`) segue la ricorrenza

```
paths_{t+1}(k + c) += paths_t(k)        per c = 0, …, N−1
```

(per N = 2 è il triangolo di Pascal e il reticolo è la tavola di Galton), e

```
pClassical(k, t) = paths_t(k) / N^t
flowClassical[c] = pClassical / N
```

c ha media (N−1)/2 e varianza (N²−1)/12, quindi x = 2k − (N−1)·t ha media 0 e
deviazione standard

```
sigmaClassical = sqrt( t · (N²−1) / 3 )
```

cioè σ = √t per N = 2. La distribuzione si allarga come la radice del tempo
(diffusione) e per il teorema del limite centrale tende a una gaussiana. Anche il
numero efficace di mondi 1/Σp² (`effectiveClassical`) cresce come √t.

## 4. Regime «Convergenza quantistica»: le ampiezze dei rami convergenti si sommano

### 4.1 La teoria

Se due rami si riuniscono davvero nello stesso stato, la meccanica quantistica non
ne somma le probabilità. Si sommano le **ampiezze**, e la probabilità è il modulo
quadro della somma. È il principio di sovrapposizione nella forma della somma sui
cammini di Feynman [Feynman 1948; Feynman e Hibbs 1965]: l'ampiezza di arrivare in
un punto è la somma delle ampiezze di tutte le storie che ci arrivano, e storie
diverse interferiscono. Con la decoerenza l'interferenza sparisce e si torna al
regime classico; senza decoerenza i rami possono cancellarsi o rinforzarsi.

L'interpretazione a molti mondi ha discusso esplicitamente la possibilità di far
interferire di nuovo rami «già separati» di una misura. Deutsch [1985] propose un
esperimento ideale: un osservatore (un calcolatore quantistico) compie una misura,
ne registra l'esito e poi viene fatto interferire con sé stesso, il che mostra una
differenza osservabile tra collasso e assenza di collasso. Hanson [2003] studiò
invece cosa succede alla regola di Born se i mondi di piccola ampiezza vengono
«maciullati» (mangled) dall'interferenza con mondi più grandi. In entrambi i casi
la convergenza dei rami è una possibilità teorica e non descrive la dinamica
ordinaria degli oggetti macroscopici.

### 4.2 Il modello nel simulatore: cammino quantistico a moneta

Per propagare un'ampiezza su un reticolo in modo unitario si usa di solito il
**cammino quantistico a moneta** (coined quantum walk) [Aharonov, Davidovich e
Zagury 1993; Meyer 1996; Ambainis e altri 2001; Nayak e Vishwanath 2000; Kempe
2003; Venegas-Andraca 2012]. Sommare direttamente le ampiezze dei rami che
convergono non basta, perché la mappa risultante non conserva la norma. A ogni
nodo si aggiunge allora un grado di libertà interno con N componenti, la
«moneta», che qui coincide con l'esito dell'ultima misura.

Lo stato al passo t è l'insieme delle ampiezze complesse ψ_t(k, c). Un passo è
fatto così:

1. **moneta**: in ogni nodo si applica la matrice unitaria U, qui la trasformata di
   Fourier discreta (funzione `dftCoin`)

   ```
   U[c][d] = exp(2πi · c · d / N) / sqrt(N)
   ```

   che per N = 2 è la matrice di Hadamard; la moneta DFT è la scelta usuale per
   monete a N > 2 facce [Mackay e altri 2002; Tregenna e altri 2003];
2. **spostamento**: la componente c si sposta al nodo k + c:

   ```
   ψ_{t+1}(k + c, c) = Σ_d U[c][d] · ψ_t(k, d)
   ```

Lo stato iniziale è ψ_0(0, 0) = 1. Le letture sono

```
pQuantum(k, t)  = Σ_c |ψ_t(k, c)|²
flowQuantum[c]  = |(U ψ_t(k, ·))_c|²       (probabilità che esce lungo l'esito c)
```

I rami che convergono in un nodo arrivano in componenti diverse della moneta e si
incontrano nella moneta del passo successivo: lì le ampiezze si sommano e
interferiscono. La somma delle probabilità resta 1 a ogni passo. Nel grafico i
nodi con pQuantum < 10⁻⁹ sono vuoti e gli archi con flowQuantum < 10⁻⁹
tratteggiati: sono i rami cancellati dall'interferenza (`suppressedNodes`,
`suppressedEdges`).

Per N = 2 il modello è il cammino di Hadamard, di cui si conoscono i valori esatti:
al passo 3, sui record x = −3, −1, 1, 3, le probabilità sono 1/8, 5/8, 1/8, 1/8
[Kempe 2003, §3]. La distribuzione è asimmetrica perché lo stato iniziale |0⟩
della moneta non è simmetrico, una proprietà nota del cammino. Il cammino di
Hadamard con stato iniziale localizzato coincide anche con la «scacchiera di
Feynman», la discretizzazione dell'equazione di Dirac in 1+1 dimensioni [Feynman e
Hibbs 1965, problema 2-6; Meyer 1996].

### 4.3 La differenza osservabile: allargamento balistico

Il risultato principale della teoria dei cammini quantistici è che la deviazione
standard cresce **linearmente** con t (propagazione balistica), mentre nel
cammino classico cresce come √t [Nayak e Vishwanath 2000; Ambainis e altri 2001].
Il teorema del limite di Konno [2002] dà la forma della distribuzione: due picchi
sul fronte, non gaussiana. Nel simulatore `sigmaQuantum` cresce come ≈ 0,46·t per
N = 2, e `effectiveQuantum` (numero efficace di mondi) cresce linearmente invece
che come √t. Valori calcolati da `buildLattice` e `statistics`:

| N | t | D | mondi dell'albero | nodi distinti | n. efficace classico | n. efficace quantistico | σ classica | σ quantistica |
|---|---|---|---|---|---|---|---|---|
| 2 | 40 | 0 | 1,1·10¹² | 41 | 11,25 | 11,66 | 6,32 | 18,40 |
| 2 | 40 | 0,3 | 1,1·10¹² | 41 | 11,25 | 15,48 | 6,32 | 11,53 |
| 2 | 40 | 1 | 1,1·10¹² | 41 | 11,25 | 6,75 | 6,32 | 5,80 |
| 3 | 40 | 0 | 1,2·10¹⁹ | 81 | 18,35 | 34,58 | 10,33 | 28,35 |
| 4 | 30 | 0 | 1,2·10¹⁸ | 91 | 21,77 | 34,86 | 12,25 | 29,01 |

(seme 1; per N = 2 e D = 0 il numero efficace quantistico è vicino a quello
classico perché la distribuzione di Hadamard concentra molta probabilità sui due
picchi).

## 5. Il disordine di fase: dal quantistico al classico

Il parametro D ∈ [0, 1] moltiplica le ampiezze di ogni nodo, prima della moneta,
per una fase casuale e^{iφ} con |φ| ≤ π·D, estratta a ogni passo da un generatore
con seme (`seededRandom`). L'evoluzione resta unitaria, ma i rami che convergono
arrivano con fasi relative casuali. È un modello minimo di **decoerenza**:
l'ambiente «segna» ogni ramo con una fase che l'altro ramo non conosce.

La letteratura sui cammini quantistici distingue due casi:

- **disordine statico** (fasi fisse nel tempo, diverse per nodo): produce la
  localizzazione di Anderson [Anderson 1958] e la distribuzione resta confinata
  vicino all'origine;
- **disordine dinamico** (fasi nuove a ogni passo, come qui): distrugge
  l'interferenza e riporta la propagazione al regime diffusivo σ ∝ √t del cammino
  classico [Brun, Carteret e Ambainis 2003; Kendon e Tregenna 2003]. Schreiber e
  altri [2011] hanno osservato entrambi i comportamenti con fotoni.

Il simulatore usa il disordine dinamico. Per D → 1 `sigmaQuantum` torna a crescere
come √t (≈ 0,93·√t per N = 2, contro √t del regime classico), i nodi vuoti e gli
archi tratteggiati cambiano con il seme e l'istogramma si avvicina al contorno
classico. D interpola quindi tra il regime 4 (D = 0) e una versione «rumorosa» del
regime 3. È la stessa transizione con cui, nell'interpretazione a molti mondi, la
decoerenza rende i rami di fatto indipendenti [Zurek 2003].

## 6. Che cosa il modello non dice

- Le misure sono tutte uguali ed equiprobabili e l'unico stato è il record k: il
  modello non descrive alcun sistema fisico particolare.
- «Stesso record = stesso mondo» è l'ipotesi da esplorare. Nell'interpretazione
  standard i rami restano distinti per via dell'ambiente (§3.1).
- La moneta è una scelta del modello, necessaria all'unitarietà. Monete diverse
  (ad esempio quella di Grover per N ≥ 3) danno distribuzioni diverse [Tregenna e
  altri 2003].
- La vista ad albero conta i mondi e non simula nulla: ogni nodo pesa N^(−t),
  senza ampiezze.

## Riferimenti bibliografici

Interpretazione a molti mondi e decoerenza

- Everett, H. (1957). «Relative State» Formulation of Quantum Mechanics. *Reviews
  of Modern Physics* 29(3), 454–462.
- DeWitt, B. S. (1970). Quantum mechanics and reality. *Physics Today* 23(9),
  30–35.
- DeWitt, B. S., Graham, N. (a cura di) (1973). *The Many-Worlds Interpretation
  of Quantum Mechanics*. Princeton University Press.
- Deutsch, D. (1985). Quantum theory as a universal physical theory.
  *International Journal of Theoretical Physics* 24(1), 1–41.
- Hanson, R. (2003). When worlds collide: quantum probability from observer
  selection? *Foundations of Physics* 33(7), 1129–1150.
- Saunders, S., Barrett, J., Kent, A., Wallace, D. (a cura di) (2010). *Many
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
  Theory*, 2ª ed. Springer.

Storie consistenti e grana grossa

- Griffiths, R. B. (1984). Consistent histories and the interpretation of
  quantum mechanics. *Journal of Statistical Physics* 36(1–2), 219–272.
- Omnès, R. (1992). Consistent interpretations of quantum mechanics. *Reviews of
  Modern Physics* 64(2), 339–382.
- Gell-Mann, M., Hartle, J. B. (1990). Quantum mechanics in the light of quantum
  cosmology. In W. H. Zurek (a cura di), *Complexity, Entropy and the Physics of
  Information*, Addison-Wesley, 425–458.

Misura, regola di Born, somma sui cammini

- Born, M. (1926). Zur Quantenmechanik der Stoßvorgänge. *Zeitschrift für Physik*
  37, 863–867.
- von Neumann, J. (1932). *Mathematische Grundlagen der Quantenmechanik*.
  Springer.
- Feynman, R. P. (1948). Space-time approach to non-relativistic quantum
  mechanics. *Reviews of Modern Physics* 20(2), 367–387.
- Feynman, R. P., Hibbs, A. R. (1965). *Quantum Mechanics and Path Integrals*.
  McGraw-Hill.

Cammino aleatorio classico

- Feller, W. (1968). *An Introduction to Probability Theory and Its
  Applications*, vol. 1, 3ª ed. Wiley.

Cammini quantistici

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

Disordine, decoerenza e localizzazione nei cammini quantistici

- Anderson, P. W. (1958). Absence of diffusion in certain random lattices.
  *Physical Review* 109(5), 1492–1505.
- Brun, T. A., Carteret, H. A., Ambainis, A. (2003). Quantum random walks with
  decoherent coins. *Physical Review A* 67, 032304.
- Kendon, V., Tregenna, B. (2003). Decoherence can be useful in quantum walks.
  *Physical Review A* 67, 042315.
- Schreiber, A., Cassemiro, K. N., Potoček, V., Gábris, A., Jex, I., Silberhorn,
  C. (2011). Decoherence and disorder in quantum walks: from ballistic spread to
  localization. *Physical Review Letters* 106, 180403.
