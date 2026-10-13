/*
 * i18n.js: UI dictionaries (Italian default, English). Every user-visible string
 * lives here; the markup only carries data-i18n / data-i18n-html keys.
 */
(function (root) {
  'use strict';

  var DICT = {
    it: {
      name: 'Italiano',
      title: 'Censimento delle macchine di Turing',
      heading: 'Censimento delle macchine di Turing',
      intro: 'Tutte le macchine di Turing con <b>n</b> stati e 2 simboli partono dal nastro vuoto; delle macchine che si fermano si registra la stringa delle celle visitate. Le stringhe corte e regolari escono da molte più macchine di quelle lunghe e irregolari: le frequenze approssimano la <b>probabilità algoritmica</b> della distribuzione universale di Solomonoff e Levin. Nessuna stringa è privilegiata in partenza: la gerarchia emerge dal solo contare.',
      settings: 'Impostazioni',
      language: 'Lingua',
      theme: 'Tema',
      themeSystem: 'Sistema',
      themeLight: 'Chiaro',
      themeDark: 'Scuro',
      parameters: 'Parametri',
      statesLabel: 'Stati',
      states2: '2 stati',
      states3: '3 stati',
      states4: '4 stati',
      modeNoteFull: 'Censimento esatto: tutte le {total} macchine vengono enumerate. Una macchina che supera S({n}) = {cap} passi sul nastro vuoto non si ferma mai.',
      modeNoteSample: 'Con 4 stati le macchine sono {total}: troppe da enumerare. Si estrae un campione casuale riproducibile dal seme, con limite di S(4) = 107 passi.',
      seedLabel: 'Seme casuale',
      samplesLabel: 'Macchine campionate',
      run: 'Esecuzione',
      play: '▶ Riprendi',
      pause: '❙❙ Pausa',
      done: '✓ Censimento completo',
      scale: 'Scala',
      scaleLin: 'Lineare',
      scaleLog: 'Logaritmica',
      readings: 'Letture',
      rMachines: 'Macchine eseguite / totali',
      rHalting: 'Macchine che si fermano',
      rDistinct: 'Stringhe distinte',
      rLongest: 'Corsa più lunga / limite S(n)',
      rTop: 'Stringa più frequente',
      legend: 'Legenda',
      legBar: 'Barra: una stringa prodotta; altezza = quota delle macchine che si fermano',
      legColour: 'Colore = lunghezza della stringa (la scala satura a 5)',
      legStrip: 'Striscia in basso: quota totale per lunghezza',
      legAccent: 'Barra sotto il puntatore; contorno pieno = stringa speculare, tratteggiato = complemento 0↔1',
      docNote: 'Modello e verifiche: <a href="../../../docs/foundations/algorithmic-probability-simulation-guide.it.md">docs/foundations/algorithmic-probability-simulation-guide.it.md</a>; teoria e bibliografia: <a href="../../../docs/foundations/algorithmic-probability-theory.it.md">docs/foundations/algorithmic-probability-theory.it.md</a>.',
      barTitle: 'Stringhe prodotte ({shown} di {distinct})',
      lenTitle: 'Quota per lunghezza',
      axisShare: 'quota delle macchine che si fermano',
      ttShare: 'Quota',
      ttMachines: 'Macchine',
      ttRank: 'Posizione',
      ttBits: 'Complessità stimata (bit)',
      ttMirror: 'Speculare {s}',
      ttComplement: 'Complemento {s}',
      graphAria: 'Istogramma delle stringhe prodotte dalle macchine di Turing che si fermano: altezza = quota, colore = lunghezza della stringa; sotto, la quota totale per ogni lunghezza.'
    },
    en: {
      name: 'English',
      title: 'A census of Turing machines',
      heading: 'A census of Turing machines',
      intro: 'Every Turing machine with <b>n</b> states and 2 symbols starts on a blank tape; for the machines that halt, the string of visited cells is recorded. Short regular strings come out of many more machines than long irregular ones: the frequencies approximate the <b>algorithmic probability</b> of the Solomonoff-Levin universal distribution. No string is privileged at the start: the hierarchy emerges from counting alone.',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      parameters: 'Parameters',
      statesLabel: 'States',
      states2: '2 states',
      states3: '3 states',
      states4: '4 states',
      modeNoteFull: 'Exact census: all {total} machines are enumerated. A machine that goes past S({n}) = {cap} steps on the blank tape never halts.',
      modeNoteSample: 'With 4 states there are {total} machines: too many to enumerate. A reproducible random sample is drawn from the seed, capped at S(4) = 107 steps.',
      seedLabel: 'Random seed',
      samplesLabel: 'Sampled machines',
      run: 'Run',
      play: '▶ Resume',
      pause: '❙❙ Pause',
      done: '✓ Census complete',
      scale: 'Scale',
      scaleLin: 'Linear',
      scaleLog: 'Logarithmic',
      readings: 'Readings',
      rMachines: 'Machines run / total',
      rHalting: 'Halting machines',
      rDistinct: 'Distinct strings',
      rLongest: 'Longest run / cap S(n)',
      rTop: 'Most frequent string',
      legend: 'Legend',
      legBar: 'Bar: one output string; height = share of the halting machines',
      legColour: 'Colour = length of the string (the scale saturates at 5)',
      legStrip: 'Bottom strip: total share per length',
      legAccent: 'Bar under the pointer; solid outline = mirrored string, dashed = 0↔1 complement',
      docNote: 'Model and checks: <a href="../../../docs/foundations/algorithmic-probability-simulation-guide.en.md">docs/foundations/algorithmic-probability-simulation-guide.en.md</a>; theory and bibliography: <a href="../../../docs/foundations/algorithmic-probability-theory.en.md">docs/foundations/algorithmic-probability-theory.en.md</a>.',
      barTitle: 'Output strings ({shown} of {distinct})',
      lenTitle: 'Share by length',
      axisShare: 'share of halting machines',
      ttShare: 'Share',
      ttMachines: 'Machines',
      ttRank: 'Rank',
      ttBits: 'Estimated complexity (bits)',
      ttMirror: 'Mirror {s}',
      ttComplement: 'Complement {s}',
      graphAria: 'Histogram of the strings produced by the halting Turing machines: height = share, colour = string length; below, the total share per length.'
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
