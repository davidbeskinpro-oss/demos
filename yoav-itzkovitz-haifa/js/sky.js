// The window over Haifa Bay: a real photograph seen through wet glass.
// p = 0 storm (fogged glass, beads, drops running down), p = 1 clear (the glass dries, the clouds dissolve from the sky down).
// Written for this page; drops refract the photograph behind them, the fog is the photo's own mip levels.

const VS = `#version 300 es
in vec2 a; out vec2 v;
void main(){ v = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
in vec2 v; out vec4 o;
uniform sampler2D uS, uC;
uniform vec2 uR;      // canvas size
uniform float uA;     // photo aspect (w/h)
uniform float uT, uP;

float h12(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec3 h32(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); q += dot(q, q.yxz + 33.33); return fract((q.xxy + q.yzz) * q.zyx); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + 1.), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * vn(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return s; }

// resting beads on the glass. xy: lens normal (points away from the bead's centre), z: coverage
vec3 beads(vec2 q, float sc, float amt, float t, float seed){
  q *= sc;
  vec2 id = floor(q), f = fract(q) - .5;
  vec3 n = h32(id + seed);
  vec2 c = (n.xy - .5) * .5;
  // a bead shrinks from its edge as the glass dries (amt falls); big ones last longest
  float keep = smoothstep(n.z * .85, n.z * .85 + .14, amt);
  float r = mix(.09, .3, n.y * n.y) * keep;
  r *= .9 + .1 * sin(t * .6 + n.x * 6.283);     // a tremble as new rain lands
  vec2 d = f - c;
  d.y *= d.y > 0. ? 1.18 : .86;                 // weight pulls each bead slightly down: flatter top, fuller bottom
  d.x *= 1. + .12 * sin(n.x * 40.);             // not perfect circles
  float l = length(d) / max(r, 1e-3);
  float m = smoothstep(1., .8, l) * step(.005, r);
  return vec3(d / max(r, 1e-3) * m, m);
}

// drops that grow heavy and run down, wiping a clear track through the fog. xy normal, z drop, w track
vec4 runners(vec2 q, float amt, float t){
  float cols = 6.;
  float x = q.x * cols, cid = floor(x);
  vec3 n = h32(vec2(cid, 3.3));
  float on = smoothstep(n.z * .9, n.z * .9 + .1, amt);
  float spd = .07 + .12 * n.y;
  float cyc = t * spd + n.x * 9.;
  float head = 1.3 - fract(cyc) * 1.75;                      // from above the top to below the bottom
  float lx = (fract(x) - .5 - (n.x - .5) * .5) / cols;
  lx += sin(q.y * 9. + n.y * 30. + floor(cyc) * 2.1) * .006; // the path wanders
  float r = (.013 + .009 * n.y) * on;
  vec2 d = vec2(lx, (q.y - head) * .75);
  float m = smoothstep(r, r * .7, length(d)) * step(.001, r);
  float above = q.y - head;
  float track = smoothstep(r * .7, r * .2, abs(lx)) * step(0., above) * smoothstep(.55, 0., above) * on;
  // small beads left behind in the track
  float cell = floor(q.y * 34.);
  float ty = (fract(q.y * 34.) - .5) / 34.;
  float bead = smoothstep(.0045, .0025, length(vec2(lx, ty))) * track * step(.45, h12(vec2(cid, cell)));
  vec2 nrm = d / max(r, 1e-3) * m + vec2(lx, ty) / .0045 * bead * .6;
  return vec4(nrm, max(m, bead), track);
}

void main(){
  float ra = uR.x / uR.y;
  vec2 q = vec2(v.x * ra, v.y);
  float p = uP;
  float rain = 1. - smoothstep(.28, .7, p);
  float fog  = 1. - smoothstep(.2, .66, p);

  vec3 b1 = beads(q, 8.,  rain,        uT, 1.);
  vec3 b2 = beads(q + .37, 17., rain,  uT, 7.);
  vec3 b3 = beads(q + .11, 34., rain * 1.05, uT, 13.);
  vec4 rn = runners(q, rain, uT);
  vec2 nrm = b1.xy + b2.xy * .9 + b3.xy * .7 + rn.xy;
  float cov = clamp(max(max(b1.z, b2.z), max(b3.z, rn.z)), 0., 1.);

  // cover-fit, centred a little low like the CSS (object-position 50% 55%)
  vec2 uv = v;
  if (ra > uA) uv.y = (v.y - .5) * uA / ra + .5 - .025 * (1. - uA / ra);
  else         uv.x = (v.x - .5) * ra / uA + .5;

  // each drop is a little lens: the world inside it is flipped and pulled in
  vec2 ruv = uv - nrm * vec2(.03 / ra * uA, .03) * .9;

  // the clouds dissolve: the sky first, then the bay, through a soft cloudy edge
  float nz = fbm(uv * vec2(3.2, 2.2) + vec2(uT * .012, 0.));
  float k = p * 2.34 - 1.14 + (uv.y - .5) * .35;
  float m = smoothstep(-.16, .16, k - nz);

  float lod = fog * 4.2 * (1. - cov) * (1. - rn.w * .8);
  vec3 S = textureLod(uS, ruv, lod).rgb;
  vec3 C = textureLod(uC, ruv, lod * .7).rgb;
  // as the storm thins, what is left of it turns to pale mist over the same view, not smoke
  float thin = smoothstep(.36, .86, p);
  vec3 mist = mix(C, vec3(dot(C, vec3(.3, .59, .11))) * 1.12 + .07, .6);
  S = mix(S, mist, thin * .7);
  vec3 col = mix(S, C, m);

  // the cold breath on the glass
  col = mix(col, col * .9 + vec3(.05, .06, .07), fog * (1. - cov) * .55);
  // drops: a darker rim and a cool highlight where the light from the window hits them
  float nl = length(nrm);
  col *= 1. - .22 * cov * smoothstep(.55, 1., nl);
  col += cov * pow(max(0., dot(normalize(nrm + 1e-4), vec2(-.45, .9))), 8.) * .28 * smoothstep(.35, .95, nl);
  // after the rain the bay brightens a little
  col *= mix(.92, 1.03, smoothstep(.6, 1., p));
  o = vec4(col, 1.);
}`;

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export async function createSky(canvas, srcs) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const uR = U('uR'), uA = U('uA'), uT = U('uT'), uP = U('uP');

  const [imS, imC] = await Promise.all([loadImage(srcs.storm), loadImage(srcs.clear)]);
  const tex = (im, unit) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  tex(imS, 0); tex(imC, 1);
  gl.uniform1i(U('uS'), 0); gl.uniform1i(U('uC'), 1);
  gl.uniform1f(uA, imS.naturalWidth / imS.naturalHeight);

  let p = 0, t0 = performance.now(), tFixed = null, raf = 0, running = false, visible = true;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  };
  const draw = () => {
    resize();
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform1f(uT, tFixed !== null ? tFixed : (performance.now() - t0) / 1000);
    gl.uniform1f(uP, p);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const loop = () => { raf = 0; if (!running) return; if (visible) draw(); raf = requestAnimationFrame(loop); };
  // only render while the sky is on screen
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 });
  io.observe(canvas);
  draw();
  window.__sky = true;
  return {
    setP(v) { p = v; if (!running) draw(); },
    start() { if (running) return; running = true; if (!raf) raf = requestAnimationFrame(loop); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    resize() { draw(); },
    // for rendering the stills used when animations are off
    snapshot(v, t) { p = v; tFixed = t; draw(); const u = canvas.toDataURL('image/jpeg', .82); tFixed = null; return u; }
  };
}
