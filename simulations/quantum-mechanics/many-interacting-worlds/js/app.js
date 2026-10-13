/*
 * app.js: wires the controls to the model and the renderer. The simulation keeps a
 * list of decoupled ensembles ("parts"): one at the start, more after a measurement
 * splits the worlds into bins. World indices are global and never reorder, because
 * worlds cannot cross. Language and theme come from the shared overlay; the state
 * is mirrored in the query string so a configuration can be linked.
 */
(function () {
  'use strict';

  var LIMITS = { worlds: [1, 80], omega: [0.2, 3], speed: [0.5, 6], delta: [0.1, 2] };
  var SCENARIOS = ['ground', 'free', 'collision', 'measure'];
  var NOTE_KEYS = { ground: 'noteGround', free: 'noteFree', collision: 'noteCollision', measure: 'noteMeasure' };
  var SUBSTEP_BUDGET = 6000;  // substeps per frame, shared by the parts
  var HISTORY_MAX = 900;      // snapshots kept for the world lines
  var MAX_FRAME_DT = 0.035;   // simulated time units per frame, 1 unit per real second

  var els = {};
  ['worlds', 'worldsNum', 'omega', 'omegaNum', 'speed', 'speedNum', 'delta', 'deltaNum',
    'speedGroup', 'deltaGroup', 'scenarioNote', 'play', 'restart', 'measureBtn', 'measureNote',
    'rWorlds', 'rDx', 'rDp', 'rProduct', 'rBound', 'rEnergy', 'rEnergyExp', 'rSpread',
    'rowEnergyExp', 'rowSpread', 'graph', 'tooltip'
  ].forEach(function (id) { els[id] = document.getElementById(id); });

  var graph = new MiwGraph(els.graph, els.tooltip);
  var scenario = 'ground';
  var parts = [], keptIndex = 0, totalWorlds = 0;
  var discardedAt = [], chosen = -1, measureTimes = [], lastMeasure = null;
  var trail = [], dx0 = 1;
  var playing = true, lastNow = null;

  function clamp(value, limits, fallback) {
    var v = parseFloat(value);
    return isNaN(v) ? fallback : Math.min(limits[1], Math.max(limits[0], v));
  }
  function setPair(range, num, value) { range.value = value; num.value = value; }

  function keptCount() {
    var k = 0;
    for (var j = 0; j < totalWorlds; j++) if (discardedAt[j] === Infinity) k++;
    return k;
  }

  function pushSnapshot() {
    var x = new Array(totalWorlds);
    parts.forEach(function (p) {
      for (var m = 0; m < p.state.x.length; m++) x[p.first + m] = p.state.x[m];
    });
    trail.push({ t: parts[keptIndex].state.t, x: x });
    if (trail.length > HISTORY_MAX) trail.shift();
  }

  function currentVelocities() {
    var v = new Array(totalWorlds);
    parts.forEach(function (p) {
      for (var m = 0; m < p.state.v.length; m++) v[p.first + m] = p.state.v[m];
    });
    return v;
  }

  function overlay() {
    var w = +els.omega.value, t = parts[keptIndex].state.t;
    if (scenario === 'ground' || (scenario === 'measure' && !measureTimes.length)) {
      return { mean: 0, sigma: Math.sqrt(1 / (2 * w)) };
    }
    if (scenario === 'free') return { mean: 0, sigma: Math.sqrt((1 + w * w * t * t) / (2 * w)) };
    return null;
  }

  function build() {
    var n = +els.worlds.value, w = +els.omega.value, v0 = +els.speed.value;
    chosen = -1;
    measureTimes = [];
    lastMeasure = null;
    els.measureNote.textContent = '';
    if (scenario === 'collision') {
      var half = Model.groundState(Math.max(1, Math.round(n / 2)), w);
      var sq = 0;
      half.forEach(function (p) { sq += p * p / half.length; });
      var offset = Math.max(2, 4 * Math.sqrt(sq));
      var x = half.map(function (p) { return p - offset; }).concat(half.map(function (p) { return p + offset; }));
      var v = half.map(function () { return v0; }).concat(half.map(function () { return -v0; }));
      parts = [{ state: Model.createState(x, v, 0), first: 0 }];
    } else {
      parts = [{ state: Model.createState(Model.groundState(n, w), null, scenario === 'free' ? 0 : w), first: 0 }];
    }
    keptIndex = 0;
    totalWorlds = parts[0].state.x.length;
    discardedAt = new Array(totalWorlds);
    for (var j = 0; j < totalWorlds; j++) discardedAt[j] = Infinity;
    trail = [];
    dx0 = Model.statistics(parts[0].state).dx || 1;
    pushSnapshot();
    refresh(true);
  }

  function refresh(reset) {
    var kept = parts[keptIndex].state, t = kept.t, w = +els.omega.value;
    var s = Model.statistics(kept), k = kept.x.length;
    els.rWorlds.textContent = k + ' / ' + totalWorlds;
    els.rDx.textContent = s.dx.toFixed(3);
    els.rDp.textContent = s.dp.toFixed(3);
    els.rProduct.textContent = s.product.toFixed(3);
    els.rBound.textContent = ((1 - 1 / k) / 2).toFixed(3);
    els.rEnergy.textContent = s.energy.toFixed(3);
    els.rowEnergyExp.hidden = !(scenario === 'ground' || (scenario === 'measure' && !measureTimes.length));
    if (!els.rowEnergyExp.hidden) els.rEnergyExp.textContent = ((k - 1) * w / 2).toFixed(3);
    els.rowSpread.hidden = scenario !== 'free';
    if (!els.rowSpread.hidden) {
      els.rSpread.textContent = (s.dx / dx0).toFixed(3) + ' / ' + Math.sqrt(1 + w * w * t * t).toFixed(3);
    }
    graph.update({
      history: trail, v: currentVelocities(), discardedAt: discardedAt, chosen: chosen,
      measureTimes: measureTimes, overlay: overlay(), reset: reset, text: I18n.t
    });
    updateUrl();
  }

  function tick(dt) {
    var budget = Math.max(200, Math.floor(SUBSTEP_BUDGET / parts.length));
    parts.forEach(function (p) { Model.step(p.state, dt, budget); });
    pushSnapshot();
    refresh(false);
  }

  function frame(now) {
    if (playing && lastNow !== null) {
      var dt = Math.min(MAX_FRAME_DT, (now - lastNow) / 1000);
      if (dt > 0) tick(dt);
    }
    lastNow = now;
    requestAnimationFrame(frame);
  }

  /* Splits the kept part at a measurement: the bin of the drawn world stays coupled,
     the rest is cut into bins no wider than delta, each one an independent ensemble. */
  function doMeasure() {
    var part = parts[keptIndex], xs = part.state.x, n = xs.length;
    if (n < 2) return;
    var delta = +els.delta.value, t = part.state.t;
    var r = Model.measure(part.state, delta, Math.random);

    function cut(lo, hi) {
      var out = [], a = lo;
      for (var m = lo + 1; m <= hi; m++) {
        if (xs[m] - xs[a] > delta) { out.push([a, m - 1]); a = m; }
      }
      if (a <= hi) out.push([a, hi]);
      return out;
    }

    var ranges = cut(0, r.first - 1).concat([[r.first, r.last]], cut(r.last + 1, n - 1));
    var binParts = [], newKept = -1;
    ranges.forEach(function (range) {
      var p = { state: Model.condition(part.state, range[0], range[1]), first: part.first + range[0] };
      if (range[0] === r.first) newKept = binParts.length;
      binParts.push(p);
      if (range[0] !== r.first) {
        for (var j = part.first + range[0]; j <= part.first + range[1]; j++) discardedAt[j] = t;
      }
    });
    parts = parts.slice(0, keptIndex).concat(binParts, parts.slice(keptIndex + 1));
    keptIndex += newKept;
    chosen = part.first + r.chosen;
    measureTimes.push(t);
    lastMeasure = { i: chosen + 1, n: totalWorlds, k: r.last - r.first + 1 };
    els.measureNote.textContent = I18n.t('msgMeasured', lastMeasure);
    refresh(false);
  }

  function setScenario(value) {
    scenario = value;
    document.querySelectorAll('[data-scenario]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.scenario === scenario);
      b.setAttribute('aria-pressed', b.dataset.scenario === scenario);
    });
    els.scenarioNote.innerHTML = I18n.t(NOTE_KEYS[scenario]);
    els.speedGroup.hidden = scenario !== 'collision';
    els.deltaGroup.hidden = scenario !== 'measure';
  }

  function setPlaying(on) {
    playing = on;
    els.play.dataset.i18n = on ? 'pause' : 'play';
    els.play.textContent = I18n.t(els.play.dataset.i18n);
  }

  function updateUrl() {
    var q = new URLSearchParams({
      sc: scenario, N: els.worlds.value, w: els.omega.value, v0: els.speed.value,
      d: els.delta.value, lang: I18n.getLanguage()
    });
    try { history.replaceState(null, '', '?' + q); } catch (e) { /* not allowed on some file:// setups */ }
  }

  function bindPair(range, num, onChange) {
    range.addEventListener('input', function () { num.value = range.value; onChange(); });
    num.addEventListener('input', function () {
      var v = parseFloat(num.value);
      if (isNaN(v)) return;
      range.value = Math.min(parseFloat(range.max), Math.max(parseFloat(range.min), v));
      onChange();
    });
  }

  /* Initial state: query string, then defaults; a change of language or theme redraws everything */
  var qs = new URLSearchParams(location.search);
  Settings.init(function () {
    els.scenarioNote.innerHTML = I18n.t(NOTE_KEYS[scenario]);
    els.play.textContent = I18n.t(els.play.dataset.i18n || 'pause');
    if (lastMeasure) els.measureNote.textContent = I18n.t('msgMeasured', lastMeasure);
    refresh(false);
  });
  setPair(els.worlds, els.worldsNum, clamp(qs.get('N'), LIMITS.worlds, 20));
  setPair(els.omega, els.omegaNum, clamp(qs.get('w'), LIMITS.omega, 1));
  setPair(els.speed, els.speedNum, clamp(qs.get('v0'), LIMITS.speed, 3));
  setPair(els.delta, els.deltaNum, clamp(qs.get('d'), LIMITS.delta, 0.4));
  setScenario(SCENARIOS.indexOf(qs.get('sc')) >= 0 ? qs.get('sc') : 'ground');
  setPlaying(true);
  build();
  requestAnimationFrame(frame);

  bindPair(els.worlds, els.worldsNum, build);
  bindPair(els.omega, els.omegaNum, build);
  bindPair(els.speed, els.speedNum, build);
  bindPair(els.delta, els.deltaNum, updateUrl);
  els.play.addEventListener('click', function () { setPlaying(!playing); });
  els.restart.addEventListener('click', build);
  els.measureBtn.addEventListener('click', doMeasure);
  document.querySelectorAll('[data-scenario]').forEach(function (b) {
    b.addEventListener('click', function () { setScenario(b.dataset.scenario); build(); });
  });
})();
