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
      title: 'Universo blocco: corpo che accelera',
      heading: 'Universo blocco',
      intro: 'Spaziotempo 2+1: due dimensioni di spazio (<span class="ax-x">x</span>, <span class="ax-y">y</span>) e una di tempo (<span class="ax-t">t</span>, verticale). Il corpo in moto parte da fermo, accelera fino a metà strada, frena e si ferma dopo una distanza <em>X</em>: il suo tubo di universo è curvo. Unità con <em>c</em> = 1.',
      settings: 'Impostazioni',
      language: 'Lingua',
      theme: 'Tema',
      themeSystem: 'Sistema',
      themeLight: 'Chiaro',
      themeDark: 'Scuro',
      parameters: 'Parametri',
      aLabel: 'Accelerazione propria della coda <em>a</em> (unità c²/lunghezza)',
      XLabel: 'Distanza del viaggio <em>X</em>',
      L0Label: 'Lunghezza propria <em>L<sub>0</sub></em> (uguale per i due corpi)',
      WLabel: 'Larghezza <em>W</em> lungo y',
      accelNote: 'Il corpo è rigido nel senso di Born: ogni suo punto mantiene costante la propria accelerazione, maggiore in coda e minore in testa. Le linee di universo sono iperboli; la frenata è la spinta riflessa rispetto al punto di mezzo del viaggio.',
      planes: 'Piani di simultaneità',
      tNowLabel: '«Adesso» del corpo fermo: piano <em>t</em> =',
      showMoving: 'Mostra anche l\'«adesso» del corpo in moto (piano di simultaneità istantaneo, inclinato)',
      tauLabel: 'Tempo proprio della coda <em>τ</em> =',
      minkowskiNote: 'Sul piano inclinato le lunghezze vanno lette con la metrica di Minkowski (Δx² − Δt²), non con il righello dello schermo: il segmento disegnato appare più lungo di quanto misuri il corpo in moto.',
      showCone: 'Cono di luce dall\'evento di partenza',
      view: 'Vista',
      view3d: '3D',
      viewSide: 'Laterale x–t',
      viewTop: 'Dall\'alto x–y',
      viewHint: 'Trascina per ruotare, rotellina per lo zoom, tasto destro per spostare.',
      readings: 'Letture',
      trip: 'Viaggio',
      rT: 'Durata nel laboratorio <em>T</em>',
      rTauTotal: 'Durata propria <em>τ</em> (uguale per coda e testa)',
      rTripRatio: 'Rapporto τ / T',
      rBetaMax: 'Velocità massima β a metà strada',
      rAfront: 'Accelerazione propria della testa',
      onPlane: 'Sul piano t = cost',
      rBeta: 'Velocità β (coda / testa)',
      rGamma: 'γ della coda',
      rLstat: 'Sezione del corpo fermo',
      rLmov: 'Sezione del corpo in moto',
      rLgamma: 'Per confronto L<sub>0</sub> / γ (coda / testa)',
      rRatio: 'Rapporto L / L<sub>0</sub>',
      rAngle: 'Inclinazione della linea di universo della coda',
      rMprop: 'Corpo in moto sul proprio piano τ (Minkowski)',
      rMstat: 'Corpo fermo sul piano τ (Minkowski)',
      rEucl: 'Stessi segmenti, lunghezza euclidea nel disegno',
      rTstat: 'Orologio del corpo fermo sul piano t = cost',
      rTmov: 'Orologi del corpo in moto sul piano t = cost (coda / testa)',
      rTmovProper: 'Orologi del corpo in moto sul piano τ (coda / testa)',
      rTstatIn: 'Orologi del corpo fermo sul piano τ (sinistra / destra)',
      legend: 'Legenda',
      legStat: 'corpo fermo (tubo verticale)',
      legMov: 'corpo che accelera (tubo curvo)',
      legPlane: 'piano «adesso» del corpo fermo',
      legPlane2: 'piano «adesso» del corpo in moto',
      legCone: 'cono di luce',
      legTick: 'tacche degli orologi (unità di tempo proprio)',
      docNote: 'La spiegazione geometrica è in <a href="../../../docs/relativity/block-universe-relativity-theory.it.md">docs/relativity/block-universe-relativity-theory.it.md</a>.',
      sceneStationary: 'corpo fermo',
      sceneMoving: 'corpo che accelera  a = {a}',
      sceneDeparture: 'partenza',
      sceneBrake: 'inizio frenata',
      sceneArrival: 'arrivo',
      sceneCone: 'cono di luce',
      sceneProper: '(propria)',
      clocks: 'Orologi',
      showTicks: 'Mostra le tacche degli orologi (una sezione per ogni unità di tempo proprio)',
      ticksNote: 'Sul tubo fermo le tacche sono i piani <em>t</em> = 0, 1, 2…; sul tubo curvo sono i piani di simultaneità istantanei con <em>τ</em> = 0, 1, 2…, sempre più inclinati man mano che il corpo accelera. Durante la spinta l\'orologio di testa corre più veloce di quello di coda; durante la frenata recupera, e all\'arrivo i due segnano lo stesso τ.'
    },
    en: {
      name: 'English',
      title: 'Block universe: accelerating body',
      heading: 'Block universe',
      intro: '2+1 spacetime: two space dimensions (<span class="ax-x">x</span>, <span class="ax-y">y</span>) and one time dimension (<span class="ax-t">t</span>, vertical). The moving body starts at rest, accelerates up to the halfway point, brakes and stops after a distance <em>X</em>: its world tube is curved. Units with <em>c</em> = 1.',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      parameters: 'Parameters',
      aLabel: 'Proper acceleration of the rear <em>a</em> (units c²/length)',
      XLabel: 'Trip distance <em>X</em>',
      L0Label: 'Proper length <em>L<sub>0</sub></em> (same for both bodies)',
      WLabel: 'Width <em>W</em> along y',
      accelNote: 'The body is rigid in Born\'s sense: each of its points keeps its own proper acceleration constant, larger at the rear and smaller at the front. The world lines are hyperbolas; the braking is the push reflected through the midpoint of the trip.',
      planes: 'Simultaneity planes',
      tNowLabel: '"Now" of the body at rest: plane <em>t</em> =',
      showMoving: 'Also show the "now" of the moving body (instantaneous simultaneity plane, tilted)',
      tauLabel: 'Proper time of the rear <em>τ</em> =',
      minkowskiNote: 'On the tilted plane, lengths must be read with the Minkowski metric (Δx² − Δt²), not with the ruler of the screen: the drawn segment looks longer than what the moving body measures.',
      showCone: 'Light cone from the departure event',
      view: 'View',
      view3d: '3D',
      viewSide: 'Side x–t',
      viewTop: 'Top x–y',
      viewHint: 'Drag to rotate, wheel to zoom, right button to pan.',
      readings: 'Readings',
      trip: 'Trip',
      rT: 'Duration in the laboratory <em>T</em>',
      rTauTotal: 'Proper duration <em>τ</em> (same for rear and front)',
      rTripRatio: 'Ratio τ / T',
      rBetaMax: 'Maximum speed β at the halfway point',
      rAfront: 'Proper acceleration of the front',
      onPlane: 'On the plane t = const',
      rBeta: 'Speed β (rear / front)',
      rGamma: 'γ of the rear',
      rLstat: 'Section of the body at rest',
      rLmov: 'Section of the moving body',
      rLgamma: 'For comparison L<sub>0</sub> / γ (rear / front)',
      rRatio: 'Ratio L / L<sub>0</sub>',
      rAngle: 'Tilt of the rear world line',
      rMprop: 'Moving body on its own plane τ (Minkowski)',
      rMstat: 'Body at rest on the plane τ (Minkowski)',
      rEucl: 'Same segments, Euclidean length in the drawing',
      rTstat: 'Clock of the body at rest on the plane t = const',
      rTmov: 'Clocks of the moving body on the plane t = const (rear / front)',
      rTmovProper: 'Clocks of the moving body on the plane τ (rear / front)',
      rTstatIn: 'Clocks of the body at rest on the plane τ (left / right)',
      legend: 'Legend',
      legStat: 'body at rest (vertical tube)',
      legMov: 'accelerating body (curved tube)',
      legPlane: '"now" plane of the body at rest',
      legPlane2: '"now" plane of the moving body',
      legCone: 'light cone',
      legTick: 'clock ticks (units of proper time)',
      docNote: 'The geometric explanation is in <a href="../../../docs/relativity/block-universe-relativity-theory.en.md">docs/relativity/block-universe-relativity-theory.en.md</a>.',
      sceneStationary: 'body at rest',
      sceneMoving: 'accelerating body  a = {a}',
      sceneDeparture: 'departure',
      sceneBrake: 'braking starts',
      sceneArrival: 'arrival',
      sceneCone: 'light cone',
      sceneProper: '(proper)',
      clocks: 'Clocks',
      showTicks: 'Show the clock ticks (one section per unit of proper time)',
      ticksNote: 'On the tube at rest the ticks are the planes <em>t</em> = 0, 1, 2…; on the curved tube they are the instantaneous simultaneity planes with <em>τ</em> = 0, 1, 2…, more and more tilted as the body speeds up. While pushing, the front clock runs faster than the rear one; while braking it falls back, and on arrival both show the same τ.'
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
