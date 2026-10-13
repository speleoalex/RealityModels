# Molti mondi interagenti

Simulazione interattiva del modello di Hall, Deckert e Wiseman: N mondi
classici, ognuno con la particella in una posizione definita, si respingono e le
sole equazioni di Newton riproducono indeterminazione, energia di punto zero,
allargamento del pacchetto, interferenza e il collasso di una misura. Non ha
dipendenze e funziona offline.

Si apre con un doppio clic su
[simulations/quantum-mechanics/many-interacting-worlds/index.html](../../simulations/quantum-mechanics/many-interacting-worlds/index.html)
(o da un qualsiasi server statico); niente da installare. Teoria e riferimenti:
[many-interacting-worlds-theory.it.md](many-interacting-worlds-theory.it.md);
versione inglese:
[many-interacting-worlds-simulation-guide.en.md](many-interacting-worlds-simulation-guide.en.md).

## Idea

Ogni mondo n è una particella classica con posizione x[n] e velocità v[n]. I
mondi vicini si respingono con una forza che cresce al chiudersi della distanza
(il potenziale quantistico discreto, unità ħ = m = 1). Con N = 1 la repulsione è
zero e resta la meccanica classica; il comportamento quantistico è una proprietà
dell'insieme. Le formule e i risultati esatti sono nel documento di teoria.

## Scenari

| Scenario | Cosa mostra |
|---|---|
| **Oscillatore: stato fondamentale** | La repulsione bilancia la trappola ω: configurazione ferma con energia (N−1)·ħω/2 e Δx·Δp = (1−1/N)·ħ/2, entrambe mostrate accanto ai valori misurati. Con N = 1 entrambe si annullano. |
| **Particella libera: allargamento** | Trappola spenta da t = 0. Il ventaglio di mondi si allarga con Δx(t) = Δx(0)·√(1+ω²t²); la lettura confronta il rapporto misurato con la legge. |
| **Due pacchetti: interferenza** | Due pacchetti rilassati lanciati uno contro l'altro a ±v₀ senza trappola. I mondi non si incrociano mai: la repulsione li incanala in bande di densità con spaziatura circa πħ/p, le frange di interferenza. |
| **Misura: selezione di un bin** | Lo stato fondamentale più una misura di posizione con risoluzione δ. Un mondo estratto in modo uniforme (regola di Born a pesi uguali) fissa l'esito; i mondi entro δ restano un insieme interagente, gli altri bin si disaccoppiano, sbiadiscono ed evolvono per conto loro. Il collasso è selezione, mai fusione. |

## Parametri e query string

| Parametro | Query | Intervallo | Default |
|---|---|---|---|
| Scenario | `sc` | `ground`, `free`, `collision`, `measure` | `ground` |
| Mondi N | `N` | 1–80 | 20 |
| Frequenza della trappola ω | `w` | 0.2–3 | 1 |
| Velocità dei pacchetti v₀ (solo interferenza) | `v0` | 0.5–6 | 3 |
| Risoluzione della misura δ (solo misura) | `d` | 0.1–2 | 0.4 |
| Lingua | `lang` | `it`, `en` | browser |

Esempio: `index.html?sc=collision&N=40&w=0.5&v0=3`.

Lingua e tema (Sistema, Chiaro, Scuro) si impostano con il pulsante a
ingranaggio in alto a destra. Restano salvati nel browser e valgono anche per le
altre simulazioni.

## Letture

- **Mondi accoppiati**: mondi ancora in interazione con quello estratto /
  totale. Cala a ogni misura.
- **Δx**, **Δp**: dispersione delle posizioni e degli impulsi dell'insieme
  accoppiato. Δp include il termine osmotico 2U/N, la parte della dispersione di
  impulso immagazzinata nella repulsione tra mondi U.
- **Δx·Δp** accanto al **valore esatto (1−1/N)·ħ/2**: uguali nello stato
  stazionario, maggiore altrove.
- **Energia totale** accanto all'**energia attesa (N−1)·ħω/2** negli scenari con
  trappola. L'integratore tiene la deriva di energia attorno a 10⁻¹⁶ per periodo
  nello stato fondamentale e sotto circa 10⁻⁴ nelle collisioni più dure.
- **Δx(t)/Δx(0) vs √(1+ω²t²)** nello scenario libero: i due numeri devono
  coincidere a ogni istante.

Dopo una misura il bin tenuto è strizzato a una larghezza dell'ordine di δ con
una grande energia di repulsione, quindi Δx prima collassa e poi ricresce in
fretta: è il calcio di impulso che una misura netta di posizione deve dare.

## Legenda del grafico

- Tempo in orizzontale, posizione in verticale: una linea per mondo. I mondi non
  si incrociano mai.
- Il mondo estratto da una misura è spesso e di colore caldo; i bin scartati
  diventano grigi dalla linea verticale tratteggiata che segna l'istante della
  misura.
- Striscia a destra: istogramma della densità attuale dei mondi (grigio per i
  mondi disaccoppiati) e, tratteggiata, la densità quantistica |ψ|² attesa nei
  casi stazionario e libero.
- Puntatore sul grafico: tooltip con indice del mondo, posizione e, sull'ultimo
  istante, velocità.

## Struttura

```
simulations/quantum-mechanics/many-interacting-worlds/
├── index.html      pagina e pannello di controllo
├── css/style.css   token del tema (chiaro, scuro, sistema) e layout responsive
├── js/i18n.js      dizionari it/en e funzioni di traduzione
├── js/model.js     forze, stato fondamentale, integratore, misura (usabile anche da Node)
├── js/graph.js     renderer Canvas: linee di mondo, istogramma, tooltip
└── js/app.js       controlli, scenari, query string, animazione
```

Il pulsante delle impostazioni (lingua e tema) è condiviso da tutte le
simulazioni e vive in `simulations/shared/` (`js/settings.js`,
`css/settings.css`).

## Semplificazioni

- Una particella in una dimensione, mondi a pesi uguali: il modello giocattolo
  dell'articolo del 2014. Niente entanglement, niente spin (vedi il documento di
  teoria, sezione 5).
- La misura divide i mondi scartati in bin larghi al più δ e ogni bin continua a
  evolvere come insieme indipendente; le letture descrivono l'insieme tenuto.
- Verlet delle velocità con sottopassi adattivi (la repulsione si irrigidisce
  come 1/g³); un sottopasso che farebbe incrociare i mondi viene dimezzato e
  ritentato. Il budget di sottopassi limita il lavoro per frame, quindi
  parametri estremi rallentano il tempo simulato, non il browser.

## Verifica

```
cd simulations/quantum-mechanics/many-interacting-worlds && node -e 'const M=require("./js/model.js"); const I=require("./js/i18n.js").I18n; const x=M.groundState(11,1); const s=M.statistics(M.createState(x,null,1)); let sq=0; x.forEach(function(p){sq+=p*p}); console.log(sq.toFixed(6), s.energy.toFixed(6), s.product.toFixed(6), I.check().length)'
```

Atteso: `5.000000 5.000000 0.454545 0` (regola di somma Σx² = (N−1)/(2ω),
energia (N−1)·ω/2, prodotto (1−1/N)/2 per N = 11, e nessuna chiave mancante nei
dizionari).

```
cd simulations/quantum-mechanics/many-interacting-worlds && node -e 'const M=require("./js/model.js"); const st=M.createState(M.groundState(21,1),null,0); const d0=M.statistics(st).dx; while(st.t<1-1e-9) M.step(st,0.05,1e6); console.log((M.statistics(st).dx/d0).toFixed(6))'
```

Atteso: `1.414214` (allargamento libero √(1+t²) = √2 a t = 1).
