/*
 * graph.js: Canvas renderer: lattice (time on x, record on y) or naive tree (fan
 * layout), plus the histogram of the displayed step. Colours are read from the CSS
 * tokens on every draw, so the canvas follows the theme.
 */
(function (root) {
  'use strict';

  var EPSILON = 1e-9;
  var MARGIN = { left: 48, right: 18, top: 20, bottom: 36 };
  var HISTOGRAM = { height: 110, top: 22, bottom: 20 };
  var HOVER_RADIUS = 10;
  var FONT = '11px system-ui, sans-serif';

  function MultiverseGraph(canvas, tooltip) {
    var self = this;
    this.canvas = canvas;
    this.tooltip = tooltip;
    this.context = canvas.getContext('2d');
    this.state = null;
    this.hover = null;
    canvas.addEventListener('pointermove', function (e) { self.setHover(self.pointAt(e.offsetX, e.offsetY), e); });
    canvas.addEventListener('pointerdown', function (e) { self.setHover(self.pointAt(e.offsetX, e.offsetY), e); });
    canvas.addEventListener('pointerleave', function () { self.setHover(null); });
    new ResizeObserver(function () { self.draw(); }).observe(canvas.parentElement);
  }

  /* state: { lattice, outcomes, steps, step, regime: 'tree'|'classical'|'quantum', text: I18n.t } */
  MultiverseGraph.prototype.update = function (state) {
    this.state = state;
    this.hover = null;
    this.tooltip.hidden = true;
    this.draw();
  };

  MultiverseGraph.prototype.layout = function () {
    var box = this.canvas.parentElement, dpr = window.devicePixelRatio || 1;
    var width = box.clientWidth, height = box.clientHeight;
    if (this.canvas.width !== Math.round(width * dpr) || this.canvas.height !== Math.round(height * dpr)) {
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
    }
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    var s = this.state, histogramHeight = Math.min(HISTOGRAM.height, Math.round(height * 0.25));
    var plot = {
      left: MARGIN.left, top: MARGIN.top, width: width - MARGIN.left - MARGIN.right,
      height: height - MARGIN.top - MARGIN.bottom - HISTOGRAM.top - histogramHeight - HISTOGRAM.bottom
    };
    plot.bottom = plot.top + plot.height;
    plot.unitY = plot.height / (2 * (s.outcomes - 1) * s.steps + 2); // record range is ±(N-1)·T plus one unit of padding
    this.plot = plot;
    this.histogram = { left: plot.left, top: plot.bottom + MARGIN.bottom + HISTOGRAM.top, width: plot.width, height: histogramHeight };
    return { width: width, height: height };
  };

  MultiverseGraph.prototype.xOf = function (t) { return this.plot.left + this.plot.width * t / this.state.steps; };
  MultiverseGraph.prototype.yOf = function (x) { return this.plot.top + this.plot.height / 2 - x * this.plot.unitY; };
  MultiverseGraph.prototype.yOfTree = function (index, count) { return this.plot.top + this.plot.height * (index + 0.5) / count; };

  function readTheme() {
    var style = getComputedStyle(document.documentElement);
    function token(name) { return style.getPropertyValue(name).trim(); }
    return {
      bg: token('--bg'), text: token('--text'), muted: token('--muted'), grid: token('--grid'), axis: token('--axis'), accent: token('--accent'),
      ramp: [1, 2, 3, 4, 5].map(function (i) { return token('--ramp-' + i); })
    };
  }

  function tickStep(unit, minSpacing) {
    var candidates = [1, 2, 4, 10, 20, 50, 100];
    for (var i = 0; i < candidates.length; i++) if (candidates[i] * unit >= minSpacing) return candidates[i];
    return candidates[candidates.length - 1];
  }

  /* 0..4 index into the sequential ramp; the square root keeps small probabilities visible */
  function rampLevel(ratio) { return Math.min(4, Math.floor(5 * Math.sqrt(ratio))); }

  /* Tree world index -> outcomes: the last outcome is the least significant base-N digit */
  function digitSum(index, n, digits) { var sum = 0; for (var i = 0; i < digits; i++) { sum += index % n; index = Math.floor(index / n); } return sum; }
  function digitsOf(index, n, digits) { var out = []; for (var i = 0; i < digits; i++) { out.unshift(index % n); index = Math.floor(index / n); } return out; }

  function formatProbability(p) { return p < 1e-4 ? p.toExponential(2) : p.toFixed(4); }
  function formatCount(n) { return n < 1e6 ? n.toLocaleString(document.documentElement.lang) : n.toExponential(2); }

  MultiverseGraph.prototype.draw = function () {
    if (!this.state) return;
    var size = this.layout();
    if (size.width < 40 || size.height < 40) return;
    var theme = readTheme(), ctx = this.context;
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.font = FONT;
    this.drawAxes(theme);
    if (this.state.regime === 'tree') this.drawTree(theme); else this.drawLattice(theme);
    this.drawHistogram(theme);
  };

  MultiverseGraph.prototype.drawAxes = function (theme) {
    var s = this.state, plot = this.plot, ctx = this.context, text = s.text;
    var stride = Math.max(1, Math.ceil(28 * s.steps / plot.width));
    ctx.lineWidth = 1;
    ctx.strokeStyle = theme.grid;
    ctx.fillStyle = theme.muted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (var t = 0; t <= s.steps; t += stride) {
      var x = Math.round(this.xOf(t)) + 0.5;
      ctx.beginPath(); ctx.moveTo(x, plot.top); ctx.lineTo(x, plot.bottom); ctx.stroke();
      ctx.fillText(t, x, plot.bottom + 5);
    }
    ctx.strokeStyle = theme.axis;
    ctx.beginPath(); ctx.moveTo(plot.left, plot.bottom + 0.5); ctx.lineTo(plot.left + plot.width, plot.bottom + 0.5); ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.fillText(text('axisTime'), plot.left + plot.width / 2, plot.bottom + 19);
    var yTitle = text('axisWorlds');
    if (s.regime !== 'tree') {
      yTitle = text('axisState');
      var range = (s.outcomes - 1) * s.steps, step = tickStep(plot.unitY, 18);
      ctx.strokeStyle = theme.grid;
      ctx.fillStyle = theme.muted;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (var v = -Math.floor(range / step) * step; v <= range; v += step) {
        var y = Math.round(this.yOf(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(plot.left, y); ctx.lineTo(plot.left + plot.width, y); ctx.stroke();
        ctx.fillText(v, plot.left - 6, y);
      }
    }
    ctx.save();
    ctx.translate(12, plot.top + plot.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(yTitle, 0, 0);
    ctx.restore();
  };

  /* ratio = flow relative to the strongest flow of the same step */
  MultiverseGraph.prototype.drawEdge = function (x0, y0, x1, y1, ratio, suppressed, highlighted, theme) {
    var ctx = this.context;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    if (highlighted) { ctx.strokeStyle = theme.accent; ctx.lineWidth = 2; ctx.globalAlpha = 1; }
    else if (suppressed) { ctx.strokeStyle = theme.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.6; }
    else { ctx.strokeStyle = theme.ramp[3]; ctx.lineWidth = 1 + 1.5 * ratio; ctx.globalAlpha = 0.15 + 0.85 * ratio; }
    ctx.setLineDash(suppressed && !highlighted ? [2, 3] : []);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  };

  MultiverseGraph.prototype.drawNode = function (x, y, radius, fill, hollow, highlighted, theme) {
    var ctx = this.context;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    if (hollow) {
      ctx.fillStyle = theme.bg; ctx.fill();
      ctx.strokeStyle = highlighted ? theme.accent : theme.muted; ctx.stroke();
      return;
    }
    ctx.fillStyle = highlighted ? theme.accent : fill;
    ctx.fill();
    if (radius >= 3) { ctx.strokeStyle = theme.bg; ctx.stroke(); } // surface ring separates touching marks
  };

  MultiverseGraph.prototype.drawLattice = function (theme) {
    var s = this.state, lattice = s.lattice, n = s.outcomes, hover = this.hover, plot = this.plot, self = this;
    var quantum = s.regime === 'quantum', pKey = quantum ? 'pQuantum' : 'pClassical', flowKey = quantum ? 'flowQuantum' : 'flowClassical';
    var rMax = Math.min(14, 0.42 * Math.min(2 * plot.unitY, plot.width / s.steps)), rMin = Math.max(1.2, 0.18 * rMax);
    var highlightedEdges = [];
    for (var t = 0; t < s.step; t++) {
      var nodes = lattice[t], maxFlow = 0, x0 = this.xOf(t), x1 = this.xOf(t + 1);
      nodes.forEach(function (node) { maxFlow = Math.max(maxFlow, Math.max.apply(null, node[flowKey])); });
      for (var k = 0; k < nodes.length; k++) {
        for (var c = 0; c < n; c++) {
          var flow = nodes[k][flowKey][c];
          var edge = [x0, this.yOf(nodes[k].x), x1, this.yOf(lattice[t + 1][k + c].x), maxFlow ? flow / maxFlow : 0, flow < EPSILON];
          if (hover && hover.t === t + 1 && hover.index === k + c) highlightedEdges.push(edge);
          else this.drawEdge(edge[0], edge[1], edge[2], edge[3], edge[4], edge[5], false, theme);
        }
      }
    }
    highlightedEdges.forEach(function (e) { self.drawEdge(e[0], e[1], e[2], e[3], e[4], e[5], true, theme); });
    for (t = 0; t <= s.step; t++) {
      nodes = lattice[t];
      var pMax = 0, x = this.xOf(t);
      nodes.forEach(function (node) { pMax = Math.max(pMax, node[pKey]); });
      for (k = 0; k < nodes.length; k++) {
        var p = nodes[k][pKey], ratio = pMax ? p / pMax : 0, suppressed = p < EPSILON;
        var highlighted = !!hover && ((hover.t === t && hover.index === k) || (hover.t === t + 1 && hover.index - k >= 0 && hover.index - k < n));
        this.drawNode(x, this.yOf(nodes[k].x), suppressed ? rMin : rMin + (rMax - rMin) * Math.sqrt(ratio), theme.ramp[rampLevel(ratio)], suppressed, highlighted, theme);
      }
    }
  };

  MultiverseGraph.prototype.drawTree = function (theme) {
    var s = this.state, n = s.outcomes, plot = this.plot, hover = this.hover, self = this;
    var rMax = Math.min(14, 0.42 * plot.width / s.steps);
    var hoverSum = hover ? digitSum(hover.index, n, hover.t) : -1;
    var ancestors = {}; // 't:index' of the hovered world's own history
    if (hover) for (var a = hover.index, ta = hover.t; ta >= 0; ta--, a = Math.floor(a / n)) ancestors[ta + ':' + a] = true;
    var highlightedEdges = [];
    for (var t = 0; t < s.step; t++) {
      var count = Math.pow(n, t), x0 = this.xOf(t), x1 = this.xOf(t + 1);
      for (var i = 0; i < count; i++) {
        var y0 = this.yOfTree(i, count);
        for (var c = 0; c < n; c++) {
          var child = i * n + c, y1 = this.yOfTree(child, count * n);
          if (ancestors[(t + 1) + ':' + child]) highlightedEdges.push([x0, y0, x1, y1]);
          else this.drawEdge(x0, y0, x1, y1, 0.3, false, false, theme);
        }
      }
    }
    highlightedEdges.forEach(function (e) { self.drawEdge(e[0], e[1], e[2], e[3], 1, false, true, theme); });
    for (t = 0; t <= s.step; t++) {
      count = Math.pow(n, t);
      var x = this.xOf(t), radius = Math.max(1.2, Math.min(rMax, 0.42 * plot.height / count));
      for (i = 0; i < count; i++) {
        var highlighted = !!hover && ((hover.t === t && digitSum(i, n, t) === hoverSum) || !!ancestors[t + ':' + i]);
        this.drawNode(x, this.yOfTree(i, count), radius, theme.ramp[3], false, highlighted, theme);
      }
    }
  };

  MultiverseGraph.prototype.drawHistogram = function (theme) {
    var s = this.state, h = this.histogram, ctx = this.context, text = s.text, nodes = s.lattice[s.step];
    var quantum = s.regime === 'quantum', pKey = quantum ? 'pQuantum' : 'pClassical';
    var range = (s.outcomes - 1) * s.steps, unit = h.width / (2 * range + 2);
    var slot = 2 * unit, barWidth = Math.max(1, slot - (slot > 4 ? 2 : 0));
    var pMax = 0;
    nodes.forEach(function (node) { pMax = Math.max(pMax, node[pKey], quantum ? node.pClassical : 0); });
    var hovered = this.hover && this.hover.t === s.step ? (s.regime === 'tree' ? digitSum(this.hover.index, s.outcomes, s.step) : this.hover.index) : -1;
    function xOf(x) { return h.left + (x + range + 1) * unit; }
    function yOf(p) { return h.top + h.height - (pMax ? h.height * p / pMax : 0); }
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text('histTitle', { t: s.step }), h.left, h.top - 6);
    ctx.fillStyle = theme.muted;
    ctx.textAlign = 'right';
    ctx.fillText(text('histMax', { p: formatProbability(pMax) }), h.left + h.width, h.top - 6);
    ctx.strokeStyle = theme.axis;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(h.left, h.top + h.height + 0.5); ctx.lineTo(h.left + h.width, h.top + h.height + 0.5); ctx.stroke();
    nodes.forEach(function (node, k) {
      var top = yOf(node[pKey]);
      ctx.fillStyle = k === hovered ? theme.accent : theme.ramp[3];
      if (top < h.top + h.height) ctx.fillRect(xOf(node.x) - barWidth / 2, top, barWidth, h.top + h.height - top);
    });
    if (quantum) { // classical distribution as a step outline, for comparison
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      nodes.forEach(function (node, k) {
        var y = yOf(node.pClassical), left = xOf(node.x) - slot / 2;
        if (k === 0) ctx.moveTo(left, y); else ctx.lineTo(left, y);
        ctx.lineTo(left + slot, y);
      });
      ctx.stroke();
    }
    var step = tickStep(unit, 24);
    ctx.fillStyle = theme.muted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (var v = -Math.floor(range / step) * step; v <= range; v += step) ctx.fillText(v, xOf(v), h.top + h.height + 4);
  };

  MultiverseGraph.prototype.pointAt = function (px, py) {
    var s = this.state, plot = this.plot;
    if (!s || !plot || py < plot.top - HOVER_RADIUS || py > plot.bottom + HOVER_RADIUS) return null;
    var t = Math.round((px - plot.left) / plot.width * s.steps);
    if (t < 0 || t > s.step || Math.abs(this.xOf(t) - px) > HOVER_RADIUS) return null;
    var tree = s.regime === 'tree', count = tree ? Math.pow(s.outcomes, t) : s.lattice[t].length;
    var best = null, bestDistance = HOVER_RADIUS;
    for (var i = 0; i < count; i++) {
      var d = Math.abs((tree ? this.yOfTree(i, count) : this.yOf(s.lattice[t][i].x)) - py);
      if (d < bestDistance) { bestDistance = d; best = { t: t, index: i }; }
    }
    return best;
  };

  MultiverseGraph.prototype.setHover = function (hover, event) {
    var previous = this.hover;
    if (!!hover !== !!previous || (hover && (hover.t !== previous.t || hover.index !== previous.index))) {
      this.hover = hover;
      this.draw();
    }
    if (!hover) { this.tooltip.hidden = true; return; }
    this.tooltip.innerHTML = this.describe(hover);
    this.tooltip.hidden = false;
    var box = this.canvas.parentElement, left = event.offsetX + 14, top = event.offsetY + 14;
    if (left + this.tooltip.offsetWidth > box.clientWidth - 4) left = Math.max(4, event.offsetX - 14 - this.tooltip.offsetWidth);
    if (top + this.tooltip.offsetHeight > box.clientHeight - 4) top = Math.max(4, event.offsetY - 14 - this.tooltip.offsetHeight);
    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
  };

  MultiverseGraph.prototype.describe = function (hover) {
    var s = this.state, text = s.text, rows;
    if (s.regime === 'tree') {
      var k = digitSum(hover.index, s.outcomes, hover.t);
      rows = [
        [text('ttPath'), digitsOf(hover.index, s.outcomes, hover.t).join(' ') || '–'],
        [text('ttState'), 2 * k - (s.outcomes - 1) * hover.t],
        [text('ttProbability'), formatProbability(Math.pow(s.outcomes, -hover.t))],
        [text('ttSameState'), formatCount(s.lattice[hover.t][k].paths)]
      ];
    } else {
      var node = s.lattice[hover.t][hover.index];
      rows = [
        [text('ttState'), node.x],
        [text('ttPaths'), formatCount(node.paths)],
        [text('ttPClassical'), formatProbability(node.pClassical)],
        [text('ttPQuantum'), formatProbability(node.pQuantum)]
      ];
    }
    return '<b>' + text('ttStep', { t: hover.t }) + '</b>' + rows.map(function (r) { return '<div><span>' + r[0] + '</span><span>' + r[1] + '</span></div>'; }).join('');
  };

  MultiverseGraph.formatProbability = formatProbability;
  MultiverseGraph.formatCount = formatCount;
  root.MultiverseGraph = MultiverseGraph;
})(typeof self !== 'undefined' ? self : this);
