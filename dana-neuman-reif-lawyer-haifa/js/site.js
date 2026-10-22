(function () {
  var root = document.documentElement, WA = '972525320032';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'עו״ד דנה נוימן-רייף · עורכת דין, נוטריון ומגשרת · חיפה', en: 'Adv. Dana Neuman-Reif · Attorney, notary and mediator · Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עו"ד דנה נוימן - רייף · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adv. Dana Neuman-Reif · This is not the business’s official website' };
  var HELLO = { he: 'שלום דנה, הגעתי דרך האתר.', en: 'Hi Dana, I found your website.' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $('[data-bar]').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('[data-t-call]').setAttribute('aria-label', l === 'he' ? 'להתקשר לדנה, 052-532-0032' : 'Call Dana, 052-532-0032');
    $('[data-t-wa]').setAttribute('aria-label', l === 'he' ? 'וואטסאפ לדנה' : 'WhatsApp Dana');
    $$('[data-wa-hello]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(HELLO[l]); });
    $$('.letter option').forEach(function (o) { o.textContent = o.dataset[l]; });
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dnr-lang', l); } catch (e) {}
    texts(l); hours(); letter(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#reviews'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on);
    try { localStorage.setItem('dnr-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('in'); $('[data-file]').classList.add('in');
    layout();
    // the deal changes height between the two modes: keep the visitor where they were if they were past it
    if (keep < innerHeight) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: null, 6: null };
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
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

  // ---------------------------------------------------------------- the letter: it reads exactly as it will be sent
  var T = {
    he: { re: { buy: 'קנייה של דירה', sell: 'מכירה של דירה', both: 'מכירה וקנייה במקביל', will: 'צוואה או ייפוי כוח מתמשך', notary: 'שירותי נוטריון', other: 'שאלה בנושא אחר' },
      st: { start: 'אנחנו רק בתחילת הדרך.', party: 'כבר יש צד שני לעסקה.', draft: 'כבר יש לנו טיוטת חוזה.' },
      ask: 'אשמח לשיחה קצרה כדי להבין איך מתקדמים.', re0: 'הנדון: ', sign: 'בברכה,' },
    en: { re: { buy: 'buying a home', sell: 'selling a home', both: 'selling and buying at once', will: 'a will or a lasting power of attorney', notary: 'notary services', other: 'another matter' },
      st: { start: 'We are just starting.', party: 'The other party is already found.', draft: 'We already have a draft contract.' },
      ask: 'I’d be glad to have a short call about the next steps.', re0: 'Re: ', sign: 'Best regards,' }
  };
  var form = $('#letter'), stRow = $('[data-st-row]'), body = $('[data-body]'), send = $('[data-send]'), nm = $('[name=nm]'), last = '';
  function letter(instant) {
    var l = he() ? 'he' : 'en', t = T[l], re = $('[data-re]').value, st = $('[data-st]').value;
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    var deal = re === 'buy' || re === 'sell' || re === 'both';
    stRow.hidden = !deal;
    var line = (deal ? t.st[st] + ' ' : '') + t.ask;
    if (!instant && !still() && line !== last) { body.innerHTML = ''; var s = document.createElement('span'); s.className = 'new'; s.textContent = line; body.appendChild(s); }
    else body.textContent = line;
    last = line;
    var msg = HELLO[l] + '\n' + t.re0 + t.re[re] + '.\n' + line + (name ? '\n' + t.sign + '\n' + name : '');
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }
  form.addEventListener('change', function () { letter(); });
  nm.addEventListener('input', function () { letter(true); });

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-clause]').forEach(function (li, i) { li.style.setProperty('--i', i); });
  $$('[data-reveal], [data-foot], [data-file]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- bar: solid once off the hero; where you are
  var bar = $('[data-bar]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'dana', 'deal', 'reviews', 'write', 'office'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- seals: on phones, once the page's own buttons are out of sight
  var seals = $('[data-seals]'), seen = new Set();
  if (seals && 'IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); seals.classList.toggle('away', seen.size > 0); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- the deal: camera on one contract, the signature, the dive
  var track = $('[data-track]'), pin = $('[data-pin]'), scene = $('[data-scene]'), sig = $('[data-sig]'), dot = $('[data-dot]');
  var blot = $('[data-blot]'), blotUse = $('[data-blot-use]'), sheen = $('[data-blot-sheen]'), copy = $('[data-copy]'), dcap = $('[data-dcap]'), fade = $('[data-fade]'), shade = $('.deal-shade');
  var steps = $$('[data-steps] li');
  var IW = 2400, IH = 1800, A = [1343, 878], TH = 30.2 * Math.PI / 180, DOT_R = 6.5;
  function img(u, v) { return [A[0] + u * Math.cos(TH) - v * Math.sin(TH), A[1] + u * Math.sin(TH) + v * Math.cos(TH)]; }
  var CEN = img(215, -40), DOT = img(397, -8.6);
  var WET = [28, 39, 89], GROUND = [14, 18, 32];
  var vw = 0, vh = 0, phone = false;
  function measure() { vw = pin.clientWidth; vh = pin.clientHeight; phone = vw < 700; }
  // p: 0 when the deal reaches the top of the screen, 1 when the pinned part ends
  function progress() {
    if (still()) return 0.69;
    var r = track.getBoundingClientRect(), d = track.offsetHeight - vh;
    return d > 0 ? clamp(-r.top / d, 0, 1) : 0;
  }
  function frame() {
    var p = progress(), s0 = Math.max(vw / IW, vh / IH);
    // zoom: settle in, move in on the signature line, then dive (accelerating, like falling into it)
    var dq = seg(p, 0.70, 0.96), z = lerp(1.12, 1.45, smooth(seg(p, 0.06, 0.55))) + 0.25 * smooth(seg(p, 0.55, 0.70)) + 38 * Math.pow(dq, 3);
    var S = s0 * z;
    // what the camera looks at, and where on screen it puts it
    var rtl = root.dir === 'rtl', fq = smooth(seg(p, 0.62, 0.82));
    var Tx0 = phone ? vw * 0.5 : vw * (rtl ? 0.36 : 0.64), Ty0 = phone ? vh * 0.3 : vh * 0.5;
    var F = [lerp(CEN[0], DOT[0], fq), lerp(CEN[1], DOT[1], fq)], Tx = lerp(Tx0, vw / 2, fq), Ty = lerp(Ty0, vh / 2, fq);
    var tx = Tx - S * F[0], ty = Ty - S * F[1];
    tx = clamp(tx, vw - S * IW, 0); ty = clamp(ty, vh - S * IH, 0); // the photograph always covers the screen
    scene.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + S.toFixed(5) + ')';
    // the signature writes itself, then the pen's last drop pools
    sig.style.strokeDashoffset = (1 - smooth(seg(p, 0.50, 0.66))).toFixed(4);
    var pr = DOT_R * smooth(seg(p, 0.655, 0.70));
    // the dive: past the pooling, the drop is drawn on screen (vector, sharp at any size) exactly where the scene's drop is
    var bx = tx + S * DOT[0], by = ty + S * DOT[1];
    if (p > 0.695 && !still()) {
      var far = Math.max(Math.hypot(bx, by), Math.hypot(vw - bx, by), Math.hypot(bx, vh - by), Math.hypot(vw - bx, vh - by));
      var r = DOT_R * S + far * 1.2 * Math.pow(dq, 2.4);
      var c = smooth(seg(dq, 0.35, 0.95)), col = WET.map(function (w, i) { return Math.round(lerp(w, GROUND[i], c)); });
      blot.style.visibility = 'visible';
      blotUse.setAttribute('transform', 'translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ') rotate(30.2) scale(' + r.toFixed(2) + ')');
      blotUse.style.fill = 'rgb(' + col.join(',') + ')';
      sheen.setAttribute('transform', blotUse.getAttribute('transform')); sheen.style.opacity = (1 - c).toFixed(3);
      dot.setAttribute('transform', 'translate(397 -8.6) scale(0)');
    } else {
      blot.style.visibility = 'hidden';
      dot.setAttribute('transform', 'translate(397 -8.6) scale(' + pr.toFixed(3) + ')');
    }
    // words: in with the light, out before the dive
    var co = still() ? 1 : 1 - smooth(seg(p, 0.64, 0.72));
    copy.style.opacity = co; dcap.style.opacity = co; shade.style.opacity = still() ? 1 : 1 - smooth(seg(p, 0.66, 0.8));
    fade.style.opacity = still() ? 0 : (1 - smooth(seg(p, 0, 0.06))).toFixed(3);
    var a = still() ? -1 : p < 0.5 ? clamp(Math.floor((p - 0.04) / 0.115), 0, 3) : 4;
    steps.forEach(function (li, i) { li.classList.toggle('on', i === a); });
  }

  // ---------------------------------------------------------------- depth in the hero: the city far back moves least, she moves a little; two photographs ease within their frames
  var heroBg = $('[data-hero-bg]'), portrait = $('[data-portrait]'), drifts = $$('[data-drift] img');
  function drift() {
    if (still()) { heroBg.style.transform = portrait.style.transform = ''; drifts.forEach(function (i) { i.style.transform = ''; }); return; }
    var y = scrollY;
    if (y < innerHeight * 1.2) {
      heroBg.style.transform = 'translate3d(0,' + (y * 0.35).toFixed(1) + 'px,0) scale(' + (1.08 - Math.min(y / innerHeight, 1) * 0.05).toFixed(4) + ')';
      portrait.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    }
    drifts.forEach(function (i) {
      var r = i.parentNode.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) return;
      var q = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1), room = i.offsetHeight - r.height;
      i.style.transform = 'translate3d(0,' + (-room * q).toFixed(1) + 'px,0)';
    });
  }

  var ticking = false;
  function onScroll() {
    bar.classList.toggle('solid', scrollY > 40);
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; frame(); drift(); });
  }
  function layout() { measure(); frame(); drift(); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', layout);
  window.__frame = frame; window.__layout = layout;

  texts(root.lang === 'en' ? 'en' : 'he'); hours(); letter(true); layout(); onScroll();
  window.__deal = true;
})();
