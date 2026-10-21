(function () {
  var root = document.documentElement, WA = '972508426958';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'פיטר סאבא · רואה חשבון · שיבת ציון 6, חיפה', en: 'Peter Saba · CPA · 6 Shivat Zion St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור פיטר סאבא רואה חשבון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Peter Saba CPA · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars-l]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-nav]', 'ראשי', 'Main');
    aria('[data-t-call],[data-t-call2]', 'התקשרו לפיטר, 050-842-6958', 'Call Peter, 050-842-6958');
    aria('[data-t-wa]', 'וואטסאפ לפיטר', 'WhatsApp Peter');
    var m = $('[data-t-map]'); if (m) m.title = l === 'he' ? 'מפה: שיבת ציון 6, חיפה' : 'Map: 6 Shivat Zion St, Haifa';
    var nm = $('#nm'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('saba-lang', l); } catch (e) {}
    texts(l); hours(); stage(cur, true); write(); fill(); lamp();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch (the lamp's pull chain)
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#year'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('saba-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $('[data-lamp]').classList.add('lit');
    if (!on) { stopAuto(); resetLamp(); }
    lamp();
    if (keep < innerHeight) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8.5, 19.5], 1: [8.5, 19.5], 2: [8.5, 19.5], 3: [8.5, 19.5], 4: [8.5, 19.5], 5: [8, 15.5], 6: null };
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
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status],[data-status2]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ---------------------------------------------------------------- THE YEAR: one slider, four states of a sample of the books
  var CL = {
    he: ['קבלות וחשבוניות נאספות', 'כל חודש נרשם בספרים', 'מע״מ ומקדמות מדווחים', 'השנה נסגרת בשורה אחת'],
    en: ['Receipts and invoices come in', 'Each month goes into the books', 'VAT and advance payments are reported', 'The year closes on one line']
  };
  var FT = {
    he: ['קבלות · אוקטובר', 'הנהלת חשבונות · אוקטובר', 'דיווחים · ספטמבר–אוקטובר', 'דוח שנתי · שנת המס'],
    en: ['Receipts · October', 'Bookkeeping · October', 'Reports · September–October', 'Annual report · the tax year']
  };
  var yr = $('[data-year]'), range = $('[data-range]'), clause = $('[data-clause]'), ftitle = $('[data-frag-title]'), cur = 1, swapT;
  function fill() {
    var pct = (cur - 1) / 3 * 100;
    range.style.setProperty('--pct', pct + '%');
    range.style.setProperty('--fill-dir', he() ? 'left' : 'right');
  }
  function stage(n, instant) {
    n = clamp(n | 0, 1, 4); var l = he() ? 'he' : 'en', changed = n !== cur; cur = n;
    yr.dataset.stage = n; range.value = n; fill();
    range.setAttribute('aria-valuetext', CL[l][n - 1]);
    $$('[data-go]').forEach(function (b) { b.setAttribute('aria-current', +b.dataset.go === n ? 'step' : 'false'); });
    ftitle.textContent = FT[l][n - 1];
    clearTimeout(swapT);
    if (instant || !changed || still()) { clause.textContent = CL[l][n - 1]; clause.classList.remove('swap'); return; }
    clause.classList.add('swap');
    swapT = setTimeout(function () { clause.textContent = CL[l][n - 1]; clause.classList.remove('swap'); }, 200);
  }
  range.addEventListener('input', function () { stopAuto(); stage(+range.value); });
  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { stopAuto(); stage(+b.dataset.go); }); });
  // with motion on, the year plays through once when it first comes into view, until the visitor takes the slider
  var autoT = null, played = false;
  function stopAuto() { clearInterval(autoT); autoT = null; }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting || played || still()) return;
      played = true; stage(1);
      autoT = setInterval(function () { if (cur >= 4) return stopAuto(); stage(cur + 1); }, 2200);
    });
  }, { threshold: .55 }).observe($('.frag'));

  // ---------------------------------------------------------------- WRITE: the adding machine composer
  var form = $('[data-calc]'), msgEl = $('[data-msg]'), nm = $('#nm');
  var WHO = { self: ['אני עצמאי/ת', "I'm self-employed"], co: ['יש לי חברה', 'I run a company'], emp: ['אני שכיר/ה', "I'm an employee"] };
  var WHAT = { books: ['הנהלת חשבונות', 'bookkeeping'], annual: ['דוח שנתי', 'an annual report'], refund: ['בדיקת החזר מס', 'checking for a tax refund'], open: ['פתיחת עסק', 'opening a business'] };
  function message() {
    var l = he() ? 0 : 1, fd = new FormData(form), w = fd.get('who'), t = fd.get('what'), n = (nm.value || '').trim();
    var s = l ? 'Hi Peter' : 'שלום פיטר';
    s += l ? (n ? ', my name is ' + n + '.' : ',') : (n ? ', שמי ' + n + '.' : ',');
    if (w && t) s += ' ' + WHO[w][l] + (l ? ", and I'd like to talk about " : ' ואשמח לדבר על ') + WHAT[t][l] + '.';
    else if (w) s += ' ' + WHO[w][l] + (l ? ' and I have a question.' : ' ויש לי שאלה.');
    else if (t) s += (l ? " I'd like to talk about " : ' אשמח לדבר על ') + WHAT[t][l] + '.';
    else s += l ? ' I have a question.' : ' יש לי שאלה.';
    return s.replace(/,\s*\./, '.');
  }
  function write() {
    var m = message(); msgEl.textContent = m;
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    $$('[data-wa]').forEach(function (a) { a.href = url; });
  }
  form.addEventListener('change', write);
  nm.addEventListener('input', write);
  form.addEventListener('reset', function () { setTimeout(write, 0); });
  form.addEventListener('submit', function (e) { e.preventDefault(); write(); window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(message()), '_blank', 'noopener'); });

  // ---------------------------------------------------------------- THE LAMP: pulled on, then the camera goes into the glass
  var lampSec = $('[data-lamp]'), cam = $('[data-cam]'), glass = $('[data-glass]'), copy = $('[data-hero-copy]'), note = $('.photo-note'), bar = $('[data-bar]');
  var F = { wide: [0.394, 0.299], tall: [0.434, 0.206] };      // the shade's centre in each crop
  var SHADE = { wide: [0.52, 0.41], tall: [0.81, 0.28] };     // the shade's size in each crop
  var geo = null;
  function measure() {
    var wide = matchMedia('(min-width: 700px)').matches, pic = $('.lamp-on'), im = $('img', pic);
    var w = pic.offsetWidth, h = pic.offsetHeight, x0 = pic.offsetLeft, y0 = pic.offsetTop;
    var iw = wide ? 2000 : 1000, ih = wide ? 1151 : 1309, op = wide ? [0.38, 0.2] : [0.2, 0.2];
    var s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    var f = F[wide ? 'wide' : 'tall'], fx = he() ? f[0] : 1 - f[0];
    var ox = (w - dw) * (he() ? op[0] : 1 - op[0]), oy = (h - dh) * op[1];
    var sh = SHADE[wide ? 'wide' : 'tall'], vw = cam.offsetWidth, vh = cam.offsetHeight;
    var end = clamp(Math.max(2.4 * vw / (sh[0] * dw), 2.4 * vh / (sh[1] * dh)), 3.2, 9);
    geo = { x: x0 + ox + fx * dw, y: y0 + oy + f[1] * dh, end: end };
    cam.style.transformOrigin = geo.x + 'px ' + geo.y + 'px';
  }
  function resetLamp() { note.style.opacity = ''; cam.style.transform = ''; glass.style.opacity = ''; copy.style.opacity = ''; copy.style.transform = ''; }
  function lamp() {
    if (!geo) measure();
    var r = lampSec.getBoundingClientRect(), vh = innerHeight;
    bar.classList.toggle('solid', scrollY > 40);
    if (still()) { resetLamp(); return; }
    var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    var tc = smooth(p / .2);
    copy.style.opacity = 1 - tc;
    copy.style.transform = 'translateY(' + (-36 * tc) + 'px)';
    var e = smooth((p - .04) / .8);
    cam.style.transform = 'scale(' + (1 + (geo.end - 1) * Math.pow(e, 1.7)).toFixed(4) + ')';
    glass.style.opacity = smooth((p - .42) / .36).toFixed(3);
    note.style.opacity = 1 - tc;
  }
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; lamp(); pan(); }); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { geo = null; lamp(); pan(); });

  // the ledger page pans slowly down its column of figures while the section passes; Haifa drifts a little
  var panImg = $('[data-pan]'), drift = $('[data-drift]');
  function pan() {
    if (still()) { panImg.style.transform = ''; drift.style.transform = ''; return; }
    var win = panImg.parentNode, r = win.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom > -50 && r.top < vh + 50) {
      var t = clamp((vh - r.top) / (vh + r.height), 0, 1), travel = Math.max(0, panImg.offsetHeight - win.clientHeight);
      panImg.style.transform = 'translateY(' + (-travel * t).toFixed(1) + 'px)';
    }
    var d = drift.parentNode.getBoundingClientRect();
    if (d.bottom > 0 && d.top < vh) { var u = clamp((vh - d.top) / (vh + d.height), 0, 1); drift.style.transform = 'translateY(' + ((u - .5) * 40).toFixed(1) + 'px) scale(1.04)'; }
  }

  // the calculator clip plays through once each time it comes into view (8 s, no endless loop); motion off: the still frame
  var vid = $('[data-keys]');
  if (vid && 'IntersectionObserver' in window) new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && !still()) { try { vid.currentTime = 0; } catch (x) {} var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); }
      else if (!e.isIntersecting) vid.pause();
    });
  }, { threshold: .5 }).observe(vid);

  // ---------------------------------------------------------------- reveals, nav, dock
  $$('section').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  var links = $$('[data-nav] a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['year', 'plain', 'reviews', 'write', 'visit'].forEach(function (id) { nio.observe(document.getElementById(id)); });
    // the phone keys step aside while the composer and the contact block are on screen (they carry their own buttons)
    var dock = $('[data-dock]'), seen = new Set();
    var dio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); dock.classList.toggle('away', seen.size > 0); });
    [$('.calc'), $('.tape'), $('.hero-copy .acts')].forEach(function (el) { dio.observe(el); });
  }

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); stage(1, true); write();
  function start() {
    lamp(); pan();
    requestAnimationFrame(function () {
      lampSec.classList.add('loaded');
      if (still()) { lampSec.classList.add('lit'); return; }
      // the pull: a short flicker, then the glass holds its light
      setTimeout(function () {
        lampSec.classList.add('lit');
        var on = $('[data-lit]');
        if (on.animate) on.animate([{ opacity: 0 }, { opacity: .7, offset: .18 }, { opacity: .15, offset: .3 }, { opacity: 1, offset: .55 }, { opacity: 1 }], { duration: 760, easing: 'ease-out' });
      }, 420);
    });
  }
  start();
  window.__lamp = lamp; window.__stage = stage;
})();
