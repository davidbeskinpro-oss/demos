(function () {
  var root = document.documentElement, WA = '97248555544';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'דניאל מעצבי שיער · מומחים לתלתלים · שדרות בן גוריון 30, חיפה', en: 'Daniel Hair Stylists · Curl specialists · 30 Ben Gurion Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור דניאל מעצבי שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Daniel Hair Stylists · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-bar]', 'ראשי', 'Main');
    aria('.mark', 'דניאל מעצבי שיער, לראש העמוד', 'Daniel Hair Stylists, back to top');
    aria('[data-s-call]', 'התקשרו לדניאל מעצבי שיער, 04-855-5544', 'Call Daniel Hair Stylists, 04-855-5544');
    aria('[data-s-wa]', 'וואטסאפ לדניאל מעצבי שיער', 'WhatsApp Daniel Hair Stylists');
    aria('[data-ba-tabs]', 'זוג תמונות', 'Photo pair');
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dn-lang', l); } catch (e) {}
    texts(l); hours(); buildDays(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#ba'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('dn-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (!on) resetAll(); else initGL();
    layout();
    if (keep < innerHeight) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 19], 1: null, 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: null };
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

  // ---------------------------------------------------------------- the composer: treatment, a window for the day, the time, a name
  var PARTS = [[9, 12, 'בוקר', 'Morning', 'בבוקר', 'in the morning'], [12, 15, 'צהריים', 'Midday', 'בצהריים', 'around midday'], [15, 19, 'אחה״צ', 'Afternoon', 'אחר הצהריים', 'in the afternoon']];
  var WIN = '<svg viewBox="0 0 50 80" preserveAspectRatio="none" aria-hidden="true"><path class="w-frame" d="M3 78V26A22 22 0 0 1 47 26V78Z"/><path class="w-bars" d="M25 4.5V78M3 44H47"/><path class="w-led" pathLength="1" d="M3 78V26A22 22 0 0 1 47 26V78Z"/></svg>';
  var days = [], pick = { day: null, time: null };
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
    he: { hi: 'שלום, הגעתי דרך האתר. ', svc: { cut: 'אשמח לקבוע תור לתספורת', open: 'אשמח לקבוע תור לפתיחת תלתלים', build: 'אשמח לקבוע תור לבניית תלתלים', color: 'אשמח לקבוע תור לצבע או לגוונים', advice: 'אשמח לקבוע ייעוץ תלתלים', other: 'אשמח לקבוע תור' },
      other: ' אפשר לדבר על זה בטלפון?', today: ' היום', tmrw: ' מחר', on: ' ביום ', name: ' קוראים לי ', ask: ' זה מתאים?', any: ' מתי יש מקום?' },
    en: { hi: 'Hi, I found you through the website. ', svc: { cut: 'I’d like to book a haircut', open: 'I’d like to book curl loosening', build: 'I’d like to book curl building', color: 'I’d like to book colour or highlights', advice: 'I’d like to book a curl consultation', other: 'I’d like to book an appointment' },
      other: ' Could we talk about it by phone?', today: ' today', tmrw: ' tomorrow', on: ' on ', name: ' My name is ', ask: ' Does that work for you?', any: ' When do you have a free slot?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), nm = $('[name=nm]');
  function message() {
    var l = root.lang === 'en' ? 'en' : 'he', t = T[l], fd = new FormData(form), svc = fd.get('svc') || 'cut';
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var m = t.hi + t.svc[svc], d = pick.day != null ? days[pick.day] : null, s = pick.time != null ? PARTS[pick.time] : null;
    if (d) m += d.i === 0 ? t.today : d.i === 1 ? t.tmrw : t.on + (l === 'he' ? dayHe[d.dow] : dayEn[d.dow]) + ' ' + d.dd + '.' + d.mm;
    if (s) m += ' ' + (l === 'he' ? s[4] : s[5]);
    m += '.';
    if (svc === 'other') m += t.other;
    if (name) m += t.name + name + '.';
    return m + (d || s ? t.ask : t.any);
  }
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m, instant);
  }
  var typeT = 0, lastM = '';
  function type(m, instant) {
    clearInterval(typeT);
    if (instant || still() || !lastM) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m;
    var i = keep, caret = '<span class="caret"></span>';
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'day') { pick.day = +e.target.value; buildTimes(); }
    if (e.target.name === 'time') pick.time = +e.target.value;
    write();
  });
  nm.addEventListener('input', function () { write(true); });
  window.__message = message;

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header, footer').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the bar: under the concept line, then at the top; where you are
  var bar = $('[data-bar]'), links = $$('.links a'), concept = $('.concept');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['curls', 'ba', 'family', 'book', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the sign: on phones, once the page's own buttons are out of sight
  var sign = $('[data-sign]'), seen = new Set();
  if (sign && 'IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); sign.classList.toggle('away', seen.size > 0 || scrollY < innerHeight * 0.5); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- THE HOUSE LIGHTS UP
  // One photograph, lit twice: house-off.jpg (dusk, the light tubes dark) and house-on.jpg (the real night photo). house-t.png
  // holds, per pixel: R = how far along the light line its nearest light sits (0 = the lower left corner, where the two
  // points of light set off; the window frames come last), G = how much that light reaches it (the glow on the stone),
  // B = the tube itself. The shader shows the lit photo wherever the line has already passed, a small bright head where
  // it is passing now, and at the end fades the whole house up (the lamps inside, the windows).
  var stage = $('[data-stage]'), camEl = $('[data-cam]'), world = $('[data-world]'), cv = $('[data-gl]'), litImg = $('[data-lit]'),
      copy = $('[data-copy]'), place = $('[data-place]');
  var R = 2000 / 1180, SIGN = { x: 0.707, y: 0.70 };
  var vw = 0, vh = 0, sTop = 0, sH = 0, G = {}, lastKey = '';
  var gl = null, prog = null, uni = {}, glReady = false, glTried = false, intro = 0, introStart = 0;
  var VS = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
  var FS = 'precision mediump float;varying vec2 v;uniform sampler2D on,off,tm;uniform float f,g;' +
    'void main(){vec4 T=texture2D(tm,v);float lit=smoothstep(f+.03,f-.01,T.r)*step(.002,f);' +
    'float head=exp(-pow((T.r-f)/.012,2.))*step(.002,f)*(1.-step(.95,f));' +
    'vec3 a=texture2D(off,v).rgb,b=texture2D(on,v).rgb;float m=max(T.g*lit,g);' +
    'vec3 c=mix(a,b,m)+vec3(1.,.9,.7)*head*T.g*.85;gl_FragColor=vec4(c,1.);}';
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
    ['on', 'off', 'tm', 'f', 'g'].forEach(function (n) { uni[n] = gl.getUniformLocation(prog, n); });
    var srcs = ['img/house-on.jpg', 'img/house-off.jpg', 'img/house-t.png'], left = 3;
    srcs.forEach(function (src, k) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () {
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
  }
  function sizeGL() {
    if (!gl) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(Math.min(G.W * dpr, 2000)), h = Math.round(w / R);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
  }
  function drawGL(f, g) {
    if (!gl || !glReady) return;
    gl.uniform1f(uni.f, f); gl.uniform1f(uni.g, g);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function placeWorld() {
    var portrait = vw / vh < 0.9, W, Hh, ox, oy;
    if (portrait) { W = vw * 1.75; Hh = W / R; ox = clamp(vw * 0.5 - 0.5 * W, vw - W, 0); oy = Math.max(84, vh * 0.1); }
    else { W = Math.max(vw, vh * R); Hh = W / R; ox = clamp(vw / 2 - 0.56 * W, vw - W, 0); oy = clamp(vh * 0.4 - 0.4 * Hh, vh - Hh, 0); }
    G = { W: W, H: Hh, ox: ox, oy: oy, portrait: portrait, sx: ox + SIGN.x * W, sy: oy + SIGN.y * Hh };
    world.style.left = ox + 'px'; world.style.top = oy + 'px'; world.style.width = W + 'px'; world.style.height = Hh + 'px';
    sizeGL();
  }
  function paint(s) {
    // s: 0..1 along the stage's scroll run
    var pS = s > 0 ? INTRO + (1 - INTRO) * clamp(s / 0.5, 0, 1) : 0;
    var p = Math.max(intro, pS), f = p * 0.95, g = smooth((s - 0.5) / 0.12);
    if (gl && glReady) drawGL(f, g);
    else if (!still()) litImg.style.opacity = smooth(p).toFixed(3);
    // the camera walks up to the sign
    var c = smooth((s - 0.36) / 0.64), z = 1 + (G.portrait ? 0.45 : 0.3) * c;
    var cx = G.portrait ? vw * 0.5 : vw * 0.62, cy = G.portrait ? vh * 0.42 : vh * 0.42;
    var tx = G.sx + (cx - G.sx) * c - G.sx * z, ty = G.sy + (cy - G.sy) * c - G.sy * z;
    camEl.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + z.toFixed(4) + ')';
    var o = 1 - smooth((s - 0.34) / 0.12);
    copy.style.opacity = o.toFixed(3); copy.style.transform = 'translate3d(0,' + (-28 * (1 - o)).toFixed(1) + 'px,0)';
    copy.style.visibility = o < 0.01 ? 'hidden' : '';
    var po = smooth((s - 0.5) / 0.12);
    place.style.opacity = po.toFixed(3); place.style.visibility = po > 0.01 ? 'visible' : 'hidden';
    place.style.transform = 'translate3d(0,' + (22 * (1 - po)).toFixed(1) + 'px,0)';
  }
  window.__paint = function (s) { paint(s); };

  // ---------------------------------------------------------------- curls: the services step, the light slides down the hair
  var curls = $('[data-curls]'), cItems = $$('[data-c-list] li'), cPhoto = $('[data-c-photo]'), cTop = 0, cH = 0, lastC = -1;
  function paintCurls(q) {
    var k = Math.min(cItems.length - 1, Math.floor(q * cItems.length));
    if (k !== lastC) { cItems.forEach(function (li, i) { li.classList.toggle('on', i === k); }); lastC = k; }
    cPhoto.style.setProperty('--gy', lerp(-45, 150, q).toFixed(2) + '%');
    cPhoto.style.setProperty('--cz', lerp(1.08, 1, q).toFixed(4));
  }
  window.__curls = paintCurls;

  // ---------------------------------------------------------------- before / after: the comb
  var ba = $('[data-ba]'), range = $('[data-ba-range]'), aImg = $('[data-after]'), bImg = $('[data-before]');
  var teeth = $('.comb-teeth'), tp = '';
  for (var ti = 0; ti < 18; ti++) { var y = 16 + ti * 10.8; tp += '<path d="M10.5 ' + y.toFixed(1) + 'H-5a2.2 2.2 0 0 0 0 4.4H10.5z"/>'; }
  teeth.innerHTML = tp;
  function setX(x) { x = clamp(x, 0, 100); ba.style.setProperty('--x', x.toFixed(2) + '%'); range.value = Math.round(x); }
  var drag = false;
  function fromEvent(e) { var r = ba.getBoundingClientRect(); setX((e.clientX - r.left) / r.width * 100); }
  ba.addEventListener('pointerdown', function (e) { drag = true; try { ba.setPointerCapture(e.pointerId); } catch (x) {} fromEvent(e); });
  ba.addEventListener('pointermove', function (e) { if (drag) fromEvent(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { ba.addEventListener(t, function () { drag = false; }); });
  range.addEventListener('input', function () { setX(+range.value); });
  $$('[data-pair]').forEach(function (b) { b.addEventListener('click', function () {
    $$('[data-pair]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    var p = b.dataset.pair;
    aImg.src = 'img/' + p + '-after.jpg'; bImg.src = 'img/' + p + '-before.jpg';
    var alts = p === 'build' ? [['לפני: שיער יבש ומקורזל', 'Before: dry, frizzy hair'], ['אחרי: תלתלים מוגדרים וארוכים', 'After: long, defined curls']] : [['לפני: תלתלים צפופים ונפוחים', 'Before: tight, puffy curls'], ['אחרי: תלתלים רכים ופתוחים יותר', 'After: softer, looser curls']];
    bImg.dataset.altHe = alts[0][0]; bImg.dataset.altEn = alts[0][1]; aImg.dataset.altHe = alts[1][0]; aImg.dataset.altEn = alts[1][1];
    bImg.alt = alts[0][he() ? 0 : 1]; aImg.alt = alts[1][he() ? 0 : 1];
    setX(50); hint();
  }); });
  // once, when it first comes into view: the comb moves a little each way, so it reads as something to drag
  var hinted = false;
  function hint() {
    if (still() || !ba.animate) return;
    var t0 = performance.now(), D = 1300;
    (function step(t) { var u = clamp((t - t0) / D, 0, 1); if (drag) return; setX(50 - 16 * Math.sin(u * Math.PI * 2) * (1 - u * 0.4) * (u < 1 ? 1 : 0)); if (u < 1) requestAnimationFrame(step); })(t0);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting && !hinted) { hinted = true; setTimeout(hint, 450); o.disconnect(); } }); }, { threshold: 0.6 }).observe(ba);

  // ---------------------------------------------------------------- the number: fitted to the width, lit as it arrives
  var big = $('[data-fit]');
  function fitBig() {
    big.style.fontSize = '100px';
    var w = big.scrollWidth, avail = big.parentElement.clientWidth;
    big.style.fontSize = clamp(100 * avail / w * 0.98, 40, 210).toFixed(1) + 'px';
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { big.classList.toggle('lit', e.intersectionRatio > 0.6); }); }, { threshold: [0, 0.6] }).observe(big);

  // ---------------------------------------------------------------- the footer outline and the boulevard drift
  // the footer: the house's own light line, from house-t.png, lit along the same order as the hero
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
      var i = OL.idx[k], a = OL.g[k]; b[i] = 255; b[i + 1] = 226; b[i + 2] = 166; b[i + 3] = Math.round(a * 255);
    }
    octx.putImageData(OL.img, 0, 0);
  }
  var blvd = $('[data-blvd]'), blvdImg = $('[data-blvd] img');
  function resetAll() {
    [camEl, copy, place, litImg].forEach(function (e) { e.style.transform = ''; e.style.opacity = ''; e.style.visibility = ''; });
    cPhoto.style.removeProperty('--gy'); cPhoto.style.removeProperty('--cz');
    cItems.forEach(function (li) { li.classList.remove('on'); });
    olLast = -1; drawOutline(1); blvdImg.style.removeProperty('--by'); blvd.style.removeProperty('--by');
    lastKey = ''; lastC = -1;
  }

  var lastY = 0;
  function tick() {
    var y = scrollY;
    var ch = concept.offsetHeight;
    root.style.setProperty('--bt', Math.max(0, ch - y) + 'px');
    bar.classList.toggle('solid', y > ch + 10);
    // the bar steps out of the way while reading down, and comes back on the way up
    if (Math.abs(y - lastY) > 6) { bar.classList.toggle('hide', y > lastY && y > innerHeight * 0.8); lastY = y; }
    if (sign) sign.classList.toggle('away', seen.size > 0 || y < innerHeight * 0.5);
    if (still()) return;
    var s = clamp((y - sTop) / Math.max(1, sH - vh), 0, 1), key = s.toFixed(4) + '|' + intro.toFixed(4);
    if (key !== lastKey) { lastKey = key; paint(s); }
    if (y + vh > cTop && y < cTop + cH) paintCurls(clamp((y - cTop) / Math.max(1, cH - vh), 0, 1));
    var o = outline.getBoundingClientRect();
    if (o.top < vh && o.bottom > 0) drawOutline(smooth((vh - o.top) / (vh * 0.75)));
    var b = blvd.getBoundingClientRect();
    if (b.bottom > 0 && b.top < vh) blvd.style.setProperty('--by', (((vh - b.top) / (vh + b.height) - 0.5) * -60).toFixed(1) + 'px');
  }
  function layout() {
    vw = root.clientWidth; vh = innerHeight;
    root.style.setProperty('--bh', bar.offsetHeight + 'px');
    sTop = stage.getBoundingClientRect().top + scrollY; sH = stage.offsetHeight;
    cTop = curls.getBoundingClientRect().top + scrollY; cH = curls.offsetHeight;
    if (!still()) placeWorld();
    fitBig();
    lastKey = ''; lastC = -1;
    tick();
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = root.clientWidth; layout(); } else { vh = innerHeight; tick(); } }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  texts(root.lang === 'en' ? 'en' : 'he');
  hours(); buildDays(); write(true);
  lastW = root.clientWidth;
  layout();
  initGL();
  window.__stage = { layout: layout, tick: tick, run: function () { return { top: sTop, h: sH, vh: vh, cTop: cTop, cH: cH }; } };
})();
