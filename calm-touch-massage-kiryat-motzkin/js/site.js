(function () {
  var root = document.documentElement, WA = '972546455228';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 900; };
  var TITLE = { he: 'עיסוי במגע רגוע · אייל · קרן קימת לישראל 5, קרית מוצקין', en: 'Calm Touch Massage · Eyal · 5 Keren Kayemet LeIsrael St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עיסוי במגע רגוע · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Calm Touch Massage (עיסוי במגע רגוע) · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עיסוי במגע רגוע', 'Calm Touch Massage');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-lamps]', 'תמונות החדר', 'Photos of the room');
    aria('[data-t-pick]', 'טיפול', 'Treatment');
    aria('[data-t-dim]', 'שעה ביום', 'Time of day');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לאייל, 054-645-5228', 'Call Eyal, 054-645-5228');
    aria('[data-t-wa]', 'וואטסאפ לאייל', 'WhatsApp Eyal');
    $('[data-t-map]').title = l === 'he' ? 'מפה: קרן קימת לישראל 5, קרית מוצקין' : 'Map: 5 Keren Kayemet LeIsrael St, Kiryat Motzkin';
    $$('.spot').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); if ($('.tag', s).textContent) $('.tag', s).textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mr-lang', l); } catch (e) {}
    texts(l); hours(); dimUI(); write(true); fill(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('mr-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.rv,[data-fname]').forEach(function (el) { el.classList.add('in'); });
    $('.h-frame').classList.add('lit');
    layout(); motes.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [7, 21], 1: [7, 21], 2: [7, 21], 3: [7, 21], 4: [7, 21], 5: [7, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    $('[data-saltlamp]').classList.toggle('lit', open);
    $('[data-today]').textContent = t ? (l ? 'היום ' + hhmm(t[0]) + '–' + hhmm(t[1]) + ' · המנורה דולקת כשפתוח' : 'Today ' + hhmm(t[0]) + '–' + hhmm(t[1]) + ' · the lamp is lit while open')
                                      : (l ? 'היום סגור · המנורה דולקת כשפתוח' : 'Closed today · the lamp is lit while open');
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],.rv,[data-fname]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  var craft = $('#craft'); watch(craft, function (v) { craft.classList.toggle('on', v); });

  // ---------------------------------------------------------------- letters: hero headline and footer name
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 5 : 0); });
  $$('[data-fname] > span').forEach(function (sp) { split(sp); });

  // the lamps come on once the photo has warmed up
  var frame = $('.h-frame');
  setTimeout(function () { frame.classList.add('lit'); }, still() ? 0 : 900);

  // ---------------------------------------------------------------- dust floating in the lamp light; it parts around the hand
  var hero = $('[data-hero]');
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 60 : 130; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 2.2, vx: (Math.random() - .5) * .15, vy: -.08 - Math.random() * .25, ph: Math.random() * 6.3, a: .25 + Math.random() * .6 });
    }
    function draw(T, calm) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (!calm) {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var f = (14000 - d2) / 14000 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f * .2; p.vy += dy / d * f * .2; }
          p.vx *= .97; p.vy = p.vy * .97 + (-.12) * .03;
          p.x += p.vx + Math.sin(T * .6 + p.ph) * .15; p.y += p.vy;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        }
        var tw = .6 + .4 * Math.sin(T * 1.4 + p.ph);
        c.globalAlpha = p.a * tw; c.fillStyle = i % 4 ? '#ffd49a' : '#ffb27a';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    function f(t) { raf = 0; var calm = still(); draw(t / 1000, calm); if (!calm && vis) raf = requestAnimationFrame(f); }
    function kick() { if (!raf) raf = requestAnimationFrame(f); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the photo card leans toward the hand; its lamps brighten toward it
  var tw = $('[data-tiltwrap]'), glows = $$('.glow', frame);
  tw.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = tw.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    frame.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
    glows.forEach(function (g) { var gx = parseFloat(g.style.getPropertyValue('--x')) / 100 - .5, gy = parseFloat(g.style.getPropertyValue('--y')) / 100 - .5, d = Math.hypot(gx - x, gy - y); g.style.setProperty('--gs', (1 + Math.max(0, .5 - d) * 1.2).toFixed(3)); });
  });
  tw.addEventListener('pointerleave', function () { frame.style.transform = ''; glows.forEach(function (g) { g.style.setProperty('--gs', 1); }); });
  frame.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';

  // ---------------------------------------------------------------- statement: letters fill as you read
  var stm = $('[data-fill]'), stc = [];
  function fill() {
    var sp = $('span[lang="' + root.lang + '"]', stm);
    if (!sp.dataset.done) { sp.innerHTML = sp.textContent.split('').map(function (c) { return '<span class="c">' + c + '</span>'; }).join(''); sp.dataset.done = 1; }
    stc = $$('.c', sp);
  }
  fill();

  // ---------------------------------------------------------------- the room: lamp to lamp
  var scene = $('[data-scene]'), stage = $('[data-stage]'), shots = $$('[data-shot]', scene), caps = $$('[data-cap]', scene), bloom = $('[data-bloom]'), lps = $$('.lp', scene);
  var N = shots.length, cur = -1, stillIdx = 0, geo = [];
  function cover(img) {   // where the lamp sits on screen for an object-fit:cover photo
    var W = stage.clientWidth, Hh = stage.clientHeight, iw = +img.getAttribute('width'), ih = +img.getAttribute('height'), s = Math.max(W / iw, Hh / ih);
    return { W: W, H: Hh, s: s, ox: (W - iw * s) / 2, oy: (Hh - ih * s) / 2, iw: iw, ih: ih };
  }
  function sceneLayout() {
    geo = shots.map(function (sh) {
      var img = $('img', sh), g = cover(img), lx = g.ox + g.iw * g.s * +sh.dataset.lx, ly = g.oy + g.ih * g.s * +sh.dataset.ly;
      img.style.setProperty('--ox', lx + 'px'); img.style.setProperty('--oy', ly + 'px');
      $$('.spot', sh).forEach(function (sp) {
        var x = g.ox + g.iw * g.s * parseFloat(sp.style.getPropertyValue('--x')), y = g.oy + g.ih * g.s * parseFloat(sp.style.getPropertyValue('--y'));
        sp._bx = x; sp._by = y; sp._lx = lx; sp._ly = ly; sp._W = g.W; sp._H = g.H;
        place(sp, 1);
      });
      return { lx: lx, ly: ly, R: Math.hypot(Math.max(lx, g.W - lx), Math.max(ly, g.H - ly)) };
    });
  }
  function place(sp, sc) {   // labels ride the camera move: they scale away from the lamp with the photo
    var x = sp._lx + (sp._bx - sp._lx) * sc, y = sp._ly + (sp._by - sp._ly) * sc;
    sp.style.setProperty('--px', x.toFixed(0)); sp.style.setProperty('--py', y.toFixed(0));
    sp.classList.toggle('flip', root.dir === 'rtl' ? x > sp._W * .35 : x > sp._W * .6);
    sp.hidden = x < 12 || x > sp._W - 12 || y < 70 || y > sp._H * .55;
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[root.lang];
    if (on === sp.classList.contains('show')) return;
    sp.classList.toggle('show', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    // glyph decode: scrambled letters settle into the word
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', k = 0;
    sp._t = setInterval(function () {
      k++; tag.textContent = txt.split('').map(function (ch, i) { return i < k / 2 || ch === ' ' ? ch : pool[Math.floor(Math.random() * pool.length)]; }).join('');
      if (k / 2 >= txt.length) { clearInterval(sp._t); tag.textContent = txt; }
    }, 30);
  }
  function show(i, tLocal) {
    if (i !== cur) {
      shots.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      caps.forEach(function (c, k) { c.classList.toggle('on', k === i); });
      lps.forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      cur = i;
    }
    $$('.spot', shots[i]).forEach(function (sp, k) { typeTag(sp, tLocal > .28 + k * .1 && tLocal < .8); });
  }
  function sceneUpdate() {
    if (still()) {
      shots.forEach(function (s) { $('img', s).style.setProperty('--s', 1); $$('.spot', s).forEach(function (sp) { place(sp, 1); }); });
      show(stillIdx, .5); $$('.spot', shots[stillIdx]).forEach(function (sp) { typeTag(sp, true); }); return;
    }
    var r = scene.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, .9999), f = p * N, i = Math.floor(f), t = f - i, g = geo[i];
    if (!g) return;
    // each photo opens pulled into its lamp, settles, then the camera pushes back in toward the lamp
    var s = t < .3 ? (i === 0 ? 1 : lerp(1.45, 1, smooth(t / .3))) : lerp(1, 1.5, smooth((t - .45) / .55));
    $('img', shots[i]).style.setProperty('--s', s.toFixed(4));
    $$('.spot', shots[i]).forEach(function (sp) { place(sp, s); });
    show(i, t);
    // the lamp's light: it grows out of this photo's lamp to fill the screen, and the next photo opens from its own lamp
    var out = i < N - 1 ? smooth((t - .74) / .26) : 0, inn = i > 0 ? 1 - smooth(t / .24) : 0, k = Math.max(out, inn);
    bloom.style.opacity = k > 0 ? Math.min(1, k * 1.6).toFixed(3) : '0';
    if (k > 0) { bloom.style.setProperty('--bx', g.lx + 'px'); bloom.style.setProperty('--by', g.ly + 'px'); bloom.style.setProperty('--br', (k * g.R * 1.05).toFixed(0) + 'px'); }
  }
  lps.forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.go); }); });
  $$('[data-step]', scene).forEach(function (b) { b.addEventListener('click', function () { go((stillIdx + +b.dataset.step + N) % N); }); });
  function go(i) {
    if (still()) { stillIdx = i; $$('.spot', shots[cur]).forEach(function (sp) { typeTag(sp, false); }); sceneUpdate(); return; }
    var top = scene.getBoundingClientRect().top + scrollY, len = scene.offsetHeight - innerHeight;
    scrollTo({ top: top + len * (i + .5) / N, behavior: 'smooth' });
  }

  // ---------------------------------------------------------------- the write-up to Eyal
  var picks = $$('[data-pick]'), dim = $('[data-dim]'), dval = $('[data-dval]'), dlamp = $('[data-dlamp]'), msgEl = $('[data-msg]'), wsteps = $$('[data-wstep]');
  var TIMES = { he: ['בבוקר', 'בצהריים', 'בערב'], en: ['in the morning', 'around noon', 'in the evening'] }, TLAB = { he: ['בוקר', 'צהריים', 'ערב'], en: ['Morning', 'Noon', 'Evening'] };
  function light(n) { wsteps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function dimUI() { var v = +dim.value; dval.textContent = TLAB[root.lang][v]; dlamp.style.setProperty('--g', [.35, .65, 1][v]); dim.setAttribute('aria-valuetext', TLAB[root.lang][v]); }
  picks.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); light(1); write(); }); });
  dim.addEventListener('input', function () { dimUI(); light(2); write(); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), got = picks.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; }), when = TIMES[root.lang][+dim.value];
    return l ? 'שלום אייל, אשמח לקבוע תור ל' + (got.length ? list(got, true) : 'עיסוי') + '. נוח לי ' + when + '. מתי יש לך מקום?'
             : 'Hi Eyal, I’d like to book ' + (got.length ? list(got, false) : 'a massage') + '. ' + when.charAt(0).toUpperCase() + when.slice(1) + ' suits me best. When do you have a spot?';
  }
  var shown = '', typing = 0, chatSeen = false;
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; light(0); shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
    var roll = function (go) { $$('.d[data-to]', o).forEach(function (d, i) { var to = go ? +d.dataset.to : 0; d.firstChild.style.transitionDelay = go ? i * 160 + 'ms' : '0ms'; d.firstChild.style.transform = 'translateY(' + (-to * 10) + '%)'; }); };
    roll(still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(true);
  });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var nav = $('[data-nav]'), seam = $('[data-tapeseam]'), tapes = $$('[data-tape]'), roll = $('[data-roll]'), visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vgrid = $('[data-vgrid]'), fh = $('.f-horizon i');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) motes.kick();
    // the tape: pulled off the roll as the seam crosses the screen
    var sr = seam.getBoundingClientRect(), sp = calm ? 1 : clamp((vh - sr.top) / (vh * .75), 0, 1);
    tapes[0].style.setProperty('--p', smooth(sp / .7).toFixed(4));
    tapes[1].style.setProperty('--p2', smooth((sp - .35) / .65).toFixed(4));
    roll.style.setProperty('--rot', (calm ? 0 : sp * 540 * (root.dir === 'rtl' ? -1 : 1)).toFixed(1) + 'deg');
    // the statement fills letter by letter
    var fr = stm.getBoundingClientRect(), fp = calm ? 1 : clamp((vh * .85 - fr.top) / (vh * .55), 0, 1), lit = Math.round(fp * stc.length);
    stc.forEach(function (c, i) { c.classList.toggle('on', i < lit); });
    sceneUpdate();
    // the closing photo fills the screen, then shrinks into its frame
    if (!calm && !phone()) {
      var vr = visit.getBoundingClientRect(), vp = clamp(-vr.top / Math.max(1, vr.height - vh), 0, 1), e = smooth(vp / .55);
      var fw = vphoto.offsetWidth, fhh = vphoto.offsetHeight, cx = vphoto.offsetLeft + fw / 2, cy = vphoto.offsetTop + fhh / 2, W = vphoto.offsetParent.clientWidth;
      vphoto.style.transform = 'translate(' + lerp(W / 2 - cx, 0, e).toFixed(1) + 'px,' + lerp(vh / 2 - cy, 0, e).toFixed(1) + 'px) scale(' + lerp(Math.max(W / fw, vh / fhh) * 1.01, 1, e).toFixed(4) + ')';
      vphoto.style.borderRadius = lerp(0, 24, e).toFixed(1) + 'px';
      vgrid.style.setProperty('--vg', smooth((vp - .4) / .35).toFixed(3));
    } else { vphoto.style.transform = ''; vphoto.style.borderRadius = ''; vgrid.style.removeProperty('--vg'); }
    // footer horizon rises as the curtain lifts
    if (fh) { var fb = fh.parentNode.getBoundingClientRect(); fh.style.setProperty('--rise', (calm ? 0 : clamp((fb.top - vh * .55) * .25, 0, 80)).toFixed(1) + 'px'); }
  }
  function layout() { motes.size(); sceneLayout(); cur = -1; vphoto.style.transform = ''; tick(); }
  addEventListener('scroll', tick, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  texts(root.lang); hours(); dimUI(); write(true);
  if (document.readyState === 'complete') layout(); else addEventListener('load', layout);
  layout();
})();
