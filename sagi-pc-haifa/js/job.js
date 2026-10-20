// The job's readings for any point in the story (0..1), shared by the job card, the stress-test graph and the 3D bench.
// Two runs of the same ten-minute stress test: before the fix (run A) and after it (run B). Numbers are illustrative.
(function () {
  var STAGES = [0, 0.10, 0.36, 0.46, 0.76, 0.91, 1];
  var A = [0.122, 0.33], B = [0.772, 0.89];
  var ON = [[0.102, 0.362], [0.762, 0.915]];
  var c01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  // before: the CPU climbs fast, hits its limit and holds there by cutting its own clock (throttling)
  function tempA(u) {
    var t = 44 + 53 * (1 - Math.exp(-u / 0.06));
    if (t > 95.4) t = 95.4 + 0.8 * (1 + Math.sin(u * 71)) * 0.5 + 0.9 * (0.5 + 0.5 * Math.sin(u * 23 + 1.3));
    return t;
  }
  function clkA(u) {
    var t = 44 + 53 * (1 - Math.exp(-u / 0.06)), k = c01((t - 92.5) / 3.5);
    var thr = 3.2 + 0.22 * Math.sin(u * 53) + 0.14 * Math.sin(u * 137 + 2) - 0.45 * Math.pow(Math.max(0, Math.sin(u * 19 + 0.6)), 12);
    return 4.6 - 0.04 * Math.abs(Math.sin(u * 61)) + (thr - 4.6) * k;
  }
  // after: the same load levels off around 68 °C and the clock holds
  function tempB(u) { return 41 + 27 * (1 - Math.exp(-u / 0.11)) + 0.7 * Math.sin(u * 37) * Math.min(1, u * 5); }
  function clkB(u) { return 4.6 - 0.03 * Math.abs(Math.sin(u * 41)); }
  function inR(p, r) { return p >= r[0] && p < r[1]; }
  function read(p) {
    var on = inR(p, ON[0]) || inR(p, ON[1]), before = p < 0.5, r = { on: on, temp: null, ghz: null, rpmRear: 0, rpmCpu: 0, rpmFront: 0, run: null, u: 0 };
    if (!on) return r;
    var u, t;
    if (before) {
      if (p < A[0]) t = 44;
      else if (p < A[1]) { u = (p - A[0]) / (A[1] - A[0]); r.run = 'A'; r.u = u; t = tempA(u); r.ghz = clkA(u); }
      else t = 52 + (tempA(1) - 52) * Math.exp(-(p - A[1]) / 0.008);       // test stopped: cools towards idle
      r.rpmRear = Math.max(0, 470 + 150 * Math.sin(p * 410) + 70 * Math.sin(p * 1310 + 1));   // a worn bearing: unsteady and slow
    } else {
      if (p < B[0]) t = 40;
      else if (p < B[1]) { u = (p - B[0]) / (B[1] - B[0]); r.run = 'B'; r.u = u; t = tempB(u); r.ghz = clkB(u); }
      else t = 45 + (tempB(1) - 45) * Math.exp(-(p - B[1]) / 0.008);
      r.rpmRear = 1150;
    }
    r.temp = t;
    r.rpmCpu = Math.max(800, Math.min(2050, 600 + (t - 35) * 25));          // the cooler's fan follows its curve
    r.rpmFront = 900;
    return r;
  }
  window.__JOB = { STAGES: STAGES, A: A, B: B, read: read, tempA: tempA, clkA: clkA, tempB: tempB, clkB: clkB };
  window.__jobRead = read;
})();
