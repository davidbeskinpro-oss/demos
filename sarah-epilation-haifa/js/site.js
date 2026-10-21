(function () {
  var root = document.documentElement, WA = '972583215106';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'שרה · אפילציה ועיצוב גבות · ביל״ו 20, חיפה', en: 'Sarah · Electrolysis & brow design · 20 Bilu St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אפילציה בחיפה שרה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Epilation in Haifa – Sarah · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('.navwa,.d-wa', 'וואטסאפ לשרה', 'WhatsApp Sarah');
    aria('.d-tel', 'להתקשר לשרה, 058-321-5106', 'Call Sarah, 058-321-5106');
    aria('[data-dock]', 'יצירת קשר', 'Contact');
    aria('[data-tabs]', 'טיפולים', 'Treatments');
    aria('[data-dots]', '5 מתוך 5', '5 out of 5');
    $('#dial-t').textContent = l === 'he' ? 'שעות הפתיחה לאורך השבוע' : 'Opening hours across the week';
    $('.mapc iframe').title = l === 'he' ? 'מפה: ביל״ו 20, חיפה' : 'Map: 20 Bilu St, Haifa';
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sa-lang', l); } catch (e) {}
    texts(l); hours(); write(); notch(); layout(); last = -1; frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var anchor = $('#work'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still');
    try { localStorage.setItem('sa-motion', still() ? 'off' : 'on'); } catch (e) {}
    motionUI(); reveals(); layout(); frame();
    // keep the reader where they were
    window.scrollBy(0, anchor.getBoundingClientRect().top - keep);
  }); });

  // ---------------------------------------------------------------- the loupe
  var loupe = $('[data-loupe]'), stage = $('.stage', loupe), disc = $('[data-disc]'), sarah = $('[data-sarah]'),
      reveal = $('[data-reveal]'), brow = $('[data-brow]'), scrim = $('.scrim', reveal), halo = $('[data-halo]'),
      heroCopy = $('[data-hero]'), lensCopy = $('[data-lenscopy]');
  // the glass of the lamp in img/sarah.jpg (1200x1600): centre and radius in image pixels
  var LENS = { x: 682, y: 624, r: 55 }, IMG = { w: 1200, h: 1600 };
  var G = null;
  function layout() {
    var W = stage.clientWidth, H = stage.clientHeight;
    disc.style.transform = 'none';
    var sr = stage.getBoundingClientRect(), dr = disc.getBoundingClientRect();
    var cs = getComputedStyle(sarah), pos = cs.objectPosition.split(' ');
    var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1]) / 100;
    var s = Math.max(dr.width / IMG.w, dr.height / IMG.h);
    var ox = (dr.width - IMG.w * s) * px, oy = (dr.height - IMG.h * s) * py;
    var lx = ox + LENS.x * s, ly = oy + LENS.y * s;             // lens inside the disc
    var Lx = dr.left - sr.left + lx, Ly = dr.top - sr.top + ly;  // lens on the stage
    var far = Math.max(Math.hypot(Lx, Ly), Math.hypot(W - Lx, Ly), Math.hypot(Lx, H - Ly), Math.hypot(W - Lx, H - Ly));
    G = { W: W, H: H, lx: lx, ly: ly, Lx: Lx, Ly: Ly, r0: LENS.r * s, R: far + 4 };
    disc.style.transformOrigin = lx + 'px ' + ly + 'px';
  }
  var last = -1;
  function frame() {
    if (!G) return;
    var p = 0;
    if (!still()) {
      var top = loupe.getBoundingClientRect().top, span = loupe.offsetHeight - stage.offsetHeight;
      p = span > 0 ? clamp(-top / span, 0, 1) : 0;
    }
    if (p === last) return; last = p;
    var e = smooth((p - 0.06) / 0.78);                 // 0 → 1 across the pinned scroll
    var sd = lerp(1, 2.3, e);                          // push into the lens: the photo grows around it
    disc.style.transform = 'scale(' + sd.toFixed(4) + ')';
    var rLens = G.r0 * sd, r = rLens + (G.R - rLens) * Math.pow(e, 1.7);
    reveal.style.clipPath = 'circle(' + r.toFixed(1) + 'px at ' + G.Lx.toFixed(1) + 'px ' + G.Ly.toFixed(1) + 'px)';
    // what the lens shows: the brow, small inside the glass, opening to full size
    // a magnifier: at first the glass shows the hairs close up; as it opens the view pulls back to the whole brow.
    // the picture always covers the whole stage, so no layer can ever show through the circle.
    var k = lerp(G.W < 700 ? 1.6 : 2.2, 1, e);
    var tx = clamp(G.Lx - G.W * 0.5 * k, G.W - G.W * k, 0), ty = clamp(G.Ly - G.H * (G.W < 700 ? 0.2 : 0.3) * k, G.H - G.H * k, 0);
    brow.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + k.toFixed(4) + ')';
    // the lamp's ring of light rides the edge of the circle and fades once it leaves the screen
    var ho = clamp(e / 0.06, 0, 1) * (1 - smooth((e - 0.55) / 0.3));
    halo.style.opacity = still() ? 0 : ho.toFixed(3);
    halo.style.width = halo.style.height = (2 * r).toFixed(1) + 'px';
    halo.style.transform = 'translate(' + (G.Lx - r).toFixed(1) + 'px,' + (G.Ly - r).toFixed(1) + 'px)';
    var hc = 1 - smooth(e / 0.35);
    heroCopy.style.opacity = hc.toFixed(3);
    heroCopy.style.transform = 'translateY(' + (-40 * (1 - hc)).toFixed(1) + 'px)';
    heroCopy.style.visibility = hc < 0.01 ? 'hidden' : '';
    var lc = smooth((e - 0.7) / 0.25);
    lensCopy.style.opacity = lc.toFixed(3);
    lensCopy.style.transform = 'translateY(' + (24 * (1 - lc)).toFixed(1) + 'px)';
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { layout(); last = -1; frame(); });
  if (sarah.complete) { layout(); frame(); } else sarah.addEventListener('load', function () { layout(); last = -1; frame(); });
  layout(); frame();
  window.__loupe = function (p) { var span = loupe.offsetHeight - stage.offsetHeight; scrollTo(0, loupe.offsetTop + span * p); last = -1; frame(); };

  // ---------------------------------------------------------------- entrances
  var io = null;
  function reveals() {
    var els = $$('[data-rv]');
    if (still() || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    if (io) return;
    io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) {
      var sib = el.parentElement ? $$('[data-rv]', el.parentElement).indexOf(el) : 0;
      el.style.setProperty('--d', (Math.max(sib, 0) * 80) + 'ms');
      io.observe(el);
    });
  }

  // ---------------------------------------------------------------- treatments tabs
  var tabs = $$('[data-tab]'), cur = 'epil';
  function pick(id, focus) {
    cur = id;
    tabs.forEach(function (t) { var on = t.dataset.tab === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    $$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== id; });
    $$('[data-tabimg]').forEach(function (i) { i.classList.toggle('on', i.dataset.tabimg === id); });
    $('[data-celltxt-he]').textContent = id === 'epil' ? 'לתאם אפילציה' : 'לתאם עיצוב גבות';
    $('[data-celltxt-en]').textContent = id === 'epil' ? 'Book electrolysis' : 'Book brow design';
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t.dataset.tab); });
    t.addEventListener('keydown', function (ev) {
      var k = ev.key, n = tabs.length, j = -1;
      if (k === 'ArrowRight') j = he() ? i - 1 : i + 1; else if (k === 'ArrowLeft') j = he() ? i + 1 : i - 1;
      if (j < 0 && k !== 'ArrowRight' && k !== 'ArrowLeft') return;
      ev.preventDefault(); pick(tabs[(j + n) % n].dataset.tab, true);
    });
  });
  $('[data-pickfrom-tab]').addEventListener('click', function () {
    var r = $('[name=tr][value=' + cur + ']'); if (r) { r.checked = true; write(); }
  });

  // ---------------------------------------------------------------- WhatsApp composer
  var form = $('[data-composer]');
  var TR = { he: { epil: 'אפילציה', brow: 'עיצוב גבות', both: 'אפילציה ועיצוב גבות' }, en: { epil: 'electrolysis', brow: 'brow design', both: 'electrolysis and brow design' } };
  var WH = { he: { week: 'באחד הימים ראשון עד חמישי, אחר הצהריים או בערב', fri: 'ביום שישי בבוקר', sat: 'במוצאי שבת' }, en: { week: 'on a weekday (Sun–Thu) afternoon or evening', fri: 'on a Friday morning', sat: 'on a Saturday night' } };
  function message() {
    var l = root.lang, tr = form.tr.value, wh = form.wh.value, nm = form.nm.value.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (l === 'he') return 'היי שרה, ' + (nm ? 'כאן ' + nm + '. ' : '') + 'הגעתי מהאתר ואשמח לתאם ' + TR.he[tr] + ', ' + WH.he[wh] + '. מתי יש לך מקום?';
    return 'Hi Sarah, ' + (nm ? 'this is ' + nm + '. ' : '') + 'I found you through your website and would like to book ' + TR.en[tr] + ', ' + WH.en[wh] + '. When do you have a spot?';
  }
  function write() {
    var m = message();
    $('[data-preview]').textContent = m;
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    var hello = he() ? 'היי שרה, הגעתי מהאתר ואשמח לתאם תור.' : 'Hi Sarah, I found you through your website and would like to book a visit.';
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(hello); });
  }
  form.addEventListener('input', write); form.addEventListener('change', write);
  // phone: the coupon's side notches sit exactly on the perforation
  function notch() { var perf = $('.perf', form), h = form.offsetHeight; if (h) form.style.setProperty('--cut', ((perf.offsetTop + perf.offsetHeight / 2) / h * 100).toFixed(2) + '%'); }
  addEventListener('resize', notch); notch(); if (document.fonts) document.fonts.ready.then(function () { notch(); layout(); last = -1; frame(); });

  // ---------------------------------------------------------------- hours: the week as the lamp's ring
  // day 0 = Sunday. each day: list of [open, close] in minutes, or null when closed. [0,1440] = all day.
  var HOURS = [[[840, 1380]], [[840, 1380]], [[840, 1380]], [[840, 1380]], [[840, 1380]], [[480, 720]], [[1260, 1380]]];
  var DAYS = { he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  var SHORT = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] };
  function hm(m) { if (m >= 1440) return '24:00'; var h = Math.floor(m / 60), n = m % 60; return h + ':' + (n < 10 ? '0' : '') + n; }
  function nowIL() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      var g = function (t) { return (f.filter(function (x) { return x.type === t; })[0] || {}).value; };
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), m: (+g('hour')) * 60 + (+g('minute')) };
    } catch (e) { var d = new Date(); return { d: d.getDay(), m: d.getHours() * 60 + d.getMinutes() }; }
  }
  function status(n) {
    var l = root.lang, ivs = HOURS[n.d] || [];
    for (var i = 0; i < ivs.length; i++) if (n.m >= ivs[i][0] && n.m < ivs[i][1]) {
      if (ivs[i][0] === 0 && ivs[i][1] >= 1440) return { open: true, text: l === 'he' ? '<b>פתוח עכשיו</b>, כל היום' : '<b>Open now</b>, all day' };
      return { open: true, text: l === 'he' ? '<b>פתוח עכשיו</b>, עד ' + hm(ivs[i][1]) : '<b>Open now</b>, until ' + hm(ivs[i][1]) };
    }
    for (var k = 0; k < 8; k++) {
      var d = (n.d + k) % 7, list = HOURS[d] || [];
      for (var j = 0; j < list.length; j++) if (k > 0 || list[j][0] > n.m) {
        var when = k === 0 ? (l === 'he' ? 'היום' : 'today') : k === 1 ? (l === 'he' ? 'מחר' : 'tomorrow') : (l === 'he' ? 'ביום ' + DAYS.he[d] : 'on ' + DAYS.en[d]);
        return { open: false, text: l === 'he' ? '<b>סגור עכשיו</b> · נפתח ' + when + ' ב-' + hm(list[j][0]) : '<b>Closed now</b> · opens ' + when + ' at ' + hm(list[j][0]) };
      }
    }
    return { open: false, text: l === 'he' ? 'השעות יעודכנו בקרוב' : 'Hours coming soon' };
  }
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function pt(min, R) { var a = (min / 10080) * 2 * Math.PI - Math.PI / 2; return [Math.cos(a) * R, Math.sin(a) * R]; }
  function arc(a, b, R) { var p = pt(a, R), q = pt(b, R), big = (b - a) / 10080 > 0.5 ? 1 : 0; return 'M' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + 'A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + q[0].toFixed(2) + ' ' + q[1].toFixed(2); }
  var drawn = false;
  function hours() {
    var l = root.lang, n = nowIL(), s = status(n), R = 118;
    $('[data-status]').innerHTML = s.text;
    var c = $('[data-dialc]');
    c.innerHTML = s.open ? (l === 'he' ? '<span><b>דולקת</b>פתוח עכשיו</span>' : '<span><b>Lamp on</b>open now</span>') : (l === 'he' ? '<span><b>כבויה</b>סגור עכשיו</span>' : '<span><b>Lamp off</b>closed now</span>');
    $('[data-dial]').classList.toggle('lit', s.open);
    var g = $('[data-dialg]'); g.innerHTML = '';
    g.appendChild(el('circle', { class: 'track', r: R, cx: 0, cy: 0 }));
    for (var d = 0; d < 7; d++) {
      var t1 = pt(d * 1440, R - 16), t2 = pt(d * 1440, R + 16);
      g.appendChild(el('line', { class: 'tick', x1: t1[0], y1: t1[1], x2: t2[0], y2: t2[1] }));
      var lp = pt(d * 1440 + 720, R + 32), tx = el('text', { class: 'lbl' + (d === n.d ? ' today' : ''), x: lp[0].toFixed(1), y: lp[1].toFixed(1) });
      tx.textContent = SHORT[l][d]; g.appendChild(tx);
      (HOURS[d] || []).forEach(function (iv) {
        var a = d * 1440 + iv[0], b = d * 1440 + Math.min(iv[1], 1440);
        var path = el('path', { class: 'arc' + (d === n.d ? ' today' : ''), d: arc(a, b, R) });
        g.appendChild(path);
        if (!drawn && !still() && path.animate) {
          var len = path.getTotalLength ? path.getTotalLength() : 100;
          path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
        }
      });
    }
    var np = pt(n.d * 1440 + n.m, R);
    g.appendChild(el('circle', { class: 'now', r: 8, cx: np[0].toFixed(1), cy: np[1].toFixed(1) }));
    // the list, today marked
    var dl = $('[data-hours]'); dl.innerHTML = '';
    for (var k = 0; k < 7; k++) {
      var list = HOURS[k], dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = DAYS[l][k];
      dd.textContent = !list || !list.length ? (l === 'he' ? 'סגור' : 'Closed') : list.map(function (iv) { return iv[0] === 0 && iv[1] >= 1440 ? (l === 'he' ? '24 שעות' : '24 hours') : hm(iv[0]) + '–' + hm(iv[1]); }).join(', ');
      if (k === n.d) { dt.className = dd.className = 'today'; }
      dl.appendChild(dt); dl.appendChild(dd);
    }
    if (drawn || still()) $$('.arc', g).forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
  }
  // switch the lamp's ring on when the dial comes into view (once)
  if ('IntersectionObserver' in window) {
    var dio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; dio.disconnect();
      if (drawn) return; drawn = true;
      $$('[data-dial] .arc').forEach(function (p, i) {
        if (still() || !p.animate) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; return; }
        var len = parseFloat(p.style.strokeDasharray) || 0;
        p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 700, delay: 90 * i, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' })
          .onfinish = function () { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; };
      });
      var now = $('[data-dial] .now');
      if (now && now.animate && !still()) now.animate([{ r: 8 }, { r: 13 }, { r: 8 }], { duration: 900, delay: 800, easing: 'ease-out' });
    }, { threshold: 0.4 });
    dio.observe($('[data-dial]'));
  } else drawn = true;
  setInterval(function () { hours(); }, 60000);

  // ---------------------------------------------------------------- start
  texts(root.lang); motionUI(); hours(); write(); reveals();
})();
