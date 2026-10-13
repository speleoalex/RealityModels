# Censimento delle macchine di Turing

Censimento interattivo di tutte le piccole macchine di Turing: ogni macchina
parte dal nastro vuoto e si contano gli output di quelle che si fermano. Le
frequenze approssimano la probabilità algoritmica, la distribuzione universale
di Solomonoff e Levin. Non ha dipendenze e funziona offline.

Si apre con un doppio clic su
[simulations/foundations/turing-census/index.html](../../simulations/foundations/turing-census/index.html)
(o da qualsiasi server statico), senza installare nulla. Teoria e bibliografia:
[algorithmic-probability-theory.it.md](algorithmic-probability-theory.it.md); versione inglese: [algorithmic-probability-simulation-guide.en.md](algorithmic-probability-simulation-guide.en.md).

## Idea

Si prendono tutte le macchine di Turing con **n** stati e 2 simboli, si esegue
ciascuna su un nastro di zeri e, quando si ferma, si registra la stringa delle
celle visitate. Nessuna stringa è privilegiata in partenza: ogni macchina conta
esattamente una volta. Il risultato però è fortemente ordinato. Le stringhe
corte escono da molte più macchine di quelle lunghe e, a parità di lunghezza,
le stringhe regolari battono quelle irregolari. La quota di macchine che
produce una stringa x approssima la sua **probabilità algoritmica** m(x), e
−log₂(quota) approssima la sua complessità di Kolmogorov in bit. La simulazione
mostra questa gerarchia mentre si costruisce, con il solo contare.

## Le macchine

- Una macchina ha un'istruzione per ogni coppia (stato, simbolo): scrive 0 o 1,
  si muove a sinistra o a destra, poi entra in uno degli n stati oppure si
  ferma. Anche l'istruzione di arresto scrive e si muove (formalismo busy
  beaver di Radó), quindi ogni coppia ha 4(n+1) scelte e le macchine sono
  (4(n+1))^(2n).
- Ogni macchina parte nello stato 0 su un nastro tutto a zero. L'output è il
  segmento di celle percorse, letto al momento dell'arresto.
- Una macchina ancora in corsa dopo S(n) passi, il record busy beaver, non si
  fermerà mai. Il censimento taglia ogni corsa a S(n), quindi l'arresto è
  deciso in modo esatto, mai stimato.

| Stati n | Macchine | Modalità | Limite di passi S(n) |
|---|---|---|---|
| 2 | 20.736 | enumerazione completa | 6 |
| 3 | 16.777.216 | enumerazione completa | 21 |
| 4 | 25.600.000.000 | campione casuale con seme | 107 |

Il censimento procede a piccole fette, così la pagina resta reattiva: 2 stati
finiscono subito, 3 stati richiedono qualche secondo, con 4 stati la durata
dipende dalla dimensione del campione. Il pulsante Esecuzione mette in pausa e
riprende.

## Parametri e query string

| Parametro | Query | Intervallo | Default |
|---|---|---|---|
| Stati n | `n` | 2–4 | 2 |
| Seme casuale (solo 4 stati) | `seed` | 0–99999 | 1 |
| Macchine campionate (solo 4 stati) | `samples` | 100000–10000000 | 1000000 |
| Scala | `scale` | `lin`, `log` | `lin` |
| Lingua | `lang` | `it`, `en` | browser |

Esempio: `index.html?n=3&scale=log`.

Lingua e tema (Sistema, Chiaro, Scuro) si impostano con il pulsante a
ingranaggio in alto a destra. Restano salvati nel browser e valgono anche per
le altre simulazioni.

## Letture

- **Macchine eseguite / totali**: avanzamento del censimento; con 4 stati il
  totale è la dimensione del campione.
- **Macchine che si fermano**: numero e quota delle macchine eseguite finora.
- **Stringhe distinte**: output diversi visti finora.
- **Corsa più lunga / limite S(n)**: passi della macchina più lenta che si è
  fermata. Nei censimenti completi raggiunge S(n) esattamente (6 e 21); nel
  campione a 4 stati resta molto sotto 107, perché le quasi campionesse sono
  una manciata di macchine su 25,6 miliardi.
- **Stringa più frequente**.

## Legenda del grafico

- Ogni barra è una stringa prodotta, in ordine di frequenza; l'altezza è la sua
  quota delle macchine che si fermano, su scala lineare o logaritmica. Il
  titolo dice quante delle stringhe distinte entrano nella classifica.
- Colore della barra = lunghezza della stringa; la scala dei colori satura a 5
  celle.
- La striscia in basso mostra la quota totale per ogni lunghezza.
- Puntatore su una barra: la barra diventa arancione, la stringa speculare
  riceve un contorno pieno arancione e il complemento 0↔1 uno tratteggiato. Il
  tooltip mostra quota, numero di macchine, posizione, la complessità stimata
  −log₂(quota) in bit e le quote di speculare e complemento.

## Risultati di riferimento

Numeri prodotti da `js/model.js`, lo stesso codice che esegue la pagina.

### 2 stati, censimento completo

20.736 macchine, 9.784 si fermano (47,18%), 17 stringhe distinte, corsa più
lunga 6 = S(2). Il censimento completo:

| Output | Macchine | Quota |
|---|---|---|
| 0 | 3.456 | 35,32% |
| 1 | 3.456 | 35,32% |
| 00 | 728 | 7,44% |
| 01 | 704 | 7,20% |
| 10 | 704 | 7,20% |
| 11 | 680 | 6,95% |
| 011, 110, 111 | 8 ciascuna | 0,08% ciascuna |
| 001, 010, 100, 101 | 4 ciascuna | 0,04% ciascuna |
| 1001, 1011, 1101, 1111 | 4 ciascuna | 0,04% ciascuna |

Da notare: `000` non compare mai, e ogni output di 4 celle inizia e finisce
con 1. Sei passi sono troppo pochi per percorrere quattro celle e lasciare
vuoti gli estremi.

### 3 stati, censimento completo

16.777.216 macchine, 7.571.840 si fermano (45,13%), 95 stringhe distinte,
corsa più lunga 21 = S(3). Testa della classifica:

| Output | Macchine | Quota |
|---|---|---|
| 0 | 2.097.152 | 27,70% |
| 1 | 2.097.152 | 27,70% |
| 00 | 722.752 | 9,55% |
| 01 | 704.912 | 9,31% |
| 10 | 704.912 | 9,31% |
| 11 | 687.072 | 9,07% |
| 111 | 66.840 | 0,88% |
| 000 | 64.200 | 0,85% |
| 011 | 63.920 | 0,84% |
| 110 | 63.920 | 0,84% |
| 001 | 62.392 | 0,82% |
| 100 | 62.392 | 0,82% |
| 010 | 58.992 | 0,78% |
| 101 | 58.576 | 0,77% |

Quota per lunghezza dell'output:

| Lunghezza | Macchine | Quota |
|---|---|---|
| 1 | 4.194.304 | 55,39% |
| 2 | 2.819.648 | 37,24% |
| 3 | 501.232 | 6,62% |
| 4 | 50.064 | 0,66% |
| 5 | 6.224 | 0,08% |
| 6 | 336 | 0,004% |
| 7 | 32 | 0,0004% |

Oltre le due celle, ogni cella in più costa circa un ordine di grandezza. Le
coppie speculari coincidono esattamente (01 = 10, 011 = 110, 001 = 100),
mentre il complemento 0↔1 no (010 ≠ 101, 000 < 111): il nastro vuoto è fatto
di zeri e rompe quella simmetria. Il documento di teoria spiega entrambi i
fatti.

### 4 stati, campione

Seme 1, 200.000 macchine: 87.161 si fermano (43,58%), 88 stringhe distinte,
corsa più lunga 24. Testa della classifica:

| Output | Macchine | Quota |
|---|---|---|
| 1 | 19.956 | 22,90% |
| 0 | 19.861 | 22,79% |
| 01 | 8.821 | 10,12% |
| 00 | 8.755 | 10,04% |
| 10 | 8.646 | 9,92% |
| 11 | 8.422 | 9,66% |
| 000 | 1.411 | 1,62% |
| 111 | 1.409 | 1,62% |

In un campione le parità esatte sopravvivono solo a meno del rumore: `0` e `1`
differiscono per errore di campionamento, non per struttura. La pagina parte
con 1.000.000 di campioni; questa tabella ne usa 200.000 per coincidere con il
terzo comando di verifica qui sotto.

## Semplificazioni

- Un solo formalismo fisso. I numeri dipendono dallo spazio di macchine (n, 2);
  un'altra codifica li sposterebbe delle costanti del teorema di invarianza
  (vedi il documento di teoria). Ciò che resta stabile è l'ordinamento tra
  stringhe semplici e complesse, non le singole quote.
- Nessun quoziente per simmetria. Lo specchio sinistra-destra è una biiezione
  esatta dello spazio delle macchine, quindi le stringhe speculari hanno
  conteggi identici; è un controllo incorporato, non una scoperta. Il
  complemento 0↔1 non è una simmetria, perché il nastro vuoto fissa lo 0.
- L'output è il segmento percorso, compresi gli zeri letti ma lasciati
  intatti. Convenzioni che registrano solo la parte scritta o non vuota danno
  tabelle diverse.
- La modalità a campione è solo statistica. Ogni macchina campionata è comunque
  decisa in modo esatto dal limite S(4); l'errore su una quota p è circa
  1/√(campioni·0,44·p), più o meno l'1,5% per una stringa all'1% con un milione
  di campioni.

## Struttura

```
simulations/foundations/turing-census/
├── index.html      pagina e pannello dei controlli
├── css/style.css   token del tema (chiaro, scuro, sistema) e layout responsivo
├── js/i18n.js      dizionari it/en e funzioni di traduzione
├── js/model.js     motore del censimento: enumerazione, campionamento, conteggi (usabile anche da Node)
├── js/graph.js     renderer Canvas: barre in classifica, striscia per lunghezza, tooltip
└── js/app.js       controlli, query string, animazione
```

Il pulsante delle impostazioni (lingua e tema) è condiviso da tutte le
simulazioni e vive in `simulations/shared/` (`js/settings.js`,
`css/settings.css`).

## Verifica

```
cd simulations/foundations/turing-census && node -e 'const M=require("./js/model.js"); const I=require("./js/i18n.js").I18n; const c=M.create({states:2}); M.run(c,c.total); const s=M.summary(c); console.log(c.halting, s.entries.length, c.maxUsed, I.check().length)'
```

Atteso: `9784 17 6 0` (9.784 macchine si fermano su 20.736, 17 stringhe
distinte, corsa più lunga 6 = S(2), nessuna chiave mancante nei dizionari).

```
cd simulations/foundations/turing-census && node -e 'const M=require("./js/model.js"); const c=M.create({states:3}); M.run(c,c.total); const s=M.summary(c); console.log(c.halting, s.entries.length, c.maxUsed)'
```

Atteso: `7571840 95 21` (richiede qualche secondo; corsa più lunga 21 = S(3)).

```
cd simulations/foundations/turing-census && node -e 'const M=require("./js/model.js"); const c=M.create({states:4,seed:1,samples:200000}); M.run(c,c.target); const s=M.summary(c); console.log(c.halting, s.entries.length, c.maxUsed)'
```

Atteso: `87161 88 24` (il campione ha un seme, quindi i numeri si riproducono
esattamente).
