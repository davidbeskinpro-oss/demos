(function () {
  var root = document.documentElement, WA = '972525100996';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'תמר זריבץ קוסמטיקס · אקנה, פוסט אקנה ושיקום העור · קרית מוצקין', en: 'Tamar Zarivach Cosmetics · Acne, post-acne & skin rehabilitation · Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור תמר זריבץ קוסמטיקס · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Tamar Zarivach Cosmetics · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('[data-alt-he]').forEach(function (i) { var t = i.dataset[l === 'he' ? 'altHe' : 'altEn']; if (i.tagName === 'IMG') i.alt = t; else i.setAttribute('aria-label', t); });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'תמר זריבץ קוסמטיקס', 'Tamar Zarivach Cosmetics');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לתמר', 'WhatsApp Tamar');
    aria('[data-t-call]', 'התקשרו לתמר, 052-510-0996', 'Call Tamar, 052-510-0996');
    aria('[data-t-ba]', 'הזיזו כדי להשוות לפני ואחרי', 'Move to compare before and after');
    aria('[data-t-stages]', 'שלבים', 'Stages');
    aria('[data-t-what]', 'על מה מדובר', 'What it is about');
    aria('[data-t-hour]', 'שעה מועדפת', 'Preferred time');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tz-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('tz-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); loop.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status (Israel time); null = closed
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { if (x >= 24) return '24:00'; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] >= 24) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
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
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline letters
  $$('[data-split] > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // labels decode out of scrambled glyphs as they arrive
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPRSTUVWXYZ' };
  function decode(el) {
    $$('span[lang]', el).forEach(function (sp) {
      var txt = sp.dataset.txt || (sp.dataset.txt = sp.textContent), set = GL[sp.lang], t0 = performance.now();
      if (still()) { sp.textContent = txt; return; }
      (function st(t) {
        var u = clamp((t - t0) / 900, 0, 1), n = Math.floor(u * txt.length);
        sp.textContent = txt.slice(0, n) + txt.slice(n).replace(/[^\s·]/g, function () { return set[Math.floor(Math.random() * set.length)]; });
        if (u < 1) requestAnimationFrame(st); else sp.textContent = txt;
      })(t0);
    });
  }
  $$('[data-decode]').forEach(function (el) { watch(el, function (v) { if (v && !el._done) { el._done = 1; decode(el); } }, { threshold: .6 }); });

  // odometers
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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 300); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- reeded glass: vertical flutes, each a magnified slice of the photo.
  // k = 0 is clear glass (the slices line up into the plain photo), k = 1 is fully fluted.
  function Reed(el) {
    var src = el.dataset.src, iw = +el.dataset.iw, ih = +el.dataset.ih, fx = +el.dataset.fx, fy = +el.dataset.fy;
    var S = [], W = 0, Hh = 0, sw = 20, s0 = 1, ox = 0, oy = 0, last = [];
    function build() {
      W = el.clientWidth; Hh = el.clientHeight; if (!W || !Hh) return;
      sw = W < 500 ? 13 : W < 900 ? 16 : 20;
      var n = Math.ceil(W / sw); el.innerHTML = ''; S = []; last = [];
      s0 = Math.max(W / iw, Hh / ih); ox = (W - iw * s0) * fx; oy = (Hh - ih * s0) * fy;
      for (var i = 0; i < n; i++) {
        var d = document.createElement('i');
        d.style.left = (i * sw) + 'px'; d.style.width = (sw + 1) + 'px';
        d.style.backgroundImage = 'url(' + src + ')';
        el.appendChild(d); S.push(d); last.push(-1);
      }
    }
    function set(kfn) {
      for (var i = 0; i < S.length; i++) {
        var cx = i * sw + sw / 2, k = clamp(kfn(cx / W), 0, 1);
        if (Math.abs(k - last[i]) < .004) continue; last[i] = k;
        var m = 1 + 1.1 * k, wob = k * sw * .45 * Math.sin(i * 1.93), u = (cx - ox) / s0;
        var st = S[i].style;
        st.backgroundSize = (iw * s0 * m).toFixed(1) + 'px ' + (ih * s0).toFixed(1) + 'px';
        st.backgroundPosition = ((cx - i * sw) - u * s0 * m + wob).toFixed(1) + 'px ' + oy.toFixed(1) + 'px';
        st.setProperty('--k', k.toFixed(3));
      }
    }
    return { build: build, set: set, el: el };
  }
  var reeds = {}; $$('[data-reed]').forEach(function (el) { reeds[el.dataset.reed] = Reed(el); });

  // ---------------------------------------------------------------- hero: the partition
  var hero = $('[data-hero]'), stage = $('[data-stage]'), pane = $('[data-pane]'), slot = $('[data-slot]'), hcopy = $('[data-hcopy]'), tag = $('.pane-tag', pane), nav = $('[data-nav]');
  var slotIn = [0, 0, 0, 0], heroVis = true, px = .5, pAim = .5, clearAmt = 0, lastPtr = -1e9, heroE = 0;
  function heroLayout() {
    var s = stage.getBoundingClientRect(), r = slot.getBoundingClientRect();
    slotIn = [r.top - s.top, s.right - r.right, s.bottom - r.bottom, r.left - s.left];
    reeds.hero.build();
  }
  stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); pAim = (e.clientX - r.left) / r.width; lastPtr = performance.now(); });
  stage.addEventListener('pointerdown', function (e) { var r = stage.getBoundingClientRect(); pAim = (e.clientX - r.left) / r.width; lastPtr = performance.now(); });
  watch(hero, function (v) { heroVis = v; loop.kick(); });

  function heroFrame(t) {
    var calm = still(), vh = innerHeight, e = 0;
    if (!calm) { var hr = hero.getBoundingClientRect(); e = smooth(-hr.top / (vh * .95)); }
    heroE = e;
    var ins = slotIn.map(function (v) { return lerp(v, 0, e); });
    pane.style.setProperty('--ct', ins[0].toFixed(1) + 'px'); pane.style.setProperty('--cr', ins[1].toFixed(1) + 'px');
    pane.style.setProperty('--cb', ins[2].toFixed(1) + 'px'); pane.style.setProperty('--cl', ins[3].toFixed(1) + 'px');
    pane.style.setProperty('--cr2', lerp(28, 0, e).toFixed(1) + 'px');
    pane.style.setProperty('--zs', lerp(1.06, 1, e).toFixed(4));
    tag.style.top = (stage.clientHeight - ins[2] - 54) + 'px';
    tag.style[rtl() ? 'left' : 'right'] = (ins[rtl() ? 3 : 1] + 18) + 'px'; tag.style[rtl() ? 'right' : 'left'] = 'auto';
    hcopy.style.opacity = calm ? '' : (1 - clamp(e * (phone() ? 3.2 : 1.6), 0, 1)).toFixed(3);
    hcopy.style.translate = calm ? '' : '0 ' + (-e * 70).toFixed(1) + 'px';
    // where the glass is cleared: under the hand, or a band that glides by itself
    var idle = t - lastPtr > 2500;
    if (!calm && idle) pAim = .5 + .42 * Math.sin(t / 2600);
    px = calm ? .5 : lerp(px, pAim, .12);
    clearAmt = calm ? .9 : lerp(clearAmt, 1, .08);
    var g = calm ? .6 : lerp(1, 0, smooth(e * 1.15)), R = phone() ? .2 : .1;
    reeds.hero.set(function (x) { var d = Math.abs(x - px) / R; return g * (1 - clearAmt * (1 - smooth(d))); });
    beams(t, e);
  }

  // light falling through the glass: soft vertical bands drift across the oat ground
  var bc = $('[data-beams]'), bx = bc.getContext('2d'), BW = 0, BH = 0;
  function beamsSize() { var d = Math.min(1.5, devicePixelRatio || 1); BW = stage.clientWidth; BH = stage.clientHeight; bc.width = BW * d; bc.height = BH * d; bx.setTransform(d, 0, 0, d, 0, 0); }
  var BANDS = [[.08, 80, .5, '255,246,234'], [.22, 40, .35, '240,205,185'], [.36, 120, .45, '255,250,242'], [.55, 30, .3, '236,196,176'], [.7, 90, .4, '255,246,234'], [.86, 50, .35, '240,205,185']];
  function beams(t, e) {
    bx.clearRect(0, 0, BW, BH);
    var calm = still(), sh = calm ? 0 : t / 1000;
    BANDS.forEach(function (b, i) {
      var x = ((b[0] + Math.sin(sh * .18 + i * 1.7) * .05 + (px - .5) * .06 * (i % 2 ? 1 : -1)) % 1) * BW, w = b[1] * (BW / 1400 + .4);
      var a = 1.5 * b[2] * (calm ? .8 : .7 + .3 * Math.sin(sh * .5 + i)) * (1 - e);
      var gr = bx.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, 'rgba(' + b[3] + ',0)'); gr.addColorStop(.5, 'rgba(' + b[3] + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + b[3] + ',0)');
      bx.fillStyle = gr; bx.save(); bx.translate(x, 0); bx.transform(1, 0, -.18, 1, 0, 0); bx.translate(-x, 0); bx.fillRect(x - w, 0, w * 2 + BH * .2, BH); bx.restore();
    });
  }

  // ---------------------------------------------------------------- before / after rod
  var ba = $('[data-ba]'), baR = $('[data-ba-range]'), baUser = false, clearSec = $('[data-clear]');
  function baSet(v) { ba.style.setProperty('--p', v + '%'); baR.value = v; }
  baR.addEventListener('input', function () { baUser = true; baSet(+baR.value); });

  // three stages
  var s3b = $$('[data-s3-btn]'), s3cur = 0, s3User = false;
  function s3Set(n, user) {
    if (user) s3User = true;
    if (n === s3cur) return; s3cur = n;
    s3b.forEach(function (b, i) { b.setAttribute('aria-pressed', i === n ? 'true' : 'false'); });
  }
  s3b.forEach(function (b, i) { b.addEventListener('click', function () { s3Set(i, true); }); });

  // ---------------------------------------------------------------- shelves light up in the middle of the screen
  $$('[data-shelf]').forEach(function (s) {
    if (io) new IntersectionObserver(function (es) { s.classList.toggle('lit', es[0].isIntersecting); }, { rootMargin: '-38% 0px -38% 0px' }).observe(s);
    s.addEventListener('pointermove', function (e) { var r = s.getBoundingClientRect(); s.style.setProperty('--mx', (e.clientX - r.left) + 'px'); s.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // reviews: the fluted glass clears in the middle band
  $$('[data-rv]').forEach(function (r) {
    if (io) new IntersectionObserver(function (es) { if (es[0].isIntersecting) r.classList.add('clear-on'); else if (es[0].boundingClientRect.top > 0) r.classList.remove('clear-on'); }, { rootMargin: '-22% 0px -22% 0px' }).observe(r);
    else r.classList.add('clear-on');
  });

  // ---------------------------------------------------------------- Tamar: the sliding pane, the leaning photo
  var tbig = $('[data-tbig]'), tilt = $('[data-tilt]'), tamarSec = $('[data-tamar]');
  if (matchMedia('(hover: hover)').matches) {
    tamarSec.addEventListener('pointermove', function (e) { if (still()) return; var r = tilt.getBoundingClientRect(), dx = (e.clientX - r.left - r.width / 2) / innerWidth, dy = (e.clientY - r.top - r.height / 2) / innerHeight; tilt.style.setProperty('--ry', (dx * 18).toFixed(2) + 'deg'); tilt.style.setProperty('--rx', (-dy * 14).toFixed(2) + 'deg'); });
    tamarSec.addEventListener('pointerleave', function () { tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg'); });
  }

  // ---------------------------------------------------------------- the message
  var wants = $$('[data-want]'), hourIn = $('[data-hour]'), hourOut = $('[data-hour-out]'), strip = $('[data-strip]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), send = $('[data-send]');
  var shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  wants.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  function hourUI() { var v = +hourIn.value; hourOut.textContent = v + ':00'; strip.style.setProperty('--v', ((v - 9) / 10).toFixed(3)); }
  hourIn.addEventListener('input', function () { hourUI(); lightStep(1); write(); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = wants.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var h = hourIn.value + ':00';
    if (l) return picked.length ? 'היי תמר, אשמח לקבוע תור ל' + list(picked, true) + '. נוח לי בסביבות ' + h + '. תודה!' : 'היי תמר, אשמח לשמוע על הטיפולים ולקבוע תור. נוח לי בסביבות ' + h + '. תודה!';
    return picked.length ? 'Hi Tamar, I’d like to book an appointment for ' + list(picked, false) + '. Around ' + h + ' suits me. Thanks!' : 'Hi Tamar, I’d like to hear about the treatments and book an appointment. Around ' + h + ' suits me. Thanks!';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one loop: hero runs while it is on screen; the rest follows the scroll
  var vial = $('[data-vial]'), foot = $('[data-foot]');
  function prog(el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (r.height + vh * (a - b)), 0, 1); }
  function scrollParts() {
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    vial.classList.toggle('show', scrollY > vh * .6);
    // before/after: the rod follows the scroll until a hand takes it
    if (!baUser) baSet(calm ? 50 : Math.round(lerp(88, 12, smooth(prog(ba, 1, .25)))));
    if (!s3User && !calm) { var sp = prog($('[data-s3]'), .9, .3); s3Set(sp < .34 ? 0 : sp < .67 ? 1 : 2); }
    // Tamar: a pane of fluted glass slides across the photo
    var tp = calm ? -1 : prog(tbig, 1, 0), a = calm ? .52 : lerp(-.5, 1.05, tp);
    reeds.tamar.set(function (x) { var d = x < a ? (a - x) : x > a + .45 ? x - a - .45 : 0; return 1 - smooth(d / .03); });
    if (!calm && !matchMedia('(hover: hover)').matches) tilt.style.setProperty('--ry', (lerp(-10, 10, tp) * (rtl() ? -1 : 1)).toFixed(2) + 'deg');
    // the corridor beside the questions: clear in the middle of the screen, fluted at the edges
    var ap = calm ? .5 : prog($('.f-arch'), 1, 0);
    reeds.arch.set(function (x) { return calm ? .35 : clamp(Math.abs(ap - .5) * 2.4 - .1 + Math.abs(x - .5) * .5, 0, 1); });
    // footer: the flutes straighten as you arrive, until the logo reads sharp
    var fp = calm ? 1 : smooth(prog(foot, 1, .55) * 1.25);
    reeds.foot.set(function () { return 1 - fp; });
  }
  var loop = (function () {
    var raf = 0, dirty = true;
    function frame(t) {
      raf = 0;
      if (dirty) { dirty = false; scrollParts(); }
      if (heroVis || still()) heroFrame(t);
      if (heroVis && !still()) raf = requestAnimationFrame(frame);
    }
    return { kick: function () { dirty = true; if (!raf) raf = requestAnimationFrame(frame); } };
  })();

  function layout() { heroLayout(); beamsSize(); Object.keys(reeds).forEach(function (k) { if (k !== 'hero') reeds[k].build(); }); hourUI(); loop.kick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', loop.kick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); loop.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', layout);
})();
