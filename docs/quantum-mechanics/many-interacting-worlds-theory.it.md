# Teoria: molti mondi interagenti

La simulazione
[many-interacting-worlds](../../simulations/quantum-mechanics/many-interacting-worlds/index.html)
implementa la proposta di Hall, Deckert e Wiseman [2014]: la meccanica
quantistica come statistica di N mondi classici che si respingono. Questo
documento dà le equazioni con la notazione di `js/model.js`, elenca i risultati
esatti su cui il simulatore si verifica e separa la teoria pubblicata dalle
scelte di lavoro del simulatore. Uso e parametri:
[many-interacting-worlds-simulation-guide.it.md](many-interacting-worlds-simulation-guide.it.md);
versione inglese:
[many-interacting-worlds-theory.en.md](many-interacting-worlds-theory.en.md).

## 1. Dalla funzione d'onda alle traiettorie

Madelung [1927] riscrisse l'equazione di Schrödinger come un fluido: con
ψ = √ρ · exp(iS/ħ), la densità ρ e il campo di velocità v = ∇S/m obbediscono
all'idrodinamica classica più un termine in più, il **potenziale quantistico**

```
Q = -(ħ²/2m) · (∂²√ρ/∂x²) / √ρ
```

Bohm [1952] lesse le stesse equazioni come meccanica: particelle puntiformi
seguono traiettorie guidate da ψ, e ogni effetto quantistico entra tramite la
forza -∂Q/∂x. In entrambe le letture la funzione d'onda resta un oggetto
fondamentale.

L'approccio dei molti mondi interagenti (MIW) la elimina. Si prendono N mondi,
ognuno una particella classica con posizione x[n] e velocità v[n] definite, e si
approssima ρ con la densità empirica dei mondi stessi. Q diventa allora un
**potenziale tra mondi**: ogni mondo sente i suoi vicini, e la forza che nella
teoria di Bohm veniva da ψ ora viene da una repulsione tra mondi vicini. La
funzione d'onda, se la si vuole ancora, è una descrizione emergente
dell'insieme; nulla nella dinamica vi fa riferimento. Precursori con un continuo
di traiettorie sono Poirier [2010] e Schiff e Poirier [2012]; la teoria a N
finito con la sua forza giocattolo è Hall, Deckert e Wiseman [2014]; la lettura
a "densità di mondi" è discussa da Sebens [2015] e Boström [2015].

## 2. Il modello in una dimensione

Unità ħ = m = 1. Gli N mondi mantengono un ordine fisso x[0] < x[1] < ... <
x[N-1], con distanze g[n] = x[n+1] - x[n], inversi s[n] = 1/g[n]
(s[-1] = s[N-1] = 0) e differenze D[n] = s[n] - s[n-1]. Il potenziale tra mondi
usato da HDW e da `model.js` è

```
U = (1/8) · Σ_n D[n]²
```

che è la forma discreta della media di Q su mondi con pesi uguali. Il suo
gradiente è esatto e locale (entrano solo le distanze adiacenti), quindi le
forze costano O(N):

```
dU/dx[m] = (1/4) · ( D[m]·(s[m]² + s[m-1]²) - D[m+1]·s[m]² - D[m-1]·s[m-1]² )
```

con le D fuori intervallo poste a zero. Ogni mondo segue quindi l'equazione di
Newton nel potenziale esterno V(x) = ω²x²/2 (ω = 0 per la particella libera)
più questa repulsione:

```
a[m] = -dU/dx[m] - ω²·x[m]
```

La repulsione diverge come 1/g³ quando due mondi si avvicinano, quindi i mondi
non si incrociano mai e l'ordinamento si conserva per sempre. Con N = 1 il
potenziale U è identicamente nullo: un mondo solo è puramente classico. Il
comportamento quantistico è una proprietà collettiva dell'insieme, non di un
singolo mondo.

## 3. Risultati esatti a N finito

Sono teoremi del modello giocattolo, non approssimazioni a N grande, e il
simulatore mostra ciascuno accanto al valore misurato.

**Oscillatore stazionario.** Una configurazione ferma è stazionaria quando
dU/dx[m] = -ω²x[m] per ogni m, il che si riduce a D[n] = -2ω·x[n] e quindi alla
ricorrenza s[n] = s[n-1] - 2ω·x[n] chiusa da s[N-1] = 0. `groundState` la
risolve con uno shooting sul mondo più a sinistra. La configurazione soddisfa la
regola di somma

```
Σ_n x[n]² = (N-1)/(2ω)
```

**Energia di punto zero.** L'energia di quella configurazione è esattamente

```
E = (N-1)·ω/2
```

che tende all'energia quantistica di stato fondamentale ω/2 per mondo al
crescere di N, ed è zero per N = 1: l'energia di punto zero è l'energia
immagazzinata nella repulsione.

**Relazione di indeterminazione.** Si definisce la dispersione di impulso
dell'insieme come Δp² = Var(v) + 2U/N. Il secondo termine fa il ruolo della
parte osmotica (quantistica) dell'impulso nella meccanica stocastica e in quella
bohmiana: è la parte immagazzinata nell'interazione tra mondi. Per l'oscillatore
stazionario il prodotto è esattamente

```
Δx·Δp = (1 - 1/N)·ħ/2
```

che si avvicina da sotto al limite di Heisenberg ħ/2 al crescere di N, e si
annulla per N = 1 [Hall, Deckert e Wiseman 2014, eq. 22].

**Allargamento libero.** Spegnendo la trappola (ω = 0) a t = 0 dalla
configurazione stazionaria si ha la soluzione esatta
x[n](t) = x[n](0)·√(1+ω²t²), la stessa legge della larghezza del pacchetto
gaussiano quantistico. La repulsione converte U in energia cinetica, esattamente
come il pacchetto quantistico converte Q in allargamento.

**Interferenza.** Due pacchetti lanciati uno contro l'altro non si attraversano
(i mondi non possono incrociarsi): la repulsione incanala i mondi in bande di
densità alta e bassa alternate con spaziatura vicina a πħ/p, l'analogo delle
frange del pattern di interferenza a due pacchetti. Questo risultato è numerico,
non in forma chiusa, e riproduce il comportamento riportato da HDW.

## 4. Misura: il collasso come condizionamento

MIW non ha un postulato di collasso. Tutti gli N mondi sono ugualmente reali; un
osservatore vive in uno di essi e vede la posizione definita di quel mondo. Una
misura di posizione con risoluzione δ fa due cose:

- **Regola di Born.** L'esito registrato è la posizione del mondo che
  l'osservatore si trova ad abitare. Con mondi a pesi uguali questa è
  un'estrazione uniforme tra gli N, e poiché la densità dei mondi approssima
  |ψ|², la frequenza degli esiti vicino a x approssima |ψ(x)|²: la regola di
  Born è contare mondi.
- **Condizionamento.** Dopo il registro "la particella è entro δ da X", i mondi
  compatibili con il registro formano un sottoinsieme che continua a interagire.
  I mondi incompatibili non spariscono e non vengono fusi: il loro accoppiamento
  con quelli compatibili diventa irrilevante per l'osservatore, e nel simulatore
  ogni bin scartato evolve per conto suo da quel momento.

Quindi l'intuizione del "collasso come intersezione di realtà" vale in un senso
preciso: lo stato dopo la misura è la **selezione del sottoinsieme** di mondi
che concordano con il registro, e Δx collassa dalla larghezza dell'intero
insieme ad al più δ. Non è mai una fusione: due mondi non diventano mai uno, e i
mondi scartati continuano a esistere. Questo meccanismo è diverso dalla
**convergenza** di rami esplorata nella simulazione
[many-worlds con convergenze](many-worlds-convergence-theory.it.md), dove storie
distinte si fondono in un nodo e le ampiezze si sommano: qui nulla si fonde e
nulla interferisce alla misura, l'insieme viene solo diviso.

La strizzatura ha un costo: il condizionamento lascia i mondi tenuti impacchettati
a distanze dell'ordine di δ con una grande energia di interazione U, che si
riconverte subito in allargamento. È il calcio di Heisenberg di una misura di
posizione netta, visibile nel simulatore come il bin tenuto che esplode verso
l'esterno.

## 5. Cosa lascia fuori il modello giocattolo

- **Il limite di N grande.** Che la dinamica HDW converga all'equazione di
  Schrödinger per N che tende all'infinito è argomentato e verificato
  numericamente, ma una dimostrazione generale è aperta. N finito dà piccole
  deviazioni dalla meccanica quantistica, che HDW presentano come un tratto in
  linea di principio osservabile.
- **Una particella in una dimensione.** I sistemi entangled richiedono mondi che
  sono punti nello spazio delle configurazioni; gli argomenti di ordinamento e la
  semplice forza 1/g non si trasferiscono direttamente, e il MIW a più particelle
  interagenti è un problema di ricerca attivo [Hall, Deckert e Wiseman 2014,
  sez. VII; Herrmann et al. 2018 studiano schemi numerici].
- **Pesi uguali.** Il modello dà a ogni mondo lo stesso peso; pesi non uniformi
  cambierebbero sia il potenziale sia il conteggio della regola di Born.
- **Spin e particelle identiche** non hanno una formulazione MIW in questo
  modello giocattolo.
- **La forza è una scelta tra tante.** U è la discretizzazione più semplice del
  potenziale quantistico per mondi ordinati su una retta; esistono altre
  interazioni con lo stesso limite continuo che differiscono a N finito.

## Bibliografia

Formulazioni idrodinamiche e a onda pilota

- Madelung, E. (1927). Quantentheorie in hydrodynamischer Form. *Zeitschrift für
  Physik* 40, 322-326.
- Bohm, D. (1952). A suggested interpretation of the quantum theory in terms of
  "hidden" variables, I e II. *Physical Review* 85(2), 166-179 e 180-193.
- Holland, P. R. (1993). *The Quantum Theory of Motion*. Cambridge University
  Press.

Insiemi di traiettorie senza funzione d'onda

- Poirier, B. (2010). Bohmian mechanics without pilot waves. *Chemical Physics*
  370(1-3), 4-14.
- Schiff, J., Poirier, B. (2012). Quantum mechanics without wavefunctions.
  *Journal of Chemical Physics* 136, 031102.

Molti mondi interagenti

- Hall, M. J. W., Deckert, D.-A., Wiseman, H. M. (2014). Quantum phenomena
  modelled by interactions between many classical worlds. *Physical Review X* 4,
  041013. arXiv:1402.6144.
- Sebens, C. T. (2015). Quantum mechanics as classical physics. *Philosophy of
  Science* 82(2), 266-291. arXiv:1403.0014.
- Boström, K. J. (2015). Quantum mechanics as a deterministic theory of a
  continuum of worlds. *Quantum Studies: Mathematics and Foundations* 2,
  315-347. arXiv:1410.5653.
- Herrmann, H., Hall, M. J. W., Wiseman, H. M., Deckert, D.-A. (2018). Ground
  states in the many interacting worlds approach. arXiv:1712.01918.
