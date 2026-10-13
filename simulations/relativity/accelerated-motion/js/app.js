/*
 * app.js: wires the page controls to the scene and keeps the permalink up to date.
 */
(function () {
  'use strict';

  var FIXED = { xs: -2.5, before: 1, after: 1 };   // drawn band: 1 unit before departure, 1 after arrival

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    accel: $('accel'), accelNum: $('accelNum'),
    dist: $('dist'), distNum: $('distNum'),
    L0: $('L0'), L0Num: $('L0Num'),
    W: $('W'), WNum: $('WNum'),
    tNow: $('tNow'), tNowVal: $('tNowVal'),
    showMoving: $('showMoving'), movingBlock: $('movingBlock'),
    tau: $('tau'), tauVal: $('tauVal'),
    showTicks: $('showTicks'),
    showCone: $('showCone')
  };

  /* ---------- language and theme (shared overlay) ---------- */

  var scene = new SpaceTimeScene($('view'));
  scene.setTheme(Settings.init(function (theme) { scene.setTheme(theme); refresh(); }));
  var qs = new URLSearchParams(location.search);

  /* ---------- parameters from the query string ---------- */
  // ?a=1&X=3&L0=1&W=0.4&t=2&tau=2&moving=1&ticks=0&cone=1&view=side&lang=en
  function fromQuery(name, el, numEl) {
    if (!qs.has(name)) return;
    var v = parseFloat(qs.get(name));
    if (isNaN(v)) return;
    v = Math.min(parseFloat(el.max), Math.max(parseFloat(el.min), v));
    el.value = v;
    if (numEl) numEl.value = v;
  }
  fromQuery('a', els.accel, els.accelNum);
  fromQuery('X', els.dist, els.distNum);
  fromQuery('L0', els.L0, els.L0Num);
  fromQuery('W', els.W, els.WNum);
  if (qs.get('moving') === '1') els.showMoving.checked = true;
  if (qs.get('ticks') === '0') els.showTicks.checked = false;
  if (qs.get('cone') === '1') els.showCone.checked = true;
  // the ranges of t and tau depend on the trip: they are set by params(), then the values are read
  var queryT = parseFloat(qs.get('t')), queryTau = parseFloat(qs.get('tau'));

  function bindPair(range, num) {
    range.addEventListener('input', function () { num.value = range.value; refresh(); });
    num.addEventListener('input', function () {
      var v = parseFloat(num.value);
      if (isNaN(v)) return;
      v = Math.min(parseFloat(range.max), Math.max(parseFloat(range.min), v));
      range.value = v;
      refresh();
    });
  }
  bindPair(els.accel, els.accelNum);
  bindPair(els.dist, els.distNum);
  bindPair(els.L0, els.L0Num);
  bindPair(els.W, els.WNum);
  els.tNow.addEventListener('input', refresh);
  els.tau.addEventListener('input', refresh);
  els.showMoving.addEventListener('change', refresh);
  els.showTicks.addEventListener('change', refresh);
  els.showCone.addEventListener('change', refresh);

  var viewButtons = document.querySelectorAll('.buttons button[data-view]');
  function setView(name) {
    viewButtons.forEach(function (b) { b.classList.toggle('active', b.dataset.view === name); });
    scene.setView(name);
    updateUrl();
  }
  viewButtons.forEach(function (b) {
    b.addEventListener('click', function () { setView(b.dataset.view); });
  });

  /** Clamps a slider to [min, max] and returns its value. */
  function clampSlider(el, min, max, value) {
    el.min = min.toFixed(3);
    el.max = max.toFixed(3);
    var v = Math.min(max, Math.max(min, value));
    el.value = v;
    return v;
  }

  function params() {
    var L0 = parseFloat(els.L0.value);
    var p = {
      a: parseFloat(els.accel.value),
      X: parseFloat(els.dist.value),
      L0: L0,
      W: parseFloat(els.W.value),
      xs: FIXED.xs,
      x0: FIXED.xs + L0 + 0.5,          // the moving body starts just right of the body at rest
      showMovingPlane: els.showMoving.checked,
      showTicks: els.showTicks.checked,
      showLightCone: els.showCone.checked
    };
    // the drawn band and the useful range of tau depend on the trip: the sliders adapt
    var tr = Physics.trip(p);
    p.tMin = -FIXED.before;
    p.tMax = tr.T + FIXED.after;
    p.tNow = clampSlider(els.tNow, p.tMin, p.tMax, isNaN(queryT) ? parseFloat(els.tNow.value) : queryT);
    var r = Physics.movingTimeRange(tr, p.tMin, p.tMax);
    p.tau = clampSlider(els.tau, r.min, r.max, isNaN(queryTau) ? parseFloat(els.tau.value) : queryTau);
    queryT = queryTau = NaN;
    return p;
  }

  function fmt(v, digits) { return v.toFixed(digits === undefined ? 3 : digits); }

  function refresh() {
    var p = params();
    els.tNowVal.textContent = fmt(p.tNow, 2);
    els.tauVal.textContent = fmt(p.tau, 2);
    els.movingBlock.classList.toggle('hidden', !p.showMovingPlane);
    document.querySelectorAll('.movingOnly').forEach(function (tr) {
      tr.classList.toggle('hidden', !p.showMovingPlane);
    });

    var r = scene.update(p);
    $('rBeta').textContent = fmt(r.betaRear) + ' / ' + fmt(r.betaFront);
    $('rGamma').textContent = fmt(r.gamma);
    $('rLstat').textContent = fmt(r.statLength);
    $('rLmov').textContent = fmt(r.movLength);
    $('rLgamma').textContent = fmt(r.contractedRear) + ' / ' + fmt(r.contractedFront);
    $('rRatio').textContent = fmt(100 * r.movLength / r.statLength, 1) + ' %';
    $('rAngle').textContent = fmt(r.angleDeg, 1) + '°';
    $('rT').textContent = fmt(r.T);
    $('rTauTotal').textContent = fmt(r.tauTotal);
    $('rTripRatio').textContent = fmt(100 * r.tauTotal / r.T, 1) + ' %';
    $('rBetaMax').textContent = fmt(r.betaMax);
    $('rAfront').textContent = fmt(r.aFront);
    $('rTstat').textContent = fmt(r.statClock);
    $('rTmov').textContent = fmt(r.movClockRear) + ' / ' + fmt(r.movClockFront);
    if (p.showMovingPlane) {
      $('rMprop').textContent = fmt(r.movProper);
      $('rMstat').textContent = fmt(r.statInMoving);
      $('rEucl').textContent = fmt(r.euclMov) + ' / ' + fmt(r.euclStat);
      $('rTmovProper').textContent = fmt(r.movClockProperRear) + ' / ' + fmt(r.movClockProperFront);
      $('rTstatIn').textContent = fmt(r.statClockLeft) + ' / ' + fmt(r.statClockRight);
    }
    updateUrl();
  }

  function updateUrl() {
    var q = new URLSearchParams();
    q.set('a', els.accel.value);
    q.set('X', els.dist.value);
    q.set('L0', els.L0.value);
    q.set('W', els.W.value);
    q.set('t', parseFloat(els.tNow.value).toFixed(2));
    if (els.showMoving.checked) { q.set('moving', '1'); q.set('tau', parseFloat(els.tau.value).toFixed(2)); }
    if (!els.showTicks.checked) q.set('ticks', '0');
    if (els.showCone.checked) q.set('cone', '1');
    q.set('view', scene.viewName);
    q.set('lang', I18n.getLanguage());
    try { history.replaceState(null, '', '?' + q.toString()); } catch (e) { /* file:// in some browsers */ }
  }

  refresh();
  var view = qs.get('view');
  if (view === 'side' || view === 'top') setView(view);
})();
