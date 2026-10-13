/*
 * app.js: wires the controls to the model and the renderer. Language and theme
 * come from the shared overlay (shared/js/settings.js); the state of the simulation
 * is mirrored in the query string so a view can be linked.
 */
(function () {
  'use strict';

  var TREE_NODE_LIMIT = 4096; // worlds drawn at the last step of the tree view
  var FRAME_MS = 400;
  var LIMITS = { outcomes: [2, 4], steps: [1, 40], disorder: [0, 1], seed: [0, 99999] };
  var REGIMES = ['tree', 'classical', 'quantum'];
  var NOTE_KEYS = { tree: 'regimeNoteTree', classical: 'regimeNoteClassical', quantum: 'regimeNoteQuantum' };

  var els = {};
  ['outcomes', 'outcomesNum', 'steps', 'stepsNum', 'stepsNote', 'disorder', 'disorderNum', 'seed',
    'regimeNote', 'step', 'stepNum', 'play', 'graph', 'tooltip', 'graphBox', 'tableBox', 'tableCaption', 'tableBody',
    'rWorldsTree', 'rDistinct', 'rEffClassical', 'rEffQuantum', 'rSigmaClassical', 'rSigmaQuantum', 'rSuppressedEdges', 'rSuppressedNodes'
  ].forEach(function (id) { els[id] = document.getElementById(id); });

  var formatProbability = MultiverseGraph.formatProbability, formatCount = MultiverseGraph.formatCount;
  var graph = new MultiverseGraph(els.graph, els.tooltip);
  var regime = 'quantum', view = 'graph', lattice = null, timer = null;

  function clamp(value, limits, fallback) {
    var v = parseFloat(value);
    return isNaN(v) ? fallback : Math.min(limits[1], Math.max(limits[0], v));
  }
  function setPair(range, num, value) { range.value = value; num.value = value; }

  function setRegime(value) {
    regime = value;
    document.querySelectorAll('[data-regime]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.regime === regime);
      b.setAttribute('aria-pressed', b.dataset.regime === regime);
    });
    var max = LIMITS.steps[1];
    if (regime === 'tree') max = Math.min(max, Math.floor(Math.log(TREE_NODE_LIMIT) / Math.log(+els.outcomes.value) + 1e-9));
    els.steps.max = els.stepsNum.max = max;
    if (+els.steps.value > max) setPair(els.steps, els.stepsNum, max);
    els.stepsNote.hidden = regime !== 'tree';
    els.stepsNote.textContent = I18n.t('stepsTreeNote', { max: max });
    els.regimeNote.innerHTML = I18n.t(NOTE_KEYS[regime]);
  }

  function setView(value) {
    view = value;
    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === view);
      b.setAttribute('aria-pressed', b.dataset.view === view);
    });
    els.graphBox.hidden = view !== 'graph';
    els.tableBox.hidden = view !== 'table';
  }

  function rebuild() {
    lattice = Model.buildLattice({ outcomes: +els.outcomes.value, steps: +els.steps.value, disorder: +els.disorder.value, seed: +els.seed.value });
    els.step.max = els.stepNum.max = els.steps.value;
    if (+els.step.value > +els.steps.value) setPair(els.step, els.stepNum, els.steps.value);
  }

  function renderTable(step) {
    els.tableCaption.textContent = I18n.t('histTitle', { t: step });
    els.tableBody.innerHTML = lattice[step].map(function (node) {
      return '<tr><td>' + node.x + '</td><td>' + formatCount(node.paths) + '</td><td>' + formatProbability(node.pClassical) +
        '</td><td>' + formatProbability(node.pQuantum) + '</td><td>' + (node.pQuantum / node.pClassical).toFixed(3) + '</td></tr>';
    }).join('');
  }

  function updateUrl() {
    var q = new URLSearchParams({
      n: els.outcomes.value, T: els.steps.value, reg: regime, dis: els.disorder.value, seed: els.seed.value,
      step: els.step.value, view: view, lang: I18n.getLanguage()
    });
    try { history.replaceState(null, '', '?' + q); } catch (e) { /* not allowed on some file:// setups */ }
  }

  function refresh() {
    var step = +els.step.value;
    graph.update({ lattice: lattice, outcomes: +els.outcomes.value, steps: +els.steps.value, step: step, regime: regime, text: I18n.t });
    var s = Model.statistics(lattice, step);
    els.rWorldsTree.textContent = formatCount(s.treeWorlds);
    els.rDistinct.textContent = formatCount(s.distinct);
    els.rEffClassical.textContent = s.effectiveClassical.toFixed(2);
    els.rEffQuantum.textContent = s.effectiveQuantum.toFixed(2);
    els.rSigmaClassical.textContent = s.sigmaClassical.toFixed(2);
    els.rSigmaQuantum.textContent = s.sigmaQuantum.toFixed(2);
    els.rSuppressedEdges.textContent = formatCount(s.suppressedEdges);
    els.rSuppressedNodes.textContent = formatCount(s.suppressedNodes);
    if (view === 'table') renderTable(step);
    updateUrl();
  }

  function setPlaying(on) {
    if (timer) { clearInterval(timer); timer = null; }
    if (on) {
      if (+els.step.value >= +els.steps.value) { setPair(els.step, els.stepNum, 0); refresh(); }
      timer = setInterval(function () {
        var next = +els.step.value + 1;
        if (next > +els.steps.value) { setPlaying(false); return; }
        setPair(els.step, els.stepNum, next);
        refresh();
      }, FRAME_MS);
    }
    els.play.dataset.i18n = on ? 'pause' : 'play';
    els.play.textContent = I18n.t(els.play.dataset.i18n);
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
  Settings.init(function () { setRegime(regime); refresh(); });
  setPair(els.outcomes, els.outcomesNum, clamp(qs.get('n'), LIMITS.outcomes, 2));
  setPair(els.steps, els.stepsNum, clamp(qs.get('T'), LIMITS.steps, 20));
  setPair(els.disorder, els.disorderNum, clamp(qs.get('dis'), LIMITS.disorder, 0));
  els.seed.value = clamp(qs.get('seed'), LIMITS.seed, 1);
  setRegime(REGIMES.indexOf(qs.get('reg')) >= 0 ? qs.get('reg') : 'quantum');
  setView(qs.get('view') === 'table' ? 'table' : 'graph');
  rebuild();
  setPair(els.step, els.stepNum, clamp(qs.get('step'), [0, +els.steps.value], +els.steps.value));
  refresh();

  bindPair(els.outcomes, els.outcomesNum, function () { setRegime(regime); rebuild(); refresh(); });
  bindPair(els.steps, els.stepsNum, function () { rebuild(); setPair(els.step, els.stepNum, els.steps.value); refresh(); });
  bindPair(els.disorder, els.disorderNum, function () { rebuild(); refresh(); });
  bindPair(els.step, els.stepNum, refresh);
  els.seed.addEventListener('input', function () { rebuild(); refresh(); });
  els.play.addEventListener('click', function () { setPlaying(!timer); });
  document.querySelectorAll('[data-regime]').forEach(function (b) {
    b.addEventListener('click', function () {
      var steps = els.steps.value;
      setRegime(b.dataset.regime);
      if (els.steps.value !== steps) rebuild();
      refresh();
    });
  });
  document.querySelectorAll('[data-view]').forEach(function (b) {
    b.addEventListener('click', function () { setView(b.dataset.view); refresh(); });
  });
})();
