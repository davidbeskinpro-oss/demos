(function () {
  var root = document.documentElement, WA = '972544636194';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'Techlock · מנעולן בחיפה · ניקולאי', en: 'Techlock · Locksmith in Haifa · Nikolai' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Techlock Israel מנעולן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Techlock Israel Locksmith · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- decode: letters settle out of keypad glyphs, like a code being entered
  var HEB = 'אבגדהוזחטיכלמנסעפצקרשת', LAT = 'ABCDEFGHJKLMNOPRSTUVWXYZ0123456789#*';
  function decode(el, text, dur) {
    clearInterval(el._dec);
    if (still()) { el.textContent = text; return; }
    var chars = text.split(''), t0 = performance.now(), D = dur || 700;
    el.innerHTML = chars.map(function () { return '<span class="g"></span>'; }).join('');
    var gs = el.children;
    el._dec = setInterval(function () {
      var u = (performance.now() - t0) / D, done = true;
      for (var i = 0; i < chars.length; i++) {
        var c = chars[i], settle = (i + 1) / chars.length;
        if (u >= settle || c === ' ' || c === '.') { gs[i].textContent = c; gs[i].className = 'g'; }
        else { done = false; var pool = /[֐-׿]/.test(c) ? HEB : LAT; gs[i].textContent = pool[Math.floor(Math.random() * pool.length)]; gs[i].className = 'g dec'; }
      }
      if (done) { clearInterval(el._dec); el.textContent = text; }
    }, 45);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-tabs]', 'דרכי כניסה', 'Ways in');
    aria('[data-t-job]', 'מה צריך', 'What you need');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-wprev]', 'הקודם', 'Previous');
    aria('[data-wnext]', 'הבא', 'Next');
    aria('[data-t-call]', 'התקשרו לניקולאי, 054-463-6194', 'Call Nikolai, 054-463-6194');
    aria('[data-t-wa]', 'וואטסאפ לניקולאי', 'WhatsApp Nikolai');
    $$('[data-lbl]').forEach(function (s) { s.textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tl64-lang', l); } catch (e) {}
    texts(l); hours(); write(true); showWay(cur, true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('tl64-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('.brandline').textContent = 'Techlock'; fword.textContent = 'Techlock';
    showWay(cur, true); layout(); ridges.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed day
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [8, 20] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && (t[0] === 0 && t[1] === 24)) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {   // consecutive days with the same hours share a row; the week starts on Sunday
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : r[0] === 0 && r[1] === 6 ? (l ? 'כל ימות השבוע' : 'Every day') : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? '24/7' : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.c-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the fingerprint of light: dotted ridges, a scan band, ripples from the hand
  var ridges = (function () {
    var cv = $('[data-ridges]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, rip = [], lastAuto = 0, t0 = performance.now();
    function build() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P = [];
      var cx = phone() ? w * .5 : (root.dir === 'rtl' ? w * .74 : w * .26), cy = phone() ? h * .26 : h * .5;
      var R = phone() ? Math.min(w * .62, 300) : Math.min(h * .62, 460), gap = phone() ? 9 : 11, K = Math.floor(R / gap);
      for (var k = 1; k <= K; k++) {
        var r = k * gap, n = Math.max(12, Math.floor(r * 6.28 / 6));
        for (var i = 0; i < n; i++) {
          var a = i / n * 6.283;
          // a loop pattern: ellipses that open into arches at the bottom, with small breaks like real ridges
          var wob = 1 + .06 * Math.sin(a * 3 + k * .7) + .04 * Math.sin(a * 7 - k);
          var x = cx + Math.cos(a) * r * .82 * wob, y = cy + Math.sin(a) * r * 1.08 * wob;
          if (Math.sin(a) > .55 && k > K * .45) y += (Math.sin(a) - .55) * r * .9;
          if (Math.sin(a * 5 + k * 1.9) > .93) continue;
          P.push({ hx: x, hy: y, x: x, y: y, vx: 0, vy: 0, k: k / K });
        }
      }
    }
    function frame(t) {
      raf = 0; var calm = still(), T = (t - t0) / 1000;
      c.clearRect(0, 0, w, h);
      var band = calm ? -999 : ((T % 6) / 3.2) * (h + 200) - 100;   // the sensor's scan band
      if (!calm && !fine && t - lastAuto > 2600 && P.length) { lastAuto = t; var o = P[Math.floor(Math.random() * P.length)]; rip.push({ x: o.hx, y: o.hy, t: t }); }
      rip = rip.filter(function (r) { return t - r.t < 1600; });
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = .16 + p.k * .06, s = 1.6;
        if (!calm) {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 12000) { var f = (12000 - d2) / 12000 * 2.2, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; a += .5 * (12000 - d2) / 12000; }
          for (var j = 0; j < rip.length; j++) { var rr = (t - rip[j].t) * .32, ex = p.hx - rip[j].x, ey = p.hy - rip[j].y, dist = Math.sqrt(ex * ex + ey * ey); if (Math.abs(dist - rr) < 14) { var g = 1 - (t - rip[j].t) / 1600; a += .6 * g; s += 1.2 * g; p.vx += ex / (dist || 1) * 1.4 * g; p.vy += ey / (dist || 1) * 1.4 * g; } }
          if (Math.abs(p.hy - band) < 26) { a += .45 * (1 - Math.abs(p.hy - band) / 26); }
          p.vx += (p.hx - p.x) * .07; p.vy += (p.hy - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        }
        c.globalAlpha = Math.min(1, a); c.fillStyle = a > .4 ? '#bfe2ff' : '#5cb4ff';
        c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); rip.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); kick(); });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { build(); kick(); }, kick: kick };
  })();

  // the hero photo: a lens of full colour follows the cursor (or the finger)
  var sp = $('[data-scanphoto]'), lensT = 0;
  function lens(e, on) {
    var r = sp.getBoundingClientRect();
    sp.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    sp.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    sp.style.setProperty('--lr', on ? (phone() ? '80px' : '120px') : '0px');
  }
  sp.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) lens(e, true); });
  sp.addEventListener('pointerdown', function (e) { clearTimeout(lensT); lens(e, true); });
  sp.addEventListener('pointerleave', function (e) { lens(e, false); });
  sp.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') lensT = setTimeout(function () { sp.style.setProperty('--lr', '0px'); }, 900); });

  // ---------------------------------------------------------------- ways in: one line stays, the photo under it swaps with a scan wipe
  var ways = $('[data-ways]'), wps = $$('[data-wp]'), tabs = $$('[data-wtab]'), word = $('[data-word]'), wcap = $('[data-wcap]'),
      wipe = $('[data-wipe]'), veil = $('[data-veil]'), rail = $('[data-wrail]'), N = wps.length, cur = -1;
  function showWay(i, force) {
    if (i === cur && !force) return; cur = i;
    var l = he() ? 'he' : 'en', p = wps[i];
    decode(word, p.dataset[l], 520);
    wcap.textContent = p.dataset[l === 'he' ? 'capHe' : 'capEn'];
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    if (still()) wps.forEach(function (w, k) { w.style.setProperty('--k', k <= i ? 1 : 0); });
  }
  function goWay(i) {
    i = (i + N) % N;
    if (still() || !io) { showWay(i); return; }
    var r = ways.getBoundingClientRect(), span = r.height - innerHeight, top = scrollY + r.top;
    scrollTo({ top: top + span * (.08 + .84 * i / (N - 1)) + 2, behavior: 'smooth' });
  }
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { goWay(k); }); });
  $('[data-wprev]').addEventListener('click', function () { goWay(cur - 1); });
  $('[data-wnext]').addEventListener('click', function () { goWay(cur + 1); });
  // the keypad in his own photo types a code by itself
  var KP = [[42.5, 37.5], [49.4, 38.5], [56.5, 39.3], [42.5, 43.7], [49.6, 44.7], [56.5, 45.7], [42.5, 50], [49.4, 51], [56.2, 52], [42.5, 55.7], [49.1, 57], [55.7, 58.3], [49.6, 63.5]];
  var keysBox = $('[data-keys]'), kEls = KP.map(function (q) { var i = document.createElement('i'); i.style.left = q[0] + '%'; i.style.top = q[1] + '%'; keysBox.appendChild(i); return i; }), waysOn = false, kStep = 0;
  watch(ways, function (v) { waysOn = v; });
  function hit(el) { el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
  setInterval(function () {
    if (!waysOn || still() || cur !== 0) return;
    var seq = [3, 7, 0, 5, 12]; hit(kEls[seq[kStep % seq.length]]); kStep++;
  }, 420);

  // ---------------------------------------------------------------- bento: spotlight under the hand (drifting by itself on touch), tilt, keypad, odometers
  var svc = $('#services'), svcOn = false;
  watch(svc, function (v) { svcOn = v; svc.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var tilt = $('[data-tilt]');
  $('.t-smart').addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = tilt.getBoundingClientRect(); tilt.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(2) + 'deg'); tilt.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 10).toFixed(2) + 'deg'); });
  $('.t-smart').addEventListener('pointerleave', function () { tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg'); });
  var padG = $('[data-padkeys]'), padKeys = [];
  for (var r = 0; r < 4; r++) for (var cc = 0; cc < 3; cc++) { var k = document.createElementNS(NS, 'rect'); k.setAttribute('x', 74 + cc * 19); k.setAttribute('y', 40 + r * 26); k.setAttribute('width', 14); k.setAttribute('height', 18); k.setAttribute('rx', 3); k.setAttribute('class', 'k'); padG.appendChild(k); padKeys.push(k); }
  var bell = document.createElementNS(NS, 'rect'); bell.setAttribute('x', 88); bell.setAttribute('y', 146); bell.setAttribute('width', 24); bell.setAttribute('height', 0); padG.appendChild(bell);
  var padN = 0;
  setInterval(function () {
    if (!svcOn || still()) { padKeys.forEach(function (k, i) { k.classList.toggle('on', still() && i % 2 === 0); }); return; }
    var seq = [0, 4, 8, 7, 11]; padKeys.forEach(function (k) { k.classList.remove('on'); }); padKeys[seq[padN % seq.length]].classList.add('on'); padN++;
    // on touch screens the spotlight drifts across the tiles by itself
    if (!fine) $$('.bento .tile').forEach(function (t, i) { var a = performance.now() / 1400 + i; t.style.setProperty('--mx', (50 + Math.cos(a) * 35) + '%'); t.style.setProperty('--my', (45 + Math.sin(a * 1.3) * 30) + '%'); });
  }, 480);
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- on site: the lights go out, a torch finds the gate
  var work = $('[data-work]'), dark = $('[data-dark]'), torch = $('[data-torch]'), lbls = $$('[data-lbl]'), workOn = false, tUser = 0, tx = .52, ty = .4;
  watch(work, function (v) { workOn = v; work.classList.toggle('on', v); });
  lbls.forEach(function (s) { s.style.setProperty('--x', s.dataset.x); s.style.setProperty('--y', s.dataset.y); });
  function aim(x, y) {
    tx = x; ty = y;
    torch.style.setProperty('--tx', (x * 100).toFixed(1) + '%'); torch.style.setProperty('--ty', (y * 100).toFixed(1) + '%');
    torch.style.setProperty('--tr', Math.round(torch.clientWidth * .42) + 'px');
    lbls.forEach(function (s) {
      var dx = (+s.dataset.x - x) * torch.clientWidth, dy = (+s.dataset.y - y) * torch.clientHeight, on = still() || Math.sqrt(dx * dx + dy * dy) < torch.clientWidth * .36;
      if (on && !s.classList.contains('on')) decode(s, s.dataset[he() ? 'he' : 'en'], 420);
      s.classList.toggle('on', on);
    });
  }
  function torchAt(e) { var r = torch.getBoundingClientRect(); tUser = performance.now(); aim(clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1)); }
  torch.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) torchAt(e); });
  torch.addEventListener('pointerdown', torchAt);

  // ---------------------------------------------------------------- message: steps, choices, and the lock's display writes the message
  var steps = $$('[data-step]'), jobs = $$('[data-job]'), wheres = $$('[data-where]'), msgEl = $('[data-msg]'), shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function radio(group, n) { group.forEach(function (b) { b.addEventListener('click', function () { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(n); write(); }); }); }
  radio(jobs, 0); radio(wheres, 1);
  ['pointerenter', 'focus'].forEach(function (ev) { $('[data-send]').addEventListener(ev, function () { lightStep(2); }); });
  function pick(g, l) { return g.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en']; }
  function compose() {
    var l = he(), j = pick(jobs, l), w = pick(wheres, l);
    return l ? 'שלום ניקולאי, אשמח לעזרה עם ' + j + ' ' + w + '. מתי נוח לך?'
             : 'Hi Nikolai, I’d like help with ' + j + ' ' + w + '. When would suit you?';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-device]'), function (v) { if (v && !seen) { seen = true; lightStep(0); shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer: a curtain; the name decodes as it is uncovered
  var foot = $('[data-foot]'), fword = $('[data-fword]'), page = $('.page'), lockbar = $('[data-lockbar]');
  function curtain() {
    foot.classList.remove('curtain'); page.style.marginBottom = '';
    var fh = foot.offsetHeight;
    if (fh < innerHeight * .8) { foot.classList.add('curtain'); page.style.marginBottom = fh + 'px'; }
  }
  var fSeen = false;
  function footer() {   // the footer is fixed under the page, so "seen" means the page has lifted off it
    var left = document.documentElement.scrollHeight - scrollY - innerHeight, shown = left < foot.offsetHeight * .6;
    foot.classList.toggle('near', left < foot.offsetHeight + 40);
    lockbar.classList.toggle('away', shown);
    if (shown && !fSeen) { fSeen = true; decode(fword, 'Techlock', 900); }
  }

  var revs = $$('[data-rv]'), faq = $('[data-faq]'), reach = $('#reach');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    footer();
    if (!calm) ridges.kick();
    // ways: the frosted veil is scanned off as the block arrives, then the photos swap under the line
    var wr = ways.getBoundingClientRect();
    if (!calm) {
      veil.style.setProperty('--vp', smooth((vh * .55 - wr.top) / (vh * .55)).toFixed(4));
      var p = clamp(-wr.top / Math.max(1, wr.height - vh), 0, 1), f = clamp((p - .08) / .84, 0, 1) * (N - 1), wy = 0, wo = 0;
      wps.forEach(function (w, i) { if (!i) return; var k = smooth(f - (i - 1)); w.style.setProperty('--k', k.toFixed(4)); if (k > 0 && k < 1) { wy = k; wo = 1; } });
      wipe.style.setProperty('--wy', wy.toFixed(4)); wipe.style.setProperty('--wo', wo);
      rail.style.setProperty('--wr', p.toFixed(4));
      showWay(clamp(Math.round(f), 0, N - 1));
    }
    // on site: darkness falls as you arrive; on touch screens the torch follows the scroll until a finger takes it
    var kr = work.getBoundingClientRect();
    dark.style.setProperty('--dk', calm ? '' : (smooth((vh - kr.top) / (vh * .6)) * .85).toFixed(3));
    if (!calm && workOn && (!fine && performance.now() - tUser > 2500)) {
      var tr = torch.getBoundingClientRect(), q = clamp((vh * .5 - tr.top) / tr.height, 0, 1);
      aim(.5 + Math.sin(q * 9) * .3, .08 + q * .84);
    }
    // reviews: each card is scanned as it crosses the middle of the screen
    revs.forEach(function (rv) { var r = rv.getBoundingClientRect(), q = calm ? 1 : smooth((vh * .9 - r.top) / (r.height + vh * .3)); rv.style.setProperty('--q', q.toFixed(3)); });
    // contact rides up over the questions: they step back
    var rr = reach.getBoundingClientRect(), b = calm ? 0 : smooth((vh - rr.top) / (vh * .7));
    faq.style.transform = b ? 'scale(' + (1 - b * .05).toFixed(4) + ')' : '';
    faq.style.opacity = b ? (1 - b * .45).toFixed(3) : '';
  }
  // the torch drifts by itself on touch screens while you read
  setInterval(function () { if (!workOn || still() || fine || performance.now() - tUser < 2500) return; tick(); }, 600);

  function layout() { ridges.size(); curtain(); aim(tx, ty); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); showWay(0, true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); decode($('.brandline'), 'Techlock', 900); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', layout);
})();
