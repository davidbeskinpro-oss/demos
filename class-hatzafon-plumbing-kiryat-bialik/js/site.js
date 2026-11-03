(function () {
  var root = document.documentElement, WA = '972502415568';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'קלאס הצפון · אינסטלציה וחומרי בניין · המסגר 13, קריית ביאליק', en: 'Class HaTzafon · Plumbing & building supplies · 13 HaMasger St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור קלאס הצפון אינסטלציה בע"מ · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Class HaTzafon Plumbing Ltd · This is not the business’s official website' };

  // ---------------------------------------------------------------- opening (motion on, once per visit)
  var seen = null; try { seen = sessionStorage.getItem('kh-open'); } catch (e) {}
  if (!still() && !seen) {
    root.classList.add('opening');
    try { sessionStorage.setItem('kh-open', '1'); } catch (e) {}
    var endOpen = function () { root.classList.remove('opening'); };
    setTimeout(endOpen, 1300);
    addEventListener('pointerdown', endOpen, { once: true });
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'קלאס הצפון', 'Class HaTzafon');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-wa]', 'וואטסאפ לחנות', 'WhatsApp the store');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: המסגר 13, קריית ביאליק' : 'Map: 13 HaMasger St, Kiryat Bialik'; });
    var need = $('[data-need]'); if (need) need.placeholder = need.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('.tag').forEach(function (t) { t.dataset.shown = ''; t.textContent = ''; t.classList.remove('on'); });
    word();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('kh-lang', l); } catch (e) {}
    texts(l); hours(); write(true); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('kh-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-hang]').forEach(function (el) { el.classList.add('in'); });
    $$('.dc').forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.visibility = ''; });
    light.kick(); drum.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [6, 17], 1: [6, 17], 2: [6, 17], 3: [6, 17], 4: [6, 17], 5: [9, 13.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : 'Open 24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  $$('[data-hang]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 140 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-hang]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.setAttribute('aria-label', sp.textContent);
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w" aria-hidden="true">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  requestAnimationFrame(function () { requestAnimationFrame(function () { $('[data-hero]').classList.add('ready'); }); });

  // ---------------------------------------------------------------- hero: the work light, the dust in its beam, labels that type themselves
  var light = (function () {
    var hero = $('[data-hero]'), cv = $('[data-motes]'), c = cv.getContext('2d'), w, h, P = [], raf = 0, vis = true;
    var tx = -1, ty = -1, lx = 0, ly = 0, t0 = performance.now(), lastMove = -1e9;
    var tags = $$('.tag', hero);
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = []; var n = phone() ? 60 : 120;
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, vx: (Math.random() - .5) * .15, vy: -.05 - Math.random() * .2, p: Math.random() * 6.3 });
      if (!lx) { lx = w * .62; ly = h * .38; }
    }
    function typeTag(t) {
      if (t.dataset.shown) return; t.dataset.shown = '1';
      var s = t.dataset[he() ? 'he' : 'en'], k = 0, G = '#%&*+=<>/', id = setInterval(function () {
        k++; t.textContent = s.slice(0, k) + (k < s.length ? G[Math.floor(Math.random() * G.length)] : '');
        if (k >= s.length) clearInterval(id);
      }, 38);
      t.classList.add('on');
    }
    function frame(now) {
      raf = 0; if (!vis || still()) return;
      var t = (now - t0) / 1000;
      // with no hand on it (phones, or a still mouse) the light wanders across the shelves by itself
      if (now - lastMove > 2600 || tx < 0) { tx = w * (.5 + .36 * Math.sin(t * .33)); ty = h * (.36 + .16 * Math.sin(t * .51 + 1)); }
      lx += (tx - lx) * .08; ly += (ty - ly) * .08;
      hero.style.setProperty('--lx', (lx / w * 100).toFixed(2) + '%'); hero.style.setProperty('--ly', (ly / h * 100).toFixed(2) + '%');
      c.clearRect(0, 0, w, h);
      var R = Math.min(w * .42, 380);
      P.forEach(function (p) {
        p.x += p.vx + Math.sin(t + p.p) * .12; p.y += p.vy;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5; if (p.x > w + 5) p.x = -5;
        var d = Math.hypot(p.x - lx, p.y - ly), a = clamp(1 - d / R, 0, 1);
        if (a <= 0) return;
        c.fillStyle = 'rgba(255,228,180,' + (a * .75).toFixed(3) + ')';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      });
      var hr = hero.getBoundingClientRect();
      tags.forEach(function (tg) {
        if (getComputedStyle(tg).display === 'none') return;
        var r = tg.getBoundingClientRect(), x = r.left - hr.left + 10, y = r.top - hr.top + 10;
        if (Math.hypot(x - lx, y - ly) < R * .55) typeTag(tg);
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; lastMove = performance.now(); });
    watch(hero, function (v) { vis = v; kick(); });
    size(); kick();
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- the drum: photos round a pipe, turned by the scroll, a drag and a slow idle
  var drum = (function () {
    var wrap = $('[data-drumwrap]'), el = $('[data-drum]'), cards = $$('.dc', el), N = cards.length, step = 360 / N;
    var rot = 0, vel = 0, drag = false, ly = 0, raf = 0, vis = false, last = 0, scrollRot = 0;
    function R() { var hh = cards[0].offsetHeight || 200; return hh / 2 / Math.tan(Math.PI / N) + 8; }
    function frame(t) {
      raf = 0; if (still()) { el.style.transform = ''; cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; c.style.visibility = ''; }); return; }
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!drag) { vel *= .94; rot += vel * dt / 1000 + dt * .004; }
      var r = R(), a0 = rot + scrollRot;
      el.style.transform = 'translateZ(' + (-r).toFixed(1) + 'px)';
      cards.forEach(function (c, i) {
        var a = ((a0 + i * step) % 360 + 540) % 360 - 180, f = Math.cos(a * Math.PI / 180);
        c.style.transform = 'rotateX(' + (-a).toFixed(2) + 'deg) translateZ(' + r.toFixed(1) + 'px)';
        // only faces that look at the viewer are drawn: past ~70 degrees a face turns away (and would read mirrored), so it is hidden
        var vis2 = f > .34;
        c.style.opacity = vis2 ? (.2 + .8 * (f - .34) / .66).toFixed(3) : 0;
        c.style.visibility = vis2 ? '' : 'hidden';
        c.style.zIndex = Math.round(f * 100) + 100;
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; ly = e.clientY; wrap.classList.add('drag'); wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', function (e) { if (!drag) return; var dy = e.clientY - ly; ly = e.clientY; rot -= dy * .35; vel = -dy * 12; });
    wrap.addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    wrap.addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, scroll: function () { var b = wrap.getBoundingClientRect(); scrollRot = -(b.top / innerHeight) * 140; } };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span></span></span>';
    }).join('');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    if (still()) { roll(o, true); return; }
    roll(o, false);
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- aisles: living tiles, a work light under the hand
  var aisles = $('#aisles');
  watch(aisles, function (v) { aisles.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- faq photo: leans toward the hand and the light follows it; on touch the scroll pans it
  var tilt = $('[data-tilt]');
  tilt.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    tilt.style.setProperty('--rx', ((x - .5) * 8).toFixed(2) + 'deg'); tilt.style.setProperty('--ry', ((.5 - y) * 6).toFixed(2) + 'deg');
    tilt.style.setProperty('--tx', ((.5 - x) * 18).toFixed(1) + 'px'); tilt.style.setProperty('--ty', ((.5 - y) * 18).toFixed(1) + 'px');
    tilt.style.setProperty('--bx', (x * 100).toFixed(1) + '%'); tilt.style.setProperty('--by', (y * 100).toFixed(1) + '%');
  });
  tilt.addEventListener('pointerleave', function () { ['--rx', '--ry', '--tx', '--ty'].forEach(function (k) { tilt.style.setProperty(k, ''); }); });

  // ---------------------------------------------------------------- ask: three questions, the message writes itself
  var form = $('[data-asker]'), msgEl = $('[data-msg]'), send = $('[data-send]'), need = $('[data-need]');
  var WHO = { home: ['בית', 'home'], site: ['אתר בנייה', 'a building site'], plant: ['מפעל', 'a factory'] };
  var touched = { 0: true, 1: true, 2: false };
  function compose() {
    var l = he(), who = (form.querySelector('[name=who]:checked') || {}).value || 'home', sz = (form.querySelector('[name=sz]:checked') || {}).value || '', n = need.value.trim();
    var size = sz === '?' ? (l ? 'לא בטוח, אשלח תמונה' : 'not sure, I’ll send a photo') : sz ? '\u2066' + sz + '\u2069' : '';
    if (l) return 'שלום קלאס הצפון, פונה מהאתר.\nבשביל: ' + WHO[who][0] + '\nמה צריך: ' + (n || '…') + '\nקוטר: ' + (size || '…') + '\nיש לכם במלאי?';
    return 'Hi Class HaTzafon, writing from the website.\nFor: ' + WHO[who][1] + '\nWhat I need: ' + (n || '…') + '\nSize: ' + (size || '…') + '\nDo you have it in stock?';
  }
  var typing = 0, shown = '';
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    clearInterval(typing);
    if (instant || still()) { msgEl.textContent = shown = target; return; }
    var k = 0; while (k < shown.length && k < target.length && shown[k] === target[k]) k++;
    typing = setInterval(function () {
      if (shown.length > k) { shown = shown.slice(0, Math.max(k, shown.length - 3)); }
      else { shown = target.slice(0, shown.length + 2); }
      msgEl.textContent = shown;
      if (shown === target) clearInterval(typing);
    }, 22);
  }
  function steps() {
    $$('.q', form).forEach(function (q) { q.classList.toggle('on', !!touched[q.dataset.step]); });
  }
  var rings = $$('[data-section] .sz');
  function ringsUI() {
    var v = (form.querySelector('[name=sz]:checked') || {}).value, hit = false;
    // the chosen size and every smaller bore inside it light up: a real cross-section, smallest at the centre
    rings.slice().reverse().forEach(function (r) { var me = r.dataset.sz === v; r.classList.toggle('sel', me); r.classList.toggle('lit', !hit && !me && v !== '?' && !!v); if (me) hit = true; });
    if (!hit) rings.forEach(function (r) { r.classList.remove('lit'); });
  }
  rings.forEach(function (r) { r.addEventListener('click', function () { var i = form.querySelector('[name=sz][value="' + r.dataset.sz + '"]'); if (i) { i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); } }); });
  form.addEventListener('change', function () { ringsUI(); write(); steps(); });
  need.addEventListener('input', function () { touched[2] = need.value.trim().length > 0; steps(); write(); });
  ringsUI(); steps();

  // ---------------------------------------------------------------- footer: the name rises letter by letter as the curtain lifts
  function word() {
    $$('[data-word] > span[lang]').forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1; sp.setAttribute('aria-label', sp.textContent);
      var L = sp.textContent.split(''), n = L.length;
      sp.innerHTML = L.map(function (c, i) { return '<span class="lt" aria-hidden="true" style="--j:' + (1 + Math.abs(i - (n - 1) / 2) * .35).toFixed(2) + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
    });
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var nav = $('[data-nav]'), six = $('[data-six]'), sixIn = $('.six-in'), yard = $('[data-yard]'), front = $('[data-front]'), foot = $('[data-foot]'), tee = $('.tee'), queued = false;
  function tick() {
    queued = false;
    var y = scrollY, vh = innerHeight, s = still();
    nav.classList.toggle('pill', y > 40);
    drum.scroll();
    // morning light: dark yard at the top of the section, full daylight by its middle
    var yb = yard.getBoundingClientRect(), day = s ? 1 : smooth((vh - yb.top) / (vh * .9));
    yard.style.setProperty('--day', day.toFixed(3));
    // the yard sinks back a little as the departments land over it
    var ab = aisles.getBoundingClientRect(), k = s ? 0 : smooth((vh - ab.top) / vh);
    sixIn.style.transform = s ? '' : 'scale(' + (1 - k * .05).toFixed(4) + ')'; sixIn.style.opacity = s ? '' : (1 - k * .45).toFixed(3);
    // faq photo with no hand on it: the frame and the light drift with the scroll
    var tb = tilt.getBoundingClientRect(), tp = clamp((vh - tb.top) / (vh + tb.height), 0, 1);
    tilt.style.setProperty('--py', (25 + tp * 40).toFixed(1) + '%');
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches && !s) { tilt.style.setProperty('--bx', (20 + tp * 60).toFixed(1) + '%'); tilt.style.setProperty('--by', (15 + tp * 55).toFixed(1) + '%'); }
    // shop front opens from a small frame to the full width
    var fb = front.getBoundingClientRect(), o = s ? 0 : 1 - smooth((vh - fb.top) / (vh * .75));
    front.style.setProperty('--k', o.toFixed(3));
    // curtain footer
    var docH = document.documentElement.scrollHeight, fh = foot.offsetHeight, f = s ? 1 : smooth((y + vh - (docH - fh)) / fh);
    foot.style.setProperty('--f', f.toFixed(3));
    tee.classList.toggle('hide', y + vh > docH - fh * .6);
  }
  addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', function () { light.size(); tick(); });

  texts(root.lang === 'en' ? 'en' : 'he'); hours(); write(true); tick();
  if (still()) $$('[data-reveal],[data-tile],[data-hang]').forEach(function (el) { el.classList.add('in'); });
})();
