(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sm = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var progress = function (el) { var r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : (r.top < 0 ? 1 : 0); };
  var hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var WA = '972542144205';

  // ---------------------------------------------------------------- language
  var refreshers = [];
  function texts(l) {
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('.nav-links', 'ניווט', 'Navigation');
    aria('.st-prev', 'הקודם', 'Previous');
    aria('.st-next', 'הבא', 'Next');
    aria('.coat', 'איור של פרווה שאפשר לסרק', 'Drawing of a coat you can comb');
    aria('.belt', 'שלבי הטיפול', 'Grooming steps');
    aria('.balls', 'יצירת קשר', 'Contact');
    aria('.band', 'הטיפולים', 'Treatments');
    aria('.slide-tall .s-range', 'לפני ואחרי: מלטז', 'Before and after: Maltese');
    aria('.slide-wide .s-range', 'לפני ואחרי: שיצו', 'Before and after: Shih Tzu');
    aria('.ruler input', 'גובה בס״מ', 'Height in cm');
    $$('[data-aria-he]').forEach(function (el) { el.setAttribute('aria-label', el.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    $('.t-map iframe').title = l === 'he' ? 'מפה: זבולון 1, קריית טבעון' : 'Map: 1 Zevulun St., Kiryat Tivon';
    document.title = l === 'he' ? 'סימסים · סימה בסקין · ספרית כלבים וחתולים · קריית טבעון' : 'SimSim · Sima Beskin · dog & cat groomer · Kiryat Tivon';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr'; store('lang', l);
    texts(l); refreshers.forEach(function (f) { f(); });
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var motionFns = [];
  function motionUI() { $$('[data-motion]').forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  $$('[data-motion]').forEach(function (b) { b.addEventListener('click', function () {
    var off = !still(); root.classList.toggle('still', off); store('motion', off ? 'off' : 'on'); motionUI();
    motionFns.forEach(function (f) { f(); });
  }); });

  // ---------------------------------------------------------------- headline letters (accent words keep their face)
  function splitInto(node, counter) {
    [].slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          part.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', counter.i++); s.textContent = ch; w.appendChild(s); });
          frag.appendChild(w);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) splitInto(n, counter);
    });
  }
  $$('.fill-h > span[lang]').forEach(function (s) {                           // screen readers get the sentence, not letters
    var txt = s.textContent.replace(/\s+/g, ' ').trim(), vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true'); while (s.firstChild) vis.appendChild(s.firstChild);
    var sr = document.createElement('span'); sr.className = 'vh'; sr.textContent = txt;
    s.appendChild(sr); s.appendChild(vis); splitInto(vis, { i: 0 });
  });
  var fw = $('.foot-word');
  fw.innerHTML = fw.textContent.split('').map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join('');

  // ---------------------------------------------------------------- reveals
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal], [data-tile], .foot-word, .door .note').forEach(function (el, i) {
    el.style.setProperty('--d', (i % 4) * 80 + 'ms');
    rio ? rio.observe(el) : el.classList.add('in');
  });

  // ---------------------------------------------------------------- opening -> hero: the prints are dealt onto the mat
  var deck = $('[data-deck]');
  (function () {
    var inn = document.createElement('div'); inn.className = 'deck-in';
    while (deck.firstChild) inn.appendChild(deck.firstChild);
    deck.appendChild(inn);
  })();
  function opened() {
    $('.fill-h').classList.add('in');
    if (still()) { deck.classList.add('dealt'); return; }
    deck.classList.add('dealing');
    setTimeout(function () { deck.classList.remove('dealing'); deck.classList.add('dealt'); }, 1500);
  }
  if (root.classList.contains('opened')) requestAnimationFrame(opened); else addEventListener('simsim-opened', opened, { once: true });
  setTimeout(function () { if (!deck.classList.contains('dealt') && !deck.classList.contains('dealing')) { root.classList.add('opened'); opened(); } }, 2600);
  if (hoverable) $('.hero').addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = deck.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    deck.firstChild.style.setProperty('--ty', (x * 10).toFixed(2) + 'deg'); deck.firstChild.style.setProperty('--tx', (-y * 8).toFixed(2) + 'deg');
  });

  // ---------------------------------------------------------------- nav gathers into a pill
  var nav = $('#nav');

  // ---------------------------------------------------------------- cursor spotlight on tiles, tilt on her card
  if (hoverable) {
    $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
    $$('[data-tilt]').forEach(function (f) {
      var img = $('img', f);
      f.addEventListener('pointermove', function (e) { if (still()) return; var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; img.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); img.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg'); });
      f.addEventListener('pointerleave', function () { img.style.setProperty('--ry', '0deg'); img.style.setProperty('--rx', '0deg'); });
    });
  }

  // ---------------------------------------------------------------- hero: clippings drifting in the lamp light
  var hairs = (function () {
    var hero = $('.hero'), cv = $('.hero-hairs'), c = cv.getContext('2d'), H = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    var COLS = ['#e8d2ad', '#f3e4c8', '#d8b48a', '#c9945f', '#6b625a', '#a39684'];
    function make(any) { return { x: Math.random() * w, y: any ? Math.random() * h : -30, vx: 0, vy: 8 + Math.random() * 16, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.8, l: 10 + Math.random() * 30, bend: (Math.random() - 0.5) * 0.9, col: COLS[Math.floor(Math.random() * COLS.length)], lw: 0.8 + Math.random() * 1.4, ph: Math.random() * 6.28 }; }
    function size() { var dpr = Math.min(devicePixelRatio || 1, 2); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); H = []; for (var i = 0; i < (w < 700 ? 30 : 64); i++) H.push(make(true)); }
    function frame(now) {
      raf = 0; var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      c.clearRect(0, 0, w, h); c.lineCap = 'round';
      H.forEach(function (p, i) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (1 - d2 / 14000) * 260; p.vx += dx / Math.sqrt(d2 + 1) * f * dt; p.vy += dy / Math.sqrt(d2 + 1) * f * dt; p.va += (Math.random() - 0.5) * 4 * dt; }
        p.vx *= 0.97; p.vy = lerp(p.vy, 12 + (i % 5) * 3, 0.02);
        p.x += (p.vx + Math.sin(now / 1400 + p.ph) * 9) * dt; p.y += p.vy * dt; p.a += p.va * dt;
        if (p.y > h + 40 || p.x < -60 || p.x > w + 60) H[i] = make(false);
        var cx = Math.cos(p.a) * p.l / 2, cy = Math.sin(p.a) * p.l / 2;
        c.strokeStyle = p.col; c.lineWidth = p.lw; c.beginPath(); c.moveTo(p.x - cx, p.y - cy); c.quadraticCurveTo(p.x - cy * p.bend, p.y + cx * p.bend, p.x + cx, p.y + cy); c.stroke();
      });
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    size();
    return { size: size, kick: function () { if (still()) c.clearRect(0, 0, w, h); kick(); } };
  })();

  // ---------------------------------------------------------------- paw prints walk down the page as you scroll
  var paws = (function () {
    var box = $('.paws'), main = $('#main'), list = [];
    var SVG = '<svg viewBox="0 0 24 28"><ellipse cx="12" cy="19.5" rx="6.6" ry="5.6" fill="currentColor"/><ellipse cx="4.6" cy="11" rx="2.6" ry="3.3" transform="rotate(-20 4.6 11)" fill="currentColor"/><ellipse cx="9.3" cy="6.4" rx="2.6" ry="3.4" fill="currentColor"/><ellipse cx="14.7" cy="6.4" rx="2.6" ry="3.4" fill="currentColor"/><ellipse cx="19.4" cy="11" rx="2.6" ry="3.3" transform="rotate(20 19.4 11)" fill="currentColor"/></svg>';
    function build() {
      box.innerHTML = ''; list = [];
      var W = main.clientWidth, step = innerWidth < 700 ? 54 : 64, mt = main.getBoundingClientRect().top + scrollY;
      var skip = ['#noleash', '#touch'].map(function (s) { var el = $(s), r = el.getBoundingClientRect(); return [r.top + scrollY - mt - 20, r.bottom + scrollY - mt + 20]; });
      var wetFrom = skip[1][1], edge = innerWidth < 700 ? 9 : 34, startY = $('#sima').offsetTop - 40, endY = main.scrollHeight - 60, k = 0, html = '';
      for (var y = startY; y < endY; y += step) {
        if (skip.some(function (s) { return y > s[0] && y < s[1]; })) continue;
        var side = k % 2 ? 1 : -1, sway = Math.sin(y / 420) * (innerWidth < 700 ? 3 : 16);
        var xFromEnd = edge + sway + side * (innerWidth < 700 ? 4 : 8), x = rtl() ? xFromEnd : W - xFromEnd;
        var wet = y > wetFrom && y < wetFrom + step * 9;
        html += '<span class="paw' + (wet ? ' wet' : '') + '" style="left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px;--a:' + (180 + side * 8 + Math.cos(y / 420) * 6).toFixed(1) + 'deg">' + SVG + '</span>';
        list.push(y); k++;
      }
      box.innerHTML = html;
      list = $$('.paw', box).map(function (el, i) { return { el: el, y: list[i], on: false }; });
      scroll();
    }
    function scroll(mt) {
      if (mt == null) mt = main.getBoundingClientRect().top;
      var line = innerHeight * 0.82 - mt;
      list.forEach(function (p) { var on = still() || p.y < line; if (on !== p.on) { p.on = on; p.el.classList.toggle('on', on); } });
    }
    return { build: build, scroll: scroll };
  })();

  // ---------------------------------------------------------------- no leash: down the measuring stick, through her photos
  var drop = (function () {
    var sec = $('#noleash'), shots = $$('.shot', sec), tags = $$('.tag', sec), cord = $('.cord-g', sec), stick = $('.stick', sec), inn = $('.stick-in', sec);
    var stepper = $('[data-stepper="drop"]'), step = 0, N = shots.length, lastTag = -1, pxPerCm = 8;
    var stickH = 0;
    function ticks() {
      var hgt = stickH = stick.clientHeight; pxPerCm = hgt / 50;
      var html = '';
      for (var cm = 0; cm <= 100; cm += 2) {
        var y = (100 - cm) * pxPerCm, long = cm % 10 === 0;
        html += '<i style="top:' + y.toFixed(1) + 'px;width:' + (long ? 20 : cm % 4 === 0 ? 12 : 8) + 'px"></i>';
        if (long) html += '<b style="top:' + y.toFixed(1) + 'px">' + cm + '</b>';
      }
      inn.innerHTML = html;
    }
    function state(pr) {
      var fall = sm((pr - 0.04) / 0.14), t = clamp((pr - 0.2) / 0.74, 0, 1) * (N - 1), i = Math.floor(t), f = t - i;
      var pos = Math.min(N - 1, i + sm((f - 0.25) / 0.5));                     // dwell on each photo, glide between them
      return { fall: fall, pos: pos };
    }
    function apply(st) {
      shots.forEach(function (s, i) { var d = i - st.pos; s.style.setProperty('--y', (d * 100).toFixed(2) + '%'); s.style.setProperty('--py', (d * -16).toFixed(2) + '%'); });
      var f = st.fall;
      cord.setAttribute('transform', 'translate(0 ' + (f * f * 520).toFixed(1) + ') rotate(' + (f * 28).toFixed(1) + ' 100 34)');
      cord.style.opacity = (1 - sm((f - 0.7) / 0.3)).toFixed(3);
      var cm = 90 - st.pos * 30;
      inn.style.setProperty('--sy', (stickH / 2 - (100 - cm) * pxPerCm).toFixed(1) + 'px');
      var ti = Math.round(st.pos);
      if (ti !== lastTag) { tags.forEach(function (t, i) { t.classList.toggle('on', i === ti); }); lastTag = ti; }
    }
    function setStep(k) {
      step = clamp(k, 0, N - 1); apply({ fall: 1, pos: step });
      $('.st-count', stepper).textContent = (step + 1) + ' / ' + N;
      $('.st-prev', stepper).disabled = step === 0; $('.st-next', stepper).disabled = step === N - 1;
    }
    $('.st-prev', stepper).addEventListener('click', function () { setStep(step - 1); });
    $('.st-next', stepper).addEventListener('click', function () { setStep(step + 1); });
    function scroll(pr) { if (!still()) apply(state(pr == null ? progress(sec) : pr)); }
    function mode() { stepper.hidden = !still(); ticks(); if (still()) setStep(step); else scroll(); }
    return { scroll: scroll, mode: mode, sec: sec, layout: function () { ticks(); still() ? setStep(step) : scroll(); } };
  })();

  // ---------------------------------------------------------------- the coat: comb it, then the whole groom
  var touch = (function () {
    var sec = $('#touch'), cv = $('.coat'), lines = $$('.tl', sec), tools = $$('.tool[data-go]', sec), kn = $('.kn'), hint = $('.coat-hint');
    var stepper = $('[data-stepper="touch"]'), step = 0, STEPS = [0, 1, 1.45, 2.6, 4], vis = false, lastLine = -1;
    var coat = new window.Coat(cv, { flip: rtl(), onChange: function () { ui(coat.p); } });
    function count() { kn.textContent = coat.removed() + ' / ' + coat.mats.length; }
    cv.addEventListener('pointermove', function () { hint.classList.add('gone'); }, { once: true });
    cv.addEventListener('pointerdown', function () { hint.classList.add('gone'); }, { once: true });
    function pOf(pr) { return clamp((pr - 0.06) / 0.88, 0, 1) * 4; }
    function ui(p) {
      var li = p < 0.12 ? (coat.removed() < coat.mats.length ? 0 : 1) : Math.min(4, Math.floor(p) + 1);
      if (li !== lastLine) { lines.forEach(function (l, i) { l.classList.toggle('on', i === li); l.setAttribute('aria-hidden', i === li ? 'false' : 'true'); }); lastLine = li; }
      tools.forEach(function (b, i) { b.style.setProperty('--fill', (i === 0 ? (li === 0 ? 1 : 0) : clamp(p - (i - 1), 0, 1)).toFixed(3)); b.classList.toggle('on', li === i); });
      count();
    }
    function set(p) { coat.set(p); ui(p); }
    function scroll(pr) { if (!still()) set(pOf(pr == null ? progress(sec) : pr)); }
    tools.forEach(function (b) { b.addEventListener('click', function () {
      var k = +b.dataset.go;
      if (still()) { setStep(k); return; }
      var target = k === 0 ? 0 : k - 1 + 0.6, r = sec.getBoundingClientRect();
      scrollTo({ top: scrollY + r.top + (0.06 + target / 4 * 0.88) * (sec.offsetHeight - innerHeight), behavior: 'smooth' });
    }); });
    $('[data-reset]').addEventListener('click', function () { coat.reset(); if (!still()) scrollTo({ top: scrollY + sec.getBoundingClientRect().top, behavior: 'smooth' }); else setStep(0); });
    function setStep(k) {
      step = clamp(k, 0, STEPS.length - 1); set(STEPS[step]);
      $('.st-count', stepper).textContent = (step + 1) + ' / ' + STEPS.length;
      $('.st-prev', stepper).disabled = step === 0; $('.st-next', stepper).disabled = step === STEPS.length - 1;
    }
    $('.st-prev', stepper).addEventListener('click', function () { setStep(step - 1); });
    $('.st-next', stepper).addEventListener('click', function () { setStep(step + 1); });
    function run() { if (vis && !still()) coat.start(); else coat.stop(); }
    watch(sec, function (v) { vis = v; run(); });
    function mode() { stepper.hidden = !still(); if (still()) setStep(step); else scroll(); run(); }
    function resize() { coat.flip = rtl(); coat.resize(); if (still()) set(STEPS[step]); else scroll(); }
    return { scroll: scroll, mode: mode, resize: resize, sec: sec };
  })();

  // ---------------------------------------------------------------- before / after: the comb opens it
  $$('[data-ba]').forEach(function (f) {
    var r = $('.s-range', f), seen = false;
    function setX(v) { f.style.setProperty('--x', v + '%'); r.value = v; }
    r.addEventListener('input', function () { setX(+r.value); });
    watch(f, function (v) {
      if (!v || seen || still()) return; seen = true;
      var t0 = performance.now(), path = [50, 88, 12, 50], dur = 2600;
      (function tick(now) { var k = clamp((now - t0) / dur, 0, 1), seg = Math.min(2, Math.floor(k * 3)), u = sm(k * 3 - seg); setX(lerp(path[seg], path[seg + 1], u).toFixed(1)); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: 0.5 });
  });

  // ---------------------------------------------------------------- the band: a seamless loop of her treatments
  (function () { var ul = $('.band-list'); $$('li', ul).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); ul.appendChild(c); }); })();

  // ---------------------------------------------------------------- the fridge: prints develop, tap to pick one up
  var pols = $$('.pol');
  pols.forEach(function (p, i) {
    $('img', p).style.animationDelay = (i % 4) * 220 + 'ms';
    watch(p, function (v) { if (v) p.classList.add('dev'); }, { threshold: 0.35 });
    var b = $('.pol-b', p);
    b.addEventListener('click', function () {
      var up = !p.classList.contains('up');
      pols.forEach(function (q) { q.classList.remove('up'); $('.pol-b', q).setAttribute('aria-pressed', 'false'); });
      p.classList.toggle('up', up); b.setAttribute('aria-pressed', up ? 'true' : 'false');
    });
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') pols.forEach(function (q) { q.classList.remove('up'); $('.pol-b', q).setAttribute('aria-pressed', 'false'); }); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (el) {
    var val = +el.dataset.odo, done = false;
    function roll() {
      if (done) return; done = true;
      if (still()) { el.textContent = val.toFixed(1); return; }
      var t0 = performance.now();
      (function tick(now) { var k = clamp((now - t0) / 1300, 0, 1); el.textContent = (val * (1 - Math.pow(1 - k, 3))).toFixed(1); if (k < 1) requestAnimationFrame(tick); })(t0);
    }
    if (still()) roll(); else { el.textContent = '0.0'; watch(el, function (v) { if (v) roll(); }, { threshold: 0.6 }); }
    motionFns.push(function () { if (still()) { done = true; el.textContent = val.toFixed(1); } });
  });

  // ---------------------------------------------------------------- hours and live status (Asia/Jerusalem)
  var HOURS = [[8, 20], [8, 20], [8, 20], [8, 20], [8, 20], [8, 16], null];   // Sun..Sat
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function hours() {
    var rows = [{ days: '0,1,2,3,4', he: 'ראשון עד חמישי', en: 'Sunday to Thursday', t: HOURS[0] }, { days: '5', he: 'שישי', en: 'Friday', t: HOURS[5] }, { days: '6', he: 'שבת', en: 'Saturday', t: null }];
    $('[data-hours]').innerHTML = rows.map(function (r) { return '<tr data-days="' + r.days + '"><td>' + (he() ? r.he : r.en) + '</td><td dir="ltr">' + (r.t ? hhmm(r.t[0]) + '–' + hhmm(r.t[1]) : (he() ? 'סגור' : 'Closed')) + '</td></tr>'; }).join('');
    status();
  }
  function status() {
    var n = now(), t = HOURS[n.d], open = !!t && n.h >= t[0] && n.h < t[1], txt;
    if (open) txt = he() ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]);
    else {
      var k = 0, d = n.d;
      if (!(t && n.h < t[0])) { do { k++; d = (n.d + k) % 7; } while (!HOURS[d] && k < 7); }
      var when = k === 0 ? (he() ? 'היום' : 'today') : k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAY_HE[d] : 'on ' + DAY_EN[d]);
      txt = he() ? 'סגור עכשיו · נפתח ' + when + ' ב־' + hhmm(HOURS[d][0]) : 'Closed now · opens ' + when + ' at ' + hhmm(HOURS[d][0]);
    }
    var el = $('[data-status]'); el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt;
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', r.dataset.days.split(',').indexOf(String(n.d)) >= 0); });
  }
  hours(); setInterval(status, 60000);

  // ---------------------------------------------------------------- the grooming passport writes the message
  var form = $('[data-composer]'), prev = $('[data-preview]'), send = $('[data-send]'), fhv = $('.fh-v');
  function message() {
    var v = function (n) { var x = form.querySelector('[name="' + n + '"]:checked'); return x ? x.value : ''; };
    var name = form.name.value.trim(), cat = v('who') === 'cat', cm = form.cm.value;
    if (he()) {
      var whom = name ? 'ל' + name : cat ? 'לחתול שלי' : 'לכלב שלי';
      var coat = { ok: 'הפרווה רגילה', knots: 'יש לו קשרים בפרווה', long: 'הפרווה ארוכה ועבה' }[v('coat')];
      var mood = { calm: 'הוא רגוע', nervous: 'הוא קצת לחוץ', touch: 'הוא לא אוהב שנוגעים בו' }[v('mood')];
      return 'היי סימה, אשמח לקבוע טיפול ' + whom + '. ' + (cat ? 'חתול' : 'כלב') + ' בגובה של בערך ' + cm + ' ס״מ, ' + coat + '. ' + mood + '. מתי נוח לך?';
    }
    var coatE = { ok: 'a normal coat', knots: 'his coat has knots', long: 'a long, thick coat' }[v('coat')];
    var moodE = { calm: 'He’s calm', nervous: 'He gets a bit nervous', touch: 'He doesn’t like being touched' }[v('mood')];
    return 'Hi Sima, I’d like to book a groom for ' + (name || (cat ? 'my cat' : 'my dog')) + '. A ' + (cat ? 'cat' : 'dog') + ' about ' + cm + ' cm at the shoulder, ' + coatE + '. ' + moodE + '. When would suit you?';
  }
  function compose() { fhv.textContent = form.cm.value; var m = message(); prev.textContent = m; send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m); }
  form.addEventListener('input', compose); form.addEventListener('change', compose);
  function placeholder() { form.name.placeholder = he() ? 'לא חובה' : 'Optional'; }
  function waLinks() { $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'היי סימה, אשמח לקבוע תספורת' : 'Hi Sima, I’d like to book a groom'); }); }
  placeholder(); compose(); waLinks();

  // ---------------------------------------------------------------- footer: clippings fall and pile up under her card
  var pile = (function () {
    var foot = $('.foot'), cv = $('.pile-cv'), c = cv.getContext('2d'), w = 0, h = 0, dpr = 1, bins = [], falling = [], settled, sc, raf = 0, vis = false, last = 0;
    var COLS = ['#e8d2ad', '#f3e4c8', '#d8b48a', '#c9945f', '#3a332c', '#8f8579'], BIN = 6;
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2); w = foot.clientWidth; h = foot.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      settled = document.createElement('canvas'); settled.width = cv.width; settled.height = cv.height; sc = settled.getContext('2d'); sc.setTransform(dpr, 0, 0, dpr, 0, 0); sc.lineCap = 'round';
      bins = new Array(Math.ceil(w / BIN) + 1).fill(0); falling = [];
    }
    function spawn() { falling.push({ x: Math.random() * w, y: -20, vy: 30 + Math.random() * 40, vx: (Math.random() - 0.5) * 16, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 3, l: 8 + Math.random() * 20, col: COLS[Math.floor(Math.random() * COLS.length)], ph: Math.random() * 6.28 }); }
    function frame(now) {
      raf = 0; var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (falling.length < 70 && Math.random() < 0.7) spawn();
      c.clearRect(0, 0, w, h); c.drawImage(settled, 0, 0, w, h); c.lineCap = 'round'; c.lineWidth = 1.3;
      falling = falling.filter(function (p) {
        p.vy = Math.min(p.vy + 40 * dt, 90); p.x += (p.vx + Math.sin(now / 600 + p.ph) * 14) * dt; p.y += p.vy * dt; p.a += p.va * dt;
        var b = clamp(Math.floor(p.x / BIN), 0, bins.length - 1), floor = h - bins[b];
        var dx = Math.cos(p.a) * p.l / 2, dy = Math.sin(p.a) * p.l / 2;
        if (p.y + Math.abs(dy) >= floor) {                                       // lands, lies down, the pile grows a little
          var ly = floor - 1, la = (Math.random() - 0.5) * 0.6, lx = Math.cos(la) * p.l / 2, lyy = Math.sin(la) * p.l / 2;
          sc.strokeStyle = p.col; sc.lineWidth = 1.3; sc.beginPath(); sc.moveTo(p.x - lx, ly - lyy); sc.quadraticCurveTo(p.x, ly - 2, p.x + lx, ly + lyy); sc.stroke();
          if (bins[b] < 70) { bins[b] += 0.9; if (b > 0) bins[b - 1] += 0.35; if (b < bins.length - 1) bins[b + 1] += 0.35; }
          return false;
        }
        c.strokeStyle = p.col; c.beginPath(); c.moveTo(p.x - dx, p.y - dy); c.quadraticCurveTo(p.x - dy * 0.3, p.y + dx * 0.3, p.x + dx, p.y + dy); c.stroke();
        return true;
      });
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
    watch(foot, function (v) { vis = v; kick(); });
    size();
    return { size: size, kick: kick };
  })();

  refreshers.push(function () { compose(); placeholder(); hours(); waLinks(); touch.resize(); drop.layout(); paws.build(); });

  // ---------------------------------------------------------------- balls: bounce when the page comes to rest
  var balls = $('.balls'), restT = 0, lastBounce = 0, pressing = false;
  addEventListener('pointerdown', function () { pressing = true; }, { passive: true });
  addEventListener('pointerup', function () { pressing = false; }, { passive: true });
  addEventListener('pointercancel', function () { pressing = false; }, { passive: true });
  function rest() {
    var t = performance.now();
    if (still() || pressing || t - lastBounce < 20000) return;                     // a nudge now and then, never under a finger
    lastBounce = t; balls.classList.remove('bounce'); void balls.offsetWidth; balls.classList.add('bounce');
  }

  // ---------------------------------------------------------------- scroll loop
  var ticking = false, hero = $('.hero');
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      // read everything first
      var y = scrollY, hr = hero.getBoundingClientRect(), hh = hero.offsetHeight, mt = $('#main').getBoundingClientRect().top;
      var dr = drop.sec.getBoundingClientRect(), tr = touch.sec.getBoundingClientRect(), ih = innerHeight;
      var span = function (r) { var s = r.height - ih; return s > 0 ? clamp(-r.top / s, 0, 1) : (r.top < 0 ? 1 : 0); };
      var inStage = [dr, tr].some(function (r) { return r.top < ih * 0.5 && r.bottom > ih * 0.5; });
      // then write
      nav.classList.toggle('gathered', y > 90);
      if (!still()) deck.style.setProperty('--sp', (1 + clamp(-hr.top / hh, 0, 1) * 0.7).toFixed(3));
      drop.scroll(span(dr)); touch.scroll(span(tr)); paws.scroll(mt);
      balls.classList.toggle('away', inStage);
      clearTimeout(restT); restT = setTimeout(rest, 220);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  var rt = 0, lastW = innerWidth;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var wChanged = innerWidth !== lastW; lastW = innerWidth;
      drop.layout(); if (wChanged) { touch.resize(); hairs.size(); pile.size(); }
      paws.build(); onScroll();
    }, 150);
  });
  motionFns.push(function () {
    drop.mode(); touch.mode(); hairs.kick(); pile.kick(); paws.scroll();
    if (still()) { deck.classList.add('dealt'); $$('[data-reveal], [data-tile], .fill-h, .foot-word, .door .note').forEach(function (el) { el.classList.add('in'); }); }
    onScroll();
  });

  texts(root.lang); motionUI();
  drop.mode(); touch.mode(); onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { paws.build(); drop.layout(); });
  addEventListener('load', function () { paws.build(); });
})();
