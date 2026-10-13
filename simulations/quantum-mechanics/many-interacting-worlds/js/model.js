/*
 * model.js: many interacting worlds (Hall, Deckert, Wiseman, PRX 4 041013, 2014)
 * in one dimension. Pure functions, also usable from Node. Units: hbar = m = 1.
 *
 * N worlds with definite positions x[0] < ... < x[N-1] and velocities v[n] follow
 * Newton's equations in the external potential V(x) = omega^2 x^2 / 2 (omega = 0
 * for a free particle) plus an inter-world repulsion. With gaps g[n] = x[n+1] - x[n],
 * inverse gaps s[n] = 1/g[n] (s[-1] = s[N-1] = 0) and D[n] = s[n] - s[n-1]:
 *
 *   U = (1/8) * sum_n D[n]^2
 *
 * U is the discrete form of Bohm's quantum potential; its exact gradient only
 * involves nearest gaps, so forces cost O(N):
 *
 *   dU/dx[m] = (1/4) * (D[m]*(s[m]^2 + s[m-1]^2) - D[m+1]*s[m]^2 - D[m-1]*s[m-1]^2)
 *
 * with out-of-range D treated as zero. Exact results used as checks:
 *   stationary state of the oscillator: D[n] = -2*omega*x[n], hence the shooting
 *   recurrence s[n] = s[n-1] - 2*omega*x[n] used by groundState;
 *   sum rule sum_n x[n]^2 = (N-1)/(2*omega);
 *   total energy (N-1)*omega/2, so one world (N = 1) is purely classical;
 *   uncertainty product dx*dp = (1 - 1/N)/2, with dp^2 = Var(v) + 2U/N;
 *   free spreading from the relaxed configuration: x[n](t) = x[n](0)*sqrt(1+omega^2 t^2).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.Model = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SAFETY = 0.05;      // substep: dt <= SAFETY * (smallest gap)^2, from a ~ 1/g^3
  var MAX_RETRY = 24;     // halvings of a substep that made worlds cross

  /* Inter-world potential U and its exact gradient. */
  function interaction(x) {
    var n = x.length, m;
    var s = new Array(n + 1);           // s[m+1] holds 1/(x[m+1]-x[m]); s[0] = s[n] = 0
    s[0] = 0;
    s[n] = 0;
    for (m = 0; m < n - 1; m++) s[m + 1] = 1 / (x[m + 1] - x[m]);
    var d = new Array(n + 2);           // d[m+1] = D[m]; zero outside the range
    d[0] = 0;
    d[n + 1] = 0;
    var u = 0;
    for (m = 0; m < n; m++) {
      d[m + 1] = s[m + 1] - s[m];
      u += d[m + 1] * d[m + 1];
    }
    var grad = new Array(n);
    for (m = 0; m < n; m++) {
      grad[m] = 0.25 * (d[m + 1] * (s[m + 1] * s[m + 1] + s[m] * s[m]) -
        d[m + 2] * s[m + 1] * s[m + 1] - d[m] * s[m] * s[m]);
    }
    return { u: u / 8, grad: grad };
  }

  /* Total acceleration (m = 1): external force minus the gradient of U. */
  function acceleration(x, omega) {
    var iw = interaction(x);
    var a = iw.grad;
    for (var m = 0; m < x.length; m++) a[m] = -a[m] - omega * omega * x[m];
    return a;
  }

  function minGap(x) {
    var g = Infinity;
    for (var m = 0; m < x.length - 1; m++) if (x[m + 1] - x[m] < g) g = x[m + 1] - x[m];
    return g;
  }

  /**
   * Stationary configuration of the oscillator, exact at every N: shooting on the
   * leftmost world with the recurrence s[n] = s[n-1] - 2*omega*x[n], closed by
   * s[N-1] = 0. Returns the N positions, symmetric around zero.
   */
  function groundState(n, omega) {
    if (n === 1) return [0];

    function propagate(x0) {
      var x = [x0], s = -2 * omega * x0;
      for (var m = 1; m < n; m++) {
        if (s <= 0) return null;        // worlds crossed: x0 not far enough out
        x.push(x[m - 1] + 1 / s);
        s -= 2 * omega * x[m];
      }
      x.closure = s;                    // must vanish (it is s[N-1])
      return x;
    }

    var lo = -3 * Math.sqrt(n / (2 * omega)) - 1, hi = -1e-12;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2;
      var trial = propagate(mid);
      if (trial === null || trial.closure < 0) hi = mid; else lo = mid;
    }
    var x = propagate(lo);
    var mean = 0, m;
    for (m = 0; m < n; m++) mean += x[m] / n;
    for (m = 0; m < n; m++) x[m] -= mean;
    return x;
  }

  /** A state: positions, velocities, trap frequency (0 = free), elapsed time. */
  function createState(x, v, omega) {
    return { x: x.slice(), v: v ? v.slice() : x.map(function () { return 0; }), omega: omega, t: 0 };
  }

  /**
   * Advances the state by dt with velocity Verlet and adaptive substeps
   * (dt_sub <= SAFETY * g_min^2, the repulsion stiffens as 1/g^3). A substep that
   * makes worlds cross is halved and retried. maxSubsteps bounds the work per call;
   * returns the number of substeps taken and whether dt was fully covered.
   */
  function step(state, dt, maxSubsteps) {
    var x = state.x, v = state.v, n = x.length;
    var remaining = dt, taken = 0;
    var a = acceleration(x, state.omega);
    while (remaining > 1e-12 && taken < maxSubsteps) {
      var h = Math.min(remaining, n > 1 ? SAFETY * Math.pow(minGap(x), 2) : remaining);
      for (var retry = 0; retry <= MAX_RETRY; retry++) {
        var xNew = new Array(n), m, ordered = true;
        for (m = 0; m < n; m++) xNew[m] = x[m] + h * v[m] + 0.5 * h * h * a[m];
        for (m = 0; m < n - 1; m++) if (xNew[m + 1] <= xNew[m]) { ordered = false; break; }
        if (ordered) {
          var aNew = acceleration(xNew, state.omega);
          for (m = 0; m < n; m++) {
            x[m] = xNew[m];
            v[m] += 0.5 * h * (a[m] + aNew[m]);
          }
          a = aNew;
          break;
        }
        h /= 2;
        if (retry === MAX_RETRY) return { substeps: taken, done: false };
      }
      state.t += h;
      remaining -= h;
      taken++;
    }
    return { substeps: taken, done: remaining <= 1e-12 };
  }

  /**
   * Ensemble readings. dp includes the osmotic term 2U/N next to the spread of the
   * velocities: it is the inter-world energy that stores the quantum part of the
   * momentum spread (exactly (1 - 1/N)/2 for dx*dp in the stationary oscillator).
   */
  function statistics(state) {
    var x = state.x, v = state.v, n = x.length;
    var meanX = 0, meanV = 0, varX = 0, varV = 0, kinetic = 0, external = 0, m;
    for (m = 0; m < n; m++) { meanX += x[m] / n; meanV += v[m] / n; }
    for (m = 0; m < n; m++) {
      varX += (x[m] - meanX) * (x[m] - meanX) / n;
      varV += (v[m] - meanV) * (v[m] - meanV) / n;
      kinetic += 0.5 * v[m] * v[m];
      external += 0.5 * state.omega * state.omega * x[m] * x[m];
    }
    var u = n > 1 ? interaction(x).u : 0;
    var dx = Math.sqrt(varX);
    var dp = Math.sqrt(varV + 2 * u / n);
    return {
      mean: meanX, dx: dx, dp: dp, product: dx * dp,
      u: u, energy: kinetic + external + u, meanV: meanV
    };
  }

  /**
   * Measurement with resolution delta: the chosen world (uniform among the N, which
   * is the Born rule for equally weighted worlds) fixes the recorded value; the
   * worlds within delta/2 of it are the sub-ensemble compatible with the record.
   * Returns indices only; condition() builds the post-measurement state.
   */
  function measure(state, delta, random) {
    var x = state.x, n = x.length;
    var chosen = Math.min(n - 1, Math.floor((random || Math.random)() * n));
    var first = chosen, last = chosen;
    while (first > 0 && x[chosen] - x[first - 1] <= delta / 2) first--;
    while (last < n - 1 && x[last + 1] - x[chosen] <= delta / 2) last++;
    return { chosen: chosen, first: first, last: last };
  }

  /** Keeps the worlds first..last (inclusive): the conditioned ensemble. */
  function condition(state, first, last) {
    var kept = createState(state.x.slice(first, last + 1), state.v.slice(first, last + 1), state.omega);
    kept.t = state.t;
    return kept;
  }

  return {
    interaction: interaction,
    acceleration: acceleration,
    groundState: groundState,
    createState: createState,
    step: step,
    statistics: statistics,
    measure: measure,
    condition: condition,
    minGap: minGap
  };
});
