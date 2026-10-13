/*
 * i18n.js: UI dictionaries (Italian default, English). Every user-visible string
 * lives here; the markup only carries data-i18n / data-i18n-html keys.
 */
(function (root) {
  'use strict';

  var DICT = {
    it: {
      name: 'Italiano',
      title: 'Multiverso con convergenze',
      heading: 'Multiverso con convergenze',
      intro: 'Nell’interpretazione a molti mondi ogni misura con <b>N</b> esiti sdoppia il mondo in N rami: un albero con N<sup>t</sup> mondi dopo t misure. Qui si ipotizza che due rami con lo stesso <em>record</em> (la stessa somma degli esiti) siano lo stesso mondo e tornino a <b>convergere</b>: la struttura diventa un reticolo e le ampiezze dei rami che si riuniscono possono <b>interferire</b>.',
      settings: 'Impostazioni',
      language: 'Lingua',
      theme: 'Tema',
      themeSystem: 'Sistema',
      themeLight: 'Chiaro',
      themeDark: 'Scuro',
      parameters: 'Parametri',
      outcomesLabel: 'Esiti per misura N',
      stepsLabel: 'Misure T',
      stepsTreeNote: 'Nella vista ad albero T è limitato a {max} (massimo 4096 mondi disegnati).',
      disorderLabel: 'Disordine di fase D',
      seedLabel: 'Seme casuale',
      regime: 'Regime',
      regimeTree: 'Albero',
      regimeClassical: 'Convergenza classica',
      regimeQuantum: 'Convergenza quantistica',
      regimeNoteTree: 'Ogni misura sdoppia ogni mondo: N<sup>t</sup> mondi distinti. Passando il puntatore su un mondo si evidenziano quelli che avrebbero lo stesso record.',
      regimeNoteClassical: 'I mondi con lo stesso record si fondono e le loro probabilità si sommano: il numero di nodi cresce come (N−1)·t+1 e la distribuzione è una campana di larghezza √t.',
      regimeNoteQuantum: 'I mondi con lo stesso record si fondono e le loro <b>ampiezze</b> si sommano (cammino quantistico con moneta DFT, evoluzione unitaria): alcuni rami si cancellano, altri si rinforzano e la distribuzione si allarga come t.',
      time: 'Tempo',
      stepLabel: 'Misura mostrata t',
      play: '▶ Avvia',
      pause: '❙❙ Pausa',
      view: 'Vista',
      viewGraph: 'Grafico',
      viewTable: 'Tabella',
      readings: 'Letture al passo t',
      rWorldsTree: 'Mondi dell’albero N<sup>t</sup>',
      rDistinct: 'Mondi distinti (nodi)',
      rEffClassical: 'Mondi effettivi 1/Σp² (classico)',
      rEffQuantum: 'Mondi effettivi 1/Σp² (quantistico)',
      rSigmaClassical: 'Larghezza σ (classico)',
      rSigmaQuantum: 'Larghezza σ (quantistico)',
      rSuppressedEdges: 'Rami cancellati per interferenza',
      rSuppressedNodes: 'Mondi a probabilità nulla',
      legend: 'Legenda',
      legNode: 'Mondo: dimensione e colore crescono con la probabilità',
      legEdge: 'Ramo: opacità proporzionale al flusso di probabilità',
      legSuppressed: 'Mondo o ramo cancellato dall’interferenza',
      legHighlight: 'Mondo sotto il puntatore e rami che vi convergono',
      legHistogram: 'Istogramma: distribuzione al passo t; contorno arancione = caso classico',
      docNote: 'Modello e formule: <a href="../../../docs/quantum-mechanics/many-worlds-simulation-guide.it.md">docs/quantum-mechanics/many-worlds-simulation-guide.it.md</a>; teoria e bibliografia: <a href="../../../docs/quantum-mechanics/many-worlds-convergence-theory.it.md">docs/quantum-mechanics/many-worlds-convergence-theory.it.md</a>.',
      axisTime: 'misura t',
      axisState: 'record x = 2k − (N−1)·t',
      axisWorlds: 'mondi',
      ttStep: 'Passo {t}',
      ttState: 'Record x',
      ttPath: 'Esiti',
      ttPaths: 'Sequenze di esiti',
      ttSameState: 'Mondi con lo stesso record',
      ttPClassical: 'p classica',
      ttPQuantum: 'p quantistica',
      ttProbability: 'Probabilità',
      thState: 'Record x',
      thPaths: 'Sequenze',
      thPClassical: 'p classica',
      thPQuantum: 'p quantistica',
      thRatio: 'Rapporto q/c',
      histTitle: 'Distribuzione al passo {t}',
      histMax: 'p massima = {p}',
      graphAria: 'Grafico del multiverso: tempo in orizzontale, record in verticale, nodi e rami colorati secondo la probabilità'
    },
    en: {
      name: 'English',
      title: 'Multiverse with convergences',
      heading: 'Multiverse with convergences',
      intro: 'In the many-worlds interpretation every measurement with <b>N</b> outcomes splits the world into N branches: a tree with N<sup>t</sup> worlds after t measurements. Here we assume that two branches with the same <em>record</em> (the same sum of outcomes) are the same world and <b>converge</b> again: the structure becomes a lattice and the amplitudes of the merging branches can <b>interfere</b>.',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      parameters: 'Parameters',
      outcomesLabel: 'Outcomes per measurement N',
      stepsLabel: 'Measurements T',
      stepsTreeNote: 'In the tree view T is limited to {max} (at most 4096 drawn worlds).',
      disorderLabel: 'Phase disorder D',
      seedLabel: 'Random seed',
      regime: 'Regime',
      regimeTree: 'Tree',
      regimeClassical: 'Classical convergence',
      regimeQuantum: 'Quantum convergence',
      regimeNoteTree: 'Every measurement splits every world: N<sup>t</sup> distinct worlds. Hovering a world highlights the ones that would share its record.',
      regimeNoteClassical: 'Worlds with the same record merge and their probabilities add: the number of nodes grows as (N−1)·t+1 and the distribution is a bell of width √t.',
      regimeNoteQuantum: 'Worlds with the same record merge and their <b>amplitudes</b> add (quantum walk with the DFT coin, unitary evolution): some branches cancel, others reinforce and the distribution spreads as t.',
      time: 'Time',
      stepLabel: 'Displayed measurement t',
      play: '▶ Play',
      pause: '❙❙ Pause',
      view: 'View',
      viewGraph: 'Graph',
      viewTable: 'Table',
      readings: 'Readings at step t',
      rWorldsTree: 'Tree worlds N<sup>t</sup>',
      rDistinct: 'Distinct worlds (nodes)',
      rEffClassical: 'Effective worlds 1/Σp² (classical)',
      rEffQuantum: 'Effective worlds 1/Σp² (quantum)',
      rSigmaClassical: 'Spread σ (classical)',
      rSigmaQuantum: 'Spread σ (quantum)',
      rSuppressedEdges: 'Branches cancelled by interference',
      rSuppressedNodes: 'Worlds with zero probability',
      legend: 'Legend',
      legNode: 'World: size and colour grow with probability',
      legEdge: 'Branch: opacity proportional to the probability flow',
      legSuppressed: 'World or branch cancelled by interference',
      legHighlight: 'World under the pointer and branches converging into it',
      legHistogram: 'Histogram: distribution at step t; orange outline = classical case',
      docNote: 'Model and formulas: <a href="../../../docs/quantum-mechanics/many-worlds-simulation-guide.en.md">docs/quantum-mechanics/many-worlds-simulation-guide.en.md</a>; theory and references: <a href="../../../docs/quantum-mechanics/many-worlds-convergence-theory.en.md">docs/quantum-mechanics/many-worlds-convergence-theory.en.md</a>.',
      axisTime: 'measurement t',
      axisState: 'record x = 2k − (N−1)·t',
      axisWorlds: 'worlds',
      ttStep: 'Step {t}',
      ttState: 'Record x',
      ttPath: 'Outcomes',
      ttPaths: 'Outcome sequences',
      ttSameState: 'Worlds with the same record',
      ttPClassical: 'classical p',
      ttPQuantum: 'quantum p',
      ttProbability: 'Probability',
      thState: 'Record x',
      thPaths: 'Sequences',
      thPClassical: 'classical p',
      thPQuantum: 'quantum p',
      thRatio: 'Ratio q/c',
      histTitle: 'Distribution at step {t}',
      histMax: 'max p = {p}',
      graphAria: 'Multiverse graph: time horizontally, record vertically, nodes and branches coloured by probability'
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
