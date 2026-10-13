/*
 * i18n.js: UI string dictionaries. Every language must define every key;
 * `check()` lists the keys missing from any language.
 *
 * Markup: elements with data-i18n get textContent, elements with data-i18n-html
 * get innerHTML (dictionary strings are authored here, never user input).
 */
(function (root) {
  'use strict';

  var DICT = {
    it: {
      name: 'Italiano',
      title: 'Universo blocco: contrazione delle lunghezze e dilatazione del tempo',
      heading: 'Universo blocco',
      intro: 'Spaziotempo 2+1: due dimensioni di spazio (<span class="ax-x">x</span>, <span class="ax-y">y</span>) e una di tempo (<span class="ax-t">t</span>, verticale). Niente si muove: ogni corpo è un <em>tubo di universo</em>, e il moto è l\'inclinazione del tubo. Unità con <em>c</em> = 1.',
      settings: 'Impostazioni',
      language: 'Lingua',
      theme: 'Tema',
      themeSystem: 'Sistema',
      themeLight: 'Chiaro',
      themeDark: 'Scuro',
      parameters: 'Parametri',
      betaLabel: 'Velocità del corpo in moto <em>β = v / c</em>',
      L0Label: 'Lunghezza propria <em>L<sub>0</sub></em> (uguale per i due corpi)',
      WLabel: 'Larghezza <em>W</em> lungo y',
      planes: 'Piani di simultaneità',
      tNowLabel: '«Adesso» del corpo fermo: piano <em>t</em> =',
      showMoving: 'Mostra anche l\'«adesso» del corpo in moto (piano <em>t′</em> = costante, inclinato)',
      tauLabel: 'Piano <em>t′</em> =',
      minkowskiNote: 'Sul piano inclinato le lunghezze vanno lette con la metrica di Minkowski (Δx² − Δt²), non con il righello dello schermo: il segmento disegnato appare più lungo di quanto misuri il corpo in moto.',
      showCone: 'Cono di luce dall\'evento iniziale del corpo in moto',
      view: 'Vista',
      view3d: '3D',
      viewSide: 'Laterale x–t',
      viewTop: 'Dall\'alto x–y',
      viewHint: 'Trascina per ruotare, rotellina per lo zoom, tasto destro per spostare.',
      readings: 'Letture',
      rGamma: 'γ = 1 / √(1 − β²)',
      rLstat: 'Sezione del corpo fermo su t = cost',
      rLmov: 'Sezione del corpo in moto su t = cost',
      rRatio: 'Contrazione L<sub>0</sub> / γ',
      rAngle: 'Inclinazione delle linee di universo',
      rMprop: 'Corpo in moto sul proprio piano t′ (Minkowski)',
      rMstat: 'Corpo fermo sul piano t′ (Minkowski)',
      rEucl: 'Stessi segmenti, lunghezza euclidea nel disegno',
      legend: 'Legenda',
      legStat: 'corpo fermo (tubo verticale)',
      legMov: 'corpo in moto (tubo inclinato)',
      legPlane: 'piano «adesso» del corpo fermo',
      legPlane2: 'piano «adesso» del corpo in moto',
      legCone: 'cono di luce',
      docNote: 'La spiegazione geometrica è in <a href="../../../docs/relativity/block-universe-relativity-theory.it.md">docs/relativity/block-universe-relativity-theory.it.md</a>.',
      sceneStationary: 'corpo fermo',
      sceneMoving: 'corpo in moto  v = {beta} c',
      sceneCone: 'cono di luce',
      sceneProper: '(propria)',
      clocks: 'Orologi',
      showTicks: 'Mostra le tacche degli orologi (una sezione per ogni unità di tempo proprio)',
      ticksNote: 'Sul tubo fermo le tacche sono i piani <em>t</em> = 0, 1, 2…; sul tubo in moto sono i piani <em>t′</em> = 0, 1, 2…, inclinati. Nella stessa altezza del blocco il tubo in moto ne contiene 1/γ volte: il suo orologio batte più lentamente visto dal corpo fermo, e viceversa. Le letture <em>t</em> e <em>t′</em> scritte accanto alle sezioni sono ciò che segnano gli orologi dei due corpi ai loro estremi.',
      rTstat: 'Orologio del corpo fermo sul piano t = cost',
      rTmov: 'Orologi del corpo in moto sul piano t = cost (coda / testa)',
      rTratio: 'Dilatazione t′ / t alla coda = 1 / γ',
      rProper: 'Tempo proprio lungo tutto il blocco (fermo / in moto)',
      rTmovProper: 'Orologio del corpo in moto sul piano t′ = cost',
      rTstatIn: 'Orologi del corpo fermo sul piano t′ = cost (sinistra / destra)',
      legTick: 'tacche degli orologi (unità di tempo proprio)'
    },
    en: {
      name: 'English',
      title: 'Block universe: length contraction and time dilation',
      heading: 'Block universe',
      intro: '2+1 spacetime: two space dimensions (<span class="ax-x">x</span>, <span class="ax-y">y</span>) and one time dimension (<span class="ax-t">t</span>, vertical). Nothing moves: each body is a <em>world tube</em>, and motion is the tilt of the tube. Units with <em>c</em> = 1.',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      parameters: 'Parameters',
      betaLabel: 'Speed of the moving body <em>β = v / c</em>',
      L0Label: 'Proper length <em>L<sub>0</sub></em> (same for both bodies)',
      WLabel: 'Width <em>W</em> along y',
      planes: 'Simultaneity planes',
      tNowLabel: '"Now" of the body at rest: plane <em>t</em> =',
      showMoving: 'Also show the "now" of the moving body (tilted plane <em>t′</em> = constant)',
      tauLabel: 'Plane <em>t′</em> =',
      minkowskiNote: 'On the tilted plane, lengths must be read with the Minkowski metric (Δx² − Δt²), not with the ruler of the screen: the drawn segment looks longer than what the moving body measures.',
      showCone: 'Light cone from the initial event of the moving body',
      view: 'View',
      view3d: '3D',
      viewSide: 'Side x–t',
      viewTop: 'Top x–y',
      viewHint: 'Drag to rotate, wheel to zoom, right button to pan.',
      readings: 'Readings',
      rGamma: 'γ = 1 / √(1 − β²)',
      rLstat: 'Section of the body at rest on t = const',
      rLmov: 'Section of the moving body on t = const',
      rRatio: 'Contraction L<sub>0</sub> / γ',
      rAngle: 'Tilt of the world lines',
      rMprop: 'Moving body on its own plane t′ (Minkowski)',
      rMstat: 'Body at rest on plane t′ (Minkowski)',
      rEucl: 'Same segments, Euclidean length in the drawing',
      legend: 'Legend',
      legStat: 'body at rest (vertical tube)',
      legMov: 'moving body (tilted tube)',
      legPlane: '"now" plane of the body at rest',
      legPlane2: '"now" plane of the moving body',
      legCone: 'light cone',
      docNote: 'The geometric explanation is in <a href="../../../docs/relativity/block-universe-relativity-theory.en.md">docs/relativity/block-universe-relativity-theory.en.md</a>.',
      sceneStationary: 'body at rest',
      sceneMoving: 'moving body  v = {beta} c',
      sceneCone: 'light cone',
      sceneProper: '(proper)',
      clocks: 'Clocks',
      showTicks: 'Show the clock ticks (one section per unit of proper time)',
      ticksNote: 'On the tube at rest the ticks are the planes <em>t</em> = 0, 1, 2…; on the moving tube they are the tilted planes <em>t′</em> = 0, 1, 2…. Within the same height of the block the moving tube holds 1/γ as many: its clock runs slower as seen by the body at rest, and vice versa. The readings <em>t</em> and <em>t′</em> written next to the sections are what the clocks of the two bodies show at their ends.',
      rTstat: 'Clock of the body at rest on the plane t = const',
      rTmov: 'Clocks of the moving body on the plane t = const (rear / front)',
      rTratio: 'Dilation t′ / t at the rear = 1 / γ',
      rProper: 'Proper time along the whole block (at rest / moving)',
      rTmovProper: 'Clock of the moving body on the plane t′ = const',
      rTstatIn: 'Clocks of the body at rest on the plane t′ = const (left / right)',
      legTick: 'clock ticks (units of proper time)'
    }
  };

  var current = 'it';

  function t(key, vars) {
    var s = (DICT[current] && DICT[current][key]) || DICT.it[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    }
    return s;
  }

  function apply(rootEl) {
    rootEl = rootEl || document;
    rootEl.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    rootEl.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
    document.documentElement.lang = current;
    document.title = t('title');
  }

  function setLanguage(lang) {
    current = DICT[lang] ? lang : 'it';
    return current;
  }

  /** Returns the keys missing from any language (empty array when dictionaries are in sync). */
  function check() {
    var all = {};
    Object.keys(DICT).forEach(function (l) { Object.keys(DICT[l]).forEach(function (k) { all[k] = true; }); });
    var missing = [];
    Object.keys(DICT).forEach(function (l) {
      Object.keys(all).forEach(function (k) { if (!(k in DICT[l])) missing.push(l + ':' + k); });
    });
    return missing;
  }

  root.I18n = {
    t: t,
    apply: apply,
    setLanguage: setLanguage,
    getLanguage: function () { return current; },
    languages: function () { return Object.keys(DICT).map(function (l) { return { code: l, name: DICT[l].name }; }); },
    check: check
  };
})(typeof self !== 'undefined' ? self : this);
