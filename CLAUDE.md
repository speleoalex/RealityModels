# CLAUDE.md

Guidance for Claude Code in this repository.

## Coding rules

Follow `~/_agents/direttive_codice.md` (security, English identifiers and comments,
minimal code, no dead code or duplication, few dependencies, responsive UI, i18n,
light/dark theme, docs checked against code). That file is the source; do not copy
its rules here. `/refactor-plan` runs the audit described in its section 9.

Docs, comments and UI text must read as human: no em dashes, no padded phrasing.

## What this is

Static physics simulations (relativity, quantum mechanics) with bilingual docs.
Overview, list of simulations and directory layout: [README.md](README.md).

- No build, no package manager, no server. Each `simulations/<subject>/<name>/index.html`
  opens from `file://` with a double click.
- Everything is local and offline: three.js r121 and OrbitControls live in
  `simulations/shared/lib/`. Never add CDN or other remote resources.
- Not a PWA: service workers do not run on `file://`, so section 7 of the
  directives does not apply unless that changes.

## Code layout per simulation

Plain ES5 scripts loaded in order by `index.html`, no modules:

1. `../../shared/lib/three.min.js`, `OrbitControls.js` (3D simulations only)
2. `js/i18n.js`: global `I18n`, dictionaries `it` and `en`
3. `../../shared/js/settings.js`: global `Settings`, gear panel for language and theme
4. `js/physics.js` or `js/model.js`: pure math, UMD wrapper, no DOM or three.js
5. `js/scene.js` or `js/graph.js`: rendering
6. `js/app.js`: wiring of controls, readings, query string

Conventions to keep:

- Every UI string goes in `i18n.js`, in both languages. Markup uses `data-i18n`
  (textContent) or `data-i18n-html` (innerHTML, only for dictionary strings).
  `I18n.check()` must return an empty array.
- Theme: CSS variables on `:root`, overridden in `:root[data-theme="dark"]`.
  `Settings.init(onChange)` sets `data-theme`; canvas and WebGL colours are redrawn
  in `onChange`. Language and theme are stored in `localStorage` under
  `realitymodels.lang` and `realitymodels.theme`, shared by all simulations.
- Parameters are mirrored in the query string so a configuration can be shared.
- Physics and model code stays free of DOM and three.js so it can run in Node.

## Checks

No test suite. The numerical checks are the `node -e` one-liners in the guides:

- `docs/relativity/block-universe-simulations-guide.en.md`, "Numerical check"
- `docs/quantum-mechanics/many-worlds-simulation-guide.en.md`, "Verification"

Run them after touching `physics.js`, `model.js` or `i18n.js`, and check the page in
a browser in both themes, both languages and at phone width.

## Docs

- Every doc exists in `.it.md` and `.en.md`; `README.md` and `README.it.md` likewise.
  A change goes into both languages in the same edit.
- Theory files hold formulas and references, guide files hold usage, parameters and
  checks. Do not repeat content between them: link.
- When code changes a control, parameter, file name or command, update the guide
  that cites it.
