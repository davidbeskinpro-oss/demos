(function () {
  var root = document.documentElement, WA = '972543303411';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var easeOut = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var bell = function (x, c, w) { var d = (x - c) / w; return Math.exp(-d * d); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var vw = innerWidth, vh = innerHeight;

  var TITLE = { he: 'לייטקאר לייזר · הסרת שיער בלייזר וטיפולי עור · ההסתדרות 251, חיפה', en: 'LightCare Laser · Laser hair removal and skin care · 251 HaHistadrut St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור לייטקאר לייזר · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for LightCare Laser · This is not the business’s official website' };
  $$('[data-stars]').forEach(function (s) { s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var nav = $('.links'); if (nav) nav.setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('[data-way-prev]').setAttribute('aria-label', l === 'he' ? 'התמונה הקודמת' : 'Previous photo');
    $('[data-way-next]').setAttribute('aria-label', l === 'he' ? 'התמונה הבאה' : 'Next photo');
    $('[data-lamps]').setAttribute('aria-label', l === 'he' ? 'יום' : 'Day');
    $('[data-clock]').setAttribute('aria-label', l === 'he' ? 'שעה' : 'Hour');
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lc-lang', l); } catch (e) {}
    texts(l); hours(); buildLamps(); buildClock(); write(true); measure(); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('lc-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $('[data-hero]').classList.remove('deal');
    measure(); frame(); sparkKick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, date: new Date(Date.UTC(+o.year, +o.month - 1, +o.day)) };
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

  // ---------------------------------------------------------------- the composer: lamps are days, the wall clock is the hour, bubbles are treatments
  var pick = { day: null, hour: null }, days = [];
  function lastStart(dow) { var t = H[dow]; return t ? t[1] - 1 : -1; }
  function buildLamps() {
    var l = he(), n = window.__now || now(), d0 = n.date || new Date(), box = $('[data-lamps]'), cords = [64, 92, 52, 80, 104, 70];
    days = [];
    for (var i = 0; i < 8 && days.length < 6; i++) {
      var dow = (n.d + i) % 7; if (!H[dow]) continue;
      var dt = new Date(d0.getTime() + i * 864e5);
      days.push({ dow: dow, dd: dt.getUTCDate(), mm: dt.getUTCMonth() + 1, i: i, over: i === 0 && n.h >= lastStart(dow) });
    }
    if (pick.day != null && (!days[pick.day] || days[pick.day].over)) pick.day = null;
    box.innerHTML = days.map(function (d, k) {
      var name = d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tmrw') : (l ? shortHe[d.dow] : shortEn[d.dow]);
      var lab = (d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tomorrow') : (l ? 'יום ' + dayHe[d.dow] : dayEn[d.dow])) + ' ' + d.dd + '.' + d.mm;
      return '<label class="lamp' + (pick.day === k ? ' on' : '') + (d.over ? ' dis' : '') + '" style="--cord:' + cords[k % 6] + 'px"><input type="radio" name="day" value="' + k + '" form="composer"' + (d.over ? ' disabled' : '') + (pick.day === k ? ' checked' : '') + ' aria-label="' + lab + '"><span class="cord"></span><span class="shade"></span><span class="lbl"><b>' + name + '</b>' + d.dd + '.' + d.mm + '</span></label>';
    }).join('');
    lampEls = $$('.lamp', box);
  }
  var lampEls = [];
  // the clock's positions 1..12; 9-12 are the morning, 1-8 the afternoon (13:00-20:00)
  function h24(k) { return k >= 9 ? k : k + 12; }
  function buildClock() {
    var c = $('[data-clock]'), n = window.__now || now(), d = pick.day != null ? days[pick.day] : null, l = he();
    $$('.hr', c).forEach(function (x) { x.remove(); });
    var html = '';
    for (var k = 1; k <= 12; k++) {
      var h = h24(k), dow = d ? d.dow : null, last = d ? lastStart(dow) : 19;
      var dis = h < 9 || h > last || (d && d.i === 0 && n.h >= h);
      if (dis && pick.hour === h) pick.hour = null;
      html += '<label class="hr" style="--a:' + (k * 30) + 'deg"><input type="radio" name="hr" value="' + h + '"' + (dis ? ' disabled' : '') + (pick.hour === h ? ' checked' : '') + ' aria-label="' + hhmm(h) + '"><span>' + k + '</span></label>';
    }
    c.insertAdjacentHTML('afterbegin', html);
    clockRead();
  }
  function clockRead() {
    var l = he(), r = $('[data-clock-read]');
    var hand = $('[data-hand-h]');
    if (pick.hour != null) { hand.style.setProperty('--hh', ((pick.hour % 12) * 30) + 'deg'); r.textContent = (l ? 'בסביבות ' : 'Around ') + hhmm(pick.hour); }
    else { hand.style.setProperty('--hh', '300deg'); r.textContent = l ? 'בחרו שעה בשעון' : 'Pick an hour on the clock'; }
  }
  var T = {
    he: { hi: 'שלום, הגעתי מהאתר של לייטקאר לייזר. ', svc: { laser: 'אשמח לקבוע תור להסרת שיער בלייזר', face: 'אשמח לקבוע טיפול פנים', aes: 'אשמח לקבוע ייעוץ ברפואה אסתטית', skin: 'אשמח לקבוע טיפול עור בלייזר', electro: 'אשמח לקבוע תור לאלקטרוליזה', any: 'אשמח לקבוע ייעוץ, עוד לא החלטתי על טיפול' },
      today: ' היום', tmrw: ' מחר', on: ' ביום ', at: ' בסביבות ', name: ' קוראים לי ', ask: ' זה מתאים?', any: ' מתי יש תור פנוי?' },
    en: { hi: 'Hi, I found LightCare Laser’s website. ', svc: { laser: 'I’d like to book laser hair removal', face: 'I’d like to book a facial', aes: 'I’d like to book an aesthetic medicine consultation', skin: 'I’d like to book a laser skin treatment', electro: 'I’d like to book electrolysis', any: 'I’d like to book a consultation, I haven’t chosen a treatment yet' },
      today: ' today', tmrw: ' tomorrow', on: ' on ', at: ' around ', name: ' My name is ', ask: ' Does that work for you?', any: ' When do you have a free slot?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), nmI = $('[name=nm]');
  function message() {
    var l = he() ? 'he' : 'en', t = T[l], svc = (form.querySelector('[name=svc]:checked') || {}).value || 'laser';
    var name = (nmI.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var d = pick.day != null ? days[pick.day] : null, m = t.hi + t.svc[svc];
    if (d) m += d.i === 0 ? t.today : d.i === 1 ? t.tmrw : t.on + (l === 'he' ? dayHe[d.dow] : dayEn[d.dow]) + ' ' + d.dd + '.' + d.mm;
    if (pick.hour != null) m += (d ? ',' : '') + t.at + hhmm(pick.hour);
    m += '.';
    if (name) m += t.name + name + '.';
    return m + (d || pick.hour != null ? t.ask : t.any);
  }
  var typeT = 0, lastM = '';
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typeT);
    if (instant || still() || !lastM) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m; var i = keep;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); else clearInterval(typeT);
    }, 16);
  }
  document.addEventListener('change', function (e) {
    var n = e.target.name;
    if (n === 'day') { pick.day = +e.target.value; lampEls.forEach(function (x, k) { x.classList.toggle('on', k === pick.day); }); swing(lampEls[pick.day]); buildClock(); write(); }
    else if (n === 'hr') { pick.hour = +e.target.value; clockRead(); write(); }
    else if (n === 'svc') { write(); }
  });
  nmI.addEventListener('input', function () { write(true); });
  function swing(el) {
    if (!el || still() || !el.animate) return;
    el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'rotate(0)' }], { duration: 900, easing: 'ease-out', composite: 'add' });
  }

  // ---------------------------------------------------------------- reveals: once, staggered inside each section
  $$('section').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- nav: the bar gathers into a pill; where you are
  var navEl = $('[data-nav]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['way', 'care', 'pulse', 'team', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
    // the dock hides while the page's own call buttons are on screen
    var dock = $('[data-dock]'), seen = new Set();
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); dock.classList.toggle('away', seen.size > 0); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- HERO: the logo's own pixels become light
  var hero = $('[data-hero]'), cv = $('[data-spark]'), ctx = cv.getContext('2d'), sunImg = $('[data-sun]');
  var pts = [], parts = [], dpr = 1, heroOn = true, t0 = performance.now(), sparkRun = false, ptr = { x: -999, y: -999 };
  function logoPoints() {
    var out = [];
    try {
      var c = document.createElement('canvas'); c.width = c.height = 100;
      var x = c.getContext('2d'); x.drawImage(sunImg, 0, 0, 100, 100);
      var d = x.getImageData(0, 0, 100, 100).data;
      for (var y = 0; y < 100; y += 2) for (var xx = 0; xx < 100; xx += 2) {
        var i = (y * 100 + xx) * 4;
        if (d[i + 3] > 200 && d[i] > 225 && d[i + 1] > 215 && d[i + 2] > 225) out.push([xx, y]);
      }
    } catch (e) { out = []; }
    if (out.length < 60) { // file:// or no image: the same crescent and rays, from the logo's geometry
      out = [];
      for (var yy = 0; yy < 100; yy += 2) for (var x2 = 0; x2 < 100; x2 += 2) {
        var a = Math.hypot(x2 - 58, yy - 50) < 31, b = Math.hypot(x2 - 38, yy - 46) < 26;
        if (a && !b && x2 > 48) out.push([x2, yy]);
      }
      for (var r = 0; r < 16; r++) { var ang = Math.PI * (0.55 + r * 0.075); for (var s = 4; s < 30; s += 2) out.push([42 + Math.cos(ang) * s, 66 - Math.sin(ang) * s * 0.95]); }
    }
    return out;
  }
  function sunBox() { var r = sunImg.getBoundingClientRect(), h = hero.getBoundingClientRect(); return { x: r.left - h.left, y: r.top - h.top, s: r.width / 100 }; }
  function sparkSize() {
    var r = hero.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  }
  function seedParticles() {
    var src = logoPoints(), max = vw < 700 ? 240 : 420, step = Math.max(1, Math.floor(src.length / max)), b = sunBox();
    pts = []; for (var i = 0; i < src.length; i += step) pts.push(src[i]);
    parts = pts.map(function (p) {
      var hx = b.x + p[0] * b.s, hy = b.y + p[1] * b.s, a = Math.random() * Math.PI * 2, R = (0.25 + Math.random() * 0.6) * Math.max(vw, vh) * 0.5;
      return { hx: hx, hy: hy, x: hx + Math.cos(a) * R, y: hy + Math.sin(a) * R * 0.6, sx: 0, sy: 0, vx: 0, vy: 0, life: 1, r: 1 + Math.random() * 1.8, c: Math.random() < .5 ? '255,214,240' : Math.random() < .5 ? '242,166,220' : '255,255,255', home: true };
    });
    parts.forEach(function (p) { p.sx = p.x; p.sy = p.y; });
  }
  function emit(x, y, n, spread) {
    for (var i = 0; i < n; i++) {
      var a = -Math.PI * (0.05 + Math.random() * 0.9) + (spread ? (Math.random() - .5) * Math.PI : 0), sp = 0.4 + Math.random() * 1.6;
      parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, r: 0.9 + Math.random() * 2, c: Math.random() < .5 ? '255,214,240' : '255,255,255', home: false, decay: 0.004 + Math.random() * 0.006 });
    }
  }
  function sparkFrame(t) {
    if (!sparkRun) return;
    var W = cv.width / dpr, Hh = cv.height / dpr, e = (t - t0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hh);
    ctx.globalCompositeOperation = 'lighter';
    var b = sunBox(), cx = b.x + 40 * b.s, cy = b.y + 64 * b.s;
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.home) {
        if (e < 1.05) { var k = easeOut(e / 1.05); p.x = lerp(p.sx, p.hx, k); p.y = lerp(p.sy, p.hy, k); }
        else if (!p.out) { // the starburst: from the logo outward, along its own rays
          p.out = true; var a = Math.atan2(p.hy - cy, p.hx - cx); var sp = 1.2 + Math.random() * 3.2;
          p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - 0.6; p.decay = 0.004 + Math.random() * 0.005; p.home = false;
        }
      } else {
        var dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * 0.6; p.vx += dx / 60 * f; p.vy += dy / 60 * f; }
        p.vx *= 0.985; p.vy = p.vy * 0.985 - 0.006; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0 || p.y < -20) { parts.splice(i, 1); continue; }
      }
      var al = p.home ? clamp(e * 1.4, 0, 1) * 0.9 : p.life * 0.85;
      ctx.fillStyle = 'rgba(' + p.c + ',' + al.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    // a gentle, steady emission from the crescent once the opening is over
    if (e > 1.4 && parts.length < (vw < 700 ? 160 : 280)) emit(cx + (Math.random() - .3) * 30 * b.s, cy - Math.random() * 40 * b.s, vw < 700 ? 1 : 2);
    requestAnimationFrame(sparkFrame);
  }
  function sparkKick() {
    var go = heroOn && !still() && !document.hidden;
    if (go && !sparkRun) { sparkRun = true; requestAnimationFrame(sparkFrame); }
    else if (!go) { sparkRun = false; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); }
  }
  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', function () { ptr.x = ptr.y = -999; });
  hero.addEventListener('pointerdown', function (e) { if (still() || e.target.closest('a,button')) return; var r = hero.getBoundingClientRect(); emit(e.clientX - r.left, e.clientY - r.top, 36, true); });
  document.addEventListener('visibilitychange', sparkKick);

  // the ring of photographs: turns slowly, follows the scroll and a drag
  var ringWrap = $('[data-ring-wrap]'), ring = $('[data-ring]'), cards = $$('.card', ring), rot = 0, vel = 0, drag = null, dealStart = 0, cw = 200, R = 400;
  var STEP = 360 / cards.length;
  var dims = cards.map(function (c) { var d = document.createElement('i'); d.className = 'dim'; c.appendChild(d); return d; });
  function ringMeasure() { cw = cards[0].offsetWidth || 200; R = vw < 700 ? cw * 2.1 : Math.max(cw * 2.4, Math.min(vw * 0.36, cw * 3)); }
  function ringDraw(t) {
    var s = still(), sc = scrollY * 0.06;
    cards.forEach(function (c, i) {
      var a = i * STEP + rot + (s ? 0 : sc), rad = a * Math.PI / 180, cos = Math.cos(rad);
      var lift = -16 * Math.pow(Math.max(0, cos), 6);
      var op = clamp((cos + 0.45) / 0.9, 0, 1), dim = 0.45 + 0.55 * Math.max(0, cos);
      var tf = 'translate3d(0,' + lift.toFixed(1) + 'px,0) rotateY(' + a.toFixed(2) + 'deg) translateZ(' + R.toFixed(0) + 'px)';
      if (!s && t != null && dealStart) { // the opening: cards dealt out of the rising logo
        var k = easeOut((t - dealStart - i * 70) / 900);
        tf = 'translate3d(0,' + ((1 - k) * 80).toFixed(1) + 'px,' + ((1 - k) * -R).toFixed(0) + 'px) scale(' + lerp(.3, 1, k).toFixed(3) + ') ' + tf;
        op *= k;
      }
      c.style.transform = tf; c.style.opacity = op.toFixed(3); dims[i].style.opacity = (1 - dim).toFixed(2);
      c.style.zIndex = Math.round(cos * 100) + 100; c.style.visibility = op < 0.02 ? 'hidden' : 'visible';
    });
  }
  ringWrap.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, r: rot, t: performance.now() }; vel = 0; });
  addEventListener('pointermove', function (e) { if (!drag) return; var d = (e.clientX - drag.x) * 0.25 * (he() ? -1 : 1); var nr = drag.r + d; vel = nr - rot; rot = nr; if (still()) ringDraw(); });
  addEventListener('pointerup', function () { drag = null; });
  addEventListener('pointercancel', function () { drag = null; });
  var lastT = 0;
  function ringLoop(t) {
    if (!heroOn) { ringRun = false; return; }
    var dt = lastT ? Math.min(50, t - lastT) : 16; lastT = t;
    if (!drag && !still()) { rot += vel; vel *= 0.94; rot -= dt * 0.006 * (he() ? -1 : 1); }
    ringDraw(t);
    if (dealStart && t - dealStart > 900 + cards.length * 70) dealStart = 0;
    if (still()) { ringRun = false; return; }
    requestAnimationFrame(ringLoop);
  }
  var ringRun = false;
  function ringKick() { if (heroOn && !still() && !ringRun) { ringRun = true; lastT = 0; requestAnimationFrame(ringLoop); } else if (still()) ringDraw(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; sparkKick(); ringKick(); }, { threshold: 0 }).observe(hero);

  // ---------------------------------------------------------------- THE WAY IN: one camera move through three of their photographs
  // World units are the hall photo's pixels (1600x900). The glass door photo sits exactly where the door is in the hall photo
  // (matched on the logo panel), and the reception photo sits inside the door's glass. The camera zooms from one into the next;
  // each layer is only ever shown where it already covers the screen or is masked softly into the one behind, so nothing
  // underneath can show.
  var way = $('[data-way]'), stage = $('[data-way-stage]'), WL = $$('.wl', stage), flare = $('[data-flare]'), wSteps = $$('[data-way-steps] li');
  var s1 = 87 / 420, L = [
    { x: 0, y: 0, w: 1600, h: 900 },
    { x: 603 - 525 * s1, y: 210 - 130 * s1, w: 1080 * s1, h: 1920 * s1 }
  ];
  L.push({ x: L[1].x + 460 * s1, y: L[1].y + 885 * s1, w: 520 * s1, h: 390 * s1 });
  var deskLogo = { x: L[2].x + 890 * L[2].w / 1600, y: L[2].y + 825 * L[2].h / 1200 };
  var doorLogo = { x: 645, y: 262 }, sw = 0, sh = 0, stillStage = 0;
  function cover(l) { return Math.max(sw / l.w, sh / l.h); }
  function wayMeasure() {
    var r = stage.getBoundingClientRect(); sw = r.width; sh = r.height;
    WL.forEach(function (img, i) { var l = L[i], z = cover(l) * 1.25; img.style.width = (l.w * z) + 'px'; img.style.height = (l.h * z) + 'px'; img.dataset.base = z; });
  }
  function clampC(c, l, z) {
    var hw = sw / 2 / z, hh = sh / 2 / z;
    return { x: clamp(c.x, l.x + hw, l.x + l.w - hw), y: clamp(c.y, l.y + hh, l.y + l.h - hh) };
  }
  function ctr(l) { return { x: l.x + l.w / 2, y: l.y + l.h / 2 }; }
  function camAt(p) {
    var z0 = cover(L[0]), z1 = cover(L[1]) * 1.15, z2 = cover(L[2]) * 1.15, c, z, host;
    var start = { x: sw < 700 ? 640 : 760, y: 450 };
    if (p < 0.42) { var t = smooth((p - 0.04) / 0.38); z = Math.exp(lerp(Math.log(z0 * 1.02), Math.log(z1), t)); c = { x: lerp(start.x, ctr(L[1]).x, t), y: lerp(start.y, ctr(L[1]).y, t) }; host = 0; }
    else if (p < 0.8) { var t2 = smooth((p - 0.42) / 0.38); z = Math.exp(lerp(Math.log(z1), Math.log(z2), t2)); c = { x: lerp(ctr(L[1]).x, ctr(L[2]).x, t2), y: lerp(ctr(L[1]).y, ctr(L[2]).y, t2) }; host = 1; }
    else { var t3 = smooth((p - 0.8) / 0.2); z = z2 * lerp(1, 1.08, t3); c = { x: lerp(ctr(L[2]).x, deskLogo.x, t3 * 0.35), y: lerp(ctr(L[2]).y, deskLogo.y, t3 * 0.35) }; host = 2; }
    return { c: clampC(c, L[host], z), z: z, host: host };
  }
  function place(img, l, cam) {
    var X = sw / 2 + (l.x - cam.c.x) * cam.z, Y = sh / 2 + (l.y - cam.c.y) * cam.z, k = (l.w * cam.z) / (l.w * +img.dataset.base);
    img.style.transform = 'translate3d(' + X.toFixed(2) + 'px,' + Y.toFixed(2) + 'px,0) scale(' + k.toFixed(5) + ')';
  }
  var wayStep = -1;
  function wayFrame() {
    var r = way.getBoundingClientRect(), p;
    if (still()) {
      stage.style.removeProperty('--open');
      WL.forEach(function (img, i) { var cam = { c: ctr(L[i]), z: cover(L[i]) * 1.02 }; cam.c = clampC(cam.c, L[i], cam.z); place(img, L[i], cam); img.style.opacity = i === stillStage ? 1 : 0; });
      flare.style.opacity = 0; setStep(stillStage);
      $('[data-way-prev]').disabled = stillStage === 0; $('[data-way-next]').disabled = stillStage === 2;
      return;
    }
    if (r.bottom < -50 || r.top > vh + 50) return;
    p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    stage.style.setProperty('--open', (lerp(12, 150, smooth((vh - r.top) / vh * 1.1 - 0.05))).toFixed(1) + '%');
    var cam = camAt(p);
    WL.forEach(function (img, i) { place(img, L[i], cam); });
    WL[0].style.opacity = p < 0.43 ? 1 : 0;
    WL[1].style.opacity = p < 0.81 ? smooth((p - 0.17) / 0.17) : 0;
    WL[2].style.opacity = smooth((p - 0.57) / 0.1);
    // light from the logo panel on the door, then through the glass, then the logo on the desk
    var fl = Math.max(bell(p, 0.3, 0.07), bell(p, 0.63, 0.06) * 0.8, bell(p, 0.93, 0.07) * 0.9), at = p < 0.46 ? doorLogo : p < 0.78 ? ctr(L[2]) : deskLogo;
    flare.style.opacity = fl.toFixed(3);
    flare.style.transform = 'translate3d(' + (sw / 2 + (at.x - cam.c.x) * cam.z).toFixed(1) + 'px,' + (sh / 2 + (at.y - cam.c.y) * cam.z).toFixed(1) + 'px,0) scale(' + (0.4 + fl * 0.8).toFixed(3) + ')';
    setStep(p < 0.42 ? 0 : p < 0.79 ? 1 : 2);
  }
  function setStep(k) {
    if (k === wayStep) return; wayStep = k;
    wSteps.forEach(function (li, i) { li.classList.toggle('on', i === k); });
    decode(wSteps[k].querySelector('[data-decode]'));
  }
  $('[data-way-prev]').addEventListener('click', function () { stillStage = Math.max(0, stillStage - 1); wayFrame(); });
  $('[data-way-next]').addEventListener('click', function () { stillStage = Math.min(2, stillStage + 1); wayFrame(); });
  // labels arrive out of scrambled glyphs
  function decode(b) {
    if (!b || still()) return;
    var sp = b.querySelector('[lang="' + root.lang + '"]'); if (!sp) return;
    var fin = sp.dataset.fin || (sp.dataset.fin = sp.textContent), set = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHKLMNPRSTUVXYZ', st = performance.now();
    (function run(t) {
      var k = clamp((t - st) / 520, 0, 1), n = Math.floor(fin.length * k), out = fin.slice(0, n);
      for (var i = n; i < fin.length; i++) out += fin[i] === ' ' ? ' ' : set[(Math.random() * set.length) | 0];
      sp.textContent = out; if (k < 1) requestAnimationFrame(run); else sp.textContent = fin;
    })(st);
  }

  // ---------------------------------------------------------------- THE PULSE: their laser photo develops out of the light
  var pulse = $('[data-pulse]'), pframe = $('[data-pframe]'), burst = $('[data-burst]'), nmEl = $('[data-nm]'), waveLis = $$('[data-waves] li'), scanEl = $('[data-scanline]');
  var NM = [755, 810, 1064], WC = ['#ff9fc8', '#f04fb4', '#b35cff'], stillWave = 0, curWave = -1;
  function pulseFrame() {
    var r = pulse.getBoundingClientRect();
    if (still()) { pframe.style.setProperty('--lit', 200); pframe.style.setProperty('--z', 1); pframe.style.setProperty('--bo', 0); setWave(stillWave, NM[stillWave]); return; }
    if (r.bottom < -50 || r.top > vh + 50) return;
    scanEl.style.setProperty('--scan', smooth((vh - r.top) / (vh * 0.7)).toFixed(3));
    var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    var seg = clamp(Math.floor((p - 0.06) / 0.29), 0, 2), sp = clamp((p - 0.06 - seg * 0.29) / 0.29, 0, 1);
    var lit = p < 0.06 ? 0 : seg === 2 ? lerp(70, 160, smooth(sp)) : lerp(seg * 35, seg * 35 + 35, smooth(sp * 1.4));
    var flash = bell(sp, 0.18, 0.12) * (p > 0.06 ? 1 : 0);
    pframe.style.setProperty('--lit', lit.toFixed(1));
    pframe.style.setProperty('--z', (1 + smooth(p) * 0.22).toFixed(4));
    pframe.style.setProperty('--bo', flash.toFixed(3));
    pframe.style.setProperty('--bs', (0.25 + flash * 0.9).toFixed(3));
    var from = seg === 0 ? NM[0] : NM[seg - 1], val = Math.round(lerp(from, NM[seg], smooth(sp / 0.3)));
    setWave(seg, val);
  }
  function setWave(k, val) {
    nmEl.textContent = val;
    if (k === curWave) return; curWave = k;
    waveLis.forEach(function (li, i) { li.classList.toggle('on', i === k); });
    pulse.style.setProperty('--wc', WC[k]); pframe.style.setProperty('--wc', WC[k]);
    $('.nm').style.setProperty('--wc', WC[k]);
  }
  $$('[data-wave]').forEach(function (b) { b.addEventListener('click', function () {
    var k = +b.dataset.wave;
    if (still()) { stillWave = k; curWave = -1; pulseFrame(); return; }
    var top = pulse.getBoundingClientRect().top + scrollY, span = pulse.offsetHeight - vh;
    scrollTo({ top: top + span * (0.06 + k * 0.29 + 0.12), behavior: 'smooth' });
  }); });

  // ---------------------------------------------------------------- TEAM: the card settles up; a spotlight on the magenta wall
  var team = $('[data-team]'), spot = $('[data-spot-team]'), teamPtr = null;
  function teamFrame() {
    if (still()) { team.style.removeProperty('--tx'); team.style.removeProperty('--ts'); spot.style.setProperty('--sr', '80vmax'); return; }
    var r = team.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    var k = smooth((vh - r.top) / (vh * 0.75));
    team.style.setProperty('--tx', (lerp(16, 0, k)).toFixed(2) + 'deg'); team.style.setProperty('--ts', lerp(0.9, 1, k).toFixed(4));
    var c = clamp((vh * 0.5 - (r.top + r.height / 2)) / vh, -1, 1); // -1 below centre .. 1 above
    spot.style.setProperty('--sr', lerp(14, 70, smooth(k * 1.1 - 0.15)).toFixed(1) + 'vmax');
    if (!teamPtr) { spot.style.setProperty('--sx', (50 + c * 30 * (he() ? -1 : 1)).toFixed(1) + '%'); spot.style.setProperty('--sy', '38%'); }
  }
  team.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = team.getBoundingClientRect(); teamPtr = 1; spot.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); spot.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
  team.addEventListener('pointerleave', function () { teamPtr = null; teamFrame(); });

  // ---------------------------------------------------------------- REVIEWS drift with the scroll; the rating counts up once
  var drift = $('[data-drift]'), row = $('[data-drift-row]');
  function driftFrame() {
    if (still()) { row.style.removeProperty('--dx'); return; }
    var r = drift.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    var over = Math.max(0, row.scrollWidth - vw), k = smooth((vh - r.top) / (vh + r.height));
    row.style.setProperty('--dx', (over * k * (he() ? 1 : -1)).toFixed(1) + 'px');
  }
  var counted = false, cnt = $('[data-count]');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting || counted || still()) return; counted = true; var st = performance.now();
    (function run(t) { var k = easeOut((t - st) / 1100); cnt.textContent = (k * 4.8).toFixed(1); if (k < 1) requestAnimationFrame(run); })(st);
  }, { threshold: .6 }).observe(cnt);

  // ---------------------------------------------------------------- BOOK: the lamps are lowered in on their cords
  var book = $('#book');
  function bookFrame() {
    if (still()) { lampEls.forEach(function (l) { l.style.removeProperty('--drop'); l.style.opacity = ''; }); return; }
    var r = book.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
    var lr = $('[data-lamps]').getBoundingClientRect(); lampEls.forEach(function (l, i) { var k = smooth((vh - lr.top) / (vh * 0.45) - i * 0.06); l.style.setProperty('--drop', (lerp(-60, 0, k)).toFixed(1) + 'px'); l.style.opacity = clamp(k * 2, 0, 1).toFixed(2); });
  }

  // ---------------------------------------------------------------- VISIT: the hall photo shrinks into its frame; the footer's horizon rises
  var vph = $('[data-vphoto]'), foot = $('[data-foot]'), visit = $('#visit');
  function visitFrame() {
    if (still()) return;
    var r = vph.getBoundingClientRect();
    if (r.bottom > -100 && r.top < vh + 100) {
      var k = smooth(-r.top / (vh * 0.55) + 0.25), pad = parseFloat(getComputedStyle(visit).paddingLeft) || 16;
      vph.style.setProperty('--ci', (k * vh * 0.06).toFixed(1) + 'px'); vph.style.setProperty('--cx', (k * pad).toFixed(1) + 'px');
      vph.style.setProperty('--cr', (k * 26).toFixed(1) + 'px'); vph.style.setProperty('--vs', lerp(1.14, 1, k).toFixed(4));
    }
    var vb = visit.getBoundingClientRect().bottom, fh = foot.offsetHeight;
    foot.style.setProperty('--fg', (lerp(160, 0, smooth((vh - vb) / Math.max(1, fh)))).toFixed(1) + 'px');
  }

  // ---------------------------------------------------------------- BENTO: each tile's own small living thing, only on screen
  var bento = $('[data-bento]'), tileAnims = [];
  (function pig() { // pigment spots on skin, drawn
    var s = $('[data-pig]'), h = '<rect width="320" height="200" fill="#e9b9a4"/><rect width="320" height="200" fill="#f3cdb9" opacity=".5"/>', seed = 7;
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (var i = 0; i < 70; i++) { var x = 10 + rnd() * 300, y = 10 + rnd() * 180, rx = 1.5 + rnd() * 5.5; h += '<ellipse class="pd" data-x="' + x.toFixed(0) + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + (rx * (0.6 + rnd() * 0.5)).toFixed(1) + '" fill="#8a4b32" opacity="' + (0.35 + rnd() * 0.45).toFixed(2) + '"/>'; }
    s.innerHTML = h;
  })();
  function tilesOn() {
    tileAnims.forEach(function (a) { a.cancel(); }); tileAnims = [];
    if (still() || !Element.prototype.animate) return;
    var tip = $('[data-tip]');
    tileAnims.push(tip.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.6)', offset: .15 }, { opacity: 0, transform: 'scale(2.6)' }], { duration: 1400, iterations: 3, delay: 400, easing: 'ease-out' }));
    var bb = $('[data-bubbles]'); bb.innerHTML = '';
    for (var i = 0; i < 12; i++) {
      var b = document.createElement('i'), sz = 10 + Math.random() * 34; b.style.width = b.style.height = sz + 'px'; b.style.left = (Math.random() * 90) + '%'; bb.appendChild(b);
      tileAnims.push(b.animate([{ transform: 'translateY(0) scale(.6)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: 'translateY(-' + (260 + Math.random() * 200) + 'px) scale(1)', opacity: 0 }], { duration: 3000 + Math.random() * 1800, delay: Math.random() * 1600, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'both' }));
    }
    tileAnims.push($('.sheen').animate([{ transform: 'translateX(-120%)' }, { transform: 'translateX(120%)' }], { duration: 1800, iterations: 2, delay: 600, easing: 'cubic-bezier(.65,0,.35,1)' }));
    var scan = $('.scan'), sv = $('[data-pig]'), W = sv.getBoundingClientRect().width || 300;
    tileAnims.push(scan.animate([{ transform: 'translateX(0)', opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .92 }, { transform: 'translateX(' + W + 'px)', opacity: 0 }], { duration: 2600, delay: 500, easing: 'linear', fill: 'both' }));
    tileAnims.push($('.clear').animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(0)', offset: .04 }, { transform: 'scaleX(1)', offset: .96 }, { transform: 'scaleX(1)' }], { duration: 2600, delay: 500, easing: 'linear', fill: 'both' }));
    var fp = $('.fil path'), L2 = fp.getTotalLength ? fp.getTotalLength() : 200; fp.style.strokeDasharray = L2;
    tileAnims.push(fp.animate([{ strokeDashoffset: L2 }, { strokeDashoffset: 0 }], { duration: 1600, delay: 300, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' }));
    tileAnims.push($('.fil circle').animate([{ opacity: .3, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.8)' }, { opacity: .5, transform: 'scale(1)' }], { duration: 1200, iterations: 3, delay: 1200, easing: 'ease-in-out', transformOrigin: '104px 52px' }));
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) tilesOn(); }, { threshold: .2 }).observe(bento);
  $$('[data-spot]').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- the frame loop for everything tied to the scroll
  var ticking = false;
  function frame() {
    ticking = false;
    navEl.classList.toggle('float', scrollY > 40);
    wayFrame(); pulseFrame(); teamFrame(); driftFrame(); bookFrame(); visitFrame();
    if (!ringRun && heroOn) ringDraw();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  function measure() { vw = innerWidth; vh = innerHeight; ringMeasure(); wayMeasure(); sparkSize(); }
  var rsT; addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(function () { var w = vw; measure(); if (Math.abs(w - vw) > 40) seedParticles(); frame(); }, 120); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); buildLamps(); buildClock(); write(true);
  measure();
  if (!still()) { hero.classList.add('deal'); dealStart = performance.now(); }
  function startSpark() { seedParticles(); t0 = performance.now(); sparkKick(); setTimeout(function () { hero.classList.remove('deal'); }, 650); }
  if (sunImg.complete) startSpark(); else { sunImg.addEventListener('load', startSpark); sunImg.addEventListener('error', startSpark); }
  ringKick(); frame();
  window.__frame = frame; window.__measure = measure;
})();
