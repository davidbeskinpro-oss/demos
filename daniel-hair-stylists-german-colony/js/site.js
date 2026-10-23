(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var easeOut = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var hasIO = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!hasIO) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting, es[0]); }, opt || {}).observe(el); };
  var TITLE = { he: 'דניאל מעצבי שיער · מומחים לתלתלים · שדרות בן גוריון 30, חיפה', en: 'Daniel Hair Stylists · Curl specialists · 30 Ben Gurion Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור דניאל מעצבי שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Daniel Hair Stylists · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-mark]', 'דניאל מעצבי שיער, לראש העמוד', 'Daniel Hair Stylists, back to top');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-fan]', 'בחירת לקוחה', 'Choose a client');
    aria('[data-t-scall]', 'התקשרו לדניאל מעצבי שיער, 04-855-5544', 'Call Daniel Hair Stylists, 04-855-5544');
    $$('.rc').forEach(function (b) { var im = $('img', b); b.setAttribute('aria-label', (l === 'he' ? 'פתיחה במסך מלא: ' : 'Open full screen: ') + im.alt); });
    $$('[data-pair]').forEach(function (b) { b.setAttribute('aria-label', b.dataset[l]); });
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dn-lang', l); } catch (e) {}
    texts(l); hours(); buildDays(); write(true); split(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('dn2-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.card,.fan').forEach(function (el) { el.classList.add('in'); });
    $('[data-fan]').classList.add('dealt');
    if (!on) resetAll(); else { initGL(); ring.kick(); dots.kick(); }
    layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 19], 1: null, 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() {
    var o = nowParts();
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, s: +o.second, date: new Date(Date.UTC(+o.year, +o.month - 1, +o.day)) };
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
    var td = $('[data-today]');
    if (td) td.textContent = t ? (l ? 'היום ' + hhmm(t[0]) + '–' + hhmm(t[1]) : 'Today ' + hhmm(t[0]) + '–' + hhmm(t[1])) : (l ? 'היום סגור' : 'Closed today');
    $$('[data-week] li').forEach(function (li, i) { li.classList.toggle('today', i === n.d); });
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
    $('[data-week]').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) { return '<li class="' + (H[d] ? 'o' : '') + '">' + (l ? shortHe[d] : shortEn[d]) + '</li>'; }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // the clock tile: Haifa time, the hands move
  var ticks = $('[data-ticks]'), tk = '';
  for (var q = 0; q < 12; q++) { var a = q * Math.PI / 6; tk += '<line x1="' + (60 + Math.sin(a) * 46).toFixed(1) + '" y1="' + (60 - Math.cos(a) * 46).toFixed(1) + '" x2="' + (60 + Math.sin(a) * (q % 3 ? 49 : 42)).toFixed(1) + '" y2="' + (60 - Math.cos(a) * (q % 3 ? 49 : 42)).toFixed(1) + '"/>'; }
  ticks.innerHTML = tk;
  var hh = $('[data-hh]'), mh = $('[data-mh]'), sh = $('[data-sh]'), clockOn = false;
  function clock() {
    var n = now(), hr = n.h % 12, mi = (n.h * 60) % 60;
    hh.style.transform = 'rotate(' + (hr * 30).toFixed(2) + 'deg)';
    mh.style.transform = 'rotate(' + (mi * 6).toFixed(2) + 'deg)';
    sh.style.transform = 'rotate(' + (still() ? 0 : n.s * 6) + 'deg)';
    sh.style.opacity = still() ? 0 : 1;
  }
  clock();
  watch($('.t-clock'), function (v) { clockOn = v; });
  setInterval(function () { if (clockOn) clock(); }, 1000);

  // ---------------------------------------------------------------- the appointment card: treatment, a window for the day, the time, a name
  var PARTS = [[9, 12, 'בוקר', 'Morning', 'בבוקר', 'in the morning'], [12, 15, 'צהריים', 'Midday', 'בצהריים', 'around midday'], [15, 19, 'אחה״צ', 'Afternoon', 'אחר הצהריים', 'in the afternoon']];
  var WIN = '<svg viewBox="0 0 50 80" preserveAspectRatio="none" aria-hidden="true"><path class="w-frame" d="M3 78V26A22 22 0 0 1 47 26V78Z"/><path class="w-bars" d="M25 4.5V78M3 44H47"/><path class="w-led" pathLength="1" d="M3 78V26A22 22 0 0 1 47 26V78Z"/></svg>';
  var days = [], pick = { day: null, time: null }, touched = 0;
  function buildDays() {
    var l = he(), n = window.__now || now(), d0 = n.date || new Date();
    days = [];
    for (var i = 0; i < 10 && days.length < 6; i++) {
      var dow = (n.d + i) % 7, t = H[dow]; if (!t) continue;
      var dt = new Date(d0.getTime() + i * 864e5);
      days.push({ dow: dow, dd: dt.getUTCDate(), mm: dt.getUTCMonth() + 1, i: i, over: i === 0 && n.h >= t[1] - 0.75 });
    }
    $('[data-days]').innerHTML = days.map(function (d, k) {
      var name = d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tmrw') : (l ? 'יום ' + shortHe[d.dow] : shortEn[d.dow]);
      var lab = (d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tomorrow') : (l ? 'יום ' + dayHe[d.dow] : dayEn[d.dow])) + ' ' + d.dd + '.' + d.mm;
      return '<label><input type="radio" name="day" value="' + k + '"' + (d.over ? ' disabled' : '') + (pick.day === k && !d.over ? ' checked' : '') + ' aria-label="' + lab + '"><span class="win">' + WIN + '<span>' + name + '<small>' + d.dd + '.' + d.mm + '</small></span></span></label>';
    }).join('');
    if (pick.day != null && (!days[pick.day] || days[pick.day].over)) pick.day = null;
    buildTimes();
  }
  function buildTimes() {
    var l = he(), n = window.__now || now(), d = pick.day != null ? days[pick.day] : null;
    $('[data-times]').innerHTML = PARTS.map(function (s, k) {
      var t = d ? H[d.dow] : null;
      var off = (d && d.i === 0 && n.h >= s[1] - 0.5) || (t && s[0] >= t[1]);
      if (off && pick.time === k) pick.time = null;
      var end = t ? Math.min(s[1], t[1]) : s[1];
      return '<label><input type="radio" name="time" value="' + k + '"' + (off ? ' disabled' : '') + (pick.time === k ? ' checked' : '') + '><span>' + (l ? s[2] : s[3]) + '<small dir="ltr">' + hhmm(s[0]) + '–' + hhmm(end) + '</small></span></label>';
    }).join('');
  }
  var T = {
    he: { hi: 'שלום, ', svc: { cut: 'אני רוצה לקבוע תור לתספורת', open: 'אני רוצה לקבוע תור לפתיחת תלתלים', build: 'אני רוצה לקבוע תור לבניית תלתלים', color: 'אני רוצה לקבוע תור לצבע או לגוונים', advice: 'אני רוצה לקבוע ייעוץ תלתלים' },
      today: ' היום', tmrw: ' מחר', on: ' ביום ', name: ' קוראים לי ', ask: ' יש מקום?', any: ' מתי יש מקום?' },
    en: { hi: 'Hi, ', svc: { cut: 'I’d like to book a haircut', open: 'I’d like to book curl loosening', build: 'I’d like to book curl building', color: 'I’d like to book colour or highlights', advice: 'I’d like to book a curl consultation' },
      today: ' today', tmrw: ' tomorrow', on: ' on ', name: ' My name is ', ask: ' Is there a free slot?', any: ' When is there a free slot?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), nm = $('[name=nm]');
  function message() {
    var l = root.lang === 'en' ? 'en' : 'he', t = T[l], fd = new FormData(form), svc = fd.get('svc') || 'cut';
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var m = t.hi + t.svc[svc], d = pick.day != null ? days[pick.day] : null, s = pick.time != null ? PARTS[pick.time] : null;
    if (d) m += d.i === 0 ? t.today : d.i === 1 ? t.tmrw : t.on + (l === 'he' ? dayHe[d.dow] : dayEn[d.dow]) + ' ' + d.dd + '.' + d.mm;
    if (s) m += ' ' + (l === 'he' ? s[4] : s[5]);
    m += '.';
    if (name) m += t.name + name + '.';
    return m + (d || s ? t.ask : t.any);
  }
  var typeT = 0, lastM = '';
  function write(instant) { type(message(), instant); }
  function type(m, instant) {
    clearInterval(typeT);
    if (instant || still() || !lastM) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m;
    var i = keep;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'svc') touched = Math.max(touched, 1);
    if (e.target.name === 'day') { pick.day = +e.target.value; buildTimes(); touched = Math.max(touched, 2); }
    if (e.target.name === 'time') { pick.time = +e.target.value; touched = Math.max(touched, 2); }
    write(); tick();
  });
  nm.addEventListener('input', function () { write(true); });
  ['pointerenter', 'focus'].forEach(function (ev) { $('[data-send]').addEventListener(ev, function () { touched = 3; tick(); }); });
  window.__message = message;

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, footer').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = hasIO ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.matches('[data-fan]')) e.target.classList.add('dealt'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],.card,[data-fan]').forEach(function (el) { rio && !still() ? rio.observe(el) : (el.classList.add('in'), el.matches('[data-fan]') && el.classList.add('dealt')); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  var splitSrc = $$('[data-split] .ln > span[lang]').map(function (sp) { return [sp, sp.textContent]; });
  function split() {
    var i = 0;
    splitSrc.forEach(function (p) {
      var sp = p[0];
      sp.innerHTML = p[1].split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split();

  // ---------------------------------------------------------------- glyph decode: labels settle out of scrambled letters
  var POOL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPRSTUVWYZabcdefghiklmnoprstuy' };
  function decode(el) {
    if (!el || still()) return;
    var full = el.dataset.full || el.textContent; el.dataset.full = full;
    var pool = /[֐-׿]/.test(full) ? POOL.he : POOL.en, t0 = performance.now(), D = 520 + full.length * 14;
    cancelAnimationFrame(el._dr);
    (function st(t) {
      var u = clamp((t - t0) / D, 0, 1), k = Math.floor(u * full.length), out = '';
      for (var i = 0; i < full.length; i++) out += i < k || full[i] === ' ' || full[i] === ',' ? full[i] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out;
      if (u < 1) el._dr = requestAnimationFrame(st); else el.textContent = full;
    })(t0);
  }

  // ---------------------------------------------------------------- nav: a bar that gathers into a pill; where you are
  var nav = $('[data-nav]'), concept = $('.concept'), links = $$('.links a');
  if (hasIO) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['curls', 'ba', 'brothers', 'book', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the sign on phones: once the page's own call buttons are out of sight
  var sign = $('[data-sign]'), seen = new Set();
  if (hasIO) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); tick(); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- THE HOUSE LIGHTS UP
  // house-off.jpg (dusk, tubes dark) and house-on.jpg (the real night photo). house-t.png per pixel: R = how far along the
  // light line its nearest light sits, G = how much that light reaches it, B = the tube itself. The shader shows the lit
  // photo where the line has passed, a bright head where it is passing, the whole house at the end; and a soft torch
  // wherever the hand points (a tap on a phone), lighting the real lamps and stone under it.
  var stage = $('[data-stage]'), camEl = $('[data-cam]'), world = $('[data-world]'), cv = $('[data-gl]'), litImg = $('[data-lit]'),
      copy = $('[data-copy]'), place = $('[data-place]'), hint = $('[data-hint]');
  var R = 2000 / 1180, SIGN = { x: 0.707, y: 0.70 };
  var vw = 0, vh = 0, sTop = 0, sH = 0, G = {}, lastKey = '';
  var gl = null, prog = null, uni = {}, glReady = false, glTried = false, intro = 0, introStart = 0, lastF = 0, lastG = 0;
  var torch = { x: .5, y: .5, a: 0, to: 0, tap: 0, raf: 0, moved: false };
  var VS = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
  var FS = 'precision mediump float;varying vec2 v;uniform sampler2D on,off,tm;uniform float f,g,ta,ar;uniform vec2 tp;' +
    'void main(){vec4 T=texture2D(tm,v);float lit=smoothstep(f+.03,f-.01,T.r)*step(.002,f);' +
    'float head=exp(-pow((T.r-f)/.012,2.))*step(.002,f)*(1.-step(.95,f));' +
    'vec2 d=(v-tp)*vec2(ar,1.);float sp=ta*(1.-smoothstep(.03,.27,length(d)));' +
    'vec3 a=texture2D(off,v).rgb,b=texture2D(on,v).rgb;float m=max(max(T.g*lit,g),sp*.92);' +
    'vec3 c=mix(a,b,m)+vec3(1.,.9,.7)*head*T.g*.85+vec3(.10,.06,.05)*sp;gl_FragColor=vec4(c,1.);}';
  function initGL() {
    if (glTried || still()) return; glTried = true;
    try { gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true }); } catch (e) { gl = null; }
    if (!gl) return;
    var sh = function (t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return; }
    gl.useProgram(prog);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['on', 'off', 'tm', 'f', 'g', 'ta', 'ar', 'tp'].forEach(function (n) { uni[n] = gl.getUniformLocation(prog, n); });
    gl.uniform1f(uni.ar, R);
    var srcs = ['img/house-on.jpg', 'img/house-off.jpg', 'img/house-t.png'], left = 3;
    srcs.forEach(function (src, k) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () {
        if (!gl) return;
        var tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + k); gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(uni[['on', 'off', 'tm'][k]], k);
        if (--left === 0) { glReady = true; sizeGL(); stage.classList.add('gl-on'); introStart = performance.now(); requestAnimationFrame(introStep); window.__glReady = true; }
      };
      im.onerror = function () { gl = null; };
      im.src = src;
    });
  }
  // on arrival the first stretch of the line lights by itself, so the house is never only dark
  var INTRO = 0.34, INTRO_MS = 1900;
  function introStep(ts) {
    var u = clamp((ts - introStart) / INTRO_MS, 0, 1);
    intro = INTRO * (1 - Math.pow(1 - u, 3));
    lastKey = ''; tick();
    if (u < 1 && !still()) requestAnimationFrame(introStep);
    else if (!torch.moved && hint) { hint.classList.add('on'); }
  }
  function sizeGL() {
    if (!gl) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(Math.min(G.W * dpr, 2000)), h = Math.round(w / R);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
  }
  function drawGL(f, g) {
    lastF = f; lastG = g;
    if (!gl || !glReady) return;
    gl.uniform1f(uni.f, f); gl.uniform1f(uni.g, g);
    gl.uniform1f(uni.ta, torch.a); gl.uniform2f(uni.tp, torch.x, torch.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  // the torch eases toward the hand; a tap lights for a moment and fades
  function torchStep() {
    torch.raf = 0;
    var target = torch.to;
    if (torch.tap) { var u = (performance.now() - torch.tap) / 1600; target = u < 1 ? 1 - smooth(u) : 0; if (u >= 1) torch.tap = 0; }
    torch.a += (target - torch.a) * 0.14;
    drawGL(lastF, lastG);
    if (Math.abs(target - torch.a) > 0.002 || torch.tap) torch.raf = requestAnimationFrame(torchStep);
  }
  function torchAt(e) {
    var r = cv.getBoundingClientRect(); if (!r.width) return;
    torch.x = (e.clientX - r.left) / r.width; torch.y = (e.clientY - r.top) / r.height;
  }
  var pinEl = $('[data-pin]'); window.__torch = torch;
  pinEl.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    torchAt(e); torch.to = 1; torch.moved = true; if (hint) hint.classList.remove('on');
    if (!torch.raf) torch.raf = requestAnimationFrame(torchStep);
  });
  pinEl.addEventListener('pointerleave', function () { torch.to = 0; if (!torch.raf) torch.raf = requestAnimationFrame(torchStep); });
  pinEl.addEventListener('pointerdown', function (e) {
    if (still() || e.pointerType === 'mouse' || e.target.closest('a,button')) return;
    torchAt(e); torch.tap = performance.now(); if (!torch.raf) torch.raf = requestAnimationFrame(torchStep);
  });
  function placeWorld() {
    var portrait = vw / vh < 0.9, W, Hh, ox, oy;
    if (portrait) { W = vw * 1.75; Hh = W / R; ox = clamp(vw * 0.5 - 0.5 * W, vw - W, 0); oy = Math.max(84, vh * 0.1); }
    else { W = Math.max(vw, vh * R); Hh = W / R; ox = clamp(vw / 2 - 0.56 * W, vw - W, 0); oy = clamp(vh * 0.4 - 0.4 * Hh, vh - Hh, 0); }
    G = { W: W, H: Hh, ox: ox, oy: oy, portrait: portrait, sx: ox + SIGN.x * W, sy: oy + SIGN.y * Hh };
    world.style.left = ox + 'px'; world.style.top = oy + 'px'; world.style.width = W + 'px'; world.style.height = Hh + 'px';
    sizeGL();
  }
  function paint(s) {
    var pS = s > 0 ? INTRO + (1 - INTRO) * clamp(s / 0.5, 0, 1) : 0;
    var p = Math.max(intro, pS), f = p * 0.95, g = smooth((s - 0.5) / 0.12);
    if (gl && glReady) drawGL(f, g);
    else if (!still()) litImg.style.opacity = smooth(p).toFixed(3);
    var c = smooth((s - 0.36) / 0.64), z = 1 + (G.portrait ? 0.45 : 0.3) * c;
    var cx = G.portrait ? vw * 0.5 : vw * 0.62, cy = vh * 0.42;
    var tx = G.sx + (cx - G.sx) * c - G.sx * z, ty = G.sy + (cy - G.sy) * c - G.sy * z;
    camEl.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + z.toFixed(4) + ')';
    var o = 1 - smooth((s - 0.3) / 0.12);
    copy.style.opacity = o.toFixed(3); copy.style.transform = 'translate3d(0,' + (-28 * (1 - o)).toFixed(1) + 'px,0)';
    copy.style.visibility = o < 0.01 ? 'hidden' : '';
    var po = smooth((s - 0.48) / 0.12);
    place.style.opacity = po.toFixed(3); place.style.visibility = po > 0.01 ? 'visible' : 'hidden';
    place.style.transform = 'translate3d(0,' + (22 * (1 - po)).toFixed(1) + 'px,0)';
  }
  window.__paint = function (s) { paint(s); };

  // ---------------------------------------------------------------- the arc of their photos: dealt in, turns by itself, with the scroll and with a drag
  var work = $('[data-work]'), horizon = $('.horizon');
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.tabIndex = -1; el.appendChild(k); });   // twenty cards make a wide, gentle arc
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, moved = 0, lx = 0, raf = 0, vis = false, last = 0, deal = 0, dealT = 0;
    function R() { var cw = cards[0].offsetWidth || 180; return cw * 1.12 / (2 * Math.tan(Math.PI / N)); }
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (dealT) deal = easeOut((t - dealT) / 1500);
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      el.style.transform = 'translateZ(' + (-r).toFixed(1) + 'px) rotateX(-5deg)';
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step * deal, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        var rr = lerp(r * .2, r, deal);
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (rr + lift * 40).toFixed(1) + 'px) translateY(' + ((1 - deal) * (60 + i * 6)).toFixed(1) + 'px) scale(' + (1 + lift * .07).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.32 + .68 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; moved = 0; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); rot += dx * .22; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(work, function (v) { vis = v; if (v && !dealT) dealT = performance.now(); if (v) kick(); });
    return { kick: kick, dragged: function () { return moved > 8; } };
  })();

  // a card opens to full screen from where it stands, and folds back
  var lb = $('[data-lb]'), lbImg = $('[data-lb-img]'), lbFrom = null;
  function fitRect(iw, ih) { var W = innerWidth * .92, Hh = innerHeight * .86, s = Math.min(W / iw, Hh / ih); return { w: iw * s, h: ih * s, x: (innerWidth - iw * s) / 2, y: (innerHeight - ih * s) / 2 }; }
  function setBox(r) { lbImg.style.left = r.x + 'px'; lbImg.style.top = r.y + 'px'; lbImg.style.width = r.w + 'px'; lbImg.style.height = r.h + 'px'; }
  function openLB(card) {
    var img = $('img', card), r = card.getBoundingClientRect();
    lbFrom = card; lbImg.src = card.dataset.full; lbImg.alt = img.alt;
    lb.hidden = false; document.body.style.overflow = 'hidden';
    var to = fitRect(img.naturalWidth || 330, img.naturalHeight || 400), from = { x: r.left, y: r.top, w: r.width, h: r.height };
    setBox(to);
    if (!still() && lbImg.animate) {
      var sx = from.w / to.w, sy = from.h / to.h;
      lbImg.animate([{ transform: 'translate(' + (from.x - to.x) + 'px,' + (from.y - to.y) + 'px) scale(' + sx + ',' + sy + ')', transformOrigin: '0 0' }, { transform: 'none', transformOrigin: '0 0' }], { duration: 560, easing: 'cubic-bezier(.23,1,.32,1)' });
      lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    }
    $('[data-lb-x]').focus({ preventScroll: true });
  }
  function closeLB() {
    if (lb.hidden) return;
    var done = function () { lb.hidden = true; document.body.style.overflow = ''; if (lbFrom) lbFrom.focus({ preventScroll: true }); };
    if (still() || !lb.animate) { done(); return; }
    lb.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out' }).onfinish = done;
  }
  $$('.rc').forEach(function (c) { c.addEventListener('click', function (e) { if (ring.dragged()) { e.preventDefault(); return; } openLB(c); }); });
  lb.addEventListener('click', closeLB);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLB(); });

  // ---------------------------------------------------------------- curls: the services step, the light slides down the hair
  var curls = $('[data-curls]'), cPin = $('.c-pin'), cItems = $$('[data-c-list] li'), cPhoto = $('[data-c-photo]'), cDots = $('[data-c-dots]'), cTop = 0, cH = 0, lastC = -1;
  cDots.innerHTML = cItems.map(function () { return '<i></i>'; }).join('');
  var cDot = $$('i', cDots);
  function paintCurls(q) {
    var k = Math.min(cItems.length - 1, Math.floor(q * cItems.length));
    if (k !== lastC) {
      cItems.forEach(function (li, i) { li.classList.toggle('on', i === k); cDot[i].classList.toggle('on', i === k); });
      if (lastC >= 0) decode($('[lang="' + root.lang + '"]', cItems[k]));
      lastC = k;
    }
    cPhoto.style.setProperty('--gy', lerp(-45, 150, q).toFixed(2) + '%');
    cPhoto.style.setProperty('--cz', lerp(1.1, 1, q).toFixed(4));
  }
  window.__curls = paintCurls;

  // ---------------------------------------------------------------- before / after: the comb, the fan of clients, the sweep on scroll
  var baSec = $('[data-ba-sec]'), ba = $('[data-ba]'), range = $('[data-ba-range]'), aImg = $('[data-after]'), bImg = $('[data-before]'), fan = $('[data-fan]');
  var teeth = $('.comb-teeth'), tp = '';
  for (var ti = 0; ti < 18; ti++) { var y = 16 + ti * 10.8; tp += '<path d="M10.5 ' + y.toFixed(1) + 'H-5a2.2 2.2 0 0 0 0 4.4H10.5z"/>'; }
  teeth.innerHTML = tp;
  var ALT = {
    stone: [['לפני: תלתלים צפופים ויבשים', 'Before: tight, dry curls'], ['אחרי: תלתלים ארוכים מול קיר האבן', 'After: long curls by the stone wall']],
    gingy: [['לפני: שיער מקורזל ונפוח', 'Before: frizzy, puffy hair'], ['אחרי: תלתלים מוגדרים בגוון נחושת', 'After: defined copper-toned curls']],
    hanan: [['לפני: שיער יבש ומקורזל', 'Before: dry, frizzy hair'], ['אחרי: תלתלים מוגדרים וארוכים', 'After: long, defined curls']],
    galit: [['לפני: תלתלים צפופים ונפוחים', 'Before: tight, voluminous curls'], ['אחרי: תלתלים ארוכים ומסודרים', 'After: longer, settled curls']],
    open: [['לפני: תלתלים צפופים ונפוחים', 'Before: tight, puffy curls'], ['אחרי: תלתלים רכים ופתוחים יותר', 'After: softer, looser curls']]
  };
  var bx = 50, userBA = false;
  function setX(x) { x = clamp(x, 0, 100); bx = x; ba.style.setProperty('--x', x.toFixed(2) + '%'); range.value = Math.round(x); }
  var bdrag = false;
  function fromEvent(e) { var r = ba.getBoundingClientRect(); setX((e.clientX - r.left) / r.width * 100); }
  ba.addEventListener('pointerdown', function (e) { bdrag = true; userBA = true; try { ba.setPointerCapture(e.pointerId); } catch (x) {} fromEvent(e); });
  ba.addEventListener('pointermove', function (e) { if (bdrag) fromEvent(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { ba.addEventListener(t, function () { bdrag = false; }); });
  range.addEventListener('input', function () { userBA = true; setX(+range.value); });
  $$('[data-pair]').forEach(function (b, i) {
    b.style.setProperty('--i', i); b.style.setProperty('--rot', ((i - 2) * 5) + 'deg');
    b.addEventListener('click', function () {
      $$('[data-pair]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var p = b.dataset.pair, al = ALT[p];
      var swap = function () {
        aImg.src = 'img/ba-' + p + '-after.jpg'; bImg.src = 'img/ba-' + p + '-before.jpg';
        bImg.dataset.altHe = al[0][0]; bImg.dataset.altEn = al[0][1]; aImg.dataset.altHe = al[1][0]; aImg.dataset.altEn = al[1][1];
        bImg.alt = al[0][he() ? 0 : 1]; aImg.alt = al[1][he() ? 0 : 1];
        $('[data-ba-cap]').innerHTML = p === 'open' ? '<span lang="he">פתיחת תלתלים · מהאתר של דניאל</span><span lang="en">Curl loosening · from Daniel’s website</span>' : '<span lang="he">בניית תלתלים · מהאתר של דניאל</span><span lang="en">Curl building · from Daniel’s website</span>';
      };
      if (still() || !ba.animate) { swap(); setX(50); return; }
      ba.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 160, easing: 'cubic-bezier(.4,0,1,1)' }).onfinish = function () {
        swap();
        var t0 = performance.now(), from = 92;
        (function st(t) { var u = easeOut((t - t0) / 900); setX(lerp(from, 50, u)); if (u < 1 && !bdrag) requestAnimationFrame(st); })(t0);
        ba.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.23,1,.32,1)' });
      };
      userBA = true;
    });
  });
  fan.style.setProperty('--dirx', rtl() ? -1 : 1);

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (hasIO) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); var lab = o.parentNode.querySelector('[data-decode] [lang="' + root.lang + '"]'); if (lab) setTimeout(function () { decode(lab); }, 200); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the brothers lean toward the hand
  $$('[data-tilt]').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.setProperty('--ty', (x * 14).toFixed(2) + 'deg'); c.style.setProperty('--tx', (-y * 14).toFixed(2) + 'deg'); });
    c.addEventListener('pointerleave', function () { c.style.setProperty('--ty', '0deg'); c.style.setProperty('--tx', '0deg'); });
  });

  // ---------------------------------------------------------------- bento: a light under the hand, photos that drift with it
  $$('.tile').forEach(function (t) {
    var ph = $('.t-ph', t);
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px');
      if (ph && !still() && !t.classList.contains('t-chairs')) { ph.style.setProperty('--px', ((x / r.width - .5) * -18).toFixed(1) + 'px'); ph.style.setProperty('--py', ((y / r.height - .5) * -14).toFixed(1) + 'px'); }
    });
    t.addEventListener('pointerleave', function () { if (ph) { ph.style.setProperty('--px', '0px'); ph.style.setProperty('--py', '0px'); } });
  });
  // the walk from the station: the route lights and the walker moves along it as the tile crosses the screen
  var walkT = $('.t-walk'), route = $('.walk .route-lit'), walker = $('[data-walker]'), routeLen = 0;
  try { routeLen = route.getTotalLength(); } catch (e) { routeLen = 0; }
  function paintWalk(p) {
    route.style.setProperty('--wo', (1 - p).toFixed(4));
    if (routeLen) { var pt = route.getPointAtLength(routeLen * p); walker.setAttribute('cx', pt.x.toFixed(1)); walker.setAttribute('cy', pt.y.toFixed(1)); }
  }

  // the HAIR BEAUTY logo's drop of dots, grown large: the dots breathe and step aside from the hand
  var dots = (function () {
    var tile = $('.t-logo'), cvs = $('[data-dots]'), c = cvs.getContext('2d'), img = $('[data-hb]'), P = [], w = 0, h = 0, raf = 0, vis = false, mx = -999, my = -999, ok = false, t0 = 0;
    function sample() {
      try {
        var sc = document.createElement('canvas'), sw = 40, shh = 56; sc.width = sw; sc.height = shh;
        var x = sc.getContext('2d'); x.drawImage(img, 156, 58, sw, shh, 0, 0, sw, shh);
        var d = x.getImageData(0, 0, sw, shh).data; P = [];
        for (var yy = 0; yy < shh; yy++) for (var xx = 0; xx < sw; xx++) { var a = d[(yy * sw + xx) * 4 + 3]; if (a > 70 && (xx + yy) % 2 === 0) P.push({ hx: xx / sw, hy: yy / shh, x: 0, y: 0, vx: 0, vy: 0, ph: Math.random() * 6.28, s: .7 + a / 255 }); }
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = tile.clientWidth; h = tile.clientHeight; cvs.width = w * dpr; cvs.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.x = 0; p.y = 0; }); }
    function frame(t) {
      raf = 0; if (!ok || !w) return;
      var T = (t - t0) / 1000, calm = still(), bh = h * .44, bw = bh * 40 / 56, ox = (w - bw) / 2, oy = h * .06;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = ox + p.hx * bw + (calm ? 0 : Math.sin(T * 1.1 + p.ph) * 2.2), ty = oy + p.hy * bh + (calm ? 0 : Math.cos(T * .9 + p.ph) * 2.2);
        if (calm || !p.x) { p.x = tx; p.y = ty; }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 6400) { var f = (6400 - d2) / 6400 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        c.globalAlpha = .22 + .2 * (p.s - .7);
        c.fillStyle = i % 5 ? '#867364' : '#c48a84';
        c.beginPath(); c.arc(p.x, p.y, 2.6 * p.s, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function start() { sample(); size(); t0 = performance.now(); kick(); }
    tile.addEventListener('pointermove', function (e) { var r = tile.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    tile.addEventListener('pointerleave', function () { mx = my = -999; });
    tile.addEventListener('pointerdown', function (e) { var r = tile.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 700); });
    watch(tile, function (v) { vis = v; if (v) kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- reviews: two drifting rows, copied once so the loop is seamless
  $$('[data-row]').forEach(function (r) { $$('.rv', r).forEach(function (b) { var k = b.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.dataset.clone = ''; r.appendChild(k); }); });

  // ---------------------------------------------------------------- the footer: the house's own light line, the name rising letter by letter
  var outline = $('[data-outline]'), octx = outline.getContext('2d'), OL = null, olLast = -1;
  (function () {
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = 532; c.height = 344;
      var x = c.getContext('2d'); x.drawImage(im, 244, 98, 532, 344, 0, 0, 532, 344);
      var d = x.getImageData(0, 0, 532, 344).data, idx = [], tt = [], gg = [];
      for (var i = 0; i < d.length; i += 4) if (d[i + 1] > 40) { idx.push(i); tt.push(d[i] / 255); gg.push(d[i + 2] > 0 ? 1 : (d[i + 1] / 255) * 0.35); }
      OL = { idx: idx, t: tt, g: gg, img: octx.createImageData(532, 344) };
      drawOutline(still() ? 1 : 0);
    };
    im.src = 'img/house-t.png';
  })();
  function drawOutline(p) {
    if (!OL || Math.abs(p - olLast) < 0.002) return; olLast = p;
    var b = OL.img.data, f = p * 0.95; b.fill(0);
    for (var k = 0; k < OL.idx.length; k++) {
      if (OL.t[k] > f) continue;
      var i = OL.idx[k], a = OL.g[k]; b[i] = 244; b[i + 1] = 210; b[i + 2] = 159; b[i + 3] = Math.round(a * 255);
    }
    octx.putImageData(OL.img, 0, 0);
  }
  var fword = $('[data-fword]'), fglow = $('.f-glow');
  fword.innerHTML = fword.textContent.split('').map(function (c) { return '<span class="fl">' + c + '</span>'; }).join('');
  var fls = $$('.fl', fword);

  // ---------------------------------------------------------------- visit: the night photo shrinks into its frame
  var vpin = $('[data-vpin]'), vphoto = $('[data-vphoto]'), vslot = $('[data-vslot]'), vcards = $('[data-vcards]');

  function resetAll() {
    [camEl, copy, place, litImg].forEach(function (e) { e.style.transform = ''; e.style.opacity = ''; e.style.visibility = ''; });
    cPhoto.style.removeProperty('--gy'); cPhoto.style.removeProperty('--cz');
    cItems.forEach(function (li) { li.classList.remove('on'); });
    $$('[data-c-list] [lang]').forEach(function (s) { if (s.dataset.full) s.textContent = s.dataset.full; });
    olLast = -1; drawOutline(1);
    fls.forEach(function (l) { l.style.removeProperty('--ly'); l.style.removeProperty('--lo'); });
    cPin.style.removeProperty('--cr'); work.style.transform = ''; work.style.filter = '';
    baSec.style.removeProperty('--ci'); baSec.style.removeProperty('--cr2');
    ['--vo', '--vy', '--capo', '--vz'].forEach(function (k) { vpin.style.removeProperty(k); vphoto.style.removeProperty(k); });
    paintWalk(1); torch.a = 0; torch.to = 0;
    lastKey = ''; lastC = -1;
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var lastY = 0, ticking = false, book = $('#book'), stepEls = $$('[data-step]'), foot = $('[data-foot]'), page = $('#main');
  function progOf(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function vis01(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
  function tick() {
    var y = scrollY, calm = still(), H0 = innerHeight;
    var ch = concept.offsetHeight;
    root.style.setProperty('--bt', Math.max(0, ch - y) + 'px');
    nav.classList.toggle('pill-on', y > ch + 20);
    if (Math.abs(y - lastY) > 6) { nav.classList.toggle('hide', y > lastY && y > H0 * 1.2 && !phone()); lastY = y; }
    sign.classList.toggle('away', seen.size > 0 || y < H0 * 0.6);
    // the booking steps light as you read down, or as you use the card
    var bk = book.getBoundingClientRect(), bp = clamp((H0 * .8 - bk.top) / (bk.height * .7), 0, 1);
    stepEls.forEach(function (s, i) { s.classList.toggle('on', calm || bp > .12 + i * .26 || touched > i); });
    // the vist cards and photo: final frame (also with motion off)
    placeVisit(calm, H0);
    if (calm) return;
    var s = clamp((y - sTop) / Math.max(1, sH - vh), 0, 1), key = s.toFixed(4) + '|' + intro.toFixed(4);
    if (key !== lastKey) { lastKey = key; paint(s); }
    // the arc settles back as the curls panel rides over it
    var cr = curls.getBoundingClientRect(), over = clamp(1 - cr.top / H0, 0, 1);
    cPin.style.setProperty('--cr', (lerp(36, 0, smooth(over))).toFixed(1) + 'px');
    if (over > 0 && over < 1.01) { work.style.transform = 'scale(' + (1 - .06 * smooth(over)).toFixed(4) + ')'; work.style.filter = 'brightness(' + (1 - .5 * smooth(over)).toFixed(3) + ')'; }
    else if (over <= 0) { work.style.transform = ''; work.style.filter = ''; }
    var hz = work.getBoundingClientRect(); horizon.style.setProperty('--hz', (clamp(hz.top / H0, -1, 1) * 120).toFixed(1) + 'px');
    if (y + vh > cTop && y < cTop + cH) paintCurls(clamp((y - cTop) / Math.max(1, cH - vh), 0, 1));
    // the blush page opens out of the plum, from a rounded frame to the full width
    var br = baSec.getBoundingClientRect(), bo = smooth(1 - (br.top - H0 * .1) / (H0 * .8));
    baSec.style.setProperty('--ci', (lerp(phone() ? 0 : Math.min(innerWidth * .08, 90), 0, bo)).toFixed(1) + 'px');
    baSec.style.setProperty('--cr2', (lerp(48, 0, bo)).toFixed(1) + 'px');
    // the comb sweeps from before to after as the frame crosses the screen (until you take it)
    if (!userBA) { var fr = ba.getBoundingClientRect(), fp = clamp((H0 * .85 - fr.top) / (H0 * .75), 0, 1); setX(lerp(96, 12, smooth(fp))); }
    // walk
    paintWalk(smooth((vis01(walkT) - .15) / .5));
    // footer: the light line runs, the name rises, the horizon lifts
    var fh = foot.offsetHeight, fp;
    if (foot.classList.contains('flat')) { var fr2 = foot.getBoundingClientRect(); fp = clamp((H0 - fr2.top) / Math.min(fh, H0 * .9), 0, 1); }
    else fp = clamp((H0 - page.getBoundingClientRect().bottom) / fh, 0, 1);
    drawOutline(smooth(fp / .8));
    fls.forEach(function (l, i) { var u = smooth((fp - .2 - i * .07) / .4); l.style.setProperty('--ly', ((1 - u) * .6).toFixed(3) + 'em'); l.style.setProperty('--lo', u.toFixed(3)); });
    fglow.style.setProperty('--rise', ((1 - smooth(fp)) * 160).toFixed(1) + 'px');
  }
  function placeVisit(calm, H0) {
    var desk = innerWidth > 900;
    if (desk) {
      var host = vphoto.offsetParent || vpin, hr = host.getBoundingClientRect(), sr = vslot.getBoundingClientRect();
      var T0 = sr.top - hr.top, L0 = sr.left - hr.left, R0 = hr.right - sr.right, B0 = hr.bottom - sr.bottom;
      var u = calm ? 1 : smooth((progOf(vpin) - .05) / .5);
      vphoto.style.setProperty('--ct', (T0 * u).toFixed(1) + 'px'); vphoto.style.setProperty('--cb', (B0 * u).toFixed(1) + 'px');
      vphoto.style.setProperty('--cl', (L0 * u).toFixed(1) + 'px'); vphoto.style.setProperty('--cr3', (R0 * u).toFixed(1) + 'px');
      vphoto.style.setProperty('--crr', (24 * u).toFixed(1) + 'px'); vphoto.style.setProperty('--vz', (1.12 - .12 * u).toFixed(4));
      vphoto.style.setProperty('--capo', smooth((u - .85) / .15).toFixed(3));
      var cu = calm ? 1 : smooth((u - .55) / .4);
      vcards.style.setProperty('--vo', cu.toFixed(3)); vcards.style.setProperty('--vy', ((1 - cu) * 30).toFixed(1) + 'px');
    } else {
      var r = vphoto.getBoundingClientRect(), pu = calm ? 1 : smooth((H0 * .95 - r.top) / (H0 * .55)), mpx = Math.max(16, Math.min(64, innerWidth * .04));
      vphoto.style.setProperty('--ci2', (pu * mpx).toFixed(1) + 'px');
      vphoto.style.setProperty('--cr4', (pu * 24).toFixed(1) + 'px');
      vphoto.style.setProperty('--vz', (1.18 - .18 * pu).toFixed(4));
    }
  }
  function layout() {
    vw = root.clientWidth; vh = innerHeight;
    root.style.setProperty('--bh', nav.offsetHeight + 'px');
    // the arc stays put once its foot reaches the bottom of the screen, so the curls panel can ride up over it
    work.style.top = Math.min(0, innerHeight - work.offsetHeight) + 'px';
    // the footer is uncovered like a curtain only when it fits on the screen
    foot.classList.toggle('flat', foot.offsetHeight > innerHeight - 10);
    sTop = stage.getBoundingClientRect().top + scrollY; sH = stage.offsetHeight;
    cTop = curls.getBoundingClientRect().top + scrollY; cH = curls.offsetHeight;
    if (!still()) placeWorld();
    dots.size();
    fan.style.setProperty('--dirx', rtl() ? -1 : 1);
    lastKey = ''; lastC = -1;
    tick();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = root.clientWidth; layout(); } else { vh = innerHeight; tick(); } }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  texts(root.lang === 'en' ? 'en' : 'he');
  hours(); buildDays(); write(true);
  if (still()) paintWalk(1);
  lastW = root.clientWidth;
  layout();
  initGL();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { stage.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  window.__stage = { layout: layout, tick: tick };
})();
