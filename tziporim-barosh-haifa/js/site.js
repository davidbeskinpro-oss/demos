/* ציפורים בראש · concept demo */
(function () {
  "use strict";
  var root = document.documentElement;
  var FACTS = window.FACTS || {
    nameHe: "ציפורים בראש", nameEn: "Tziporim BaRosh",
    phoneIntl: "972547696575",
    hours: null /* not published on Google; {0:[["09:00","18:00"]], 6:null, ...} or "24/7" */
  };
  var lang = function () { return root.lang === "en" ? "en" : "he"; };
  var still = function () { return root.classList.contains("still"); };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };

  /* ---------- WhatsApp text ---------- */
  var COAT = { he: { curly: "מתולתלת", fluffy: "נפוחה", silky: "ארוכה וחלקה", wiry: "קשה" },
               en: { curly: "curly", fluffy: "fluffy", silky: "long and silky", wiry: "wiry" } };
  var SIZE = { he: ["קטן", "בינוני", "גדול"], en: ["small", "medium", "large"] };
  function baseMsg() {
    return lang() === "he"
      ? "היי " + FACTS.nameHe + ", הגעתי מהאתר ואשמח לתאם תור לכלב שלי."
      : "Hi " + FACTS.nameEn + ", I found you through the website and would like to book a grooming for my dog.";
  }
  function composed() {
    var l = lang();
    var coatEl = document.querySelector('input[name="coat"]:checked');
    var coat = coatEl ? COAT[l][coatEl.value] : "";
    var size = SIZE[l][+(document.getElementById("size") || { value: 0 }).value || 0];
    var name = ((document.getElementById("dogName") || {}).value || "").trim();
    var lines;
    if (l === "he") {
      lines = ["היי " + FACTS.nameHe + ", אשמח לתאם תור לטיפוח."];
      if (name) lines.push("שם הכלב: " + name);
      lines.push("גודל: " + size, "פרווה: " + coat, "מתי נוח לכם?");
    } else {
      lines = ["Hi " + FACTS.nameEn + ", I'd like to book a grooming."];
      if (name) lines.push("Dog's name: " + name);
      lines.push("Size: " + size, "Coat: " + coat, "When would suit you?");
    }
    return lines.join("\n");
  }
  function waHref(text) { return "https://wa.me/" + FACTS.phoneIntl + "?text=" + encodeURIComponent(text); }
  function refreshWa() {
    var base = waHref(baseMsg());
    document.querySelectorAll("[data-wa]").forEach(function (a) { if (a.id !== "sendWa") a.href = base; });
    var msg = composed();
    var prev = document.getElementById("msgPreview");
    if (prev) prev.textContent = msg;
    var send = document.getElementById("sendWa");
    if (send) send.href = waHref(msg);
    var r = document.getElementById("size");
    if (r) r.setAttribute("aria-valuetext", SIZE[lang()][+r.value || 0]);
  }
  document.addEventListener("input", function (e) { if (e.target.closest && e.target.closest(".book")) refreshWa(); });
  document.addEventListener("change", function (e) { if (e.target.closest && e.target.closest(".book")) refreshWa(); });

  /* ---------- hours (none published: keep the plain line) ---------- */
  function hoursText() {
    var h = FACTS.hours, l = lang();
    if (!h) return null;
    if (h === "24/7") return l === "he" ? "פתוח 24/7" : "Open 24/7";
    var now = new Date(), d = now.getDay(), today = h[d];
    if (!today || !today.length) return l === "he" ? "היום סגור" : "Closed today";
    var m = now.getHours() * 60 + now.getMinutes();
    var toM = function (s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; };
    for (var i = 0; i < today.length; i++) {
      if (m >= toM(today[i][0]) && m < toM(today[i][1])) return (l === "he" ? "פתוח עכשיו, עד " : "Open now, until ") + today[i][1];
    }
    return l === "he" ? "סגור עכשיו" : "Closed now";
  }
  function refreshHours() {
    var t = hoursText(), el = document.getElementById("hoursLine");
    if (t && el) el.setAttribute("data-status", t);
  }

  /* ---------- language ---------- */
  var titles = { he: "ציפורים בראש · מספרה לכלבים · דרך צרפת 38, חיפה", en: "Tziporim BaRosh · Dog grooming salon · 38 Derech Tsarfat, Haifa" };
  function setLang(l) {
    root.lang = l; root.dir = l === "he" ? "rtl" : "ltr";
    document.title = titles[l];
    var f = document.getElementById("frame");
    if (f) f.setAttribute("aria-label", l === "he" ? "התמונה הבאה" : "Next photo");
    var mt = document.getElementById("motionToggle");
    var mf = document.querySelector(".map iframe");
    if (mf) { var src = mf.getAttribute("src").replace(/&hl=\w+/, "") + "&hl=" + (l === "he" ? "iw" : "en"); if (mf.getAttribute("src") !== src) mf.setAttribute("src", src); }
    var dn = document.getElementById("dogName"); if (dn) dn.placeholder = dn.getAttribute("data-ph-" + l);
    store("lang", l); refreshWa(); refreshHours(); frameCaption();
    try { var u = new URL(location.href); if (l === "en") u.searchParams.set("lang", "en"); else u.searchParams.delete("lang"); history.replaceState(null, "", u); } catch (e) {}
  }
  document.getElementById("langToggle").addEventListener("click", function () { setLang(lang() === "he" ? "en" : "he"); });

  /* ---------- motion switch ---------- */
  var mt = document.getElementById("motionToggle");
  function syncMotion() { mt.setAttribute("aria-checked", still() ? "false" : "true"); }
  mt.addEventListener("click", function () {
    var off = !still();
    root.classList.toggle("still", off);
    store("motion", off ? "off" : "on");
    syncMotion();
    if (off) { stopDry(); stopFrame(); document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); }); }
    else { onScroll(); }
  });
  syncMotion();

  /* ---------- nav position under the concept bar ---------- */
  var concept = document.querySelector(".concept");
  var dock = document.getElementById("dock");
  var heroActs = document.querySelector(".hero-acts");
  var foot = document.querySelector(".foot-info");
  function navTop() {
    var h = concept.offsetHeight;
    root.style.setProperty("--nav-top", Math.max(10, h + 8 - window.scrollY) + "px");
  }

  /* ---------- entrances ---------- */
  document.querySelectorAll(".hero-words > span").forEach(function (s) {
    Array.prototype.forEach.call(s.children, function (b, i) { b.style.setProperty("--i", i); });
  });
  var groups = new Map();
  document.querySelectorAll(".reveal").forEach(function (el) {
    var sec = el.closest("section, footer") || document.body;
    var n = groups.get(sec) || 0; groups.set(sec, n + 1);
    el.style.setProperty("--d", Math.min(n, 5) * 80 + "ms");
  });
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in"); io.unobserve(e.target);
      if (e.target.classList.contains("tool")) toolMove(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); });

  /* ---------- tools: each one moves like itself ---------- */
  function toolMove(li) {
    if (still() || !li.animate) return;
    var img = li.querySelector("img"); if (!img) return;
    var k = li.className, frames, opt = { duration: 700, easing: "cubic-bezier(.22,1,.36,1)" };
    if (/t-scissors/.test(k)) frames = [{ transform: "rotate(-5deg) scale(1.04)" }, { transform: "rotate(2deg) scale(1.02)" }, { transform: "rotate(-1.5deg) scale(1.02)" }, { transform: "none" }];
    else if (/t-comb/.test(k)) frames = [{ transform: "translateX(-6%) scale(1.12)" }, { transform: "translateX(0) scale(1.12)" }, { transform: "none" }];
    else if (/t-clipper/.test(k)) { frames = [{ transform: "translate(0,0)" }, { transform: "translate(1.5px,-1px)" }, { transform: "translate(-1.5px,1px)" }, { transform: "translate(1px,1px)" }, { transform: "translate(0,0)" }]; opt = { duration: 90, iterations: 5 }; }
    else frames = [{ transform: "scale(1.1)", filter: "blur(2px)" }, { transform: "scale(1)", filter: "blur(0)" }];
    img.animate(frames, opt);
  }
  document.querySelectorAll(".tool").forEach(function (li) {
    li.addEventListener("pointerdown", function () { toolMove(li); });
  });

  /* ---------- one frame, contents change ---------- */
  var frame = document.getElementById("frame");
  var fImgs = frame ? frame.querySelectorAll("img") : [];
  var fIdx = 0, fTimer = null, fShown = 0;
  function frameCaption() {
    if (!fImgs.length) return;
    var im = fImgs[fIdx];
    var he = document.querySelector("[data-cap-he]"), en = document.querySelector("[data-cap-en]");
    if (he) he.textContent = im.getAttribute("data-he");
    if (en) en.textContent = im.getAttribute("data-en");
  }
  function frameGo(i) {
    fImgs[fIdx].classList.remove("on");
    fIdx = (i + fImgs.length) % fImgs.length;
    fImgs[fIdx].classList.add("on");
    frameCaption();
  }
  function stopFrame() { clearInterval(fTimer); fTimer = null; }
  if (frame) {
    frame.addEventListener("click", function () { stopFrame(); frameGo(fIdx + 1); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !still() && !fTimer && fShown < fImgs.length) {
          fTimer = setInterval(function () { fShown++; if (fShown >= fImgs.length) { stopFrame(); frameGo(0); return; } frameGo(fIdx + 1); }, 2600);
        } else if (!e.isIntersecting) stopFrame();
      });
    }, { threshold: 0.5 }).observe(frame);
  }

  /* ---------- signature: bath → dryer ---------- */
  var dry = document.getElementById("dry");
  var gl = null, glLoading = false, glFailed = false;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function dryProgress() {
    var r = dry.getBoundingClientRect(), vh = window.innerHeight;
    return clamp(-r.top / Math.max(1, r.height - vh));
  }
  function loadGL() {
    if (gl || glLoading || glFailed || still()) return;
    glLoading = true;
    var s = document.createElement("script");
    s.src = "js/dry.js"; s.async = true;
    s.onload = function () {
      glLoading = false;
      try {
        gl = window.DryGL && window.DryGL(dry.querySelector(".dry-gl"), "img/wet-bath.jpg", "img/pom-fluffy.jpg", {
          focA: [0.40, 0.42], focB: [0.5, 0.34], ready: function () { if (!still()) { dry.classList.add("gl-on"); if (gl) gl.resize(); onScroll(); } }
        });
        if (!gl) glFailed = true;
      } catch (e) { glFailed = true; }
    };
    s.onerror = function () { glLoading = false; glFailed = true; };
    document.head.appendChild(s);
  }
  function stopDry() { dry.classList.remove("gl-on"); dry.style.removeProperty("--cap-a"); dry.style.removeProperty("--cap-b"); dry.style.removeProperty("--dry-r"); }
  function updateDry() {
    if (still()) return;
    var r = dry.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < -vh || r.top > vh * 2) return;
    if (r.top < vh * 2.2) loadGL();
    var p = dryProgress();
    var reveal = clamp((p - 0.2) / 0.6);
    dry.style.setProperty("--cap-a", (1 - smooth(0.12, 0.3, p)).toFixed(3));
    dry.style.setProperty("--cap-b", smooth(0.72, 0.86, p).toFixed(3));
    dry.setAttribute("data-phase", p > 0.5 ? "b" : "a");
    dry.style.setProperty("--dry-r", (reveal * 150).toFixed(1) + "%");
    if (gl && dry.classList.contains("gl-on")) { gl.resize(true); gl.draw(reveal, root.dir === "rtl"); }
  }

  /* ---------- scroll loop ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      navTop(); updateDry();
      if (dock && heroActs) {
        var a = heroActs.getBoundingClientRect(), fo = foot ? foot.getBoundingClientRect() : { top: 1e9 };
        dock.classList.toggle("hide", a.bottom > 0 || fo.top < window.innerHeight);
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { if (gl) gl.resize(); onScroll(); });

  /* swing the ID tags gently once when they arrive */
  if (dock && dock.animate) {
    var shown = false;
    new MutationObserver(function () {
      var vis = !dock.classList.contains("hide");
      if (vis && !shown && !still()) {
        dock.querySelectorAll(".tag").forEach(function (t, i) {
          t.animate([{ transform: "rotate(9deg)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(0)" }],
            { duration: 900, delay: i * 90, easing: "cubic-bezier(.22,1,.36,1)" });
        });
      }
      shown = vis;
    }).observe(dock, { attributes: true, attributeFilter: ["class"] });
  }

  setLang(lang());
  onScroll();
})();
