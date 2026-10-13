#!/usr/bin/env node
'use strict';
// Builds <name>.standalone.html next to each simulations/*/*/index.html:
// every <link rel="stylesheet"> and <script src> is replaced by its file
// content, so the result is one file with no dependencies.
// Usage: node tools/build-standalone.js

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'simulations');
const LINK_RE = /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
const SCRIPT_RE = /<script\b[^>]*src="([^"]+)"[^>]*>\s*<\/script>/g;

// "</style" or "</script" inside inlined content would close the tag early.
function inline(dir, href, tag) {
  const text = fs.readFileSync(path.resolve(dir, href), 'utf8')
    .replace(new RegExp('</' + tag, 'gi'), '<\\/' + tag);
  return '<' + tag + '>\n' + text + '\n</' + tag + '>';
}

function build(indexPath) {
  const dir = path.dirname(indexPath);
  const html = fs.readFileSync(indexPath, 'utf8')
    .replace(LINK_RE, (m, href) => inline(dir, href, 'style'))
    .replace(SCRIPT_RE, (m, src) => inline(dir, src, 'script'));
  const out = path.join(dir, path.basename(dir) + '.standalone.html');
  fs.writeFileSync(out, html);
  console.log(path.relative(process.cwd(), out));
}

for (const subject of fs.readdirSync(root)) {
  const subjectDir = path.join(root, subject);
  for (const name of fs.readdirSync(subjectDir)) {
    const index = path.join(subjectDir, name, 'index.html');
    if (fs.existsSync(index)) build(index);
  }
}
