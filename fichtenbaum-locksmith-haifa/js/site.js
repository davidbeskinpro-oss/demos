(function () {
  var root = document.documentElement, WA = '972522660148';
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var TITLE = { he: 'א. פיכטנבאום · מנעולן ושכפול מפתחות · עין דור 13, חיפה', en: 'A. Fichtenbaum · Locksmith & key cutting · 13 Ein Dor St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור א. פיכטנבאום · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for A. Fichtenbaum · This is not the business’s official website' };
  var ARIA = {
    he: { plate: 'יצירת קשר מהירה', cuts: 'שלבי הסיפור בתוך המנעול', tabs: 'מפתחות לרכב', links: 'בדף', star: '5 כוכבים', clip: 'מפתח מועתק במכונת שכפול', play: 'הפעלת הווידאו', pause: 'עצירת הווידאו' },
    en: { plate: 'Quick contact', cuts: 'Stages of the story inside the lock', tabs: 'Car keys', links: 'On this page', star: '5 stars', clip: 'A key copied on a key-cutting machine', play: 'Play the video', pause: 'Pause the video' }
  };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('lang', l); } catch (e) {}
    var a = ARIA[l];
    var w = $('[name=where]'); if (w) w.placeholder = w.dataset['ph' + (l === 'he' ? 'He' : 'En')];
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $('[data-plate]').setAttribute('aria-label', a.plate);
    $('.kb-cuts').setAttribute('aria-label', a.cuts);
    $('[data-tabs]').setAttribute('aria-label', a.tabs);
    $('.hero-links').setAttribute('aria-label', a.links);
    $$('.stars').forEach(function (s) { s.setAttribute('aria-label', a.star); });
    $('[data-clip]').setAttribute('aria-label', a.clip);
    clipUI(); write(); status(); hours(); fitAll(); selectTab(tabI); layoutTrack();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // animations switch, remembered for next time
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), keep = storyBefore();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write(); band(); clipAuto();
    layoutTrack(); storyAfter(keep);
    if (window.__motion3d) window.__motion3d(on);
    render();
  }); });
  motionUI();

  // the wordmark fills the card's width, whatever the language or font; a very long name wraps to two lines instead of shrinking away
  function fitAll() { $$('[data-fit]').forEach(fitWordmark); }
  function fitWordmark(el) {
    var h1 = el.parentNode, phone = innerWidth < 760, min = phone ? 40 : 64;
    h1.classList.remove('wrap'); h1.style.fontSize = '100px';
    var w = el.getBoundingClientRect().width, avail = h1.clientWidth; if (!w || !avail) return;
    var size = Math.min(phone ? 132 : 200, Math.floor(100 * avail / w * 0.98));
    if (size >= min) { h1.style.fontSize = size + 'px'; return; }
    h1.classList.add('wrap'); h1.style.fontSize = min + 'px';
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitAll(); layoutTrack(); });

  // live opening status in Haifa time. null = closed that day
  var H = { 0: [8, 16], 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'החנות פתוחה עכשיו · עד ' + hhmm(t[1]) : 'The shop is open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'החנות סגורה עכשיו · נפתחת היום ב-' + hhmm(t[0]) : 'The shop is closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var full = H[nd] && H[nd][0] === 0 && H[nd][1] === 24;
      txt = !H[nd] ? (l ? 'החנות סגורה עכשיו' : 'The shop is closed now') : full ? (l ? 'סגור עכשיו · ביום ' + dayHe[nd] + ' פתוח 24 שעות' : 'Closed now · open 24 hours on ' + dayEn[nd])
        : (l ? 'החנות סגורה עכשיו · נפתחת ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'The shop is closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot" aria-hidden="true"></span><span>' + txt + '</span>'; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // the hours table: consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : (l ? ' עד ' : ' to ')) + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;

  // ---------------------------------------------------------------- the envelope writes the WhatsApp message
  var T = {
    he: { n: { copy: 'שכפול מפתח', car: 'מפתח או שלט לרכב', cyl: 'צילינדר או מנגנון לדלת', out: 'דלת שלא נפתחת', safe: 'כספת' },
          hi: 'שלום פיכטנבאום, הגעתי דרך האתר. ', need: 'צריך: ', none: 'יש לי שאלה. ', one: ' (עותק אחד)', many: function (n) { return ' (' + n + ' עותקים)'; },
          and: ' ו', at: '. באזור ', end: '. מתי אפשר?' },
    en: { n: { copy: 'a key copied', car: 'a car key or remote', cyl: 'a cylinder or door mechanism', out: 'a door that won’t open', safe: 'a safe' },
          hi: 'Hello Fichtenbaum, I found you through your website. ', need: 'I need ', none: 'I have a question. ', one: ' (one copy)', many: function (n) { return ' (' + n + ' copies)'; },
          and: ' and ', at: '. I’m in ', end: '. When would suit you?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), copies = $('[data-copies]'), nOut = $('[data-n-out]'), N = 2;
  function list(items, t) { if (items.length < 2) return items.join(''); return items.slice(0, -1).join(', ') + t.and + items[items.length - 1]; }
  function write() {
    var t = T[root.lang] || T.he, f = new FormData(form), needs = f.getAll('need'), where = (f.get('where') || '').trim().slice(0, 60);
    copies.hidden = needs.indexOf('copy') < 0;
    var items = needs.map(function (k) { return t.n[k] + (k === 'copy' ? (N === 1 ? t.one : t.many(N)) : ''); });
    var m = t.hi + (items.length ? t.need + list(items, t) : t.none.trim()) + (where ? t.at + where : '') + (items.length ? t.end : '');
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m);
  }
  var typeT = 0;
  function type(m) {
    clearInterval(typeT);
    if (still()) { preview.textContent = m; return; }
    var i = Math.max(0, Math.min(preview.textContent.length, commonPrefix(preview.textContent, m)));
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); else clearInterval(typeT);
    }, 16);
  }
  function commonPrefix(a, b) { var i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; }
  form.addEventListener('change', write);
  form.addEventListener('input', function (e) { if (e.target.name === 'where') write(); });
  $$('[data-n]').forEach(function (b) { b.addEventListener('click', function () {
    N = Math.max(1, Math.min(20, N + +b.dataset.n)); nOut.textContent = N;
    $$('[data-n]').forEach(function (x) { x.disabled = (+x.dataset.n < 0 && N === 1) || (+x.dataset.n > 0 && N === 20); });
    write();
  }); });
  // the flap folds down as the message goes out
  send.addEventListener('click', function () { if (still()) return; form.classList.add('sending'); setTimeout(function () { form.classList.remove('sending'); }, 900); });

  // ---------------------------------------------------------------- car tabs
  var tabs = $$('[data-tabs] [role="tab"]'), carWa = $('[data-wa-car]');
  var CARMSG = {
    he: ['שלום פיכטנבאום, הגעתי דרך האתר. אשמח לשכפל מפתח לרכב. מתי אפשר?', 'שלום פיכטנבאום, הגעתי דרך האתר. אשמח לשכפל שלט. מתי אפשר?', 'שלום פיכטנבאום, הגעתי דרך האתר. המפתח של הרכב הפסיק לעבוד, אפשר לבדוק אותו?'],
    en: ['Hello Fichtenbaum, I found you through your website. I would like a car key copied. When would suit you?', 'Hello Fichtenbaum, I found you through your website. I would like a remote copied. When would suit you?', 'Hello Fichtenbaum, I found you through your website. My car key stopped working, could you check it?']
  };
  var tabI = 0;
  function selectTab(i, focus) {
    tabI = i;
    tabs.forEach(function (t, k) { var on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; $('#' + t.getAttribute('aria-controls')).hidden = !on; });
    if (focus) tabs[i].focus();
    carWa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent((CARMSG[root.lang] || CARMSG.he)[i]);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(i); });
    t.addEventListener('keydown', function (e) {
      var fwd = rtl() ? 'ArrowLeft' : 'ArrowRight', back = rtl() ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd) { e.preventDefault(); selectTab((i + 1) % tabs.length, true); }
      if (e.key === back) { e.preventDefault(); selectTab((i + tabs.length - 1) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(0, true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs.length - 1, true); }
    });
  });

  // ---------------------------------------------------------------- the cutting video: plays in view with animations on, poster with them off
  var clip = $('[data-clip]'), clipBtn = $('[data-clip-btn]'), clipSeen = false, userPaused = false;
  function clipUI() {
    var playing = !clip.paused, a = ARIA[root.lang] || ARIA.he;
    clipBtn.setAttribute('aria-pressed', playing); $('[data-clip-label]').textContent = playing ? a.pause : a.play;
  }
  function clipAuto() {
    if (still()) { if (!clip.paused) clip.pause(); return clipUI(); }
    if (clipSeen && !userPaused) { var pr = clip.play(); if (pr && pr.catch) pr.catch(function () {}); } else if (!clipSeen && !clip.paused) clip.pause();
  }
  clip.addEventListener('play', clipUI); clip.addEventListener('pause', clipUI);
  clipBtn.addEventListener('click', function () {
    if (clip.paused) { userPaused = false; var pr = clip.play(); if (pr && pr.catch) pr.catch(function () {}); } else { userPaused = true; clip.pause(); }
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { clipSeen = es[0].isIntersecting; clipAuto(); }, { threshold: 0.35 }).observe(clip);

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- sticky plate: shows once the hero's buttons are gone, steps aside where the page has its own
  var plate = $('[data-plate]'), away = new Set();
  function plateUI() { plate.classList.toggle('away', away.size > 0); }
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); plateUI(); }, { threshold: 0 });
    ['.hero', '[data-track]', '.visit-act', '.btn-send', '.foot-plate', '.cells'].forEach(function (s) { pio.observe($(s)); });
  }
  // press feedback that outlasts a quick tap: the lever dips, the key turns
  [['.pl-wa', 'pressed'], ['.pl-call', 'turned']].forEach(function (x) {
    var el = $(x[0]); el.addEventListener('pointerdown', function () { el.classList.add(x[1]); setTimeout(function () { el.classList.remove(x[1]); }, 420); });
  });

  // ---------------------------------------------------------------- the full-width blade slides toward the lock as you scroll
  var bandEl = $('[data-band]'), bandSvg = bandEl.firstElementChild;
  function band() {
    var flip = rtl() ? ' scaleX(-1)' : '';
    if (still()) { bandSvg.style.transform = flip.trim(); return; }
    var r = bandEl.getBoundingClientRect(), k = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight * 0.9)));
    var x = (1 - k) * -38 * (rtl() ? -1 : 1);
    bandSvg.style.transform = 'translateX(' + x.toFixed(2) + '%)' + flip;
  }

  // ---------------------------------------------------------------- the lock: scroll story (animations on) or stepped stills (off)
  var track = $('[data-track]'), viewer = $('[data-viewer]'), cards = $$('[data-card]'), cuts = $$('.cut'), stepBtns = $$('[data-step]');
  var stillImg = $('[data-still]'), slab = $('[data-slabels]'), tracer = $('[data-tracer]'), blade = $('.kb-blade'), metal = $('.kb-metal');
  var JUMP = [0.1, 0.27, 0.45, 0.6, 0.76, 0.985];       // the moment of each stage that the stills show, and where taps land
  var DEPTH = [11, 17, 8, 15, 13, 10];
  var CARDP = [0.035, 0.27, 0.45, 0.6, 0.76, 0.965];        // where each card sits centred (the first one is there from the start)                  // the controller key's own cut depths (px)
  var STILL_W = 1200, STILL_H = 900, STILL_L = {"1": [["worn", 0.1737, 0.3504, "<span lang=\"he\">מפתח שחוק</span><span lang=\"en\">A worn key</span>"]], "2": [["shear", 0.7802, 0.488, "<span lang=\"he\">קו הגזירה</span><span lang=\"en\">Shear line</span>"], ["blocked", 0.4143, 0.4233, "<span lang=\"he\">פין עליון חוצה את הקו</span><span lang=\"en\">A driver pin across the line</span>"]], "3": [["wear", 0.5906, 0.6934, "<span lang=\"he\">המתכת שנשחקה</span><span lang=\"en\">The worn-away metal</span>"], ["fresh", 0.2798, 0.0911, "<span lang=\"he\">מפתח בעומק הנכון</span><span lang=\"en\">A key cut to depth</span>"]], "4": [["lift", 0.6437, 0.3142, "<span lang=\"he\">כל פין עולה על השן שלו</span><span lang=\"en\">Each pin rides up its cut</span>"]], "5": [["aligned", 0.7761, 0.501, "<span lang=\"he\">כל הפינים על הקו</span><span lang=\"en\">Every pin on the line</span>"]], "6": [["bolts", 0.4332, 0.1264, "<span lang=\"he\">הבריחים נכנסים למשקוף</span><span lang=\"en\">The bolts go into the frame</span>"]]};
  var step = 0, shown = -1, labelKey = '';
  $$('.pins').forEach(function (p) { var s = p.dataset.pins.split(' '); $$('.pin', p).forEach(function (i, k) { if (s[k] !== 'm') i.classList.add(s[k]); }); });

  // blade geometry: cut centres across 96% of the blade, a chamfered tip in the last 4%
  var B = 0, CW = 12;
  function cutX(i) { return (i + 0.5) / 6 * 0.96 * B; }
  function bladeY(x) {
    var y = 0; for (var i = 0; i < 6; i++) y = Math.max(y, DEPTH[i] * (1 - Math.abs(x - cutX(i)) / CW));
    if (x > 0.96 * B) y = Math.max(y, (x - 0.96 * B) / (0.04 * B) * 13);
    return y;
  }
  function shapeBlade() {
    B = blade.clientWidth; CW = Math.min(14, 0.04 * B);
    var pts = [[0, 0]];
    for (var i = 0; i < 6; i++) { var c = cutX(i); pts.push([c - CW, 0], [c, DEPTH[i]], [c + CW, 0]); }
    pts.push([0.96 * B, 0], [B, 13], [B, 17], [0.96 * B, 30], [0, 30]);
    var r = rtl();
    metal.style.clipPath = 'polygon(' + pts.map(function (p) { return (r ? B - p[0] : p[0]).toFixed(1) + 'px ' + p[1] + 'px'; }).join(',') + ')';
  }
  function placeTracer(x) {
    var y = bladeY(x);
    tracer.style.transform = 'translate(' + ((rtl() ? -1 : 1) * x).toFixed(1) + 'px,' + (y - 6).toFixed(1) + 'px)';
  }
  function tracerAt(p) {
    if (p <= JUMP[0]) return cutX(0) * p / JUMP[0];
    for (var i = 0; i < 5; i++) if (p <= JUMP[i + 1]) return cutX(i) + (cutX(i + 1) - cutX(i)) * (p - JUMP[i]) / (JUMP[i + 1] - JUMP[i]);
    return cutX(5);
  }

  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  function progress() { var r = track.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); }
  // each card sits centred in the free area of the screen at the moment its stage is shown
  function layoutTrack() {
    shapeBlade(); labelKey = '';
    if (still()) { cards.forEach(function (c) { c.style.top = ''; }); return render(); }
    var phone = innerWidth <= 900, Ht = track.offsetHeight, vh = innerHeight, vH = viewer.offsetHeight;
    var cy = phone ? vH + (vh - vH) / 2 : vh / 2;
    cards.forEach(function (c, i) { var h = c.offsetHeight; c.style.top = Math.max(phone ? vH : 0, Math.min(Ht - h - 8, CARDP[i] * (Ht - vh) + cy - h / 2)) + 'px'; });
    render();
  }
  function placeLabels(si) {
    var sw = stillImg.clientWidth, sh = stillImg.clientHeight; if (!sw) return;
    var k = Math.min(sw / STILL_W, sh / STILL_H), ox = (sw - STILL_W * k) / 2, oy = (sh - STILL_H * k) / 2;
    var key = si + '|' + sw + 'x' + sh + root.lang; if (key === labelKey) return; labelKey = key;
    slab.innerHTML = '';
    (STILL_L[si + 1] || []).forEach(function (l) {
      var e = document.createElement('span'); e.className = 'l3d l3d-' + l[0]; e.innerHTML = l[3];
      e.style.transform = 'translate(' + (ox + STILL_W * k * l[1]).toFixed(1) + 'px, ' + Math.max(40, oy + STILL_H * k * l[2]).toFixed(1) + 'px)';
      slab.appendChild(e);
    });
  }
  function render() {
    band();
    var p = progress(), live = !!window.__lock3d, sg;
    if (still()) sg = step; else sg = Math.min(5, Math.floor(p * 6));
    if (!live) {
      var src = 'img/still-' + (sg + 1) + '.jpg';
      if (stillImg.getAttribute('src') !== src) stillImg.src = src;
      var t = cards[sg].querySelector('h3 [lang="' + root.lang + '"]');
      stillImg.alt = t ? t.textContent : '';
      placeLabels(sg);
    }
    if (sg !== shown) {
      shown = sg;
      cards.forEach(function (c, i) { c.classList.toggle('is-on', i === sg); });
      cuts.forEach(function (c, i) { if (i === sg) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current'); });
      stepBtns.forEach(function (b) { b.disabled = +b.dataset.step < 0 ? sg === 0 : sg === 5; });
    }
    placeTracer(still() ? cutX(sg) : tracerAt(p));
    if (live) window.__lock3d.set(p);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(); }); } }, { passive: true });
  var rw = innerWidth;
  addEventListener('resize', function () { fitAll(); if (innerWidth !== rw || still()) { rw = innerWidth; layoutTrack(); } else render(); });
  stillImg.addEventListener('load', function () { labelKey = ''; render(); });
  function go(i) { step = Math.max(0, Math.min(5, i)); render(); }
  function jump(i) {
    if (still()) return go(i);
    var r = track.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + JUMP[i] * (r.height - innerHeight), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  stepBtns.forEach(function (b) { b.addEventListener('click', function () { jump(Math.max(0, Math.min(5, shown + +b.dataset.step))); }); });
  cuts.forEach(function (c, i) { c.addEventListener('click', function () { jump(i); }); });
  // switching modes keeps the visitor on the same stage, and on the story if they were in it
  function storyBefore() { var r = track.getBoundingClientRect(); return { sg: shown < 0 ? 0 : shown, seen: r.top < innerHeight && r.bottom > 0 }; }
  function storyAfter(k) {
    if (still()) { step = k.sg; if (k.seen) scrollTo(0, scrollY + track.getBoundingClientRect().top - 16); return; }
    if (!k.seen) return;
    var r = track.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + JUMP[k.sg] * (r.height - innerHeight));
  }
  window.__trackRender = function () { shown = -1; labelKey = ''; render(); };
  window.__stillLabels = function (o) { STILL_L = o; labelKey = ''; render(); };

  var qs = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  hours();
  selectTab(0);
  setLang(qs === 'en' || qs === 'he' ? qs : (saved === 'en' ? 'en' : 'he'));
  clipUI();
  setInterval(status, 60000);
})();
