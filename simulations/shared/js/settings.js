/*
 * settings.js: language and theme overlay shared by every simulation (gear button,
 * top right). Choices are stored under the same keys for all simulations; ?lang= in
 * the URL overrides the stored language.
 *
 * Needs the page's I18n with the keys settings, language, theme, themeSystem, themeLight,
 * themeDark. Settings.init(onChange) applies the stored choices and returns the resolved
 * theme ('light' or 'dark'); onChange(theme) is called after every later change, so the
 * page can redraw what is not styled by CSS (canvas, WebGL) and re-translate dynamic text.
 */
(function (root) {
  'use strict';

  var STORAGE = { lang: 'realitymodels.lang', theme: 'realitymodels.theme' };
  var GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';

  function stored(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode or blocked storage */ } }

  function init(onChange) {
    var overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML =
      '<button type="button" class="settings-toggle" aria-expanded="false" aria-controls="settingsPanel">' + GEAR + '</button>' +
      '<div id="settingsPanel" class="settings-panel" role="dialog" aria-labelledby="settingsTitle" hidden>' +
      '<h2 id="settingsTitle" data-i18n="settings"></h2>' +
      '<label for="settingsLanguage" data-i18n="language"></label><select id="settingsLanguage"></select>' +
      '<label for="settingsTheme" data-i18n="theme"></label><select id="settingsTheme">' +
      '<option value="system" data-i18n="themeSystem"></option>' +
      '<option value="light" data-i18n="themeLight"></option>' +
      '<option value="dark" data-i18n="themeDark"></option></select></div>';
    document.body.appendChild(overlay);

    var toggle = overlay.querySelector('.settings-toggle');
    var panel = overlay.querySelector('.settings-panel');
    var language = overlay.querySelector('#settingsLanguage');
    var theme = overlay.querySelector('#settingsTheme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    I18n.languages().forEach(function (l) {
      var option = document.createElement('option');
      option.value = l.code;
      option.textContent = l.name;
      language.appendChild(option);
    });

    function translate() {
      I18n.apply();
      toggle.setAttribute('aria-label', I18n.t('settings'));
      toggle.title = I18n.t('settings');
    }
    function resolvedTheme() {
      return theme.value === 'dark' || (theme.value === 'system' && systemDark.matches) ? 'dark' : 'light';
    }
    function applyTheme() {
      document.documentElement.dataset.theme = resolvedTheme();
      return resolvedTheme();
    }
    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) language.focus();
    }

    var qs = new URLSearchParams(location.search);
    language.value = I18n.setLanguage(qs.get('lang') || stored(STORAGE.lang) || (navigator.language || 'it').slice(0, 2));
    theme.value = stored(STORAGE.theme) || 'system';
    translate();

    language.addEventListener('change', function () {
      I18n.setLanguage(language.value);
      store(STORAGE.lang, language.value);
      translate();
      onChange(resolvedTheme());
    });
    theme.addEventListener('change', function () {
      store(STORAGE.theme, theme.value);
      onChange(applyTheme());
    });
    systemDark.addEventListener('change', function () {
      if (theme.value === 'system') onChange(applyTheme());
    });
    toggle.addEventListener('click', function () { setOpen(panel.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('pointerdown', function (e) {
      if (!panel.hidden && !overlay.contains(e.target)) setOpen(false);
    });

    return applyTheme();
  }

  root.Settings = { init: init };
})(typeof self !== 'undefined' ? self : this);
