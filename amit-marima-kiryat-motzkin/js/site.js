/* Amit Marima Barber Shop · concept demo */
(() => {
  const R = document.documentElement, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = (k, v) => { try { v === undefined ? 0 : localStorage.setItem(k, v); return localStorage.getItem(k); } catch (e) { return null; } };
  const he = () => R.lang === 'he';
  const still = () => R.classList.contains('still');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const PHONE = '972526701529';

  /* ---------- hours (from the Google listing; 0 = Sunday, null = closed) ---------- */
  const HOURS = [[300, 1120], [300, 1120], [300, 1180], [300, 1200], [300, 940], null, null];
  const DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const SHORT_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  function nowIL() {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    return { d: SHORT_EN.indexOf(g('weekday')), m: +g('hour') * 60 + +g('minute') };
  }
  function status() {
    const { d, m } = nowIL(), h = HOURS[d];
    if (h && m >= h[0] && m < h[1]) return { open: true, he: `פתוח עכשיו · עד ${hm(h[1])}`, en: `Open now · until ${hm(h[1])}` };
    if (h && m < h[0]) return { open: false, he: `סגור עכשיו · נפתח היום ב-${hm(h[0])}`, en: `Closed now · opens today at ${hm(h[0])}` };
    for (let i = 1; i <= 7; i++) {
      const n = (d + i) % 7, x = HOURS[n];
      if (x) return { open: false, he: `סגור עכשיו · נפתח ${i === 1 ? 'מחר' : 'ביום ' + DAY_HE[n]} ב-${hm(x[0])}`, en: `Closed now · opens ${i === 1 ? 'tomorrow' : DAY_EN[n]} at ${hm(x[0])}` };
    }
    return { open: false, he: 'סגור עכשיו', en: 'Closed now' };
  }
  function paintStatus() {
    const s = status();
    $$('[data-status]').forEach(el => { el.textContent = he() ? s.he : s.en; el.classList.toggle('open', s.open); });
    $$('[data-dot]').forEach(el => el.classList.toggle('open', s.open));
    const t = $('[data-hours]'), today = nowIL().d;
    if (t) t.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => `<tr class="${i === today ? 'today' : ''}"><td>${he() ? DAY_HE[i] : DAY_EN[i]}</td><td dir="ltr">${HOURS[i] ? hm(HOURS[i][0]) + '–' + hm(HOURS[i][1]) : (he() ? 'סגור' : 'Closed')}</td></tr>`).join('');
  }

  /* ---------- composer: the appointment card ---------- */
  const SVC_HE = ['תספורת', 'סידור זקן', 'תספורת לשיער ארוך', 'תספורת וזקן'], SVC_EN = ['a haircut', 'a beard trim', 'a long-hair cut', 'a haircut and beard'];
  const PART_HE = ['בבוקר', 'בצהריים', 'אחר הצהריים'], PART_EN = ['in the morning', 'around midday', 'in the afternoon'];
  const st = { svc: 0, day: 0, part: 0 };
  { const d = nowIL().d; for (let i = 0; i < 7; i++) if (HOURS[(d + i) % 7]) { st.day = (d + i) % 7; break; } }
  const daysEl = $('[data-group=day]');
  function paintDays() {
    daysEl.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => `<button type="button" data-v="${i}" aria-pressed="${i === st.day}" ${HOURS[i] ? '' : 'disabled'}><span>${he() ? SHORT_HE[i] : SHORT_EN[i]}</span><small>${HOURS[i] ? (he() ? 'עד ' : 'to ') + hm(HOURS[i][1]) : (he() ? 'סגור' : 'closed')}</small></button>`).join('');
  }
  const nameEl = $('[data-name]'), msgEl = $('[data-msg]'), sendEl = $('[data-send]');
  function message() {
    const n = (nameEl.value || '').trim();
    if (he()) return `היי עמית, ${n ? 'כאן ' + n + '. ' : ''}אשמח לקבוע תור ל${SVC_HE[st.svc]} ביום ${DAY_HE[st.day]} ${PART_HE[st.part]}. תודה!`;
    return `Hi Amit, ${n ? "it's " + n + '. ' : ''}I'd like to book ${SVC_EN[st.svc]} on ${DAY_EN[st.day]} ${PART_EN[st.part]}. Thanks!`;
  }
  let typer = 0;
  function paintMsg(animate) {
    const t = message();
    sendEl.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`;
    cancelAnimationFrame(typer);
    if (!animate || still()) { msgEl.textContent = t; return; }
    const start = performance.now(), from = Math.min(msgEl.textContent.length, commonPrefix(msgEl.textContent, t));
    const step = now => { const k = Math.min(t.length, from + Math.floor((now - start) / 14)); msgEl.textContent = t.slice(0, k); if (k < t.length) typer = requestAnimationFrame(step); };
    typer = requestAnimationFrame(step);
  }
  const commonPrefix = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; };
  $$('[data-group]').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    $$('button', g).forEach(x => x.setAttribute('aria-pressed', x === b));
    st[g.dataset.group] = +b.dataset.v; paintMsg(true);
  }));
  nameEl.addEventListener('input', () => paintMsg(false));
  $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
    st.svc = +b.dataset.pick;
    $$('[data-group=svc] button').forEach(x => x.setAttribute('aria-pressed', +x.dataset.v === st.svc));
    paintMsg(true);
    $('#book').scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
  }));
  function paintWa() {
    const t = he() ? 'היי עמית, אשמח לקבוע תור.' : "Hi Amit, I'd like to book an appointment.";
    $$('[data-wa]').forEach(a => a.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`);
  }

  /* ---------- language ---------- */
  function paintLang() {
    const h = $('h1'); h.setAttribute('aria-label', he() ? 'עמית מרימה' : 'Amit Marima');
    $$('[data-tag] span').forEach(s => { s.textContent = he() ? s.dataset.he : s.dataset.en; });
    document.title = he() ? 'עמית מרימה · Barber Shop · ההגנה 45, קריית מוצקין' : 'Amit Marima · Barber Shop · 45 HaHagana, Kiryat Motzkin';
    paintStatus(); paintDays(); paintMsg(false); paintWa();
  }
  $('[data-lang]').addEventListener('click', () => {
    const l = he() ? 'en' : 'he'; R.lang = l; R.dir = l === 'he' ? 'rtl' : 'ltr'; store('am-lang', l);
    const u = new URL(location.href); u.searchParams.delete('lang'); history.replaceState(null, '', u);
    paintLang(); measure(); tick();
  });

  /* ---------- motion switch ---------- */
  const mBtn = $('[data-motion]');
  const paintMotion = () => mBtn.setAttribute('aria-checked', !still());
  mBtn.addEventListener('click', () => {
    R.classList.toggle('still'); store('am-motion', still() ? 'off' : 'on'); paintMotion();
    $$('.rise').forEach(e => e.classList.add('in'));
    measure(); tick(); strands.reset();
  });

  /* ---------- nav ---------- */
  const nav = $('[data-nav]'), badge = $('[data-badge]');
  const small = matchMedia('(max-width: 899px)');
  const paintNav = () => { nav.classList.toggle('small', small.matches); nav.classList.toggle('tucked', scrollY > 140); if (!small.matches && scrollY <= 140) setOpen(false); };
  const setOpen = o => { nav.classList.toggle('open', o); badge.setAttribute('aria-expanded', o); };
  badge.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  $$('.panel nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  small.addEventListener?.('change', paintNav);

  /* ---------- opener + seam-shut name + odometer ---------- */
  const opening = R.classList.contains('opening');
  const endOpen = () => { R.classList.remove('opening'); try { sessionStorage.setItem('am-open', 1); } catch (e) {} };
  if (opening) { setTimeout(endOpen, 1700); $('[data-opener]').addEventListener('click', endOpen); }
  setTimeout(() => $('[data-seam]').classList.add('shut'), opening ? 1250 : 120);
  function odo() {
    $$('[data-odo]').forEach(el => {
      const to = parseFloat(el.dataset.odo), dec = String(el.dataset.odo).includes('.') ? 1 : 0;
      if (still()) { el.textContent = to.toFixed(dec); return; }
      const t0 = performance.now() + (opening ? 1300 : 200);
      const f = now => { const k = clamp((now - t0) / 1300), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
  }

  /* ---------- hero windows: step through the photos ---------- */
  const face = $('.face'), wins = $$('[data-win]'), caps = $$('[data-cap]');
  let heroStep = 0;
  function setStep(n) {
    n = (n + 3) % 3; if (n === heroStep) return;
    heroStep = n;
    wins.forEach(w => $$('img', w).forEach((im, i) => im.classList.toggle('on', i === n)));
    caps.forEach((c, i) => c.classList.toggle('on', i === n));
  }
  $('[data-prev]').addEventListener('click', () => setStep(heroStep - 1));
  $('[data-next]').addEventListener('click', () => setStep(heroStep + 1));

  /* ---------- the room: camera stops on their lounge photo ---------- */
  const STOPS = [[50, 50, 1.05], [70, 66, 1.65], [38, 52, 1.7], [74, 26, 1.6], [16, 38, 1.6], [50, 50, 1.08]];
  const TAGS = [[70, 66], [38, 52], [74, 24], [16, 36]];
  const room = $('.room'), frame = $('.room .frame'), tagEls = $$('[data-tag]');
  let lastTag = -1;
  function decode(el, text) {
    if (still()) { el.textContent = text; return; }
    const glyphs = 'אבגדהוזחטיכלמנסעפצקרשת#%/=+', t0 = performance.now();
    const f = now => { const k = clamp((now - t0) / 500), n = Math.floor(text.length * k);
      el.textContent = text.slice(0, n) + [...text.slice(n)].map(c => c === ' ' ? ' ' : glyphs[Math.random() * glyphs.length | 0]).join('');
      if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  function camera(p) {
    const vw = innerWidth, vh = innerHeight, W = frame.offsetWidth, H = frame.offsetHeight;
    let fx, fy, s, active;
    if (still()) { [fx, fy, s] = [50, 50, 1.02]; active = -1; }
    else {
      const x = p * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), k = x - i, e = k * k * (3 - 2 * k);
      const A = STOPS[i], B = STOPS[i + 1];
      fx = A[0] + (B[0] - A[0]) * e; fy = A[1] + (B[1] - A[1]) * e; s = A[2] + (B[2] - A[2]) * e;
      active = Math.round(x) - 1; if (active < 0 || active > 3) active = -1;
    }
    const mx = Math.max(0, (W * s - vw) / 2), my = Math.max(0, (H * s - vh) / 2);
    const ox = clamp((0.5 - fx / 100) * W * s, -mx, mx), oy = clamp((0.5 - fy / 100) * H * s, -my, my);
    frame.style.setProperty('--ox', ox + 'px'); frame.style.setProperty('--oy', oy + 'px'); frame.style.setProperty('--s', s);
    tagEls.forEach((li, i) => {
      const tx = vw / 2 + ox + (TAGS[i][0] / 100 - .5) * W * s, ty = vh / 2 + oy + (TAGS[i][1] / 100 - .5) * H * s;
      li.style.setProperty('--tx', clamp(tx, 90, vw - 90) + 'px'); li.style.setProperty('--ty', clamp(ty, 120, vh - 160) + 'px');
      li.classList.toggle('on', still() || i === active);
    });
    if (active !== lastTag) { lastTag = active; if (active >= 0) { const sp = tagEls[active].firstElementChild; decode(sp, he() ? sp.dataset.he : sp.dataset.en); } }
  }

  /* ---------- scroll scenes ---------- */
  const prog = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
  const rows = $$('[data-flood]'), cape = $('[data-cape] .band'), revs = $('.revs .pin'), qs = $$('.q'), qph = $$('.q-photos img'), drift = $('[data-drift]'), visit = $('.visit .stage');
  const visitSec = $('.visit .pin');
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  function measure() { strands.size(); }
  function tick() {
    const vh = innerHeight, off = still();
    paintNav();
    if (!off) {
      const p = prog(face); setStep(Math.min(2, Math.floor(p * 3)));
      wins.forEach(w => w.style.setProperty('--z', 1.04 + p * .1));
      const cr = cape.parentElement.getBoundingClientRect(), t = cr.top / vh;
      cape.style.setProperty('--cx', ((t - .5) * -28) + 'vw');
    }
    rows.forEach(r => { const b = r.getBoundingClientRect(), f = off ? 0 : clamp(1 - Math.abs(b.top + b.height / 2 - vh * .55) / (vh * .42)); r.style.setProperty('--f', f.toFixed(3)); r.classList.toggle('lit', f > .8); });
    camera(prog(room));
    const desk = !small.matches && !off;
    const rp = prog(revs), qi = desk ? Math.min(2, Math.floor(rp * 3)) : -1;
    qs.forEach((q, i) => q.classList.toggle('on', qi === i));
    qph.forEach((im, i) => im.classList.toggle('on', i === Math.max(0, qi)));
    const dr = drift.getBoundingClientRect(), dt = clamp(1 - dr.top / vh, 0, 2);
    drift.style.setProperty('--dx', off ? '0px' : ((he() ? 1 : -1) * dt * Math.max(0, dr.width - innerWidth + 40) * .5) + 'px');
    visit.style.setProperty('--v', off ? 1 : clamp(prog(visitSec) * 1.7).toFixed(3));
    visit.querySelector('.ph').style.setProperty('--v', off ? 1 : clamp(prog(visitSec) * 1.7).toFixed(3));
  }
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); }, { passive: true });
  addEventListener('resize', () => { measure(); tick(); });

  /* ---------- entrances ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rise').forEach(el => { const sib = [...el.parentElement.children].filter(x => x.classList.contains('rise')); el.style.setProperty('--dl', sib.indexOf(el) * 80 + 'ms'); io.observe(el); });

  /* ---------- strands: combed hair flowing through the logo's hair and beard ---------- */
  const strands = (() => {
    const cv = $('[data-strands]'), cx = cv.getContext('2d'), stage = $('.face .stage');
    const masks = {}; let parts = [], on = false, vis = true, dpr = 1, ptr = { x: -999, y: -999, t: 0 };
    const src = n => (getComputedStyle(R).getPropertyValue('--' + n).match(/url\(["']?([^"')]+)/) || [])[1];
    ['hair', 'beard'].forEach(n => { const im = new Image(); im.onload = () => { masks[n] = { im }; size(); }; im.src = src(n); });
    function size() {
      const r = stage.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      wins.forEach(w => {
        const n = w.dataset.win, m = masks[n]; if (!m) return;
        const b = w.getBoundingClientRect(), W = Math.max(1, Math.round(b.width)), H = Math.max(1, Math.round(b.height));
        const o = document.createElement('canvas'); o.width = W; o.height = H; const c = o.getContext('2d'); c.drawImage(m.im, 0, 0, W, H);
        m.a = c.getImageData(0, 0, W, H).data; m.W = W; m.H = H; m.x = b.left - r.left; m.y = b.top - r.top;
      });
    }
    const inside = (m, x, y) => x >= 0 && y >= 0 && x < m.W && y < m.H && m.a[((y | 0) * m.W + (x | 0)) * 4 + 3] > 100;
    function spawn() {
      const n = Math.random() < .5 ? 'hair' : 'beard', m = masks[n]; if (!m || !m.a) return null;
      for (let k = 0; k < 20; k++) { const x = Math.random() * m.W, y = Math.random() * m.H; if (inside(m, x, y)) return { n, x, y, px: x, py: y, life: 0, max: 60 + Math.random() * 90, v: .6 + Math.random() * .9 }; }
      return null;
    }
    function frame(now) {
      if (!on) return;
      requestAnimationFrame(frame);
      if (!vis) return;
      const r = stage.getBoundingClientRect();
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, r.width, r.height);
      const want = small.matches ? 110 : 220;
      while (parts.length < want) { const p = spawn(); if (!p) break; parts.push(p); }
      cx.lineCap = 'round';
      parts = parts.filter(p => {
        const m = masks[p.n]; p.px = p.x; p.py = p.y; p.life++;
        const u = p.x / m.W, v = p.y / m.H;
        let vx, vy;
        if (p.n === 'hair') { vx = 1; vy = -.75 * (1 - u * 1.7) - .15; } // swept back and up, falling over the front
        else { vx = (.5 - u) * .9; vy = .8 + v * .3; } // the beard combed down to its point
        const gx = m.x + p.x, gy = m.y + p.y, dx = gx - ptr.x, dy = gy - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 6400) { const f = (6400 - d2) / 6400 * 3; vx += dx / 40 * f; vy += dy / 40 * f; }
        p.x += vx * p.v; p.y += vy * p.v;
        if (!inside(m, p.x, p.y) || p.life > p.max) return false;
        const a = Math.sin(Math.PI * p.life / p.max) * .55;
        cx.strokeStyle = p.n === 'hair' ? `rgba(240,226,200,${a})` : `rgba(233,191,114,${a})`;
        cx.lineWidth = 1.1; cx.beginPath(); cx.moveTo(m.x + p.px - vx * 6, m.y + p.py - vy * 6); cx.lineTo(m.x + p.x, m.y + p.y); cx.stroke();
        return true;
      });
      // photos come alive: slow drift, following the hand on desktop
      const t = now / 1000, auto = !matchMedia('(hover: hover)').matches || now - ptr.t > 2500;
      tmx = auto ? Math.sin(t * .5) * 10 : (ptr.x / r.width - .5) * -22; tmy = auto ? Math.cos(t * .4) * 8 : (ptr.y / r.height - .5) * -16;
      mx += (tmx - mx) * .06; my += (tmy - my) * .06;
      wins.forEach(w => { w.style.setProperty('--mx', mx.toFixed(1) + 'px'); w.style.setProperty('--my', my.toFixed(1) + 'px'); });
    }
    stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; });
    stage.addEventListener('pointerdown', e => { const r = stage.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; setTimeout(() => { if (performance.now() - ptr.t > 500) ptr.x = -999; }, 600); });
    stage.addEventListener('pointerleave', () => { ptr.x = -999; });
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(stage);
    function reset() {
      const want = !still();
      if (want && !on) { on = true; requestAnimationFrame(frame); }
      if (!want) { on = false; parts = []; cx.clearRect(0, 0, cv.width, cv.height); wins.forEach(w => { w.style.setProperty('--mx', '0px'); w.style.setProperty('--my', '0px'); }); }
    }
    return { size, reset };
  })();

  /* ---------- boot ---------- */
  paintMotion(); paintLang(); paintNav(); odo();
  if (still()) { $$('.rise').forEach(e => e.classList.add('in')); setStep(0); }
  measure(); tick(); strands.reset();
  setInterval(paintStatus, 60000);
  addEventListener('load', () => { measure(); tick(); });
})();
