/*
 * physics.js: geometry of 2+1 spacetime (x, y, t) in natural units, c = 1.
 *
 * Pure functions with no three.js dependency, so the module can be tested in Node.
 *
 * Conventions
 *   - "lab" frame (body at rest): coordinates (x, y, t)
 *   - frame of the moving body (speed beta along x): coordinates (x1, y1, t1)
 *       x1 = gamma (x - beta t)          t1 = gamma (t - beta x)
 *       x  = gamma (x1 + beta t1)        t  = gamma (t1 + beta x1)
 *     y is invariant.
 *   - the origin event of the moving frame is (x0, 0) in the lab: the moving
 *     body occupies x1 ∈ [0, L0] in its own rest frame.
 *
 * A "tube" is a list of 8 vertices {x, y, t} in this order:
 *   0..3 bottom cap (x-, y-), (x+, y-), (x+, y+), (x-, y+)
 *   4..7 top cap, same order.
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

  /** Moving frame -> lab. x0 = lab position of the moving-frame origin at t = 0. */
  function lorentzToLab(beta, ev, x0) {
    var g = gamma(beta);
    return {
      x: (x0 || 0) + g * (ev.x1 + beta * ev.t1),
      t: g * (ev.t1 + beta * ev.x1)
    };
  }

  /** Lab -> moving frame (inverse of lorentzToLab). */
  function lorentzToMoving(beta, ev, x0) {
    var g = gamma(beta);
    var x = ev.x - (x0 || 0);
    return {
      x1: g * (x - beta * ev.t),
      t1: g * (ev.t - beta * x)
    };
  }

  function rect8(xBottom, xTop, W, tMin, tMax) {
    var h = W / 2;
    return [
      { x: xBottom[0], y: -h, t: tMin },
      { x: xBottom[1], y: -h, t: tMin },
      { x: xBottom[1], y:  h, t: tMin },
      { x: xBottom[0], y:  h, t: tMin },
      { x: xTop[0],    y: -h, t: tMax },
      { x: xTop[1],    y: -h, t: tMax },
      { x: xTop[1],    y:  h, t: tMax },
      { x: xTop[0],    y:  h, t: tMax }
    ];
  }

  /** World tube of the body at rest: vertical prism over x ∈ [xs, xs + L0]. */
  function stationaryTube(p) {
    var xs = [p.xs, p.xs + p.L0];
    return rect8(xs, xs, p.W, p.tMin, p.tMax);
  }

  /**
   * Lab position, at lab time t, of the material point whose coordinate in the
   * moving frame is x1 (constant in time). We solve t = gamma (t1 + beta x1)
   * for t1 and transform: no contraction formula is written by hand, it emerges.
   */
  function worldlineAtLabTime(beta, x1, t, x0) {
    var t1 = t / gamma(beta) - beta * x1;
    return lorentzToLab(beta, { x1: x1, t1: t1 }, x0).x;
  }

  /**
   * World tube of the moving body, cut at lab times tMin and tMax.
   * The side faces are the world lines of the ends x1 = 0 and x1 = L0.
   */
  function movingTube(p) {
    var xb = [worldlineAtLabTime(p.beta, 0, p.tMin, p.x0), worldlineAtLabTime(p.beta, p.L0, p.tMin, p.x0)];
    var xt = [worldlineAtLabTime(p.beta, 0, p.tMax, p.x0), worldlineAtLabTime(p.beta, p.L0, p.tMax, p.x0)];
    return rect8(xb, xt, p.W, p.tMin, p.tMax);
  }

  /** Section of the moving tube on the lab plane t = const. */
  function sliceAtLabTime(p) {
    var xa = worldlineAtLabTime(p.beta, 0, p.t, p.x0);
    var xb = worldlineAtLabTime(p.beta, p.L0, p.t, p.x0);
    var h = p.W / 2;
    return {
      length: xb - xa,
      corners: [
        { x: xa, y: -h, t: p.t }, { x: xb, y: -h, t: p.t },
        { x: xb, y:  h, t: p.t }, { x: xa, y:  h, t: p.t }
      ]
    };
  }

  /** Simultaneity plane of the moving body t1 = tau, written as t = slope x + intercept in the lab. */
  function movingNowPlane(p) {
    // t1 = gamma (t - beta (x - x0)) = tau  =>  t = beta (x - x0) + tau / gamma
    var g = gamma(p.beta);
    return { slope: p.beta, intercept: p.tau / g - p.beta * p.x0 };
  }

  function minkowskiLength(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dt = b.t - a.t;
    return Math.sqrt(Math.max(0, dx * dx + dy * dy - dt * dt));
  }

  function euclideanLength(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dt = b.t - a.t;
    return Math.sqrt(dx * dx + dy * dy + dt * dt);
  }

  /** Section of the vertical tube (body at rest, x ∈ [xs, xs + L0]) on the moving body's plane t1 = tau. */
  function stationarySliceAtMovingTime(p) {
    var pl = movingNowPlane(p);
    var h = p.W / 2;
    var xa = p.xs, xb = p.xs + p.L0;
    var ta = pl.slope * xa + pl.intercept, tb = pl.slope * xb + pl.intercept;
    var corners = [
      { x: xa, y: -h, t: ta }, { x: xb, y: -h, t: tb },
      { x: xb, y:  h, t: tb }, { x: xa, y:  h, t: ta }
    ];
    return {
      corners: corners,
      minkowskiLength: minkowskiLength(corners[0], corners[1]),
      euclideanLength: euclideanLength(corners[0], corners[1])
    };
  }

  /** Section of the moving tube on its own simultaneity plane t1 = tau. */
  function movingSliceAtMovingTime(p) {
    var h = p.W / 2;
    var a = lorentzToLab(p.beta, { x1: 0, t1: p.tau }, p.x0);
    var b = lorentzToLab(p.beta, { x1: p.L0, t1: p.tau }, p.x0);
    var corners = [
      { x: a.x, y: -h, t: a.t }, { x: b.x, y: -h, t: b.t },
      { x: b.x, y:  h, t: b.t }, { x: a.x, y:  h, t: a.t }
    ];
    return {
      corners: corners,
      minkowskiLength: minkowskiLength(corners[0], corners[1]),
      euclideanLength: euclideanLength(corners[0], corners[1])
    };
  }

  /**
   * Range of tau for which the rear edge (x1 = 0) of the moving body's section
   * on the plane t1 = tau stays inside the lab band [tMin, tMax]. Other parts of
   * the sections may leave the band: tubes are infinite, the drawing extends
   * them as needed.
   */
  function movingTimeRange(p) {
    var g = gamma(p.beta);
    return { min: p.tMin / g, max: p.tMax / g };
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
    lorentzToLab: lorentzToLab,
    lorentzToMoving: lorentzToMoving,
    worldlineAtLabTime: worldlineAtLabTime,
    stationaryTube: stationaryTube,
    movingTube: movingTube,
    sliceAtLabTime: sliceAtLabTime,
    movingNowPlane: movingNowPlane,
    stationarySliceAtMovingTime: stationarySliceAtMovingTime,
    movingSliceAtMovingTime: movingSliceAtMovingTime,
    movingTimeRange: movingTimeRange,
    minkowskiLength: minkowskiLength,
    euclideanLength: euclideanLength,
    lightCone: lightCone
  };
});
