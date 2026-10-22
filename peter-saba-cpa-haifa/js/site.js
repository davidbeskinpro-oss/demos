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
    texts(l); hours(); stage(cur, true); write(); fill(); geo = null; seal(); desk();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch (the lamp's pull chain)
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#who'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('saba-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $('[data-seal]').classList.add('loaded');
    if (!on) { stopAuto(); stopIntro(); }
    geo = null; seal(); desk(); pan();
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
    lampState(open);
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
  var WHAT = { books: ['הנהלת חשבונות', 'bookkeeping'], annual: ['דוח שנתי', 'an annual report'], refund: ['החזר מס', 'a tax refund'], open: ['פתיחת תיק ברשויות המס', 'opening a file with the tax authorities'] };
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

  // ---------------------------------------------------------------- THE SEAL: the plate opens, the camera moves in, a light passes over the foil
  var sealSec = $('[data-seal]'), pin = $('[data-seal-pin]'), plate = $('[data-plate]'), cam = $('[data-cam]'), litImg = $('[data-lit]');
  var fade = $('[data-fade]'), copy = $('[data-hero-copy]'), bar = $('[data-bar]');
  var IW = 1500, IH = 1000, FX = 0.447, FY = 0.387, SEAL_W = 0.41;   // the seal's centre and width in the photo
  var geo = null, introBand = 40, introRaf = 0;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  function measure() {
    var cb = $('.concept'); root.style.setProperty('--cbar', (cb ? cb.offsetHeight : 0) + 'px');
    var vw = pin.clientWidth, vh = pin.clientHeight, wide = vw >= 900;
    var gut = clamp(vw * 0.032, 16, 48), r;
    if (wide) {
      var half = vw * 0.48;
      r = he() ? [gut, 88, half, vh - 40] : [vw - half, 88, vw - gut, vh - 40];
    } else {
      var below = copy.offsetHeight + Math.max(36, parseFloat(getComputedStyle(copy).bottom) || 36) + 22;
      r = [gut, 74, vw - gut, Math.max(74 + 200, vh - below)];
    }
    var c = Math.max(vw / IW, vh / IH);
    geo = { vw: vw, vh: vh, r0: r, dw: IW * c, dh: IH * c, wide: wide };
    cam.style.width = geo.dw + 'px'; cam.style.height = geo.dh + 'px';
  }
  function place(p, band) {
    var g = geo, vw = g.vw, vh = g.vh, e = smooth((p - 0.1) / 0.5);
    // the plate's edges move out to the screen's edges
    var R = [lerp(g.r0[0], 0, e), lerp(g.r0[1], 0, e), lerp(g.r0[2], vw, e), lerp(g.r0[3], vh, e)];
    var rr = lerp(g.wide ? 26 : 22, 0, e);
    plate.style.clipPath = 'inset(' + R[1].toFixed(1) + 'px ' + (vw - R[2]).toFixed(1) + 'px ' + (vh - R[3]).toFixed(1) + 'px ' + R[0].toFixed(1) + 'px round ' + rr.toFixed(1) + 'px)';
    var pw = R[2] - R[0], ph = R[3] - R[1];
    // the camera: the seal fills most of the plate at rest, then pushes in a little past full screen
    var s0 = Math.max(0.74 * Math.min(pw, ph * 1.35) / (SEAL_W * g.dw), pw / g.dw, ph / g.dh);
    var s1 = Math.max(1.16, vw / g.dw, vh / g.dh);
    var S = lerp(s0, s1, smooth(p / 0.85));
    var cx = lerp((R[0] + R[2]) / 2, vw * 0.5, e), cy = lerp((R[1] + R[3]) / 2, vh * 0.46, e);
    var tx = cx - S * FX * g.dw, ty = cy - S * FY * g.dh;
    tx = clamp(tx, R[2] - S * g.dw, R[0]); ty = clamp(ty, R[3] - S * g.dh, R[1]);
    cam.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + S.toFixed(4) + ')';
    litImg.style.setProperty('--band', band.toFixed(1) + '%');
  }
  function seal() {
    if (!geo) measure();
    bar.classList.toggle('solid', scrollY > 40);
    if (still()) { place(0, 40); fade.style.opacity = ''; copy.style.opacity = ''; copy.style.removeProperty('--cy'); copy.style.translate = ''; return; }
    var r = sealSec.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    place(p, introBand + p * 95);
    var tc = smooth(p / 0.12);
    copy.style.opacity = (1 - tc).toFixed(3);
    copy.style.translate = '0 ' + (-32 * tc).toFixed(1) + 'px';
    fade.style.opacity = smooth((p - 0.7) / 0.3).toFixed(3);
  }
  // on load the light crosses onto the foil once, then rests on it
  function intro() {
    var t0 = performance.now(), D = 1800;
    introBand = -30;
    (function step(now) {
      var t = clamp((now - t0) / D, 0, 1), k = 1 - Math.pow(1 - t, 3);
      introBand = -30 + 70 * k; seal();
      if (t < 1) introRaf = requestAnimationFrame(step);
    })(t0);
  }
  function stopIntro() { cancelAnimationFrame(introRaf); introBand = 40; }

  // ---------------------------------------------------------------- WHO: the business card is set down on the desk as it comes in
  var card = $('[data-card]');
  function desk() {
    if (still()) { card.style.removeProperty('--rx'); card.style.removeProperty('--rz'); return; }
    var r = card.getBoundingClientRect(), vh = innerHeight;
    if (r.top > vh + 100 || r.bottom < -100) return;
    var t = smooth((vh - r.top) / (vh * 0.75));
    card.style.setProperty('--rx', (34 * (1 - t)).toFixed(2) + 'deg');
    card.style.setProperty('--rz', (-5 + 3.5 * t).toFixed(2) + 'deg');
  }

  // ---------------------------------------------------------------- VISIT: the lamp is lit while the office is open
  var night = $('[data-lamp]'), lampOn = $('[data-lit-lamp]'), isOpen = false, lampSeen = false;
  function lampState(open) {
    isOpen = open;
    if (!night) return;
    night.classList.toggle('lit', open);
  }
  if (night && 'IntersectionObserver' in window) new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting || lampSeen) return;
      lampSeen = true;
      // the pull: a short flicker, then the glass holds its light
      if (isOpen && !still() && lampOn.animate) lampOn.animate([{ opacity: 0 }, { opacity: .7, offset: .18 }, { opacity: .15, offset: .3 }, { opacity: 1, offset: .55 }, { opacity: 1 }], { duration: 760, delay: 250, easing: 'ease-out', fill: 'backwards' });
    });
  }, { threshold: .45 }).observe(night);

  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; seal(); desk(); pan(); }); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { geo = null; seal(); desk(); pan(); });

  // the ledger page pans slowly down its column of figures while the section passes
  var panImg = $('[data-pan]');
  function pan() {
    if (still()) { panImg.style.transform = ''; return; }
    var win = panImg.parentNode, r = win.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom > -50 && r.top < vh + 50) {
      var t = clamp((vh - r.top) / (vh + r.height), 0, 1), travel = Math.max(0, panImg.offsetHeight - win.clientHeight);
      panImg.style.transform = 'translateY(' + (-travel * t).toFixed(1) + 'px)';
    }
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
    ['who', 'plain', 'year', 'reviews', 'write', 'visit'].forEach(function (id) { nio.observe(document.getElementById(id)); });
    // the phone keys step aside while the composer and the contact block are on screen (they carry their own buttons)
    var dock = $('[data-dock]'), seen = new Set();
    var dio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); dock.classList.toggle('away', seen.size > 0); });
    [$('.calc'), $('.tape'), $('.hero-copy .acts')].forEach(function (el) { dio.observe(el); });
  }

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); stage(1, true); write();
  seal(); desk(); pan();
  requestAnimationFrame(function () {
    sealSec.classList.add('loaded');
    if (!still()) intro();
  });
  window.__seal = seal; window.__stage = stage;
})();
