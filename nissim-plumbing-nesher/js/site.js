(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var store = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  var TITLE = { he: 'ניסים אינסטלציה · חנות לאינסטלציה, חשמל וצבע · דרך בר יהודה 107, נשר', en: 'Nissim Plumbing · Plumbing, electrical & paint shop · 107 Derech Bar Yehuda, Nesher' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ניסים אינסטלציה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Nissim Plumbing · This is not the business’s official website' };
  var SAMPLE = { he: ['צינור ניקוז למכונת כביסה', 'שכפול שני מפתחות', 'גלון צבע לבן'], en: ['Washing-machine drain hose', 'Two key copies', 'A gallon of white paint'] };
  var COLORS = ['var(--g)', 'var(--b)', 'var(--o)', 'var(--r)', 'var(--m)', 'var(--t)'];

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ניסים אינסטלציה', 'Nissim Plumbing');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לחנות, 04-820-2263', 'Call the shop, 04-820-2263');
    aria('[data-t-sign]', 'השלט: אינסטלציה, כלי עבודה, חשמל, כלים סניטריים, שכפול מפתחות, דודי שמש, אספקה טכנית', 'The sign: plumbing, tools, electrical, sanitary ware, key cutting, solar heaters, technical supply');
    $('[data-t-map]').title = l === 'he' ? 'מפה: דרך בר יהודה 107, נשר' : 'Map: 107 Derech Bar Yehuda, Nesher';
    $('[data-t-itemlabel]').textContent = l === 'he' ? 'פריט לרשימה' : 'Item for the list';
    $('[data-item]').placeholder = l === 'he' ? 'למשל: סיפון לכיור' : 'e.g. a sink trap';
    $$('[data-pn]').forEach(function (p) { $('b', p).textContent = p.dataset[l]; });
    $('[data-platew]').textContent = $('[data-pn]').dataset[l];
    $$('[data-decode]').forEach(function (c) { c.textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    store('ns-lang', l);
    texts(l); hours(); renderList(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    store('ns-motion', on ? 'on' : 'off');
    motionUI();
    $$('[data-reveal],[data-tile],.rv').forEach(function (el) { el.classList.add('in'); });
    $$('.sheet').forEach(function (s) { s.style.transform = ''; s.style.filter = ''; });
    if (still()) { resetStill(); } else { dust.kick(); }
    layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [7.5, 16], 1: [7.5, 16], 2: [7.5, 15], 3: [7.5, 16], 4: [7.5, 16], 5: [8, 13.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
  // the week in order, Sunday first; each day on its own row (Tuesday and Friday differ)
  function hours() {
    var l = he(), names = l ? dayHe : dayEn;
    $('[data-hours]').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var t = H[d], val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + d + '"><td>' + names[d] + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  $$('.rv').forEach(function (t, i) { t.style.setProperty('--d', i * 110 + 'ms'); });
  $$('[data-reveal],[data-tile],.rv').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the headline and the footer name, one span per letter
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.trim().split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln').forEach(function (ln, k) { $$('span[lang]', ln).forEach(function (sp) { split(sp, k * 6); }); });
  $$('[data-wordmark] span[lang]').forEach(function (sp) { split(sp); });

  // ---------------------------------------------------------------- glyph decode: a label settles out of scrambled letters
  var GLYPH = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKMNPRSTUVWXYZ' };
  function decode(el, text, ms) {
    if (still()) { el.textContent = text; return; }
    var set = GLYPH[he() ? 'he' : 'en'], t0 = performance.now(), dur = ms || 700;
    (function step(t) {
      var k = clamp((t - t0) / dur, 0, 1), n = Math.floor(text.length * k), out = text.slice(0, n);
      for (var i = n; i < text.length; i++) out += text[i] === ' ' ? ' ' : set[Math.floor(Math.random() * set.length)];
      el.textContent = out;
      if (k < 1) requestAnimationFrame(step); else el.textContent = text;
    })(t0);
  }
  $$('[data-decode]').forEach(function (c) { watch(c, function (v) { if (v) decode(c, c.dataset[root.lang]); }, { threshold: .9 }); });

  // ---------------------------------------------------------------- opening: the photo surfaces, the sign's panels are dealt on, their words decode
  var hero = $('[data-hero]'), stage = $('[data-hstage]'), nav = $('[data-nav]'), sign = $('[data-sign]'), plate = $('[data-plate]');
  var panels = $$('[data-pn]');
  panels.forEach(function (p, k) { p.style.setProperty('--k', k); });
  function open() {
    hero.classList.add('ready');
    if (!still()) panels.forEach(function (p, k) { setTimeout(function () { decode($('b', p), p.dataset[root.lang], 520); }, 220 + k * 90); });
  }
  requestAnimationFrame(function () { requestAnimationFrame(open); });

  // ---------------------------------------------------------------- dust in the sunlight over the storefront; it parts round the hand
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), w, h, ps = [], raf = 0, vis = true, px = -9999, py = -9999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 110; ps = [];
      for (var i = 0; i < n; i++) ps.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.9, vx: (Math.random() - .5) * .15, vy: -.05 - Math.random() * .22, a: .15 + Math.random() * .5, f: Math.random() * 6.28 });
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      if (still() || !vis) return;
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i], dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { var f = (1 - d2 / 14400) * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx *= .94; p.vy = p.vy * .94 - .012; p.f += .02;
        p.x += p.vx + Math.sin(p.f) * .18; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        var tw = .6 + .4 * Math.sin(p.f * 2);
        c.fillStyle = 'rgba(255,214,160,' + (p.a * tw).toFixed(3) + ')';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    stage.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    stage.addEventListener('pointerleave', function () { px = py = -9999; });
    watch(stage, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the sign leans toward the hand; the storefront drifts the other way
  var aim = { x: 0, y: 0 };
  if (fine) stage.addEventListener('pointermove', function (e) { aim.x = e.clientX / innerWidth - .5; aim.y = e.clientY / innerHeight - .5; });

  // ---------------------------------------------------------------- photos that lean to the hand, with a warm light under it
  $$('[data-tilt]').forEach(function (f) {
    if (!fine) return;
    f.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      f.style.setProperty('--tx', ((.5 - x) * 22).toFixed(1) + 'px'); f.style.setProperty('--ty', ((.5 - y) * 22).toFixed(1) + 'px');
      f.style.setProperty('--lx', (x * 100).toFixed(1) + '%'); f.style.setProperty('--ly', (y * 100).toFixed(1) + '%');
    });
    f.addEventListener('pointerleave', function () { ['--tx', '--ty', '--lx', '--ly'].forEach(function (k) { f.style.removeProperty(k); }); });
  });
  // bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // the living drawing of a department runs only while its sheet is on screen
  $$('[data-sheet]').forEach(function (s) { watch(s, function (v) { s.classList.toggle('on', v); }); });

  // ---------------------------------------------------------------- the list for the shop
  var items = []; try { items = JSON.parse(store('ns-list') || '[]') || []; } catch (e) { items = []; }
  var sample = null; // sample lines shown until the visitor writes their own
  var ul = $('[data-items]'), input = $('[data-item]'), toast = $('[data-toast]'), share = $('[data-share]');
  if (navigator.share) share.hidden = false;
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function shown() {
    if (items.length) return items;
    if (sample) return sample;
    return (still() || typed) ? SAMPLE[root.lang] : [];
  }
  function lines() { return shown(); }
  function renderList() {
    var show = shown();
    ul.innerHTML = show.map(function (t, i) {
      var mine = !!items.length;
      return '<li style="--c:' + COLORS[i % COLORS.length] + '"' + (mine ? '' : ' class="sample"') + '><span>' + esc(t) + '</span>' +
        (mine ? '<button type="button" data-rm="' + i + '" aria-label="' + (he() ? 'הסרה' : 'Remove') + ' ' + esc(t) + '"><svg aria-hidden="true"><use href="#i-x"/></svg></button>' : '') + '</li>';
    }).join('');
    $('[data-empty]').hidden = show.length > 0;
    steps();
  }
  ul.addEventListener('click', function (e) {
    var b = e.target.closest('[data-rm]'); if (!b) return;
    items.splice(+b.dataset.rm, 1); store('ns-list', JSON.stringify(items)); renderList();
  });
  $('[data-addform]').addEventListener('submit', function (e) {
    e.preventDefault(); stopTyping();
    var v = input.value.trim().replace(/\s+/g, ' '); if (!v) { input.focus(); return; }
    items.push(v.slice(0, 60)); input.value = ''; sample = null;
    store('ns-list', JSON.stringify(items)); renderList(); lit = Math.max(lit, 1); steps();
  });
  function text() {
    var head = he() ? 'רשימה לניסים אינסטלציה:' : 'List for Nissim Plumbing:';
    return head + '\n' + lines().map(function (t) { return '- ' + t; }).join('\n');
  }
  function say(m) { toast.textContent = m; clearTimeout(say.t); say.t = setTimeout(function () { toast.textContent = ''; }, 2600); }
  $('[data-copy]').addEventListener('click', function () {
    var t = text(), ok = function () { say(he() ? 'הרשימה הועתקה' : 'List copied'); lit = 2; steps(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fallback); else fallback();
    function fallback() { var a = document.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch (e) {} a.remove(); }
  });
  share.addEventListener('click', function () { navigator.share({ text: text() }).catch(function () {}); });

  // the steps beside the slip light up as the list is written
  var lit = -1;
  function steps() { $$('[data-step]').forEach(function (s) { s.classList.toggle('lit', +s.dataset.step <= lit); }); }

  // sample: the slip writes itself once, letter by letter, while nobody has written on it
  var typed = false, typing = 0;
  function stopTyping() { clearTimeout(typing); typing = 0; $$('.caret').forEach(function (c) { c.classList.remove('caret'); }); }
  function typeSample() {
    if (typed || items.length || still()) return; typed = true;
    var list = SAMPLE[root.lang], li = 0, ci = 0; sample = [];
    (function tick() {
      if (items.length) { stopTyping(); return; }
      if (li >= list.length) { stopTyping(); lit = 1; steps(); return; }
      var w = list[li];
      sample[li] = w.slice(0, ++ci); renderList();
      var last = ul.lastElementChild; if (last) last.querySelector('span').classList.add('caret');
      $$('.slip-items li', ul).forEach(function (l, i) { if (i < li) l.style.animation = 'none'; });
      if (ci >= w.length) { li++; ci = 0; lit = 0; steps(); typing = setTimeout(tick, 420); } else typing = setTimeout(tick, 38 + Math.random() * 40);
    })();
  }
  watch($('[data-slip]'), function (v) { if (v) typeSample(); }, { threshold: .5 });

  // ---------------------------------------------------------------- odometers: figures roll into place like a counter
  $$('[data-odo]').forEach(function (o) {
    var v = o.dataset.odo, cols = [];
    // the digit strips are drawn by CSS (::before), so the text of the page stays the real figure
    o.innerHTML = v.split('').map(function (ch) {
      return /\d/.test(ch) ? '<span class="col" data-to="' + ch + '" aria-hidden="true"></span>' : '<span aria-hidden="true">' + ch + '</span>';
    }).join('') + '<span class="vh">' + v + '</span>';
    var set = function (on) { $$('.col', o).forEach(function (c, i) { c.style.transitionDelay = i * 140 + 'ms'; c.style.transform = 'translateY(' + (on ? -c.dataset.to * 1.2 : 0) + 'em)'; }); };
    if (still() || !io) set(true); else watch(o, function (v2) { if (v2) set(true); }, { threshold: .5 });
    o._set = set;
  });

  // ---------------------------------------------------------------- reviews drift slowly along their row; a hand or a finger takes over
  (function () {
    var run = $('[data-run]'), vis = false, hold = 0, raf = 0, acc = 0;
    function frame() {
      raf = 0; if (!vis || still()) return;
      if (performance.now() > hold) {
        var max = run.scrollWidth - run.clientWidth; if (max <= 0) return;
        acc += .35; var step = Math.floor(acc); acc -= step;
        var rtl = root.dir === 'rtl', cur = Math.abs(run.scrollLeft);
        if (cur >= max - 1) { hold = performance.now() + 2500; run.scrollTo({ left: 0, behavior: 'smooth' }); }
        else if (step) run.scrollLeft += rtl ? -step : step;
      }
      raf = requestAnimationFrame(frame);
    }
    ['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(function (ev) { run.addEventListener(ev, function () { hold = performance.now() + 4000; }, { passive: true }); });
    if (fine) { run.addEventListener('pointerenter', function () { hold = 1e15; }); run.addEventListener('pointerleave', function () { hold = performance.now() + 600; }); }
    watch(run, function (v) { vis = v; if (v && !raf) raf = requestAnimationFrame(frame); });
  })();

  // ---------------------------------------------------------------- footer name fitted to its width
  function fitWordmark() {
    var wm = $('[data-wordmark]'), sp = $('span[lang="' + root.lang + '"]', wm); if (!sp) return;
    wm.style.fontSize = '100px';
    var avail = wm.clientWidth, w = sp.getBoundingClientRect().width || 1;
    wm.style.fontSize = Math.min(100 * avail / w * .98, phone() ? 160 : 420) + 'px';
  }

  // ---------------------------------------------------------------- still mode: every scroll-set style back to its finished state
  function resetStill() {
    [stage, sign, plate, $('[data-hcopy]'), $('[data-hphoto]'), $('[data-cphoto]'), $('[data-ccopy]')].forEach(function (el) { el && el.removeAttribute('style'); });
    $$('.sheet').forEach(function (s) { s.style.transform = ''; s.style.filter = ''; });
    $$('[data-wordmark] .ch').forEach(function (c) { c.style.removeProperty('--y'); c.style.removeProperty('--op'); });
    panels.forEach(function (pn) { pn.style.opacity = ''; });
    $$('[data-odo]').forEach(function (o) { o._set && o._set(true); });
    sample = null; stopTyping(); renderList();
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var callbar = $('[data-callbar]'), close = $('[data-close]'), cphoto = $('[data-cphoto]'), ccopy = $('[data-ccopy]'), hcopy = $('[data-hcopy]'), hphoto = $('[data-hphoto]');
  var sheets = $$('[data-sheet]'), foot = $('[data-foot]'), sx = 0, sy = 0, ticking = false;
  function loop() {
    ticking = false;
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('float', y > 40);
    callbar.classList.toggle('show', y > vh * .5 && foot.getBoundingClientRect().top > vh - 40);
    if (still()) return;

    // hero: copy leaves, the storefront dims, then the green panel opens out to the whole screen
    var hr = hero.getBoundingClientRect(), span = Math.max(1, hero.offsetHeight - vh), p = clamp(-hr.top / span, 0, 1);
    sx = lerp(sx, aim.x, .08); sy = lerp(sy, aim.y, .08);
    var e = smooth((p - .2) / .62), lean = 1 - smooth(p / .2);
    hphoto.style.transform = 'translate3d(' + (-sx * 18).toFixed(1) + 'px,' + (-sy * 12 + p * 40).toFixed(1) + 'px,0) scale(' + (1 + p * .08).toFixed(3) + ')';
    hcopy.style.opacity = (1 - smooth(p / .22)).toFixed(3);
    hcopy.style.transform = 'translateY(' + (-p * 120).toFixed(1) + 'px)';
    var drift = phone() ? Math.sin(performance.now() / 2600) * 3 : 0;
    sign.style.setProperty('--ry', ((fine ? sx * 14 : drift) * lean).toFixed(2) + 'deg');
    sign.style.setProperty('--rx', ((fine ? -sy * 10 : 0) * lean).toFixed(2) + 'deg');
    panels.forEach(function (pn, k) { if (k) pn.style.opacity = p > .2 ? (1 - smooth((p - .2) / .25)).toFixed(3) : ''; });
    if (p > .2) {
      var g = panels[0].getBoundingClientRect(), s = stage.getBoundingClientRect();
      var t = lerp(g.top - s.top, 0, e), l = lerp(g.left - s.left, 0, e), rr = lerp(s.right - g.right, 0, e), b = lerp(s.bottom - g.bottom, 0, e), rad = lerp(10, 0, e);
      plate.style.visibility = 'visible';
      plate.style.clipPath = 'inset(' + t.toFixed(1) + 'px ' + rr.toFixed(1) + 'px ' + b.toFixed(1) + 'px ' + l.toFixed(1) + 'px round ' + rad.toFixed(1) + 'px)';
      // bright panel green deepens into the ground of the next section as it opens
      // the word grows with the panel, centred in it, as if the camera walks up to the sign
      var pw = panels[0].querySelector('b'), base = parseFloat(getComputedStyle(pw).fontSize) || 27;
      var cw = s.width - l - rr, k = cw / Math.max(1, g.width);
      plate.style.setProperty('--pf', Math.min(base * k, s.width / 6.2).toFixed(1) + 'px');
      plate.style.setProperty('--px', ((l + (s.width - rr)) / 2 - s.width / 2).toFixed(1) + 'px');
      plate.style.setProperty('--py', ((t + (s.height - b)) / 2 - s.height / 2).toFixed(1) + 'px');
      plate.style.setProperty('--po', lerp(1, .16, smooth((e - .5) / .5)).toFixed(3));
      plate.style.backgroundColor = 'rgb(' + Math.round(lerp(47, 23, e)) + ',' + Math.round(lerp(154, 62, e)) + ',' + Math.round(lerp(104, 47, e)) + ')';
    } else { plate.style.visibility = 'hidden'; }

    // sheets: the one being covered sinks back and dims as the next lands on it
    for (var i = 0; i < sheets.length - 1; i++) {
      var cur = sheets[i], nx = sheets[i + 1], ct = cur.getBoundingClientRect().top, nt = nx.getBoundingClientRect().top;
      var cover = clamp((cur.offsetHeight - (nt - ct)) / cur.offsetHeight, 0, 1);
      cur.style.transform = cover > 0 ? 'scale(' + (1 - cover * .05).toFixed(4) + ')' : '';
      cur.style.filter = cover > 0 ? 'brightness(' + (1 - cover * .35).toFixed(3) + ')' : '';
    }
    // phones: no hand, so the scroll pans the photos instead
    if (!fine) $$('[data-tilt]').forEach(function (f) { var r = f.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; var k = (r.top + r.height / 2 - vh / 2) / vh; f.style.setProperty('--ty', (k * 30).toFixed(1) + 'px'); f.style.setProperty('--ly', (50 - k * 60).toFixed(1) + '%'); });

    // closing: the storefront, full screen, shrinks into its frame and the words land beside it
    var cr = close.getBoundingClientRect(), cspan = Math.max(1, close.offsetHeight - vh), q = smooth(clamp(-cr.top / cspan, 0, 1) / .8);
    var ph = phone();
    var to = ph ? { t: 8, s: 5, b: 44, e: 5 } : { t: 14, s: 46, b: 14, e: 6 };
    cphoto.style.setProperty('--ct', lerp(0, to.t, q).toFixed(2) + '%');
    cphoto.style.setProperty('--cb', lerp(0, to.b, q).toFixed(2) + '%');
    cphoto.style.setProperty('--cl', lerp(0, to.s, q).toFixed(2) + '%');
    cphoto.style.setProperty('--cr', lerp(0, to.e, q).toFixed(2) + '%');
    cphoto.style.setProperty('--cR', lerp(0, 22, q).toFixed(1) + 'px');
    cphoto.style.setProperty('--cs', lerp(1.12, 1, q).toFixed(3));
    var co = smooth((q - .55) / .45); ccopy.style.setProperty('--co', co.toFixed(3)); ccopy.style.visibility = co < .02 ? 'hidden' : '';

    // footer: the name rises letter by letter as the footer comes up
    var fr = foot.getBoundingClientRect(), fp = clamp((vh - fr.top) / (vh * .6), 0, 1);
    $$('[data-wordmark] span[lang="' + root.lang + '"] .ch').forEach(function (c, k, all) {
      var a = smooth(fp * 1.6 - k / all.length * .6);
      c.style.setProperty('--y', ((1 - a) * 60).toFixed(1) + '%'); c.style.setProperty('--op', a.toFixed(3));
    });
    if (fine && Math.abs(sx - aim.x) + Math.abs(sy - aim.y) > .002) request();
    if (phone() && p < .2) request();
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(loop); } }
  addEventListener('scroll', request, { passive: true });
  if (fine) stage.addEventListener('pointermove', request);

  function layout() { dust.size(); fitWordmark(); request(); }
  addEventListener('resize', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);

  texts(root.lang); hours(); renderList(); layout();
  if (still()) resetStill();
})();
