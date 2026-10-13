# Relativity: the block universe simulations

Static geometric simulations of a body moving with respect to a body at rest in
the block universe: two space dimensions (x, y) and one time dimension (t). There is
no animation: each body is a *world tube* and motion is the tilt of the tube. The
length contraction seen by the body at rest does not come from a formula: it is the
section of the tilted tube with the t = constant plane.

Theory and formulas: [block-universe-relativity-theory.en.md](block-universe-relativity-theory.en.md). Italian version of this page:
[block-universe-simulations-guide.it.md](block-universe-simulations-guide.it.md).

## The simulations

| Simulation | Content | Theory |
|---|---|---|
| [length-contraction](../../simulations/relativity/length-contraction/index.html) | Length contraction (base simulation). | sections 1–8 |
| [time-dilation](../../simulations/relativity/time-dilation/index.html) | Like length-contraction, plus time dilation: clock ticks (one section per unit of proper time on each tube) and readings of the clocks of the two bodies at the ends of the sections ("Clocks" section in the readings panel). | sections 1–9 |
| [accelerated-motion](../../simulations/relativity/accelerated-motion/index.html) | Like time-dilation, but the moving body starts at rest, accelerates with constant proper acceleration up to the halfway point, brakes and stops after a distance X (hyperbolic motion, body rigid in Born's sense). The world tube is curved and the simultaneity planes of the body change tilt from instant to instant. The rear and front clocks show different times during the push and agree again on arrival. | sections 1–10 |

## Usage

Open the simulation's `index.html` in a browser (double-click is enough: it works
without a server or network, the libraries are in the repository).

Controls in the side panel:

- speed β = v/c of the moving body (length-contraction and time-dilation) or
  proper acceleration a and trip distance X (accelerated-motion), proper
  length L₀, width W;
- "now" plane of the body at rest (t = constant) and, optionally, "now" plane of the moving
  body (t′ = constant, tilted) to see reciprocity;
- light cone from the initial event of the moving body;
- (time-dilation and accelerated-motion) clock ticks, on by default;
- views: navigable 3D, side x–t (Minkowski diagram), top x–y.

Language (Italian, English) and theme (system, light, dark) are chosen from the gear
button at the top right. The choices are saved in the browser and apply to all
simulations.

The parameters are also in the query string, so a configuration can be shared:

```
simulations/relativity/time-dilation/index.html?beta=0.8&L0=1&W=0.4&t=2&moving=1&tau=1.2&cone=1&view=side&lang=en
```

In time-dilation and accelerated-motion `ticks=0` hides the clock ticks. In
accelerated-motion `a` and `X` replace `beta`, and `tau` is the proper time
of the rear:

```
simulations/relativity/accelerated-motion/index.html?a=1&X=3&L0=1&W=0.4&t=2&moving=1&tau=1.5&cone=1&view=side
```

## Structure

Structure shared by the three simulations:

```
simulations/relativity/<simulation>/
  index.html          simulation page
  css/style.css       style, light and dark theme
  js/physics.js       spacetime geometry (pure functions, testable with Node)
  js/scene.js         drawing with three.js
  js/app.js           wiring between controls and scene
  js/i18n.js          language dictionaries
simulations/shared/
  lib/                three.js r121 and OrbitControls (local copies, shared by the three)
  js/settings.js      language and theme button and panel
  css/settings.css    style of the language and theme panel
```

## Numerical check

```
cd simulations/relativity/time-dilation && node -e 'const P=require("./js/physics.js"); console.log(P.gamma(0.6), P.sliceAtLabTime({beta:0.6,x0:0,L0:1,W:0.4,t:2}).length, P.movingClocksAtLabTime({beta:0.8,x0:0,L0:1,W:0.4,t:2}).rear)'
```

Expected output: `1.25 0.8 1.1999999999999997` (the third value is t/γ, which exists
only from time-dilation onwards).

For accelerated-motion:

```
cd simulations/relativity/accelerated-motion && node -e 'const P=require("./js/physics.js"); const tr=P.trip({a:1,X:3,L0:1,x0:-1}); console.log(tr.T.toFixed(3), tr.tauTotal.toFixed(3), tr.betaMax.toFixed(3), P.movingClocksAtMovingTime(tr,1).front)'
```

Expected output: `5.196 3.951 0.866 2`, i.e. trip duration in the laboratory,
proper duration, maximum speed and reading of the front clock when the rear clock
shows 1.
