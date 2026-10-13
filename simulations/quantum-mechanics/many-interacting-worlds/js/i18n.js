/*
 * i18n.js: dictionaries and minimal translation engine. Every UI string lives here,
 * in both languages; I18n.check() verifies that the dictionaries match.
 */
(function (root) {
  'use strict';

  var DICT = {
    it: {
      name: 'Italiano',
      title: 'Molti mondi interagenti',
      heading: 'Molti mondi interagenti',
      intro: 'N mondi classici, ognuno con la particella in una posizione precisa, si respingono con una forza che cresce quando due mondi si avvicinano (Hall, Deckert e Wiseman, 2014). Da sole equazioni di Newton emergono indeterminazione, energia di punto zero e interferenza. Con <b>N = 1</b> la repulsione sparisce: resta la meccanica classica.',
      settings: 'Impostazioni',
      language: 'Lingua',
      theme: 'Tema',
      themeSystem: 'Sistema',
      themeLight: 'Chiaro',
      themeDark: 'Scuro',
      scenario: 'Scenario',
      scGround: 'Oscillatore: stato fondamentale',
      scFree: 'Particella libera: allargamento',
      scCollision: 'Due pacchetti: interferenza',
      scMeasure: 'Misura: selezione di un bin',
      noteGround: 'La repulsione tra mondi bilancia la trappola: configurazione ferma con energia (N−1)·ħω/2 e Δx·Δp = (1−1/N)·ħ/2. Con N = 1 entrambe valgono zero: niente punto zero, niente indeterminazione.',
      noteFree: 'Trappola spenta a t = 0: il ventaglio di mondi si allarga con Δx(t) = Δx(0)·√(1+ω²t²), la stessa legge del pacchetto gaussiano quantistico.',
      noteCollision: 'Due pacchetti uno contro l’altro: i mondi non si attraversano mai, la repulsione li incanala in bande di densità separate da vuoti. Sono le frange di interferenza, spaziatura circa πħ/p.',
      noteMeasure: 'Misura di posizione con risoluzione δ: un mondo a caso tra gli N, pesi uguali, fissa il risultato (regola di Born). I mondi entro δ restano un insieme interagente, gli altri bin si separano e sbiadiscono: il collasso è selezione di un sottoinsieme, mai fusione di mondi.',
      parameters: 'Parametri',
      worldsLabel: 'Mondi N',
      omegaLabel: 'Frequenza della trappola ω',
      speedLabel: 'Velocità dei pacchetti v₀',
      deltaLabel: 'Risoluzione della misura δ',
      run: 'Esecuzione',
      play: 'Avvia',
      pause: 'Pausa',
      restart: 'Riparti',
      doMeasure: 'Misura ora',
      msgMeasured: 'Mondo {i} di {n} estratto: {k} mondi nel bin, gli altri si separano.',
      readings: 'Letture',
      rWorlds: 'Mondi accoppiati',
      rDx: 'Δx',
      rDp: 'Δp (con termine osmotico)',
      rProduct: 'Δx·Δp',
      rBound: 'Valore esatto (1−1/N)·ħ/2',
      rEnergy: 'Energia totale',
      rEnergyExp: 'Energia attesa (N−1)·ħω/2',
      rSpread: 'Δx(t)/Δx(0) vs √(1+ω²t²)',
      legend: 'Legenda',
      legWorld: 'Linea di mondo (una copia della particella)',
      legChosen: 'Mondo estratto dalla misura',
      legDiscarded: 'Mondi scartati: evolvono per conto loro',
      legDensity: 'Densità dei mondi (istogramma)',
      legTheory: 'Densità quantistica |ψ|² attesa',
      axisTime: 't',
      axisX: 'x',
      ttWorld: 'Mondo {i}',
      ttPosition: 'posizione x',
      ttVelocity: 'velocità v',
      graphAria: 'Linee di mondo delle N copie della particella, tempo in orizzontale e posizione in verticale, con sotto l’istogramma della densità dei mondi',
      docNote: 'Guida e verifiche: <a href="../../../docs/quantum-mechanics/many-interacting-worlds-simulation-guide.it.md">docs/quantum-mechanics/many-interacting-worlds-simulation-guide.it.md</a>; teoria e bibliografia: <a href="../../../docs/quantum-mechanics/many-interacting-worlds-theory.it.md">docs/quantum-mechanics/many-interacting-worlds-theory.it.md</a>.'
    },
    en: {
      name: 'English',
      title: 'Many interacting worlds',
      heading: 'Many interacting worlds',
      intro: 'N classical worlds, each with the particle at a definite position, repel each other with a force that grows as two worlds get close (Hall, Deckert and Wiseman, 2014). Newton’s equations alone produce uncertainty, zero-point energy and interference. With <b>N = 1</b> the repulsion vanishes: classical mechanics is what remains.',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      scenario: 'Scenario',
      scGround: 'Oscillator: ground state',
      scFree: 'Free particle: spreading',
      scCollision: 'Two packets: interference',
      scMeasure: 'Measurement: picking a bin',
      noteGround: 'The inter-world repulsion balances the trap: a configuration at rest with energy (N−1)·ħω/2 and Δx·Δp = (1−1/N)·ħ/2. With N = 1 both are zero: no zero point, no uncertainty.',
      noteFree: 'Trap switched off at t = 0: the fan of worlds spreads as Δx(t) = Δx(0)·√(1+ω²t²), the same law as the quantum Gaussian packet.',
      noteCollision: 'Two packets head on: worlds never cross, the repulsion funnels them into density bands separated by gaps. These are the interference fringes, spacing about πħ/p.',
      noteMeasure: 'Position measurement with resolution δ: one world drawn at random among the N, equal weights, fixes the outcome (Born rule). The worlds within δ stay one interacting ensemble, the other bins decouple and fade: collapse is selecting a sub-ensemble, never merging worlds.',
      parameters: 'Parameters',
      worldsLabel: 'Worlds N',
      omegaLabel: 'Trap frequency ω',
      speedLabel: 'Packet speed v₀',
      deltaLabel: 'Measurement resolution δ',
      run: 'Run',
      play: 'Play',
      pause: 'Pause',
      restart: 'Restart',
      doMeasure: 'Measure now',
      msgMeasured: 'World {i} of {n} drawn: {k} worlds in the bin, the others decouple.',
      readings: 'Readings',
      rWorlds: 'Coupled worlds',
      rDx: 'Δx',
      rDp: 'Δp (with the osmotic term)',
      rProduct: 'Δx·Δp',
      rBound: 'Exact value (1−1/N)·ħ/2',
      rEnergy: 'Total energy',
      rEnergyExp: 'Expected energy (N−1)·ħω/2',
      rSpread: 'Δx(t)/Δx(0) vs √(1+ω²t²)',
      legend: 'Legend',
      legWorld: 'World line (one copy of the particle)',
      legChosen: 'World drawn by the measurement',
      legDiscarded: 'Discarded worlds: they evolve on their own',
      legDensity: 'Density of worlds (histogram)',
      legTheory: 'Expected quantum density |ψ|²',
      axisTime: 't',
      axisX: 'x',
      ttWorld: 'World {i}',
      ttPosition: 'position x',
      ttVelocity: 'velocity v',
      graphAria: 'World lines of the N copies of the particle, time horizontal and position vertical, with the histogram of the world density below',
      docNote: 'Guide and checks: <a href="../../../docs/quantum-mechanics/many-interacting-worlds-simulation-guide.en.md">docs/quantum-mechanics/many-interacting-worlds-simulation-guide.en.md</a>; theory and references: <a href="../../../docs/quantum-mechanics/many-interacting-worlds-theory.en.md">docs/quantum-mechanics/many-interacting-worlds-theory.en.md</a>.'
    }
  };

  var current = 'it';

  function t(key, vars) {
    var s = (DICT[current] && DICT[current][key]) || DICT.it[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
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

  /* Returns the keys missing from any language ('lang:key'); empty when the dictionaries match. */
  function check() {
    var missing = [], langs = Object.keys(DICT);
    langs.forEach(function (a) {
      Object.keys(DICT[a]).forEach(function (key) {
        langs.forEach(function (b) { if (!(key in DICT[b])) missing.push(b + ':' + key); });
      });
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
