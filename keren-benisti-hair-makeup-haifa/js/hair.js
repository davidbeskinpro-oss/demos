/* Hair: draws real-looking locks of hair on a canvas, strand by strand.
   Strands grow in clumps (as hair does), each with its own thickness, lightness and a slight wave; the colour runs
   along the strand from root to tip, the tips taper out, and a soft sheen sits where light would catch the lock.
   Drawn once per size (never per frame); scrolling only moves the canvases with transforms. */
(function () {
  'use strict';
  var H = window.Hair = {};

  function rnd(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
  }
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function tone(c, k) { return k >= 1 ? mix(c, [255, 255, 255], Math.min(1, k - 1)) : c.map(function (v) { return v * k; }); }
  function css(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')'; }
  // colour at t (0 root .. 1 tip) along a list of stops
  function along(stops, t) {
    if (stops.length === 1) return stops[0];
    var x = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x));
    return mix(stops[i], stops[i + 1], x - i);
  }
  function bez(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  }

  function fit(cv) {
    var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    cv.width = Math.round(w * d); cv.height = Math.round(h * d);
    var ctx = cv.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  // one strand: sampled bezier with a small travelling wave, stroked in short runs so colour and alpha follow the length
  function strand(ctx, P, o) {
    var N = o.samples, pts = [], i;
    for (i = 0; i <= N; i++) {
      var t = i / N, p = bez(P[0], P[1], P[2], P[3], t), q = bez(P[0], P[1], P[2], P[3], Math.min(1, t + 0.01));
      var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      var w = Math.sin(t * o.freq + o.phase) * o.amp * (0.3 + t);           // the wave grows toward the free tip
      pts.push([p[0] - dy / L * w, p[1] + dx / L * w]);
    }
    // one continuous stroke per strand (no joints to show), coloured by a gradient laid along it from root to tip;
    // the taper comes from a second, thinner pass that runs only along the upper part of the strand
    var g = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[N][0], pts[N][1]);
    for (i = 0; i <= 12; i++) {
      var m = i / 12;
      var fade = Math.min(1, m / 0.07) * Math.pow(Math.max(0, 1 - Math.max(0, (m - o.tipFrom) / (1 - o.tipFrom))), 1.4);
      var sheen = Math.exp(-Math.pow((m - o.sheenAt) / 0.12, 2)) * o.sheen;
      g.addColorStop(m, css(tone(o.colour(m), o.k + sheen), o.alpha * fade));
    }
    ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = o.width * 0.62;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i <= N; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.lineWidth = o.width * 0.38;
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i <= Math.round(N * 0.55); i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // A lock that flows across a seam: roots off the start edge (top band), tips toward the far side (lower band).
  // opt: { from:'#hex', to:'#hex', across:[hex...] (optional per-strand colours), seed, density }
  H.sweep = function (cv, opt) {
    var f = fit(cv), ctx = f.ctx, w = f.w, h = f.h, R = rnd(opt.seed || 7);
    var A = rgb(opt.from), B = rgb(opt.to), across = opt.across ? opt.across.map(rgb) : null;
    var n = Math.round(Math.min(230, Math.max(80, w / 6.5)) * (opt.density || 1));
    var clumps = [], k;
    for (k = 0; k < 11; k++) clumps.push({ u: (k + 0.5) / 11 + (R() - 0.5) * 0.05, j1: (R() - 0.5), j2: (R() - 0.5), ph: R() * 6.28, fr: 7 + R() * 7, len: 0.8 + R() * 0.26 });
    ctx.lineCap = 'round';
    // a soft glow under the lock, as light scattered through the fibres
    ctx.save(); ctx.filter = 'blur(14px)'; ctx.globalAlpha = 0.5;
    for (k = 0; k < clumps.length; k++) {
      var c0 = clumps[k], cc = across ? across[Math.min(across.length - 1, Math.floor(c0.u * across.length))] : null;
      var g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, css(cc || A, 0)); g.addColorStop(0.35, css(cc || A, 0.35)); g.addColorStop(0.8, css(cc || B, 0.3)); g.addColorStop(1, css(cc || B, 0));
      ctx.strokeStyle = g; ctx.lineWidth = 8;
      var y0 = h * (0.04 + 0.32 * c0.u), y3 = h * (0.58 + 0.34 * c0.u);
      ctx.beginPath(); ctx.moveTo(-0.04 * w, y0); ctx.bezierCurveTo(w * 0.36, y0 + h * 0.03, w * 0.5, y3 - h * 0.03, w * 0.98, y3); ctx.stroke();
    }
    ctx.restore();
    for (var i = 0; i < n; i++) {
      var c = clumps[Math.floor(R() * clumps.length)], u = c.u + (R() - 0.5) * 0.085;
      var yy0 = h * (0.04 + 0.32 * u) + (R() - 0.5) * 3, yy3 = h * (0.58 + 0.34 * u) + c.j2 * h * 0.04 + (R() - 0.5) * 5;
      var x3 = w * (c.len - R() * 0.12), fly = R() > 0.9 ? (R() - 0.5) * h * 0.12 : 0;   // a few fly-aways leave the clump
      var xs = -w * (0.03 + R() * 0.14);                                       // roots start at different points off the edge
      var P = [[xs, yy0], [w * (0.34 + c.j1 * 0.05), yy0 + h * (0.03 + c.j1 * 0.03)], [w * (0.5 + c.j2 * 0.05), yy3 - h * (0.03 + c.j2 * 0.03) + fly], [x3, yy3 + fly * 0.6]];
      var col = across ? (function (cc2) { return function (m) { return mix(cc2, tone(cc2, 0.75), m * 0.4); }; })(mix(across[Math.min(across.length - 1, Math.floor(Math.max(0, Math.min(0.999, u)) * across.length))], across[Math.min(across.length - 1, Math.floor(Math.max(0, Math.min(0.999, u)) * across.length) + 1)], (u * across.length) % 1 * 0.35))
                       : function (m) { return along([A, A, mix(A, B, 0.5), B, B], m); };
      var hi = R();
      strand(ctx, P, {
        samples: 48, freq: c.fr, phase: c.ph + R() * 0.6, amp: 1.2 + R() * 2.2,
        width: hi > 0.93 ? 1.7 : 0.55 + R() * 0.9, alpha: hi > 0.93 ? 0.95 : 0.35 + R() * 0.45,
        k: hi > 0.93 ? 1.25 : hi < 0.18 ? 0.6 : 0.85 + R() * 0.3,
        sheen: 0.25 + R() * 0.15, sheenAt: 0.38 + (R() - 0.5) * 0.1, tipFrom: 0.72 + R() * 0.15, colour: col
      });
    }
  };

  // A hanging lock (a swatch, or the lock on the colouring board): roots gathered at the top, tips loose and uneven.
  // opt: { stops:['#root', ..., '#tip'], seed, density, spread }
  H.hang = function (cv, opt) {
    var f = fit(cv), ctx = f.ctx, w = f.w, h = f.h, R = rnd(opt.seed || 3);
    var stops = opt.stops.map(rgb), n = Math.round(Math.min(320, Math.max(40, w * 1.5)) * (opt.density || 1));
    var cx = w / 2, rootW = w * (opt.root || 0.34), tipW = w * (opt.spread || 0.62), top = h * (opt.top || 0.02);
    ctx.lineCap = 'round';
    if (opt.glow !== false) {
      ctx.save(); ctx.filter = 'blur(' + Math.max(4, w * 0.05) + 'px)'; ctx.globalAlpha = 0.45;
      var g = ctx.createLinearGradient(0, top, 0, h);
      g.addColorStop(0, css(stops[0], 0.2)); g.addColorStop(0.5, css(along(stops, 0.5), 0.35)); g.addColorStop(1, css(stops[stops.length - 1], 0));
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(cx - rootW / 2, top); ctx.lineTo(cx + rootW / 2, top); ctx.lineTo(cx + tipW / 2, h * 0.9); ctx.lineTo(cx - tipW / 2, h * 0.9); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    var clumps = [], k, sway = (opt.sway == null ? 0.05 : opt.sway) * w;
    for (k = 0; k < 9; k++) clumps.push({ u: (k + 0.5) / 9, j: (R() - 0.5), ph: R() * 6.28, fr: 5 + R() * 6, len: 0.84 + R() * 0.14 });
    // build every strand first, then draw the back of the lock before the front, so it has depth
    var list = [];
    for (var i = 0; i < n; i++) {
      var c = clumps[Math.floor(R() * clumps.length)], u = Math.max(0, Math.min(1, c.u + (R() - 0.5) * 0.08)), s = u - 0.5;
      var stray = R() > 0.94 ? (R() - 0.5) * w * 0.16 : 0;                     // a few strands leave their clump near the tip
      // the lock bulges a little below the clip, sways gently, then the clumps part and fall
      var x0 = cx + s * rootW, x3 = cx + s * tipW + c.j * w * 0.1 + (R() - 0.5) * 4 + stray + sway * 0.3, y3 = h * (c.len - R() * 0.07);
      var P = [[x0, top], [cx + s * rootW * 1.5 + sway * 0.6, h * 0.24], [x3 - c.j * w * 0.12 + sway * 0.9 - stray * 0.4, h * 0.6], [x3, y3]];
      list.push({ P: P, c: c, s: s, depth: R(), hi: R(), u: u });
    }
    list.sort(function (a2, b2) { return a2.depth - b2.depth; });
    list.forEach(function (L) {
      var hi = L.hi, shade = (0.58 + 0.42 * L.depth) * (1 - 0.5 * Math.pow(Math.abs(L.s) * 2, 2.2));   // back strands and the lock's edges sit in shadow
      strand(ctx, L.P, {
        samples: 40, seg: 2, freq: L.c.fr, phase: L.c.ph + R() * 0.5, amp: 0.8 + R() * 1.6 * (opt.wave || 1),
        width: (hi > 0.94 ? 1.5 : 0.5 + R() * 0.8) * (opt.thick || 1), alpha: hi > 0.94 ? 0.95 : 0.45 + R() * 0.45,
        k: (hi > 0.94 ? 1.22 : hi < 0.16 ? 0.7 : 0.9 + R() * 0.25) * (opt.flat ? 1 : shade),
        sheen: opt.sheen == null ? 0.22 : opt.sheen, sheenAt: 0.3 + (R() - 0.5) * 0.08, tipFrom: 0.8,
        colour: opt.across ? (function (cc) { return function (m) { return tone(cc, 0.8 + 0.2 * m); }; })(stops[Math.min(stops.length - 1, Math.floor(L.u * stops.length))]) : function (m) { return along(stops, m); }
      });
    });
  };
})();
