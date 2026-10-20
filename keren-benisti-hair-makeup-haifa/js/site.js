/* Keren Benisti · colour melt. Language, motion switch, live hours, the melts between sections, the lock on the
   colouring board, the vanity bulbs, the WhatsApp composer and the compact (the sticky call control on phones). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b == null ? 1 : b, Math.max(a || 0, v)); };
  var outC = function (t) { return 1 - Math.pow(1 - t, 3); };
  var io2 = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var WA = 'https://wa.me/972544746696';
  var he = function () { return html.lang !== 'en'; };
  var moving = function () { return html.classList.contains('moving'); };
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ------------------------------------------------------------------ hours (from the Google listing, Asia/Jerusalem)
  var HOURS = window.__HOURS || [[450, 900], [450, 780], null, [450, 900], [450, 900], [450, 780], null];   // minutes from midnight, Sun..Sat
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function t(m) { return Math.floor(m / 60) + ':' + ('0' + m % 60).slice(-2); }
  function nowIL() {
    var p = {}, w = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { day: w[p.weekday], min: (+p.hour % 24) * 60 + +p.minute };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function status() {
    var n = nowIL(), h = HOURS[n.day], txt, open = false;
    if (h && h[0] === 0 && h[1] >= 1440) { open = true; txt = he() ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (h && n.min >= h[0] && n.min < h[1]) { open = true; txt = he() ? 'פתוח עכשיו · עד ' + t(h[1]) : 'Open now · until ' + t(h[1]); }
    else if (h && n.min < h[0]) txt = he() ? 'סגור עכשיו · נפתח היום ב־' + t(h[0]) : 'Closed now · opens today at ' + t(h[0]);
    else {
      for (var k = 1; k <= 7; k++) {
        var dd = (n.day + k) % 7, hh = HOURS[dd];
        if (!hh) continue;
        if (k === 1) txt = he() ? 'סגור עכשיו · נפתח מחר ב־' + t(hh[0]) : 'Closed now · opens tomorrow at ' + t(hh[0]);
        else txt = he() ? 'סגור עכשיו · נפתח ביום ' + DAY_HE[dd] + ' ב־' + t(hh[0]) : 'Closed now · opens ' + DAY_EN[dd] + ' at ' + t(hh[0]);
        break;
      }
      if (!txt) txt = he() ? 'סגור כרגע' : 'Closed for now';
    }
    $$('[data-status]').forEach(function (el) { el.textContent = txt; el.classList.toggle('open', open); });
    var ul = $('[data-hours]');
    if (ul) {
      ul.innerHTML = '';
      HOURS.forEach(function (h2, i) {
        var li = d.createElement('li'), a = d.createElement('span'), b = d.createElement('span');
        a.textContent = he() ? 'יום ' + DAY_HE[i] : DAY_EN[i];
        b.textContent = h2 ? (h2[0] === 0 && h2[1] >= 1440 ? (he() ? '24 שעות' : '24 hours') : t(h2[0]) + '–' + t(h2[1])) : (he() ? 'סגור' : 'Closed');
        b.dir = 'ltr';
        if (!h2) li.className = 'closed';
        if (i === n.day) { li.classList.add('today'); a.textContent += he() ? ' · היום' : ' · today'; }
        li.appendChild(a); li.appendChild(b); ul.appendChild(li);
      });
    }
  }

  // ------------------------------------------------------------------ the WhatsApp composer
  var SVC = { colour: ['צבע', 'a colour appointment'], cut: ['תספורת ועיצוב', 'a cut & styling'], makeup: ['איפור', 'makeup'] };
  var SHADE = { rainbow: ['קשת', 'Rainbow'], pinkviolet: ['ורוד־סגול', 'Pink-violet'], flame: ['להבה', 'Flame'], teal: ['ירוק־טורקיז', 'Teal-green'],
    red: ['אדום עמוק', 'Deep red'], uv: ['זוהר UV', 'UV glow'], natural: ['גוונים טבעיים', 'Natural highlights'], unsure: ['עוד לא יודעת, אשמח לייעוץ', 'not sure yet, I\'d love your advice'] };
  var LEN = [['קצר', 'Short'], ['כתפיים', 'Shoulder'], ['ארוך', 'Long'], ['ארוך מאוד', 'Very long']];
  var DAYS = HOURS.map(function (h, i) { return h ? i : -1; }).filter(function (i) { return i >= 0; });
  var form = $('[data-composer]'), msgEl = $('[data-msg]'), sendEl = $('[data-send]'), daySel = $('[data-day]'), lenIn = $('#len'), lenOut = $('[data-len-out]');
  function fillDays() {
    var v = daySel.value;
    daySel.innerHTML = '';
    DAYS.forEach(function (i) { var o = d.createElement('option'); o.value = String(i); o.textContent = he() ? 'יום ' + DAY_HE[i] : DAY_EN[i]; daySel.appendChild(o); });
    var f = d.createElement('option'); f.value = 'any'; f.textContent = he() ? 'גמיש, מה שנוח לקרן' : 'Flexible, whatever suits Keren'; daySel.appendChild(f);
    daySel.value = v || 'any';
  }
  function compose() {
    var L = he() ? 0 : 1, svc = form.svc.value, shade = form.shade.value, len = LEN[+lenIn.value - 1][L], day = daySel.value;
    var dayTxt = day === 'any' ? (L ? 'flexible' : 'גמיש') : (L ? DAY_EN[+day] : DAY_HE[+day]);
    var note = (form.note.value || '').trim().replace(/\s+/g, ' ');
    $('[data-shade-set]').hidden = svc !== 'colour';
    $('[data-len-set]').hidden = svc === 'makeup';
    lenOut.textContent = len;
    var lines = L
      ? ['Hi Keren, I\'d like to book ' + SVC[svc][1] + '.']
      : ['היי קרן, אשמח לתאם תור ל' + SVC[svc][0] + '.'];
    if (svc === 'colour') lines.push(L ? 'Direction: ' + SHADE[shade][1] + '.' : 'כיוון: ' + SHADE[shade][0] + '.');
    if (svc !== 'makeup') lines.push(L ? 'Hair length: ' + len.toLowerCase() + '.' : 'אורך השיער: ' + len + '.');
    lines.push(L ? 'Best day: ' + dayTxt + '.' : 'יום נוח: ' + dayTxt + '.');
    if (note) lines.push(note);
    lines.push(L ? '(Found you through the website)' : '(הגעתי דרך האתר)');
    var m = lines.join('\n');
    msgEl.textContent = m;
    sendEl.href = WA + '?text=' + encodeURIComponent(m);
  }
  function waDefaults() {
    var m = he() ? 'היי קרן, הגעתי דרך האתר ואשמח לתאם תור.' : 'Hi Keren, I found you through the website and would like to book.';
    $$('[data-wa]').forEach(function (a) { a.href = WA + '?text=' + encodeURIComponent(m); });
  }
  form.addEventListener('input', compose);
  form.addEventListener('change', compose);

  // ------------------------------------------------------------------ language
  function setLang(l) {
    html.lang = l; html.dir = l === 'he' ? 'rtl' : 'ltr';
    save('lang', l);
    var u = new URL(location.href);
    if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    try { history.replaceState(null, '', u); } catch (e) {}
    d.title = l === 'he' ? 'קרן בניסטי · עיצוב שיער, צבע ואיפור · חיפה' : 'Keren Benisti · hair colour, design & makeup · Haifa';
    $$('[data-aria-he]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-aria-' + l)); });
    $$('[data-alt-he]').forEach(function (el) { el.alt = el.getAttribute('data-alt-' + l); });
    $$('[data-title-he]').forEach(function (el) { el.title = el.getAttribute('data-title-' + l); });
    $$('[data-ph-he]').forEach(function (el) { el.placeholder = el.getAttribute('data-ph-' + l); });
    status(); fillDays(); compose(); waDefaults();
    layout(); tick(true);
  }
  $('[data-lang]').addEventListener('click', function () { setLang(he() ? 'en' : 'he'); });

  // ------------------------------------------------------------------ lazy canvases (drawn once per width, never per frame)
  var drawn = new WeakMap();
  function draw(cv) {
    var w = Math.round(cv.getBoundingClientRect().width);
    if (!w || drawn.get(cv) === w) return;
    drawn.set(cv, w);
    var fn = cv._draw; if (fn) fn(cv);
  }
  var cio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) draw(e.target); });
  }, { rootMargin: '700px 0px' }) : null;
  function lazy(cv, fn) { cv._draw = fn; if (cio) cio.observe(cv); else draw(cv); }

  // swatch locks in the composer and beside the quotes
  $$('canvas[data-swatch]').forEach(function (cv, i) {
    var cols = cv.getAttribute('data-swatch').split(',');
    lazy(cv, function (c) {
      Hair.hang(c, { stops: cols, across: cv.hasAttribute('data-across'), seed: 17 + i, density: 1.2, root: .5, spread: .74, thick: 1.1, top: 0 });
    });
  });

  // ------------------------------------------------------------------ the melts
  var melts = $$('[data-melt]').map(function (m) {
    var from = m.getAttribute('data-from'), to = m.getAttribute('data-to');
    m.style.setProperty('--from', from); m.style.setProperty('--to', to);
    var rise = d.createElement('div'); rise.className = 'rise';
    rise.innerHTML = fringe(+m.getAttribute('data-seed'));
    var win = d.createElement('div'); win.className = 'win';
    var wipe = d.createElement('div'); wipe.className = 'wipe';
    var inn = d.createElement('div'); inn.className = 'wipe-in';
    var cv = d.createElement('canvas');
    inn.appendChild(cv); wipe.appendChild(inn); win.appendChild(wipe);
    m.appendChild(rise); m.appendChild(win); m.setAttribute('data-ready', '');
    var across = m.getAttribute('data-across');
    lazy(cv, function (c) { Hair.sweep(c, { from: m.getAttribute('data-a'), to: m.getAttribute('data-b'), across: across ? across.split(',') : null, seed: +m.getAttribute('data-seed') }); });
    return { el: m, rise: rise, wipe: wipe, inn: inn, k: '' };
  });
  // the rising ground's edge is cut like a fringe: many fine hair tips of uneven length
  function fringe(seed) {
    var s = seed * 9301 % 233280, R = function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    function row(n, hmin, hmax) {
      var p = 'M0 64 L0 ' + (64 - hmin).toFixed(1), x = 0;
      while (x < 1000) {
        var wdt = 2 + R() * 5, tip = 64 - (hmin + Math.pow(R(), 1.6) * (hmax - hmin));
        p += ' L' + (x + wdt * (0.4 + R() * 0.2)).toFixed(1) + ' ' + tip.toFixed(1) + ' L' + (x + wdt).toFixed(1) + ' ' + (64 - hmin * (0.5 + R() * 0.5)).toFixed(1);
        x += wdt;
      }
      return p + ' L1000 64 Z';
    }
    return '<svg class="fringe" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true"><path d="' + row(0, 4, 40) + '"/><path d="' + row(1, 10, 62) + '"/></svg>';
  }
  function setMelt(M, p) {
    var e1 = outC(clamp(p / 0.78)), e2 = io2(clamp((p - 0.18) / 0.82));
    var key = e1.toFixed(4) + e2.toFixed(4); if (key === M.k) return; M.k = key;
    M.wipe.style.transform = 'translateX(' + ((e1 - 1) * 100).toFixed(3) + '%)';
    M.inn.style.transform = 'translateX(' + (-(e1 - 1) * 120).toFixed(3) + '%)';
    M.rise.style.transform = 'translateY(calc(' + (38 + (1 - e2) * 62).toFixed(3) + '% + ' + ((1 - e2) * 66).toFixed(1) + 'px))';
  }

  // ------------------------------------------------------------------ the colouring board: base → lift → colour → shine, root to tip
  var board = $('[data-board]'), rail = $('[data-rail]'), stageBtns = $$('[data-stage]'), stageCap = $('[data-board-stage]'), stillStage = 3, bH = 0, shineH = 0, S0 = 0, S1 = 1;
  var STAGE_N = [['בסיס', 'Base'], ['הבהרה', 'Lift'], ['צבע', 'Colour'], ['ברק', 'Shine']];
  var LOCKS = {
    base: ['#2a170e', '#3d2416', '#4f3020', '#5e3b26'],
    lift: ['#4f3020', '#a27a4c', '#d8b67e', '#efd9a8'],
    colour: ['#ff2f7d', '#ff4f63', '#ff7a3d', '#ffae45', '#ffd36b'],
    shine: ['#ffffff', '#fff4f8', '#ffffff']
  };
  $$('canvas[data-hang]', board).forEach(function (cv) {
    var k = cv.getAttribute('data-hang');
    lazy(cv, function (c) {
      Hair.hang(c, { stops: LOCKS[k], seed: 29, density: k === 'shine' ? .5 : 1.25, root: .36, spread: .5, top: .0, glow: k !== 'shine', sheen: k === 'shine' ? 0 : .22, wave: 1.3, sway: .07, thick: 1.15, flat: k === 'shine' });
    });
  });
  var wipes = $$('[data-wipe]', board).map(function (w) { return { el: w, inn: $('.lk-in', w) }; }), shine = $('[data-shine]', board), shineIn = $('.lk-in', shine);
  function setBoard(f1, f2, s, st) {
    [f1, f2].forEach(function (f, i) {
      var W = wipes[i]; if (!W) return;
      W.el.style.transform = 'translateY(' + ((f - 1) * 100).toFixed(3) + '%)';
      W.inn.style.transform = 'translateY(' + (-(f - 1) * 125).toFixed(3) + '%)';
    });
    var y = -shineH + s * (bH + shineH);
    shine.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
    shineIn.style.transform = 'translateY(' + (-y).toFixed(1) + 'px)';
    shine.style.opacity = s > 0 && s < 1 ? 1 : 0;
    stageBtns.forEach(function (b, i) { b.classList.toggle('on', i === st); b.setAttribute('aria-pressed', i === st ? 'true' : 'false'); });
    stageCap.textContent = STAGE_N[st][he() ? 0 : 1];
  }
  var STAGE_P = [0.04, 0.3, 0.7, 0.9];
  // the board is pinned in its rail while the lock is coloured: p runs from the moment it pins to the moment it lets go
  function boardP() { return clamp((scrollY - S0) / Math.max(1, S1 - S0)); }
  function boardFromP(p) {
    var f1 = clamp((p - 0.08) / 0.34), f2 = clamp((p - 0.4) / 0.4), s = clamp((p - 0.8) / 0.18);
    var st = p < 0.1 ? 0 : p < 0.45 ? 1 : p < 0.8 ? 2 : 3;
    setBoard(io2(f1), io2(f2), s, st);
  }
  function boardStill() {
    var st = stillStage;
    setBoard(st >= 1 ? 1 : 0, st >= 2 ? 1 : 0, st === 3 ? 0.42 : 0, st);
    shine.style.opacity = st === 3 ? 1 : 0;
  }
  stageBtns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      if (!moving()) { stillStage = i; boardStill(); return; }
      scrollTo({ top: S0 + STAGE_P[i] * (S1 - S0), behavior: 'smooth' });
    });
  });

  // ------------------------------------------------------------------ the vanity mirror's bulbs light one by one, around the frame
  var vanity = $('[data-vanity]'), bulbs = $$('.bulbs i', vanity), ORDER = [5, 6, 7, 8, 0, 1, 2, 3, 4, 9, 10, 11, 12, 13], bulbK = -1;
  function setBulbs(p) {
    var n = Math.round(clamp(p) * bulbs.length);
    if (n === bulbK) return; bulbK = n;
    ORDER.forEach(function (bi, k) { bulbs[bi].classList.toggle('on', k < n); });
  }

  // ------------------------------------------------------------------ the frame loop: read everything, then write
  var hero = $('.hero'), heroImg = $('.hero-pic img');
  function tick(force) {
    if (!moving()) return;
    var vh = innerHeight;
    var rs = melts.map(function (M) { return M.el.getBoundingClientRect(); });
    var br = board.getBoundingClientRect(), vr = vanity.getBoundingClientRect(), hr = hero.getBoundingClientRect();
    melts.forEach(function (M, i) {
      var r = rs[i];
      if (!force && (r.bottom < -vh * 0.5 || r.top > vh * 1.5) && M.k) return;
      setMelt(M, clamp((vh - r.top) / (0.58 * vh + 0.5 * r.height)));
    });
    if (force || (br.bottom > -50 && br.top < vh + 50)) boardFromP(boardP());
    setBulbs((0.92 * vh - vr.top) / (vr.height * 0.85));
    if (hr.bottom > 0) heroImg.style.translate = '0 ' + (Math.max(0, -hr.top) * 0.18).toFixed(1) + 'px';
  }
  function still() {
    melts.forEach(function (M) { M.k = ''; setMelt(M, 1); });
    boardStill();
    bulbs.forEach(function (b) { b.classList.add('on'); });
    heroImg.style.translate = '';
  }
  window.__finish = function () { still(); };
  window.__board = function () { return [S0, S1]; };   // used only by the screenshot script
  function layout() {
    var lk = $('.lk', board); bH = lk ? lk.getBoundingClientRect().height : 0; shineH = shine.getBoundingClientRect().height;
    var rr = rail.getBoundingClientRect(), stick = parseFloat(getComputedStyle(board).top) || 0, bh = board.getBoundingClientRect().height;
    S0 = rr.top + scrollY - stick; S1 = rr.top + scrollY + rr.height - bh - stick;
    if (!moving()) still();
  }

  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; tick(); });
  }, { passive: true });
  var rzT, lastW = innerWidth;
  addEventListener('resize', function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      layout();
      if (Math.abs(innerWidth - lastW) > 40) { lastW = innerWidth; $$('canvas').forEach(function (c) { if (c._draw && drawn.has(c)) { drawn.delete(c); draw(c); } }); }
      tick(true);
    }, 160);
  });

  // ------------------------------------------------------------------ entrances: heading, then line, then picture
  var rio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-sec]').forEach(function (s) { $$('.rv', s).forEach(function (el, i) { el.style.setProperty('--rd', Math.min(i, 5) * 80 + 'ms'); }); });
  $$('.rv').forEach(function (el) { if (rio) rio.observe(el); else el.classList.add('in'); });

  // ------------------------------------------------------------------ motion switch
  var mBtn = $('[data-motion]');
  function setMotion(on, user) {
    html.classList.toggle('moving', on); html.classList.toggle('still', !on);
    mBtn.setAttribute('aria-checked', on ? 'true' : 'false');
    if (user) save('motion', on ? 'on' : 'off');
    layout();
    if (on) { melts.forEach(function (M) { M.k = ''; }); bulbK = -1; tick(true); }
    else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); still(); }
  }
  mBtn.addEventListener('click', function () { setMotion(!moving(), true); });

  // ------------------------------------------------------------------ nav: the section you are in; the mark's lock gains a colour per section passed
  var order = ['work', 'craft', 'makeup', 'keren', 'reviews', 'message', 'visit'];
  var MARK = ['#ff6fae', '#ff9a52', '#a993ff', '#ff86c8', '#f3c27a', '#5fd8c4'];
  var markBars = $$('.mark-lock b');
  function setActive(id) {
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === id); });
    var idx = order.indexOf(id);
    markBars.forEach(function (b, i) { b.style.backgroundColor = i <= idx - (id === 'visit' ? 1 : 0) || idx === 6 ? MARK[i] : ''; });
  }
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    order.forEach(function (id) { var el = d.getElementById(id); if (el) nio.observe(el); });
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) setActive(''); }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
  }

  // ------------------------------------------------------------------ the compact: appears once the page's own call buttons are out of view
  var compact = $('[data-compact]'), cBtn = $('.compact-btn', compact), seen = new Set();
  function compactUI() { compact.classList.toggle('show', seen.size === 0); if (seen.size) closeCompact(); }
  function closeCompact() { compact.classList.remove('open'); cBtn.setAttribute('aria-expanded', 'false'); }
  cBtn.addEventListener('click', function () {
    var o = !compact.classList.contains('open');
    compact.classList.toggle('open', o); cBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  d.addEventListener('click', function (e) { if (!compact.contains(e.target)) closeCompact(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCompact(); });
  if ('IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      compactUI();
    });
    ['[data-hero-actions]', '[data-send]', '[data-visit-actions]', '.foot-info'].forEach(function (s) { var el = $(s); if (el) kio.observe(el); });
  } else compact.classList.add('show');

  // ------------------------------------------------------------------ start
  setLang(html.lang === 'en' ? 'en' : 'he');
  setMotion(moving(), false);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { layout(); tick(true); });
  addEventListener('load', function () { layout(); tick(true); });
  setInterval(status, 60000);
})();
