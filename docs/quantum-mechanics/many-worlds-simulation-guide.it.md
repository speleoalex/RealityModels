# Multiverso con convergenze

Simulazione interattiva di un multiverso in cui i rami prodotti dalle misure
quantistiche possono **riconvergere** invece di formare solo un albero. Non ha
dipendenze e funziona offline.

Si apre con un doppio clic su
[simulations/quantum-mechanics/many-worlds/index.html](../../simulations/quantum-mechanics/many-worlds/index.html)
(o da qualsiasi server statico), senza installare nulla. Teoria e bibliografia:
[many-worlds-convergence-theory.it.md](many-worlds-convergence-theory.it.md); versione inglese: [many-worlds-simulation-guide.en.md](many-worlds-simulation-guide.en.md).

## Idea

Nell'interpretazione a molti mondi ogni misura con **N** esiti divide ogni mondo in
N rami, e dopo **t** misure l'albero ha N^t mondi. Qui un mondo è descritto solo dal
suo **record** k, la somma degli esiti (ogni esito vale 0..N−1). Due rami che
arrivano allo stesso k allo stesso passo sono lo stesso mondo e convergono, quindi
la struttura diventa un reticolo con (N−1)·t+1 nodi al passo t.

Il record è disegnato come x = 2k − (N−1)·t, centrato su zero (per N=2 vale ±1 a
ogni misura, come in un cammino casuale).

## I tre regimi

| Regime | Che cosa mostra |
|---|---|
| **Albero** | Conteggio ingenuo: ogni misura divide ogni mondo, N^t mondi distinti, tutti con probabilità N^−t. Con il puntatore su un mondo si evidenziano la sua storia (esiti) e i mondi con lo stesso record, quelli che negli altri regimi sarebbero fusi. Si disegnano al massimo 4096 mondi (T ≤ 12 per N=2, 7 per N=3, 6 per N=4). |
| **Convergenza classica** | I mondi con lo stesso record si fondono e le **probabilità** si sommano: p(k) = (sequenze di esiti che danno k) / N^t. La distribuzione è una campana di larghezza σ ∝ √t. |
| **Convergenza quantistica** | I mondi con lo stesso record si fondono e le **ampiezze** si sommano, quindi interferiscono. Alcuni rami si cancellano (tratteggiati), alcuni mondi restano a probabilità nulla (cerchi vuoti) e la distribuzione si allarga come t, più in fretta del caso classico. |

Il reticolo si calcola una sola volta per tutti i regimi; il regime decide solo
che cosa disegnare.

## Modello

Il regime quantistico è un **cammino quantistico a moneta** (coined quantum walk)
sul record k, esattamente unitario.

- ogni nodo porta N componenti di ampiezza ψ(k, c), una per esito;
- a ogni passo la moneta DFT U[c][d] = exp(2πi·c·d/N)/√N (Hadamard per N=2) mescola
  le componenti di ogni nodo, poi la componente c si sposta al nodo k+c:
  ψ_{t+1}(k+c, c) = Σ_d U[c][d]·ψ_t(k, d);
- il sistema parte nello stato |0⟩ del nodo k=0;
- probabilità del nodo p(k) = Σ_c |ψ(k, c)|²; flusso lungo il ramo c del nodo k:
  |(Uψ)_c|², calcolato dopo la moneta e prima dello spostamento.

La componente c del nodo k+c arriva solo dal nodo k. Le ampiezze dei rami che
convergono stanno quindi in componenti diverse e interferiscono alla moneta del
passo successivo. La somma delle probabilità resta 1 a ogni passo.

Il **disordine di fase** D ∈ [0, 1] ruota ogni nodo di una fase casuale
|φ| ≤ π·D prima della moneta (generatore con seme, riproducibile). L'evoluzione
resta unitaria. Con D grande l'interferenza diventa incoerente e l'allargamento
torna diffusivo (σ ∝ √t), come nel regime classico.

Nel caso classico il flusso lungo ogni ramo è p(k)/N e le probabilità si sommano.

## Parametri e query string

| Parametro | Query | Intervallo | Default |
|---|---|---|---|
| Esiti per misura N | `n` | 2–4 | 2 |
| Misure T | `T` | 1–40 (albero: vedi limite sopra) | 20 |
| Regime | `reg` | `tree`, `classical`, `quantum` | `quantum` |
| Disordine di fase D | `dis` | 0–1 | 0 |
| Seme casuale | `seed` | 0–99999 | 1 |
| Misura mostrata t | `step` | 0–T | T |
| Vista | `view` | `graph`, `table` | `graph` |
| Lingua | `lang` | `it`, `en` | browser |

Esempio: `index.html?n=2&T=30&reg=quantum&step=30`.

Lingua e tema (sistema, chiaro, scuro) si scelgono con l'ingranaggio in alto a
destra. Sono salvati nel browser e valgono anche per le altre simulazioni.

## Letture

Si riferiscono tutte al passo t mostrato.

- **Mondi dell'albero** N^t e **mondi distinti** (N−1)·t+1.
- **Mondi effettivi** 1/Σp²: quanti mondi "pesano" davvero (N^t se tutti i mondi
  dell'albero avessero lo stesso peso, molto meno nel reticolo).
- **Larghezza σ**: deviazione standard del record x.
- **Rami cancellati per interferenza**: rami uscenti dal passo t−1 con flusso
  quantistico sotto 10⁻⁹.
- **Mondi a probabilità nulla**: nodi del passo t con probabilità quantistica sotto
  10⁻⁹.

Le letture classiche e quantistiche compaiono in tutti i regimi, così si possono
confrontare.

## Legenda del grafico

- Tempo in orizzontale, record x in verticale (vista albero: ventaglio dei mondi).
- Dimensione e colore dei nodi crescono con la probabilità, relativa al massimo
  del passo. L'opacità dei rami è proporzionale al flusso.
- Tratteggio e cerchi vuoti: rami e mondi cancellati dall'interferenza.
- Puntatore su un nodo: il nodo, i rami che vi convergono e i nodi di provenienza
  diventano arancioni. Il tooltip mostra record, sequenze di esiti e le due
  probabilità.
- Istogramma in basso: distribuzione al passo t. Nel regime quantistico il
  contorno arancione è la distribuzione classica.
- Vista **Tabella**: gli stessi numeri del passo t, con il rapporto p quantistica /
  p classica.

## Struttura

```
simulations/quantum-mechanics/many-worlds/
├── index.html      pagina e pannello dei controlli
├── css/style.css   token del tema (chiaro, scuro, sistema) e layout responsive
├── js/i18n.js      dizionari it/en e funzioni di traduzione
├── js/model.js     reticolo, cammino quantistico, statistiche (usabile anche da Node)
├── js/graph.js     renderer Canvas, tooltip, istogramma
└── js/app.js       controlli, query string, animazione
```

Il pulsante delle impostazioni (lingua e tema) è comune a tutte le simulazioni e sta
in `simulations/shared/` (`js/settings.js`, `css/settings.css`).

## Semplificazioni

- La convergenza è imposta per costruzione: due storie sono "lo stesso mondo" se
  hanno lo stesso record. Il criterio è volutamente grossolano e permette un
  reticolo esatto e calcolabile.
- Sommando direttamente le ampiezze dei rami convergenti, senza moneta, la dinamica
  non sarebbe unitaria. Il cammino quantistico a moneta è il modo standard di
  rendere unitaria una propagazione su reticolo.
- Lo stato iniziale |0⟩ con la moneta di Hadamard dà una distribuzione asimmetrica,
  una proprietà nota del cammino di Hadamard.
- La vista ad albero è solo un conteggio e non simula nulla in più del reticolo.

## Verifica

```
cd simulations/quantum-mechanics/many-worlds && node -e 'const M=require("./js/model.js"); const I=require("./js/i18n.js").I18n; const L=M.buildLattice({outcomes:2,steps:3}); console.log(L[3].map(n=>n.pQuantum.toFixed(3)).join(" "), I.check().length)'
```

Atteso: `0.125 0.625 0.125 0.125 0` (distribuzione nota del cammino di Hadamard a
t=3 e nessuna chiave mancante nei dizionari).
