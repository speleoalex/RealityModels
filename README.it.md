# RealityModels: simulazioni di fisica

Simulazioni visive di teorie e interpretazioni della realtà: meccanica quantistica,
tempo, energia. Il filo comune è l'idea di un universo matematico a blocco con molti
mondi, vicina all'ipotesi dell'universo matematico di Max Tegmark: lo spaziotempo
esiste tutto insieme, il moto è geometria e i rami quantistici sono parti della
stessa struttura.

Ogni simulazione è una pagina HTML autonoma e offline: si apre il suo `index.html` nel
browser, anche con un doppio clic. Niente server né installazione.

Per distribuire una simulazione come file unico si generano le versioni standalone:

```
node tools/build-standalone.js
```

Lo script scrive `<simulazione>.standalone.html` accanto a ogni `index.html`, con
tutto il CSS e il JavaScript (three.js compreso) incorporati. Quel file gira da solo
ovunque; solo i link ai documenti richiedono il repository.

Per pubblicare il progetto sul web basta caricarlo su un host con PHP 7.4 o successivo
e aprire `index.php`. Elenca le simulazioni e i documenti che trova su disco, quindi
quelli nuovi compaiono senza modificarlo, e mostra ogni documento Markdown come pagina.
URL: `index.php?sim=<argomento>/<nome>`, `index.php?doc=<argomento>/<nome>`,
`&lang=it|en`.

Il progetto è online su
[www.sparkilla.com/apps/RealityModels](https://www.sparkilla.com/apps/RealityModels/).

English version: [README.md](README.md).

## Simulazioni

### Relatività

Un corpo in moto e uno fermo nell'universo blocco, spaziotempo 2+1.
Guida: [block-universe-simulations-guide.it.md](docs/relativity/block-universe-simulations-guide.it.md). Teoria:
[block-universe-relativity-theory.it.md](docs/relativity/block-universe-relativity-theory.it.md).

| Simulazione | Contenuto |
|---|---|
| [length-contraction](simulations/relativity/length-contraction/index.html) | Contrazione delle lunghezze come sezione di un tubo di universo inclinato. |
| [time-dilation](simulations/relativity/time-dilation/index.html) | In più tacche e letture degli orologi: dilatazione del tempo. |
| [accelerated-motion](simulations/relativity/accelerated-motion/index.html) | Corpo rigido (Born) che accelera, frena e si ferma: tubo di universo curvo. |

### Meccanica quantistica

Guide: [many-worlds-simulation-guide.it.md](docs/quantum-mechanics/many-worlds-simulation-guide.it.md),
[many-interacting-worlds-simulation-guide.it.md](docs/quantum-mechanics/many-interacting-worlds-simulation-guide.it.md). Teoria:
[many-worlds-convergence-theory.it.md](docs/quantum-mechanics/many-worlds-convergence-theory.it.md),
[many-interacting-worlds-theory.it.md](docs/quantum-mechanics/many-interacting-worlds-theory.it.md).

| Simulazione | Contenuto |
|---|---|
| [many-worlds](simulations/quantum-mechanics/many-worlds/index.html) | Molti mondi: albero di rami contro rami che convergono quando hanno lo stesso record (reticolo classico e cammino quantistico con interferenza). |
| [many-interacting-worlds](simulations/quantum-mechanics/many-interacting-worlds/index.html) | Molti mondi interagenti: N mondi classici che si respingono riproducono indeterminazione, energia di punto zero, allargamento, interferenza e il collasso come selezione di un sottoinsieme (Hall, Deckert e Wiseman, 2014). |

### Fondamenti

Glossario dei termini alla base del progetto (MUH, CUH, it from bit, gerarchia
cumulativa, regresso dei contenitori):
[mathematical-universe-glossary.it.md](docs/foundations/mathematical-universe-glossary.it.md).

Guida: [algorithmic-probability-simulation-guide.it.md](docs/foundations/algorithmic-probability-simulation-guide.it.md). Teoria:
[algorithmic-probability-theory.it.md](docs/foundations/algorithmic-probability-theory.it.md).

| Simulazione | Contenuto |
|---|---|
| [turing-census](simulations/foundations/turing-census/index.html) | Censimento di tutte le piccole macchine di Turing: gli output di quelle che si fermano costruiscono la distribuzione universale, le stringhe semplici vincono con il solo contare. |

## Lingua e tema

L'ingranaggio in alto a destra apre le impostazioni: lingua (italiano, inglese) e tema
(sistema, chiaro, scuro). Le scelte restano salvate nel browser e valgono per tutte le
simulazioni. `?lang=it` o `?lang=en` nell'URL ha la precedenza.

## Struttura

```
README.md, README.it.md
docs/<argomento>/
  <tema>-theory.{it,en}.md               teoria, formule, bibliografia
  <tema>-simulation(s)-guide.{it,en}.md  uso, parametri, verifiche numeriche
  <tema>-glossary.{it,en}.md             termini, bibliografia
simulations/<argomento>/<simulazione>/
  index.html, css/, js/                  una simulazione
simulations/shared/
  lib/                                   three.js r121 e OrbitControls (copie locali)
  js/settings.js, css/settings.css       pannello di lingua e tema
tools/build-standalone.js                genera le versioni standalone
index.php                                front end web: naviga simulazioni e documenti
```

Argomenti: `relativity` (relatività), `quantum-mechanics` (meccanica quantistica),
`foundations` (fondamenti).
