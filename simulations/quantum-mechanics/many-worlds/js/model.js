/*
 * model.js: many-worlds lattice with convergences. Pure functions, also usable from Node.
 *
 * Every step is a measurement with N outcomes c = 0..N-1. A world is identified by
 * its record k = sum of the outcomes so far, so worlds that reach the same k at the
 * same step converge into one node: (N-1)·t + 1 nodes at step t instead of N^t.
 * The record is drawn as x = 2k - (N-1)·t, centred on zero.
 *
 * Classical regime: outcome sequences are counted and their probabilities add.
 * Quantum regime: coined quantum walk with the DFT coin (Hadamard for N = 2).
 * The measured system starts in |0>; at each step the coin acts on the N coin
 * components of every node, then component c moves to node k + c. Component c
 * of node k + c comes from node k only, so the amplitudes of the converging
 * worlds meet in different components and interfere at the next coin: the
 * evolution stays exactly unitary (total probability 1 at every step).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.Model = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EPSILON = 1e-9; // below this a probability counts as cancelled by interference

  /* mulberry32: a small seeded generator, so a seed reproduces the same disorder phases */
  function seededRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      var z = state;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* DFT coin: U[c][d] = exp(2πi·c·d / N) / √N */
  function dftCoin(n) {
    var coin = [];
    for (var c = 0; c < n; c++) {
      coin.push([]);
      for (var d = 0; d < n; d++) {
        var angle = 2 * Math.PI * c * d / n;
        coin[c].push({ re: Math.cos(angle) / Math.sqrt(n), im: Math.sin(angle) / Math.sqrt(n) });
      }
    }
    return coin;
  }

  function zeroAmplitudes(n) {
    var amplitudes = [];
    for (var c = 0; c < n; c++) amplitudes.push({ re: 0, im: 0 });
    return amplitudes;
  }

  /**
   * options: { outcomes: N >= 2, steps: T, disorder: 0..1, seed }
   * Returns lattice[t] = nodes k = 0..(N-1)·t, each with
   *   x, paths (outcome sequences reaching k), pClassical = paths / N^t,
   *   pQuantum = Σ_c |ψ(k,c)|², flowClassical[c] and flowQuantum[c] = probability
   *   leaving the node through outcome c towards node k + c of the next step.
   * disorder > 0 rotates every node by a random phase |φ| <= π·disorder before the
   * coin: still unitary, it models worlds whose amplitudes arrive with unrelated phases.
   */
  function buildLattice(options) {
    var n = options.outcomes, disorder = options.disorder || 0;
    var random = seededRandom(options.seed || 0);
    var coin = dftCoin(n);
    var lattice = [];
    var paths = [1];
    var amplitudes = [zeroAmplitudes(n)];
    amplitudes[0][0].re = 1;
    for (var t = 0; t <= options.steps; t++) {
      var total = Math.pow(n, t);
      var nextPaths = [], nextAmplitudes = [];
      for (var j = 0; j < (n - 1) * (t + 1) + 1; j++) { nextPaths.push(0); nextAmplitudes.push(zeroAmplitudes(n)); }
      var nodes = [];
      for (var k = 0; k < paths.length; k++) {
        var phase = disorder ? (2 * random() - 1) * Math.PI * disorder : 0;
        var cosPhase = Math.cos(phase), sinPhase = Math.sin(phase);
        var node = { x: 2 * k - (n - 1) * t, paths: paths[k], pClassical: paths[k] / total, pQuantum: 0, flowClassical: [], flowQuantum: [] };
        for (var c = 0; c < n; c++) {
          var a = amplitudes[k][c];
          node.pQuantum += a.re * a.re + a.im * a.im;
        }
        for (c = 0; c < n; c++) {
          var re = 0, im = 0;
          for (var d = 0; d < n; d++) {
            var rotatedRe = amplitudes[k][d].re * cosPhase - amplitudes[k][d].im * sinPhase;
            var rotatedIm = amplitudes[k][d].re * sinPhase + amplitudes[k][d].im * cosPhase;
            re += coin[c][d].re * rotatedRe - coin[c][d].im * rotatedIm;
            im += coin[c][d].re * rotatedIm + coin[c][d].im * rotatedRe;
          }
          node.flowClassical.push(node.pClassical / n);
          node.flowQuantum.push(re * re + im * im);
          nextPaths[k + c] += paths[k];
          nextAmplitudes[k + c][c].re = re;
          nextAmplitudes[k + c][c].im = im;
        }
        nodes.push(node);
      }
      lattice.push(nodes);
      paths = nextPaths;
      amplitudes = nextAmplitudes;
    }
    return lattice;
  }

  /**
   * Readings for step t: worlds of the tree N^t, distinct nodes, effective number of
   * worlds 1/Σp² and spread σ of x in both regimes, nodes and incoming branches
   * cancelled by interference (quantum probability below EPSILON).
   */
  function statistics(lattice, t) {
    var nodes = lattice[t], n = nodes[0].flowClassical.length;
    var s = { treeWorlds: Math.pow(n, t), distinct: nodes.length, suppressedNodes: 0, suppressedEdges: 0 };
    var squaresC = 0, squaresQ = 0, meanC = 0, meanQ = 0, momentC = 0, momentQ = 0;
    nodes.forEach(function (node) {
      squaresC += node.pClassical * node.pClassical;
      squaresQ += node.pQuantum * node.pQuantum;
      meanC += node.pClassical * node.x;
      meanQ += node.pQuantum * node.x;
      momentC += node.pClassical * node.x * node.x;
      momentQ += node.pQuantum * node.x * node.x;
      if (node.pQuantum < EPSILON) s.suppressedNodes++;
    });
    if (t > 0) {
      lattice[t - 1].forEach(function (node) {
        node.flowQuantum.forEach(function (flow) { if (flow < EPSILON) s.suppressedEdges++; });
      });
    }
    s.effectiveClassical = 1 / squaresC;
    s.effectiveQuantum = 1 / squaresQ;
    s.sigmaClassical = Math.sqrt(Math.max(0, momentC - meanC * meanC));
    s.sigmaQuantum = Math.sqrt(Math.max(0, momentQ - meanQ * meanQ));
    return s;
  }

  return { EPSILON: EPSILON, buildLattice: buildLattice, statistics: statistics };
});
