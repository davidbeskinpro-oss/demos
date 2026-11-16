(function () {
  var root = document.documentElement, WA = '972545666895';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var hover = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'מתן חשמלאי · חשמל ותאורה · הרדוף 8, טירת כרמל', en: 'Matan Electric · Electrical & lighting · 8 HaRardof St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מתן חשמלאי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Matan Electric · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- kelvin → light colour (blackbody approximation)
  function k2rgb(K) {
    var t = K / 100, r, g, b;
    if (t <= 66) { r = 255; g = 99.47 * Math.log(t) - 161.12; b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04; }
    else { r = 329.7 * Math.pow(t - 60, -0.1332); g = 288.12 * Math.pow(t - 60, -0.0755); b = 255; }
    return [clamp(r, 0, 255) | 0, clamp(g, 0, 255) | 0, clamp(b, 0, 255) | 0];
  }
  // a photo tint that reads both ways: amber below neutral, blue above it
  function tint(el, K) {
    var t = (K - 2200) / 5300, n = .43;
    if (t < n) { el.style.setProperty('--tc', '#ff8f2e'); el.style.setProperty('--to', ((n - t) / n * .4).toFixed(3)); }
    else { el.style.setProperty('--tc', '#5f8dff'); el.style.setProperty('--to', ((t - n) / (1 - n) * .42).toFixed(3)); }
  }

  // ---------------------------------------------------------------- language
  function decodeNow(el) { el.textContent = el.dataset[he() ? 'he' : 'en']; }
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מתן חשמלאי', 'Matan Electric');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו למתן, 054-566-6895', 'Call Matan, 054-566-6895');
    aria('[data-t-rooms]', 'חדרים', 'Rooms');
    aria('[data-t-jobs]', 'עבודה', 'Job');
    aria('[data-wprev]', 'השלב הקודם', 'Previous step');
    aria('[data-wnext]', 'השלב הבא', 'Next step');
    $$('.stars.sm').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $('[data-t-map]').title = l === 'he' ? 'מפה: הרדוף 8, טירת כרמל' : 'Map: 8 HaRardof St, Tirat Carmel';
    $$('[data-decode]').forEach(function (c) { if (c._done || still()) decodeNow(c); });
    $$('[data-tag]').forEach(function (t) { if (t.classList.contains('on')) t.innerHTML = '<span>' + t.dataset[l] + '</span>'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mt-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('mt-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-decode]').forEach(decodeNow);
    setStage(stage, true); layout(); kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = allDay(t) ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- letters (hero title, footer name)
  function split(el) {
    var i = 0;
    $$('span[lang]', el).forEach(function (sp) {
      i = 0;
      sp.innerHTML = sp.textContent.trim().split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split($('[data-split]')); split($('[data-fname]'));

  // quotes: a dim copy and a lit copy; the beam uncovers the lit one
  $$('.lit').forEach(function (x) { var t = x.textContent; x.innerHTML = '<span class="lo">' + t + '</span><span class="hi" aria-hidden="true">' + t + '</span>'; });

  // ---------------------------------------------------------------- glyph decode (captions, tags)
  var GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTVXZ0123456789/-+';
  function decode(el, html) {
    var txt = el.dataset[he() ? 'he' : 'en'], f = 0, F = 16;
    if (still()) { html ? el.innerHTML = '<span>' + txt + '</span>' : el.textContent = txt; return; }
    clearInterval(el._t);
    el._t = setInterval(function () {
      f++;
      var out = txt.split('').map(function (c, i) { return c === ' ' || i < (f / F) * txt.length ? c : GL[(Math.random() * GL.length) | 0]; }).join('');
      if (f >= F) { out = txt; clearInterval(el._t); }
      html ? el.innerHTML = '<span>' + out + '</span>' : el.textContent = out;
    }, 40);
  }

  var hero = $('[data-hero]'), hmedia = $('[data-hmedia]'), htint = $('[data-tint]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the page's colour temperature
  var secs = $$('[data-k]'), kShown = 2700, kTarget = 2700, heroK = 2700, heroAuto = !hover, kRaf = 0, kmark = $('[data-kmark]'), kval = $('[data-kval]');
  function applyK(K) {
    var c = k2rgb(K), s = c.join(',');
    root.style.setProperty('--k', 'rgb(' + s + ')');
    root.style.setProperty('--k-soft', 'rgba(' + s + ',.2)');
    if (kmark) kmark.parentNode.style.setProperty('--kp', ((K - 2200) / 5300).toFixed(3));
    kval.textContent = Math.round(K / 100) * 100;
    tint(htint, K);
  }
  function pageK() {
    var mid = innerHeight / 2, k = 2700;
    for (var i = 0; i < secs.length; i++) {
      var r = secs[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) {
        var a = i === 0 ? heroK : +secs[i].dataset.k, nx = secs[i + 1] ? +secs[i + 1].dataset.k : a, p = clamp((mid - r.top) / r.height, 0, 1);
        k = a + (nx - a) * smooth((p - .7) / .3); break;
      }
      if (r.top > mid) { k = +secs[i].dataset.k; break; }
    }
    return k;
  }
  function kLoop(t) {
    kRaf = 0;
    if (heroAuto && !still() && heroVis) heroK = 3600 - 1300 * Math.cos(t / 4200);
    kTarget = pageK();
    kShown += (kTarget - kShown) * (still() ? 1 : .12);
    applyK(kShown);
    if (Math.abs(kTarget - kShown) > 3 || (heroAuto && heroVis && !still())) kRaf = requestAnimationFrame(kLoop);
  }
  function kick() { if (!kRaf) kRaf = requestAnimationFrame(kLoop); }
  var heroVis = true;
  watch(hero, function (v) { heroVis = v; kick(); });
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    heroAuto = false;
    var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    heroK = 2200 + x * 5300;
    hmedia.style.setProperty('--px', ((.5 - x) * 22).toFixed(1) + 'px');
    hmedia.style.setProperty('--py', ((.5 - y) * 14).toFixed(1) + 'px');
    kick();
  });

  // ---------------------------------------------------------------- SIGNATURE: behind the wall
  var wall = $('[data-wall]'), plaster = $('[data-plaster]'), lit = $('[data-lit]'), whs = $$('[data-wh]'), tabs = $$('[data-wgo]'), tags = $$('[data-tag]'), stage = -1;
  function setStage(s, force) {
    if (s === stage && !force) return;
    stage = s; wall.dataset.s = s;
    whs.forEach(function (h, i) { h.classList.toggle('on', i === s); });
    tabs.forEach(function (b, i) { b.setAttribute('aria-selected', i === s ? 'true' : 'false'); });
    tags.forEach(function (t, i) {
      var on = s === 0;
      if (on === t.classList.contains('on') && !force) return;
      t.classList.toggle('on', on); clearTimeout(t._d);
      if (on) t._d = setTimeout(function () { decode(t, true); }, still() ? 0 : 200 + i * 160); else { clearInterval(t._t); t.innerHTML = ''; }
    });
  }
  function goStage(s) {
    s = clamp(s, 0, 2);
    if (still()) { setStage(s); return; }
    var r = wall.getBoundingClientRect(), span = wall.offsetHeight - innerHeight, p = [.12, .48, .92][s];
    scrollTo({ top: scrollY + r.top + span * p, behavior: 'smooth' });
  }
  tabs.forEach(function (b, i) { b.addEventListener('click', function () { goStage(i); }); });
  $('[data-wprev]').addEventListener('click', function () { goStage(stage - 1); });
  $('[data-wnext]').addEventListener('click', function () { goStage(stage + 1); });

  // ---------------------------------------------------------------- STUDIO: the kelvin dial
  var kel = $('[data-kel]'), stint = $('[data-stint]'), sk = $('[data-sk]'), touched = false;
  function studio(K) { sk.textContent = K; tint(stint, K); var c = k2rgb(K).join(','); stint.parentNode.style.boxShadow = '0 50px 120px -50px rgb(' + c + ')'; }
  kel.addEventListener('input', function () { touched = true; studio(+kel.value); });
  studio(+kel.value);
  // once, when it comes into view, the dial sweeps warm → cool → back so the idea is obvious
  watch($('[data-studio]'), function (v) {
    if (!v || touched || still() || kel._swept) return; kel._swept = true;
    var t0 = performance.now();
    (function sw(t) { if (touched) return; var u = clamp((t - t0) / 2600, 0, 1), K = Math.round((3000 + 3800 * Math.sin(u * Math.PI)) / 100) * 100; kel.value = K; studio(K); if (u < 1) requestAnimationFrame(sw); })(t0);
  }, { threshold: .5 });

  // ---------------------------------------------------------------- WORK: beams open each photo, cursor tilts it
  var bms = $$('[data-bm]'), work = $('#work');
  bms.forEach(function (b) {
    var ph = $('.bm-ph', b);
    if (hover) {
      b.addEventListener('pointermove', function (e) { if (still()) return; var r = ph.getBoundingClientRect(); ph.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 8).toFixed(2) + 'deg'); ph.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 6).toFixed(2) + 'deg'); });
      b.addEventListener('pointerleave', function () { ph.style.setProperty('--rx', '0deg'); ph.style.setProperty('--ry', '0deg'); });
    }
  });

  // ---------------------------------------------------------------- SERVICES: living tiles
  var svc = $('[data-svc]'), svcOn = false;
  watch(svc, function (v) { svcOn = v; svc.classList.toggle('on', v); });
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var levers = $$('.t-rail i');
  setInterval(function () { if (!svcOn || still()) return; var l = levers[(Math.random() * levers.length) | 0]; l.classList.add('off'); setTimeout(function () { l.classList.remove('off'); }, 700); }, 1300);
  var ticks = $('[data-ticks]'), NS = 'http://www.w3.org/2000/svg';
  for (var q = 0; q < 12; q++) { var ln = document.createElementNS(NS, 'line'), a = q * Math.PI / 6; ln.setAttribute('x1', 60 + Math.sin(a) * 46); ln.setAttribute('y1', 60 - Math.cos(a) * 46); ln.setAttribute('x2', 60 + Math.sin(a) * (q % 3 ? 49 : 42)); ln.setAttribute('y2', 60 - Math.cos(a) * (q % 3 ? 49 : 42)); ticks.appendChild(ln); }
  var hh = $('[data-hh]'), mm = $('[data-mm]'), ss = $('[data-ss]');
  function clock() { var o = nowParts(), h = (+o.hour) % 12, m = +o.minute, s = +o.second; hh.style.transform = 'rotate(' + (h * 30 + m / 2) + 'deg)'; mm.style.transform = 'rotate(' + (m * 6) + 'deg)'; ss.style.transform = 'rotate(' + (s * 6) + 'deg)'; }
  clock(); setInterval(function () { if (svcOn) clock(); }, 1000);

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- PLAN: the composer
  var rooms = $$('[data-room]'), jobs = $$('[data-job]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), send = $('[data-send]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  rooms.forEach(function (r) { r.addEventListener('click', function () { r.setAttribute('aria-pressed', r.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  jobs.forEach(function (j) { j.addEventListener('click', function () { jobs.forEach(function (x) { x.setAttribute('aria-checked', x === j ? 'true' : 'false'); }); lightStep(1); write(); }); });
  ['pointerenter', 'focus', 'click'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(2); }); });
  function list(items, l) {
    if (items.length < 2) return items.join('');
    return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function compose() {
    var l = he(), job = jobs.filter(function (j) { return j.getAttribute('aria-checked') === 'true'; })[0];
    var where = job.dataset.en === 'the electrical panel' ? [] : rooms.filter(function (r) { return r.getAttribute('aria-pressed') === 'true'; }).map(function (r) { return r.dataset[l ? 'he' : 'en']; });
    return l ? 'שלום מתן, אשמח לעזרה עם ' + job.dataset.he + (where.length ? ' ' + list(where, true) : '') + '.'
             : 'Hi Matan, I’d like help with ' + job.dataset.en + (where.length ? ' in ' + list(where, false) : '') + '.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer curtain
  var foot = $('[data-foot]'), floor = $('.f-floor'), main = $('main');
  function footSize() {
    var fh = foot.offsetHeight, tall = fh > innerHeight * .9;
    foot.classList.toggle('flow', tall);
    document.body.style.paddingBottom = tall ? '' : fh + 'px';
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false, quotes = $$('[data-rq]');
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero dims as you leave it
    var hr = hero.getBoundingClientRect();
    hmedia.style.setProperty('--dim', calm ? '.64' : (.66 - .45 * clamp(-hr.top / hr.height, 0, 1)).toFixed(3));
    // behind the wall
    if (!calm) {
      var p = prog(wall), e1 = smooth((p - .28) / .26), e2 = smooth((p - .63) / .24);
      plaster.style.setProperty('--pl', ((1 - e1) * 112).toFixed(2) + '%');
      lit.style.setProperty('--lr', (e2 * 150).toFixed(2) + '%');
      lit.style.setProperty('--bl', (smooth((p - .56) / .08) * (1 - e2 * .85)).toFixed(3));
      setStage(p < .3 ? 0 : p < .62 ? 1 : 2);
    } else { plaster.style.removeProperty('--pl'); lit.style.removeProperty('--lr'); lit.style.removeProperty('--bl'); }
    // the beams open the photos
    bms.forEach(function (b) {
      var r = b.getBoundingClientRect(), o = calm ? 1 : smooth((vh * .96 - r.top) / (vh * .5)), ph = b.querySelector('.bm-ph');
      ph.style.setProperty('--o', o.toFixed(3)); b.style.setProperty('--o', o.toFixed(3));
      var cap = b.querySelector('[data-decode]');
      if (o > .85 && !cap._done) { cap._done = true; decode(cap); }
    });
    // the wall of photos sinks back as the bento lands over it
    var sr = svc.getBoundingClientRect(), sk = calm ? 0 : clamp((vh - sr.top) / vh, 0, 1);
    work.style.setProperty('--sink', (1 - .05 * sk).toFixed(4)); work.style.setProperty('--sinko', (1 - .45 * sk).toFixed(3));
    // reviews: words fill with light as the beam passes
    quotes.forEach(function (rq) {
      var r = rq.getBoundingClientRect(), f = calm ? 1 : smooth((vh * .92 - r.top) / (vh * .55));
      $$('.lit', rq).forEach(function (x) { x.style.setProperty('--f', (f * 106 - 6).toFixed(1) + '%'); });
      rq.style.setProperty('--b', (.25 + .75 * f).toFixed(3));
    });
    // footer
    var mb = main.getBoundingClientRect().bottom, fp = clamp((vh - mb) / Math.max(1, foot.offsetHeight), 0, 1);
    foot.classList.toggle('in', calm || fp > .3);
    floor.style.setProperty('--rise', (calm ? 0 : (1 - fp) * 120).toFixed(1) + 'px');
    kick();
  }

  function layout() { footSize(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); setStage(0, true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', layout);
})();
