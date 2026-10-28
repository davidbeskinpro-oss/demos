/* Coat: the back of a fluffy dog, drawn hair by hair against the dark of the grooming room.
   Progress p runs 0..4: 0 matted -> 1 combed out -> 2 washed -> 3 blow-dried -> 4 scissored.
   The outline tells the story the way it really goes: ragged and lumpy with mats, flat and spiky when wet,
   big and frizzy under the dryer, one smooth even curve after the shears.
   Everything driven by p is deterministic, so scrolling back up undoes it exactly.
   The pointer (mouse, or a sideways finger swipe) combs the coat: mats loosen over a few passes, the hair
   follows the stroke, and every touch parts the coat for a moment before it springs back. */
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sm = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var lerpAng = function (a, b, t) { var d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * t; };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // cream/apricot coat ramps [dark .. highlight]: clean dry, dirty felt, soaked
  var CLEAN = [[118, 88, 58], [152, 118, 82], [184, 150, 108], [208, 178, 136], [226, 202, 164], [238, 220, 188], [246, 234, 212], [252, 245, 230]];
  var DIRTY = [[84, 72, 58], [106, 92, 76], [126, 112, 94], [144, 130, 110], [160, 146, 126], [174, 160, 140], [186, 172, 152], [198, 184, 164]];
  var WET = [[64, 44, 26], [86, 60, 36], [108, 78, 48], [128, 94, 60], [148, 112, 74], [168, 130, 88], [188, 150, 106], [210, 176, 134]];
  var mix = function (a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; };
  var css = function (c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')'; };
  var SEG = 7;

  function Coat(canvas, opt) {
    opt = opt || {};
    this.cv = canvas; this.c = canvas.getContext('2d');
    this.p = 0; this.t = 0; this.live = false; this.raf = 0;
    this.flip = !!opt.flip;                       // head on the right (English) or the left (Hebrew)
    this.onChange = opt.onChange || function () {};
    this.pointer = { on: false, x: 0, y: 0, vx: 0, vy: 0, last: -1e9 };
    this.resize();
    this.bind();
  }
  var C = Coat.prototype;

  C.resize = function () {
    var r = this.cv.getBoundingClientRect();
    var W = Math.max(240, Math.round(r.width)), H = Math.max(240, Math.round(r.height));
    var dpr = Math.min(window.devicePixelRatio || 1, W < 700 ? 2 : 1.5);
    this.W = W; this.H = H; this.dpr = dpr;
    this.cv.width = Math.round(W * dpr); this.cv.height = Math.round(H * dpr);
    this.u = Math.min(W * 0.62, H) / 520;
    var tall = H > W * 1.1; this.tb = tall ? 0.2 : 0.40; this.tk = tall ? 0.09 : 0.16;   // phones: the back line sits higher
    this.build();
    this.draw();
  };

  // the back line: a gentle arc, highest over the shoulders-to-hips middle
  C.top = function (x) { var q = 2 * x / this.W - 1; return this.H * (this.tb + this.tk * q * q); };
  C.normal = function (x) { var q = 2 * x / this.W - 1, d = this.H * this.tk * 2 * q * 2 / this.W; return Math.atan2(-1, d); };
  C.tail = function () { return this.flip ? Math.PI : 0; };   // the coat grows back toward the tail

  C.build = function () {
    var W = this.W, H = this.H, u = this.u, R = rng(935), self = this;
    var cell = this.cell = Math.max(12, 22 * u);
    this.cols = Math.ceil(W / cell) + 1; this.rows = Math.ceil(H / cell) + 1;
    var n = this.cols * this.rows;
    this.userC = new Float32Array(n); this.dragAng = new Float32Array(n); this.dragW = new Float32Array(n);
    this.partX = new Float32Array(n); this.partY = new Float32Array(n);
    // the comb works the coat row by row from the back line down, the way a groomer line-combs
    this.order = new Float32Array(n);
    for (var j = 0; j < this.rows; j++) for (var i = 0; i < this.cols; i++) {
      var y = (j + 0.5) * cell, x = (i + 0.5) * cell, d = clamp((y - this.top(x) + 40 * u) / (H - this.top(x) + 40 * u), 0, 1);
      this.order[j * this.cols + i] = clamp(d * 0.9 + (this.flip ? 1 - x / W : x / W) * 0.1, 0, 1);
    }

    // mats: felted knots, a few sitting right on the back line where they lift the outline
    var mats = this.mats = [], km = Math.round(W * H / 60000) + 6;
    for (var k = 0; k < km; k++) {
      var mx = lerp(0.06, 0.94, R()) * W, onTop = k < km * 0.35;
      var my = onTop ? this.top(mx) + lerp(4, 22, R()) * u : lerp(this.top(mx) + 50 * u, H * 0.96, R());
      mats.push({ x: mx, y: my, r: lerp(42, 78, R()) * u, tuft: { done: -1, vx: 0, vy: 0, spin: lerp(-3, 3, R()), off: [] } });
      for (var q = 0; q < 18; q++) mats[k].tuft.off.push([lerp(-1, 1, R()) * 12 * u, lerp(-1, 1, R()) * 9 * u, R() * TAU, lerp(10, 22, R()) * u]);
      var felt = mats[k].felt = [];                                   // tight coils packed into the knot
      for (q = 0; q < 120; q++) {
        var fr = Math.sqrt(R()), fa = R() * TAU, ox = Math.cos(fa) * fr * mats[k].r * 0.66, oy = Math.sin(fa) * fr * mats[k].r * 0.44, wa = R() * TAU, pts2 = [ox, oy];
        for (var st = 0; st < 7; st++) { wa += lerp(-1.5, 1.5, R()); ox += Math.cos(wa) * 3.4 * u; oy += Math.sin(wa) * 3.4 * u; pts2.push(ox, oy); }
        felt.push({ p: pts2, sh: clamp(Math.floor(R() * 6) + (oy < 0 ? 2 : 0), 0, 7) });
      }
    }
    var bits = this.bits = [];
    mats.forEach(function (m, idx) {
      for (var b = 0; b < 1 + (idx % 2); b++) bits.push({ x: m.x + lerp(-0.45, 0.45, R()) * m.r, y: m.y + lerp(-0.3, 0.4, R()) * m.r, kind: R() < 0.6 ? 'leaf' : 'burr',
        s: lerp(8, 13, R()) * u, rot: R() * TAU, spin: lerp(-4, 4, R()), vx: lerp(-0.5, 0.5, R()) });
    });

    // locks: hairs grow in little bundles that share a shape; that bundle structure is what reads as fur
    var hairs = this.hairs = [], area = W * (H - H * this.tb), N = Math.round(clamp(area / (W < 700 ? 75 : 95), 1600, 6000));
    var lockStep = 11 * u, perLock = Math.max(4, Math.round(N * lockStep * lockStep / area));
    this.Lmean = 0;
    for (var ly = this.top(W / 2) - 8 * u; ly < H + 30 * u; ly += lockStep * 0.86) {
      for (var lx = -20 * u; lx < W + 20 * u; lx += lockStep) {
        var cx = lx + lerp(-0.5, 0.5, R()) * lockStep, cy = ly + lerp(-0.5, 0.5, R()) * lockStep * 0.8;
        if (cy < this.top(cx) - 6 * u) continue;
        var lw = new Float32Array(SEG), a = 0;
        for (var s = 0; s < SEG; s++) { a += lerp(-1, 1, R()); lw[s] = a; }
        var lShade = R(), lJit = lerp(-1, 1, R()), lLen = lerp(78, 122, Math.pow(R(), 0.7)) * u;
        for (var h = 0; h < perLock; h++) {
          var hx = cx + lerp(-1, 1, R()) * 5 * u, hy = cy + lerp(-1, 1, R()) * 4 * u;
          var walk = new Float32Array(SEG); a = 0;
          for (s = 0; s < SEG; s++) { a += lerp(-1, 1, R()); walk[s] = lw[s] * 0.85 + a * 0.35; }
          var wMat = 0, mi = -1;
          for (k = 0; k < mats.length; k++) {
            var dd = Math.hypot(hx - mats[k].x, (hy - mats[k].y) * 1.1) / (mats[k].r * 1.25);
            var w = Math.pow(sm(1 - dd), 0.75); if (w > wMat) { wMat = w; mi = k; }
          }
          var depth = clamp((hy - this.top(hx)) / (H - this.top(hx)), 0, 1);
          var L = lLen * lerp(0.86, 1.1, R()) * (1 - depth * 0.25);
          this.Lmean += L;
          hairs.push({ x: hx, y: hy, L: L, walk: walk, jit: lJit * 0.8 + lerp(-1, 1, R()) * 0.2, shade: lShade * 0.65 + R() * 0.35,
            depth: depth, phase: R() * TAU, mat: mi, wMat: wMat, lock: hairs.length - h, hl: R() < 0.14,
            cellI: this.cellAt(hx, hy), pts: new Float32Array((SEG + 1) * 2) });
        }
      }
    }
    this.Lmean /= hairs.length;
    this.shell = this.Lmean * 0.6;                     // how far the scissored outline stands off the skin
    this.Lcut = this.Lmean * 0.92;
    hairs.sort(function (a, b) { return b.y - a.y; });
    // lock index -> its first hair after sorting is irrelevant; wet clumping groups by lock id

    this.beads = [];
    for (k = 0; k < 34; k++) this.beads.push({ x: R(), d: lerp(0.08, 0.9, R()), per: lerp(1.4, 3, R()), ph: R(), r: lerp(2.6, 4.4, R()) * u });
    this.foam = [];
    var nf = Math.round(W * H / 26000) + 6;
    for (k = 0; k < nf; k++) {
      var fx = lerp(0.04, 0.96, R()) * W, fy = lerp(this.top(fx) - 10 * u, H * 0.92, R()), patch = [];
      var nb = 60 + Math.floor(R() * 50);
      for (var b2 = 0; b2 < nb; b2++) { var ra = Math.pow(R(), 0.6), aa = R() * TAU; patch.push([Math.cos(aa) * ra * 46 * u, Math.sin(aa) * ra * 24 * u, lerp(1.4, 6.5, Math.pow(R(), 2.6)) * u]); }
      this.foam.push({ x: fx, y: fy, b: patch, d: R(), drift: lerp(0.7, 1.2, R()) });
    }
    this.streams = [];
    for (k = 0; k < 46; k++) this.streams.push({ a: lerp(-0.42, 0.42, R()), ph: R(), sp: lerp(1.6, 2.4, R()), w: lerp(0.8, 1.8, R()) * u });
    this.airs = [];
    for (k = 0; k < 34; k++) this.airs.push({ y: R(), ph: R(), sp: lerp(1.1, 1.8, R()), len: lerp(60, 150, R()) * u });
    this.splash = [];
    for (k = 0; k < 40; k++) this.splash.push({ x: R(), ph: R(), vx: lerp(-1, 1, R()), vy: lerp(0.6, 1.2, R()) });

    this.bake();
  };

  C.cellAt = function (x, y) {
    var i = clamp(Math.floor(x / this.cell), 0, this.cols - 1), j = clamp(Math.floor(y / this.cell), 0, this.rows - 1);
    return j * this.cols + i;
  };

  // skin and dense under-coat inside the back line, painted once per size
  C.bake = function () {
    var W = this.W, H = this.H, u = this.u, R = rng(77), self = this;
    var b = this.under = document.createElement('canvas');
    b.width = this.cv.width; b.height = this.cv.height;
    var c = b.getContext('2d'); c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.beginPath(); c.moveTo(0, H);
    for (var x = 0; x <= W; x += 8) c.lineTo(x, this.top(x) + 10 * u);
    c.lineTo(W, H); c.closePath(); c.save(); c.clip();
    var g = c.createLinearGradient(0, this.top(W / 2), 0, H);
    g.addColorStop(0, '#b38c62'); g.addColorStop(1, '#6e5038');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.lineCap = 'round';
    ['rgba(92,66,42,.6)', 'rgba(170,134,96,.5)', 'rgba(214,184,142,.4)'].forEach(function (col, pass) {
      c.strokeStyle = col; c.lineWidth = (0.9 + pass * 0.3) * u; c.beginPath();
      for (var k = 0; k < W * H / 45; k++) {
        var x = R() * W, y = lerp(self.top(x), H, Math.sqrt(R())), a = lerpAng(self.normal(x), self.tail(), 0.6) + lerp(-0.5, 0.5, R()), l = lerp(7, 18, R()) * u;
        c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a - 0.3) * l * 0.5, y + Math.sin(a - 0.3) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
      }
      c.stroke();
    });
    c.restore();
  };

  // ---------------------------------------------------------------- state fields (all from p)
  C.autoC = function (ci) { var a = clamp(this.p, 0, 1); return sm((a * 1.35 - this.order[ci]) / 0.3); };
  C.fx = function (x) { return this.flip ? 1 - x / this.W : x / this.W; };          // 1 = the dryer's side
  C.wet = function (x, y) {
    var d = clamp((y - this.top(x)) / (this.H - this.top(x)), 0, 1);
    var inn = sm((this.p - 1) * 4.2 - d * 1.2);                                         // water runs down from the back line
    return inn * (1 - this.dried(x));
  };
  C.dried = function (x) { return sm((this.p - 2.1) * 2.3 - (1 - this.fx(x)) * 1.05); };  // dries from the dryer's side across
  C.airOn = function () { var p = this.p; return sm((p - 2.0) / 0.08) * (1 - sm((p - 2.92) / 0.08)); };
  C.cutT = function (x) { return 3.06 + 0.84 * (this.flip ? x / this.W : 1 - x / this.W); };   // shears run head to tail

  // ---------------------------------------------------------------- input
  C.bind = function () {
    var self = this, cv = this.cv, P = this.pointer, down = false, lx = 0, ly = 0, has = false;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { down = true; var q = pos(e); lx = q[0]; ly = q[1]; has = true; });
    cv.addEventListener('pointermove', function (e) {
      var q = pos(e), x = q[0], y = q[1];
      if ((e.pointerType === 'mouse' || down) && has) {
        var dx = x - lx, dy = y - ly, sp = Math.hypot(dx, dy);
        if (sp > 0.5 && sp < 180) self.stroke(lx, ly, x, y);
        P.on = true; P.x = x; P.y = y; P.vx = lerp(P.vx, dx, 0.3); P.vy = lerp(P.vy, dy, 0.3); P.last = performance.now();
        self.kick();
      }
      lx = x; ly = y; has = true;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { cv.addEventListener(t, function () { down = false; if (t === 'pointerleave') has = false; }); });
  };

  C.stroke = function (x0, y0, x1, y1) {
    var self = this, len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
    var steps = Math.max(1, Math.ceil(len / (this.cell * 0.5))), reach = 80 * this.u;
    var nx = -Math.sin(ang), ny = Math.cos(ang), before = this.removed();
    for (var s = 0; s <= steps; s++) {
      var t = s / steps, cx = lerp(x0, x1, t), cy = lerp(y0, y1, t);
      for (var o = -reach; o <= reach; o += this.cell * 0.5) {
        var px = cx + nx * o, py = cy + ny * o; if (px < 0 || py < 0 || px > this.W || py > this.H) continue;
        var ci = this.cellAt(px, py), f = 1 - Math.abs(o) / reach;
        if (this.p < 1.02) this.userC[ci] = Math.min(1, this.userC[ci] + 0.045 * f);
        this.dragAng[ci] = this.dragW[ci] > 0.02 ? lerpAng(this.dragAng[ci], ang, 0.3) : ang; this.dragW[ci] = Math.min(0.8, this.dragW[ci] + 0.07 * f);
        this.partX[ci] = clamp(this.partX[ci] + Math.cos(ang) * 7 * f * this.u, -30 * this.u, 30 * this.u);
        this.partY[ci] = clamp(this.partY[ci] + Math.sin(ang) * 7 * f * this.u, -30 * this.u, 30 * this.u);
      }
    }
    var now = performance.now();
    this.mats.forEach(function (m) {
      var ci = self.cellAt(m.x, m.y);
      if (m.tuft.done < 0 && self.userC[ci] > 0.7) { m.tuft.done = now; m.tuft.vx = Math.cos(ang) * 0.3; m.tuft.vy = Math.sin(ang) * 0.3; }
    });
    if (this.removed() !== before) this.onChange();
  };
  C.removed = function () { var n = 0; for (var i = 0; i < this.mats.length; i++) { var m = this.mats[i]; if (m.tuft.done >= 0 || this.autoC(this.cellAt(m.x, m.y)) > 0.72) n++; } return n; };
  C.reset = function () { this.userC.fill(0); this.dragW.fill(0); this.mats.forEach(function (m) { m.tuft.done = -1; }); this.onChange(); this.draw(); };

  // ---------------------------------------------------------------- loop
  C.set = function (p) { this.p = clamp(p, 0, 4); if (!this.raf) this.draw(); };
  C.start = function () { if (this.live) return; this.live = true; this.kick(); };
  C.stop = function () { this.live = false; cancelAnimationFrame(this.raf); this.raf = 0; this.draw(); };
  C.kick = function () {
    var self = this;
    if (this.raf) return;
    this.raf = requestAnimationFrame(function f(now) {
      self.raf = 0; self.t = now / 1000; self.draw();
      if (self.live || now - self.pointer.last < 1500 || self.busy) self.raf = requestAnimationFrame(f);
    });
  };

  // ---------------------------------------------------------------- draw
  C.draw = function () {
    var c = this.c, W = this.W, H = this.H, u = this.u, p = this.p, t = this.t, self = this;
    var air = this.airOn(), airAng = this.flip ? 0 : Math.PI, tail = this.tail();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.cv.width, this.cv.height);
    c.drawImage(this.under, 0, 0);
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.busy = false;
    for (var i = 0; i < this.partX.length; i++) { this.partX[i] *= 0.9; this.partY[i] *= 0.9; }

    this.mats.forEach(function (m) {
      var ci = self.cellAt(m.x, m.y), cc = Math.max(self.autoC(ci), self.userC[ci]), k = (1 - cc) * 0.5;
      if (k < 0.02) return;
      var g = c.createRadialGradient(m.x, m.y + m.r * 0.25, 0, m.x, m.y + m.r * 0.25, m.r * 0.8);
      g.addColorStop(0, 'rgba(40,26,14,' + k * 0.7 + ')'); g.addColorStop(1, 'rgba(40,26,14,0)');
      c.fillStyle = g; c.beginPath(); c.arc(m.x, m.y + m.r * 0.25, m.r * 0.8, 0, TAU); c.fill();
    });
    var wMid = this.wet(W / 2, H * 0.7);
    if (wMid > 0.01) {
      c.save(); c.beginPath(); c.moveTo(0, H); for (var x = 0; x <= W; x += 10) c.lineTo(x, this.top(x) + 10 * u); c.lineTo(W, H); c.clip();
      c.fillStyle = 'rgba(40,24,12,' + 0.45 * wMid + ')'; c.fillRect(0, 0, W, H); c.restore();
    }

    // ---- hair geometry
    var hs = this.hairs, n = hs.length, breath = Math.sin(t * 1.5) * 1.2 * u, buckets = {}, locks = {};
    var finish = sm((p - 3.9) / 0.1), lightAng = -Math.PI / 2 - 0.5;
    for (var k = 0; k < n; k++) {
      var s = hs[k], ci = s.cellI;
      var cmb = Math.max(this.autoC(ci), this.userC[ci]), me = s.wMat * (1 - cmb);
      var W8 = this.wet(s.x, s.y), dry = this.dried(s.x), fluff = dry * sm((p - 2.05) / 0.3);
      var front = 1.5 - (p - 2.1) * 2.3;
      var A = air * (0.25 + 0.75 * sm(1 - Math.abs(this.fx(s.x) - front) * 2)) * (1 - s.depth * 0.6);
      var nrm = this.normal(s.x);
      // growth: outward near the back line, back toward the tail and down the sides further down
      var grow = lerpAng(lerpAng(nrm, tail, 0.42), lerpAng(tail, Math.PI / 2, 0.45), s.depth);
      var base = grow + s.jit * (0.3 * (1 - cmb) + 0.08);
      base = lerpAng(base, lerpAng(grow, tail, 0.5), cmb * (1 - fluff) * 0.35);          // combed hair lies smoother
      base = lerpAng(base, nrm, fluff * 0.22 * (1 - s.depth));                            // blown dry, it lifts
      if (this.dragW[ci] > 0.01) {                                                       // a comb lays hair along its line, the way the hair grows
        var da = this.dragAng[ci], dd = Math.abs(((da - grow + Math.PI) % TAU + TAU) % TAU - Math.PI);
        if (dd > Math.PI / 2) da += Math.PI;
        base = lerpAng(base, da, this.dragW[ci] * 0.45 * Math.max(cmb, 0.3));
      }
      var curl = lerp(0.5, 1.5, me) * (1 - cmb * 0.78) + 0.1 + fluff * 0.42;
      var L = s.L * (1 - 0.14 * W8 + 0.16 * fluff);
      var cutNow = p >= this.cutT(s.x);
      if (cutNow) L = Math.min(L, this.Lcut);
      var wetFlat = lerpAng(tail, Math.PI / 2, 0.55 + s.depth * 0.3);                    // soaked hair clings along the body
      var seg = L / SEG, x = s.x + breath * (1 - s.depth), y = s.y, ang, pts = s.pts, px = this.partX[ci], py = this.partY[ci];
      pts[0] = x; pts[1] = y;
      for (var q = 0; q < SEG; q++) {
        var f = (q + 1) / SEG;
        ang = base + curl * s.walk[q] * 0.5;
        ang = lerpAng(ang, wetFlat, W8 * 0.75 * f);
        ang = lerpAng(ang, Math.PI / 2, 0.08 * f * (1 - fluff));                         // a little gravity on every hair
        if (A > 0.01) ang = lerpAng(ang, airAng + Math.sin(t * 12 + s.phase + q * 0.8) * 0.55, A * 0.6 * f);
        x += Math.cos(ang) * seg + px * f * 0.3; y += Math.sin(ang) * seg + py * f * 0.3;
        var X = x, Y = y;
        if (me > 0.02 && s.mat >= 0) { var m = this.mats[s.mat], pull = me * 0.62 * Math.pow(f, 1.1); X = lerp(X, m.x, pull); Y = lerp(Y, m.y - m.r * 0.15, pull); }
        pts[(q + 1) * 2] = X; pts[(q + 1) * 2 + 1] = Y;
      }
      // the scissored shell: nothing stands further off the skin than the groomer's line
      if (cutNow) {
        var lim = this.top(pts[0]) - this.shell * (0.98 + 0.02 * Math.sin(s.x * 0.05));
        for (q = 1; q <= SEG; q++) if (pts[q * 2 + 1] < lim) { pts[q * 2 + 1] = lim + (q - 1) * 0.15 * u; }
      }
      s.W8 = W8; s.me = me; s.cmb = cmb; s.ang = ang; s.fl = fluff;
      if (W8 > 0.05) {
        var lk = locks[s.lock] || (locks[s.lock] = { n: 0, x: new Float32Array(SEG + 1), y: new Float32Array(SEG + 1) });
        lk.n++; for (q = 1; q <= SEG; q++) { lk.x[q] += pts[q * 2]; lk.y[q] += pts[q * 2 + 1]; }
      }
    }
    for (k = 0; k < n; k++) {
      s = hs[k];
      if (s.W8 > 0.05) {                                                                // wet locks gather into points
        lk = locks[s.lock];
        for (q = 1; q <= SEG; q++) { var pf = s.W8 * 0.8 * Math.pow(q / SEG, 1.4); s.pts[q * 2] = lerp(s.pts[q * 2], lk.x[q] / lk.n, pf); s.pts[q * 2 + 1] = lerp(s.pts[q * 2 + 1], lk.y[q] / lk.n, pf); }
      }
      var clean = s.cmb * (1 - s.me);
      var sheen = Math.pow(Math.max(0, Math.cos(s.ang - lightAng)), 3) * (0.35 + 0.65 * clean);
      var rim = s.depth < 0.12 ? 1.2 : 0;                                              // light catching the outline
      var sh = clamp(Math.round(s.shade * 4.2 + (1 - s.depth) * 1.6 + sheen * 1.6 + rim + finish * 0.5 - s.me * 1.2), 0, 7);
      var dirt = s.me > 0.32 ? 2 : (s.wMat > 0.2 && s.cmb < 0.6 && p < 1.3) ? 1 : 0;
      var key = Math.round(s.W8 * 3) * 100 + dirt * 10 + sh;
      (buckets[key] || (buckets[key] = [])).push(s);
    }
    c.lineCap = 'round'; c.lineJoin = 'round';
    var lwBase = (W < 700 ? 1.25 : 1.05) * u;
    Object.keys(buckets).map(Number).sort(function (a, b) { return (a % 10) - (b % 10); }).forEach(function (key) {
      var sh = key % 10, dirt = Math.floor(key / 10) % 10, wq = Math.floor(key / 100);
      var col = mix(dirt === 2 ? DIRTY[sh] : dirt === 1 ? mix(CLEAN[sh], DIRTY[sh], 0.5) : CLEAN[sh], WET[sh], wq / 3);
      c.strokeStyle = css(col); c.lineWidth = lwBase * (0.85 + sh * 0.07);
      c.beginPath(); buckets[key].forEach(function (s) { self.path(c, s.pts); }); c.stroke();
    });
    var hlA = Math.max(wMid * 0.6, finish * 0.3, 0.1);
    c.strokeStyle = 'rgba(255,250,238,' + hlA + ')'; c.lineWidth = 0.6 * u; c.beginPath();
    for (k = 0; k < n; k++) if (hs[k].hl && hs[k].me < 0.3) this.path(c, hs[k].pts, 2, SEG - 1);
    c.stroke();

    this.drawFelt(c); this.drawBits(c); this.drawTufts(c); this.drawWater(c, t); this.drawClippings(c); this.drawTools(c, t);
  };

  C.path = function (c, pts, a, b) {
    a = a || 0; b = b == null ? SEG : b;
    c.moveTo(pts[a * 2], pts[a * 2 + 1]);
    for (var q = a + 1; q < b; q++) c.quadraticCurveTo(pts[q * 2], pts[q * 2 + 1], (pts[q * 2] + pts[q * 2 + 2]) / 2, (pts[q * 2 + 1] + pts[q * 2 + 3]) / 2);
    c.lineTo(pts[b * 2], pts[b * 2 + 1]);
  };


  // the knot itself: tight coils of dirty hair, lit from above, loosening as the comb works through
  C.drawFelt = function (c) {
    var self = this, u = this.u;
    c.lineCap = 'round';
    this.mats.forEach(function (m) {
      var ci = self.cellAt(m.x, m.y), cc = Math.max(self.autoC(ci), self.userC[ci]), k = 1 - sm(cc / 0.75);
      if (k < 0.03) return;
      var spread = 1 + (1 - k) * 0.7;
      m.felt.forEach(function (f) {
        c.strokeStyle = css(DIRTY[f.sh], 0.85 * k); c.lineWidth = 1.05 * u;
        c.beginPath(); c.moveTo(m.x + f.p[0] * spread, m.y + f.p[1] * spread);
        for (var q = 2; q < f.p.length; q += 2) c.lineTo(m.x + f.p[q] * spread, m.y + f.p[q + 1] * spread);
        c.stroke();
      });
    });
  };

  C.drawBits = function (c) {
    var self = this, u = this.u, H = this.H;
    if (this.p > 1.3) return;
    this.bits.forEach(function (b) {
      var ci = self.cellAt(b.x, b.y), cmb = Math.max(self.autoC(ci), self.userC[ci]);
      var e = clamp((cmb - 0.55) / 0.45, 0, 1) * 1.5, x = b.x + b.vx * e * 70 * u, y = b.y + 0.5 * 900 * u * e * e;
      if (y > H + 20 * u) return;
      c.save(); c.translate(x, y); c.rotate(b.rot + b.spin * e);
      if (b.kind === 'leaf') {                                       // a crumb of dry oak leaf
        c.fillStyle = '#6e4c26'; c.beginPath(); c.moveTo(-b.s, 0);
        c.bezierCurveTo(-b.s * 0.6, -b.s * 0.75, -b.s * 0.1, -b.s * 0.2, b.s * 0.25, -b.s * 0.6);
        c.bezierCurveTo(b.s * 0.55, -b.s * 0.2, b.s * 0.9, -b.s * 0.3, b.s, 0);
        c.bezierCurveTo(b.s * 0.6, b.s * 0.45, b.s * 0.2, b.s * 0.25, -b.s * 0.15, b.s * 0.55);
        c.bezierCurveTo(-b.s * 0.5, b.s * 0.4, -b.s * 0.8, b.s * 0.35, -b.s, 0); c.fill();
        c.strokeStyle = 'rgba(42,26,10,.8)'; c.lineWidth = 0.8 * u; c.beginPath(); c.moveTo(-b.s * 0.95, 0); c.lineTo(b.s * 0.85, -b.s * 0.02); c.stroke();
      } else {                                                        // a burr
        c.fillStyle = '#5b4826'; c.beginPath(); c.arc(0, 0, b.s * 0.42, 0, TAU); c.fill();
        c.strokeStyle = '#463619'; c.lineWidth = 0.9 * u; c.beginPath();
        for (var k = 0; k < 16; k++) { var a = k / 16 * TAU; c.moveTo(Math.cos(a) * b.s * 0.36, Math.sin(a) * b.s * 0.36); c.lineTo(Math.cos(a) * b.s * 0.82, Math.sin(a) * b.s * 0.82); }
        c.stroke();
      }
      c.restore();
    });
  };

  // the felted clump the comb works out of a mat: carried along the stroke, then it drops away
  C.drawTufts = function (c) {
    var self = this, u = this.u, now = performance.now();
    this.mats.forEach(function (m) {
      var tf = m.tuft, e, vx, vy;
      if (tf.done >= 0) { e = (now - tf.done) / 1000; vx = tf.vx; vy = tf.vy; if (e > 2) return; self.busy = true; }
      else {
        var pc = (self.order[self.cellAt(m.x, m.y)] + 0.21) / 1.35;
        if (self.p < pc || self.p > 1.3) return;
        e = (self.p - pc) * 9; vx = self.flip ? -0.1 : 0.1; vy = 0.25; if (e > 2) return;
      }
      var x = m.x + vx * e * 140 * u, y = m.y + vy * e * 140 * u + 0.5 * 600 * u * e * e;
      c.save(); c.translate(x, y); c.rotate(tf.spin * e * 0.6); c.globalAlpha = 1 - sm((e - 1.5) / 0.5);
      c.fillStyle = 'rgba(110,94,76,.9)'; c.beginPath(); c.ellipse(0, 0, 11 * u, 8 * u, 0.3, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(150,132,110,1)'; c.lineWidth = 1.1 * u; c.lineCap = 'round'; c.beginPath();
      tf.off.forEach(function (o) { var a = o[2]; c.moveTo(o[0], o[1]); c.bezierCurveTo(o[0] + Math.cos(a) * o[3], o[1] + Math.sin(a) * o[3], o[0] - Math.sin(a) * o[3] * 0.8, o[1] + Math.cos(a) * o[3] * 0.8, o[0] + Math.cos(a + 2) * o[3] * 0.5, o[1] + Math.sin(a + 2) * o[3] * 0.5); });
      c.stroke(); c.restore();
    });
  };

  C.showerAt = function () { return { x: this.W * (this.flip ? 0.62 : 0.38), y: Math.max(36 * this.u, this.top(this.W / 2) * 0.18) }; };

  C.drawWater = function (c, t) {
    var p = this.p, u = this.u, W = this.W, H = this.H, self = this, live = this.live;
    // spray: on to soak, off while the shampoo is worked in, on again to rinse
    var spray = (sm((p - 0.98) / 0.05) * (1 - sm((p - 1.3) / 0.04))) + (sm((p - 1.58) / 0.04) * (1 - sm((p - 1.94) / 0.05)));
    var head = this.showerAt();
    if (spray > 0.01) {
      c.lineCap = 'round';
      this.streams.forEach(function (s) {
        var ex = head.x + Math.tan(s.a) * H * 0.5, ey = self.top(clamp(ex, 0, W)) + 6 * u;
        var sx = head.x + s.a * 50 * u, sy = head.y + 14 * u;
        c.strokeStyle = 'rgba(206,232,248,' + 0.22 * spray + ')'; c.lineWidth = s.w;
        c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
        if (!live) return;
        for (var k = 0; k < 3; k++) {                                     // drops travelling down each stream
          var ph = (t * s.sp + s.ph + k / 3) % 1;
          var dx = lerp(sx, ex, ph), dy = lerp(sy, ey, ph);
          c.fillStyle = 'rgba(230,244,252,' + 0.75 * spray + ')'; c.beginPath(); c.ellipse(dx, dy, 1.2 * u, 3.6 * u, -s.a, 0, TAU); c.fill();
        }
      });
      if (live) this.splash.forEach(function (s) {                        // splashes where it lands on the coat
        var ph = (t * 2.2 + s.ph) % 1, bx = head.x + (s.x - 0.5) * H * 0.85, by = self.top(clamp(bx, 0, W));
        var x = bx + s.vx * ph * 26 * u, y = by - s.vy * 30 * u * ph + 0.5 * 120 * u * ph * ph;
        c.fillStyle = 'rgba(225,240,250,' + 0.7 * spray * (1 - ph) + ')'; c.beginPath(); c.arc(x, y, 1.5 * u, 0, TAU); c.fill();
      });
    }
    // lather: worked into the coat in patches, then the rinse carries it down until it breaks up
    var lath = sm((p - 1.3) / 0.14), rinse = sm((p - 1.6) / 0.32);
    if (lath > 0 && rinse < 1) {
      this.foam.forEach(function (f) {
        var g = sm(lath * 1.4 - f.d * 0.4); if (g <= 0) return;
        var dy = rinse * rinse * H * 0.8 * f.drift, thin = sm((rinse - 0.25 - f.d * 0.3) / 0.4);
        if (thin >= 1) return;
        f.b.forEach(function (b, i) {
          if (i / f.b.length < thin) return;
          var r = b[2] * g, x = f.x + b[0] * (1 + rinse * 0.3) + Math.sin(t * 2 + i) * 0.4 * u, y = f.y + b[1] + dy * (0.8 + (i % 5) * 0.06);
          c.fillStyle = 'rgba(250,251,252,.62)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(214,222,230,.55)'; c.lineWidth = 0.5 * u; c.stroke();
          c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.4, r * 0.25, 0, TAU); c.fill();
        });
      });
    }
    // beads of water running down the soaked coat
    if (live && p > 1.62 && p < 2.6) this.beads.forEach(function (b) {
      var x = b.x * W, y0 = self.top(x) + b.d * (H - self.top(x)) * 0.5, w = self.wet(x, y0);
      if (w < 0.4) return;
      var ph = (t / b.per + b.ph) % 1, y = y0 + ph * ph * H * 0.45, r = b.r * w;
      c.fillStyle = 'rgba(200,226,244,.5)'; c.beginPath(); c.ellipse(x, y, r, r * (1.2 + ph), 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.4, r * 0.32, 0, TAU); c.fill();
    });
    // dryer air sweeping across the outline, carrying drops off it
    var air = this.airOn();
    if (air > 0.01 && live) {
      var dir = this.flip ? 1 : -1;
      this.airs.forEach(function (a, i) {
        var k = (t * a.sp + a.ph) % 1, x = self.flip ? k * W * 1.2 - W * 0.1 : W * 1.1 - k * W * 1.2, y = lerp(H * 0.1, H * 0.62, a.y);
        c.strokeStyle = 'rgba(255,248,236,' + 0.16 * air * Math.sin(k * Math.PI) + ')'; c.lineWidth = 1.1 * u;
        c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + dir * a.len * 0.3, y - 6 * u, x + dir * a.len * 0.7, y + 6 * u, x + dir * a.len, y); c.stroke();
        if (i % 3 === 0 && p < 2.75) {
          var bx = x + dir * a.len, by = self.top(clamp(bx, 0, W)) - 10 * u - a.y * 30 * u;
          c.fillStyle = 'rgba(214,236,250,' + 0.7 * air * Math.sin(k * Math.PI) + ')'; c.beginPath(); c.ellipse(bx, by, 3.2 * u, 1.6 * u, 0, 0, TAU); c.fill();
        }
      });
    }
  };

  // what the shears take off drifts down past the coat
  C.drawClippings = function (c) {
    var p = this.p, u = this.u, H = this.H, hs = this.hairs;
    if (p < 3.06 || p > 4.0001 && false) return;
    c.strokeStyle = 'rgba(244,228,198,.95)'; c.lineWidth = 1.1 * u; c.lineCap = 'round'; c.beginPath();
    for (var k = 0; k < hs.length; k += 4) {
      var s = hs[k]; if (s.depth > 0.1) continue;
      var tc = this.cutT(s.x); if (p < tc) continue;
      var e = (p - tc) * 12, x0 = s.pts[SEG * 2], y0 = s.pts[SEG * 2 + 1] - 4 * u;
      var y = y0 + 0.5 * 260 * u * e * e, x = x0 + Math.sin(e * 3 + s.phase) * 9 * u;
      if (y > H + 10 * u) continue;
      var a = s.phase + e * 3 * s.jit, l = 9 * u + (s.L - this.Lcut) * 0.2;
      c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.4) * l * 0.5, y + Math.sin(a + 0.4) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    }
    c.stroke();
  };

  // ---------------------------------------------------------------- tools
  C.drawTools = function (c, t) {
    var p = this.p, P = this.pointer, u = this.u, W = this.W, H = this.H, now = performance.now();
    if (P.on && now - P.last < 900) {
      this.comb(c, P.x, P.y, Math.atan2(P.vy, P.vx) + Math.PI / 2, 1 - sm((now - P.last - 500) / 400)); this.busy = true;
    } else if (p > 0.02 && p < 0.99) {
      var a = clamp(p, 0, 1), row = clamp(a * 1.35 - 0.1, 0, 1), sw = Math.sin(a * Math.PI * 10);
      var x = W * (0.5 + 0.38 * sw), y = this.top(x) + row * (H - this.top(x)) * 0.9 + 26 * u;
      this.comb(c, x, y, sw * 0.18 + (this.flip ? -0.15 : 0.15), sm(p / 0.04) * (1 - sm((p - 0.95) / 0.04)));
    }
    var sh = sm((p - 0.92) / 0.08) * (1 - sm((p - 1.94) / 0.06));
    if (sh > 0.01) { var hd = this.showerAt(); this.shower(c, hd.x, hd.y - (1 - sh) * 90 * u, sh); }
    var dr = this.airOn();
    if (dr > 0.01) {
      var nx = this.flip ? lerp(-150, 150, dr) * u : W - lerp(-150, 150, dr) * u;
      this.dryer(c, nx, this.top(W / 2) * 0.5 + Math.sin(t * 1.7) * 8 * u, dr);
    }
    if (p > 3.0 && p < 3.97) {
      var o = clamp((p - 3.06) / 0.84, 0, 1), sx = this.flip ? o * W : W - o * W;
      var sy = this.top(sx) - this.shell, tan = Math.atan2(this.H * this.tk * 2 * (2 * sx / W - 1) * 2 / W, 1);
      this.shears(c, sx, sy, Math.abs(Math.sin(p * 230)), tan, sm((p - 3.0) / 0.05) * (1 - sm((p - 3.92) / 0.05)));
    }
  };

  // steel greyhound comb: coarse teeth one half, fine the other
  C.comb = function (c, x, y, rot, a) {
    var u = this.u, L = 190 * u, sp = 16 * u, tl = 44 * u;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot);
    c.fillStyle = 'rgba(16,10,4,.28)'; c.beginPath(); c.roundRect(-L / 2 + 5 * u, -sp / 2 + 7 * u, L, sp, sp / 2); c.fill();
    c.lineCap = 'round';
    for (var k = 0; k < 40; k++) {
      var tx = -L / 2 + 7 * u + k * (L - 14 * u) / 39, fine = k >= 20;
      if (!fine && k % 2) continue;
      c.strokeStyle = '#80868c'; c.lineWidth = (fine ? 1.6 : 2.6) * u;
      c.beginPath(); c.moveTo(tx, 0); c.lineTo(tx, sp / 2 + tl); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 0.7 * u;
      c.beginPath(); c.moveTo(tx - 0.6 * u, sp / 2); c.lineTo(tx - 0.6 * u, sp / 2 + tl * 0.85); c.stroke();
    }
    var g = c.createLinearGradient(0, -sp / 2, 0, sp / 2);
    g.addColorStop(0, '#f6f7f8'); g.addColorStop(0.42, '#a4a9ae'); g.addColorStop(0.58, '#dcdfe2'); g.addColorStop(1, '#757a80');
    c.fillStyle = g; c.beginPath(); c.roundRect(-L / 2, -sp / 2, L, sp, sp / 2); c.fill();
    c.restore();
  };

  C.shower = function (c, x, y, a) {
    var u = this.u;
    c.save(); c.globalAlpha = a; c.translate(x, y);
    c.fillStyle = '#5c6268'; c.save(); c.rotate(this.flip ? -0.5 : 0.5); c.fillRect(-7 * u, -150 * u, 14 * u, 150 * u); c.restore();
    var g = c.createLinearGradient(0, -22 * u, 0, 18 * u); g.addColorStop(0, '#f1f3f5'); g.addColorStop(0.5, '#9ea4aa'); g.addColorStop(1, '#5a6066');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 58 * u, 18 * u, 0, 0, TAU); c.fill();
    c.fillStyle = '#41464c'; c.beginPath(); c.ellipse(0, 7 * u, 46 * u, 9 * u, 0, 0, TAU); c.fill();
    c.fillStyle = '#c9cfd4';
    for (var k = 0; k < 26; k++) { var a2 = k / 26 * TAU, r = (k % 2 ? 22 : 36) * u; c.beginPath(); c.arc(Math.cos(a2) * r, 7 * u + Math.sin(a2) * r * 0.22, 1.4 * u, 0, TAU); c.fill(); }
    c.restore();
  };

  // a high-velocity dryer hose with its flat nozzle aimed across the coat
  C.dryer = function (c, x, y, a) {
    var u = this.u;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(this.flip ? -1 : 1, 1); c.rotate(-0.32);
    c.strokeStyle = '#25292d'; c.lineWidth = 34 * u; c.lineCap = 'round';
    c.beginPath(); c.moveTo(200 * u, -40 * u); c.quadraticCurveTo(110 * u, 0, 40 * u, 0); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 2 * u;
    for (var k = 0; k < 9; k++) { var xx = 60 * u + k * 16 * u; c.beginPath(); c.moveTo(xx, -15 * u - k * 2 * u); c.lineTo(xx + 4 * u, 15 * u - k * 2 * u); c.stroke(); }
    var g = c.createLinearGradient(0, -20 * u, 0, 20 * u); g.addColorStop(0, '#7a8188'); g.addColorStop(0.5, '#d4d9dd'); g.addColorStop(1, '#4a5056');
    c.fillStyle = g; c.beginPath(); c.moveTo(48 * u, -20 * u); c.lineTo(-48 * u, -8 * u); c.lineTo(-48 * u, 8 * u); c.lineTo(48 * u, 20 * u); c.closePath(); c.fill();
    c.fillStyle = '#16191c'; c.fillRect(-51 * u, -8 * u, 4 * u, 16 * u);
    c.restore();
  };

  // straight grooming shears riding the outline, blades opening and closing
  C.shears = function (c, x, y, open, tan, a) {
    var u = this.u, ang = 0.04 + open * 0.3;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(tan + (this.flip ? Math.PI : 0)); if (this.flip) c.scale(1, -1);
    c.fillStyle = 'rgba(10,6,2,.28)'; c.beginPath(); c.ellipse(-30 * u, 18 * u, 130 * u, 12 * u, 0, 0, TAU); c.fill();
    for (var side = -1; side <= 1; side += 2) {
      c.save(); c.rotate(side * ang / 2);
      var g = c.createLinearGradient(0, -7 * u, 0, 7 * u); g.addColorStop(0, '#fbfcfd'); g.addColorStop(0.5, '#a2a8ae'); g.addColorStop(1, '#5a6066');
      c.fillStyle = g; c.beginPath(); c.moveTo(6 * u, -5 * u * side); c.lineTo(-170 * u, -0.8 * u * side); c.lineTo(-170 * u, 0.6 * u * side); c.quadraticCurveTo(-80 * u, 8 * u * side, 6 * u, 6 * u * side); c.closePath(); c.fill();
      c.strokeStyle = '#6f757b'; c.lineWidth = 5.5 * u; c.lineCap = 'round';
      c.beginPath(); c.moveTo(4 * u, 0); c.quadraticCurveTo(30 * u, side * 10 * u, 48 * u, side * 24 * u); c.stroke();
      c.lineWidth = 4.5 * u; c.beginPath(); c.ellipse(64 * u, side * 32 * u, 17 * u, 12 * u, side * 0.5, 0, TAU); c.stroke();
      if (side > 0) { c.beginPath(); c.moveTo(70 * u, 44 * u); c.quadraticCurveTo(84 * u, 58 * u, 96 * u, 56 * u); c.stroke(); }   // finger rest
      c.restore();
    }
    c.fillStyle = '#e8ebee'; c.beginPath(); c.arc(0, 0, 5.5 * u, 0, TAU); c.fill();
    c.fillStyle = '#4a5056'; c.beginPath(); c.arc(0, 0, 2.2 * u, 0, TAU); c.fill();
    c.restore();
  };

  window.Coat = Coat;
})();
