(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang !== 'en'; };
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var smooth = function (x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  var WA = 'https://wa.me/972545911008';

  /* language */
  var onLang = [];
  $$('[data-lang-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = he() ? 'en' : 'he'; root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
      try { localStorage.setItem('wk-lang', l); } catch (e) {}
      var u = new URL(location.href); u.searchParams.delete('lang'); history.replaceState(null, '', u);
      onLang.forEach(function (f) { f(); });
    });
  });

  /* animations on / off */
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  motionUI();
  switches.forEach(function (b) {
    b.addEventListener('click', function () {
      var turnOn = still();
      try { localStorage.setItem('wk-motion', turnOn ? 'on' : 'off'); } catch (e) {}
      // the water scene and the pinned scenes are set up at load, so switching reloads in place
      location.reload();
    });
  });

  /* nav gathers into a pill */
  var nav = $('[data-nav]');

  /* opening: logo ring fills, her photos are dealt, the last becomes the hero, a drop lands in the pool */
  var op = $('[data-opening]');
  function landDrop() { if (window.__water && window.__water.ready) window.__water.ripple(.5, .3, 1.6); }
  if (op && !still() && scrollY < 40) {
    op.classList.add('deal');
    var end = function () { op.classList.add('done'); landDrop(); setTimeout(function () { op.remove(); }, 600); };
    var tm = setTimeout(end, 1150);
    op.addEventListener('click', function () { clearTimeout(tm); end(); });
  } else if (op) { op.remove(); document.addEventListener('water-ready', landDrop); }

  /* hours + open-now status (Israel time). null = closed */
  var HOURS = [[10, 15], [10, 15], [10, 15], [10, 15], [10, 14], null, null];
  var DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function ilNow() {
    var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: (+p.hour % 24) * 60 + (+p.minute) };
  }
  function hh(h) { return (h < 10 ? '0' : '') + h + ':00'; }
  function status() {
    var n = ilNow(), t = HOURS[n.d], open = !!t && n.m >= t[0] * 60 && n.m < t[1] * 60, txt;
    if (open) txt = he() ? ['פתוח עכשיו', 'עד ' + hh(t[1])] : ['Open now', 'until ' + hh(t[1])];
    else {
      var k, dd;
      if (t && n.m < t[0] * 60) { k = 0; dd = n.d; } else { for (k = 1; k < 8; k++) { dd = (n.d + k) % 7; if (HOURS[dd]) break; } }
      var when = k === 0 ? (he() ? 'היום' : 'today') : k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAYS_HE[dd] : 'on ' + DAYS_EN[dd]);
      txt = he() ? ['סגור עכשיו', 'נפתח ' + when + ' ב-' + hh(HOURS[dd][0])] : ['Closed now', 'opens ' + when + ' at ' + hh(HOURS[dd][0])];
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span class="nt"><b></b> <span></span></span>'; el.querySelector('b').textContent = txt[0]; el.querySelector('.nt > span').textContent = txt[1]; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', r.dataset.days === String(n.d)); });
  }
  status(); setInterval(status, 60000); onLang.push(status);

  /* entrances: heading, then line, then pictures, staggered */
  $$('.ways-head, .place-head, .words-head, .visit-copy, .gift-card').forEach(function (g) {
    $$(':scope > *', g).forEach(function (el, i) { el.setAttribute('data-rise', ''); el.style.setProperty('--d', i * 80 + 'ms'); });
  });
  $$('.way, .tile, .drift, .map, .foot-mark, .foot-name').forEach(function (el, i) { el.setAttribute('data-rise', ''); el.style.setProperty('--d', (i % 6) * 70 + 'ms'); });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  $$('[data-rise]').forEach(function (el) { io.observe(el); });
  // living visuals run only while seen
  var live = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting); }); });
  $$('.way, .tile').forEach(function (el) { live.observe(el); });

  /* rail arrows */
  var rail = $('[data-rail]');
  function step(dir) { var w = rail.querySelector('.way').offsetWidth + 18; rail.scrollBy({ left: dir * w * (he() ? -1 : 1), behavior: still() ? 'auto' : 'smooth' }); }
  $('[data-rail-next]').addEventListener('click', function () { step(1); });
  $('[data-rail-prev]').addEventListener('click', function () { step(-1); });

  /* bento: a soft light follows the hand */
  $$('[data-spot]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });

  /* reviews drift: a duplicated row so the loop is seamless */
  var drift = $('[data-drift]');
  if (!still()) {
    var row = $('.drift-row', drift), kids = $$('.q', row);
    kids.forEach(function (q) { var c = q.cloneNode(true); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); });
    drift.classList.add('go');
  }

  /* composer */
  var form = $('[data-voucher]'), msgEl = $('[data-msg]'), send = $('[data-send]'), daysBox = $('[data-days]');
  HOURS.forEach(function (t, i) {
    if (!t) return;
    var l = document.createElement('label');
    l.innerHTML = '<input type="radio" name="day" value="' + i + '"><span><span lang="he">' + DAYS_HE[i] + '</span><span lang="en">' + DAYS_EN[i].slice(0, 3) + '</span></span>';
    daysBox.appendChild(l);
  });
  function compose() {
    var f = new FormData(form), who = f.get('who'), what = f.get('what'), day = f.get('day'), m;
    if (he()) {
      var item = what === 'watsu' ? 'טיפול וואטסו' : 'מקום בסדנת ארומתרפיה';
      var ask = what === 'watsu' ? 'מתי יש לך מקום?' : 'מתי הסדנה הקרובה?';
      var d = day != null ? ' הכי נוח ' + (who === 'mom' || who === 'friend' ? '' : 'לי ') + 'ביום ' + DAYS_HE[day] + '.' : '';
      if (who === 'me') m = 'היי דינה, אשמח לקבוע ' + item + '.' + d + ' ' + ask;
      else if (who === 'preg') m = 'היי דינה, אני בהריון ואשמח לקבוע ' + item + '.' + d + ' ' + ask;
      else m = 'היי דינה, אני רוצה להזמין ' + item + ' במתנה ' + (who === 'mom' ? 'לאמא שלי' : 'למישהי יקרה לי') + '.' + d + ' אפשר לשמוע פרטים?';
    } else {
      var itemE = what === 'watsu' ? 'a Watsu session' : 'a place in an aromatherapy workshop';
      var askE = what === 'watsu' ? 'When do you have a spot?' : 'When is the next workshop?';
      var dE = day != null ? ' ' + DAYS_EN[day] + ' works best.' : '';
      if (who === 'me') m = 'Hi Dina, I’d like to book ' + itemE + '.' + dE + ' ' + askE;
      else if (who === 'preg') m = 'Hi Dina, I’m pregnant and I’d like to book ' + itemE + '.' + dE + ' ' + askE;
      else m = 'Hi Dina, I’d like to give ' + itemE + ' as a gift to ' + (who === 'mom' ? 'my mother' : 'someone dear to me') + '.' + dE + ' Could you tell me more?';
    }
    return m;
  }
  var typing = 0, shown = '';
  function update(instant) {
    var target = compose();
    send.href = WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still()) { shown = target; msgEl.textContent = target; return; }
    // keep the shared start, type the rest
    var k = 0; while (k < shown.length && k < target.length && shown[k] === target[k]) k++;
    var i = k, t0 = 0;
    (function tick(ts) {
      if (!t0) t0 = ts; i = Math.min(target.length, k + Math.floor((ts - t0) / 14));
      shown = target.slice(0, i); msgEl.textContent = shown;
      if (i < target.length) { var c = document.createElement('span'); c.className = 'caret'; msgEl.appendChild(c); typing = requestAnimationFrame(tick); }
    })(performance.now());
  }
  form.addEventListener('change', function () { update(false); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  update(true); onLang.push(function () { update(true); });

  /* scroll scenes */
  var dock = $('.dock'), heroCta = $('.hero-copy .cta');
  var sink = $('[data-sink]'), heroCopy = $('[data-hero-copy]'), under = $('.under-copy'), uf = $('.under-float'), hint = $('[data-hint]');
  var ways = $('[data-ways]'), ro = $('.ripple-open', ways), rings = $('.ripple-rings', ways), waysIn = $('.ways-in', ways), dropEl = $('.drop-fall', ways);
  var gift = $('[data-gift]'), gp = $('[data-gift-pic]'), gc = $('[data-gift-card]');
  if (!still()) gift.classList.add('scrub');
  var gpBox = null;
  function measure() {
    if (still()) return;
    gp.style.transform = ''; var r = gp.getBoundingClientRect();
    gpBox = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 - gift.querySelector('.gift-stage').getBoundingClientRect().top, w: r.width, h: r.height };
  }
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = innerHeight, y = scrollY;
    nav.classList.toggle('pill', y > 40);
    var cr = heroCta.getBoundingClientRect(), ctaOn = cr.bottom > 0 && cr.top < vh;
    if (still()) { dock.classList.toggle('away', ctaOn); return; }

    // the sink: the pool's water rises over the screen and the view goes under
    var sr = sink.getBoundingClientRect(), p = clamp(-sr.top / (sr.height - vh), 0, 1);
    var lv = smooth((p - .06) / .58);
    if (window.__water) window.__water.setLevel && window.__water.setLevel(lv);
    var a = 1 - smooth(p / .32);
    heroCopy.style.opacity = a.toFixed(3); heroCopy.style.setProperty('--hy', (-70 * smooth(p / .4)).toFixed(1) + 'px');
    heroCopy.style.visibility = a < .01 ? 'hidden' : '';
    dock.classList.toggle('away', ctaOn && a > .15);
    if (hint) hint.style.opacity = (1 - smooth(p / .1)).toFixed(3);
    var u = smooth((p - .5) / .28);
    under.style.opacity = u.toFixed(3);
    uf.style.setProperty('--uf', smooth((p - .42) / .3).toFixed(3)); uf.style.setProperty('--ufy', (80 * (1 - smooth((p - .42) / .4))).toFixed(1) + 'px');
    under.style.transform = 'translateY(' + (40 * (1 - u)).toFixed(1) + 'px)';
    if (!window.__water || !window.__water.ready) { // no WebGL: fade to the pre-rendered under-water frame
      var still2 = sink.querySelector('.under-still'); still2.style.display = 'block'; still2.style.opacity = lv.toFixed(3);
    }

    // a drop falls out of the water view; where it lands, the warm field opens as a ripple
    var wr = ways.getBoundingClientRect(), q = clamp((vh - wr.top) / (vh * .95), 0, 1);
    var fall = smooth(q / .26), open = wr.top >= vh ? 1 : smooth((q - .25) / .4); // fully open while out of sight
    dropEl.style.opacity = q > 0 && q < .27 ? 1 : 0;
    waysIn.style.opacity = smooth((open - .25) / .5).toFixed(3);
    dropEl.style.setProperty('--dy', (-vh * .45 * (1 - fall) + 80 * fall) + 'px');
    var maxR = Math.hypot(wr.width / 2, wr.height) + 4;
    ro.style.setProperty('--rr', (open * maxR).toFixed(0) + 'px'); ro.style.visibility = open >= 1 ? 'hidden' : '';
    rings.style.setProperty('--rr', (open * maxR).toFixed(0) + 'px');
    rings.style.setProperty('--ring-o', (open > 0 && open < 1 ? Math.min(1, (1 - open) * 2) : 0).toFixed(3));

    // the towel photo fills the screen, then gathers into her drop
    if (gpBox) {
      var gr = gift.getBoundingClientRect(), st = gift.querySelector('.gift-stage'), range = Math.max(1, gr.height - st.offsetHeight);
      var g = clamp(-gr.top / range, 0, 1), e = smooth(g / .7);
      var sc = Math.max(innerWidth / gpBox.w, vh / gpBox.h) * 1.05, s = sc + (1 - sc) * e;
      var tx = (innerWidth / 2 - gpBox.cx) * (1 - e), ty = (vh / 2 - gpBox.cy) * (1 - e);
      if (gr.top > 0) { tx = innerWidth / 2 - gpBox.cx; ty = vh / 2 - gpBox.cy; }
      gp.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      gp.style.setProperty('--ms', (100 + 260 * (1 - e)).toFixed(1) + '%');
      var c = smooth((g - .45) / .4);
      gc.style.opacity = c.toFixed(3); gc.style.transform = 'translateY(' + (50 * (1 - c)).toFixed(1) + 'px)';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { measure(); onScroll(); });
  addEventListener('load', function () { measure(); frame(); });
  measure(); frame();
})();
