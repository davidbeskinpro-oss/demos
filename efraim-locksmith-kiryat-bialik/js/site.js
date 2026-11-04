(function () {
  var root = document.documentElement, WA = '972524423030';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var L = function (h, e) { return he() ? h : e; };
  var NS = 'http://www.w3.org/2000/svg';
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'אפרים המנעולן · מפתחות לרכב, קידוד וצילינדרים · קריית ביאליק', en: 'Efraim the Locksmith · Car keys, coding & cylinders · Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אפרים המנעולן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Efraim the Locksmith · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts() {
    var l = he() ? 'he' : 'en';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', L(h, e)); }); };
    aria('[data-t-brand]', 'אפרים המנעולן', 'Efraim the Locksmith');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לאפרים, 052-442-3030', 'Call Efraim, 052-442-3030');
    aria('[data-t-wa]', 'וואטסאפ לאפרים', 'WhatsApp Efraim');
    aria('[data-t-prev]', 'שלב קודם', 'Previous step');
    aria('[data-t-next]', 'שלב הבא', 'Next step');
    aria('[data-t-row]', 'תמונות מהעבודה', 'Photos of the work');
    aria('[data-keys]', 'מכונת שכפול: מפתח מקור למעלה, מפתח חדש נחתך למטה', 'Key duplicator: the original on top, the new key being cut below');
    aria('[data-cylsvg]', 'חתך של צילינדר עם פינים וקפיצים', 'Cutaway of a cylinder with pins and springs');
    $('.v-map iframe').title = L('מפה: יוסף לוי 25, קריית ביאליק', 'Map: 25 Yosef Levi St, Kiryat Bialik');
    $$('[data-decode]').forEach(function (el) { el.textContent = el.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ef-lang', l); } catch (e) {}
    texts(); hours(); compose(); cyl.render(true); cars.show(true); fitMark();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); root.classList.remove('deal');
    try { localStorage.setItem('ef-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('.ch').forEach(function (c) { c.classList.add('on'); });
    cyl.render(true); cars.show(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours + live status (Asia/Jerusalem). null = closed
  var H = { 0: [8, 17.5], 1: [8, 17.5], 2: [8, 17.5], 3: [8, 17.5], 4: [8, 17.5], 5: [8, 12.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = L('פתוח 24 שעות', 'Open 24 hours'); }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = L('פתוח עכשיו · עד ' + hhmm(t[1]), 'Open now · until ' + hhmm(t[1])); }
    else if (t && n.h < t[0]) txt = L('סגור עכשיו · נפתח היום ב-' + hhmm(t[0]), 'Closed now · opens today at ' + hhmm(t[0]));
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? L('סגור עכשיו', 'Closed now')
        : nd === (n.d + 1) % 7 ? L('סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]), 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : L('סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]), 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', r.dataset.days.split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var names = he() ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : L('סגור', 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('[data-spot]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: split, then fill one by one
  function split(el) {
    $$('span[lang]', el).forEach(function (sp) {
      sp.innerHTML = sp.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch">' + c + '</span>'; }).join('');
    });
  }
  split($('[data-split]')); split($('[data-mark]'));
  function fill(el, delay) {
    $$('span[lang]', el).forEach(function (sp) { $$('.ch', sp).forEach(function (c, i) { setTimeout(function () { c.classList.add('on'); }, delay + i * 70); }); });
  }
  if (still()) $$('.ch').forEach(function (c) { c.classList.add('on'); }); else fill($('[data-split]'), 120);

  // ---------------------------------------------------------------- glyph decode labels
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת#%&*+=<>/0123456789';
  function decode(el) {
    var target = el.dataset[he() ? 'he' : 'en'];
    if (still()) { el.textContent = target; el.classList.add('in'); return; }
    var f = 0, n = 16; el.classList.add('in');
    (function step() {
      el.textContent = target.split('').map(function (c, i) { return c === ' ' || i < (f / n) * target.length ? c : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (++f <= n) setTimeout(step, 45); else el.textContent = target;
    })();
  }
  $$('[data-decode]').forEach(function (el, i) { watch(el, function (v) { if (v && !el.dataset.done) { el.dataset.done = 1; setTimeout(function () { decode(el); }, 500 + i * 260); } }); });

  // ---------------------------------------------------------------- odometers (only real figures: 5.0, 84)
  $$('[data-odo]').forEach(function (o) {
    var to = parseFloat(o.dataset.odo), dec = (o.dataset.odo.split('.')[1] || '').length;
    watch(o, function (v) {
      if (!v || o.dataset.done) return; o.dataset.done = 1;
      if (still()) return;
      var t0 = performance.now();
      (function f(t) { var k = smooth((t - t0) / 1400); o.textContent = (to * k).toFixed(dec); if (k < 1) requestAnimationFrame(f); })(t0);
    });
  });

  // ---------------------------------------------------------------- opening: the tiles are dealt onto the board, the key wall lands last
  (function () {
    var seen = null; try { seen = sessionStorage.getItem('ef-dealt'); } catch (e) {}
    if (still() || seen) return;
    try { sessionStorage.setItem('ef-dealt', '1'); } catch (e) {}
    var order = ['.t-name', '.t-say', '.t-act', '.t-fob', '.t-wall'];
    order.forEach(function (s, i) {
      var t = $(s), r = t.getBoundingClientRect();
      t.style.setProperty('--dx', (innerWidth / 2 - r.left - r.width / 2) * .8 + 'px');
      t.style.setProperty('--dy', (innerHeight / 2 - r.top - r.height / 2) * .8 + 'px');
      t.style.setProperty('--rot', (i % 2 ? 7 : -6) + 'deg');
      t.style.setProperty('--i', i);
    });
    root.classList.add('deal');
    setTimeout(function () { root.classList.remove('deal'); }, 1700);
  })();

  // ---------------------------------------------------------------- the workbench lamp over the real key wall (cursor; drifts by itself on touch)
  var wall = $('[data-lamp]'), lamp = $('.lamp', wall), hand = null, wallVis = true;
  wall.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = wall.getBoundingClientRect(); hand = [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; });
  wall.addEventListener('pointerleave', function () { hand = null; });
  watch(wall, function (v) { wallVis = v; });
  var lx = 50, ly = 40;
  function lampFrame(t) {
    if (wallVis && !still()) {
      var tx = hand ? hand[0] : 50 + Math.sin(t / 2300) * 30, ty = hand ? hand[1] : 45 + Math.sin(t / 1700) * 22;
      lx += (tx - lx) * .08; ly += (ty - ly) * .08;
      lamp.style.setProperty('--mx', lx.toFixed(1) + '%'); lamp.style.setProperty('--my', ly.toFixed(1) + '%');
    }
    requestAnimationFrame(lampFrame);
  }
  requestAnimationFrame(lampFrame);

  // the smart key tilts toward the hand
  var fob = $('[data-tilt]'), fobImg = $('img', fob);
  fob.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = fob.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; fobImg.style.transform = 'scale(1.08) translate(' + (x * -14).toFixed(1) + 'px,' + (y * -14).toFixed(1) + 'px)'; });
  fob.addEventListener('pointerleave', function () { fobImg.style.transform = ''; });

  // ---------------------------------------------------------------- key duplicator: tracer on the original, wheel cuts the blank (scroll-linked both ways)
  var keys = (function () {
    var svg = $('[data-keys]'), CUTS = [[300, 18], [420, 30], [540, 10], [660, 26], [780, 14], [900, 32], [1010, 20]], TOP = 32;
    function prof(x) { var y = TOP; CUTS.forEach(function (c) { var d = Math.abs(x - c[0]); if (d <= 8) y = Math.max(y, TOP + c[1]); else if (d < 34) y = Math.max(y, TOP + c[1] * (34 - d) / 26); }); return y; }
    function bladePath(cut) {
      var pts = [[190, TOP]];
      if (cut) CUTS.forEach(function (c) { pts.push([c[0] - 34, TOP], [c[0] - 8, TOP + c[1]], [c[0] + 8, TOP + c[1]], [c[0] + 34, TOP]); });
      pts.push([1080, TOP], [1130, 66], [1118, 92], [190, 92]);
      return 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join('L') + 'Z';
    }
    var bow = 'M190 18 L170 18 A62 62 0 1 0 170 106 L190 106 Z';
    function key(y, fill, cut, extra) {
      return '<g transform="translate(0 ' + y + ')">' + '<path d="' + bow + '" fill="' + fill + '"/><circle cx="104" cy="62" r="17" fill="#0f1115"/>' +
        '<path d="' + bladePath(cut) + '" fill="' + fill + '"' + (extra || '') + '/><path d="M200 72H1090" stroke="rgba(0,0,0,.28)" stroke-width="4"/></g>';
    }
    var cog = ''; for (var i = 0; i < 24; i++) { var a = i / 24 * Math.PI * 2; cog += (i ? 'L' : 'M') + (Math.cos(a) * 30).toFixed(1) + ' ' + (Math.sin(a) * 30).toFixed(1) + 'L' + (Math.cos(a + .13) * 24).toFixed(1) + ' ' + (Math.sin(a + .13) * 24).toFixed(1); }
    svg.innerHTML =
      '<defs><linearGradient id="kn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f5f7"/><stop offset=".55" stop-color="#b9bfc7"/><stop offset="1" stop-color="#7f868f"/></linearGradient>' +
      '<linearGradient id="kb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4dc9c"/><stop offset=".5" stop-color="#c9a45c"/><stop offset="1" stop-color="#8a6a2c"/></linearGradient>' +
      '<clipPath id="unc"><rect data-unc x="0" y="0" width="1200" height="330"/></clipPath></defs>' +
      '<line class="cutline" x1="0" y1="' + (20 + TOP) + '" x2="1200" y2="' + (20 + TOP) + '"/>' +
      key(20, 'url(#kn)', true) +
      '<g data-blank>' + key(190, 'url(#kb)', true) + '<g clip-path="url(#unc)">' + key(190, 'url(#kb)', false) + '</g></g>' +
      '<g data-tracer><path d="M-9 -46 L9 -46 L3 -6 L0 0 L-3 -6 Z" fill="#e1262f"/><rect x="-14" y="-70" width="28" height="26" rx="4" fill="#3a404a"/></g>' +
      '<g data-wheel><circle r="31" fill="#2c313a"/><path d="' + cog + 'Z" fill="#9aa1aa" data-cog/><circle r="8" fill="#0f1115"/></g>' +
      '<g data-sparks></g>';
    var unc = $('[data-unc]', svg), tracer = $('[data-tracer]', svg), wheel = $('[data-wheel]', svg), cogEl = $('[data-cog]', svg), sparks = $('[data-sparks]', svg);
    var last = -1;
    function set(p) {
      var x = 230 + p * 860, yo = 20 + prof(x), yb = 190 + prof(x);
      unc.setAttribute('x', x); unc.setAttribute('width', 1200 - x);
      tracer.setAttribute('transform', 'translate(' + x + ' ' + yo + ')');
      wheel.setAttribute('transform', 'translate(' + x + ' ' + (yb - 31) + ')');
      cogEl.setAttribute('transform', 'rotate(' + (p * 2400).toFixed(1) + ')');
      if (last >= 0 && Math.abs(x - last) > 2 && !still() && p < 1 && p > 0) spark(x, yb);
      last = x;
    }
    function spark(x, y) {
      if (!sparks.animate) return;
      for (var i = 0; i < 3; i++) {
        var l = document.createElementNS(NS, 'line'), a = -Math.PI / 2 - .3 - Math.random() * 1.6, d = 30 + Math.random() * 50;
        l.setAttribute('x1', x); l.setAttribute('y1', y); l.setAttribute('x2', x + Math.cos(a) * 8); l.setAttribute('y2', y + Math.sin(a) * 8);
        l.setAttribute('stroke', i ? '#ffd27a' : '#ffffff'); l.setAttribute('stroke-width', 2); l.setAttribute('stroke-linecap', 'round');
        sparks.appendChild(l);
        l.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 30) + 'px)', opacity: 0 }], { duration: 420 + Math.random() * 200, easing: 'cubic-bezier(.23,1,.32,1)' }).onfinish = function () { this.effect.target.remove(); };
      }
    }
    var host = $('[data-cut]');
    return { tick: function () {
      if (still()) { set(1); return; }
      var r = $('.machine', host).getBoundingClientRect();
      set(clamp((innerHeight * .85 - r.top) / (innerHeight * .65), 0, 1));
    } };
  })();

  // ---------------------------------------------------------------- cylinder cutaway: pins ride the key up to the shear line, then the plug turns
  var cyl = (function () {
    var sec = $('[data-cyl]'), svg = $('[data-cylsvg]'), cap = $('[data-cap]'), btns = $$('[data-stage]');
    var X = [150, 245, 340, 435, 530], Lk = [72, 96, 64, 88, 78], SHEAR = 200, REST = 300, KTOP = 258, KBOT = 314, DRV = 56;
    var CAP = [['בלי מפתח, הפינים חוסמים את הסיבוב.', 'Without a key, the pins block the turn.'],
               ['החריצים מרימים כל פין לגובה שלו.', 'The cuts lift each pin to its own height.'],
               ['כל הפינים פוגשים את אותו קו.', 'Every pin meets the same line.'],
               ['הליבה מסתובבת והמנעול נפתח.', 'The plug turns and the lock opens.']];
    var STILL = [0.06, 0.45, 0.7, 1], stage = -1, P = 0, stillStage = 0;
    // key profile in key-local x (0 = tip when fully inserted at x=110)
    function ktop(lx) {
      if (lx < 0) return null;
      if (lx < 26) return REST - (REST - KTOP) * lx / 26;
      var y = KTOP;
      X.forEach(function (x, i) { var c = x - 110, d = Math.abs(lx - c), dep = (SHEAR + Lk[i]) - KTOP; if (d <= 6) y = Math.max(y, KTOP + dep); else if (d < 26) y = Math.max(y, KTOP + dep * (26 - d) / 20); });
      return y;
    }
    var keyPts = []; for (var lx = 0; lx <= 620; lx += 2) keyPts.push(lx);
    function spring(x, y0, y1) { var d = 'M' + x + ' ' + y0, n = 9, h = (y1 - y0) / n; for (var i = 1; i <= n; i++) d += 'L' + (x + (i % 2 ? 11 : -11)) + ' ' + (y0 + h * i - h / 2) + 'L' + x + ' ' + (y0 + h * i); return d; }
    svg.innerHTML = '<defs><linearGradient id="hn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd4da"/><stop offset="1" stop-color="#8d949d"/></linearGradient>' +
      '<linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3e6ea"/><stop offset="1" stop-color="#a7adb5"/></linearGradient>' +
      '<linearGradient id="br" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6a2c"/><stop offset=".45" stop-color="#f0d38c"/><stop offset="1" stop-color="#9b7a35"/></linearGradient>' +
      '<linearGradient id="st" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d646e"/><stop offset=".45" stop-color="#c3c8ce"/><stop offset="1" stop-color="#5d646e"/></linearGradient></defs>' +
      '<rect x="60" y="60" width="580" height="290" rx="18" fill="url(#hn)"/>' +
      '<rect x="60" y="' + SHEAR + '" width="580" height="140" fill="url(#pl)" data-plug/>' +
      '<rect x="60" y="250" width="580" height="72" fill="#0d0f13"/>' +
      X.map(function (x) { return '<rect x="' + (x - 17) + '" y="78" width="34" height="' + (250 - 78) + '" fill="#0d0f13"/>'; }).join('') +
      '<g data-springs fill="none" stroke="#9aa1aa" stroke-width="2.5"></g><g data-pins></g>' +
      '<path data-key fill="url(#br)"/>' +
      '<line data-shear x1="40" y1="' + SHEAR + '" x2="660" y2="' + SHEAR + '" stroke="#e1262f" stroke-width="2" stroke-dasharray="6 6"/>' +
      '<g transform="translate(722 150)"><circle r="62" fill="url(#hn)"/><g data-endplug><circle r="40" fill="url(#pl)"/><rect x="-5" y="-26" width="10" height="44" rx="3" fill="#0d0f13"/></g>' +
      '<circle r="40" fill="none" stroke="#e1262f" stroke-width="2" stroke-dasharray="5 5" data-ring/><g data-cam><path d="M-14 46 L14 46 L10 74 L-10 74 Z" fill="#7f868f"/></g></g>' +
      '<text x="722" y="250" text-anchor="middle" fill="#8d929c" font-size="15" data-endlbl></text>';
    var springs = $('[data-springs]', svg), pins = $('[data-pins]', svg), keyEl = $('[data-key]', svg), shear = $('[data-shear]', svg), ring = $('[data-ring]', svg), endplug = $('[data-endplug]', svg), cam = $('[data-cam]', svg), lbl = $('[data-endlbl]', svg);
    function draw(p) {
      var ins = smooth((p - .16) / .44), turn = smooth((p - .78) / .18), align = p >= .6 ? 1 : 0;
      var tip = 110 + (1 - ins) * 600; // world x of the key tip
      var sp = '', pn = '';
      X.forEach(function (x, i) {
        var t = ins > 0 ? ktop(x - tip) : null, bottom = t === null ? REST : Math.min(REST, t);
        var kt = bottom - Lk[i], dt = kt - DRV;
        sp += '<path d="' + spring(x, 80, dt) + '"/>';
        pn += '<path d="M' + (x - 14) + ' ' + kt + 'H' + (x + 14) + 'V' + (bottom - 10) + 'L' + x + ' ' + bottom + 'L' + (x - 14) + ' ' + (bottom - 10) + 'Z" fill="url(#br)"/>' +
              '<rect x="' + (x - 14) + '" y="' + dt + '" width="28" height="' + DRV + '" rx="3" fill="url(#st)"/>';
      });
      springs.innerHTML = sp; pins.innerHTML = pn;
      if (ins > 0) {
        var d = 'M' + tip + ' ' + REST;
        keyPts.forEach(function (lx) { if (tip + lx <= 800) d += 'L' + (tip + lx) + ' ' + ktop(lx).toFixed(1); });
        d += 'L800 ' + KTOP + 'L800 ' + KBOT + 'L' + (tip + 8) + ' ' + KBOT + 'Z';
        keyEl.setAttribute('d', d);
      } else keyEl.setAttribute('d', '');
      shear.setAttribute('stroke', align ? '#f1f3f5' : '#e1262f');
      shear.setAttribute('stroke-dasharray', align ? 'none' : '6 6');
      shear.style.filter = align ? 'drop-shadow(0 0 6px rgba(255,255,255,.8))' : ''; // taste-skill-ignore: the shear line lights up
      ring.setAttribute('stroke', align ? '#f1f3f5' : '#e1262f');
      endplug.setAttribute('transform', 'rotate(' + (turn * 90).toFixed(1) + ')');
      cam.setAttribute('transform', 'rotate(' + (turn * 90).toFixed(1) + ')');
      lbl.textContent = L('מבט מהחזית', 'Front view');
      var s = p < .16 ? 0 : p < .6 ? 1 : p < .78 ? 2 : 3;
      if (s !== stage) { stage = s; btns.forEach(function (b, i) { b.classList.toggle('on', i === s); b.setAttribute('aria-pressed', i === s); }); cap.textContent = CAP[s][he() ? 0 : 1]; }
    }
    function progress() { var r = sec.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight), 0, 1); }
    btns.forEach(function (b) { b.addEventListener('click', function () {
      var s = +b.dataset.stage;
      if (still()) { stillStage = s; render(true); return; }
      var r = sec.getBoundingClientRect(), top = scrollY + r.top;
      scrollTo({ top: top + STILL[s] * (r.height - innerHeight), behavior: 'smooth' });
    }); });
    $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { stillStage = clamp(stillStage + +b.dataset.step, 0, 3); render(true); }); });
    function render(force) {
      var p = still() ? STILL[stillStage] : progress();
      if (force) stage = -1;
      if (force || Math.abs(p - P) > .0005) { P = p; draw(p); }
    }
    draw(0);
    return { render: render };
  })();

  // ---------------------------------------------------------------- cars: steps light up beside the programmer screen, which types each step
  var cars = (function () {
    var sec = $('[data-cars]'), prog = $('[data-prog]'), scr = $('[data-screen]'), items = $$('[data-steps] li'), cur = -1, timers = [];
    var LINES = [
      [['מכונת חיתוך: מקור ולהב', 'Cutter: original and blade'], ['חיתוך חריצים 7/7', 'Cutting notches 7/7'], ['הלהב מוכן', 'Blade ready']],
      [['קריאת שבב…', 'Reading chip…'], ['רישום המפתח ברכב', 'Registering key to car'], ['המפתח מזוהה', 'Key recognised']],
      [['שלט: התאמה לרכב', 'Remote: pairing'], ['לחיצה על הכפתור', 'Button pressed'], ['השלט מחובר', 'Remote paired']]];
    function type(s, instant) {
      timers.forEach(clearTimeout); timers = [];
      var ls = LINES[s].map(function (l) { return l[he() ? 0 : 1]; });
      var head = '<div class="scr-head"><span>' + L('מתכנת מפתחות', 'Key programmer') + '</span><span dir="ltr">' + (s + 1) + '/3</span></div><div class="scr-bar"><i style="--k:' + ((s + 1) / 3) + '"></i></div>';
      if (instant || still()) { scr.innerHTML = head + ls.map(function (t, i) { return '<div' + (i === 2 ? ' class="ok"' : '') + '>' + t + '</div>'; }).join(''); return; }
      scr.innerHTML = head; var at = 0;
      ls.forEach(function (t, li) {
        var div = document.createElement('div'); if (li === 2) div.className = 'ok';
        timers.push(setTimeout(function () { $$('.cur', scr).forEach(function (c) { c.classList.remove('cur'); }); div.className += ' cur'; scr.appendChild(div); }, at));
        t.split('').forEach(function (c, k) { timers.push(setTimeout(function () { div.textContent = t.slice(0, k + 1); }, at + k * 32)); });
        at += t.length * 32 + 380;
      });
    }
    function set(s, force) {
      if (s === cur && !force) return; cur = s;
      prog.dataset.s = s;
      items.forEach(function (li, i) { li.classList.toggle('on', i === s); });
      type(s, force && cur >= 0 && still());
    }
    return {
      tick: function () {
        if (still()) { if (cur !== 1) set(1, true); return; }
        var r = sec.getBoundingClientRect(), p = clamp((innerHeight * .55 - r.top) / (r.height * .75), 0, .999);
        set(Math.floor(p * 3));
      },
      show: function () { var s = cur < 0 ? (still() ? 1 : 0) : cur; cur = -1; set(s, true); }
    };
  })();

  // ---------------------------------------------------------------- cursor spotlight over the tiles
  $$('[data-spot]').forEach(function (g) {
    var tiles = $$('.m,.v', g);
    g.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tiles.forEach(function (t) { var r = t.getBoundingClientRect(); t.style.setProperty('--sx', (e.clientX - r.left) + 'px'); t.style.setProperty('--sy', (e.clientY - r.top) + 'px'); }); });
    g.addEventListener('pointerleave', function () { tiles.forEach(function (t) { t.style.removeProperty('--sx'); }); });
  });

  // ---------------------------------------------------------------- photos on hooks swing with the scroll speed; reviews drift
  var hung = $$('[data-hang]'), row = $('[data-row]'), rowVis = false, ang = 0, vel = 0, lastY = scrollY, lastRow = row.scrollLeft;
  watch(row, function (v) { rowVis = v; });
  var tags = $$('.ktag'), drift = $('[data-drift]');
  tags.forEach(function (t, i) { t.style.setProperty('--tr', (i % 2 ? 1.4 : -1.2) + 'deg'); });

  // ---------------------------------------------------------------- composer: the key tag becomes the WhatsApp message
  var OPTS = [['שכפול מפתח לרכב', 'copying a car key'], ['קידוד מפתח', 'key coding'], ['שלט לרכב', 'a car remote'], ['צילינדר', 'a cylinder'], ['פתיחת דלת', 'opening a door'], ['משהו אחר', 'something else']];
  var detail = $('[data-detail]'), msgEl = $('[data-msg]'), tag = $('[data-tag]');
  function compose() {
    var o = +($('input[name="job"]:checked') || { value: 0 }).value, d = detail.value.trim();
    var msg = he() ? 'שלום אפרים, הגעתי מהאתר.\nאני פונה לגבי: ' + OPTS[o][0] + '.' + (d ? '\nפרטים: ' + d : '')
                   : 'Hi Efraim, I found you through the website.\nI’m writing about ' + OPTS[o][1] + '.' + (d ? '\nDetails: ' + d : '');
    msgEl.textContent = msg;
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    var short = L('שלום אפרים, הגעתי מהאתר.', 'Hi Efraim, I found you through the website.');
    $$('[data-wa]:not([data-send])').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(short); });
  }
  $$('input[name="job"]').forEach(function (r) { r.addEventListener('change', function () { compose(); if (still() || !tag.animate) return; tag.animate([{ transform: 'rotate(-2deg)' }, { transform: 'rotate(2.5deg)' }, { transform: 'rotate(-1deg)' }, { transform: 'rotate(-2deg)' }], { duration: 700, easing: 'cubic-bezier(.23,1,.32,1)' }); }); });
  detail.addEventListener('input', compose);

  // ---------------------------------------------------------------- footer: wordmark fitted to its width; letters rise as the shutter rolls up
  var mark = $('[data-mark]'), shutter = $('[data-shutter]');
  function fitMark() {
    mark.style.fontSize = '100px';
    var sp = $('span[lang="' + root.lang + '"]', mark); if (!sp) return;
    var w = sp.getBoundingClientRect().width || 1;
    mark.style.fontSize = Math.min(100 * mark.clientWidth / w * .98, 420) + 'px';
  }

  // ---------------------------------------------------------------- nav + key bar
  var nav = $('[data-nav]'), keybar = $('[data-keybar]'), nearEnd = false;
  var ends = [false, false];
  watch($('.v-call'), function (v) { ends[0] = v; nearEnd = ends[0] || ends[1]; q(); });
  watch($('.t-act'), function (v) { ends[1] = v; nearEnd = ends[0] || ends[1]; q(); });

  // ---------------------------------------------------------------- one scroll loop
  var queued = false;
  function tick() {
    queued = false;
    var y = scrollY;
    nav.classList.toggle('gather', y > 60);
    keybar.classList.toggle('away', nearEnd);
    keys.tick(); cyl.render(); cars.tick();
    // swing
    if (rowVis && !still()) { vel = (y - lastY) + (row.scrollLeft - lastRow) * .6; }
    lastY = y; lastRow = row.scrollLeft;
    // reviews drift sideways with the page
    var dr = drift.getBoundingClientRect(), k = still() ? 0 : clamp((innerHeight - dr.top) / (innerHeight + dr.height), 0, 1) - .5;
    tags.forEach(function (t, i) { t.style.setProperty('--dr', (k * (i % 2 ? -60 : 60)).toFixed(1) + 'px'); });
    // shutter: rolls up over the last screen
    if (!still()) {
      var rem = document.documentElement.scrollHeight - innerHeight - y;
      shutter.style.setProperty('--sh', clamp(rem / (shutter.offsetHeight * 1.1), 0, 1).toFixed(3));
      var mr = mark.getBoundingClientRect(), mk = clamp((innerHeight - mr.top) / (innerHeight * .5), 0, 1);
      $$('span[lang="' + root.lang + '"] .ch', mark).forEach(function (c, i, a) { var kk = clamp(mk * 1.6 - i / a.length * .6, 0, 1); c.style.setProperty('--ty', ((1 - smooth(kk)) * 70).toFixed(1) + '%'); });
    } else $$('.ch', mark).forEach(function (c) { c.style.removeProperty('--ty'); });
  }
  function q() { if (!queued) { queued = true; requestAnimationFrame(tick); } }
  addEventListener('scroll', q, { passive: true });
  row.addEventListener('scroll', q, { passive: true });
  addEventListener('resize', function () { fitMark(); q(); });

  // spring loop for the hanging photos (runs only while the row is on screen)
  (function swing() {
    if (rowVis && !still()) {
      ang += (clamp(vel * .12, -7, 7) - ang) * .12; vel *= .85;
      hung.forEach(function (f, i) { f.style.setProperty('--sw', (ang * (i % 2 ? .8 : 1)).toFixed(2) + 'deg'); });
    } else if (still()) hung.forEach(function (f) { f.style.removeProperty('--sw'); });
    requestAnimationFrame(swing);
  })();

  texts(); hours(); compose(); cars.show(); fitMark(); tick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitMark(); tick(); });
})();
