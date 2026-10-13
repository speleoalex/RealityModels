# Theory: block universe, length contraction and time dilation

The geometry drawn by the relativity simulations, with the same notation as the code
in `js/physics.js`. Sections 1–8 apply to
[length-contraction](../../simulations/relativity/length-contraction/index.html) and
[time-dilation](../../simulations/relativity/time-dilation/index.html). Section 9
covers the clocks, present from time-dilation onwards. Section 10 covers the
accelerating body of [accelerated-motion](../../simulations/relativity/accelerated-motion/index.html),
which has a different `physics.js`. Usage, parameters and checks are in
[block-universe-simulations-guide.en.md](block-universe-simulations-guide.en.md); Italian version: [block-universe-relativity-theory.it.md](block-universe-relativity-theory.it.md).

## 1. Block universe in 2+1 dimensions

In the block universe, spacetime is a geometric object given once and for all: past,
present and future exist in the same way. A body does not "move", it occupies a
region of spacetime, its world tube. Motion is the tilt of the tube with respect to
the time axis.

Four dimensions cannot be drawn, so the simulator uses two space dimensions (x, y)
and one time dimension (t, vertical). Motion is along x; y gives the bodies thickness
and shows that the transverse directions do not change.

## 2. Coordinates and Lorentz transformations

Natural units with c = 1: the light cone has a 45° slope in the x–t plane.

- Frame of the body at rest ("laboratory"): coordinates (x, y, t).
- Frame of the body moving at speed β = v/c along x: coordinates (x′, y′, t′),
  written `x1`, `t1` in the code.
- γ = 1 / √(1 − β²) (function `gamma`).

Transformations (functions `lorentzToMoving` and `lorentzToLab`):

```
x′ = γ (x − β t)        t′ = γ (t − β x)
x  = γ (x′ + β t′)      t  = γ (t′ + β x′)
y′ = y
```

The origin of the moving frame is the laboratory event (x₀, 0), i.e. the parameter
`x0` of all functions.

## 3. Building the world tubes

**Body at rest** (`stationaryTube`): it occupies x ∈ [xs, xs + L₀], y ∈ [−W/2, W/2] at
every t. The tube is a vertical prism.

**Moving body** (`movingTube`): in its own rest frame it occupies
x′ ∈ [0, L₀]. The side faces are the world lines of the two ends,
x′ = 0 and x′ = L₀. The code uses no contraction formula: for each end x′ and each
laboratory instant t it solves

```
t = γ (t′ + β x′)   ⇒   t′ = t/γ − β x′
```

and transforms the event (x′, t′) into the laboratory (`worldlineAtLabTime`). The
result is a straight line of slope β in the x–t plane, so the tube is tilted by
atan(β) with respect to the t axis.

## 4. Why the t = constant section is L₀/γ long

The "now" plane of the body at rest is t = constant. Cutting the tilted tube with
this plane (`sliceAtLabTime`) gives the ends

```
x(x′=0)  = x₀ + β t
x(x′=L₀) = x₀ + β t + L₀/γ
```

The second follows by substituting t′ = t/γ − β L₀ into the transformation:
x = x₀ + γ (L₀ + β t/γ − β² L₀) = x₀ + β t + γ L₀ (1 − β²) = x₀ + β t + L₀/γ.

The section is L₀/γ long: this is length contraction. Nothing acts on the body; the
body at rest cuts the tilted tube with a plane other than the simultaneity plane of
the moving body.

## 5. Why the t′ = constant section is L₀ long

The "now" plane of the moving body is t′ = τ. In the laboratory it is the tilted
plane (`movingNowPlane`)

```
t = β (x − x₀) + τ/γ
```

Cutting the moving tube with this plane (`movingSliceAtMovingTime`), the ends are the
images of (x′=0, t′=τ) and (x′=L₀, t′=τ). Their separation
(Δx, Δt) = (γL₀, γβL₀) has Minkowski length

```
√(Δx² − Δt²) = γ L₀ √(1 − β²) = L₀
```

that is, the proper length: the body measures itself as L₀ long.

## 6. Reciprocity

The same plane t′ = τ also cuts the vertical tube of the body at rest
(`stationarySliceAtMovingTime`). The ends are (xs, t(xs)) and (xs + L₀, t(xs + L₀)),
with Δx = L₀ and Δt = β L₀, hence

```
√(L₀² − β² L₀²) = L₀/γ
```

The moving body sees the body at rest contracted by the same factor. Enable
*Also show the "now" of the moving body* to see both sections dimensioned: L₀ (proper)
on the moving tube and L₀/γ on the tube at rest.

## 7. Caveat: screen ruler and Minkowski metric

The drawing is Euclidean, spacetime is not. On the tilted planes a segment with
components (Δx, Δt) appears on screen with length √(Δx² + Δt²), but its physical
length is √(Δx² − Δt²). For segments on the t′ = constant plane the "Readings" table
gives both values (row "Same segments, Euclidean length in the drawing"). On the
t = constant plane the two measures coincide because Δt = 0.

For the same reason the tilted tube, measured with the screen ruler perpendicular to
its faces, looks "wider" than the vertical one. This is an artefact of the Euclidean
projection.

## 8. How to use the page

Example values with β = 0.6:

| quantity | value |
|---|---|
| γ | 1.25 |
| section of the body at rest on t = const | L₀ = 1.00 |
| section of the moving body on t = const | L₀/γ = 0.80 |
| tilt of the world lines | atan(0.6) = 31.0° |

With β = 0.8: γ = 1.667 and L₀/γ = 0.600.

- Side x–t view: the Minkowski diagram. The horizontal section of the tilted tube is
  shorter than that of the vertical tube.
- Top x–y view: only the two sections on the t = constant plane, with the same
  width W and lengths L₀ and L₀/γ.
- 3D view: drag to rotate, wheel to zoom, right button to pan.
- Light cone: the world lines of the moving body stay inside the cone
  (slope β < 1).

The t′ plane slider goes from 0 to t_max/γ, so it depends on β: these are the values
for which the rear edge of the moving body stays within the drawn window. The tubes
are infinite; the drawing extends them as far as needed to contain the tilted
sections.

## 9. Time dilation: clocks and ticks (time-dilation)

Time dilation is geometry, like contraction: contraction is the Minkowski length
*across* the tube, dilation the Minkowski length *along* it. The proper time of a
body between two events on its world line is

```
Δτ = √(Δt² − Δx²)
```

For the body at rest Δx = 0 and Δτ = Δt. For the moving body, between t = 0 and
t = T, Δx = βT and Δτ = T √(1 − β²) = T/γ.

### Clock ticks

Each body carries a clock synchronized in its own frame. On each tube the simulator
draws one section per unit of proper time:

- on the tube at rest (`stationaryTicks`), the horizontal planes t = 0, 1, 2, 3, 4;
- on the moving tube (`movingTicks`), the planes t′ = 0, 1, 2…, i.e. the tilted
  sections of `movingSliceAtMovingTime` with integer τ. The rear edge (x′ = 0) of
  tick t′ = n falls in the laboratory at t = γn.

For the same block height the tube at rest contains t_max ticks and the moving one
t_max/γ: with β = 0.8 and t_max = 4 that is 4 versus 2.4 (row "Proper time along the
whole block" of the table). Only ticks entirely inside the drawn tube are drawn, so
with β = 0.8 t′ = 0 and t′ = 1 are visible. The tilted tick looks longer on screen
but is worth a single unit (see section 7).

### Clock readings on the sections

On the plane t = t_now the body at rest shows t_now at both ends. The clocks of the
moving body (`movingClocksAtLabTime`) show t′ = γ (t − β (x − x₀)). Substituting the
positions of the ends of the section (section 4):

```
rear  (x′ = 0):   t′ = t_now / γ
front (x′ = L₀):  t′ = t_now / γ − β L₀
```

The rear shows the dilation (t′/t = 1/γ). The difference βL₀ between rear and front
is the relativity of simultaneity: events simultaneous for the body at rest are not
simultaneous for the moving body, so time is not the same even within a single
rectangle.

On the plane t′ = τ the opposite happens (reciprocity): the moving body shows τ at
both ends, and the clocks of the body at rest show the times t of the ends of the
section of `stationarySliceAtMovingTime`,

```
t = β (x − x₀) + τ / γ      for x = xs and x = xs + L₀
```

A clock at rest at x = x₀ would show exactly τ/γ: each body sees the other's clock
slowed by the same factor. Values with β = 0.8, L₀ = 1, t_now = 2 and τ = 1.2:

| clock | reading |
|---|---|
| body at rest on t = 2 | 2.000 |
| moving body on t = 2, rear / front | 1.200 / 0.400 |
| t′/t at the rear | 1/γ = 60 % |
| moving body on t′ = 1.2 | 1.200 |
| body at rest on t′ = 1.2, left / right (xs = −2.5, x₀ = −1) | −0.480 / 0.320 |
| proper time along the block, at rest / moving | 4.000 / 2.400 |

In the top view the ticks are hidden: all t values project onto the same plane and
the sections would overlap.

## 10. Accelerating body: hyperbolic motion (accelerated-motion)

In accelerated-motion the moving body starts at rest at x₀, accelerates, brakes and
stops at x₀ + X. The parameters are no longer the speed but the proper acceleration
`a` of the rear and the distance `X`. All trip quantities come from
`trip({a, X, L0, x0})`.

### Hyperbolic motion and Born rigidity

A point with constant proper acceleration α traces in the x–t plane a hyperbola of
"radius" ρ = 1/α centred on an event (x_c, 0):

```
x(t) = x_c + √(ρ² + t²)        β(t) = t / √(ρ² + t²)        τ(t) = ρ · asinh(t/ρ)
```

If every point of an extended body had the same acceleration, the body would stay
L₀ long in the laboratory and so stretch in its own frame. The body is instead rigid
in Born's sense: the point at proper distance ξ from the rear follows the hyperbola
with the same centre and radius ρ_R + ξ, where

```
ρ_R = 1/a            (rear)
ρ_F = 1/a + L₀       (front, proper acceleration 1/ρ_F < a)
ρ_C = 1/a + L₀/2     (midpoint)
x_c = x₀ − 1/a
```

(`worldlineAtLabTime`, `speedAtLabTime`, `properTimeAtLabTime`). All the hyperbolas
share the same centre, so every line through (x_c, 0) is a simultaneity line for all
points of the body. The "now" plane of the body is the line through the centre with
slope tanh η, where η is the rapidity (`movingNowPlane`). On this plane the section
of the tube has Minkowski length exactly L₀ (`movingSliceAtMovingTime`), with no
contraction formula imposed.

### Push and braking

The trip is symmetric: braking is the push reflected through the midpoint event
Q = (x₀ + L₀/2 + X/2, T/2). Requiring the midpoint of the body to arrive halfway
gives the maximum rapidity, and from it the duration and maximum speed:

```
sinh η_max = √(ρ_C X + X²/4) / ρ_C
T          = 2 ρ_C sinh η_max           (duration in the laboratory)
β_max      = tanh η_max                 (halfway)
```

During braking the roles swap: the rear decelerates with 1/ρ_F and the front with a,
because the reflection maps the hyperbola of radius ρ_R + ξ onto the one of radius
ρ_F − ξ, centred on (2x_Q − x_c, T). The point ξ changes phase at
t = (ρ_R + ξ) sinh η_max, which differs from point to point: in the laboratory the
front starts braking after the rear.

### Proper time and clocks

During the push the clock of point ξ shows τ = (ρ_R + ξ) η, so on the simultaneity
plane of the body the front is ahead of the rear by a factor ρ_F/ρ_R. During braking
the factors are reversed, and on arrival the two clocks show the same value, equal
for every point of the body:

```
τ_tot = (ρ_R + ρ_F) η_max = 2 ρ_C η_max
```

The page's τ slider is the proper time of the rear. Before departure and after
arrival the planes are horizontal and τ grows like t. The ticks (`movingTicks`) are
the sections with integer τ: more and more tilted during the push, less and less
during braking.

On the t = constant plane the section of the curved tube (`sliceAtLabTime`) is not
L₀/γ, because rear and front have different speeds at the same laboratory instant.
The "Readings" table shows the measured length next to the two L₀/γ values for
comparison.

### Example values

With a = 1, X = 3, L₀ = 1 (x₀ = −1):

| quantity | value |
|---|---|
| ρ_R, ρ_C, ρ_F | 1, 1.5, 2 |
| proper acceleration of the front | 0.500 |
| duration in the laboratory T | 5.196 |
| proper duration τ_tot | 3.951 (76 % of T) |
| maximum speed β_max | 0.866 |
| front clock when the rear clock shows τ = 1 | 2.000 |
| section on t = 2 (rear β = 0.848, front β = 0.707) | 0.599 |

The Node check is in [block-universe-simulations-guide.en.md](block-universe-simulations-guide.en.md#numerical-check).
