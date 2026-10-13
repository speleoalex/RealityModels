/*
 * app.js: wires the controls to the census and the renderer. The census runs in
 * time-boxed requestAnimationFrame slices so the page stays responsive; language
 * and theme come from the shared overlay (shared/js/settings.js) and the state is
 * mirrored in the query string so a view can be linked.
 */
(function () {
  'use strict';

  var LIMITS = { states: [2, 4], seed: [0, 99999], samples: [100000, 10000000] };
  var SLICE_MS = 14;     // work per frame
  var CHUNK = 20000;     // machines per Model.run call inside a slice

  var els = {};
  ['play', 'graph', 'tooltip', 'modeNote', 'seed', 'samples', 'samplesNum',
    'rMachines', 'rHalting', 'rDistinct', 'rLongest', 'rTop'
  ].forEach(function (id) { els[id] = document.getElementById(id); });

  var formatShare = CensusGraph.formatShare, formatCount = CensusGraph.formatCount;
  var graph = new CensusGraph(els.graph, els.tooltip);
  var states = 2, scale = 'lin', census = null, playing = false, rafId = null;

  function clamp(value, limits, fallback) {
    var v = parseFloat(value);
    return isNaN(v) ? fallback : Math.min(limits[1], Math.max(limits[0], v));
  }
  function setPair(range, num, value) { range.value = value; num.value = value; }
  function isDone() { return census.done >= census.target; }

  function setStates(value) {
    states = value;
    document.querySelectorAll('[data-states]').forEach(function (b) {
      b.classList.toggle('active', +b.dataset.states === states);
      b.setAttribute('aria-pressed', +b.dataset.states === states);
    });
    var sampled = states === 4;
    els.seed.disabled = !sampled;
    els.samples.disabled = !sampled;
    els.samplesNum.disabled = !sampled;
    els.modeNote.textContent = I18n.t(sampled ? 'modeNoteSample' : 'modeNoteFull', {
      total: Model.machineCount(states).toLocaleString(document.documentElement.lang),
      n: states,
      cap: Model.stepCap(states)
    });
  }

  function setScale(value) {
    scale = value;
    document.querySelectorAll('[data-scale]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.scale === scale);
      b.setAttribute('aria-pressed', b.dataset.scale === scale);
    });
  }

  function syncPlay() {
    var done = isDone();
    els.play.dataset.i18n = done ? 'done' : (playing ? 'pause' : 'play');
    els.play.textContent = I18n.t(els.play.dataset.i18n);
    els.play.disabled = done;
  }

  function refresh() {
    var s = Model.summary(census);
    graph.update({ census: census, summary: s, scale: scale, text: I18n.t });
    els.rMachines.textContent = formatCount(census.done) + ' / ' + formatCount(census.target);
    els.rHalting.textContent = census.done
      ? formatCount(census.halting) + ' (' + formatShare(census.halting / census.done) + ')' : '0';
    els.rDistinct.textContent = formatCount(s.entries.length);
    els.rLongest.textContent = census.maxUsed + ' / ' + census.cap;
    els.rTop.textContent = s.entries.length ? s.entries[0].output : '';
  }

  function frame() {
    rafId = null;
    var t0 = performance.now(), finished = isDone();
    while (!finished && performance.now() - t0 < SLICE_MS) finished = Model.run(census, CHUNK);
    refresh();
    if (finished) { playing = false; syncPlay(); return; }
    if (playing) rafId = requestAnimationFrame(frame);
  }

  function setPlaying(on) {
    playing = on && !isDone();
    if (playing && rafId === null) rafId = requestAnimationFrame(frame);
    if (!playing && rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    syncPlay();
  }

  function rebuild() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    census = Model.create({ states: states, seed: +els.seed.value, samples: +els.samples.value });
    playing = false;
    refresh();
    setPlaying(true);
  }

  function updateUrl() {
    var q = new URLSearchParams({
      n: states, seed: els.seed.value, samples: els.samples.value, scale: scale, lang: I18n.getLanguage()
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
  Settings.init(function () { setStates(states); syncPlay(); refresh(); updateUrl(); });
  els.seed.value = clamp(qs.get('seed'), LIMITS.seed, 1);
  setPair(els.samples, els.samplesNum, clamp(qs.get('samples'), LIMITS.samples, 1000000));
  setScale(qs.get('scale') === 'log' ? 'log' : 'lin');
  setStates(Math.round(clamp(qs.get('n'), LIMITS.states, 2)));
  rebuild();
  updateUrl();

  document.querySelectorAll('[data-states]').forEach(function (b) {
    b.addEventListener('click', function () { setStates(+b.dataset.states); rebuild(); updateUrl(); });
  });
  document.querySelectorAll('[data-scale]').forEach(function (b) {
    b.addEventListener('click', function () { setScale(b.dataset.scale); refresh(); updateUrl(); });
  });
  els.seed.addEventListener('input', function () {
    if (isNaN(parseFloat(els.seed.value))) return;
    rebuild();
    updateUrl();
  });
  bindPair(els.samples, els.samplesNum, function () { rebuild(); updateUrl(); });
  els.play.addEventListener('click', function () { setPlaying(!playing); });
})();
