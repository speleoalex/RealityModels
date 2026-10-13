/*
 * graph.js: canvas renderer. World lines on the left (time horizontal, position
 * vertical) and, on the right, the histogram of the world density sharing the
 * position axis, with the expected quantum density when the scenario has one.
 * Colours are read from the CSS tokens on every draw, so the canvas follows the theme.
 */
(function (root) {
  'use strict';

  var MARGIN = { left: 46, right: 10, top: 16, bottom: 34 };
  var STRIP_GAP = 14;
  var BINS = 56;
  var HOVER_RADIUS = 12;
  var FONT = '11px system-ui, sans-serif';

  function MiwGraph(canvas, tooltip) {
    var self = this;
    this.canvas = canvas;
    this.tooltip = tooltip;
    this.context = canvas.getContext('2d');
    this.state = null;
    this.yMax = 1;
    canvas.addEventListener('pointermove', function (e) { self.setHover(e.offsetX, e.offsetY, e); });
    canvas.addEventListener('pointerdown', function (e) { self.setHover(e.offsetX, e.offsetY, e); });
    canvas.addEventListener('pointerleave', function () { self.tooltip.hidden = true; });
    new ResizeObserver(function () { self.draw(); }).observe(canvas.parentElement);
  }

  /*
   * state: { history: [{t, x: [N]}], v: [N] current velocities,
   *   discardedAt: [N] time each world decoupled (Infinity = still coupled),
   *   chosen: global index or -1, measureTimes: [t...], overlay: {mean, sigma} | null,
   *   reset: true to forget the vertical range, text: I18n.t }
   */
  MiwGraph.prototype.update = function (state) {
    if (state.reset) { this.yMax = 1; this.tooltip.hidden = true; }
    this.state = state;
    this.draw();
  };

  MiwGraph.prototype.layout = function () {
    var box = this.canvas.parentElement, dpr = window.devicePixelRatio || 1;
    var width = box.clientWidth, height = box.clientHeight;
    if (this.canvas.width !== Math.round(width * dpr) || this.canvas.height !== Math.round(height * dpr)) {
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
    }
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    var strip = Math.max(70, Math.min(130, Math.round(width * 0.2)));
    this.plot = {
      left: MARGIN.left, top: MARGIN.top,
      width: width - MARGIN.left - MARGIN.right - strip - STRIP_GAP,
      height: height - MARGIN.top - MARGIN.bottom
    };
    this.plot.right = this.plot.left + this.plot.width;
    this.plot.bottom = this.plot.top + this.plot.height;
    this.strip = { left: this.plot.right + STRIP_GAP, width: strip };
    return { width: width, height: height };
  };

  function readTheme() {
    var style = getComputedStyle(document.documentElement);
    function token(name) { return style.getPropertyValue(name).trim(); }
    return {
      bg: token('--bg'), text: token('--text'), muted: token('--muted'), grid: token('--grid'),
      axis: token('--axis'), accent: token('--accent'), mov: token('--mov'), stat: token('--stat')
    };
  }

  function tickStep(span, maxTicks) {
    var steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];
    for (var i = 0; i < steps.length; i++) if (span / steps[i] <= maxTicks) return steps[i];
    return steps[steps.length - 1];
  }

  MiwGraph.prototype.timeRange = function () {
    var h = this.state.history;
    var t0 = h[0].t, t1 = h[h.length - 1].t;
    return { t0: t0, t1: Math.max(t1, t0 + 2) };
  };

  MiwGraph.prototype.xOf = function (t) {
    var r = this.timeRange();
    return this.plot.left + this.plot.width * (t - r.t0) / (r.t1 - r.t0);
  };
  MiwGraph.prototype.yOf = function (x) {
    return this.plot.top + this.plot.height * (0.5 - 0.5 * x / this.yMax);
  };

  MiwGraph.prototype.draw = function () {
    var s = this.state;
    if (!s || !s.history.length) return;
    var size = this.layout(), ctx = this.context, theme = readTheme();
    var plot = this.plot;
    var last = s.history[s.history.length - 1];
    var n = last.x.length, i, j;

    for (i = 0; i < s.history.length; i++) {
      var xs = s.history[i].x;
      for (j = 0; j < xs.length; j++) if (Math.abs(xs[j]) > this.yMax / 1.15) this.yMax = Math.abs(xs[j]) * 1.15;
    }

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.font = FONT;

    /* grid and axes */
    var range = this.timeRange();
    var dtTick = tickStep(range.t1 - range.t0, plot.width / 60);
    var dxTick = tickStep(2 * this.yMax, plot.height / 40);
    ctx.strokeStyle = theme.grid;
    ctx.fillStyle = theme.muted;
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var t = Math.ceil(range.t0 / dtTick) * dtTick;
    for (; t <= range.t1 + 1e-9; t += dtTick) {
      var px = this.xOf(t);
      ctx.beginPath(); ctx.moveTo(px, plot.top); ctx.lineTo(px, plot.bottom); ctx.stroke();
      ctx.fillText((Math.round(t / dtTick) * dtTick).toFixed(dtTick < 1 ? 1 : 0), px, plot.bottom + 6);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var gy = Math.ceil(-this.yMax / dxTick) * dxTick; gy <= this.yMax + 1e-9; gy += dxTick) {
      var py = this.yOf(gy);
      ctx.beginPath(); ctx.moveTo(plot.left, py); ctx.lineTo(plot.right, py); ctx.stroke();
      ctx.fillText((Math.round(gy / dxTick) * dxTick).toFixed(dxTick < 1 ? 1 : 0), plot.left - 6, py);
    }
    ctx.strokeStyle = theme.axis;
    ctx.strokeRect(plot.left, plot.top, plot.width, plot.height);
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'left';
    ctx.fillText(s.text('axisTime'), plot.right - 12, plot.bottom + 6);
    ctx.textBaseline = 'bottom';
    ctx.fillText(s.text('axisX'), plot.left + 4, plot.top - 2);

    /* measurement instants */
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = theme.axis;
    (s.measureTimes || []).forEach(function (mt) {
      var mx = this.xOf(mt);
      ctx.beginPath(); ctx.moveTo(mx, plot.top); ctx.lineTo(mx, plot.bottom); ctx.stroke();
    }, this);
    ctx.setLineDash([]);

    /* world lines: coupled in accent, decoupled in muted after their measurement */
    ctx.save();
    ctx.beginPath();
    ctx.rect(plot.left, plot.top, plot.width, plot.height);
    ctx.clip();
    for (j = 0; j < n; j++) {
      if (j === s.chosen) continue;
      this.drawWorld(j, theme.accent, 1.2, 0.85, theme.muted);
    }
    if (s.chosen >= 0) this.drawWorld(s.chosen, theme.mov, 2.2, 1, theme.muted);
    for (j = 0; j < n; j++) {
      ctx.globalAlpha = s.discardedAt[j] < Infinity ? 0.4 : 1;
      ctx.fillStyle = j === s.chosen ? theme.mov : (s.discardedAt[j] < Infinity ? theme.muted : theme.accent);
      ctx.beginPath();
      ctx.arc(this.xOf(last.t), this.yOf(last.x[j]), j === s.chosen ? 3.4 : 2.2, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    this.drawDensity(theme, last, s);
  };

  /* One world line, split where the world decouples. */
  MiwGraph.prototype.drawWorld = function (j, colour, width, alpha, mutedColour) {
    var s = this.state, ctx = this.context;
    var cut = s.discardedAt[j];
    var h = s.history, i;

    function segment(self, from, to, strokeColour, strokeAlpha) {
      if (to - from < 1) return;
      ctx.beginPath();
      for (i = from; i <= to; i++) {
        var px = self.xOf(h[i].t), py = self.yOf(h[i].x[j]);
        if (i === from) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = strokeColour;
      ctx.globalAlpha = strokeAlpha;
      ctx.lineWidth = width;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    var split = h.length - 1;
    if (cut < Infinity) {
      for (i = 0; i < h.length; i++) if (h[i].t >= cut) { split = i; break; }
      segment(this, 0, split, colour, alpha);
      segment(this, split, h.length - 1, mutedColour, 0.4);
    } else {
      segment(this, 0, h.length - 1, colour, alpha);
    }
  };

  /* Right strip: histogram of the current positions, plus the expected density. */
  MiwGraph.prototype.drawDensity = function (theme, last, s) {
    var ctx = this.context, plot = this.plot, strip = this.strip;
    var n = last.x.length, j, b;
    var binH = 2 * this.yMax / BINS;
    var all = new Array(BINS), kept = new Array(BINS);
    for (b = 0; b < BINS; b++) { all[b] = 0; kept[b] = 0; }
    for (j = 0; j < n; j++) {
      b = Math.min(BINS - 1, Math.max(0, Math.floor((last.x[j] + this.yMax) / binH)));
      all[b]++;
      if (s.discardedAt[j] === Infinity) kept[b]++;
    }
    var densityMax = 0;
    for (b = 0; b < BINS; b++) densityMax = Math.max(densityMax, all[b] / (n * binH));
    if (s.overlay) densityMax = Math.max(densityMax, 1 / (s.overlay.sigma * Math.sqrt(2 * Math.PI)));
    if (!densityMax) return;

    ctx.strokeStyle = theme.axis;
    ctx.strokeRect(strip.left, plot.top, strip.width, plot.height);
    for (b = 0; b < BINS; b++) {
      if (!all[b]) continue;
      var y0 = this.yOf(-this.yMax + (b + 1) * binH), y1 = this.yOf(-this.yMax + b * binH);
      var wAll = strip.width * (all[b] / (n * binH)) / densityMax;
      var wKept = strip.width * (kept[b] / (n * binH)) / densityMax;
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = theme.muted;
      ctx.fillRect(strip.left, y0, wAll, y1 - y0 - 0.5);
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = theme.accent;
      ctx.fillRect(strip.left, y0, wKept, y1 - y0 - 0.5);
      ctx.globalAlpha = 1;
    }
    if (s.overlay) {
      var sg = s.overlay.sigma, mu = s.overlay.mean;
      ctx.beginPath();
      for (var k = 0; k <= 80; k++) {
        var x = -this.yMax + 2 * this.yMax * k / 80;
        var rho = Math.exp(-(x - mu) * (x - mu) / (2 * sg * sg)) / (sg * Math.sqrt(2 * Math.PI));
        var px = strip.left + strip.width * rho / densityMax;
        var py = this.yOf(x);
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = theme.stat;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
    }
  };

  /* Tooltip: nearest world at the hovered time column. */
  MiwGraph.prototype.setHover = function (px, py, event) {
    var s = this.state;
    if (!s || !s.history.length || !this.plot) { this.tooltip.hidden = true; return; }
    var h = s.history, range = this.timeRange();
    var t = range.t0 + (px - this.plot.left) / this.plot.width * (range.t1 - range.t0);
    var i = 0;
    while (i < h.length - 1 && h[i + 1].t < t) i++;
    var best = -1, bestDist = HOVER_RADIUS;
    for (var j = 0; j < h[i].x.length; j++) {
      var d = Math.abs(this.yOf(h[i].x[j]) - py);
      if (d < bestDist) { bestDist = d; best = j; }
    }
    if (best < 0 || px < this.plot.left || px > this.plot.right) { this.tooltip.hidden = true; return; }
    var rows = '<div><span>' + s.text('axisTime') + '</span><span>' + h[i].t.toFixed(2) + '</span></div>' +
      '<div><span>' + s.text('ttPosition') + '</span><span>' + h[i].x[best].toFixed(3) + '</span></div>';
    if (i === h.length - 1) {
      rows += '<div><span>' + s.text('ttVelocity') + '</span><span>' + s.v[best].toFixed(3) + '</span></div>';
    }
    this.tooltip.innerHTML = '<b>' + s.text('ttWorld', { i: best + 1 }) + '</b>' + rows;
    this.tooltip.hidden = false;
    var box = this.canvas.parentElement.getBoundingClientRect();
    var tx = Math.min(event.offsetX + 14, box.width - this.tooltip.offsetWidth - 8);
    var ty = Math.min(event.offsetY + 14, box.height - this.tooltip.offsetHeight - 8);
    this.tooltip.style.left = Math.max(0, tx) + 'px';
    this.tooltip.style.top = Math.max(0, ty) + 'px';
  };

  root.MiwGraph = MiwGraph;
})(typeof self !== 'undefined' ? self : this);
