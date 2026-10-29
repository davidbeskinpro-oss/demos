(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ease = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 820; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var onMotion = [], onLang = [], onResize = [];

  // ------------------------------------------------------------ glyph decode (labels on the certificate wall)
  var GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKMNPRSTVXZ';
  function decode(el, txt) {
    clearInterval(el._dt);
    if (still()) { el.textContent = txt; return; }
    var f = 0, n = 16;
    el._dt = setInterval(function () {
      f++;
      el.textContent = txt.split('').map(function (c, i) { return c === ' ' || i < (f / n) * txt.length ? c : GL[(Math.random() * GL.length) | 0]; }).join('');
      if (f >= n) { clearInterval(el._dt); el.textContent = txt; }
    }, 32);
  }

  // ------------------------------------------------------------ language
  function texts() {
    var l = root.lang;
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-rail-prev]').forEach(function (b) { b.setAttribute('aria-label', he() ? 'הקודם' : 'Previous'); });
    $$('[data-rail-next]').forEach(function (b) { b.setAttribute('aria-label', he() ? 'הבא' : 'Next'); });
    $$('.d-call').forEach(function (b) { b.setAttribute('aria-label', he() ? 'חיוג לקרינה' : 'Call Karina'); });
    $$('.links').forEach(function (b) { b.setAttribute('aria-label', he() ? 'ניווט' : 'Navigation'); });
    $$('[data-rail]').forEach(function (b) { b.setAttribute('aria-label', he() ? 'טיפולים' : 'Treatments'); });
    var hi = 'שלום קרינה, הגעתי מהאתר ואשמח לקבוע תור.', en = 'Hi Karina, I found you through your website and would like to book an appointment.';
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/972543650200?text=' + encodeURIComponent(he() ? hi : en); });
    document.title = he() ? 'קרינה גנדל · פדיקור רפואי ופודולוגיה · דרך הים 3, חיפה' : 'Karina Gendel · Medical pedicure & podology · 3 Derech HaYam, Haifa';
    onLang.forEach(function (f) { f(); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('kg-lang', l); } catch (e) {}
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    try { history.replaceState(null, '', u); } catch (e) {}
    texts(); onResize.forEach(function (f) { f(); });
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------------------ motion switch
  var switches = $$('[data-motion]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); b.setAttribute('aria-label', he() ? 'אנימציות' : 'Animations'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('kg-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    onMotion.forEach(function (f) { f(); });
  }); });
  onLang.push(motionUI);

  // ------------------------------------------------------------ hours + live status (Israel time; null = closed)
  var H = [[9, 18], [9, 18], [9, 18], null, [9, 18], [8, 14], null];
  var DH = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], DE = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = now(), t = H[n.d], open = !!t && n.h >= t[0] && n.h < t[1], txt;
    if (open) txt = he() ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]);
    else {
      var k = 0, d, when;
      if (t && n.h < t[0]) { d = n.d; when = he() ? 'היום' : 'today'; }
      else { for (k = 1; k < 8; k++) { d = (n.d + k) % 7; if (H[d]) break; } when = k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DH[d] : 'on ' + DE[d]); }
      txt = he() ? 'סגור עכשיו · נפתח ' + when + ' ב-' + hhmm(H[d][0]) : 'Closed now · opens ' + when + ' at ' + hhmm(H[d][0]);
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var tb = $('[data-hours]');
    if (tb) tb.innerHTML = H.map(function (t, i) {
      return '<tr class="' + (t ? '' : 'closed') + (i === n.d ? ' today' : '') + '"><td>' + (he() ? DH[i] : DE[i]) + '</td><td>' + (t ? hhmm(t[0]) + '–' + hhmm(t[1]) : (he() ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
  }
  onLang.push(status); setInterval(status, 60000);

  // ------------------------------------------------------------ reveals
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.card[data-reveal]').forEach(function (c, i) { c.style.setProperty('--d', i * 80 + 'ms'); });
  $$('.bento [data-reveal]').forEach(function (c, i) { c.style.setProperty('--d', i * 70 + 'ms'); });
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ------------------------------------------------------------ nav gathers into the lacquered shelf bar
  var nav = $('[data-nav]');
  function navS() { nav.classList.toggle('gather', scrollY > 60); }
  addEventListener('scroll', navS, { passive: true }); navS();

  // ------------------------------------------------------------ the magnifier lens (hero photo + certificate wall)
  function cover(W, Hh, iw, ih, px, py) { var s = Math.max(W / iw, Hh / ih), rw = iw * s, rh = ih * s; return { rw: rw, rh: rh, ox: (W - rw) * px, oy: (Hh - rh) * py }; }
  function lens(host, spots, onArrive) {
    var iw = +host.dataset.iw, ih = +host.dataset.ih, px = +host.dataset.px, py = +host.dataset.py, z = +(host.dataset.zoom || 1.6);
    host.style.setProperty('--z', z);
    var W = 0, Hh = 0, cx = -1, cy = -1, tx = 0, ty = 0, raf = 0, vis = false, auto = 0, autoT = null, hold = 0, mouse = false, cur = -1;
    function size() { W = host.clientWidth; Hh = host.clientHeight; }
    function at(fx, fy) { var c = cover(W, Hh, iw, ih, px, py); return [c.ox + fx * c.rw, c.oy + fy * c.rh]; }
    function put(x, y) { cx = x; cy = y; host.style.setProperty('--lx', x.toFixed(1) + 'px'); host.style.setProperty('--ly', y.toFixed(1) + 'px'); }
    function frame() {
      raf = 0;
      var k = still() ? 1 : .12;
      put(cx + (tx - cx) * k, cy + (ty - cy) * k);
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > .6) raf = requestAnimationFrame(frame);
      else if (onArrive && cur >= 0) onArrive(cur, cx, cy);
    }
    function go(x, y, idx) { tx = x; ty = y; cur = idx == null ? -1 : idx; if (onArrive && cur < 0) onArrive(-1); if (cx < 0) put(x, y); if (!raf) raf = requestAnimationFrame(frame); }
    function spot(i) { var s = spots[i], p = at(s[0], s[1]); go(p[0], p[1], i); }
    function next() { auto = (auto + 1) % spots.length; spot(auto); }
    function loop() { clearInterval(autoT); autoT = null; if (!still() && vis && spots.length > 1) autoT = setInterval(function () { if (Date.now() > hold && !mouse) next(); }, 2800); }
    host.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mouse = true; var r = host.getBoundingClientRect(); go(e.clientX - r.left, e.clientY - r.top);
    });
    host.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mouse = false; spot(auto); } });
    host.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      var r = host.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = -1, bd = 1e9;
      spots.forEach(function (s, i) { var p = at(s[0], s[1]), d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = i; } });
      hold = Date.now() + 6000;
      if (best >= 0 && bd < 90) { auto = best; spot(best); } else go(x, y);
    });
    size();
    onResize.push(function () { size(); spot(auto); });
    onMotion.push(loop);
    watch(host, function (v) { vis = v; loop(); });
    spot(0);
    return { spot: function (i) { auto = i; hold = Date.now() + 7000; spot(i); }, get z() { return z; } };
  }

  // hero lens + typed callouts
  var hero = $('.hero-pic'), callout = $('[data-callout]'), cbox = $('.callout');
  var hs = $$('.spots i', hero).map(function (i) { return [+i.dataset.x, +i.dataset.y, i]; });
  var lastSpot = -1;
  function typeOut(el, txt) {
    clearInterval(el._tt);
    if (still()) { el.textContent = txt; return; }
    var i = 0; el.textContent = '';
    el._tt = setInterval(function () { i++; el.textContent = txt.slice(0, i); if (i >= txt.length) clearInterval(el._tt); }, 28);
  }
  var heroLens = lens(hero, hs, function (i, x, y) {
    if (i < 0) { lastSpot = -1; callout.textContent = ''; return; }
    if (hero.classList.contains('dealing')) return;
    var r = parseFloat(getComputedStyle(hero).getPropertyValue('--lr')) * heroLens.z, w = hero.clientWidth;
    var txt = hs[i][2].dataset[root.lang];
    if (i !== lastSpot || callout.textContent !== txt) { lastSpot = i; typeOut(callout, txt); }
    var cw = Math.min(260, txt.length * 9 + 30);
    var left = x + r + 18 + cw > w - 10 ? x - r - 18 - cw : x + r + 18;
    left = clamp(left, 10, w - cw - 10);
    cbox.style.setProperty('--cx', left + 'px'); cbox.style.setProperty('--cy', clamp(y - 18, 12, hero.clientHeight - 120) + 'px');
  });
  onLang.push(function () { lastSpot = -1; heroLens.spot(0); });

  // the opening: her photos are dealt like cards into the frame; the last one, Karina herself, opens into the hero
  (function deal() {
    if (still() || !hero.animate) return;
    var d = $('.deal', hero), cards = $$('img', d), W = hero.clientWidth, Hh = hero.clientHeight;
    var cw = W * .46, chh = cw * 4 / 3, it = Math.max(0, (Hh - chh) / 2), is = (W - cw) / 2;
    d.style.display = 'block'; hero.classList.add('dealing');
    cards.forEach(function (c, i) {
      var o = i - 1.5;
      c.animate([{ opacity: 0, transform: 'translate(-50%,-50%) translateY(50%) rotate(' + (o * 14) + 'deg)' },
                 { opacity: 1, transform: 'translate(-50%,-50%) translate(' + (o * 26) + 'px,' + (-Math.abs(o) * 8) + 'px) rotate(' + (o * 6) + 'deg)' }],
        { duration: 520, delay: i * 110, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
      c.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%,-50%) translate(' + (o * 160) + 'px,' + (-80 - Math.abs(o) * 30) + 'px) rotate(' + (o * 16) + 'deg)' }],
        { duration: 520, delay: 1050 + i * 40, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    });
    var clip0 = 'inset(' + it + 'px ' + is + 'px ' + it + 'px ' + is + 'px round 18px)';
    var a = hero.animate([{ clipPath: clip0, transform: 'translateY(40%)', opacity: 0 }, { clipPath: clip0, transform: 'translateY(0)', opacity: 1, offset: .3 }, { clipPath: clip0, transform: 'none', opacity: 1, offset: .62 }, { clipPath: 'inset(0px 0px 0px 0px round 28px)', transform: 'none', opacity: 1 }],
      { duration: 1650, delay: 300, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' });
    a.onfinish = function () { d.remove(); hero.classList.remove('dealing'); heroLens.spot(0); };
    hero.addEventListener('pointerdown', function () { a.finish(); cards.forEach(function (c) { c.getAnimations().forEach(function (x) { x.finish(); }); }); }, { once: true });
  })();
  if (still()) { var dl = $('.deal', hero); if (dl) dl.remove(); }

  // certificate wall: tap a topic and the lens travels to that frame
  var wall = $('.wall-pic'), tbtn = $$('[data-topics] button');
  var ws = tbtn.map(function (b) { return [+b.dataset.x, +b.dataset.y]; });
  function topicLabels() { tbtn.forEach(function (b) { decode($('b', b), b.dataset[root.lang]); }); }
  var wallLens = lens(wall, ws, function (i) { if (i < 0) return; tbtn.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); });
  tbtn.forEach(function (b, i) { b.addEventListener('click', function () { wallLens.spot(i); decode($('b', b), b.dataset[root.lang]); }); });
  watch($('[data-topics]'), function (v) { if (v) topicLabels(); }, { threshold: .3 });
  onLang.push(topicLabels);

  // ------------------------------------------------------------ the S-shelf: one lacquered ribbon down the page, a row of polish per shelf
  var main = $('main'), svg = $('[data-ribbon]'), NS = 'http://www.w3.org/2000/svg';
  var ROWS = {
    care: ['#2f6d7a', '#3f8a96', '#1f4f5a', '#5aa3ac', '#2b5d4f', '#7cc0c9', '#244852'],
    clinic: ['#e3c1ad', '#d8b29c', '#f0d9cb', '#c9a08b', '#efe6dc', '#b98c7a'],
    wall: ['#b3263a', '#8f1d2c', '#c2283c', '#6f1522', '#d23a4a', '#9e2f3c'],
    reviews: ['#d9799b', '#e48db0', '#b45a8a', '#f0a7c0', '#8e4a8f', '#c66aa0'],
    book: ['#a9b85a', '#7d8c38', '#c9d37f', '#5e6b2c', '#e3c1ad', '#b3263a'],
    visit: ['#e9a3a6', '#d9799b', '#b3263a', '#e3c1ad', '#2f6d7a', '#a9b85a']
  };
  var R = { paths: [], len: 0, cur: 0, goal: 0, samp: [], bottles: [], bead: null, chs: [], raf: 0 };
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function buildRibbon() {
    var W = main.clientWidth, Hm = main.scrollHeight, ph = phone();
    var inset = ph ? 6 : 20, w = ph ? 6 : 11, r = ph ? 22 : 46, bw = ph ? 12 : 19, sp = ph ? 16 : 26, n = ph ? 8 : 13;
    var secs = $$('main > .ch').slice(1);
    svg.setAttribute('width', W); svg.setAttribute('height', Hm); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hm);
    svg.textContent = '';
    R.chs = $$('main > .ch').map(function (s) { return [s.offsetTop, s.dataset.bead]; });
    var ys = secs.map(function (s) { return s.offsetTop; });
    var dir = root.dir === 'rtl' ? -1 : 1, d = '', shelves = [];
    var sx = dir > 0 ? W * .18 : W * .82;
    d = 'M' + sx + ' ' + ys[0];
    ys.forEach(function (y, i) {
      var dr = i % 2 ? -dir : dir, ex = dr > 0 ? W - inset : inset, x0 = i ? (dr > 0 ? inset + r : W - inset - r) : sx;
      var last = i === ys.length - 1;
      shelves.push({ y: y, x0: x0, dr: dr, key: secs[i].id });
      if (last) { d += ' H' + (dr > 0 ? W * .78 : W * .22); return; }
      var sw = dr > 0 ? 1 : 0;
      d += ' H' + (ex - dr * r) + ' A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + ex + ' ' + (y + r) + ' V' + (ys[i + 1] - r) + ' A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + (ex - dr * r) + ' ' + ys[i + 1];
    });
    var g = el('g', {});
    var sh = el('path', { d: d, class: 'sh', 'stroke-width': w + 3, transform: 'translate(0 ' + (ph ? 3 : 5) + ')' });
    var lq = el('path', { d: d, class: 'lq', 'stroke-width': w });
    var hi = el('path', { d: d, class: 'hi', 'stroke-width': Math.max(1.5, w * .22), transform: 'translate(0 ' + (-w * .22) + ')' });
    g.appendChild(sh); g.appendChild(lq); g.appendChild(hi); svg.appendChild(g);
    R.paths = [sh, lq, hi]; R.len = lq.getTotalLength();
    R.paths.forEach(function (p) { p.style.strokeDasharray = R.len + ' ' + R.len; });
    R.samp = []; var N = Math.ceil(R.len / 12);
    for (var k = 0; k <= N; k++) { var L = R.len * k / N, pt = lq.getPointAtLength(L); R.samp.push([L, pt.y]); }
    // bottles on each shelf, coloured by the chapter that begins there
    R.bottles = [];
    var acc = 0, lastY = -1;
    shelves.forEach(function (s, i) {
      // length at the start of this shelf: first sample whose y reaches the shelf
      var Ls = 0; for (var k = 0; k < R.samp.length; k++) if (R.samp[k][1] >= s.y - .5) { Ls = R.samp[k][0]; break; }
      var row = ROWS[s.key] || ROWS.visit, bh = bw * 2;
      var c = W * (s.dr > 0 ? .58 : .42) + (i % 2 ? -1 : 1) * W * .06, x = c - (n - 1) * sp / 2;
      for (var b = 0; b < n; b++) {
        var bx = x + b * sp, gg = el('g', { class: 'bt' });
        var h = bh * (.86 + ((b * 7 + i * 3) % 5) * .05);
        var u = el('use', { href: '#bottle', x: bx - bw / 2, y: s.y - w / 2 - h, width: bw, height: h });
        u.style.color = row[(b * 3 + i) % row.length];
        gg.appendChild(u); svg.appendChild(gg);
        var dist = s.dr > 0 ? bx - s.x0 : s.x0 - bx;
        R.bottles.push([gg, Ls + Math.max(0, dist)]);
      }
    });
    R.bead = el('circle', { r: w * .95, class: 'bead', fill: '#e9a3a6' }); svg.appendChild(R.bead);
    R.cur = still() ? R.len : Math.min(R.cur, R.len);
    ribbonGoal(); paintRibbon();
  }
  function ribbonGoal() {
    if (still()) { R.goal = R.len; return; }
    var y = -main.getBoundingClientRect().top + innerHeight * .62, lo = 0, hi = R.samp.length - 1;
    if (!R.samp.length || y < R.samp[0][1]) { R.goal = 0; return; }
    while (lo < hi) { var m = (lo + hi + 1) >> 1; if (R.samp[m][1] <= y) lo = m; else hi = m - 1; }
    R.goal = R.samp[lo][0];
  }
  function paintRibbon() {
    var off = R.len - R.cur;
    R.paths.forEach(function (p) { p.style.strokeDashoffset = off; });
    R.bottles.forEach(function (b) { b[0].classList.toggle('off', b[1] > R.cur + 1); });
    if (!R.paths[1]) return;
    var on = !still() && R.cur > 2 && R.cur < R.len - 2;
    R.bead.style.display = on ? '' : 'none';
    if (on) {
      var p = R.paths[1].getPointAtLength(R.cur); R.bead.setAttribute('cx', p.x); R.bead.setAttribute('cy', p.y);
      var col = R.chs[0][1]; R.chs.forEach(function (c) { if (p.y >= c[0] - 2) col = c[1]; }); R.bead.setAttribute('fill', col);
    }
  }
  function tickRibbon() {
    R.raf = 0;
    var dlt = R.goal - R.cur;
    R.cur += Math.abs(dlt) < 1 ? dlt : dlt * .1 + (dlt > 0 ? 1.5 : -1.5);
    if ((dlt > 0 && R.cur > R.goal) || (dlt < 0 && R.cur < R.goal)) R.cur = R.goal;
    paintRibbon();
    if (R.cur !== R.goal) R.raf = requestAnimationFrame(tickRibbon);
  }
  function ribbonScroll() { ribbonGoal(); if (still()) { R.cur = R.goal; paintRibbon(); } else if (!R.raf) R.raf = requestAnimationFrame(tickRibbon); }
  addEventListener('scroll', ribbonScroll, { passive: true });
  onMotion.push(function () { ribbonGoal(); R.cur = still() ? R.len : R.cur; paintRibbon(); ribbonScroll(); });

  // ------------------------------------------------------------ treatments rail
  var rail = $('[data-rail]'), bar = $('[data-rail-bar]');
  function railBar() {
    var max = rail.scrollWidth - rail.clientWidth, p = max > 0 ? Math.abs(rail.scrollLeft) / max : 0, wr = rail.clientWidth / rail.scrollWidth;
    bar.style.width = (wr * 100) + '%'; bar.style.marginInlineStart = (p * (1 - wr) * 100) + '%';
  }
  rail.addEventListener('scroll', railBar, { passive: true });
  function railBy(k) { var c = $('.card', rail); var s = (c.offsetWidth + 18) * k * (root.dir === 'rtl' ? -1 : 1); rail.scrollBy({ left: s, behavior: still() ? 'auto' : 'smooth' }); }
  $('[data-rail-prev]').addEventListener('click', function () { railBy(-1); });
  $('[data-rail-next]').addEventListener('click', function () { railBy(1); });
  (function drag() {
    var down = false, x0 = 0, s0 = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = rail.scrollLeft; rail.style.scrollSnapType = 'none'; });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; rail.scrollLeft = s0 - dx; });
    addEventListener('pointerup', function () { if (!down) return; down = false; rail.style.scrollSnapType = ''; });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();
  onResize.push(railBar);

  // ------------------------------------------------------------ clinic: photo cards that land on one another
  var cards = $$('[data-stack] .sc');
  cards.forEach(function (c, i) { c.style.setProperty('--i', i); });
  function stackS() {
    cards.forEach(function (c, i) {
      var nx = cards[i + 1];
      if (still() || !nx) { c.style.transform = ''; c.style.filter = ''; c.classList.remove('under'); return; }
      var top = parseFloat(getComputedStyle(nx).top) || 0, t = clamp(1 - (nx.getBoundingClientRect().top - top) / (innerHeight * .7), 0, 1);
      c.classList.toggle('under', nx.getBoundingClientRect().top < c.querySelector('figcaption').getBoundingClientRect().bottom + 4); c.style.transform = 'scale(' + (1 - t * .06).toFixed(4) + ')'; c.style.filter = t > 0 ? 'brightness(' + (1 - t * .35).toFixed(3) + ')' : '';
    });
  }
  addEventListener('scroll', stackS, { passive: true }); onMotion.push(stackS);

  // ------------------------------------------------------------ 5.0 fills in, reviews drift
  var score = $('[data-fill]');
  watch(score, function (v) {
    if (!v || score._done) return; score._done = 1;
    if (still()) return;
    var t0 = performance.now();
    (function f(t) { var p = ease((t - t0) / 1400); score.style.setProperty('--f', (p * 100).toFixed(1) + '%'); if (p < 1) requestAnimationFrame(f); })(t0);
  }, { threshold: .6 });
  var drift = $('[data-drift]'), track = $('.track', drift), orig = $$('.rv', track);
  function driftSet() {
    $$('.rv.clone', track).forEach(function (c) { c.remove(); });
    if (still()) { drift.classList.remove('go'); return; }
    orig.forEach(function (c) { var k = c.cloneNode(true); k.classList.add('clone'); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });
    track.style.setProperty('--dur', Math.round(track.scrollWidth / 2 / 40) + 's');
  }
  driftSet(); onMotion.push(driftSet);
  watch(drift, function (v) { drift.classList.toggle('go', v && !still()); });

  // ------------------------------------------------------------ the booking card
  var card = $('[data-card]'), form = $('[data-composer]'), msg = $('[data-msg]'), send = $('[data-send]');
  var TH = ['פדיקור רפואי', 'טיפול בכף רגל סוכרתית', 'טיפול ביבלות ובסדקים', 'טיפול בציפורן מעוותת', 'טיפוח ולק'];
  var TE = ['a medical pedicure', 'diabetic foot care', 'treatment for calluses and cracks', 'treatment for a deformed nail', 'grooming and polish'];
  var PH = ['כחול־ירוק', 'ניוד', 'אדום', 'ורוד'], PE = ['blue-green', 'nude', 'red', 'pink'];
  function compose() {
    var f = new FormData(form), t = +f.get('t'), d = +f.get('d'), p = +f.get('p'), s;
    if (he()) s = 'שלום קרינה, אשמח לקבוע תור ל' + TH[t] + (d >= 0 ? ' ביום ' + DH[d] : '') + (p >= 0 ? '. לק: ' + PH[p] : '') + '. תודה!';
    else s = 'Hi Karina, I’d like to book ' + TE[t] + (d >= 0 ? ' on ' + DE[d] : '') + (p >= 0 ? '. Polish: ' + PE[p] : '') + '. Thank you!';
    msg.textContent = s; send.href = 'https://wa.me/972543650200?text=' + encodeURIComponent(s);
  }
  form.addEventListener('change', compose); onLang.push(compose);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  $$('[data-flip]').forEach(function (b) { b.addEventListener('click', function () {
    var on = card.classList.toggle('flipped');
    $('.front', card).setAttribute('aria-hidden', on ? 'true' : 'false'); form.setAttribute('aria-hidden', on ? 'false' : 'true');
    $$('input,a,button', form).forEach(function (x) { x.tabIndex = on ? 0 : -1; });
    $('.front .flip', card).tabIndex = on ? -1 : 0;
    setTimeout(function () { (on ? $('input:checked', form) : $('.front .flip', card)).focus({ preventScroll: true }); }, still() ? 0 : 450);
  }); });
  form.setAttribute('aria-hidden', 'true'); $$('input,a,button', form).forEach(function (x) { x.tabIndex = -1; });

  // ------------------------------------------------------------ visit: the entrance photo shrinks into its frame
  var shr = $('[data-shrink]');
  function shrinkS() { if (still()) { shr.style.setProperty('--p', 1); return; } var t = shr.getBoundingClientRect().top, vh = innerHeight; shr.style.setProperty('--p', ease(clamp((vh * .8 - t) / (vh * .8), 0, 1)).toFixed(4)); }
  addEventListener('scroll', shrinkS, { passive: true }); onMotion.push(shrinkS);
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ------------------------------------------------------------ footer: her footprint logo, made of points, walks across
  var FOOT = {"w":180,"h":228,"p":[[114,39],[117,39],[111,42],[114,42],[117,42],[120,42],[108,45],[111,45],[114,45],[117,45],[120,45],[123,45],[87,48],[90,48],[93,48],[108,48],[111,48],[114,48],[117,48],[120,48],[123,48],[84,51],[87,51],[90,51],[93,51],[96,51],[108,51],[111,51],[114,51],[117,51],[120,51],[123,51],[84,54],[87,54],[90,54],[93,54],[96,54],[99,54],[108,54],[111,54],[114,54],[117,54],[120,54],[84,57],[87,57],[90,57],[93,57],[96,57],[108,57],[111,57],[114,57],[117,57],[120,57],[69,60],[72,60],[75,60],[84,60],[87,60],[90,60],[93,60],[111,60],[114,60],[117,60],[69,63],[72,63],[75,63],[78,63],[87,63],[90,63],[69,66],[72,66],[75,66],[69,69],[72,69],[75,69],[96,72],[99,72],[102,72],[105,72],[108,72],[111,72],[114,72],[57,75],[60,75],[63,75],[84,75],[87,75],[90,75],[93,75],[96,75],[99,75],[102,75],[105,75],[108,75],[111,75],[114,75],[117,75],[57,78],[60,78],[63,78],[81,78],[84,78],[87,78],[90,78],[93,78],[96,78],[99,78],[102,78],[105,78],[108,78],[111,78],[114,78],[117,78],[120,78],[57,81],[60,81],[63,81],[78,81],[81,81],[84,81],[87,81],[90,81],[93,81],[96,81],[99,81],[102,81],[105,81],[108,81],[111,81],[114,81],[117,81],[120,81],[75,84],[78,84],[81,84],[84,84],[87,84],[90,84],[93,84],[96,84],[99,84],[102,84],[105,84],[108,84],[111,84],[114,84],[117,84],[120,84],[123,84],[48,87],[51,87],[69,87],[72,87],[75,87],[78,87],[81,87],[84,87],[87,87],[90,87],[93,87],[96,87],[99,87],[102,87],[105,87],[108,87],[111,87],[114,87],[117,87],[120,87],[123,87],[48,90],[51,90],[66,90],[69,90],[72,90],[75,90],[78,90],[81,90],[84,90],[87,90],[90,90],[93,90],[96,90],[99,90],[102,90],[105,90],[108,90],[111,90],[114,90],[117,90],[120,90],[123,90],[48,93],[51,93],[63,93],[66,93],[69,93],[72,93],[75,93],[78,93],[81,93],[84,93],[87,93],[90,93],[93,93],[96,93],[99,93],[102,93],[105,93],[108,93],[111,93],[114,93],[117,93],[120,93],[60,96],[63,96],[66,96],[69,96],[72,96],[75,96],[78,96],[81,96],[84,96],[87,96],[90,96],[93,96],[96,96],[99,96],[102,96],[105,96],[108,96],[111,96],[114,96],[117,96],[120,96],[60,99],[63,99],[66,99],[69,99],[72,99],[75,99],[78,99],[81,99],[84,99],[87,99],[90,99],[93,99],[96,99],[99,99],[102,99],[105,99],[108,99],[111,99],[114,99],[117,99],[57,102],[60,102],[63,102],[66,102],[69,102],[72,102],[75,102],[78,102],[81,102],[84,102],[87,102],[90,102],[93,102],[96,102],[99,102],[102,102],[105,102],[108,102],[111,102],[114,102],[57,105],[60,105],[63,105],[66,105],[69,105],[72,105],[75,105],[78,105],[81,105],[84,105],[87,105],[90,105],[93,105],[96,105],[99,105],[102,105],[105,105],[108,105],[111,105],[57,108],[60,108],[63,108],[66,108],[69,108],[72,108],[75,108],[78,108],[81,108],[84,108],[87,108],[90,108],[93,108],[96,108],[57,111],[60,111],[63,111],[66,111],[69,111],[72,111],[75,111],[78,111],[81,111],[84,111],[87,111],[90,111],[57,114],[60,114],[63,114],[66,114],[69,114],[72,114],[75,114],[78,114],[81,114],[84,114],[87,114],[57,117],[60,117],[63,117],[66,117],[69,117],[72,117],[75,117],[78,117],[81,117],[84,117],[60,120],[63,120],[66,120],[69,120],[72,120],[75,120],[78,120],[81,120],[63,123],[66,123],[69,123],[72,123],[75,123],[78,123],[81,123],[63,126],[66,126],[69,126],[72,126],[75,126],[78,126],[81,126],[66,129],[69,129],[72,129],[75,129],[78,129],[81,129],[66,132],[69,132],[72,132],[75,132],[78,132],[81,132],[69,135],[72,135],[75,135],[78,135],[81,135],[69,138],[72,138],[75,138],[78,138],[81,138],[84,138],[72,141],[75,141],[78,141],[81,141],[84,141],[87,141],[72,144],[75,144],[78,144],[81,144],[84,144],[87,144],[75,147],[78,147],[81,147],[84,147],[87,147],[90,147],[75,150],[78,150],[81,150],[84,150],[87,150],[90,150],[93,150],[75,153],[78,153],[81,153],[84,153],[87,153],[90,153],[93,153],[96,153],[99,153],[75,156],[78,156],[81,156],[84,156],[87,156],[90,156],[93,156],[96,156],[99,156],[102,156],[75,159],[78,159],[81,159],[84,159],[87,159],[90,159],[93,159],[96,159],[99,159],[102,159],[105,159],[75,162],[78,162],[81,162],[84,162],[87,162],[90,162],[93,162],[96,162],[99,162],[102,162],[105,162],[75,165],[78,165],[81,165],[84,165],[87,165],[90,165],[93,165],[96,165],[99,165],[102,165],[105,165],[108,165],[75,168],[78,168],[81,168],[84,168],[87,168],[90,168],[93,168],[96,168],[99,168],[102,168],[105,168],[108,168],[111,168],[75,171],[78,171],[81,171],[84,171],[87,171],[90,171],[93,171],[96,171],[99,171],[102,171],[105,171],[108,171],[111,171],[75,174],[78,174],[81,174],[84,174],[87,174],[90,174],[93,174],[96,174],[99,174],[102,174],[105,174],[108,174],[111,174],[75,177],[78,177],[81,177],[84,177],[87,177],[90,177],[93,177],[96,177],[99,177],[102,177],[105,177],[108,177],[111,177],[75,180],[78,180],[81,180],[84,180],[87,180],[90,180],[93,180],[96,180],[99,180],[102,180],[105,180],[108,180],[111,180],[75,183],[78,183],[81,183],[84,183],[87,183],[90,183],[93,183],[96,183],[99,183],[102,183],[105,183],[108,183],[75,186],[78,186],[81,186],[84,186],[87,186],[90,186],[93,186],[96,186],[99,186],[102,186],[105,186],[108,186],[75,189],[78,189],[81,189],[84,189],[87,189],[90,189],[93,189],[96,189],[99,189],[102,189],[105,189],[78,192],[81,192],[84,192],[87,192],[90,192],[93,192],[96,192],[99,192],[102,192],[105,192],[81,195],[84,195],[87,195],[90,195],[93,195],[96,195],[99,195],[102,195],[81,198],[84,198],[87,198],[90,198],[93,198],[96,198],[99,198],[87,201],[90,201],[93,201],[96,201]]};
  var cv = $('[data-steps]'), foot = $('[data-foot]'), cx2 = cv.getContext('2d');
  var S = { w: 0, h: 0, dpr: 1, steps: [], parts: [], k: 0, t0: 0, raf: 0, vis: false, mx: -999, my: -999 };
  function stepsLayout() {
    S.dpr = Math.min(2, devicePixelRatio || 1); S.w = foot.clientWidth; S.h = foot.clientHeight;
    cv.width = S.w * S.dpr; cv.height = S.h * S.dpr;
    var fh = Math.min(S.h * .24, phone() ? 110 : 170), sc = fh / FOOT.h, n = phone() ? 4 : 6;
    var dir = root.dir === 'rtl' ? -1 : 1, x0 = dir > 0 ? S.w * .1 : S.w * .9, x1 = dir > 0 ? S.w * .9 : S.w * .1, y0 = S.h * .44, y1 = S.h * .1;
    var a = Math.atan2(y1 - y0, x1 - x0), rot = a + Math.PI / 2, nx = -Math.sin(a), ny = Math.cos(a);
    S.steps = [];
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0 : i / (n - 1), side = i % 2 ? 1 : -1, cx = x0 + (x1 - x0) * f + nx * side * fh * .22, cy = y0 + (y1 - y0) * f + ny * side * fh * .22;
      S.steps.push(FOOT.p.map(function (q) {
        var lx = (q[0] - FOOT.w / 2) * sc * (side > 0 ? -1 : 1) * dir, ly = (q[1] - FOOT.h / 2) * sc;
        return [cx + lx * Math.cos(rot) - ly * Math.sin(rot), cy + lx * Math.sin(rot) + ly * Math.cos(rot)];
      }));
    }
    S.parts = FOOT.p.map(function (q, i) { var s = S.steps[0][i]; return { x: s[0], y: s[1], fx: s[0], fy: s[1], d: Math.random() * 280 }; });
    S.k = 0; S.t0 = performance.now(); drawSteps(performance.now());
  }
  function drawSteps(t) {
    var c = cx2, n = S.steps.length; c.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); c.clearRect(0, 0, S.w, S.h);
    var dot = phone() ? 1.6 : 2.2;
    if (still()) {
      S.steps.forEach(function (st, i) { c.fillStyle = 'rgba(240,178,173,' + (i === n - 1 ? .7 : .12 + i * .06) + ')'; st.forEach(function (p) { c.fillRect(p[0], p[1], dot, dot); }); });
      return;
    }
    // faded prints already walked
    for (var i = 0; i < S.k; i++) { var al = .05 + .12 * (i + 1) / Math.max(1, S.k); c.fillStyle = 'rgba(240,178,173,' + al.toFixed(3) + ')'; S.steps[i].forEach(function (p) { c.fillRect(p[0], p[1], dot, dot); }); }
    var el = t - S.t0, mv = 820, hold = 760, nk = (S.k + 1) % n;
    c.fillStyle = 'rgba(246,236,226,.88)';
    S.parts.forEach(function (p, i) {
      var tt = clamp((el - hold - p.d) / mv, 0, 1), e = tt < .5 ? 4 * tt * tt * tt : 1 - Math.pow(-2 * tt + 2, 3) / 2;
      var a = S.steps[S.k][i], b = S.steps[nk][i], x = a[0] + (b[0] - a[0]) * e, y = a[1] + (b[1] - a[1]) * e - Math.sin(tt * Math.PI) * 26;
      var dx = x - S.mx, dy = y - S.my, dd = dx * dx + dy * dy;
      if (dd < 6400) { var f = (1 - Math.sqrt(dd) / 80) * 22; x += dx / Math.sqrt(dd + .01) * f; y += dy / Math.sqrt(dd + .01) * f; }
      p.fx += (x - p.fx) * .35; p.fy += (y - p.fy) * .35;
      c.fillRect(p.fx, p.fy, dot, dot);
    });
    if (el > hold + mv + 300) { S.k = nk; S.t0 = t; }
  }
  function stepsLoop(t) { S.raf = 0; if (!S.vis || still()) return; drawSteps(t); S.raf = requestAnimationFrame(stepsLoop); }
  function stepsKick() { if (still()) { drawSteps(0); return; } if (S.vis && !S.raf) S.raf = requestAnimationFrame(stepsLoop); }
  foot.addEventListener('pointermove', function (e) { var r = foot.getBoundingClientRect(); S.mx = e.clientX - r.left; S.my = e.clientY - r.top; });
  foot.addEventListener('pointerleave', function () { S.mx = S.my = -999; });
  watch(foot, function (v) { S.vis = v; stepsKick(); });
  onMotion.push(function () { S.k = 0; S.t0 = performance.now(); stepsKick(); });

  // the curtain footer only exists once the page has slid off it
  function curtain() { foot.classList.toggle('hid', main.getBoundingClientRect().bottom > innerHeight + 2); }
  addEventListener('scroll', curtain, { passive: true }); onResize.push(curtain);

  // wordmark fitted to its width
  var mark = $('[data-fit]');
  function fit() { mark.style.fontSize = '100px'; mark.style.display = 'inline-block'; var w = mark.parentNode.clientWidth, m = mark.offsetWidth; mark.style.display = ''; mark.style.fontSize = Math.min(300, Math.floor(100 * w / m * .97)) + 'px'; }

  // ------------------------------------------------------------ boot
  onResize.push(fit, stepsLayout, buildRibbon, stackS, shrinkS);
  var rt = 0;
  function resized() { clearTimeout(rt); rt = setTimeout(function () { onResize.forEach(function (f) { f(); }); }, 120); }
  addEventListener('resize', resized);
  if ('ResizeObserver' in window) { var lastH = 0; new ResizeObserver(function () { var h = main.scrollHeight; if (Math.abs(h - lastH) > 4) { lastH = h; clearTimeout(rt); rt = setTimeout(buildRibbon, 120); } }).observe(main); }
  texts(); compose();
  onResize.forEach(function (f) { f(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); buildRibbon(); });
})();
