/* Liron Rom — brow clinic concept. Language, motion switch, the mapped face stage, comb reveals, hours, composer. */
(function () {
  'use strict';
  var d = document.documentElement;
  var PHONE = '972527281201';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var store = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  var isEn = function () { return d.lang === 'en'; };
  var moving = function () { return d.classList.contains('moving'); };

  /* ---------- the threads: brow-mapping lines in image coordinates (1000 × 792) ---------- */
  var X = function (x) { return (x * 2.06 - 40) / 2.02; };
  var Y = function (y) { return y * 2.06 / 2.02; };
  var L = function (x1, y1, x2, y2) { return 'M' + X(x1).toFixed(1) + ' ' + Y(y1).toFixed(1) + 'L' + X(x2).toFixed(1) + ' ' + Y(y2).toFixed(1); };
  var THREADS = {
    top: [L(140, 180, 870, 180)],
    start: [L(455, 545, 455, 140), L(565, 545, 565, 140)],
    arch: [L(455, 520, 280, 140), L(565, 520, 738, 140)],
    tail: [L(455, 520, 120, 165), L(565, 520, 896, 165)],
    mid: [L(510, 60, 510, 760)]
  };
  var PINS = [[455, 520], [565, 520]];
  function drawThreads(svg) {
    var ns = 'http://www.w3.org/2000/svg', html = '';
    Object.keys(THREADS).forEach(function (k) {
      THREADS[k].forEach(function (dpath) { html += '<path data-t="' + k + '" pathLength="1" d="' + dpath + '"/>'; });
    });
    PINS.forEach(function (pt) { html += '<circle class="pin" data-pin r="4" cx="' + X(pt[0]).toFixed(1) + '" cy="' + Y(pt[1]).toFixed(1) + '"/>'; });
    svg.innerHTML = html;
    void ns;
  }

  /* ---------- stage ---------- */
  var A = 1600 / 1267;
  var KEYS = [ // p, zoom (0 = cover, else × whole-in-frame), focus x, focus y, frame (0 full → 1 framed), oval
    [0.00, 0, 0.5, 0.5, 0, 0],
    [0.05, 0, 0.5, 0.5, 0, 0],
    [0.26, 1, 0.5, 0.5, 1, 0],
    [0.40, 2.2, X(510) / 1000, Y(262) / 792, 1, 0],
    [0.46, 2.2, X(510) / 1000, Y(262) / 792, 1, 0],
    [0.60, 2.6, X(335) / 1000, Y(240) / 792, 1, 0],
    [0.64, 2.6, X(335) / 1000, Y(240) / 792, 1, 0],
    [0.76, 1, 0.5, 0.5, 1, 0],
    [0.88, 1, 0.5, 0.5, 1, 1],
    [1.00, 1, 0.5, 0.5, 1, 1]
  ];
  var STOPS = [0.40, 0.60, 0.74, 0.92];

  function Stage(root, stepped) {
    this.root = root; this.stepped = stepped;
    this.win = $('[data-win]', root); this.plate = $('[data-plate]', root);
    this.svg = $('[data-threads]', root); this.hero = $('[data-hero]', root);
    this.scrim = $('.scrim', root); this.halves = $$('.half', root); this.note = $('.note', root);
    this.caps = $$('.cap', root); this.ctl = $('[data-mirrorctl]', root);
    this.range = $('[data-mirror-range]', root); this.mirror = $('[data-mirror]', root); this.mline = $('[data-mline]', root);
    drawThreads(this.svg);
    this.paths = $$('path', this.svg); this.pins = $$('[data-pin]', this.svg);
    this.p = stepped ? STOPS[0] : 0; this.step = 0;
    var self = this;
    this.range.addEventListener('input', function () { self.setMirror(); });
    this.setMirror();
    if (stepped) {
      $$('[data-go]', root).forEach(function (b) { b.addEventListener('click', function () { self.go(+b.getAttribute('data-go')); }); });
      $('[data-prev]', root).addEventListener('click', function () { self.go(self.step - 1); });
      $('[data-next]', root).addEventListener('click', function () { self.go(self.step + 1); });
    }
    this.layout();
  }
  Stage.prototype.setMirror = function () {
    this.plate.style.setProperty('--mx', this.range.value + '%');
  };
  Stage.prototype.go = function (i) {
    this.step = (i + STOPS.length) % STOPS.length;
    this.p = STOPS[this.step];
    $$('[data-go]', this.root).forEach(function (b, k) { b.setAttribute('aria-current', k === this.step ? 'true' : 'false'); }, this);
    this.render();
  };
  Stage.prototype.layout = function () {
    var vw = this.root.clientWidth, vh = this.root.clientHeight;
    var pw, ph;
    if (vw / vh > A) { pw = vw; ph = vw / A; } else { ph = vh; pw = vh * A; }
    var wide = vw > 900;
    var reserve = wide ? (this.stepped ? 470 : 380) : (this.stepped ? 430 : 360);
    var fw = wide ? Math.min(vw * 0.46, (vh - reserve) * A, 820) : Math.min(vw - 32, (vh - reserve) * A);
    fw = Math.max(fw, Math.min(vw - 32, 220));
    var fh = fw / A;
    var cy = wide ? (this.stepped ? -70 : -50) : (this.stepped ? -100 : -70);
    var ftop = vh / 2 + cy - fh / 2;
    this.g = { vw: vw, vh: vh, pw: pw, ph: ph, fw: fw, fh: fh, cy: cy, ftop: ftop };
    this.root.style.setProperty('--pw', pw + 'px');
    this.root.style.setProperty('--ph', ph + 'px');
    this.root.style.setProperty('--ftop', ftop + 'px');
    this.root.style.setProperty('--fbot', (ftop + fh) + 'px');
    this.root.style.setProperty('--fw', fw + 'px');
    this.render();
  };
  Stage.prototype.state = function (p) {
    var i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
    var a = KEYS[i], b = KEYS[i + 1], t = ease(seg(p, a[0], b[0]));
    var g = this.g, kW = g.fw / g.pw;
    var ka = a[1] === 0 ? 1 : kW * a[1], kb = b[1] === 0 ? 1 : kW * b[1];
    return {
      k: Math.exp(lerp(Math.log(ka), Math.log(kb), t)),
      fx: lerp(a[2], b[2], t), fy: lerp(a[3], b[3], t),
      fr: lerp(a[4], b[4], t), ov: lerp(a[5], b[5], t)
    };
  };
  Stage.prototype.render = function () {
    var p = this.p, g = this.g, s = this.state(p);
    var cy = g.cy * s.fr;
    var tx = -(s.fx - 0.5) * g.pw * s.k, ty = cy - (s.fy - 0.5) * g.ph * s.k;
    var ppu = g.pw * s.k / 1000; // screen px per svg unit
    this.svg.style.setProperty('--sw', (2 / ppu).toFixed(3));
    this.pins.forEach(function (c) { c.setAttribute('r', (4.5 / ppu).toFixed(2)); });
    this.plate.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + s.k.toFixed(4) + ')';
    // window: full stage → frame → oval
    var side = (g.vw - g.fw) / 2 * s.fr, top = g.ftop * s.fr, bot = (g.vh - g.ftop - g.fh) * s.fr;
    var rx = lerp(6 * s.fr, g.fw / 2, s.ov), ry = lerp(6 * s.fr, g.fh / 2, s.ov);
    this.win.style.clipPath = 'inset(' + top.toFixed(1) + 'px ' + side.toFixed(1) + 'px ' + bot.toFixed(1) + 'px ' + side.toFixed(1) + 'px round ' + rx.toFixed(1) + 'px / ' + ry.toFixed(1) + 'px)';
    // threads
    var fade = 1 - seg(p, 0.77, 0.85);
    var prog = {
      top: this.stepped ? 1 : (this.loaded ? 1 : 0),
      start: seg(p, 0.28, 0.40), arch: seg(p, 0.46, 0.58), tail: seg(p, 0.48, 0.60), mid: seg(p, 0.64, 0.74)
    };
    this.paths.forEach(function (el) {
      el.style.strokeDashoffset = (1 - prog[el.getAttribute('data-t')]).toFixed(3);
      el.style.opacity = fade.toFixed(3);
    });
    var pinOp = (seg(p, 0.26, 0.30) * fade).toFixed(3);
    this.pins.forEach(function (c) { c.style.opacity = pinOp; });
    // hero copy
    if (!this.stepped) {
      var h = 1 - seg(p, 0.03, 0.13);
      this.hero.style.opacity = h.toFixed(3);
      this.hero.style.transform = 'translateY(' + ((1 - h) * -24).toFixed(1) + 'px)';
      this.hero.style.visibility = h < 0.01 ? 'hidden' : 'visible';
      this.scrim.style.opacity = h.toFixed(3);
      var ho = seg(p, 0.17, 0.26);
      this.halves.forEach(function (el, i) { el.style.opacity = (i === 0 ? ho : seg(p, 0.20, 0.30)).toFixed(3); });
      this.note.style.opacity = seg(p, 0.26, 0.32).toFixed(3);
    }
    // captions
    var ci = p < 0.27 ? -1 : p < 0.45 ? 0 : p < 0.63 ? 1 : p < 0.80 ? 2 : 3;
    if (this.stepped) ci = this.step;
    this.caps.forEach(function (c, i) { c.classList.toggle('on', i === ci); });
    // mirror
    var mo = seg(p, 0.84, 0.90);
    this.mirror.style.opacity = mo >= 0.99 ? 1 : 0;
    this.mline.style.opacity = (mo * 0.85).toFixed(3);
    this.ctl.style.opacity = mo.toFixed(3);
    this.ctl.style.pointerEvents = mo > 0.5 ? 'auto' : 'none';
    this.range.tabIndex = mo > 0.5 ? 0 : -1;
  };

  var dock = $('.dock');
  var main = $('[data-stage]'), stage = null, stepStage = null, raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      if (moving() && stage) {
        var sec = main.parentNode, r = sec.getBoundingClientRect(), span = r.height - main.clientHeight;
        stage.p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
        stage.render();
      }
      combs();
      dock.classList.toggle('show', window.scrollY > window.innerHeight * 0.5);
    });
  }

  function buildStepped() {
    if (stepStage) return;
    var clone = main.cloneNode(true);
    clone.classList.add('stepped');
    clone.removeAttribute('data-stage');
    $$('[id]', clone).forEach(function (el) { el.removeAttribute('id'); });
    $$('img', clone).forEach(function (im) { im.removeAttribute('fetchpriority'); });
    $$('[style]', clone).forEach(function (el) { if (!el.matches('[data-plate],[data-win]')) el.removeAttribute('style'); });
    var h = $('.half-a', clone); var h2 = document.createElement('h2');
    h2.className = h.className; h2.innerHTML = h.innerHTML; h.parentNode.replaceChild(h2, h);
    var sec = document.createElement('section');
    sec.className = 'map map-steps'; sec.setAttribute('aria-label', isEn() ? 'Brow mapping, step by step' : 'מיפוי גבה, צעד אחר צעד');
    sec.appendChild(clone);
    main.parentNode.parentNode.insertBefore(sec, main.parentNode.nextSibling);
    stepStage = new Stage(clone, true);
    stepStage.go(0);
    // the hero heading of the first stage is not a duplicate of this one
  }
  function dropStepped() {
    if (!stepStage) return;
    var sec = stepStage.root.parentNode; sec.parentNode.removeChild(sec); stepStage = null;
  }

  /* ---------- comb reveal on the work photographs ---------- */
  var combEls = $$('[data-comb]');
  function combMask() {
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var hairs = '';
    for (var i = 0; i < 150; i++) {
      var x = rnd() * 104 - 2, len = 5 + rnd() * 26, w = 0.35 + rnd() * 0.55, lean = len * (0.25 + rnd() * 0.25);
      var y0 = 172, y1 = 172 - len;
      hairs += '<path d="M' + (x - w).toFixed(2) + ' ' + y0 + 'Q' + (x + lean * 0.2).toFixed(2) + ' ' + (y0 - len * 0.6).toFixed(1) + ' ' + (x + lean).toFixed(2) + ' ' + y1.toFixed(1) + 'Q' + (x + lean * 0.3 + w).toFixed(2) + ' ' + (y0 - len * 0.5).toFixed(1) + ' ' + (x + w).toFixed(2) + ' ' + y0 + 'Z"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 300" preserveAspectRatio="none"><g fill="#000"><rect x="0" y="170" width="100" height="130"/>' + hairs + '</g></svg>';
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
  }
  d.style.setProperty('--comb', combMask());
  function combs() {
    if (!moving()) return;
    var vh = window.innerHeight;
    combEls.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      var r = clamp((vh - top - 40) / (vh * 0.5), 0, 1);
      el.style.setProperty('--r', ease(r).toFixed(4));
    });
  }

  /* ---------- reveals ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.rv').forEach(function (el, i) {
    var sib = el.parentNode ? $$('.rv', el.parentNode).indexOf(el) : 0;
    el.style.setProperty('--d', (Math.max(sib, 0) * 80) + 'ms');
    if (io) io.observe(el); else el.classList.add('in');
  });

  /* ---------- 86 hairs, one per review ---------- */
  var brow = $('[data-brow]');
  (function () {
    var seed = 11, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var spine = function (u) { // brow centre line, start → arch → tail
      var x = lerp(36, 572, u);
      var y = u < 0.66 ? lerp(118, 52, Math.sin(u / 0.66 * Math.PI / 2)) : lerp(52, 104, Math.pow((u - 0.66) / 0.34, 1.4));
      return [x, y];
    };
    var out = '';
    for (var i = 0; i < 86; i++) {
      var u = clamp((i + rnd() * 0.9) / 86, 0, 1);
      var th = lerp(52, 12, Math.pow(u, 0.8));
      var c = spine(u), off = (rnd() - 0.5) * th * 0.8;
      var ang = u < 0.18 ? lerp(-95, -70, u / 0.18) : lerp(-62, -12, (u - 0.18) / 0.82);
      ang += (rnd() - 0.5) * 12;
      var len = th * (0.55 + rnd() * 0.4) + 6;
      var a = ang * Math.PI / 180;
      var x1 = c[0] - Math.cos(a) * len * 0.45, y1 = c[1] + off - Math.sin(a) * len * 0.45;
      var x2 = c[0] + Math.cos(a) * len * 0.55, y2 = c[1] + off + Math.sin(a) * len * 0.55;
      var w = lerp(2.2, 1.1, u) * (0.8 + rnd() * 0.4);
      var mx = (x1 + x2) / 2 + Math.sin(a) * len * 0.12, my = (y1 + y2) / 2 - Math.cos(a) * len * 0.12;
      out += '<path pathLength="1" d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke-width="' + w.toFixed(2) + '"/>';
    }
    brow.innerHTML = out;
    var drawn = false;
    function drawBrow() {
      if (drawn) return; drawn = true;
      var lines = $$('path', brow);
      if (!moving() || !brow.animate) return;
      lines.forEach(function (l, i) {
        l.animate([{ strokeDasharray: '1 1', strokeDashoffset: 1, opacity: 0 }, { strokeDasharray: '1 1', strokeDashoffset: 0, opacity: 1 }],
          { duration: 420, delay: i * 14, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'backwards' });
      });
    }
    if ('IntersectionObserver' in window) {
      var bio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { drawBrow(); bio.disconnect(); } }, { threshold: 0.4 });
      bio.observe(brow);
    }
  })();

  /* ---------- hours ---------- */
  var OPEN = [[9, 19], [9, 19], [9, 19], [9, 19], [9, 19], [9, 13], null]; // Sun..Sat
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function nowIL() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var o = {}; parts.forEach(function (x) { o[x.type] = x.value; });
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
    } catch (e) { var n = new Date(); return { day: n.getDay(), h: n.getHours() + n.getMinutes() / 60 }; }
  }
  var fmt = function (h) { return Math.floor(h) + ':' + (h % 1 ? String(Math.round(h % 1 * 60)).padStart(2, '0') : '00'); };
  function hours() {
    var n = nowIL(), en = isEn(), el = $('[data-status]'), txt = $('[data-status-text]');
    var t = OPEN[n.day], open = t && n.h >= t[0] && n.h < t[1], msg;
    if (open) msg = en ? 'Open now · until ' + fmt(t[1]) : 'פתוח עכשיו · עד ' + fmt(t[1]);
    else {
      var k = 0, nd, nt;
      if (t && n.h < t[0]) { nd = n.day; nt = t; }
      else { for (k = 1; k <= 7; k++) { nd = (n.day + k) % 7; if (OPEN[nd]) { nt = OPEN[nd]; break; } } }
      if (!nt) msg = en ? 'Closed now' : 'סגור עכשיו';
      else if (nd === n.day) msg = en ? 'Closed now · opens today at ' + fmt(nt[0]) : 'סגור עכשיו · נפתח היום ב-' + fmt(nt[0]);
      else if (k === 1) msg = en ? 'Closed now · opens tomorrow at ' + fmt(nt[0]) : 'סגור עכשיו · נפתח מחר ב-' + fmt(nt[0]);
      else msg = en ? 'Closed now · opens ' + DAY_EN[nd] + ' at ' + fmt(nt[0]) : 'סגור עכשיו · נפתח ביום ' + DAY_HE[nd] + ' ב-' + fmt(nt[0]);
    }
    txt.textContent = msg; el.classList.toggle('open', !!open);
    $$('[data-hours] > div').forEach(function (row) {
      row.classList.toggle('today', row.getAttribute('data-days').split(',').indexOf(String(n.day)) > -1);
    });
  }

  /* ---------- WhatsApp ---------- */
  var wa = function (text) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text); };
  function links() {
    var t = isEn() ? 'Hi Liron, I saw your website and I would like to book an appointment.' : 'היי לירון, ראיתי את האתר ואשמח לקבוע תור.';
    $$('[data-wa]').forEach(function (a) { a.href = wa(t); });
    compose();
  }
  function compose() {
    var f = $('.sentence[lang="' + (isEn() ? 'en' : 'he') + '"]');
    var svc = $('[data-svc]', f).value, day = $('[data-day]', f).value, t;
    if (isEn()) t = 'Hi Liron, I would like to book ' + svc + ' on ' + day + '. When works for you?';
    else t = 'היי לירון, אשמח לתור ל' + svc + (day === 'הקרוב שיש' ? ', ביום הקרוב שיש.' : ' ביום ' + day + '.') + ' מתי מתאים לך?';
    $('[data-wa-compose]').href = wa(t);
  }
  $$('[data-compose] select').forEach(function (s) { s.addEventListener('change', compose); });
  $('[data-compose]').addEventListener('submit', function (e) { e.preventDefault(); });

  /* ---------- fit the phone line to the width ---------- */
  function fit() {
    $$('[data-shrink]').forEach(function (el) {
      el.style.fontSize = '';
      var sw = el.scrollWidth, cw = el.clientWidth;
      if (sw > cw + 1) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * cw / sw * 0.98) + 'px';
    });
    $$('[data-fit]').forEach(function (el) {
      el.style.fontSize = ''; el.style.display = 'inline-block';
      var w = el.parentNode.clientWidth - parseFloat(getComputedStyle(el.parentNode).paddingLeft) - parseFloat(getComputedStyle(el.parentNode).paddingRight);
      var fs = parseFloat(getComputedStyle(el).fontSize), sw = el.scrollWidth;
      el.style.display = '';
      if (sw > 0) el.style.fontSize = Math.min(fs * (w * 0.985) / sw, 320) + 'px';
    });
  }

  /* ---------- language ---------- */
  function setLang(l, save) {
    d.lang = l; d.dir = l === 'en' ? 'ltr' : 'rtl';
    if (save) store('lr-lang', l);
    $$('img[data-alt-en]').forEach(function (im) {
      if (!im.hasAttribute('data-alt-he')) im.setAttribute('data-alt-he', im.alt);
      im.alt = l === 'en' ? im.getAttribute('data-alt-en') : im.getAttribute('data-alt-he');
    });
    $$('[data-lang-toggle]').forEach(function (b) { b.setAttribute('aria-label', l === 'en' ? 'לעבור לעברית' : 'Switch to English'); });
    var t = $('title'); t.textContent = l === 'en' ? 'Liron Rom · Brow Design Clinic · Haifa' : 'לירון רום · קליניקה לעיצוב גבות · חיפה';
    try { var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang'); history.replaceState(null, '', u); } catch (e) {}
    hours(); links(); fit(); if (typeof cbh === 'function') cbh();
    if (stage) stage.layout();
    if (stepStage) stepStage.layout();
  }
  $$('[data-lang-toggle]').forEach(function (b) { b.addEventListener('click', function () { setLang(isEn() ? 'he' : 'en', true); }); });

  /* ---------- motion ---------- */
  function setMotion(on, save) {
    d.classList.toggle('moving', on); d.classList.toggle('still', !on);
    if (save) store('lr-motion', on ? 'on' : 'off');
    $$('[data-motion-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    $$('[data-motion-state]').forEach(function (b) { b.textContent = on ? (isEn() ? 'on' : 'פועלת') : (isEn() ? 'off' : 'כבויה'); });
    if (on) { dropStepped(); } else { buildStepped(); combEls.forEach(function (el) { el.style.removeProperty('--r'); }); }
    if (stage) { stage.p = on ? stage.p : 0; stage.layout(); }
    onScroll();
  }
  $$('[data-motion-toggle]').forEach(function (b) { b.addEventListener('click', function () { setMotion(!moving(), true); }); });

  /* ---------- the concept bar sits over the first screen; the corner words sit under it ---------- */
  function cbh() { var c = $('.concept'); if (c) d.style.setProperty('--cbh', c.offsetHeight + 'px'); }
  cbh();

  /* ---------- go ---------- */
  stage = new Stage(main, false);
  setLang(d.lang === 'en' ? 'en' : 'he', false);
  setMotion(moving(), false);
  // the one animated line on the first screen: the top thread draws across the brows
  setTimeout(function () {
    var top = $$('path[data-t="top"]', main.parentNode)[0];
    stage.loaded = true;
    if (top && moving() && top.animate) {
      top.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1400, easing: 'cubic-bezier(0.22,1,0.36,1)' });
    }
    stage.render();
  }, 350);
  window.addEventListener('scroll', onScroll, { passive: true });
  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { cbh(); if (stage) stage.layout(); if (stepStage) stepStage.layout(); fit(); onScroll(); }, 120);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  setInterval(hours, 60000);
  window.__lr = { stage: function () { return stage; }, step: function () { return stepStage; } };
})();
