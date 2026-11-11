(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 820; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var WA = '972504700490';
  var TITLE = { he: 'דניאל רוזן · מעצב שיער · סעדיה גאון 10, חיפה', en: 'Daniel Rozen · Hair design · 10 Saadia Gaon St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור דניאל רוזן, מעצב שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Daniel Rozen Hair Design · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'דניאל רוזן, מעצב שיער', 'Daniel Rozen, hair design');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לדניאל', 'WhatsApp Daniel');
    aria('[data-t-call]', 'התקשרו לדניאל, 050-470-0490', 'Call Daniel, 050-470-0490');
    aria('[data-t-angles]', 'זווית', 'Angle');
    aria('.ang-btn.prev', 'הקודם', 'Previous');
    aria('.ang-btn.next', 'הבא', 'Next');
    aria('.rs', '5 כוכבים', '5 stars');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: סעדיה גאון 10, חיפה' : 'Map: 10 Saadia Gaon St, Haifa'; });
    $$('.tag').forEach(function (t) { $('.tt', t).textContent = still() || t._done ? t.dataset[l] : ''; });
    $$('.decode').forEach(function (d) { d.textContent = d.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dr134-lang', l); } catch (e) {}
    texts(l); hours(); write(true); split(); update();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('dr134-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-slot]').classList.add('out');
    resetScroll(); update(); bulbsArch();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours. Google lists none: H = null shows "by appointment".
  // When known: one entry per day (0 = Sunday), [open, close] in hours, null = closed, [0, 24] = around the clock.
  var H = null;
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var l = he(), txt, open = false;
    if (!H) txt = l ? 'בתיאום מראש · התקשרו או כתבו' : 'By appointment · call or message';
    else {
      var n = window.__now || now(), t = H[n.d];
      if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
      else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
      else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
      else {
        var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
        txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
          : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
          : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
  }
  function hours() {
    var tb = $('[data-hours]'), l = he();
    if (!H) { tb.innerHTML = ''; status(); return; }
    var names = l ? dayHe : dayEn, rows = [], i = 0, today = now().d;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    tb.innerHTML = rows.map(function (r) {
      var t = H[r[0]], name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr' + (today >= r[0] && today <= r[1] ? ' class="today"' : '') + '><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- headline letter by letter
  function split() {
    $$('[data-split] .ln > span[lang]').forEach(function (sp) {
      if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
      var i = 0;
      sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split();

  // ---------------------------------------------------------------- bulbs on the real logo's bulb holes (measured from the logo file)
  var DOTS = [[.2567,.3471],[.2679,.3977],[.282,.4485],[.2957,.4983],[.3079,.5486],[.3946,.3904],[.423,.4147],[.4504,.439],[.4789,.4675],[.5071,.496],[.5917,.3295],[.5915,.3818],[.5916,.4336],[.5916,.4854],[.5916,.5367],[.7034,.3193],[.7031,.3713],[.7028,.4233],[.7025,.4751],[.7022,.5271],[.8611,.3095],[.8606,.3616],[.8601,.4137],[.8594,.4655],[.859,.5172],[.3049,.681],[.287,.7317],[.2811,.7823],[.2884,.8317],[.3076,.8799],[.5049,.6751],[.4902,.7213],[.4739,.7713],[.4595,.821],[.4443,.8693],[.6072,.6697],[.6073,.7202],[.6075,.7702],[.6077,.82],[.6078,.87],[.7434,.7109],[.7721,.7356],[.7999,.7602],[.8287,.7887],[.8571,.8155]];
  $$('[data-bulbs]').forEach(function (box) {
    box.insertAdjacentHTML('beforeend', DOTS.map(function (d, k) { return '<i class="bl" style="left:' + (d[0] * 100) + '%;top:' + (d[1] * 100) + '%;--k:' + k + '"></i>'; }).join(''));
  });

  // ---------------------------------------------------------------- opening: the bulbs come on in a chase, then the curtain lifts (once per visit, tap to skip)
  var hero = $('[data-hero]'), intro = $('[data-intro]');
  function go() { hero.classList.add('ready'); }
  var seen = false; try { seen = sessionStorage.getItem('dr134-intro') === '1'; } catch (e) {}
  if (!still() && !seen) {
    try { sessionStorage.setItem('dr134-intro', '1'); } catch (e) {}
    intro.classList.add('run');
    var bl = $$('.bl', intro), done = false;
    bl.forEach(function (b, k) { setTimeout(function () { b.classList.add('on'); }, 120 + k * 16); });
    var finish = function () { if (done) return; done = true; intro.classList.add('lift'); setTimeout(go, 200); setTimeout(function () { intro.remove(); }, 1000); };
    setTimeout(finish, 1150);
    intro.addEventListener('pointerdown', finish);
    addEventListener('keydown', finish, { once: true });
  } else { intro.remove(); requestAnimationFrame(function () { requestAnimationFrame(go); }); }

  // ---------------------------------------------------------------- hero: bulbs round the arch, gloss under the hand, cards lean, labels type
  var arch = $('[data-arch]'), asvg = $('[data-archbulbs]'), aBulbs = [];
  function bulbsArch() {
    var w = asvg.clientWidth, h = asvg.clientHeight; if (!w) return;
    asvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); asvg.innerHTML = ''; aBulbs = [];
    var r = w / 2, gap = phone() ? 20 : 26, pts = [];
    // left side up, the round top, right side down (the arch's own outline)
    var side = h - r, n = Math.max(2, Math.round(side / gap)), i;
    for (i = n; i >= 1; i--) pts.push([0, r + side * i / n]);
    var m = Math.round(Math.PI * r / gap);
    for (i = 0; i <= m; i++) { var a = Math.PI - Math.PI * i / m; pts.push([r + r * Math.cos(a), r - r * Math.sin(a)]); }
    for (i = 1; i <= n; i++) pts.push([w, r + side * i / n]);
    pts.forEach(function (p) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', p[0].toFixed(1)); c.setAttribute('cy', p[1].toFixed(1)); c.setAttribute('r', phone() ? 3 : 3.6); asvg.appendChild(c); aBulbs.push(c); });
  }
  var chaseK = 0, heroVis = true;
  watch(hero, function (v) { heroVis = v; });
  setInterval(function () { if (still() || !heroVis) return; chaseK = (chaseK + 1) % 3; aBulbs.forEach(function (c, i) { c.classList.toggle('on', i % 3 === chaseK); }); }, 260);

  var glass = $('.arch-glass', arch), gloss = $('.gloss', arch), cards = $$('[data-card]');
  var gx = 50, gy = 35, tgx = 50, tgy = 35, pointer = false;
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return; pointer = true;
    var r = glass.getBoundingClientRect(); tgx = clamp((e.clientX - r.left) / r.width * 100, -20, 120); tgy = clamp((e.clientY - r.top) / r.height * 100, -10, 110);
    var hr = hero.getBoundingClientRect(), nx = (e.clientX - hr.left) / hr.width - .5, ny = (e.clientY - hr.top) / hr.height - .5;
    glass.firstElementChild.style.setProperty('--px', (-nx * 14).toFixed(1) + 'px'); glass.firstElementChild.style.setProperty('--py', (-ny * 10).toFixed(1) + 'px');
    cards.forEach(function (c) { c.classList.add('lean'); c.style.setProperty('--ty', (nx * 18).toFixed(1) + 'deg'); c.style.setProperty('--tx', (-ny * 14).toFixed(1) + 'deg'); });
  });
  hero.addEventListener('pointerleave', function () { pointer = false; cards.forEach(function (c) { c.style.setProperty('--tx', '0deg'); c.style.setProperty('--ty', '0deg'); }); });
  (function glide(t) {
    if (!still() && heroVis) {
      if (!pointer) { tgx = 50 + Math.sin(t / 2100) * 38; tgy = 30 + Math.sin(t / 1300) * 26; }   // phones: the light moves by itself
      gx = lerp(gx, tgx, .08); gy = lerp(gy, tgy, .08);
      gloss.style.setProperty('--gx', gx.toFixed(1) + '%'); gloss.style.setProperty('--gy', gy.toFixed(1) + '%');
    }
    requestAnimationFrame(glide);
  })(0);

  // labels type themselves (glyph-decode for headings in the chair)
  function typeTag(t, on) {
    var tt = $('.tt', t), full = t.dataset[he() ? 'he' : 'en']; t._done = true;
    if (!on || still()) { tt.textContent = on || still() ? full : ''; return; }
    var i = 0; clearInterval(t._iv); t._iv = setInterval(function () { tt.textContent = full.slice(0, ++i); if (i >= full.length) clearInterval(t._iv); }, 70);
  }
  var tags = $$('.hero .tag');
  if (still()) tags.forEach(function (t) { typeTag(t, true); });
  else setTimeout(function () { tags.forEach(function (t, i) { setTimeout(function () { typeTag(t, true); }, i * 380); }); }, 1700);

  var GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKMNRSTXZ';
  function decode(el) {
    var full = el.dataset[he() ? 'he' : 'en'];
    if (still()) { el.textContent = full; return; }
    var f = 0; clearInterval(el._iv);
    el._iv = setInterval(function () {
      f++; var fixed = Math.floor(f / 2);
      el.textContent = full.split('').map(function (c, i) { return c === ' ' || i < fixed ? c : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (fixed >= full.length) { clearInterval(el._iv); el.textContent = full; }
    }, 40);
  }

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); var d = $('.decode', e.target); if (d) decode(d); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el, i) { el.style.setProperty('--d', (i % 3) * 80 + 'ms'); rio ? rio.observe(el) : el.classList.add('in'); });

  // bento spotlight + living tiles only while on screen
  var chair = $('[data-chair]');
  watch(chair, function (v) { chair.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the turn: one continuous angle 0..2 drives the mirror
  var turn = $('[data-turn]'), mirror = $('[data-mirror]'), mimgs = $$('.m-img', mirror), sweep = $('.m-sweep', mirror), angs = $$('[data-ang]'), rim = $('.m-rim', mirror);
  var stepA = 0;
  function paintTurn(a) {
    mimgs.forEach(function (im, i) {
      // the head turns: the current angle swings away edge-on, the next swings in from the other edge; never two at once
      var d = a - i, on = d > -.5 && d <= .5 || (i === 0 && d <= 0) || (i === mimgs.length - 1 && d > 0);
      im.style.opacity = on ? '1' : '0';
      im.style.transform = still() ? '' : 'rotateY(' + (clamp(d, -.5, .5) * -150).toFixed(1) + 'deg) scale(' + (1.08 + Math.abs(clamp(d, -.5, .5)) * .1).toFixed(3) + ')';
    });
    var f = a - Math.floor(a); sweep.style.setProperty('--sw', lerp(-80, 80, f === 0 && a > 0 ? 1 : f).toFixed(1) + '%');
    var near = Math.round(a); angs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === near ? 'true' : 'false'); });
  }
  function goAngle(i) {
    i = clamp(i, 0, 2); stepA = i;
    if (still()) { paintTurn(i); return; }
    var r = turn.getBoundingClientRect(), span = turn.offsetHeight - innerHeight;
    scrollTo({ top: scrollY + r.top + span * [.08, .5, .9][i], behavior: 'smooth' });
  }
  angs.forEach(function (b) { b.addEventListener('click', function () { goAngle(+b.dataset.ang); }); });
  $$('[data-ang-step]').forEach(function (b) { b.addEventListener('click', function () { goAngle(Math.round(stepA) + (+b.dataset.angStep)); }); });
  mirror.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = mirror.getBoundingClientRect(); rim.style.setProperty('--my', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(1) + 'deg'); rim.style.setProperty('--mx', (-((e.clientY - r.top) / r.height - .5) * 10).toFixed(1) + 'deg'); });
  mirror.addEventListener('pointerleave', function () { rim.style.setProperty('--my', '0deg'); rim.style.setProperty('--mx', '0deg'); });

  // ---------------------------------------------------------------- book: the ticket comes out of the slot, the message types itself
  var slot = $('[data-slot]'), steps = $$('[data-steps] li'), msgEl = $('[data-msg]'), nameIn = $('[data-name]'), sendA = $('[data-send]');
  watch(slot, function (v) { if (v) { slot.classList.add('out'); if (!typedOnce) { typedOnce = true; shown = ''; write(); } } }, { threshold: .25 });
  var typedOnce = false, shown = '', typing = 0;
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  function pick(g) { return $('[data-group="' + g + '"] [aria-pressed="true"]'); }
  $$('.opts').forEach(function (g) { $$('button', g).forEach(function (b) { b.addEventListener('click', function () {
    $$('button', g).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    lightStep(g.dataset.group === 'svc' ? 0 : 1); write();
  }); }); });
  nameIn.addEventListener('input', function () { write(); });
  sendA.addEventListener('pointerenter', function () { lightStep(2); });
  sendA.addEventListener('focus', function () { lightStep(2); });
  function compose() {
    var s = pick('svc'), t = pick('type'), len = pick('len'), nm = nameIn.value.trim().replace(/\s+/g, ' ');
    if (he()) return 'היי דניאל' + (nm ? ', כאן ' + nm : '') + '.\nאשמח לקבוע תור ' + s.dataset.hm + '.\nהשיער שלי ' + t.dataset.hm + ' ו' + len.dataset.hm + '.\nמתי נוח לך?';
    return 'Hi Daniel' + (nm ? ', it’s ' + nm : '') + '.\nI’d like to book ' + s.dataset.en + '.\nMy hair is ' + t.dataset.en + ' and ' + len.dataset.en + '.\nWhen would suit you?';
  }
  function write(instant) {
    var target = compose();
    sendA.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !typedOnce) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }

  // ---------------------------------------------------------------- reviews drift: time + scroll, opposite directions
  var rowsEl = $$('[data-row]'), revs = $('[data-reviews]'), revVis = false, drift = 0, lastT = 0, hold = false;
  watch(revs, function (v) { revVis = v; });
  rowsEl.forEach(function (r) {
    r.innerHTML += r.innerHTML; // a second copy so the run never ends
    r.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hold = true; });
    r.addEventListener('pointerleave', function () { hold = false; });
  });
  $$('.rv').forEach(function (f) { if (f.textContent.length > 420) f.classList.add('long'); });
  (function run(t) {
    var dt = Math.min(64, t - lastT); lastT = t;
    if (!still() && revVis && !hold) drift += dt * .028;
    if (!still()) rowsEl.forEach(function (r) {
      var half = r.scrollWidth / 2, dir = +r.dataset.row, x = ((drift + scrollY * .25) % half);
      var sgn = he() ? 1 : -1;
      r.style.transform = 'translateX(' + (sgn * (dir > 0 ? x : half - x)).toFixed(1) + 'px)';
    });
    requestAnimationFrame(run);
  })(0);

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var nav = $('[data-nav]'), band = $('[data-band]'), lines = $('[data-lines]'), aw = $('[data-awning]'), fsun = $('[data-fsun]'), dock = $('[data-dock]'), book = $('[data-book]'), chairIn = $('.chair-in');
  var lpaths = $$('path', lines);
  lpaths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.dataset.l = L; });
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function enter(el, a, b) { var r = el.getBoundingClientRect(); return clamp((innerHeight * a - r.top) / (innerHeight * b), 0, 1); }
  function resetScroll() {
    chair.style.removeProperty('--open'); chairIn.style.transform = ''; aw.style.removeProperty('--aw'); aw.style.removeProperty('--vs');
    lpaths.forEach(function (p) { p.style.strokeDashoffset = 0; }); band.style.transform = '';
    mimgs.forEach(function (im) { im.style.transform = ''; });
  }
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still();
    nav.classList.toggle('pill', scrollY > 40);
    if (calm) { paintTurn(stepA); return; }
    // band: drifts with the scroll
    band.style.transform = 'translateX(' + ((he() ? 1 : -1) * ((scrollY * .35) % (band.scrollWidth / 2))).toFixed(1) + 'px)';
    // the turn
    var tp = prog(turn), a = smooth((tp - .2) / .2) + smooth((tp - .6) / .2); stepA = a; paintTurn(a);
    // the mirror's light opens the blush field
    var op = enter(chair, 1.05, .75); chair.style.setProperty('--open', (op >= 1 ? 150 : lerp(8, 150, smooth(op))).toFixed(1) + '%');
    // the book card lands over the chair
    var bp = enter(book, 1, .9); chairIn.style.transform = bp > 0 ? 'scale(' + (1 - bp * .05).toFixed(4) + ')' : '';
    // gold double lines draw across the reviews seam
    var lp = smooth(enter(revs, 1, .7)); lpaths.forEach(function (p) { p.style.strokeDashoffset = ((1 - lp) * p.dataset.l).toFixed(1); });
    // the awning unrolls the shopfront
    var ap = smooth(enter(aw, 1, .8)); aw.style.setProperty('--aw', ((1 - ap) * 100).toFixed(2) + '%'); aw.style.setProperty('--vs', (1.15 - ap * .15).toFixed(3));
    // footer sunburst rises
    var fr = fsun.parentElement.getBoundingClientRect(), fp = smooth((innerHeight - fr.top) / fr.height); fsun.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
  }
  // the phone dock steps aside over the ticket's send button and in the footer
  function dockUpdate() {
    if (!dock) return;
    var s = sendA.getBoundingClientRect(), m = $('main').getBoundingClientRect();
    dock.classList.toggle('away', (s.top < innerHeight && s.bottom > innerHeight - 110) || m.bottom < innerHeight * .55);
  }
  addEventListener('scroll', function () { tick(); dockUpdate(); }, { passive: true });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { bulbsArch(); update(); }, 120); });

  texts(root.lang === 'en' ? 'en' : 'he'); hours(); write(true); bulbsArch(); update(); dockUpdate();
  if (still()) { $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); }); slot.classList.add('out'); }
  if (document.fonts) document.fonts.ready.then(function () { bulbsArch(); });
})();
