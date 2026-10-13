# Relatività: le simulazioni dell'universo blocco

Simulazioni geometriche statiche di un corpo in moto rispetto a un corpo fermo
nell'universo blocco: due dimensioni di spazio (x, y) e una di tempo (t). Non c'è
animazione: ogni corpo è un *tubo di universo* e il moto è l'inclinazione del tubo.
La contrazione delle lunghezze vista dal corpo fermo non viene da una formula: è la
sezione del tubo inclinato con il piano t = costante.

Teoria e formule: [block-universe-relativity-theory.it.md](block-universe-relativity-theory.it.md). Versione inglese di questa pagina:
[block-universe-simulations-guide.en.md](block-universe-simulations-guide.en.md).

## Le simulazioni

| Simulazione | Contenuto | Teoria |
|---|---|---|
| [length-contraction](../../simulations/relativity/length-contraction/index.html) | Contrazione delle lunghezze (simulazione base). | sezioni 1–8 |
| [time-dilation](../../simulations/relativity/time-dilation/index.html) | Come length-contraction, più la dilatazione del tempo: tacche degli orologi (una sezione per unità di tempo proprio su ciascun tubo) e letture degli orologi dei due corpi agli estremi delle sezioni (sezione «Orologi» nel pannello delle letture). | sezioni 1–9 |
| [accelerated-motion](../../simulations/relativity/accelerated-motion/index.html) | Come time-dilation, ma il corpo in moto parte da fermo, accelera con accelerazione propria costante fino a metà strada, frena e si ferma dopo una distanza X (moto iperbolico, corpo rigido nel senso di Born). Il tubo di universo è curvo e i piani di simultaneità del corpo cambiano inclinazione istante per istante. Gli orologi di coda e testa segnano tempi diversi durante la spinta e tornano d'accordo all'arrivo. | sezioni 1–10 |

## Uso

Aprire `index.html` della simulazione in un browser (basta il doppio clic: funziona
senza server e senza rete, le librerie sono nel repository).

Comandi nel pannello laterale:

- velocità β = v/c del corpo in moto (length-contraction e time-dilation) oppure
  accelerazione propria a e distanza X del viaggio (accelerated-motion), lunghezza
  propria L₀, larghezza W;
- piano «adesso» del corpo fermo (t = costante) e, a scelta, piano «adesso» del corpo
  in moto (t′ = costante, inclinato) per vedere la reciprocità;
- cono di luce dall'evento iniziale del corpo in moto;
- (time-dilation e accelerated-motion) tacche degli orologi, attive di default;
- viste: 3D navigabile, laterale x–t (diagramma di Minkowski), dall'alto x–y.

Lingua (italiano, inglese) e tema (sistema, chiaro, scuro) si scelgono dal pulsante a
ingranaggio in alto a destra. Le scelte sono salvate nel browser e valgono per tutte
le simulazioni.

I parametri stanno anche nella query string, così una configurazione si può condividere:

```
simulations/relativity/time-dilation/index.html?beta=0.8&L0=1&W=0.4&t=2&moving=1&tau=1.2&cone=1&view=side&lang=en
```

In time-dilation e accelerated-motion `ticks=0` nasconde le tacche degli orologi. In
accelerated-motion al posto di `beta` ci sono `a` e `X`, e `tau` è il tempo proprio
della coda:

```
simulations/relativity/accelerated-motion/index.html?a=1&X=3&L0=1&W=0.4&t=2&moving=1&tau=1.5&cone=1&view=side
```

## Struttura

Struttura comune alle tre simulazioni:

```
simulations/relativity/<simulazione>/
  index.html          pagina della simulazione
  css/style.css       stile, tema chiaro e scuro
  js/physics.js       geometria dello spaziotempo (funzioni pure, testabili con Node)
  js/scene.js         disegno con three.js
  js/app.js           collegamento tra controlli e scena
  js/i18n.js          dizionari delle lingue
simulations/shared/
  lib/                three.js r121 e OrbitControls (copie locali, comuni alle tre)
  js/settings.js      pulsante e pannello di lingua e tema
  css/settings.css    stile del pannello di lingua e tema
```

## Verifica numerica

```
cd simulations/relativity/time-dilation && node -e 'const P=require("./js/physics.js"); console.log(P.gamma(0.6), P.sliceAtLabTime({beta:0.6,x0:0,L0:1,W:0.4,t:2}).length, P.movingClocksAtLabTime({beta:0.8,x0:0,L0:1,W:0.4,t:2}).rear)'
```

Output atteso: `1.25 0.8 1.1999999999999997` (il terzo valore è t/γ, che esiste solo
da time-dilation in poi).

Per accelerated-motion:

```
cd simulations/relativity/accelerated-motion && node -e 'const P=require("./js/physics.js"); const tr=P.trip({a:1,X:3,L0:1,x0:-1}); console.log(tr.T.toFixed(3), tr.tauTotal.toFixed(3), tr.betaMax.toFixed(3), P.movingClocksAtMovingTime(tr,1).front)'
```

Output atteso: `5.196 3.951 0.866 2`, cioè durata del viaggio nel laboratorio,
durata propria, velocità massima e lettura dell'orologio di testa quando quello di
coda segna 1.
