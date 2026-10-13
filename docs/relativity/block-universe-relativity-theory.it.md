# Teoria: universo blocco, contrazione delle lunghezze e dilatazione del tempo

La geometria disegnata dalle simulazioni di relatività, con le stesse notazioni del
codice in `js/physics.js`. Le sezioni 1–8 valgono per
[length-contraction](../../simulations/relativity/length-contraction/index.html) e
[time-dilation](../../simulations/relativity/time-dilation/index.html). La sezione 9
riguarda gli orologi, presenti da time-dilation in poi. La sezione 10 riguarda il corpo
che accelera di [accelerated-motion](../../simulations/relativity/accelerated-motion/index.html),
che ha un `physics.js` diverso. Uso, parametri e verifiche sono in
[block-universe-simulations-guide.it.md](block-universe-simulations-guide.it.md); versione inglese: [block-universe-relativity-theory.en.md](block-universe-relativity-theory.en.md).

## 1. Universo blocco in 2+1 dimensioni

Nell'universo blocco lo spaziotempo è un oggetto geometrico dato una volta per tutte:
passato, presente e futuro esistono allo stesso modo. Un corpo non «si muove», occupa
una regione dello spaziotempo, il suo tubo di universo. Il moto è la pendenza del tubo
rispetto all'asse del tempo.

Quattro dimensioni non si possono disegnare, quindi il simulatore usa due dimensioni
di spazio (x, y) e una di tempo (t, verticale). Il moto è lungo x; y dà spessore ai
corpi e mostra che le direzioni trasversali non cambiano.

## 2. Coordinate e trasformazioni di Lorentz

Unità naturali con c = 1: il cono di luce ha pendenza 45° nel piano x–t.

- Sistema del corpo fermo («laboratorio»): coordinate (x, y, t).
- Sistema del corpo in moto a velocità β = v/c lungo x: coordinate (x′, y′, t′),
  nel codice `x1`, `t1`.
- γ = 1 / √(1 − β²) (funzione `gamma`).

Trasformazioni (funzioni `lorentzToMoving` e `lorentzToLab`):

```
x′ = γ (x − β t)        t′ = γ (t − β x)
x  = γ (x′ + β t′)      t  = γ (t′ + β x′)
y′ = y
```

L'origine del sistema in moto è l'evento (x₀, 0) del laboratorio, cioè il parametro
`x0` di tutte le funzioni.

## 3. Costruzione dei tubi di universo

**Corpo fermo** (`stationaryTube`): occupa x ∈ [xs, xs + L₀], y ∈ [−W/2, W/2] a
ogni t. Il tubo è un prisma verticale.

**Corpo in moto** (`movingTube`): nel proprio sistema di quiete occupa
x′ ∈ [0, L₀]. Le facce laterali sono le linee di universo dei due estremi,
x′ = 0 e x′ = L₀. Il codice non usa formule di contrazione: per ogni estremo x′ e per
ogni istante t del laboratorio risolve

```
t = γ (t′ + β x′)   ⇒   t′ = t/γ − β x′
```

e trasforma l'evento (x′, t′) nel laboratorio (`worldlineAtLabTime`). Il risultato è
una retta di pendenza β nel piano x–t, quindi il tubo è inclinato di atan(β) rispetto
all'asse t.

## 4. Perché la sezione t = costante è lunga L₀/γ

Il piano «adesso» del corpo fermo è t = costante. Tagliando il tubo inclinato con
questo piano (`sliceAtLabTime`) si ottengono gli estremi

```
x(x′=0)  = x₀ + β t
x(x′=L₀) = x₀ + β t + L₀/γ
```

La seconda si ricava sostituendo t′ = t/γ − β L₀ nella trasformazione:
x = x₀ + γ (L₀ + β t/γ − β² L₀) = x₀ + β t + γ L₀ (1 − β²) = x₀ + β t + L₀/γ.

La sezione è lunga L₀/γ: è la contrazione delle lunghezze. Sul corpo non agisce nulla;
il corpo fermo taglia il tubo inclinato con un piano diverso da quello di
simultaneità del corpo in moto.

## 5. Perché la sezione t′ = costante è lunga L₀

Il piano «adesso» del corpo in moto è t′ = τ. Nel laboratorio è il piano inclinato
(`movingNowPlane`)

```
t = β (x − x₀) + τ/γ
```

Tagliando il tubo in moto con questo piano (`movingSliceAtMovingTime`) gli estremi
sono le immagini di (x′=0, t′=τ) e (x′=L₀, t′=τ). La separazione
(Δx, Δt) = (γL₀, γβL₀) ha lunghezza di Minkowski

```
√(Δx² − Δt²) = γ L₀ √(1 − β²) = L₀
```

cioè la lunghezza propria: il corpo misura sé stesso lungo L₀.

## 6. Reciprocità

Lo stesso piano t′ = τ taglia anche il tubo verticale del corpo fermo
(`stationarySliceAtMovingTime`). Gli estremi sono (xs, t(xs)) e (xs + L₀, t(xs + L₀)),
con Δx = L₀ e Δt = β L₀, da cui

```
√(L₀² − β² L₀²) = L₀/γ
```

Il corpo in moto vede il corpo fermo contratto dello stesso fattore. Attivando
«Mostra anche l'adesso del corpo in moto» si vedono entrambe le sezioni quotate:
L₀ (propria) sul tubo in moto e L₀/γ sul tubo fermo.

## 7. Avvertenza: righello dello schermo e metrica di Minkowski

Il disegno è euclideo, lo spaziotempo no. Sui piani inclinati un segmento con
componenti (Δx, Δt) appare sullo schermo lungo √(Δx² + Δt²), ma la lunghezza fisica
è √(Δx² − Δt²). Per i segmenti sul piano t′ = costante la tabella «Letture» riporta
entrambi i valori (riga «lunghezza euclidea nel disegno»). Sul piano t = costante le
due misure coincidono perché Δt = 0.

Per lo stesso motivo il tubo inclinato, misurato con il righello dello schermo
perpendicolarmente alle facce, sembra più «largo» di quello verticale. È un artefatto
della proiezione euclidea.

## 8. Come usare la pagina

Valori di esempio con β = 0,6:

| grandezza | valore |
|---|---|
| γ | 1,25 |
| sezione del corpo fermo su t = cost | L₀ = 1,00 |
| sezione del corpo in moto su t = cost | L₀/γ = 0,80 |
| inclinazione delle linee di universo | atan(0,6) = 31,0° |

Con β = 0,8: γ = 1,667 e L₀/γ = 0,600.

- Vista laterale x–t: il diagramma di Minkowski. La sezione orizzontale del tubo
  inclinato è più corta di quella del tubo verticale.
- Vista dall'alto x–y: solo le due sezioni sul piano t = costante, con la stessa
  larghezza W e lunghezze L₀ e L₀/γ.
- Vista 3D: trascinare per ruotare, rotellina per lo zoom, tasto destro per spostare.
- Cono di luce: le linee di universo del corpo in moto restano dentro il cono
  (pendenza β < 1).

Il cursore del piano t′ va da 0 a t_max/γ, quindi dipende da β: sono i valori per cui
lo spigolo posteriore del corpo in moto resta nella finestra disegnata. I tubi sono
infiniti; il disegno li allunga quanto basta per contenere le sezioni inclinate.

## 9. Dilatazione del tempo: orologi e tacche (time-dilation)

La dilatazione del tempo è geometria come la contrazione: la contrazione è la
lunghezza di Minkowski *attraverso* il tubo, la dilatazione quella *lungo* il tubo.
Il tempo proprio di un corpo tra due eventi della sua linea di universo è

```
Δτ = √(Δt² − Δx²)
```

Per il corpo fermo Δx = 0 e Δτ = Δt. Per il corpo in moto, tra t = 0 e t = T,
Δx = βT e Δτ = T √(1 − β²) = T/γ.

### Tacche degli orologi

Ogni corpo porta un orologio sincronizzato nel proprio sistema. Su ciascun tubo il
simulatore disegna una sezione per ogni unità di tempo proprio:

- sul tubo fermo (`stationaryTicks`) i piani orizzontali t = 0, 1, 2, 3, 4;
- sul tubo in moto (`movingTicks`) i piani t′ = 0, 1, 2…, cioè le sezioni inclinate
  di `movingSliceAtMovingTime` con τ intero. Lo spigolo posteriore (x′ = 0) della
  tacca t′ = n cade nel laboratorio a t = γn.

A parità di altezza del blocco il tubo fermo contiene t_max tacche e quello in moto
t_max/γ: con β = 0,8 e t_max = 4 sono 4 contro 2,4 (riga «tempo proprio lungo tutto
il blocco» della tabella). Si disegnano solo le tacche contenute per intero nel tubo,
quindi con β = 0,8 si vedono t′ = 0 e t′ = 1. La tacca inclinata sembra più lunga
sullo schermo ma vale una sola unità (vedi sezione 7).

### Letture degli orologi sulle sezioni

Sul piano t = t_now il corpo fermo segna t_now a entrambi gli estremi. Gli orologi
del corpo in moto (`movingClocksAtLabTime`) segnano t′ = γ (t − β (x − x₀)).
Sostituendo le posizioni degli estremi della sezione (sezione 4):

```
coda  (x′ = 0):   t′ = t_now / γ
testa (x′ = L₀):  t′ = t_now / γ − β L₀
```

La coda mostra la dilatazione (t′/t = 1/γ). La differenza βL₀ tra coda e testa è la
relatività della simultaneità: eventi simultanei per il corpo fermo non lo sono per
quello in moto, quindi il tempo non è lo stesso nemmeno dentro un singolo rettangolo.

Sul piano t′ = τ succede il contrario (reciprocità): il corpo in moto segna τ a
entrambi gli estremi, gli orologi del corpo fermo segnano i tempi t degli estremi
della sezione di `stationarySliceAtMovingTime`,

```
t = β (x − x₀) + τ / γ      per x = xs e x = xs + L₀
```

Un orologio fermo in x = x₀ segnerebbe esattamente τ/γ: ciascun corpo vede l'orologio
dell'altro rallentato dello stesso fattore. Valori con β = 0,8, L₀ = 1, t_now = 2 e
τ = 1,2:

| orologio | lettura |
|---|---|
| corpo fermo su t = 2 | 2,000 |
| corpo in moto su t = 2, coda / testa | 1,200 / 0,400 |
| t′/t alla coda | 1/γ = 60 % |
| corpo in moto su t′ = 1,2 | 1,200 |
| corpo fermo su t′ = 1,2, sinistra / destra (xs = −2,5, x₀ = −1) | −0,480 / 0,320 |
| tempo proprio lungo il blocco, fermo / in moto | 4,000 / 2,400 |

Nella vista dall'alto le tacche sono nascoste: tutte le quote t si proiettano sullo
stesso piano e le sezioni si sovrapporrebbero.

## 10. Corpo che accelera: moto iperbolico (accelerated-motion)

In accelerated-motion il corpo in moto parte da fermo in x₀, accelera, frena e si
ferma in x₀ + X. I parametri non sono più la velocità ma l'accelerazione propria `a`
della coda e la distanza `X`. Tutte le grandezze del viaggio vengono da
`trip({a, X, L0, x0})`.

### Moto iperbolico e rigidità di Born

Un punto con accelerazione propria costante α traccia nel piano x–t un'iperbole di
«raggio» ρ = 1/α centrata in un evento (x_c, 0):

```
x(t) = x_c + √(ρ² + t²)        β(t) = t / √(ρ² + t²)        τ(t) = ρ · asinh(t/ρ)
```

Se tutti i punti di un corpo esteso avessero la stessa accelerazione, il corpo
resterebbe lungo L₀ nel laboratorio e quindi si allungherebbe nel proprio sistema.
Il corpo è invece rigido nel senso di Born: il punto a distanza propria ξ dalla coda
segue l'iperbole con lo stesso centro e raggio ρ_R + ξ, dove

```
ρ_R = 1/a            (coda)
ρ_F = 1/a + L₀       (testa, accelerazione propria 1/ρ_F < a)
ρ_C = 1/a + L₀/2     (punto di mezzo)
x_c = x₀ − 1/a
```

(`worldlineAtLabTime`, `speedAtLabTime`, `properTimeAtLabTime`). Le iperboli hanno
tutte lo stesso centro, quindi ogni retta per (x_c, 0) è una linea di simultaneità
per tutti i punti del corpo. Il piano «adesso» del corpo è la retta per il centro con
pendenza tanh η, dove η è la rapidità (`movingNowPlane`). Su questo piano la sezione
del tubo ha lunghezza di Minkowski esattamente L₀ (`movingSliceAtMovingTime`), senza
imporre formule di contrazione.

### Spinta e frenata

Il viaggio è simmetrico: la frenata è la spinta riflessa rispetto all'evento di mezzo
Q = (x₀ + L₀/2 + X/2, T/2). Imponendo che il punto di mezzo arrivi a metà strada si
ottiene la rapidità massima, e da questa durata e velocità massima:

```
sinh η_max = √(ρ_C X + X²/4) / ρ_C
T          = 2 ρ_C sinh η_max           (durata nel laboratorio)
β_max      = tanh η_max                 (a metà strada)
```

In frenata i ruoli si scambiano: la coda decelera con 1/ρ_F e la testa con a, perché
la riflessione porta l'iperbole di raggio ρ_R + ξ in quella di raggio ρ_F − ξ,
centrata in (2x_Q − x_c, T). Il punto ξ cambia fase all'istante
t = (ρ_R + ξ) sinh η_max, diverso per ogni punto: nel laboratorio la testa comincia a
frenare dopo la coda.

### Tempo proprio e orologi

Durante la spinta l'orologio del punto ξ segna τ = (ρ_R + ξ) η, quindi sul piano di
simultaneità del corpo la testa è avanti rispetto alla coda di un fattore ρ_F/ρ_R. In
frenata i fattori si invertono e all'arrivo i due orologi segnano lo stesso valore,
uguale per ogni punto del corpo:

```
τ_tot = (ρ_R + ρ_F) η_max = 2 ρ_C η_max
```

Il cursore τ della pagina è il tempo proprio della coda. Prima della partenza e dopo
l'arrivo i piani sono orizzontali e τ cresce come t. Le tacche (`movingTicks`) sono
le sezioni con τ intero: sempre più inclinate durante la spinta, sempre meno durante
la frenata.

Sul piano t = costante la sezione del tubo curvo (`sliceAtLabTime`) non vale L₀/γ,
perché coda e testa hanno velocità diverse nello stesso istante del laboratorio. La
tabella «Letture» mostra la lunghezza misurata accanto ai due valori L₀/γ di
confronto.

### Valori di esempio

Con a = 1, X = 3, L₀ = 1 (x₀ = −1):

| grandezza | valore |
|---|---|
| ρ_R, ρ_C, ρ_F | 1, 1,5, 2 |
| accelerazione propria della testa | 0,500 |
| durata nel laboratorio T | 5,196 |
| durata propria τ_tot | 3,951 (76 % di T) |
| velocità massima β_max | 0,866 |
| orologio di testa quando la coda segna τ = 1 | 2,000 |
| sezione su t = 2 (coda β = 0,848, testa β = 0,707) | 0,599 |

La verifica da Node è in [block-universe-simulations-guide.it.md](block-universe-simulations-guide.it.md#verifica-numerica).
