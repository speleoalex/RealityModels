/*
 * graph.js: Canvas renderer: ranked bars of the output strings (height = share
 * of the halting machines, colour = string length) and a bottom strip with the
 * halting mass per output length. Colours are read from the CSS tokens on every
 * draw, so the canvas follows the theme.
 */
(function (root) {
  'use strict';

  var MARGIN = { left: 56, right: 18, top: 24 };
  var STRIP = { top: 30, bottom: 18, height: 110, reserve: 14 };
  var MIN_BAR = 24;      // px per ranked bar; sets how many strings are shown
  var FONT = '11px system-ui, sans-serif';

  function CensusGraph(canvas, tooltip) {
    var self = this;
    this.canvas = canvas;
    this.tooltip = tooltip;
    this.context = canvas.getContext('2d');
    this.state = null;
    this.hover = null;
    canvas.addEventListener('pointermove', function (e) { self.setHover(self.pointAt(e.offsetX, e.offsetY), e); });
    canvas.addEventListener('pointerdown', function (e) { self.setHover(self.pointAt(e.offsetX, e.offsetY), e); });
    /* A lifted finger also fires pointerleave: on touch the tooltip stays until the next tap */
    canvas.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') self.setHover(null); });
    new ResizeObserver(function () { self.draw(); }).observe(canvas.parentElement);
  }

  /* state: { census, summary, scale: 'lin'|'log', text: I18n.t } */
  CensusGraph.prototype.update = function (state) {
    this.state = state;
    this.hover = null;
    this.tooltip.hidden = true;
    this.draw();
  };

  CensusGraph.prototype.layout = function () {
    var box = this.canvas.parentElement, dpr = window.devicePixelRatio || 1;
    var width = box.clientWidth, height = box.clientHeight;
    if (this.canvas.width !== Math.round(width * dpr) || this.canvas.height !== Math.round(height * dpr)) {
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
    }
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    var entries = this.state.summary.entries;
    var available = Math.max(10, width - MARGIN.left - MARGIN.right);
    this.shownCount = Math.min(entries.length, Math.max(1, Math.floor(available / MIN_BAR)));
    this.barWidth = available / Math.max(1, this.shownCount);
    var maxLen = 1;
    for (var i = 0; i < this.shownCount; i++) if (entries[i].output.length > maxLen) maxLen = entries[i].output.length;
    this.horizontal = maxLen * 6.6 + 4 <= this.barWidth;
    var labelZone = this.horizontal ? 18 : Math.min(72, Math.round(maxLen * 6.2 + 12));
    var stripHeight = Math.min(STRIP.height, Math.round(height * 0.28));
    var plot = {
      left: MARGIN.left, top: MARGIN.top, width: available,
      height: Math.max(30, height - MARGIN.top - labelZone - STRIP.top - stripHeight - STRIP.bottom)
    };
    plot.bottom = plot.top + plot.height;
    this.plot = plot;
    this.strip = { left: plot.left, top: plot.bottom + labelZone + STRIP.top, width: available, height: stripHeight };
    this.strip.bottom = this.strip.top + this.strip.height;
    return { width: width, height: height };
  };

  function readTheme() {
    var style = getComputedStyle(document.documentElement);
    function token(name) { return style.getPropertyValue(name).trim(); }
    return {
      bg: token('--bg'), text: token('--text'), muted: token('--muted'), grid: token('--grid'), axis: token('--axis'), accent: token('--accent'),
      ramp: [1, 2, 3, 4, 5].map(function (i) { return token('--ramp-' + i); })
    };
  }

  /* Numbers follow the page language: decimal comma and grouping dots in Italian */
  function formatNumber(v, options) { return v.toLocaleString(document.documentElement.lang, options); }
  function formatShare(p) {
    var v = 100 * p;
    return formatNumber(v, v >= 0.1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumSignificantDigits: 2 }) + '%';
  }
  function formatCount(n) { return formatNumber(n); }
  function formatPercentTick(v) { return formatNumber(100 * v, { maximumSignificantDigits: 3 }) + '%'; }
  function mirrorOf(s) { return s.split('').reverse().join(''); }
  function complementOf(s) {
    return s.replace(/[01]/g, function (c) { return c === '0' ? '1' : '0'; });
  }
  /* Colour index by string length; lengths of 5 cells and more share the last step */
  function rampLevel(length) { return Math.min(4, length - 1); }

  CensusGraph.prototype.draw = function () {
    if (!this.state) return;
    var size = this.layout();
    if (size.width < 60 || size.height < 120) return;
    var theme = readTheme(), ctx = this.context, s = this.state;
    var entries = s.summary.entries, halting = s.census.halting;
    var shown = this.shownCount, plot = this.plot, strip = this.strip, barWidth = this.barWidth;
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.font = FONT;

    ctx.fillStyle = theme.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(s.text('barTitle', { shown: entries.length ? shown : 0, distinct: entries.length }), plot.left, plot.top - 8);
    ctx.fillText(s.text('lenTitle'), strip.left, strip.top - 8);

    ctx.strokeStyle = theme.axis;
    ctx.beginPath();
    ctx.moveTo(plot.left, plot.bottom + 0.5);
    ctx.lineTo(plot.left + plot.width, plot.bottom + 0.5);
    ctx.moveTo(strip.left, strip.bottom + 0.5);
    ctx.lineTo(strip.left + strip.width, strip.bottom + 0.5);
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = theme.muted;
    ctx.translate(14, plot.top + plot.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(s.text('axisShare'), 0, 0);
    ctx.restore();

    if (!entries.length || !halting) return;

    var maxShare = entries[0].machines / halting;
    var minShare = entries[shown - 1].machines / halting;
    var logLo = Math.log(minShare / 2), logHi = Math.log(maxShare);
    if (logHi - logLo < 1e-9) logLo = logHi - Math.LN10;
    function yOfShare(share) {
      var ratio = s.scale === 'log'
        ? Math.max(0, (Math.log(share) - logLo) / (logHi - logLo))
        : share / maxShare;
      return plot.bottom - plot.height * Math.min(1, ratio);
    }

    /* Grid: percent steps on the linear scale, decades on the log scale */
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var v, y;
    if (s.scale === 'log') {
      for (v = 1; v >= minShare / 2; v /= 10) {
        if (v > maxShare * 1.0001) continue;
        y = yOfShare(v);
        ctx.strokeStyle = theme.grid;
        ctx.beginPath();
        ctx.moveTo(plot.left, y + 0.5);
        ctx.lineTo(plot.left + plot.width, y + 0.5);
        ctx.stroke();
        ctx.fillStyle = theme.muted;
        ctx.fillText(formatPercentTick(v), plot.left - 6, y);
      }
    } else {
      var step = (function () {
        var candidates = [0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5];
        for (var i = 0; i < candidates.length; i++) {
          if (candidates[i] >= maxShare * 26 / plot.height) return candidates[i];
        }
        return candidates[candidates.length - 1];
      })();
      for (var k = 1; k * step <= maxShare * 1.0001; k++) {
        y = yOfShare(k * step);
        ctx.strokeStyle = theme.grid;
        ctx.beginPath();
        ctx.moveTo(plot.left, y + 0.5);
        ctx.lineTo(plot.left + plot.width, y + 0.5);
        ctx.stroke();
        ctx.fillStyle = theme.muted;
        ctx.fillText(formatPercentTick(k * step), plot.left - 6, y);
      }
    }

    /* Ranked bars; under the pointer, the mirrored and complemented strings are outlined */
    var hoverIndex = this.hover ? this.hover.index : -1;
    var mirrorIndex = -1, complementIndex = -1, i, e;
    if (hoverIndex >= 0) {
      var mirror = mirrorOf(entries[hoverIndex].output);
      var complement = complementOf(entries[hoverIndex].output);
      for (i = 0; i < shown; i++) {
        if (i === hoverIndex) continue;
        if (entries[i].output === mirror) mirrorIndex = i;
        if (entries[i].output === complement) complementIndex = i;
      }
    }
    for (i = 0; i < shown; i++) {
      e = entries[i];
      var x = plot.left + i * barWidth;
      var top = Math.min(yOfShare(e.machines / halting), plot.bottom - 1);
      var w = Math.max(1, barWidth - (barWidth > 4 ? 2 : 0));
      var bx = x + (barWidth - w) / 2;
      ctx.fillStyle = i === hoverIndex ? theme.accent : theme.ramp[rampLevel(e.output.length)];
      ctx.fillRect(bx, top, w, plot.bottom - top);
      if (i === mirrorIndex || i === complementIndex) {
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 2;
        if (i === complementIndex && i !== mirrorIndex) ctx.setLineDash([3, 3]);
        ctx.strokeRect(bx + 1, top + 1, Math.max(1, w - 2), Math.max(1, plot.bottom - top - 2));
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
      }
      if (barWidth >= 9) {
        ctx.fillStyle = i === hoverIndex ? theme.accent : theme.muted;
        if (this.horizontal) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(e.output, x + barWidth / 2, plot.bottom + 5);
        } else {
          ctx.save();
          ctx.translate(x + barWidth / 2, plot.bottom + 5);
          ctx.rotate(Math.PI / 2);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(e.output, 0, 0);
          ctx.restore();
        }
      }
    }

    /* Bottom strip: halting mass per output length, share printed above each bar */
    var byLength = s.summary.byLength, maxL = byLength.length - 1;
    var maxMass = 0, L;
    for (L = 1; L <= maxL; L++) if ((byLength[L] || 0) > maxMass) maxMass = byLength[L];
    if (maxL < 1 || !maxMass) return;
    var slotWidth = strip.width / maxL;
    for (L = 1; L <= maxL; L++) {
      var mass = byLength[L] || 0;
      var cx = strip.left + (L - 0.5) * slotWidth;
      var bw = Math.max(2, Math.min(slotWidth * 0.6, 46));
      var topY = strip.top + STRIP.reserve + (strip.height - STRIP.reserve) * (1 - mass / maxMass);
      ctx.fillStyle = theme.ramp[rampLevel(L)];
      ctx.fillRect(cx - bw / 2, topY, bw, strip.bottom - topY);
      ctx.fillStyle = theme.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      if (slotWidth >= 34 || mass === maxMass) ctx.fillText(formatShare(mass / halting), cx, topY - 2);
      ctx.textBaseline = 'top';
      ctx.fillText(String(L), cx, strip.bottom + 4);
    }
  };

  CensusGraph.prototype.pointAt = function (px, py) {
    if (!this.state || !this.plot || !this.shownCount || !this.state.summary.entries.length) return null;
    var plot = this.plot;
    if (py < plot.top || py > plot.bottom || px < plot.left) return null;
    var index = Math.floor((px - plot.left) / this.barWidth);
    return index >= 0 && index < this.shownCount ? { index: index } : null;
  };

  CensusGraph.prototype.setHover = function (hover, event) {
    var previous = this.hover;
    if (!!hover !== !!previous || (hover && hover.index !== previous.index)) {
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

  CensusGraph.prototype.describe = function (hover) {
    var s = this.state, text = s.text, counts = s.census.counts, halting = s.census.halting;
    var e = s.summary.entries[hover.index];
    var share = e.machines / halting;
    function shareOf(other) { return formatShare((counts[other] || 0) / halting); }
    var rows = [
      [text('ttShare'), formatShare(share)],
      [text('ttMachines'), formatCount(e.machines)],
      [text('ttRank'), hover.index + 1],
      [text('ttBits'), formatNumber(-Math.log(share) / Math.LN2, { minimumFractionDigits: 2, maximumFractionDigits: 2 })]
    ];
    var mirror = mirrorOf(e.output), complement = complementOf(e.output);
    if (mirror !== e.output) rows.push([text('ttMirror', { s: mirror }), shareOf(mirror)]);
    if (complement !== e.output && complement !== mirror) rows.push([text('ttComplement', { s: complement }), shareOf(complement)]);
    return '<b>' + e.output + '</b>' + rows.map(function (r) {
      return '<div><span>' + r[0] + '</span><span>' + r[1] + '</span></div>';
    }).join('');
  };

  CensusGraph.formatShare = formatShare;
  CensusGraph.formatCount = formatCount;
  root.CensusGraph = CensusGraph;
})(typeof self !== 'undefined' ? self : this);
