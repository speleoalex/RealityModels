/*
 * app.js: wires the page controls to the scene and keeps the permalink up to date.
 */
(function () {
  'use strict';

  var FIXED = { xs: -2.5, tMin: 0, tMax: 4 };

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    beta: $('beta'), betaNum: $('betaNum'),
    L0: $('L0'), L0Num: $('L0Num'),
    W: $('W'), WNum: $('WNum'),
    tNow: $('tNow'), tNowVal: $('tNowVal'),
    showMoving: $('showMoving'), movingBlock: $('movingBlock'),
    tau: $('tau'), tauVal: $('tauVal'),
    showCone: $('showCone')
  };

  /* ---------- language and theme (shared overlay) ---------- */

  var scene = new SpaceTimeScene($('view'));
  scene.setTheme(Settings.init(function (theme) { scene.setTheme(theme); refresh(); }));
  var qs = new URLSearchParams(location.search);

  /* ---------- parameters from the query string ---------- */
  // ?beta=0.8&L0=1&W=0.4&t=2&tau=2&moving=1&cone=1&view=side&lang=en
  function fromQuery(name, el, numEl) {
    if (!qs.has(name)) return;
    var v = parseFloat(qs.get(name));
    if (isNaN(v)) return;
    v = Math.min(parseFloat(el.max), Math.max(parseFloat(el.min), v));
    el.value = v;
    if (numEl) numEl.value = v;
  }
  els.tNow.min = FIXED.tMin;
  els.tNow.max = FIXED.tMax;
  fromQuery('beta', els.beta, els.betaNum);
  fromQuery('L0', els.L0, els.L0Num);
  fromQuery('W', els.W, els.WNum);
  fromQuery('t', els.tNow);
  fromQuery('tau', els.tau);
  if (qs.get('moving') === '1') els.showMoving.checked = true;
  if (qs.get('cone') === '1') els.showCone.checked = true;

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
  bindPair(els.beta, els.betaNum);
  bindPair(els.L0, els.L0Num);
  bindPair(els.W, els.WNum);
  els.tNow.addEventListener('input', refresh);
  els.tau.addEventListener('input', refresh);
  els.showMoving.addEventListener('change', refresh);
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

  function params() {
    var beta = parseFloat(els.beta.value);
    var L0 = parseFloat(els.L0.value);
    var p = {
      beta: beta,
      L0: L0,
      W: parseFloat(els.W.value),
      xs: FIXED.xs,
      x0: FIXED.xs + L0 + 0.5,          // the moving body starts just right of the body at rest
      tMin: FIXED.tMin,
      tMax: FIXED.tMax,
      tNow: parseFloat(els.tNow.value),
      showMovingPlane: els.showMoving.checked,
      tau: parseFloat(els.tau.value),
      showLightCone: els.showCone.checked
    };
    // the useful range of tau depends on beta: the slider adapts
    var r = Physics.movingTimeRange(p);
    els.tau.min = r.min.toFixed(3);
    els.tau.max = r.max.toFixed(3);
    p.tau = Math.min(r.max, Math.max(r.min, p.tau));
    els.tau.value = p.tau;
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
    $('rGamma').textContent = fmt(r.gamma);
    $('rLstat').textContent = fmt(r.statLength);
    $('rLmov').textContent = fmt(r.movLength);
    $('rRatio').textContent = fmt(100 * r.movLength / r.statLength, 1) + ' %';
    $('rAngle').textContent = fmt(r.angleDeg, 1) + '°';
    if (p.showMovingPlane) {
      $('rMprop').textContent = fmt(r.movProper);
      $('rMstat').textContent = fmt(r.statInMoving);
      $('rEucl').textContent = fmt(r.euclMov) + ' / ' + fmt(r.euclStat);
    }
    updateUrl();
  }

  function updateUrl() {
    var q = new URLSearchParams();
    q.set('beta', els.beta.value);
    q.set('L0', els.L0.value);
    q.set('W', els.W.value);
    q.set('t', els.tNow.value);
    if (els.showMoving.checked) { q.set('moving', '1'); q.set('tau', parseFloat(els.tau.value).toFixed(2)); }
    if (els.showCone.checked) q.set('cone', '1');
    q.set('view', scene.viewName);
    q.set('lang', I18n.getLanguage());
    try { history.replaceState(null, '', '?' + q.toString()); } catch (e) { /* file:// in some browsers */ }
  }

  refresh();
  var view = qs.get('view');
  if (view === 'side' || view === 'top') setView(view);
})();
