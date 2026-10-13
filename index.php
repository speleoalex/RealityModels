<?php
/*
 * index.php: single-file web front end for RealityModels.
 * Lists the simulations and the documents found on disk, shows each simulation in a
 * frame and each Markdown document as a page. Nothing to configure: upload the project
 * to any PHP 7.4+ host and open this file. The Markdown reader is built in, no libraries.
 *
 *   index.php                        home
 *   index.php?sim=<subject>/<name>   a simulation
 *   index.php?doc=<subject>/<name>   a document (or README)
 *   &lang=it|en                      language, remembered in a cookie
 */
declare(strict_types=1);

const LANGS = ['it' => 'Italiano', 'en' => 'English'];
const SUBJECT_ORDER = ['relativity', 'quantum-mechanics', 'foundations'];
const ICON_SIMULATION = '🧪';
const ICON_DOCUMENT = '📄';
const THEME_KEY = 'realitymodels.theme'; // same key as simulations/shared/js/settings.js

const UI = [
    'it' => [
        'intro' => 'Simulazioni visive di teorie e interpretazioni della realtà: universo a blocco, molti mondi, meccanica quantistica. Ogni simulazione gira nel browser, senza installazione.',
        'menu' => 'Menu', 'home' => 'Indice', 'simulations' => 'Simulazioni', 'documents' => 'Documenti',
        'readme' => 'Presentazione del progetto', 'language' => 'Lingua', 'theme' => 'Tema',
        'themeSystem' => 'Sistema', 'themeLight' => 'Chiaro', 'themeDark' => 'Scuro',
        'fullscreen' => 'Apri a schermo intero', 'singleFile' => 'Versione in un solo file',
        'notFound' => 'Pagina non trovata', 'otherLanguage' => 'Questo documento non esiste nella lingua scelta.',
        'subject' => ['relativity' => 'Relatività', 'quantum-mechanics' => 'Meccanica quantistica', 'foundations' => 'Fondamenti'],
    ],
    'en' => [
        'intro' => 'Visual simulations of theories and interpretations of reality: block universe, many worlds, quantum mechanics. Every simulation runs in the browser, nothing to install.',
        'menu' => 'Menu', 'home' => 'Index', 'simulations' => 'Simulations', 'documents' => 'Documents',
        'readme' => 'Project overview', 'language' => 'Language', 'theme' => 'Theme',
        'themeSystem' => 'System', 'themeLight' => 'Light', 'themeDark' => 'Dark',
        'fullscreen' => 'Open full screen', 'singleFile' => 'Single-file version',
        'notFound' => 'Page not found', 'otherLanguage' => 'This document does not exist in the chosen language.',
        'subject' => ['relativity' => 'Relativity', 'quantum-mechanics' => 'Quantum mechanics', 'foundations' => 'Foundations'],
    ],
];

function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/* ---------- language ---------- */

function pickLanguage(): string
{
    foreach ([$_GET['lang'] ?? null, $_COOKIE['rm_lang'] ?? null] as $candidate) {
        if (is_string($candidate) && isset(LANGS[$candidate])) {
            return $candidate;
        }
    }
    $header = strtolower((string) ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? ''));
    return strpos($header, 'it') === 0 ? 'it' : 'en';
}

/* ---------- catalog of what is on disk ---------- */

/** True if the real path of $path (symlinks resolved) is inside the project directory. */
function insideProject(string $path): bool
{
    $real = realpath($path);
    $root = realpath(__DIR__);
    return $real !== false && strpos($real, $root . DIRECTORY_SEPARATOR) === 0;
}

/** Subjects, simulations and documents come from the directory tree, never from user input. */
function catalog(): array
{
    $root = __DIR__;
    $sims = [];
    foreach (glob($root . '/simulations/*/*/index.html') ?: [] as $file) {
        $dir = dirname($file);
        if (!insideProject($file)) {
            continue;
        }
        $sims[basename(dirname($dir))][basename($dir)] = $dir;
    }
    $docs = [];
    foreach (glob($root . '/docs/*/*.md') ?: [] as $file) {
        if (insideProject($file) && preg_match('/^(.+)\.(it|en)\.md$/', basename($file), $m)) {
            $docs[basename(dirname($file))][$m[1]][$m[2]] = $file;
        }
    }
    $subjects = array_unique(array_merge(array_keys($sims), array_keys($docs)));
    usort($subjects, function ($a, $b) {
        $pa = array_search($a, SUBJECT_ORDER, true);
        $pb = array_search($b, SUBJECT_ORDER, true);
        return [$pa === false ? 99 : $pa, $a] <=> [$pb === false ? 99 : $pb, $b];
    });
    return ['subjects' => $subjects, 'sims' => $sims, 'docs' => $docs];
}

function icon(string $symbol): string
{
    return '<span class="icon" aria-hidden="true">' . $symbol . '</span>';
}

function subjectLabel(string $subject, string $lang): string
{
    return UI[$lang]['subject'][$subject] ?? ucfirst(str_replace('-', ' ', $subject));
}

/** Title shown by the simulation itself, read from its i18n dictionary. */
function simulationTitle(string $dir, string $name, string $lang): string
{
    $i18n = $dir . '/js/i18n.js';
    $js = insideProject($i18n) ? (string) file_get_contents($i18n) : '';
    $pattern = '/\b' . $lang . '\s*:\s*\{[^}]*?\btitle\s*:\s*\'((?:[^\'\\\\]|\\\\.)*)\'/s';
    if (preg_match($pattern, $js, $m)) {
        return stripslashes($m[1]);
    }
    return ucfirst(str_replace('-', ' ', $name));
}

/** Picks the file for the language, falling back to any other language. */
function pickDocument(array $variants, string $lang): array
{
    $actual = isset($variants[$lang]) ? $lang : (isset($variants['en']) ? 'en' : (string) array_key_first($variants));
    return [$variants[$actual], $actual];
}

function documentTitle(string $file, string $fallback): string
{
    foreach (file($file, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
        if (preg_match('/^#\s+(.+)$/', $line, $m)) {
            return trim($m[1]);
        }
    }
    return $fallback;
}

/* ---------- Markdown ---------- */

/** Turns a link target found in a Markdown file into a URL of this page, or a plain path. */
function resolveLink(string $href, string $baseDir): string
{
    if (preg_match('~^(https?:|mailto:|#)~i', $href)) {
        return $href;
    }
    $fragment = '';
    if (($pos = strpos($href, '#')) !== false) {
        $fragment = substr($href, $pos);
        $href = substr($href, 0, $pos);
    }
    $parts = [];
    foreach (explode('/', $baseDir . '/' . $href) as $segment) {
        if ($segment === '..') {
            array_pop($parts);
        } elseif ($segment !== '' && $segment !== '.') {
            $parts[] = $segment;
        }
    }
    $path = implode('/', $parts);
    if (preg_match('~^docs/([^/]+)/(.+)\.(it|en)\.md$~', $path, $m)) {
        return '?doc=' . $m[1] . '/' . $m[2] . '&lang=' . $m[3] . $fragment;
    }
    if (preg_match('~^README(?:\.(it|en))?\.md$~', $path, $m)) {
        return '?doc=README&lang=' . (($m[1] ?? '') ?: 'en') . $fragment;
    }
    if (preg_match('~^simulations/([^/]+)/([^/]+)/index\.html$~', $path, $m)) {
        return '?sim=' . $m[1] . '/' . $m[2] . $fragment;
    }
    return $path . $fragment;
}

function inlineMarkdown(string $text, string $baseDir): string
{
    $codes = [];
    $text = preg_replace_callback('/`([^`]+)`/', function ($m) use (&$codes) {
        $codes[] = '<code>' . e($m[1]) . '</code>';
        return "\0" . (count($codes) - 1) . "\0";
    }, $text);
    $text = e($text);
    $text = preg_replace_callback('/\[([^\]]+)\]\(([^)\s]+)\)/', function ($m) use ($baseDir) {
        $href = resolveLink(html_entity_decode($m[2], ENT_QUOTES), $baseDir);
        $external = preg_match('~^https?:~i', $href) ? ' target="_blank" rel="noopener noreferrer"' : '';
        return '<a href="' . e($href) . '"' . $external . '>' . $m[1] . '</a>';
    }, $text);
    $text = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $text);
    $text = preg_replace('/(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])/s', '<em>$1</em>', $text);
    return preg_replace_callback('/\0(\d+)\0/', function ($m) use ($codes) {
        return $codes[(int) $m[1]];
    }, $text);
}

function slug(string $heading): string
{
    $s = mb_strtolower(strip_tags(preg_replace('/[`*]/', '', $heading)), 'UTF-8');
    return str_replace(' ', '-', trim(preg_replace('/[^\p{L}\p{N} -]/u', '', $s)));
}

function isBlockStart(string $line): bool
{
    return (bool) preg_match('/^(```|#{1,6}\s|>|\||\s*([-*]|\d+\.)\s|(-{3,}|\*{3,})$)/', $line);
}

function tableRow(string $line, string $tag, string $baseDir): string
{
    $cells = explode('|', trim(trim($line), '|'));
    $out = '';
    foreach ($cells as $cell) {
        $out .= "<$tag>" . inlineMarkdown(trim($cell), $baseDir) . "</$tag>";
    }
    return '<tr>' . $out . '</tr>';
}

/** Renders the Markdown subset used by the project documents: headings, paragraphs, lists, tables, code, quotes. */
function markdown(string $source, string $baseDir): string
{
    $lines = explode("\n", str_replace("\r", '', $source));
    $count = count($lines);
    $html = '';
    for ($i = 0; $i < $count;) {
        $line = $lines[$i];
        if (trim($line) === '') {
            $i++;
        } elseif (strpos(ltrim($line), '```') === 0) {
            $indent = strlen($line) - strlen(ltrim($line));
            $code = [];
            for ($i++; $i < $count && strpos(ltrim($lines[$i]), '```') !== 0; $i++) {
                $code[] = substr($lines[$i], min($indent, strlen($lines[$i]) - strlen(ltrim($lines[$i]))));
            }
            $i++;
            $html .= '<pre><code>' . e(implode("\n", $code)) . '</code></pre>';
        } elseif (preg_match('/^(#{1,6})\s+(.+)$/', $line, $m)) {
            $level = strlen($m[1]);
            $html .= "<h$level id=\"" . e(slug($m[2])) . "\">" . inlineMarkdown($m[2], $baseDir) . "</h$level>";
            $i++;
        } elseif (preg_match('/^(-{3,}|\*{3,})$/', trim($line))) {
            $html .= '<hr>';
            $i++;
        } elseif ($line[0] === '|' && $i + 1 < $count && preg_match('/^\|[\s:|-]+$/', $lines[$i + 1])) {
            $html .= '<div class="table-wrap"><table><thead>' . tableRow($line, 'th', $baseDir) . '</thead><tbody>';
            for ($i += 2; $i < $count && ($lines[$i][0] ?? '') === '|'; $i++) {
                $html .= tableRow($lines[$i], 'td', $baseDir);
            }
            $html .= '</tbody></table></div>';
        } elseif ($line[0] === '>') {
            $quote = [];
            for (; $i < $count && ($lines[$i][0] ?? '') === '>'; $i++) {
                $quote[] = preg_replace('/^>\s?/', '', $lines[$i]);
            }
            $html .= '<blockquote>' . markdown(implode("\n", $quote), $baseDir) . '</blockquote>';
        } elseif (preg_match('/^(\s*)([-*]|\d+\.)\s+/', $line)) {
            $html .= listMarkdown($lines, $i, $baseDir);
        } else {
            $paragraph = [];
            for (; $i < $count && trim($lines[$i]) !== '' && ($paragraph === [] || !isBlockStart($lines[$i])); $i++) {
                $paragraph[] = trim($lines[$i]);
            }
            $html .= '<p>' . inlineMarkdown(implode("\n", $paragraph), $baseDir) . '</p>';
        }
    }
    return $html;
}

/** Reads one list starting at $i (advancing it); items may hold nested blocks such as code. */
function listMarkdown(array $lines, int &$i, string $baseDir): string
{
    $count = count($lines);
    preg_match('/^(\s*)([-*]|\d+\.)\s+/', $lines[$i], $first);
    $indent = strlen($first[1]);
    $tag = ctype_digit($first[2][0]) ? 'ol' : 'ul';
    $html = "<$tag>";
    while ($i < $count && preg_match('/^(\s*)([-*]|\d+\.)(\s+)(.*)$/', $lines[$i], $m) && strlen($m[1]) === $indent) {
        $body = [$m[4]];
        $contentIndent = $indent + strlen($m[2]) + strlen($m[3]);
        for ($i++; $i < $count; $i++) {
            $next = $lines[$i];
            $nextIndent = strlen($next) - strlen(ltrim($next));
            if (trim($next) === '') {
                // a blank line belongs to the item only if indented content follows
                $j = $i;
                while ($j < $count && trim($lines[$j]) === '') {
                    $j++;
                }
                if ($j >= $count || strlen($lines[$j]) - strlen(ltrim($lines[$j])) < $contentIndent) {
                    break;
                }
                $body[] = '';
            } elseif ($nextIndent >= $contentIndent) {
                $body[] = substr($next, $contentIndent);
            } elseif ($nextIndent > $indent || !isBlockStart($next)) {
                $body[] = ltrim($next); // lazy continuation of the item text
            } else {
                break;
            }
        }
        $inner = markdown(implode("\n", $body), $baseDir);
        if (substr_count($inner, '<p>') === 1 && preg_match('~^<p>(.*)</p>~s', $inner, $p) && strpos($inner, '</p>') === strlen($p[0]) - 4) {
            $inner = $p[1] . substr($inner, strlen($p[0]));
        }
        $html .= '<li>' . $inner . '</li>';
    }
    return $html . "</$tag>";
}

/* ---------- pages ---------- */

function homeBody(array $catalog, string $lang): string
{
    $ui = UI[$lang];
    $html = '<h1>RealityModels</h1><p class="lead">' . e($ui['intro']) . '</p>';
    $html .= '<p><a href="?doc=README">' . e($ui['readme']) . '</a></p>';
    foreach ($catalog['subjects'] as $subject) {
        $html .= '<section><h2>' . e(subjectLabel($subject, $lang)) . '</h2>';
        if (!empty($catalog['sims'][$subject])) {
            $html .= '<h3>' . e($ui['simulations']) . '</h3><ul class="cards">';
            foreach ($catalog['sims'][$subject] as $name => $dir) {
                $html .= '<li><a href="?sim=' . e($subject . '/' . $name) . '">' . icon(ICON_SIMULATION) . e(simulationTitle($dir, $name, $lang)) . '</a></li>';
            }
            $html .= '</ul>';
        }
        if (!empty($catalog['docs'][$subject])) {
            $html .= '<h3>' . e($ui['documents']) . '</h3><ul class="cards">';
            foreach ($catalog['docs'][$subject] as $name => $variants) {
                [$file] = pickDocument($variants, $lang);
                $html .= '<li><a href="?doc=' . e($subject . '/' . $name) . '">' . icon(ICON_DOCUMENT) . e(documentTitle($file, $name)) . '</a></li>';
            }
            $html .= '</ul>';
        }
        $html .= '</section>';
    }
    return $html;
}

function menuBody(array $catalog, string $lang): string
{
    $ui = UI[$lang];
    $html = '<a href="?" class="menu-home">' . e($ui['home']) . '</a>';
    foreach ($catalog['subjects'] as $subject) {
        $html .= '<h2>' . e(subjectLabel($subject, $lang)) . '</h2><ul>';
        foreach ($catalog['sims'][$subject] ?? [] as $name => $dir) {
            $html .= '<li><a href="?sim=' . e($subject . '/' . $name) . '">' . icon(ICON_SIMULATION) . e(simulationTitle($dir, $name, $lang)) . '</a></li>';
        }
        foreach ($catalog['docs'][$subject] ?? [] as $name => $variants) {
            [$file] = pickDocument($variants, $lang);
            $html .= '<li class="doc"><a href="?doc=' . e($subject . '/' . $name) . '">' . icon(ICON_DOCUMENT) . e(documentTitle($file, $name)) . '</a></li>';
        }
        $html .= '</ul>';
    }
    return $html;
}

function simulationBody(string $subject, string $name, string $dir, string $lang): string
{
    $ui = UI[$lang];
    $src = 'simulations/' . $subject . '/' . $name . '/index.html?lang=' . $lang;
    $links = '<a href="' . e($src) . '">' . e($ui['fullscreen']) . '</a>';
    if (insideProject($dir . '/' . $name . '.standalone.html')) {
        $links .= ' <a href="simulations/' . e($subject . '/' . $name . '/' . $name) . '.standalone.html">' . e($ui['singleFile']) . '</a>';
    }
    return '<div class="sim-links">' . $links . '</div><iframe id="sim" src="' . e($src) . '" title="' . e(simulationTitle($dir, $name, $lang)) . '"></iframe>';
}

function renderPage(string $title, string $body, string $menu, string $lang, string $self, bool $isSimulation, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src 'self'");
    $ui = UI[$lang];
    $languageLinks = '';
    foreach (LANGS as $code => $label) {
        $current = $code === $lang ? ' aria-current="true"' : '';
        $languageLinks .= '<a href="' . e($self . (strpos($self, '?') === false ? '?' : '&') . 'lang=' . $code) . '" lang="' . $code . '"' . $current . '>' . e($label) . '</a>';
    }
    ?>
<!DOCTYPE html>
<html lang="<?= e($lang) ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title><?= e($title) ?></title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Crect x=%271%27 y=%271%27 width=%2714%27 height=%2714%27 rx=%272%27 fill=%27%233a6ea5%27/%3E%3Cpath d=%27M4 13 L9 3 L12 3 L7 13 Z%27 fill=%27%23e07b1a%27/%3E%3C/svg%3E">
<script>
(function () {
  var theme = 'system';
  try { theme = localStorage.getItem('<?= THEME_KEY ?>') || 'system'; } catch (err) { /* blocked storage */ }
  var dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
</script>
<style>
:root {
  --bg: #f7f7f5; --panel: #ffffff; --text: #222; --muted: #666; --border: #ddd;
  --code: #f0f0f0; --link: #2d5f99; --accent: #3a6ea5; --accent-text: #fff;
  color-scheme: light;
}
:root[data-theme="dark"] {
  --bg: #1b1d22; --panel: #23262d; --text: #e6e6e6; --muted: #a0a3aa; --border: #3a3d45;
  --code: #30343c; --link: #8db4ea; --accent: #3a6ea5; --accent-text: #fff;
  color-scheme: dark;
}
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body {
  display: flex; flex-direction: column;
  font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  background: var(--bg); color: var(--text);
}
a { color: var(--link); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

header {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px;
  padding: 8px 16px; background: var(--panel); border-bottom: 1px solid var(--border);
}
.brand { font-weight: 700; color: var(--text); text-decoration: none; margin-right: auto; }
header select, summary, .lang a {
  min-height: 44px; display: inline-flex; align-items: center; padding: 0 12px;
  border: 1px solid var(--border); border-radius: 6px; background: var(--panel); color: var(--text);
  font: inherit; font-size: 14px; cursor: pointer;
}
.lang { display: flex; gap: 4px; }
.lang a { text-decoration: none; }
.lang a[aria-current] { background: var(--accent); border-color: var(--accent); color: var(--accent-text); }
.theme { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--muted); }

details.menu { position: relative; }
summary { list-style: none; }
summary::-webkit-details-marker { display: none; }
.menu-panel {
  position: absolute; left: 0; top: 52px; z-index: 20; width: 320px; max-width: calc(100vw - 32px);
  max-height: calc(100vh - 80px); overflow-y: auto; padding: 12px 16px;
  background: var(--panel); border: 1px solid var(--border); border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, .2);
}
.menu-panel h2 { margin: 14px 0 4px; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
.menu-panel ul { list-style: none; margin: 0; padding: 0; }
.menu-panel li a, .menu-home { display: block; padding: 10px 0; text-decoration: none; }
.menu-panel li.doc a { padding-left: 16px; color: var(--muted); }

main { flex: 1; min-height: 0; overflow-y: auto; }
article { max-width: 820px; margin: 0 auto; padding: 16px; }
article h1 { font-size: 1.8rem; line-height: 1.25; }
article h2 { margin-top: 2rem; border-bottom: 1px solid var(--border); padding-bottom: .2rem; }
article h3 { margin-top: 1.5rem; }
.lead { font-size: 1.1rem; color: var(--muted); }
code { padding: .1em .3em; border-radius: 4px; background: var(--code); font-size: .9em; }
pre { overflow-x: auto; padding: 12px; border-radius: 6px; background: var(--code); }
pre code { padding: 0; background: none; }
blockquote { margin: 1rem 0; padding: 0 1rem; border-left: 4px solid var(--border); color: var(--muted); }
.table-wrap { overflow-x: auto; margin: 1rem 0; }
table { border-collapse: collapse; font-size: .95rem; }
th, td { padding: 6px 10px; border: 1px solid var(--border); text-align: left; vertical-align: top; }
th { background: var(--code); }
.cards { list-style: none; margin: 0 0 1rem; padding: 0; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
.cards a {
  display: flex; align-items: center; min-height: 56px; padding: 8px 14px;
  border: 1px solid var(--border); border-radius: 8px; background: var(--panel);
  color: var(--text); text-decoration: none;
}
.icon { flex: none; margin-right: 10px; font-size: 1.3em; line-height: 1; }
.menu-panel li a { display: flex; align-items: center; }
.cards a:hover { border-color: var(--accent); }
.notice { padding: 8px 12px; border-left: 4px solid var(--accent); background: var(--panel); }

.sim-page { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
.sim-links { display: flex; flex-wrap: wrap; gap: 4px 16px; padding: 4px 16px; font-size: 14px; background: var(--panel); border-bottom: 1px solid var(--border); }
.sim-links a { display: inline-flex; align-items: center; min-height: 44px; }
#sim { flex: 1; width: 100%; border: 0; background: var(--bg); }
</style>
</head>
<body>
<header>
  <a class="brand" href="?">RealityModels</a>
  <details class="menu">
    <summary><?= e($ui['menu']) ?></summary>
    <nav class="menu-panel"><?= $menu ?></nav>
  </details>
  <nav class="lang" aria-label="<?= e($ui['language']) ?>"><?= $languageLinks ?></nav>
  <label class="theme"><?= e($ui['theme']) ?>
    <select id="theme">
      <option value="system"><?= e($ui['themeSystem']) ?></option>
      <option value="light"><?= e($ui['themeLight']) ?></option>
      <option value="dark"><?= e($ui['themeDark']) ?></option>
    </select>
  </label>
</header>
<?php if ($isSimulation): ?>
<main class="sim-page"><?= $body ?></main>
<?php else: ?>
<main><article><?= $body ?></article></main>
<?php endif; ?>
<script>
(function () {
  var KEY = '<?= THEME_KEY ?>';
  var select = document.getElementById('theme');
  var frame = document.getElementById('sim');
  var system = matchMedia('(prefers-color-scheme: dark)');
  function stored() { try { return localStorage.getItem(KEY) || 'system'; } catch (err) { return 'system'; } }
  function apply() {
    var theme = select.value;
    document.documentElement.dataset.theme = theme === 'dark' || (theme === 'system' && system.matches) ? 'dark' : 'light';
    if (frame && frame.contentWindow) frame.contentWindow.location.reload(); // the simulation reads the theme at load
  }
  select.value = stored();
  select.addEventListener('change', function () {
    try { localStorage.setItem(KEY, select.value); } catch (err) { /* blocked storage */ }
    apply();
  });
  system.addEventListener('change', function () { if (select.value === 'system') apply(); });

  // links to documents inside a simulation open the document page, not the raw .md file
  if (frame) frame.addEventListener('load', function () {
    frame.contentDocument.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href]');
      var match = link && link.getAttribute('href').match(/docs\/([^\/]+)\/([^\/]+)\.(it|en)\.md$/);
      if (match) {
        event.preventDefault();
        location.href = '?doc=' + match[1] + '/' + match[2] + '&lang=' + match[3];
      }
    });
  });
})();
</script>
</body>
</html>
<?php
}

/* ---------- routing ---------- */

$lang = pickLanguage();
if (isset($_GET['lang']) && ($_COOKIE['rm_lang'] ?? '') !== $lang) {
    setcookie('rm_lang', $lang, ['expires' => time() + 31536000, 'path' => '/', 'samesite' => 'Lax']);
}
$catalog = catalog();
$menu = menuBody($catalog, $lang);
$ui = UI[$lang];

$sim = isset($_GET['sim']) && is_string($_GET['sim']) ? explode('/', $_GET['sim'], 2) : null;
$doc = isset($_GET['doc']) && is_string($_GET['doc']) ? $_GET['doc'] : null;

if ($sim !== null && count($sim) === 2 && isset($catalog['sims'][$sim[0]][$sim[1]])) {
    $dir = $catalog['sims'][$sim[0]][$sim[1]];
    renderPage(simulationTitle($dir, $sim[1], $lang) . ' | RealityModels', simulationBody($sim[0], $sim[1], $dir, $lang),
        $menu, $lang, '?sim=' . $sim[0] . '/' . $sim[1], true);
} elseif ($doc === 'README') {
    $readme = __DIR__ . '/README' . ($lang === 'it' ? '.it' : '') . '.md';
    renderPage('RealityModels', insideProject($readme) ? markdown((string) file_get_contents($readme), '') : '', $menu, $lang, '?doc=README', false);
} elseif ($doc !== null && count($parts = explode('/', $doc, 2)) === 2 && isset($catalog['docs'][$parts[0]][$parts[1]])) {
    [$file, $actual] = pickDocument($catalog['docs'][$parts[0]][$parts[1]], $lang);
    $body = ($actual !== $lang ? '<p class="notice">' . e($ui['otherLanguage']) . '</p>' : '')
        . markdown((string) file_get_contents($file), 'docs/' . $parts[0]);
    renderPage(documentTitle($file, $parts[1]) . ' | RealityModels', $body, $menu, $lang, '?doc=' . $parts[0] . '/' . $parts[1], false);
} elseif ($sim === null && $doc === null) {
    renderPage('RealityModels', homeBody($catalog, $lang), $menu, $lang, '?', false);
} else {
    renderPage($ui['notFound'] . ' | RealityModels', '<h1>' . e($ui['notFound']) . '</h1><p><a href="?">' . e($ui['home']) . '</a></p>',
        $menu, $lang, '?', false, 404);
}
