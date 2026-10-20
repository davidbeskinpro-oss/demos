/* Avi Biton · the curl. Language, motion switch, live hours, the curl seam (combed long, released, springs back),
   the hair-type cards, the booking card composer and the curl capsule. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.min(b, Math.max(a, v)); };
  var sstep = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  var io2 = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var WA = 'https://wa.me/972509107402';
  var he = function () { return html.lang !== 'en'; };
  var moving = function () { return html.classList.contains('moving'); };
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ------------------------------------------------------------ hours (Google listing; minutes from midnight, Sun..Sat; null = closed)
  var HOURS = window.__HOURS || [[480, 1140], null, [480, 1140], [480, 1140], [480, 1140], [480, 900], null];
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function hm(m) { return Math.floor(m / 60) + ':' + ('0' + m % 60).slice(-2); }
  function is24(h) { return h && h[0] === 0 && h[1] >= 1440; }
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
    if (is24(h)) { open = true; txt = he() ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (h && n.min >= h[0] && n.min < h[1]) { open = true; txt = he() ? 'פתוח עכשיו · עד ' + hm(h[1]) : 'Open now · until ' + hm(h[1]); }
    else if (h && n.min < h[0]) txt = he() ? 'סגור עכשיו · נפתח היום ב־' + hm(h[0]) : 'Closed now · opens today at ' + hm(h[0]);
    else {
      for (var k = 1; k <= 7; k++) {
        var dd = (n.day + k) % 7, hh = HOURS[dd];
        if (!hh) continue;
        var at = is24(hh) ? '' : (he() ? ' ב־' + hm(hh[0]) : ' at ' + hm(hh[0]));
        if (k === 1) txt = he() ? 'סגור עכשיו · נפתח מחר' + at : 'Closed now · opens tomorrow' + at;
        else txt = he() ? 'סגור עכשיו · נפתח ביום ' + DAY_HE[dd] + at : 'Closed now · opens ' + DAY_EN[dd] + at;
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
        b.textContent = h2 ? (is24(h2) ? (he() ? '24 שעות' : '24 hours') : hm(h2[0]) + '–' + hm(h2[1])) : (he() ? 'סגור' : 'Closed');
        b.dir = 'ltr';
        if (!h2) li.className = 'closed';
        if (i === n.day) { li.classList.add('today'); a.textContent += he() ? ' · היום' : ' · today'; }
        li.appendChild(a); li.appendChild(b); ul.appendChild(li);
      });
    }
  }

  // ------------------------------------------------------------ the booking card
  var HAIR = { curly: ['מתולתל', 'curly'], wavy: ['גלי', 'wavy'], straight: ['חלק', 'straight'] };
  var form = $('[data-composer]'), msgEl = $('[data-msg]'), sendEl = $('[data-send]'), daySel = $('[data-day]');
  var OPEN_DAYS = HOURS.map(function (h, i) { return h ? i : -1; }).filter(function (i) { return i >= 0; });
  function fillDays() {
    var v = daySel.value;
    daySel.innerHTML = '';
    OPEN_DAYS.forEach(function (i) { var o = d.createElement('option'); o.value = String(i); o.textContent = he() ? 'יום ' + DAY_HE[i] : DAY_EN[i]; daySel.appendChild(o); });
    var f = d.createElement('option'); f.value = 'any'; f.textContent = he() ? 'גמיש, מה שנוח לאבי' : 'Flexible, whatever suits Avi'; daySel.appendChild(f);
    daySel.value = v || 'any';
    $$('option[data-he]', form).forEach(function (o) { o.textContent = o.getAttribute(he() ? 'data-he' : 'data-en'); });
  }
  function compose() {
    var L = he() ? 0 : 1, hair = (form.querySelector('input[name="hair"]:checked') || {}).value || 'curly';
    var svcO = form.svc.options[form.svc.selectedIndex], svc = form.svc.value, day = daySel.value;
    var name = (form.nm.value || '').trim().replace(/\s+/g, ' ');
    var lines = [];
    if (L) {
      lines.push('Hi Avi' + (name ? ', this is ' + name : '') + '.');
      lines.push(svc === 'advice' ? 'I have ' + HAIR[hair][1] + ' hair and would like your advice before booking.' : 'I have ' + HAIR[hair][1] + ' hair and would like to book: ' + svcO.getAttribute('data-en').toLowerCase() + '.');
      lines.push('Best day: ' + (day === 'any' ? 'flexible' : DAY_EN[+day]) + '.');
      lines.push('Thank you!');
    } else {
      lines.push('היי אבי' + (name ? ', כאן ' + name : '') + '.');
      lines.push(svc === 'advice' ? 'השיער שלי ' + HAIR[hair][0] + ', ואשמח להתייעץ לפני שקובעים.' : 'השיער שלי ' + HAIR[hair][0] + ', ואשמח לקבוע תור: ' + svcO.getAttribute('data-he') + '.');
      lines.push('יום נוח: ' + (day === 'any' ? 'גמיש' : 'יום ' + DAY_HE[+day]) + '.');
      lines.push('תודה!');
    }
    var m = lines.join('\n');
    msgEl.textContent = m;
    sendEl.href = WA + '?text=' + encodeURIComponent(m);
  }
  function waDefaults() {
    var m = he() ? 'היי אבי, הגעתי דרך האתר ואשמח לקבוע תור.' : 'Hi Avi, I found you through the website and would like to book.';
    $$('[data-wa]').forEach(function (a) { a.href = WA + '?text=' + encodeURIComponent(m); });
  }
  form.addEventListener('input', compose);
  form.addEventListener('change', compose);
  $$('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = form.querySelector('input[name="hair"][value="' + b.getAttribute('data-pick') + '"]');
      if (r) { r.checked = true; compose(); }
      var top = $('#book').getBoundingClientRect().top + scrollY - 70;
      scrollTo({ top: top, behavior: moving() ? 'smooth' : 'auto' });
    });
  });

  // ------------------------------------------------------------ language
  function setLang(l) {
    html.lang = l; html.dir = l === 'he' ? 'rtl' : 'ltr';
    save('ab-lang', l);
    var u = new URL(location.href);
    if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    try { history.replaceState(null, '', u); } catch (e) {}
    d.title = l === 'he' ? 'אבי ביטון · מספרה ותלתלים · שדרות מוריה 23, חיפה' : 'Avi Biton · hair salon & curls · 23 Moriah Blvd, Haifa';
    $$('[data-aria-he]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-aria-' + l)); });
    $$('[data-alt-he]').forEach(function (el) { el.alt = el.getAttribute('data-alt-' + l); });
    $$('[data-title-he]').forEach(function (el) { el.title = el.getAttribute('data-title-' + l); });
    $$('[data-ph-he]').forEach(function (el) { el.placeholder = el.getAttribute('data-ph-' + l); });
    status(); fillDays(); compose(); waDefaults();
    curl.layout(); tick(true);
  }
  $('[data-lang]').addEventListener('click', function () { setLang(he() ? 'en' : 'he'); });

  // ------------------------------------------------------------ the curl
  // A lock of curly hair hangs from the top of the seam as a helix. The comb enters, slides down the lock and pulls
  // it long and nearly straight (the part above the comb straightens, the part below stays coiled). When the comb
  // lets go, the lock springs back: it overshoots a little tighter, bounces, and settles in its own shape.
  // Everything is a function of scroll progress, so scrolling up runs it backwards and every pass replays it.
  var curl = (function () {
    var svg = $('[data-ribbon]'), gB = $('[data-back]', svg), gF = $('[data-front]', svg), comb = $('[data-comb]', svg);
    var NS = 'http://www.w3.org/2000/svg';
    function mk(g, cls) { var p = d.createElementNS(NS, 'path'); if (cls) p.setAttribute('class', cls); g.appendChild(p); return p; }
    var bFill = mk(gB), bStr = mk(gB, 'strand'), fFill = mk(gF), fStr = mk(gF, 'strand'), fStr2 = mk(gF, 'strand dark'), fSheen = mk(gF, 'sheen');
    var OFF = [-.78, -.5, -.22, .08, .34, .6, .84];
    var teeth = $('[data-teeth]', svg), i;
    for (i = -140; i <= 140; i += 11) {
      var r = d.createElementNS(NS, 'rect');
      r.setAttribute('x', i - 2.5); r.setAttribute('y', 6); r.setAttribute('width', 5); r.setAttribute('height', i % 2 ? 30 : 36); r.setAttribute('rx', 2.5);
      teeth.appendChild(r);
    }
    var N = 4, T = Math.PI * 2 * N, M = 400, R0 = 26, CX = 300, Y0 = -60, YC = 330;
    var RC = 150, RS = 12, KC = 80 / (2 * Math.PI), KS = (1060 - YC) / T, W = 40;
    var pts = new Array(M + R0 + 1);
    // s(t): how far each point of the lock is pulled straight (1) or left in its curl (0)
    function shape(p) {
      var phase = .6 + p * 1.2, tc, rel = 0, A = 0, k;
      if (p <= .62) tc = io2(clamp((p - .08) / .54)) * (T + 1.2);
      else { var q = clamp((p - .62) / .38); rel = 1; A = .05 + .95 * Math.exp(-4.6 * q) * Math.cos(2.7 * Math.PI * q); }
      // the root: the lock hangs fairly straight from above before its curl begins
      var s0 = rel ? A : (tc > .2 ? 1 : 0), r0 = RC + (RS - RC) * s0, xs = CX + r0 * Math.cos(phase);
      for (k = 0; k < R0; k++) {
        var u = k / R0, e = sstep(.15, 1, u);
        pts[k] = { x: CX + (xs - CX) * e, y: Y0 + (YC - Y0) * u, z: 1, s: 1, t: -1 + u };
      }
      var y = YC;
      for (k = 0; k <= M; k++) {
        var t = k / M * T, s = rel ? A : 1 - sstep(tc - 1.1, tc + .35, t);
        if (!rel && tc <= 0) s = 0;
        var rr = RC + (RS - RC) * s, kk = KC + (KS - KC) * s, th = t + phase;
        if (k) y += kk * (T / M);
        pts[R0 + k] = { x: CX + rr * Math.cos(th), y: y, z: Math.sin(th), s: s, t: t };
      }
      return { tc: tc, rel: rel };
    }
    function f1(v) { return Math.round(v * 10) / 10; }
    function build(sm) {
      var dB = '', dF = '', sB = '', sF = '', sF2 = '', sh = '', runs = [], cur = null, k;
      var MM = M + R0;
      for (k = 0; k <= MM; k++) {
        var front = pts[k].z >= 0 || pts[k].s > .82;
        if (!cur || cur.front !== front) { if (cur) { cur.b = k; runs.push(cur); } cur = { front: front, a: Math.max(0, k - 1) }; }
      }
      cur.b = MM; runs.push(cur);
      runs.forEach(function (R) {
        if (R.b - R.a < 1) return;
        var L = [], Rt = [], mid = [], S = OFF.map(function () { return []; });
        for (var j = R.a; j <= R.b; j++) {
          var P = pts[j], A = pts[Math.max(0, j - 1)], B = pts[Math.min(MM, j + 1)];
          var dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
          var u = Math.max(0, P.t) / T, taper = 1 - .72 * u * u;
          var face = .26 + .74 * Math.abs(P.z), flat = clamp(P.s);
          var w = W * taper * (face + (.92 - face) * flat) / 2;
          L.push(f1(P.x + nx * w) + ' ' + f1(P.y + ny * w));
          Rt.push(f1(P.x - nx * w) + ' ' + f1(P.y - ny * w));
          for (var o = 0; o < OFF.length; o++) { var ow = w * OFF[o] * (1 + .04 * Math.sin(P.t * 3 + o)); S[o].push(f1(P.x + nx * ow) + ' ' + f1(P.y + ny * ow)); }
          mid.push(f1(P.x + nx * w * .62) + ' ' + f1(P.y + ny * w * .62));
        }
        var poly = 'M' + L.join('L') + 'L' + Rt.reverse().join('L') + 'Z';
        var str = '', str2 = '';
        S.forEach(function (a, o) { if (o % 2) str2 += 'M' + a.join('L'); else str += 'M' + a.join('L'); });
        if (R.front) { dF += poly; sF += str; sF2 += str2; if (mid.length > 6) sh += 'M' + mid.slice(2, -2).join('L'); }
        else { dB += poly; sB += str + str2; }
      });
      bFill.setAttribute('d', dB || 'M0 0'); bStr.setAttribute('d', sB || 'M0 0');
      fFill.setAttribute('d', dF || 'M0 0'); fStr.setAttribute('d', sF || 'M0 0'); fStr2.setAttribute('d', sF2 || 'M0 0'); fSheen.setAttribute('d', sh || 'M0 0');
    }
    function yAt(t) { var k = Math.round(clamp(t / T) * M); return pts[R0 + k].y; }
    var lastKey = '';
    function at(p) {
      var key = p.toFixed(4); if (key === lastKey) return; lastKey = key;
      var st = shape(p); build();
      // the comb: slides in from the side, rides down the lock with its teeth through it, then lets go and leaves
      var cy, cx = 0, op = 1, rot = -4;
      if (p < .08) { var a = sstep(0, .08, p); cx = (1 - a) * 260; op = a; cy = yAt(0) - 20; }
      else if (!st.rel) { cy = yAt(Math.min(st.tc, T)) + 10; rot = -4 + 3 * Math.sin(p * 30); }
      else { var e = sstep(.62, .72, p); cy = yAt(T) * (1 - e * .1); cx = e * 330; op = 1 - e; rot = -4 - e * 18; }
      if (!he()) cx = -cx;
      comb.setAttribute('transform', 'translate(' + f1(CX + cx) + ' ' + f1(cy) + ') rotate(' + rot.toFixed(2) + ')');
      comb.style.opacity = op.toFixed(3);
      var stage = svg.parentNode;
      var wide = innerWidth >= 760;
      stage.style.setProperty('--oa', (1 - (wide ? sstep(.56, .64, p) : sstep(.12, .22, p))).toFixed(3));
      stage.style.setProperty('--ob', (wide ? sstep(.66, .76, p) : sstep(.68, .8, p)).toFixed(3));
    }
    function stillPose() {
      lastKey = '';
      shape(1.2); build();
      comb.setAttribute('transform', 'translate(' + (he() ? 190 : 410) + ' 700) rotate(' + (he() ? -10 : 10) + ')');
      comb.style.opacity = 1;
    }
    function layout() {
      svg.setAttribute('viewBox', moving() ? '0 0 600 1100' : '0 120 600 640');
      if (!moving()) stillPose(); else lastKey = '';
    }
    return { at: at, layout: layout, stillPose: stillPose, el: $('#curl') };
  })();

  // ------------------------------------------------------------ the frame loop
  var raf = 0, hero = $('.hero'), heroImg = $('.hero-pic img');
  function tick(force) {
    raf = 0;
    if (!moving()) return;
    var vh = innerHeight, r = curl.el.getBoundingClientRect();
    if (force || (r.bottom > -vh && r.top < vh * 2)) curl.at(clamp(-r.top / Math.max(1, r.height - vh)));


  }
  function req() { if (!raf) raf = requestAnimationFrame(function () { tick(false); }); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { curl.layout(); tick(true); });

  // ------------------------------------------------------------ entrances and the living cards
  var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-r]').forEach(function (el) {
    var sib = $$('[data-r]', el.parentNode).indexOf(el);
    el.style.setProperty('--d', Math.min(3, Math.max(0, sib)) * 80 + 'ms');
    if (revealIO) revealIO.observe(el); else el.classList.add('in');
  });
  var run = $('[data-run]');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { run.classList.toggle('live', e.isIntersecting); }); }).observe(run);
  else run.classList.add('live');

  // ------------------------------------------------------------ motion switch
  var mBtn = $('[data-motion]');
  function setMotion(on, user) {
    html.classList.toggle('moving', on); html.classList.toggle('still', !on);
    mBtn.setAttribute('aria-checked', on ? 'true' : 'false');
    if (user) save('ab-motion', on ? 'on' : 'off');
    if (!on) { $$('[data-r]').forEach(function (el) { el.classList.add('in'); }); heroImg.style.translate = ''; }
    curl.layout(); tick(true);
  }
  mBtn.addEventListener('click', function () { setMotion(!moving(), true); });

  // ------------------------------------------------------------ the curl capsule (phones)
  var cap = $('[data-cap]'), capBtn = $('[data-cap-btn]');
  // it waits until the hero's own buttons have scrolled away, so it never sits on top of them
  if ('IntersectionObserver' in window) {
    cap.classList.add('away');
    new IntersectionObserver(function (es) { es.forEach(function (e) { cap.classList.toggle('away', e.isIntersecting || e.boundingClientRect.top > 0); }); }).observe($('.hero .acts'));
  }
  capBtn.addEventListener('click', function () {
    var open = !cap.classList.contains('open');
    cap.classList.toggle('open', open); capBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  d.addEventListener('click', function (e) { if (!cap.contains(e.target) && cap.classList.contains('open')) { cap.classList.remove('open'); capBtn.setAttribute('aria-expanded', 'false'); } });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { cap.classList.remove('open'); capBtn.setAttribute('aria-expanded', 'false'); } });

  // ------------------------------------------------------------ footer: the comb's teeth along the top edge
  var ft = $('[data-foot-teeth]');
  if (ft) {
    var s = '';
    for (var x = 6; x < 1200; x += 14) s += '<rect x="' + x + '" y="' + (x % 28 ? 14 : 8) + '" width="7" height="40" rx="3.5"/>';
    ft.innerHTML = s;
  }

  setMotion(moving(), false);
  setLang(html.lang === 'en' ? 'en' : 'he');
  setInterval(status, 60000);
  // failsafe: never leave content hidden
  setTimeout(function () { $$('[data-r]').forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }); }, 1600);
  window.__curlAt = function (p) { curl.at(p); };
})();
