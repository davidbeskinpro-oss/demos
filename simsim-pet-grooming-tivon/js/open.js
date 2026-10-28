/* Opening: her business card, made of clippings.
   Thousands of short hairs fly in and settle into the black schnauzer from her own card (sampled from the real
   card image, so the silhouette is hers), her line writes itself in orange, then a gust from the dryer side blows
   the hairs away and the page shows through. Plays once per visit, under 1.5 s, any tap or key skips it, never
   runs with the animations switched off. */
(function () {
  'use strict';
  var root = document.documentElement, el = document.querySelector('.opening');
  if (!el) return;
  var seen = false; try { seen = sessionStorage.getItem('opened') === '1'; } catch (e) {}
  if (root.classList.contains('still') || seen) { el.remove(); root.classList.add('opened'); return; }
  try { sessionStorage.setItem('opened', '1'); } catch (e) {}

  var cv = el.querySelector('canvas'), c = cv.getContext('2d'), line = el.querySelector('.op-line');
  var W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2), hairs = [], t0 = 0, raf = 0, done = false;
  cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var out = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var rtl = root.dir === 'rtl';

  function finish() {
    if (done) return; done = true; cancelAnimationFrame(raf);
    el.classList.add('gone'); root.classList.add('opened'); dispatchEvent(new Event('simsim-opened'));
    setTimeout(function () { el.remove(); }, 450);
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) { addEventListener(t, finish, { once: true, passive: true }); });

  var img = new Image();
  img.onload = function () {
    // sample the dark pixels of the schnauzer (left part of the card)
    var sw = 385, sh = 589, oc = document.createElement('canvas'); oc.width = sw; oc.height = sh;
    var o = oc.getContext('2d'); o.drawImage(img, 0, 0, sw, sh, 0, 0, sw, sh);
    var d; try { d = o.getImageData(0, 0, sw, sh).data; } catch (e) { finish(); return; }
    var pts = [], step = W < 700 ? 4 : 3;
    for (var y = 0; y < sh; y += step) for (var x = 0; x < sw; x += step) {
      var i = (y * sw + x) * 4, lum = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      if (lum < 90) pts.push([x, y, lum]);
    }
    var N = Math.min(pts.length, W < 700 ? 1600 : 3200), scale = Math.min(H * 0.62 / sh, W * 0.5 / sw);
    var ox = W * 0.1, oy = H * 0.47 - sh * scale / 2;           // the dog on the left, like on her card
    if (W < 700) { scale = Math.min(H * 0.42 / sh, W * 0.7 / sw); ox = W / 2 - sw * scale / 2; oy = H * 0.12; }
    for (var k = 0; k < N; k++) {
      var p = pts[Math.floor(Math.random() * pts.length)];
      var a = Math.random() * 6.283, r = Math.max(W, H) * (0.6 + Math.random() * 0.5);
      // the coat hangs down; ears and brows point up and forward
      var ang = p[1] < 140 ? -Math.PI / 2 + (Math.random() - 0.5) * 0.7 : Math.PI / 2 + 0.25 + (Math.random() - 0.5) * 0.8;
      hairs.push({ sx: W / 2 + Math.cos(a) * r, sy: H / 2 + Math.sin(a) * r, tx: ox + p[0] * scale + (Math.random() - 0.5) * step * scale,
        ty: oy + p[1] * scale + (Math.random() - 0.5) * step * scale, ang: ang, l: (5 + Math.random() * 9) * Math.max(0.7, scale),
        delay: Math.random() * 0.25, spin: (Math.random() - 0.5) * 8, col: p[2] < 40 ? '#14110e' : p[2] < 70 ? '#2b2621' : '#4a443d',
        gx: (rtl ? -1 : 1) * (300 + Math.random() * 700), gy: (Math.random() - 0.6) * 260, gd: Math.random() * 0.18 });
    }
    t0 = performance.now(); raf = requestAnimationFrame(frame);
  };
  img.onerror = finish;
  img.src = el.dataset.card;

  function frame(now) {
    var t = (now - t0) / 1000;
    c.clearRect(0, 0, W, H); c.lineCap = 'round'; c.lineWidth = W < 700 ? 1.3 : 1.5;
    var buckets = {};
    hairs.forEach(function (h) {
      var a = out((t - h.delay) / 0.62), x = h.sx + (h.tx - h.sx) * a, y = h.sy + (h.ty - h.sy) * a, ang = h.ang + h.spin * (1 - a);
      var g = clamp((t - 0.95 - h.gd) / 0.5, 0, 1);                  // the gust: blown off from the dryer side
      if (g > 0) { var e = g * g; x += h.gx * e + Math.sin(t * 9 + h.ty) * 18 * g; y += h.gy * e; ang += h.spin * g * 0.6; }
      var k = h.col + (g > 0 ? '|' + Math.round((1 - g) * 4) : '|4');
      (buckets[k] || (buckets[k] = [])).push([x, y, ang, h.l]);
    });
    Object.keys(buckets).forEach(function (k) {
      var parts = k.split('|'); c.strokeStyle = parts[0]; c.globalAlpha = +parts[1] / 4; c.beginPath();
      buckets[k].forEach(function (s) { var dx = Math.cos(s[2]) * s[3] / 2, dy = Math.sin(s[2]) * s[3] / 2; c.moveTo(s[0] - dx, s[1] - dy); c.quadraticCurveTo(s[0] + dy * 0.3, s[1] - dx * 0.3, s[0] + dx, s[1] + dy); });
      c.stroke();
    });
    c.globalAlpha = 1;
    if (t > 0.55) line.classList.add('on');
    if (t > 1.05) el.classList.add('fade');
    if (t > 1.5) { finish(); return; }
    raf = requestAnimationFrame(frame);
  }
})();
