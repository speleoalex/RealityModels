/*
 * model.js: census of the n-state 2-symbol Turing machines in the busy beaver
 * formalism. Pure functions, no DOM, also usable from Node.
 *
 * A machine has one instruction per (state, symbol) pair: write 0 or 1, move
 * left or right, then go to one of the n states or halt. The halting instruction
 * still writes and moves, as in Rado's formalism, so each pair has 4(n+1)
 * choices and there are (4(n+1))^(2n) machines. Every machine starts in state 0
 * on a tape of zeros; the output of a halting machine is the segment of cells it
 * scanned. The number of machines per output approximates the algorithmic
 * probability of the string: simple strings come from many more machines.
 *
 * The step cap is the busy beaver record S(n): a machine still running after
 * S(n) steps on the blank tape never halts, so for n = 2 and 3 the full
 * enumeration is exact. For n = 4 there are 2.56e10 machines, too many to
 * enumerate, and the census draws a seeded random sample, capped at S(4) = 107.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.Model = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* Known S(n): Rado 1962, Lin and Rado 1965, Brady 1983 (see the theory doc) */
  var STEP_CAP = { 2: 6, 3: 21, 4: 107 };

  /* mulberry32: a small seeded generator, so a sample is reproducible */
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

  function machineCount(states) { return Math.pow(4 * (states + 1), 2 * states); }

  function stepCap(states) { return STEP_CAP[states]; }

  /*
   * An instruction is a digit d in 0..4(n+1)-1: d & 1 = written symbol,
   * (d >> 1) & 1 = move (1 right, 0 left), d >> 2 = next state, n meaning halt.
   * Full mode walks the machine space with an odometer over the 2n digits;
   * sample mode draws the digits at random.
   */
  function create(options) {
    var n = options.states;
    var cap = STEP_CAP[n];
    var opts = 4 * (n + 1);
    var census = {
      states: n,
      mode: n > 3 ? 'sample' : 'full',
      cap: cap,
      total: machineCount(n),
      seed: options.seed || 0,
      done: 0,
      halting: 0,
      maxUsed: 0,
      counts: {},
      opts: opts,
      slots: 2 * n,
      write: new Int8Array(opts),
      move: new Int8Array(opts),
      next: new Int8Array(opts),
      dig: new Int32Array(2 * n),
      offset: cap + 1,
      tape: new Int8Array(2 * cap + 3),
      touched: new Int32Array(cap + 1),
      random: seededRandom(options.seed || 0)
    };
    census.target = census.mode === 'full' ? census.total : (options.samples || 1000000);
    for (var d = 0; d < opts; d++) {
      census.write[d] = d & 1;
      census.move[d] = ((d >> 1) & 1) ? 1 : -1;
      census.next[d] = d >> 2;
    }
    return census;
  }

  /*
   * Runs up to `budget` machines and tallies the halting outputs; returns true
   * once the census has reached its target. The scanned segment is tracked when
   * a cell is read, before the move, so a machine that halts at its first
   * instruction outputs a single cell.
   */
  function run(census, budget) {
    var n = census.states, cap = census.cap, opts = census.opts, slots = census.slots;
    var write = census.write, move = census.move, next = census.next;
    var tape = census.tape, touched = census.touched, dig = census.dig;
    var offset = census.offset, sample = census.mode === 'sample';
    if (budget > census.target - census.done) budget = census.target - census.done;
    for (var m = 0; m < budget; m++) {
      if (sample) for (var r = 0; r < slots; r++) dig[r] = (census.random() * opts) | 0;
      var state = 0, pos = offset, minPos = offset, maxPos = offset, k = 0, used = 0;
      for (var step = 0; step < cap; step++) {
        if (pos < minPos) minPos = pos; else if (pos > maxPos) maxPos = pos;
        var d = dig[(state << 1) | tape[pos]];
        tape[pos] = write[d];
        touched[k++] = pos;
        pos += move[d];
        state = next[d];
        if (state === n) { used = step + 1; break; }
      }
      if (used > 0) {
        census.halting++;
        if (used > census.maxUsed) census.maxUsed = used;
        var s = '';
        for (var p = minPos; p <= maxPos; p++) s += tape[p];
        census.counts[s] = (census.counts[s] || 0) + 1;
      }
      for (var i = 0; i < k; i++) tape[touched[i]] = 0;
      if (!sample) for (var j = 0; j < slots; j++) { if (++dig[j] < opts) break; dig[j] = 0; }
    }
    census.done += budget;
    return census.done >= census.target;
  }

  /*
   * Outputs sorted by frequency (ties: shorter first, then lexicographic, so
   * the order is the same on every engine) and halting mass per output length.
   */
  function summary(census) {
    var counts = census.counts;
    var entries = Object.keys(counts).map(function (s) {
      return { output: s, machines: counts[s] };
    });
    entries.sort(function (a, b) {
      return b.machines - a.machines || a.output.length - b.output.length ||
        (a.output < b.output ? -1 : 1);
    });
    var byLength = [];
    entries.forEach(function (e) {
      byLength[e.output.length] = (byLength[e.output.length] || 0) + e.machines;
    });
    return { entries: entries, byLength: byLength };
  }

  return {
    create: create,
    run: run,
    summary: summary,
    machineCount: machineCount,
    stepCap: stepCap
  };
});
