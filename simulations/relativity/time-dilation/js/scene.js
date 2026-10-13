/*
 * scene.js: draws the geometry from physics.js with three.js (r121, UMD build).
 *
 * Mapping between physical and scene coordinates (Y up):
 *   scene.x = x        scene.y = t        scene.z = -y
 * The minus sign on y makes y point up on screen when looking from above with x to the right.
 */
(function (root) {
  'use strict';

  var COLORS = {
    stat: 0x3a6ea5,
    statEdge: 0x1f4e80,
    mov: 0xe07b1a,
    movEdge: 0x9c4f00,
    plane: 0x8fb8e8,
    plane2: 0xf3c58a,
    plane2Edge: 0xe0a860,
    cone: 0xd4b100,
    axisX: 0xc0392b,
    axisY: 0x27ae60,
    axisT: 0x2962ff
  };

  // Per-theme colors for background, grid and labels.
  var THEMES = {
    light: {
      bg: 0xf7f7f5, grid: 0xd0d0d0, tick: '#777777',
      labelBg: 'rgba(255,255,255,0.8)',
      stat: '#1f4e80', mov: '#9c4f00', plane: '#3a6ea5', cone: '#8a7300',
      axisX: '#c0392b', axisY: '#27ae60', axisT: '#2962ff'
    },
    dark: {
      bg: 0x1b1d22, grid: 0x3a3d45, tick: '#9a9ca3',
      labelBg: 'rgba(27,29,34,0.8)',
      stat: '#8fb8e8', mov: '#f3c58a', plane: '#8fb8e8', cone: '#e6cc4d',
      axisX: '#ef6f5f', axisY: '#5fd38d', axisT: '#7ea3ff'
    }
  };

  function toScene(ev) {
    return new THREE.Vector3(ev.x, ev.t, -ev.y);
  }

  /* ---------- text labels as sprites ---------- */

  function makeLabel(text, opts) {
    opts = opts || {};
    var fontPx = 44;
    var font = (opts.bold ? 'bold ' : '') + fontPx + 'px system-ui, sans-serif';
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.font = font;
    var w = Math.ceil(ctx.measureText(text).width) + 24;
    var h = fontPx + 20;
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext('2d');
    if (opts.background) {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.font = font;
    ctx.fillStyle = opts.color || '#222';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 12, h / 2);
    var tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    var mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    var sprite = new THREE.Sprite(mat);
    var height = opts.height || 0.22;
    sprite.scale.set(height * w / h, height, 1);
    // anchor: 0 = text starts at the position (grows to the right), 1 = text ends there, 0.5 = centered
    if (opts.anchor !== undefined) sprite.center.set(opts.anchor, 0.5);
    sprite.renderOrder = 20;
    return sprite;
  }

  /* ---------- geometric primitives ---------- */

  function lineBetween(a, b, material) {
    var g = new THREE.BufferGeometry().setFromPoints([toScene(a), toScene(b)]);
    var line = new THREE.Line(g, material);
    if (material.isLineDashedMaterial) line.computeLineDistances();
    return line;
  }

  /** Filled quadrilateral from 4 events in cyclic order. */
  function polygonMesh(corners, color, opacity, renderOrder) {
    var pts = corners.map(toScene);
    var pos = [];
    [[0, 1, 2], [0, 2, 3]].forEach(function (tri) {
      tri.forEach(function (i) { pos.push(pts[i].x, pts[i].y, pts[i].z); });
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    var m = new THREE.MeshBasicMaterial({
      color: color, side: THREE.DoubleSide,
      transparent: opacity < 1, opacity: opacity,
      depthWrite: opacity >= 1
    });
    var mesh = new THREE.Mesh(g, m);
    mesh.renderOrder = renderOrder || 0;
    return mesh;
  }

  function polygonOutline(corners, color) {
    var pts = corners.map(toScene);
    pts.push(pts[0].clone());
    var g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: color }));
  }

  var TUBE_FACES = [
    [0, 1, 2, 3], [7, 6, 5, 4],
    [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]
  ];
  var TUBE_CAP_EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4]];
  var TUBE_SIDE_EDGES = [[0, 4], [1, 5], [2, 6], [3, 7]];

  /** Translucent prism from 8 vertices; side edges (the world lines) are drawn stronger than cap edges. */
  function tubeGroup(verts, color, edgeColor, opacity) {
    var group = new THREE.Group();
    var pts = verts.map(toScene);
    var pos = [];
    TUBE_FACES.forEach(function (f) {
      [[0, 1, 2], [0, 2, 3]].forEach(function (tri) {
        tri.forEach(function (i) {
          var p = pts[f[i]];
          pos.push(p.x, p.y, p.z);
        });
      });
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    var mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({
      color: color, transparent: true, opacity: opacity, side: THREE.DoubleSide, depthWrite: false
    }));
    mesh.renderOrder = 1;
    group.add(mesh);

    function edges(list, mat) {
      var p = [];
      list.forEach(function (e) { p.push(pts[e[0]], pts[e[1]]); });
      return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(p), mat);
    }
    group.add(edges(TUBE_CAP_EDGES, new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.6 })));
    group.add(edges(TUBE_SIDE_EDGES, new THREE.LineBasicMaterial({ color: edgeColor })));
    return group;
  }

  /** Dimension line between a and b with end ticks and a centered label. */
  function dimension(a, b, text, color, labelColor, labelBg, offsetY, lift) {
    var group = new THREE.Group();
    var oa = { x: a.x, y: a.y + offsetY, t: a.t + lift };
    var ob = { x: b.x, y: b.y + offsetY, t: b.t + lift };
    var mat = new THREE.LineBasicMaterial({ color: color, depthTest: false });
    group.add(lineBetween(oa, ob, mat));
    var tick = 0.07;
    group.add(lineBetween({ x: oa.x, y: oa.y - tick, t: oa.t }, { x: oa.x, y: oa.y + tick, t: oa.t }, mat));
    group.add(lineBetween({ x: ob.x, y: ob.y - tick, t: ob.t }, { x: ob.x, y: ob.y + tick, t: ob.t }, mat));
    var label = makeLabel(text, { color: labelColor, background: labelBg, bold: true });
    label.position.copy(toScene({ x: (oa.x + ob.x) / 2, y: oa.y - 0.22, t: (oa.t + ob.t) / 2 + 0.02 }));
    group.add(label);
    group.renderOrder = 15;
    return group;
  }

  function disposeChildren(group) {
    while (group.children.length) {
      var child = group.children.pop();
      child.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
    }
  }

  /* ---------- scene ---------- */

  function SpaceTimeScene(container) {
    this.container = container;
    this.theme = THEMES.light;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x999999, 0.9));
    var sun = new THREE.DirectionalLight(0xffffff, 0.45);
    sun.position.set(5, 10, 7);
    this.scene.add(sun);

    this.dynamic = new THREE.Group();
    this.scene.add(this.dynamic);

    this.perspective = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    this.orthographic = new THREE.OrthographicCamera(-1, 1, 1, -1, -500, 500);
    this.camera = this.perspective;
    this.controls = null;
    this.ticks = null;
    this.viewName = '3d';
    this.bounds = { xMin: -4, xMax: 4, yMax: 1.5, tMin: 0, tMax: 4 };

    var self = this;
    window.addEventListener('resize', function () { self.resize(); });
    this.resize();
    this.setTheme('light');
    this.setView('3d');
    this.renderer.setAnimationLoop(function () {
      if (self.controls) self.controls.update();
      self.renderer.render(self.scene, self.camera);
    });
  }

  SpaceTimeScene.prototype.setTheme = function (name) {
    this.theme = THEMES[name] || THEMES.light;
    this.renderer.setClearColor(this.theme.bg);
  };

  SpaceTimeScene.prototype.resize = function () {
    var w = this.container.clientWidth || 1;
    var h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.perspective.aspect = w / h;
    this.perspective.updateProjectionMatrix();
    this.updateOrthographic();
  };

  SpaceTimeScene.prototype.updateOrthographic = function () {
    var w = this.container.clientWidth || 1;
    var h = this.container.clientHeight || 1;
    var aspect = w / h;
    var b = this.bounds;
    var xr = b.xMax - b.xMin + 1.5;
    var vr = (this.viewName === 'top') ? (2 * b.yMax + 1.5) : (b.tMax - b.tMin + 1.5);
    var half = Math.max(vr, xr / aspect) / 2;
    this.orthographic.left = -half * aspect;
    this.orthographic.right = half * aspect;
    this.orthographic.top = half;
    this.orthographic.bottom = -half;
    this.orthographic.updateProjectionMatrix();
  };

  SpaceTimeScene.prototype.center = function () {
    var b = this.bounds;
    return new THREE.Vector3((b.xMin + b.xMax) / 2, (b.tMin + b.tMax) / 2, 0);
  };

  SpaceTimeScene.prototype.setView = function (name) {
    this.viewName = name;
    if (this.ticks) this.ticks.visible = name !== 'top';
    var c = this.center();
    if (name === '3d') {
      this.camera = this.perspective;
      this.camera.up.set(0, 1, 0);
      this.camera.position.copy(c).add(new THREE.Vector3(7, 5, 11));
    } else if (name === 'side') {
      this.camera = this.orthographic;
      this.camera.up.set(0, 1, 0);
      this.camera.position.copy(c).add(new THREE.Vector3(0, 0, 100));
    } else if (name === 'top') {
      this.camera = this.orthographic;
      this.camera.up.set(0, 0, -1);
      c.y = 0;
      this.camera.position.copy(c).add(new THREE.Vector3(0, 100, 0));
    }
    this.camera.lookAt(c);
    this.updateOrthographic();
    // OrbitControls binds its camera at construction time, so it is recreated on every view change.
    if (this.controls) this.controls.dispose();
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(c);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.update();
  };

  /** Grid, axes and tick labels for the drawn block. */
  SpaceTimeScene.prototype.buildFrame = function (b) {
    var th = this.theme;
    var g = new THREE.Group();
    var pts = [], x, y, t;
    // floor grid on t = 0
    for (x = Math.ceil(b.xMin); x <= b.xMax; x++) pts.push(toScene({ x: x, y: -b.yMax, t: 0 }), toScene({ x: x, y: b.yMax, t: 0 }));
    for (y = -b.yMax; y <= b.yMax + 1e-9; y += 0.5) pts.push(toScene({ x: b.xMin, y: y, t: 0 }), toScene({ x: b.xMax, y: y, t: 0 }));
    // back wall grid on y = +yMax (the x–t plane: a Minkowski diagram)
    for (x = Math.ceil(b.xMin); x <= b.xMax; x++) pts.push(toScene({ x: x, y: b.yMax, t: 0 }), toScene({ x: x, y: b.yMax, t: b.tMax }));
    for (t = 0; t <= b.tMax + 1e-9; t += 0.5) pts.push(toScene({ x: b.xMin, y: b.yMax, t: t }), toScene({ x: b.xMax, y: b.yMax, t: t }));
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: th.grid })));

    var headLen = 0.35, headWidth = 0.18;
    g.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(b.xMin, 0, 0), b.xMax - b.xMin + 0.6, COLORS.axisX, headLen, headWidth));
    g.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(b.xMin, 0, b.yMax), 2 * b.yMax + 0.6, COLORS.axisY, headLen, headWidth));
    g.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(b.xMin, 0, b.yMax), b.tMax + 0.6, COLORS.axisT, headLen, headWidth));
    var lx = makeLabel('x', { color: th.axisX, bold: true, height: 0.3 });
    lx.position.set(b.xMax + 0.9, 0, 0);
    var ly = makeLabel('y', { color: th.axisY, bold: true, height: 0.3 });
    ly.position.set(b.xMin, 0, -b.yMax - 0.9);
    var lt = makeLabel('t', { color: th.axisT, bold: true, height: 0.3 });
    lt.position.set(b.xMin, b.tMax + 0.9, b.yMax);
    g.add(lx, ly, lt);
    for (x = Math.ceil(b.xMin); x <= b.xMax; x++) {
      var sx = makeLabel(String(x), { color: th.tick, height: 0.16 });
      sx.position.set(x, -0.02, 0.2);
      g.add(sx);
    }
    for (t = 1; t <= b.tMax; t++) {
      var st = makeLabel(String(t), { color: th.tick, height: 0.16 });
      st.position.set(b.xMin - 0.25, t, b.yMax);
      g.add(st);
    }
    return g;
  };

  /**
   * p: { beta, L0, W, xs, x0, tMin, tMax, tNow, showMovingPlane, tau, showTicks, showLightCone }
   * Returns the computed quantities for the readings panel.
   */
  SpaceTimeScene.prototype.update = function (p) {
    var P = root.Physics;
    var t = root.I18n.t;
    var th = this.theme;
    var g = P.gamma(p.beta);
    var self = this;
    disposeChildren(this.dynamic);

    var xMovEnd = P.worldlineAtLabTime(p.beta, p.L0, p.tMax, p.x0);
    var b = {
      xMin: Math.floor(Math.min(p.xs, p.x0) - 0.5),
      xMax: Math.ceil(Math.max(xMovEnd, p.xs + p.L0) + 0.5),
      yMax: 1.5,
      tMin: p.tMin,
      tMax: p.tMax
    };
    var boundsChanged = JSON.stringify(b) !== JSON.stringify(this.bounds);
    this.bounds = b;

    this.dynamic.add(this.buildFrame(b));

    // Sections on the moving body's simultaneity plane are computed first: they
    // decide how far the tubes must be extended (tubes are infinite, the drawn block is not).
    var movingProper = null, stationaryInMoving = null;
    var statRange = { tMin: p.tMin, tMax: p.tMax };
    var movRange = { tMin: p.tMin, tMax: p.tMax };
    if (p.showMovingPlane) {
      movingProper = P.movingSliceAtMovingTime({ beta: p.beta, x0: p.x0, L0: p.L0, W: p.W, tau: p.tau });
      stationaryInMoving = P.stationarySliceAtMovingTime({ beta: p.beta, x0: p.x0, xs: p.xs, L0: p.L0, W: p.W, tau: p.tau });
      var times = function (c) { return c.map(function (e) { return e.t; }); };
      var pad = 0.3;
      movRange.tMin = Math.min(movRange.tMin, Math.min.apply(null, times(movingProper.corners)) - pad);
      movRange.tMax = Math.max(movRange.tMax, Math.max.apply(null, times(movingProper.corners)) + pad);
      statRange.tMin = Math.min(statRange.tMin, Math.min.apply(null, times(stationaryInMoving.corners)) - pad);
      statRange.tMax = Math.max(statRange.tMax, Math.max.apply(null, times(stationaryInMoving.corners)) + pad);
    }

    var statTube = P.stationaryTube({ xs: p.xs, L0: p.L0, W: p.W, tMin: statRange.tMin, tMax: statRange.tMax });
    var movTube = P.movingTube({ beta: p.beta, x0: p.x0, L0: p.L0, W: p.W, tMin: movRange.tMin, tMax: movRange.tMax });
    this.dynamic.add(tubeGroup(statTube, COLORS.stat, COLORS.statEdge, 0.35));
    this.dynamic.add(tubeGroup(movTube, COLORS.mov, COLORS.movEdge, 0.35));

    var labelStat = makeLabel(t('sceneStationary'), { color: th.stat, background: th.labelBg, height: 0.2 });
    // labels sit beside the body in y so that they do not cover the sections in the top view
    var labelY = p.W / 2 + 0.3;
    labelStat.position.copy(toScene({ x: p.xs + p.L0 / 2, y: labelY, t: statRange.tMax + 0.25 }));
    var labelMov = makeLabel(t('sceneMoving', { beta: p.beta.toFixed(2) }), { color: th.mov, background: th.labelBg, height: 0.2 });
    labelMov.position.copy(toScene({ x: (movTube[4].x + movTube[5].x) / 2, y: labelY, t: movRange.tMax + 0.25 }));
    this.dynamic.add(labelStat, labelMov);

    // Clock ticks: one section per unit of proper time along each tube. Seen from
    // above all heights collapse, so the group is hidden in the top view.
    this.ticks = new THREE.Group();
    this.ticks.visible = this.viewName !== 'top';
    this.dynamic.add(this.ticks);
    if (p.showTicks) {
      var ticks = this.ticks;
      var tickLabel = function (text, color, anchor, ev) {
        var l = makeLabel(text, { color: color, background: th.labelBg, height: 0.16, anchor: anchor });
        l.position.copy(toScene(ev));
        return l;
      };
      P.stationaryTicks({ xs: p.xs, L0: p.L0, W: p.W, tMin: statRange.tMin, tMax: statRange.tMax }).forEach(function (k) {
        ticks.add(polygonMesh(k.corners, COLORS.statEdge, 0.45, 3));
        ticks.add(polygonOutline(k.corners, COLORS.statEdge));
        ticks.add(tickLabel('t = ' + k.tau, th.stat, 1, { x: p.xs - 0.08, y: -p.W / 2, t: k.tau }));
      });
      P.movingTicks({ beta: p.beta, x0: p.x0, L0: p.L0, W: p.W, tMin: movRange.tMin, tMax: movRange.tMax }).forEach(function (k) {
        ticks.add(polygonMesh(k.corners, COLORS.movEdge, 0.45, 3));
        ticks.add(polygonOutline(k.corners, COLORS.movEdge));
        ticks.add(tickLabel('t′ = ' + k.tau, th.mov, 0, { x: k.corners[1].x + 0.08, y: -p.W / 2, t: k.corners[1].t }));
      });
    }

    // "now" plane of the body at rest: t = tNow
    var planeCorners = [
      { x: b.xMin, y: -b.yMax, t: p.tNow }, { x: b.xMax, y: -b.yMax, t: p.tNow },
      { x: b.xMax, y: b.yMax, t: p.tNow }, { x: b.xMin, y: b.yMax, t: p.tNow }
    ];
    this.dynamic.add(polygonMesh(planeCorners, COLORS.plane, 0.28, 2));
    this.dynamic.add(polygonOutline(planeCorners, COLORS.plane));
    var lp = makeLabel('t = ' + p.tNow.toFixed(2), { color: th.plane, background: th.labelBg, height: 0.2 });
    lp.position.copy(toScene({ x: b.xMax - 0.3, y: b.yMax - 0.2, t: p.tNow + 0.1 }));
    this.dynamic.add(lp);

    // Sections are raised slightly above their plane to avoid z-fighting.
    var lift = 0.004;
    var raise = function (c, dt) { return c.map(function (e) { return { x: e.x, y: e.y, t: e.t + dt }; }); };
    var statSlice = {
      corners: [
        { x: p.xs, y: -p.W / 2, t: p.tNow }, { x: p.xs + p.L0, y: -p.W / 2, t: p.tNow },
        { x: p.xs + p.L0, y: p.W / 2, t: p.tNow }, { x: p.xs, y: p.W / 2, t: p.tNow }
      ],
      length: p.L0
    };
    var movSlice = P.sliceAtLabTime({ beta: p.beta, x0: p.x0, L0: p.L0, W: p.W, t: p.tNow });
    this.dynamic.add(polygonMesh(raise(statSlice.corners, lift), COLORS.stat, 1, 5));
    this.dynamic.add(polygonOutline(raise(statSlice.corners, lift), COLORS.statEdge));
    this.dynamic.add(polygonMesh(raise(movSlice.corners, lift), COLORS.mov, 1, 5));
    this.dynamic.add(polygonOutline(raise(movSlice.corners, lift), COLORS.movEdge));
    this.dynamic.add(dimension(statSlice.corners[0], statSlice.corners[1],
      'L₀ = ' + statSlice.length.toFixed(2), COLORS.statEdge, th.stat, th.labelBg, -0.18, lift));
    this.dynamic.add(dimension(movSlice.corners[0], movSlice.corners[1],
      'L₀/γ = ' + movSlice.length.toFixed(2), COLORS.movEdge, th.mov, th.labelBg, -0.18, lift));

    // Clock readings at the ends of the sections. Labels are anchored outward so
    // that the two readings of a short section never overlap.
    var clockLift = 0.22;
    var clockLabel = function (text, color, anchor, ev) {
      var l = makeLabel(text, { color: color, background: th.labelBg, height: 0.18, anchor: anchor });
      l.position.copy(toScene(ev));
      return l;
    };
    var movClocks = P.movingClocksAtLabTime({ beta: p.beta, x0: p.x0, L0: p.L0, W: p.W, t: p.tNow });
    var clockY = p.W / 2 + 0.12;
    this.dynamic.add(clockLabel('t = ' + p.tNow.toFixed(2), th.stat, 0.5,
      { x: p.xs + p.L0 / 2, y: clockY, t: p.tNow + clockLift }));
    this.dynamic.add(clockLabel('t′ = ' + movClocks.rear.toFixed(2), th.mov, 1,
      { x: movSlice.corners[0].x, y: clockY, t: p.tNow + clockLift }));
    this.dynamic.add(clockLabel('t′ = ' + movClocks.front.toFixed(2), th.mov, 0,
      { x: movSlice.corners[1].x, y: clockY, t: p.tNow + clockLift }));

    var result = {
      gamma: g,
      statLength: statSlice.length,
      movLength: movSlice.length,
      angleDeg: Math.atan(p.beta) * 180 / Math.PI,
      statClock: p.tNow,
      movClockRear: movClocks.rear,
      movClockFront: movClocks.front,
      properStat: p.tMax - p.tMin,
      properMov: (p.tMax - p.tMin) / g
    };

    // "now" plane of the moving body: t' = tau
    if (p.showMovingPlane) {
      var pl = P.movingNowPlane({ beta: p.beta, x0: p.x0, tau: p.tau });
      var tAt = function (x) { return pl.slope * x + pl.intercept; };
      var plane2 = [
        { x: b.xMin, y: -b.yMax, t: tAt(b.xMin) }, { x: b.xMax, y: -b.yMax, t: tAt(b.xMax) },
        { x: b.xMax, y: b.yMax, t: tAt(b.xMax) }, { x: b.xMin, y: b.yMax, t: tAt(b.xMin) }
      ];
      this.dynamic.add(polygonMesh(plane2, COLORS.plane2, 0.3, 2));
      this.dynamic.add(polygonOutline(plane2, COLORS.plane2Edge));
      var lp2 = makeLabel('t′ = ' + p.tau.toFixed(2), { color: th.mov, background: th.labelBg, height: 0.2 });
      lp2.position.copy(toScene({ x: b.xMax - 0.3, y: -b.yMax + 0.2, t: tAt(b.xMax - 0.3) + 0.1 }));
      this.dynamic.add(lp2);

      var lift2 = lift * Math.sqrt(1 + p.beta * p.beta);
      this.dynamic.add(polygonMesh(raise(movingProper.corners, lift2), COLORS.mov, 1, 5));
      this.dynamic.add(polygonOutline(raise(movingProper.corners, lift2), COLORS.movEdge));
      this.dynamic.add(polygonMesh(raise(stationaryInMoving.corners, lift2), COLORS.stat, 1, 5));
      this.dynamic.add(polygonOutline(raise(stationaryInMoving.corners, lift2), COLORS.statEdge));
      this.dynamic.add(dimension(movingProper.corners[3], movingProper.corners[2],
        'L₀ = ' + movingProper.minkowskiLength.toFixed(2) + ' ' + t('sceneProper'), COLORS.movEdge, th.mov, th.labelBg, 0.18, lift2));
      this.dynamic.add(dimension(stationaryInMoving.corners[3], stationaryInMoving.corners[2],
        'L₀/γ = ' + stationaryInMoving.minkowskiLength.toFixed(2), COLORS.statEdge, th.stat, th.labelBg, 0.18, lift2));

      // the stationary clocks are synchronized in the lab: on the tilted plane they read different times
      var mc = movingProper.corners, sc = stationaryInMoving.corners;
      var clockY2 = -p.W / 2 - 0.12;
      this.dynamic.add(clockLabel('t′ = ' + p.tau.toFixed(2), th.mov, 0.5,
        { x: (mc[0].x + mc[1].x) / 2, y: clockY2, t: (mc[0].t + mc[1].t) / 2 + clockLift }));
      this.dynamic.add(clockLabel('t = ' + sc[0].t.toFixed(2), th.stat, 1,
        { x: sc[0].x, y: clockY2, t: sc[0].t + clockLift }));
      this.dynamic.add(clockLabel('t = ' + sc[1].t.toFixed(2), th.stat, 0,
        { x: sc[1].x, y: clockY2, t: sc[1].t + clockLift }));

      result.movProper = movingProper.minkowskiLength;
      result.statInMoving = stationaryInMoving.minkowskiLength;
      result.euclMov = movingProper.euclideanLength;
      result.euclStat = stationaryInMoving.euclideanLength;
      result.movClockProper = p.tau;
      result.statClockLeft = sc[0].t;
      result.statClockRight = sc[1].t;
    }

    // light cone from the event (x0, 0, tMin)
    if (p.showLightCone) {
      var apex = { x: p.x0, y: 0, t: p.tMin };
      var d = p.tMax - p.tMin;
      var cone = new THREE.Mesh(new THREE.ConeGeometry(d, d, 48, 1, true), new THREE.MeshBasicMaterial({
        color: COLORS.cone, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false
      }));
      cone.rotation.x = Math.PI; // apex at the bottom
      cone.position.copy(toScene({ x: apex.x, y: apex.y, t: apex.t + d / 2 }));
      cone.renderOrder = 1;
      this.dynamic.add(cone);
      var dash = new THREE.LineDashedMaterial({ color: COLORS.cone, dashSize: 0.15, gapSize: 0.08 });
      P.lightCone(apex, p.tMax).forEach(function (seg) { self.dynamic.add(lineBetween(seg[0], seg[1], dash)); });
      var lc = makeLabel(t('sceneCone'), { color: th.cone, background: th.labelBg, height: 0.2 });
      // inside the cone, just right of the left generatrix, above the body at rest
      lc.position.copy(toScene({ x: apex.x - 0.75 * d + 1, y: 0, t: apex.t + 0.75 * d }));
      this.dynamic.add(lc);
    }

    if (boundsChanged) this.setView(this.viewName);
    return result;
  };

  root.SpaceTimeScene = SpaceTimeScene;
})(typeof self !== 'undefined' ? self : this);
