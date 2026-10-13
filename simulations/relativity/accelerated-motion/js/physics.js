/*
 * physics.js: geometry of 2+1 spacetime (x, y, t) in natural units, c = 1,
 * for a body that starts at rest, accelerates, brakes and stops X farther on.
 *
 * Pure functions with no three.js dependency, so the module can be tested in Node.
 *
 * The moving body is Born rigid. During the push phase every material point
 * at proper distance xi from the rear follows the hyperbola
 *     (x - xc)^2 - t^2 = rho^2,   rho = 1/a + xi,   xc = x0 - 1/a
 * with proper acceleration 1/rho: the rear (xi = 0) has proper acceleration a,
 * the front (xi = L0) has a / (1 + a L0). All the simultaneity lines of the body
 * pass through the centre (xc, 0), and on each of them the body is exactly L0
 * long. The braking phase is the point reflection of the push phase through
 * the event Q where the centre of the body is halfway: the rear hyperbola turns
 * into the front one and vice versa, so the front brakes with proper
 * deceleration a. Before t = 0 and after the arrival at t = T the body is at rest.
 *
 * Lab frame (body at rest): coordinates (x, y, t). The "own time" tau of the
 * moving body is the proper time of its rear clock; the other clocks of the body
 * run at different rates while it pushes or brakes.
 *
 * A "ring" is a list of 4 events {x, y, t} in cyclic order: (rear, y-), (front, y-),
 * (front, y+), (rear, y+). A tube is a list of rings from bottom to top.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.Physics = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function gamma(beta) {
    if (Math.abs(beta) >= 1) throw new RangeError('|beta| must be < 1');
    return 1 / Math.sqrt(1 - beta * beta);
  }

  /**
   * Constants of the trip: p = { a, X, L0, x0 } with a > 0 the proper
   * acceleration of the rear and X the displacement of the body.
   */
  function trip(p) {
    var rhoR = 1 / p.a, rhoF = rhoR + p.L0, rhoC = rhoR + p.L0 / 2;
    // the centre of the body reaches x0 + L0/2 + X/2 at the event Q = (xq, T/2)
    var sinhEta = Math.sqrt(rhoC * p.X + p.X * p.X / 4) / rhoC;
    var eta = Math.asinh(sinhEta);
    var xq = p.x0 + p.L0 / 2 + p.X / 2;
    return {
      a: p.a, X: p.X, L0: p.L0, x0: p.x0,
      rhoR: rhoR, rhoF: rhoF, rhoC: rhoC,
      xc: p.x0 - rhoR,                  // centre of the push hyperbolae, at t = 0
      xc2: 2 * xq - (p.x0 - rhoR),      // centre of the braking hyperbolae, at t = T
      eta: eta,                         // rapidity at Q (maximum)
      betaMax: Math.tanh(eta),
      T: 2 * rhoC * sinhEta,            // lab duration of the trip
      tauTotal: 2 * rhoC * eta,         // proper duration, the same for every point of the body
      aFront: 1 / rhoF                  // proper acceleration of the front during the push
    };
  }

  /** Lab position, at lab time t, of the material point at proper distance xi from the rear. */
  function worldlineAtLabTime(tr, xi, t) {
    var rho = tr.rhoR + xi, rho2 = tr.rhoF - xi, s = tr.T - t;
    if (t <= 0) return tr.x0 + xi;
    if (t >= tr.T) return tr.x0 + tr.X + xi;
    if (t <= rho * Math.sinh(tr.eta)) return tr.xc + Math.sqrt(rho * rho + t * t);
    return tr.xc2 - Math.sqrt(rho2 * rho2 + s * s);
  }

  /** Speed beta of the material point xi at lab time t. */
  function speedAtLabTime(tr, xi, t) {
    var rho = tr.rhoR + xi, rho2 = tr.rhoF - xi, s = tr.T - t;
    if (t <= 0 || t >= tr.T) return 0;
    if (t <= rho * Math.sinh(tr.eta)) return t / Math.sqrt(rho * rho + t * t);
    return s / Math.sqrt(rho2 * rho2 + s * s);
  }

  /** Reading of the clock carried by the material point xi at lab time t (zero at departure). */
  function properTimeAtLabTime(tr, xi, t) {
    var rho = tr.rhoR + xi, rho2 = tr.rhoF - xi;
    if (t <= 0) return t;
    if (t >= tr.T) return tr.tauTotal + t - tr.T;
    if (t <= rho * Math.sinh(tr.eta)) return rho * Math.asinh(t / rho);
    return rho * tr.eta + rho2 * (tr.eta - Math.asinh((tr.T - t) / rho2));
  }

  /** Phase of the rear clock at its proper time tau and rapidity of the body on that simultaneity line. */
  function stateAtMovingTime(tr, tau) {
    var tauSwitch = tr.rhoR * tr.eta;
    if (tau <= 0) return { phase: 'before', eta: 0 };
    if (tau >= tr.tauTotal) return { phase: 'after', eta: 0 };
    if (tau <= tauSwitch) return { phase: 'push', eta: tau / tr.rhoR };
    return { phase: 'brake', eta: tr.eta - (tau - tauSwitch) / tr.rhoF };
  }

  /** Event of the material point xi on the simultaneity line of the body at rear proper time tau. */
  function movingEventAtMovingTime(tr, xi, tau) {
    var s = stateAtMovingTime(tr, tau);
    switch (s.phase) {
      case 'before': return { x: tr.x0 + xi, t: tau };
      case 'after': return { x: tr.x0 + tr.X + xi, t: tr.T + tau - tr.tauTotal };
      case 'push': return { x: tr.xc + (tr.rhoR + xi) * Math.cosh(s.eta), t: (tr.rhoR + xi) * Math.sinh(s.eta) };
      default: return { x: tr.xc2 - (tr.rhoF - xi) * Math.cosh(s.eta), t: tr.T - (tr.rhoF - xi) * Math.sinh(s.eta) };
    }
  }

  /**
   * Simultaneity plane of the moving body at rear proper time tau, as the line
   * t = t0 + slope (x - x0) through the rear event. While pushing or braking it
   * also passes through the centre of the hyperbolae; at rest it is horizontal.
   */
  function movingNowPlane(tr, tau) {
    var e = movingEventAtMovingTime(tr, 0, tau);
    return { x: e.x, t: e.t, slope: Math.tanh(stateAtMovingTime(tr, tau).eta) };
  }

  function planeTime(pl, x) {
    return pl.t + pl.slope * (x - pl.x);
  }

  function minkowskiLength(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dt = b.t - a.t;
    return Math.sqrt(Math.max(0, dx * dx + dy * dy - dt * dt));
  }

  function euclideanLength(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dt = b.t - a.t;
    return Math.sqrt(dx * dx + dy * dy + dt * dt);
  }

  /** Ring of width W between the rear event a and the front event b. */
  function ring(a, b, W) {
    var h = W / 2;
    return [
      { x: a.x, y: -h, t: a.t }, { x: b.x, y: -h, t: b.t },
      { x: b.x, y:  h, t: b.t }, { x: a.x, y:  h, t: a.t }
    ];
  }

  function measured(corners) {
    return {
      corners: corners,
      minkowskiLength: minkowskiLength(corners[0], corners[1]),
      euclideanLength: euclideanLength(corners[0], corners[1])
    };
  }

  /** World tube of the body at rest: vertical prism over x ∈ [xs, xs + L0]. */
  function stationaryTube(p) {
    var lo = { x: p.xs, t: p.tMin }, hi = { x: p.xs, t: p.tMax };
    return [ring(lo, { x: p.xs + p.L0, t: p.tMin }, p.W), ring(hi, { x: p.xs + p.L0, t: p.tMax }, p.W)];
  }

  /**
   * World tube of the moving body between lab times tMin and tMax, sampled on
   * `samples` times plus the exact ends of every phase. The side faces are the
   * world lines of the ends xi = 0 and xi = L0.
   */
  function movingTube(tr, W, tMin, tMax, samples) {
    var n = samples || 48, sh = Math.sinh(tr.eta), i;
    var ts = [tMin, tMax, 0, tr.T, tr.rhoR * sh, tr.rhoF * sh];
    for (i = 1; i < n; i++) ts.push(tr.T * i / n);
    ts = ts.filter(function (t) { return t >= tMin && t <= tMax; }).sort(function (a, b) { return a - b; });
    ts = ts.filter(function (t, k) { return k === 0 || t - ts[k - 1] > 1e-9; });
    return ts.map(function (t) {
      return ring({ x: worldlineAtLabTime(tr, 0, t), t: t }, { x: worldlineAtLabTime(tr, tr.L0, t), t: t }, W);
    });
  }

  /** Section of the moving tube on the lab plane t = const. */
  function sliceAtLabTime(tr, t, W) {
    var xa = worldlineAtLabTime(tr, 0, t), xb = worldlineAtLabTime(tr, tr.L0, t);
    return { length: xb - xa, corners: ring({ x: xa, t: t }, { x: xb, t: t }, W) };
  }

  /** Section of the moving tube on its own simultaneity plane at rear proper time tau: always L0 long. */
  function movingSliceAtMovingTime(tr, tau, W) {
    return measured(ring(movingEventAtMovingTime(tr, 0, tau), movingEventAtMovingTime(tr, tr.L0, tau), W));
  }

  /** Section of the vertical tube (body at rest, x ∈ [xs, xs + L0s]) on the moving body's plane. */
  function stationarySliceAtMovingTime(tr, tau, xs, L0s, W) {
    var pl = movingNowPlane(tr, tau);
    return measured(ring({ x: xs, t: planeTime(pl, xs) }, { x: xs + L0s, t: planeTime(pl, xs + L0s) }, W));
  }

  /** Range of the rear proper time while the rear stays inside the lab band [tMin, tMax]. */
  function movingTimeRange(tr, tMin, tMax) {
    return { min: properTimeAtLabTime(tr, 0, tMin), max: properTimeAtLabTime(tr, 0, tMax) };
  }

  /** Clock ticks of the body at rest: its sections on the planes t = n, integer n in [tMin, tMax]. */
  function stationaryTicks(p) {
    var ticks = [], n;
    for (n = Math.ceil(p.tMin); n <= p.tMax + 1e-9; n++) {
      ticks.push({ tau: n, corners: ring({ x: p.xs, t: n }, { x: p.xs + p.L0, t: n }, p.W) });
    }
    return ticks;
  }

  /**
   * Clock ticks of the moving body: its sections on its own simultaneity planes
   * at rear proper time tau = n (integer n). Only the ticks lying entirely
   * inside the drawn band [tMin, tMax] are returned.
   */
  function movingTicks(tr, W, tMin, tMax) {
    var r = movingTimeRange(tr, tMin, tMax), ticks = [], n, c;
    for (n = Math.ceil(r.min); n <= r.max + 1e-9; n++) {
      c = movingSliceAtMovingTime(tr, n, W).corners;
      if (c[0].t >= tMin - 1e-9 && c[1].t <= tMax + 1e-9) ticks.push({ tau: n, corners: c });
    }
    return ticks;
  }

  /** Readings of the rear and front clocks of the moving body on the lab plane t. */
  function movingClocksAtLabTime(tr, t) {
    return { rear: properTimeAtLabTime(tr, 0, t), front: properTimeAtLabTime(tr, tr.L0, t) };
  }

  /** Readings of the rear and front clocks on the body's own plane at rear proper time tau. */
  function movingClocksAtMovingTime(tr, tau) {
    return { rear: tau, front: properTimeAtLabTime(tr, tr.L0, movingEventAtMovingTime(tr, tr.L0, tau).t) };
  }

  /** Generators of the future light cone with vertex at `apex`, up to t = tMax. */
  function lightCone(apex, tMax) {
    var d = tMax - apex.t;
    if (d <= 0) return [];
    var top = apex.t + d;
    return [
      [apex, { x: apex.x + d, y: apex.y, t: top }],
      [apex, { x: apex.x - d, y: apex.y, t: top }],
      [apex, { x: apex.x, y: apex.y + d, t: top }],
      [apex, { x: apex.x, y: apex.y - d, t: top }]
    ];
  }

  return {
    gamma: gamma,
    trip: trip,
    worldlineAtLabTime: worldlineAtLabTime,
    speedAtLabTime: speedAtLabTime,
    properTimeAtLabTime: properTimeAtLabTime,
    movingEventAtMovingTime: movingEventAtMovingTime,
    movingNowPlane: movingNowPlane,
    planeTime: planeTime,
    stationaryTube: stationaryTube,
    movingTube: movingTube,
    sliceAtLabTime: sliceAtLabTime,
    movingSliceAtMovingTime: movingSliceAtMovingTime,
    stationarySliceAtMovingTime: stationarySliceAtMovingTime,
    movingTimeRange: movingTimeRange,
    stationaryTicks: stationaryTicks,
    movingTicks: movingTicks,
    movingClocksAtLabTime: movingClocksAtLabTime,
    movingClocksAtMovingTime: movingClocksAtMovingTime,
    minkowskiLength: minkowskiLength,
    euclideanLength: euclideanLength,
    lightCone: lightCone
  };
});
