// The bench camera: a desktop tower on Sagi's blue hex mat, side panel off. The page's scroll position (0..1)
// drives everything; the readouts come from the page (window.__jobRead) so the 3D, the graph and the job card agree.
// Units are centimetres. The case's front is +x, its rear -x, the removable side panel faces +z.
// Air goes in through the two front fans, through the CPU cooler's fin stack (front to back) and out of the rear fan.
// The job: a felt of dust on the fins' intake face and a rear fan with a worn bearing → the CPU runs at 97 °C and
// throttles → the rear fan is replaced, the dust is blown out of the fins backwards (against the airflow, so it leaves
// the way it came in), the dried paste is wiped off and a pea of fresh paste spreads under the cooler → the stress test
// levels off around 68 °C at full clock. Desk texture: Poly Haven (CC0). Everything else is drawn here.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const sw = (p, a, b) => smooth(span(p, a, b));

// ---------------------------------------------------------------- the job's timeline (statuses: page STAGES)
// S1 received 0–0.10 · S2 diagnosed 0.10–0.36 · S3 part ordered 0.36–0.46 · S4 fitted 0.46–0.76 · S5 stress-tested 0.76–0.91 · S6 ready 0.91–1
const T = {
  panelOff: (p) => (p < 0.5 ? sw(p, 0.112, 0.138) : 1 - sw(p, 0.918, 0.952)),   // side panel: thumbscrews, slide, away
  thumbs: (p) => (p < 0.5 ? sw(p, 0.103, 0.114) : 1 - sw(p, 0.952, 0.964)),
  box: (p) => (p < 0.8 ? sw(p, 0.385, 0.425) : 1 - sw(p, 0.93, 0.97)),   // the new fan arrives in its box; the empty box goes at the end
  rearScrews: (p) => (p < 0.55 ? sw(p, 0.47, 0.49) : 1 - sw(p, 0.605, 0.618)),
  oldOut: (p) => sw(p, 0.49, 0.505),
  cfanOff: (p) => (p < 0.65 ? sw(p, 0.515, 0.53) : 1 - sw(p, 0.71, 0.728)),   // the cooler's own fan unclipped
  air: (p) => (p > 0.53 && p < 0.578 ? 1 : 0),           // compressed air through the empty rear fan mount
  felt: (p) => sw(p, 0.538, 0.572),                       // the dust mat clears in patches
  clean: (p) => sw(p, 0.54, 0.575),                       // loose dust on every surface
  newIn: (p) => sw(p, 0.59, 0.605),
  cScrews: (p) => (p < 0.66 ? sw(p, 0.618, 0.63) : 1 - sw(p, 0.698, 0.71)),
  coolerOut: (p) => (p < 0.66 ? sw(p, 0.63, 0.645) : 1 - sw(p, 0.682, 0.698)),
  wipe: (p) => span(p, 0.652, 0.668),
  pea: (p) => sw(p, 0.669, 0.68),
};

// camera keyframes: [p, position, target]
const KEYS = [
  [0.00, [72, 52, 118], [2, 22, 0]],
  [0.06, [58, 40, 92], [4, 22, 0]],
  [0.10, [50, 36, 80], [0, 24, 0]],
  [0.14, [36, 40, 66], [-4, 30, 0]],
  [0.20, [12, 42, 34], [-10, 37, -2]],
  [0.25, [9, 40, 30], [-10, 37, -2]],
  [0.30, [2, 47, 30], [-17, 37, -2]],
  [0.335, [0, 46, 28], [-18, 37, -2]],
  [0.37, [44, 40, 72], [2, 24, 0]],
  [0.42, [56, 30, 74], [16, 16, 4]],
  [0.455, [20, 42, 60], [-10, 32, 0]],
  [0.47, [-48, 42, 24], [-21, 36, -1]],
  [0.50, [-46, 42, 22], [-21, 36, -1]],
  [0.515, [14, 43, 32], [-10, 37, -2]],
  [0.53, [10, 47, 42], [-15, 38, -1]],
  [0.575, [8, 46, 40], [-14, 38, -1]],
  [0.605, [-6, 45, 40], [-16, 38, -1]],
  [0.62, [20, 48, 60], [-8, 36, -2]],
  [0.643, [20, 48, 60], [-8, 36, -2]],
  [0.655, [-6, 42, 15], [-11, 38, -9]],
  [0.668, [-7, 41, 10], [-11, 38, -9]],
  [0.68, [-7, 41, 10], [-11, 38, -9]],
  [0.69, [14, 50, 36], [-11, 37, -6]],
  [0.70, [12, 49, 34], [-11, 37, -6]],
  [0.712, [4, 47, 24], [-11, 38, -5]],
  [0.728, [12, 44, 32], [-10, 37, -2]],
  [0.76, [30, 42, 64], [-4, 31, 0]],
  [0.84, [14, 42, 66], [-5, 32, 0]],
  [0.91, [30, 44, 62], [-2, 28, 0]],
  [1.00, [64, 44, 100], [2, 22, 0]],
];

const LABELS = [
  ['in', 'אוויר נכנס מקדימה', 'Air in at the front'],
  ['out', 'יוצא מאחור', 'Out at the back'],
  ['felt', 'שכבת אבק על צלעות הקירור', 'A mat of dust on the cooler fins'],
  ['rear', 'מאוורר אחורי: מסב שחוק, מקרטע', 'Rear fan: worn bearing, stuttering'],
  ['box', 'מאוורר 120 מ״מ חדש', 'A new 120 mm fan'],
  ['screws', 'ארבעה ברגים מבחוץ', 'Four screws from outside'],
  ['blow', 'האבק יוצא מהכיוון שבו נכנס', 'The dust leaves the way it came in'],
  ['oldpaste', 'משחה טרמית יבשה', 'Dried thermal paste'],
  ['newpaste', 'משחה חדשה מתפזרת בלחץ', 'Fresh paste spreads under pressure'],
  ['flow', 'זרימה חופשית', 'Air flows freely'],
];

function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

const GLSL_NOISE = `
float lh(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(lh(i), lh(i + vec3(1,0,0)), f.x), mix(lh(i + vec3(0,1,0)), lh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(lh(i + vec3(0,0,1)), lh(i + vec3(1,0,1)), f.x), mix(lh(i + vec3(0,1,1)), lh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
`;

// one set of dust uniforms for the whole case: how much dust there is, and how far the cleaning has got
const DUST = { uDust: { value: 1 }, uClean: { value: 0 } };
// patch a standard material so dust settles on its upward faces (and a little on the sides), in organic patches,
// greying and dulling it; uClean takes it away patch by patch
function dusty(mat, key, amount) {
  mat.customProgramCacheKey = () => 'dust-' + key;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uDust = DUST.uDust; sh.uniforms.uClean = DUST.uClean;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vDW; varying vec3 vDN;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 dw = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          dw = instanceMatrix * dw;
        #endif
        dw = modelMatrix * dw; vDW = dw.xyz; vDN = normalize(mat3(modelMatrix) * objectNormal);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vDW; varying vec3 vDN; uniform float uDust; uniform float uClean;\n${GLSL_NOISE}`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        float up = smoothstep(0.35, 0.95, vDN.y) + 0.06 * (1.0 - abs(vDN.y));
        float patchy = smoothstep(0.2, 0.8, fbm(vDW * 0.45)) * 0.45 + 0.55;
        float speck = smoothstep(0.5, 0.9, fbm(vDW * 11.0));
        float cover = uDust * ${amount.toFixed(2)} * up * (patchy * 0.8 + speck * 0.18);
        cover *= smoothstep(uClean - 0.12, uClean + 0.04, fbm(vDW * 0.33 + 3.1));
        cover = clamp(cover, 0.0, 0.62);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.36, 0.345, 0.33), cover);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 1.0, cover);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.0, cover);');
  };
  return mat;
}

export function initTower(host, labelsHost, opts) {
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  const small = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1014);
  scene.fog = new THREE.Fog(0x0d1014, 160, 320);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 600);
  const R = rng(11);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // ---------------------------------------------------------------- textures drawn here
  const canvasTex = (w, h, draw, srgb = true) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, maxAniso); return t;
  };
  // fine height noise turned into a normal map (powder coat, brushed metal)
  function noiseNormal(size, sx, sy, amp, seed) {
    const r = rng(seed), hgt = new Float32Array(size * size);
    for (let i = 0; i < hgt.length; i++) hgt[i] = r();
    const blur = (a) => { const b = new Float32Array(a.length); for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let s = 0, n = 0; for (let k = -sx; k <= sx; k++) for (let j = -sy; j <= sy; j++) { s += a[((y + j + size) % size) * size + ((x + k + size) % size)]; n++; } b[y * size + x] = s / n; } return b; };
    const h = blur(hgt);
    return canvasTex(size, size, (g) => {
      const im = g.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const dx = (h[y * size + (x + 1) % size] - h[y * size + (x - 1 + size) % size]) * amp, dy = (h[((y + 1) % size) * size + x] - h[((y - 1 + size) % size) * size + x]) * amp;
        const l = Math.hypot(dx, dy, 1), o = (y * size + x) * 4;
        im.data[o] = (-dx / l * 0.5 + 0.5) * 255; im.data[o + 1] = (dy / l * 0.5 + 0.5) * 255; im.data[o + 2] = (1 / l * 0.5 + 0.5) * 255; im.data[o + 3] = 255;
      }
      g.putImageData(im, 0, 0);
    }, false);
  }
  const powderNor = noiseNormal(128, 1, 1, 4, 3); powderNor.wrapS = powderNor.wrapT = THREE.RepeatWrapping; powderNor.repeat.set(14, 14);
  const brushNor = noiseNormal(128, 6, 0, 3, 5); brushNor.wrapS = brushNor.wrapT = THREE.RepeatWrapping;

  // the motherboard: a black board, grey traces, silkscreen, plated holes (24.4 × 30.5 cm)
  const pcbMap = canvasTex(976, 1220, (g, w, h) => {
    g.fillStyle = '#17191c'; g.fillRect(0, 0, w, h);
    g.lineCap = 'round';
    for (let i = 0; i < 140; i++) {
      g.strokeStyle = R() < 0.5 ? '#202429' : '#262a30'; g.lineWidth = 1.2 + R() * 2.4;
      let x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 4; k++) { if (R() < 0.5) x += (R() - 0.5) * 300; else y += (R() - 0.5) * 300; g.lineTo(x, y); const d = (R() - 0.5) * 50; x += d; y += Math.abs(d); g.lineTo(x, y); }
      g.stroke();
    }
    g.fillStyle = '#b9a46a'; for (let i = 0; i < 9; i++) { const x = [24, 300, 940, 24, 940, 24, 500, 940, 300][i], y = [24, 24, 24, 600, 600, 1190, 1190, 1190, 600][i]; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill(); g.fillStyle = '#0c0d0f'; g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); g.fillStyle = '#b9a46a'; }
    g.fillStyle = '#d9dcdf'; g.font = '600 15px sans-serif';
    [['CPU_FAN', 520, 70], ['SYS_FAN1', 70, 70], ['ATX_12V', 120, 40], ['PCIEX16_1', 120, 700], ['M2_1', 300, 860], ['DIMM_A2', 640, 150], ['C1204', 420, 520], ['R311', 640, 560], ['BAT', 760, 1000], ['JFP1', 860, 1160]].forEach(([t, x, y]) => g.fillText(t, x, y));
    for (let i = 0; i < 420; i++) { g.fillStyle = R() < 0.6 ? '#3b3f45' : '#6d6455'; g.fillRect(R() * w, R() * h, 4 + R() * 6, 2 + R() * 4); }
  });
  // Sagi's blue hex mat (it is on his bench in the photo of the white build)
  const matMap = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#08142e'; g.fillRect(0, 0, w, h);
    const r = 22, dx = r * Math.sqrt(3), dy = r * 1.5;
    for (let row = -1; row < h / dy + 1; row++) for (let col = -1; col < w / dx + 1; col++) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0), cy = row * dy, l = 36 + R() * 7;
      g.fillStyle = `hsl(219 64% ${l}%)`;
      g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * TAU / 6, rr = r - 2.2; g[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill();
    }
    g.strokeStyle = '#0a1226'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  });
  // a felt of dust: grey fibres, lint and fluff, with ragged edges (alpha)
  const feltMap = canvasTex(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const grad = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(140,134,124,${a})`); gr.addColorStop(1, 'rgba(140,134,124,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
    for (let i = 0; i < 260; i++) grad(30 + R() * (w - 60), 30 + R() * (h - 60), 30 + R() * 50, 0.35);
    g.lineCap = 'round';
    for (let i = 0; i < 2600; i++) {
      const x = 20 + R() * (w - 40), y = 20 + R() * (h - 40), a = R() * TAU, l = 6 + R() * 26, v = 105 + R() * 90;
      g.strokeStyle = `rgba(${v},${v - 6},${v - 14},${0.35 + R() * 0.5})`; g.lineWidth = 0.6 + R() * 1.4;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.8) * l * 0.6, y + Math.sin(a + 0.8) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${60 + R() * 40},${55 + R() * 40},${50 + R() * 30},0.6)`; g.beginPath(); g.arc(R() * w, R() * h, 1 + R() * 2.5, 0, TAU); g.fill(); }
  });
  // the new fan's box: printed cardboard with a line drawing of the fan
  const boxMap = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#1b1e22'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9aa3ad'; g.lineWidth = 6; g.strokeRect(60, 60, 392, 392);
    g.beginPath(); g.arc(256, 256, 170, 0, TAU); g.stroke();
    for (let k = 0; k < 7; k++) { const a = k * TAU / 7; g.beginPath(); g.moveTo(256 + Math.cos(a) * 52, 256 + Math.sin(a) * 52); g.quadraticCurveTo(256 + Math.cos(a + 0.6) * 120, 256 + Math.sin(a + 0.6) * 120, 256 + Math.cos(a + 0.9) * 160, 256 + Math.sin(a + 0.9) * 160); g.stroke(); }
    g.fillStyle = '#e8eaec'; g.font = '700 54px sans-serif'; g.fillText('120 mm', 70, 500);
    g.fillStyle = '#ffb22e'; g.fillRect(380, 470, 72, 16);
  });
  const stickerMap = canvasTex(128, 128, (g) => { g.fillStyle = '#2a2d31'; g.beginPath(); g.arc(64, 64, 64, 0, TAU); g.fill(); g.strokeStyle = '#8c949c'; g.lineWidth = 4; g.beginPath(); g.arc(64, 64, 44, 0, TAU); g.stroke(); g.strokeStyle = '#5d646b'; g.lineWidth = 2; g.beginPath(); g.arc(64, 64, 30, 0, TAU); g.stroke(); });

  const loader = new THREE.TextureLoader();
  const ph = (name, srgb, rep) => { const t = loader.load(`tex/${name}.jpg`, () => kick()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = Math.min(8, maxAniso); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };

  // ---------------------------------------------------------------- materials
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const M = {
    caseOut: new THREE.MeshPhysicalMaterial({ color: 0x15171a, metalness: 0.45, roughness: 0.52, normalMap: powderNor, normalScale: new THREE.Vector2(0.12, 0.12), clearcoat: 0.25, clearcoatRoughness: 0.5 }),
    caseIn: dusty(std({ color: 0x141619, metalness: 0.4, roughness: 0.62, normalMap: powderNor, normalScale: new THREE.Vector2(0.1, 0.1) }), 'case', 0.7),
    shroud: dusty(std({ color: 0x17191c, metalness: 0.35, roughness: 0.55, normalMap: powderNor, normalScale: new THREE.Vector2(0.1, 0.1) }), 'shroud', 0.85),
    mesh: std({ color: 0x0c0d0f, metalness: 0.3, roughness: 0.7 }),
    pcb: dusty(std({ map: pcbMap, roughness: 0.55, metalness: 0.15 }), 'pcb', 0.35),
    alu: dusty(std({ color: 0xc4c8cd, metalness: 1, roughness: 0.32, normalMap: brushNor, normalScale: new THREE.Vector2(0.08, 0.08) }), 'alu', 0.4),
    nickel: std({ color: 0xd6d9dc, metalness: 1, roughness: 0.2 }),
    copper: std({ color: 0xc87a4c, metalness: 1, roughness: 0.28 }),
    vrm: dusty(std({ color: 0x2b2f35, metalness: 0.8, roughness: 0.38, normalMap: brushNor, normalScale: new THREE.Vector2(0.15, 0.15) }), 'vrm', 0.6),
    ram: dusty(std({ color: 0x1f2226, metalness: 0.7, roughness: 0.35 }), 'ram', 0.5),
    ramTop: std({ color: 0xb7bcc2, metalness: 1, roughness: 0.3 }),
    slot: std({ color: 0x0f1012, roughness: 0.5 }),
    gpu: std({ color: 0x1e2125, metalness: 0.35, roughness: 0.42 }),
    gpuBack: dusty(std({ color: 0x23262b, metalness: 0.75, roughness: 0.42, normalMap: brushNor, normalScale: new THREE.Vector2(0.15, 0.15) }), 'gpub', 0.9),
    gpuFin: std({ color: 0x8e949b, metalness: 1, roughness: 0.4 }),
    plastic: std({ color: 0x121315, roughness: 0.55 }),
    fanOld: dusty(std({ color: 0x1d1e21, roughness: 0.7, side: THREE.DoubleSide }), 'fanold', 0.9),
    fanNew: std({ color: 0x141518, roughness: 0.42, side: THREE.DoubleSide }),
    fanFrame: dusty(std({ color: 0x111214, roughness: 0.6 }), 'frame', 0.45),
    blur: new THREE.MeshBasicMaterial({ color: 0x2a2c30, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
    steel: std({ color: 0xb8bdc2, metalness: 1, roughness: 0.3 }),
    screw: std({ color: 0x9da3a9, metalness: 1, roughness: 0.35 }),
    cable: std({ color: 0x0e0f11, roughness: 0.82 }),
    die: new THREE.MeshPhysicalMaterial({ color: 0xc3c7cb, metalness: 1, roughness: 0.25 }),
    socket: std({ color: 0x2a2c30, metalness: 0.6, roughness: 0.4 }),
    pasteOld: std({ color: 0x5f6266, roughness: 0.97 }),
    pasteNew: std({ color: 0x9da3a9, roughness: 0.35, metalness: 0.15 }),
    felt: std({ map: feltMap, alphaTest: 0.5, roughness: 1, side: THREE.DoubleSide }),
    dust: std({ color: 0x55514b, roughness: 1 }),
    mat: std({ map: matMap, roughness: 0.92, normalMap: ph('fabric_pattern_05_nor', false, [10, 5]), normalScale: new THREE.Vector2(0.6, 0.6) }),
    desk: std({ color: 0x8a7d72, map: ph('wood_table_001_diff', true, [2, 1]), normalMap: ph('wood_table_001_nor', false, [2, 1]), roughnessMap: ph('wood_table_001_rough', false, [2, 1]), roughness: 0.9 }),
    wall: std({ color: 0x1e2226, roughness: 0.95 }),
    box: std({ map: boxMap, roughness: 0.8 }),
    boxSide: std({ color: 0x15171a, roughness: 0.85 }),
    sticker: std({ map: stickerMap, roughness: 0.5 }),
    led: new THREE.MeshBasicMaterial({ color: 0x2a2f35 }),
    can: std({ color: 0xd8dbde, metalness: 0.9, roughness: 0.25 }),
    canLabel: std({ color: 0x1d4fae, roughness: 0.5 }),
    straw: std({ color: 0xd8342a, roughness: 0.4 }),
    swab: std({ color: 0xf0ede6, roughness: 0.95 }),
    stick: std({ color: 0x2b6cb0, roughness: 0.5 }),
    syringe: new THREE.MeshPhysicalMaterial({ color: 0xe7eef2, roughness: 0.15, transmission: 0.6, transparent: true, opacity: 0.8, thickness: 0.4 }),
  };
  M.felt.customProgramCacheKey = () => 'felt';
  M.felt.userData.u = { uClear: { value: 0 } };
  M.felt.onBeforeCompile = (sh) => {      // the felt clears in patches, nearest the air first
    sh.uniforms.uClear = M.felt.userData.u.uClear;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvFP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vFP; uniform float uClear;\n${GLSL_NOISE}`)
      .replace('#include <alphatest_fragment>', `float n = fbm(vFP * 0.7 + 2.0) * 0.8 + 0.2 * (1.0 - (vFP.y + 6.5) / 13.0);
        if (n < uClear * 1.25 - 0.05) discard;
        #include <alphatest_fragment>`);
  };

  // ---------------------------------------------------------------- light: the desk lamp above the bench, a cool fill, a rim
  scene.add(new THREE.HemisphereLight(0xdfe8f5, 0x262019, 0.5));
  const lamp = new THREE.SpotLight(0xfff1dc, 5200, 260, 0.62, 0.55, 1.6);
  lamp.position.set(40, 110, 70); lamp.target.position.set(-2, 26, 0); lamp.castShadow = true;
  lamp.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048); lamp.shadow.bias = -0.0003; lamp.shadow.normalBias = 0.04;
  scene.add(lamp, lamp.target);
  const fill = new THREE.DirectionalLight(0xbfd6ff, 0.55); fill.position.set(-60, 40, 80); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffe2c4, 0.6); rim.position.set(-40, 70, -90); scene.add(rim);
  const inner = new THREE.PointLight(0xfff4e6, 520, 80, 1.5); inner.position.set(10, 42, 10);
  const inner2 = new THREE.PointLight(0xe8f0ff, 260, 70, 1.5); inner2.position.set(-6, 22, 16); scene.add(inner2); scene.add(inner);   // the inspection torch, on once the panel is off

  const add = (m, parent) => { m.castShadow = m.receiveShadow = true; (parent || scene).add(m); return m; };
  const box = (mat, x0, x1, y0, y1, z0, z1, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return add(m, parent); };
  const rbox = (mat, x0, x1, y0, y1, z0, z1, r, parent) => { const m = new THREE.Mesh(new RoundedBoxGeometry(x1 - x0, y1 - y0, z1 - z0, 3, r), mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return add(m, parent); };
  const cyl = (mat, r0, r1, h, seg, parent) => add(new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg || 24), mat), parent);

  // ---------------------------------------------------------------- the bench: wooden desk, the hex mat, a dark wall
  const deskM = box(M.desk, -120, 120, -4.3, -0.3, -60, 60); deskM.castShadow = false;
  const matM = box(M.mat, -48, 48, -0.3, 0, -26, 26); matM.castShadow = false;
  const wall = box(M.wall, -200, 200, -4, 200, -64, -60); wall.castShadow = false;

  // a screwdriver and a magnetic parts dish on the mat
  { const sd = new THREE.Group(); scene.add(sd);
    const hd = cyl(std({ color: 0xc8392b, roughness: 0.45 }), 1.3, 1.5, 10, 24, sd); hd.rotation.z = Math.PI / 2; hd.position.x = 5;
    const fer = cyl(M.steel, 0.55, 0.55, 1.2, 16, sd); fer.rotation.z = Math.PI / 2; fer.position.x = -0.6;
    const sh = cyl(M.steel, 0.28, 0.28, 13, 12, sd); sh.rotation.z = Math.PI / 2; sh.position.x = -7.5;
    sd.position.set(34, 1.4, -14); sd.rotation.y = 0.5;
    const dish = cyl(M.steel, 5, 4.2, 1.4, 40); dish.position.set(-34, 0.7, 12);
    const inside = cyl(std({ color: 0x2b2f35, metalness: 0.6, roughness: 0.5 }), 4.6, 4.6, 0.05, 40); inside.position.set(-34, 1.43, 12);
    for (let i = 0; i < 7; i++) { const sc = cyl(M.screw, 0.42, 0.42, 0.3, 6); sc.position.set(-34 + (R() - 0.5) * 5, 1.6, 12 + (R() - 0.5) * 5); } }
  // ---------------------------------------------------------------- the case
  const X0 = -22, X1 = 22, Y0 = 1.6, Y1 = 47.6, Z0 = -10.5, Z1 = 10.5, t = 0.12;
  [[-19, -8], [-19, 8], [19, -8], [19, 8]].forEach(([x, z]) => { const f = cyl(M.plastic, 1.6, 1.8, 1.6, 20); f.position.set(x, 0.8, z); });
  box(M.caseOut, X0, X1, Y0, Y0 + 0.4, Z0, Z1);                      // floor
  const floorIn = box(M.caseIn, X0 + t, X1 - t, Y0 + 0.4, Y0 + 0.42, Z0 + t, Z1 - t); floorIn.castShadow = false;
  box(M.caseOut, X0, X1, Y1 - 0.4, Y1, Z0, Z1);                      // top, with a dust filter over its rear half
  box(M.mesh, X0 + 2, X1 - 14, Y1 - 0.42, Y1 - 0.38, Z0 + 2, Z1 - 3);
  box(M.caseIn, X0, X1, Y0, Y1, Z0, Z0 + t);                         // the far panel; the motherboard tray sits on it
  // rear panel: I/O window, a 120 mm fan grille, seven slot covers
  const rear = new THREE.Group(); scene.add(rear);
  const rs = new THREE.Shape(); rs.moveTo(Z0, Y0); rs.lineTo(Z1, Y0); rs.lineTo(Z1, Y1); rs.lineTo(Z0, Y1); rs.closePath();
  const io = new THREE.Path(); io.moveTo(-10.2, 32); io.lineTo(-8.0, 32); io.lineTo(-8.0, 46.4); io.lineTo(-10.2, 46.4); io.closePath(); rs.holes.push(io);
  const fanHole = new THREE.Path(); fanHole.absarc(-2, 38.5, 5.7, 0, TAU, true); rs.holes.push(fanHole);
  const slots = new THREE.Path(); slots.moveTo(-10.2, 13); slots.lineTo(-8.6, 13); slots.lineTo(-8.6, 30); slots.lineTo(-10.2, 30); slots.closePath(); rs.holes.push(slots);
  const rearG = new THREE.ExtrudeGeometry(rs, { depth: 0.12, bevelEnabled: false }); rearG.rotateY(Math.PI / 2);
  add(new THREE.Mesh(rearG, M.caseOut), rear).position.set(X0 - 0.12, 0, 0);
  // fan grille: concentric rings and spokes in front of the rear fan
  [5.6, 4.3, 3.0, 1.8].forEach((r) => { const ring = add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.09, 6, 48), M.caseOut), rear); ring.rotation.y = Math.PI / 2; ring.position.set(X0 - 0.1, 38.5, -2); });
  for (let k = 0; k < 4; k++) { const s = box(M.caseOut, -0.06, 0.06, -5.7, 5.7, -0.12, 0.12, rear); s.position.set(X0 - 0.1, 38.5, -2); s.rotation.x = k * Math.PI / 4; }
  // I/O shield and the board's ports
  box(M.steel, X0 - 0.2, X0 + 0.1, 32.2, 46.2, -10.0, -8.2, rear);
  [[34, 1.4], [36.3, 1.4], [38.6, 1.6], [41.2, 1.2], [43.2, 2.0]].forEach(([y, hgt], i) => box(i % 2 ? M.slot : M.screw, X0 - 0.3, X0 + 1.2, y, y + hgt, -9.7, -8.5, rear));
  for (let i = 0; i < 7; i++) box(M.caseOut, X0 - 0.25, X0 - 0.05, 13.4 + i * 2.35, 15.2 + i * 2.35, -10.1, -8.8, rear);
  // front: mesh face in a frame, power button and LED on the top edge
  const front = new THREE.Group(); scene.add(front);
  box(M.caseOut, X1, X1 + 0.9, Y0, Y1, Z0, Z0 + 1.2, front); box(M.caseOut, X1, X1 + 0.9, Y0, Y1, Z1 - 1.2, Z1, front);
  box(M.caseOut, X1, X1 + 0.9, Y0, Y0 + 1.2, Z0, Z1, front); box(M.caseOut, X1, X1 + 0.9, Y1 - 3, Y1, Z0, Z1, front);
  const meshTex = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; for (let y = 0; y < h; y += 10) for (let x = (y / 10) % 2 ? 5 : 0; x < w; x += 10) { g.beginPath(); g.arc(x, y, 3.4, 0, TAU); g.fill(); } }, false);
  const frontMesh = add(new THREE.Mesh(new THREE.PlaneGeometry(Z1 - Z0 - 2.4, Y1 - Y0 - 4.2), std({ color: 0x101114, metalness: 0.4, roughness: 0.6, alphaMap: meshTex, alphaTest: 0.5, side: THREE.DoubleSide })), front);
  frontMesh.rotation.y = Math.PI / 2; frontMesh.position.set(X1 + 0.5, (Y0 + 1.2 + Y1 - 3) / 2, 0);
  const pwr = cyl(M.caseOut, 0.8, 0.8, 0.3, 32, front); pwr.position.set(X1 - 2.2, Y1 + 0.12, 3);
  const ledM = add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.25), M.led), front); ledM.position.set(X1 - 2.2, Y1 + 0.05, 5.2);
  // the side panel (+z) with its two thumbscrews at the rear edge
  const panel = new THREE.Group(); scene.add(panel);
  rbox(M.caseOut, X0, X1, Y0, Y1, Z1 - 0.12, Z1, 0.05, panel);
      const thumbs = [32, 16].map((y) => { const g = new THREE.Group(); scene.add(g); const h = cyl(M.screw, 0.75, 0.75, 1.0, 18, g); h.rotation.z = Math.PI / 2; const s = cyl(M.screw, 0.2, 0.2, 1.2, 10, g); s.rotation.z = Math.PI / 2; s.position.x = 1.0; g.userData.y = y; return g; });

  // ---------------------------------------------------------------- PSU shroud and what's on it
  box(M.shroud, X0 + t, X1 - 3, Y0 + 0.4, 10.6, Z0 + t, Z1 - 0.3);
  box(M.caseIn, -8, 2, 10.6, 10.62, Z0 + 1.5, Z0 + 4);                  // the cable cut-out's shadow
  const ssd = rbox(dusty(std({ color: 0x2a2d32, metalness: 0.6, roughness: 0.4 }), 'ssd', 1), 6, 16, 10.6, 11.3, 1.5, 8.5, 0.15);

  // ---------------------------------------------------------------- the motherboard and its parts
  const BX0 = -21.2, BX1 = 3.2, BY0 = 15.8, BY1 = 46.3, BZ = -9.45;
  const board = box(M.pcb, BX0, BX1, BY0, BY1, BZ - 0.16, BZ);
  board.material.map.repeat.set(1, 1);
  const vrm1 = rbox(M.vrm, -18.4, -7.6, 43.4, 45.6, BZ, BZ + 2.3, 0.25);
  const vrm2 = rbox(M.vrm, -20.6, -18.6, 30.5, 43.2, BZ, BZ + 2.6, 0.25);
  for (let i = 0; i < 8; i++) box(M.vrm, -18.2 + i * 1.35, -17.6 + i * 1.35, 45.6, 46.0, BZ + 0.2, BZ + 2.1);   // fins on the VRM block
  rbox(M.vrm, -2.5, 2.4, 18.2, 22.2, BZ, BZ + 1.1, 0.25);                  // chipset
  rbox(M.vrm, -16, -4, 23.6, 25.6, BZ, BZ + 0.8, 0.2);                     // M.2 cover
  // memory: four slots, two sticks in A2 and B2
  const DIMM_Y0 = 25.5, DIMM_Y1 = 39.0;
  [-3.4, -2.5, -1.6, -0.7].forEach((x, i) => {
    box(M.slot, x - 0.32, x + 0.32, DIMM_Y0, DIMM_Y1, BZ, BZ + 0.7);
    if (i === 1 || i === 3) { rbox(M.ram, x - 0.22, x + 0.22, DIMM_Y0 + 0.2, DIMM_Y1 - 0.2, BZ + 0.6, BZ + 3.9, 0.08); box(M.ramTop, x - 0.2, x + 0.2, DIMM_Y0 + 0.4, DIMM_Y1 - 0.4, BZ + 3.9, BZ + 4.05); }
  });
  // CPU socket, load plate, the processor's heat spreader
  const CX = -11, CY = 38;
  rbox(M.socket, CX - 2.6, CX + 2.6, CY - 2.9, CY + 2.9, BZ, BZ + 0.45, 0.1);
  box(M.steel, CX - 2.2, CX + 2.2, CY - 2.4, CY - 2.0, BZ + 0.45, BZ + 0.55); box(M.steel, CX - 2.2, CX + 2.2, CY + 2.0, CY + 2.4, BZ + 0.45, BZ + 0.55);
  const ihs = rbox(M.die, CX - 1.85, CX + 1.85, CY - 1.85, CY + 1.85, BZ + 0.45, BZ + 0.75, 0.12);
  const IHS_Z = BZ + 0.75;
  // the cooler's backplate standoffs (two screws, left and right of the socket)
  const STAND = [[CX - 4.4, CY], [CX + 4.4, CY]];
  STAND.forEach(([x, y]) => { const s = cyl(M.steel, 0.35, 0.35, 1.5, 12); s.rotation.x = Math.PI / 2; s.position.set(x, y, BZ + 0.75); });

  // dried paste: cracked grey islands on the heat spreader
  const flakes = [];
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Shape(), n = 7, rr = 0.32 + R() * 0.2;
    for (let k = 0; k < n; k++) { const a = k / n * TAU, r = rr * (0.55 + R() * 0.6); k ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const m = add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }), M.pasteOld));
    m.position.set(CX - 1.35 + (i % 4) * 0.9 + (R() - 0.5) * 0.2, CY - 1.35 + Math.floor(i / 4) * 0.9 + (R() - 0.5) * 0.2, IHS_Z); m.rotation.z = R() * TAU;
    m.userData.order = (m.position.x - CX) * 0.6 + (m.position.y - CY) + R() * 0.4; flakes.push(m);
  }
  flakes.sort((a, b) => a.userData.order - b.userData.order);
  // fresh paste: a pea that flattens to a thin disc under the base (volume kept)
  const pea = add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), M.pasteNew)); pea.rotation.x = Math.PI / 2; pea.position.set(CX, CY, IHS_Z);

  // ---------------------------------------------------------------- the tower cooler (fin stack, four U heat pipes, base, crossbar)
  const cooler = new THREE.Group(); scene.add(cooler);
  const FX0 = -13.5, FX1 = -8.5, FY0 = 30.9, FY1 = 45.1, FZ0 = -5.4, FZ1 = 6.0;
  rbox(M.nickel, CX - 2.1, CX + 2.1, CY - 2.1, CY + 2.1, IHS_Z, IHS_Z + 1.3, 0.12, cooler);    // base
  box(M.alu, CX - 2.0, CX + 2.0, CY - 2.0, CY + 2.0, IHS_Z + 1.3, IHS_Z + 2.4, cooler);         // the small fin block on the base
  const bar = rbox(M.steel, CX - 5.0, CX + 5.0, CY - 0.6, CY + 0.6, IHS_Z + 1.3, IHS_Z + 1.6, 0.1, cooler);
  const cScrews = STAND.map(([x, y]) => { const g = new THREE.Group(); cooler.add(g); const h = cyl(M.screw, 0.42, 0.42, 0.35, 16, g); h.rotation.x = Math.PI / 2; const sp = cyl(M.steel, 0.3, 0.3, 0.9, 8, g); sp.rotation.x = Math.PI / 2; sp.position.z = -0.5; g.position.set(x + (x < CX ? -0.6 : 0.6), y, IHS_Z + 1.75); g.userData.z = IHS_Z + 1.75; return g; });
  const PIPES = [-12.8, -11.7, -10.3, -9.2];
  const pipeEnds = [];
  PIPES.forEach((x, i) => {
    const dy = 4.4 + (i % 2) * 0.9, zb = IHS_Z + 0.55;
    const path = new THREE.CurvePath();
    const pts = [[x, CY - dy, FZ1 + 0.1], [x, CY - dy, zb + 1.4], [x, CY - dy + 0.2, zb + 0.3], [x, CY - dy + 1.4, zb], [x, CY + dy - 1.4, zb], [x, CY + dy - 0.2, zb + 0.3], [x, CY + dy, zb + 1.4], [x, CY + dy, FZ1 + 0.1]].map((a) => new THREE.Vector3(...a));
    path.add(new THREE.LineCurve3(pts[0], pts[1])); path.add(new THREE.QuadraticBezierCurve3(pts[1], new THREE.Vector3(x, CY - dy, zb), pts[3]));
    path.add(new THREE.LineCurve3(pts[3], pts[4])); path.add(new THREE.QuadraticBezierCurve3(pts[4], new THREE.Vector3(x, CY + dy, zb), pts[6])); path.add(new THREE.LineCurve3(pts[6], pts[7]));
    add(new THREE.Mesh(new THREE.TubeGeometry(path, 120, 0.3, 14, false), M.copper), cooler);
    pipeEnds.push([x, CY - dy], [x, CY + dy]);
  });
  // fins: thin plates with a toothed intake edge and holes for the pipes, stacked along z
  const finShape = new THREE.Shape();
  finShape.moveTo(FX0, FY0); finShape.lineTo(FX1 - 0.3, FY0);
  for (let k = 0; k < 14; k++) { const y = FY0 + k * (FY1 - FY0) / 14; finShape.lineTo(FX1, y + 0.25); finShape.lineTo(FX1, y + 0.75); finShape.lineTo(FX1 - 0.3, y + 1.0); }
  finShape.lineTo(FX1 - 0.3, FY1); finShape.lineTo(FX0, FY1); finShape.closePath();
  pipeEnds.forEach(([x, y]) => { const hP = new THREE.Path(); hP.absarc(x, y, 0.33, 0, TAU, true); finShape.holes.push(hP); });
  const finG = new THREE.ExtrudeGeometry(finShape, { depth: 0.035, bevelEnabled: false, curveSegments: 10 });
  const FIN_N = 54, fins = new THREE.InstancedMesh(finG, M.alu, FIN_N), mm = new THREE.Matrix4();
  for (let i = 0; i < FIN_N; i++) { mm.makeTranslation(0, 0, FZ0 + i * (FZ1 - FZ0) / (FIN_N - 1)); fins.setMatrixAt(i, mm); }
  fins.castShadow = fins.receiveShadow = true; cooler.add(fins);
  // top cap with the eight pipe ends
  const cap = rbox(std({ color: 0xb4b9bf, metalness: 1, roughness: 0.34, normalMap: brushNor, normalScale: new THREE.Vector2(0.06, 0.06) }), FX0 - 0.15, FX1 + 0.05, FY0 - 0.15, FY1 + 0.15, FZ1 + 0.05, FZ1 + 0.45, 0.12, cooler);
  pipeEnds.forEach(([x, y]) => { const e = cyl(M.nickel, 0.31, 0.31, 0.12, 16, cooler); e.rotation.x = Math.PI / 2; e.position.set(x, y, FZ1 + 0.5); });

  // the felt of dust on the fins' intake face (+x side), lumpy, poking out round the fan
  const feltG = new THREE.PlaneGeometry(FZ1 - FZ0 + 1.2, FY1 - FY0 + 1.0, 56, 60);
  { const pos = feltG.attributes.position, rf = rng(5); for (let i = 0; i < pos.count; i++) { const a = pos.getX(i), b = pos.getY(i); pos.setZ(i, 0.12 + 0.28 * Math.abs(Math.sin(a * 1.7 + b * 0.9) * Math.cos(b * 1.3 - a * 0.4)) + rf() * 0.08); } feltG.computeVertexNormals(); }
  const felt = add(new THREE.Mesh(feltG, M.felt), cooler);
  felt.rotation.y = Math.PI / 2; felt.position.set(FX1 + 0.02, (FY0 + FY1) / 2, (FZ0 + FZ1) / 2);
  // tufts sticking out of the fin gaps above and below the fan
  const lumpG = new THREE.IcosahedronGeometry(1, 2);
  { const pos = lumpG.attributes.position, rl = rng(9); for (let i = 0; i < pos.count; i++) { const k = 0.8 + rl() * 0.4; pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k); } lumpG.computeVertexNormals(); }
  const tufts = new THREE.Group(); cooler.add(tufts);
  for (let i = 0; i < 46; i++) {
    const m = new THREE.Mesh(lumpG, M.dust), edge = R() < 0.5 ? FY0 + R() * 0.8 : FY1 - R() * 0.8;
    m.position.set(FX1 + 0.1 + R() * 0.25, i < 36 ? edge : FY0 + R() * (FY1 - FY0), FZ0 + R() * (FZ1 - FZ0)); m.scale.set(0.12 + R() * 0.12, 0.25 + R() * 0.3, 0.3 + R() * 0.5);
    m.rotation.set(R(), R(), R()); m.castShadow = true; m.userData.k = R(); tufts.add(m);
  }

  // ---------------------------------------------------------------- fans: frame with corner holes, seven swept blades, hub, struts
  function bladeGeometry() {
    const g = new THREE.BufferGeometry(), NR = 10, NA = 8, pos = [], idx = [];
    for (let i = 0; i <= NR; i++) {
      const r = lerp(2.0, 5.55, i / NR), sweep = 0.38 * (r - 2) / 3.55, w = 0.62 + 0.1 * (r - 2);
      for (let j = 0; j <= NA; j++) { const u = j / NA, a = sweep + u * w, z = lerp(0.85, -0.85, u) * (0.9 + 0.1 * (r - 2) / 3.55); pos.push(Math.cos(a) * r, Math.sin(a) * r, z); }
    }
    for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const BLADE = bladeGeometry();
  const frameShape = new THREE.Shape(); { const s = 6, r = 0.9; frameShape.moveTo(-s + r, -s); frameShape.lineTo(s - r, -s); frameShape.quadraticCurveTo(s, -s, s, -s + r); frameShape.lineTo(s, s - r); frameShape.quadraticCurveTo(s, s, s - r, s); frameShape.lineTo(-s + r, s); frameShape.quadraticCurveTo(-s, s, -s, s - r); frameShape.lineTo(-s, -s + r); frameShape.quadraticCurveTo(-s, -s, -s + r, -s);
    const hole = new THREE.Path(); hole.absarc(0, 0, 5.75, 0, TAU, true); frameShape.holes.push(hole);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { const h = new THREE.Path(); h.absarc(a * 5.2, b * 5.2, 0.25, 0, TAU, true); frameShape.holes.push(h); }); }
  const FRAME = new THREE.ExtrudeGeometry(frameShape, { depth: 2.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1, curveSegments: 40 }); FRAME.translate(0, 0, -1.25);
  // a fan, built along its own z axis (air leaves towards -z)
  function makeFan(bladeMat, old) {
    const g = new THREE.Group();
    add(new THREE.Mesh(FRAME, M.fanFrame), g);
    const rot = new THREE.Group(); g.add(rot);
    const hub = cyl(bladeMat, 1.95, 1.95, 1.7, 32, rot); hub.rotation.x = Math.PI / 2;
    const st = add(new THREE.Mesh(new THREE.CircleGeometry(1.75, 32), M.sticker), rot); st.position.z = 0.86;
    for (let i = 0; i < 7; i++) { const b = add(new THREE.Mesh(BLADE, bladeMat), rot); b.rotation.z = i * TAU / 7; }
    if (old) for (let i = 0; i < 18; i++) {   // fluff caught on the leading edges
      const m = new THREE.Mesh(lumpG, M.dust), k = i % 7, r = 2.6 + R() * 2.8, a = k * TAU / 7 + 0.38 * (r - 2) / 3.55 + 0.02;
      m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.8); m.scale.set(0.11, 0.11, 0.16); m.userData.dust = true; rot.add(m);
    }
    const blur = new THREE.Mesh(new THREE.RingGeometry(2.0, 5.6, 48), M.blur.clone()); blur.position.z = 0.0; rot.add(blur);
    // motor housing and four struts on the outlet side
    const motor = cyl(M.fanFrame, 1.9, 1.9, 0.5, 28, g); motor.rotation.x = Math.PI / 2; motor.position.z = -1.05;
    for (let k = 0; k < 4; k++) { const s = box(M.fanFrame, 1.8, 5.9, -0.18, 0.18, -1.2, -0.9, g); s.parent.remove(s); const piv = new THREE.Group(); piv.add(s); piv.rotation.z = Math.PI / 4 + k * Math.PI / 2; g.add(piv); }
    g.userData = { rot, blur };
    return g;
  }
  // rear exhaust fan (old, worn bearing) and its replacement; both blow towards -x
  const REAR = new THREE.Vector3(-20.5, 38.5, -2);
  const rearOld = makeFan(M.fanOld, true), rearNew = makeFan(M.fanNew, false);
  [rearOld, rearNew].forEach((f) => { f.rotation.y = Math.PI / 2; f.position.copy(REAR); scene.add(f); });  // local -z → world -x
  const rearScrews = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => { const g = new THREE.Group(); scene.add(g); const h = cyl(M.screw, 0.42, 0.42, 0.25, 6, g); h.rotation.z = Math.PI / 2; const sh = cyl(M.screw, 0.16, 0.16, 0.9, 8, g); sh.rotation.z = Math.PI / 2; sh.position.x = 0.55; g.userData.at = new THREE.Vector3(X0 - 0.25, REAR.y + b * 5.2, REAR.z + a * 5.2); return g; });
  // front intake fans (blow towards -x)
  const fronts = [22.5, 35.5].map((y) => { const f = makeFan(M.fanNew, false); f.rotation.y = Math.PI / 2; f.position.set(X1 - 1.6, y, 0); scene.add(f); return f; });
  // the cooler's fan, on the intake face of the fins, with its two wire clips
  const cfan = makeFan(M.fanOld, true); cfan.rotation.y = Math.PI / 2;
  const CFAN = new THREE.Vector3(FX1 + 1.35, CY, (FZ0 + FZ1) / 2);
  cfan.position.copy(CFAN); scene.add(cfan);
  [6.04, -6.04].forEach((y) => { box(M.steel, -5.4, 5.4, y - 0.05, y + 0.05, -1.45, -1.35, cfan); [-5.4, 5.4].forEach((x) => box(M.steel, x - 0.05, x + 0.05, y - 0.05, y + 0.05, -2.2, -1.35, cfan)); });   // wire clips

  // ---------------------------------------------------------------- graphics card, cables
  const gpu = new THREE.Group(); scene.add(gpu);
  const GX0 = -21.3, GX1 = 7.2, GY = 27.0, GZ1 = 2.4;
  box(M.gpu, GX0 + 0.3, GX1, GY - 4.5, GY - 0.1, BZ + 0.3, GZ1, gpu);          // shroud and heatsink
  box(M.gpuBack, GX0 + 0.3, GX1, GY - 0.1, GY + 0.25, BZ + 0.3, GZ1, gpu);    // backplate (dust settles here)
  for (let i = 0; i < 26; i++) box(M.gpuFin, GX0 + 1.4 + i * 1.05, GX0 + 1.48 + i * 1.05, GY - 4.3, GY - 0.6, GZ1 - 0.02, GZ1 + 0.02, gpu);   // fin edges seen through the side
  box(M.steel, GX0 - 0.3, GX0 + 0.3, GY - 4.6, GY + 0.4, BZ - 0.1, -8.6, gpu); // bracket
  box(M.slot, -12, 1, GY + 0.25, GY + 0.9, BZ, BZ + 0.6, gpu);                  // the x16 slot
  const gpuPwr = box(M.plastic, -3.2, 0.4, GY - 1.6, GY - 0.2, GZ1, GZ1 + 0.8, gpu);
  // sleeved cables: 24-pin to the board's front edge, 8-pin CPU over the top, PCIe to the card
  const bundle = (pts, n, r, spread) => {
    const c = new THREE.CatmullRomCurve3(pts.map((a) => new THREE.Vector3(...a)));
    for (let i = 0; i < n; i++) { const off = (i - (n - 1) / 2) * spread; const cc = new THREE.CatmullRomCurve3(c.points.map((q) => q.clone().add(new THREE.Vector3(0, 0, off)))); add(new THREE.Mesh(new THREE.TubeGeometry(cc, 60, r, 8, false), M.cable)); }
  };
  bundle([[3.0, 33, BZ + 1.0], [5.5, 33.4, BZ + 2.2], [8.5, 33, BZ + 0.6], [10, 33, Z0 + 0.4]], 6, 0.2, 0.42);
  bundle([[-19.5, 46.0, BZ + 1.0], [-19.8, 46.9, BZ + 0.6], [-19.6, 47.0, Z0 + 1.2], [-19.4, 46.7, Z0 + 0.3]], 4, 0.18, 0.38);
  bundle([[-1.5, GY - 0.9, GZ1 + 0.7], [-1.0, GY - 2.8, GZ1 + 2.2], [-3.5, 16, 3.5], [-4.5, 10.8, 0]], 4, 0.18, 0.38);
  bundle([[REAR.x + 0.5, REAR.y + 5.6, REAR.z + 4.5], [-19.5, 45.2, REAR.z + 2.0], [-17.2, 46.0, BZ + 1.0]], 1, 0.08, 0);

  // ---------------------------------------------------------------- the box the new fan comes in, the air can, swab, syringe
  const pack = new THREE.Group(); scene.add(pack);
  box(M.boxSide, -7, 7, 0, 0.3, -7, 7, pack);
  [[-7, -6.7, -7, 7], [6.7, 7, -7, 7]].forEach(([a, b, c, d]) => box(M.boxSide, a, b, 0, 3.4, c, d, pack));
  [[-7, 7, -7, -6.7], [-7, 7, 6.7, 7]].forEach(([a, b, c, d]) => box(M.boxSide, a, b, 0, 3.4, c, d, pack));
  const lid = add(new THREE.Mesh(new THREE.PlaneGeometry(14, 14), M.box), pack); lid.rotation.x = -Math.PI / 2; lid.position.set(-16, 0.02, 0);   // the lid, laid beside it
  const can = new THREE.Group(); scene.add(can);
  { const body = cyl(M.can, 3.2, 3.2, 17, 32, can); body.position.set(-33, 26.5, 0); const lab = cyl(M.canLabel, 3.24, 3.24, 9, 32, can); lab.position.set(-33, 25, 0);
    const vlv = cyl(M.plastic, 1.3, 1.7, 2.4, 20, can); vlv.position.set(-33, 36.2, 0);
    const a0 = new THREE.Vector3(-32, 37.2, 0), a1 = new THREE.Vector3(-15.6, 38.6, 0), mid = a0.clone().add(a1).multiplyScalar(0.5);
    const st = cyl(M.straw, 0.13, 0.13, a0.distanceTo(a1), 8, can); st.position.copy(mid); st.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a1.clone().sub(a0).normalize()); }
  const swab = new THREE.Group(); scene.add(swab);
  const stick = cyl(M.stick, 0.09, 0.09, 9, 10, swab); stick.position.z = 4.5; stick.rotation.x = Math.PI / 2;
  const tip = add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), M.swab), swab); tip.scale.set(1, 1, 1.7);
  const syr = new THREE.Group(); scene.add(syr);
  const barrel = cyl(M.syringe, 0.55, 0.55, 6.5, 24, syr); barrel.rotation.x = Math.PI / 2; barrel.position.z = 4.6;
  const nozzle = cyl(M.syringe, 0.1, 0.28, 1.0, 16, syr); nozzle.rotation.x = Math.PI / 2; nozzle.position.z = 0.9;
  const plunger = cyl(M.pasteNew, 0.48, 0.48, 3.8, 16, syr); plunger.rotation.x = Math.PI / 2; plunger.position.z = 4.4;

  // ---------------------------------------------------------------- air: particles carried along the case's real paths
  const PATHS = {
    cpu: new THREE.CatmullRomCurve3([[30, 35.5, 0], [20, 35.6, 0], [10, 37, 0.3], [-4, 38, 0.3], [FX1, 38, 0.3], [FX0, 38.2, 0.3], [-19, 38.5, -1], [-24, 38.5, -1.5], [-34, 38.8, -1.5]].map((a) => new THREE.Vector3(...a))),
    gpu: new THREE.CatmullRomCurve3([[30, 22.5, 0], [20, 22.5, 0], [6, 20.5, 2], [-8, 20.5, 2], [-15, 28.5, 1], [-18.5, 36, -1], [-24, 37.5, -1.5], [-34, 37.5, -1.5]].map((a) => new THREE.Vector3(...a))),
    loop: new THREE.CatmullRomCurve3([[FX1 + 2, 39, 0.3], [FX1 + 2.5, 44.5, 1], [0, 46.2, 3], [12, 45.5, 3], [18, 40, 1], [10, 37.6, 0.3], [FX1 + 2, 38.5, 0.3]].map((a) => new THREE.Vector3(...a)), true),
  };
  const N = 300, TRAIL = 3, parts = [];
  for (let i = 0; i < N; i++) parts.push({ t: R(), path: R(), ox: (R() - 0.5), oy: (R() - 0.5) * 9, oz: (R() - 0.5) * 9, s: 0.8 + R() * 0.4 });
  const aPos = new Float32Array(N * TRAIL * 3), aCol = new Float32Array(N * TRAIL * 3), aA = new Float32Array(N * TRAIL), aS = new Float32Array(N * TRAIL);
  const airG = new THREE.BufferGeometry();
  airG.setAttribute('position', new THREE.BufferAttribute(aPos, 3)); airG.setAttribute('color', new THREE.BufferAttribute(aCol, 3));
  airG.setAttribute('alpha', new THREE.BufferAttribute(aA, 1)); airG.setAttribute('size', new THREE.BufferAttribute(aS, 1));
  const airM = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 300 } },
    vertexShader: 'attribute float alpha; attribute float size; attribute vec3 color; varying float vA; varying vec3 vC; uniform float uScale; void main(){ vA = alpha; vC = color; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * uScale / -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying float vA; varying vec3 vC; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(vC, a * vA); }',
  });
  const air = new THREE.Points(airG, airM); air.frustumCulled = false; scene.add(air);
  const cCool = new THREE.Color(0x9fdcff), cWarm = new THREE.Color(0xffa565), cTmp = new THREE.Color(), pv = new THREE.Vector3();
  // dust blown out of the fins by the can: fine grey motes and a few clumps, falling as they slow
  const DN = 160, dPos = new Float32Array(DN * 3), dA = new Float32Array(DN), dS = new Float32Array(DN), dCol = new Float32Array(DN * 3), motes = [];
  for (let i = 0; i < DN; i++) motes.push({ y: FY0 + R() * (FY1 - FY0), z: FZ0 + R() * (FZ1 - FZ0), v: 6 + R() * 10, vy: (R() - 0.3) * 3, vz: (R() - 0.5) * 5, t0: R(), s: 0.12 + R() * 0.3 });
  const dG = new THREE.BufferGeometry(); dG.setAttribute('position', new THREE.BufferAttribute(dPos, 3)); dG.setAttribute('alpha', new THREE.BufferAttribute(dA, 1)); dG.setAttribute('size', new THREE.BufferAttribute(dS, 1)); dG.setAttribute('color', new THREE.BufferAttribute(dCol, 3));
  for (let i = 0; i < DN; i++) { dCol[i * 3] = 0.62; dCol[i * 3 + 1] = 0.6; dCol[i * 3 + 2] = 0.56; }
  const dM = airM.clone(); dM.blending = THREE.NormalBlending; dM.uniforms = { uScale: airM.uniforms.uScale };
  const dustPts = new THREE.Points(dG, dM); dustPts.frustumCulled = false; scene.add(dustPts);

  // ---------------------------------------------------------------- labels projected into the page
  const anchors = {
    in: [scene, [X1 + 2, 30, 4]], out: [scene, [X0 - 3, 40, -2]], felt: [cooler, [FX1 + 0.6, FY0 - 0.2, 3]], rear: [scene, [REAR.x + 1, REAR.y + 6.2, REAR.z + 3]],
    box: [pack, [0, 4, 5]], screws: [scene, [X0 - 0.4, REAR.y + 6, REAR.z + 5.2]], blow: [cooler, [FX1 + 2, FY1 + 1.2, 4]], oldpaste: [scene, [CX + 1.2, CY + 1.4, IHS_Z + 0.2]],
    newpaste: [scene, [CX + 1.4, CY + 1.0, IHS_Z + 0.3]], flow: [scene, [-4, 46, 6]],
  };
  const labels = LABELS.map(([id, he, en]) => {
    const el = document.createElement('span'); el.className = 'l3d l3d-' + id;
    el.innerHTML = `<span lang="he">${he}</span><span lang="en">${en}</span>`; labelsHost.appendChild(el);
    return { id, el, obj: anchors[id][0], v: new THREE.Vector3(...anchors[id][1]) };
  });

  const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[1])), false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[2])), false, 'centripetal');
  const kp = KEYS.map((k) => k[0]);
  function camAt(p) {
    let i = 0; while (i < kp.length - 2 && p > kp[i + 1]) i++;
    const u = (i + smooth(span(p, kp[i], kp[i + 1]))) / (kp.length - 1);
    return [posCurve.getPoint(u), tgtCurve.getPoint(u)];
  }

  let P = 0, inView = false, raf = 0, last = 0, w = 0, h = 0, paused = false, moved = 0, tm = 0;
  const ang = { rear: 0, rearNew: 0, cfan: 0, front: 0 }, rpmNow = { rear: 0, cpu: 0, front: 0 };
  const calmOpt = (opts && opts.calm) || (() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const calm = () => !!window.__calm3d || calmOpt();
  function resize() {
    const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const ref = 16 / 10, base = 34 * Math.PI / 180;     // keep the same horizontal field on tall screens
    camera.fov = camera.aspect >= ref ? 34 : Math.min(64, 2 * Math.atan(Math.tan(base / 2) * ref / camera.aspect) * 180 / Math.PI);
    camera.updateProjectionMatrix();
    airM.uniforms.uScale.value = h / (2 * Math.tan(camera.fov * Math.PI / 360));
    kick();
  }
  new ResizeObserver(resize).observe(host);

  const v = new THREE.Vector3();
  const readAt = (p) => (window.__jobRead ? window.__jobRead(p) : { on: false, rpmRear: 0, rpmCpu: 0, rpmFront: 0, temp: 40 });
  const SLOW = 0.045;                                    // fans are shown slowed down so the blades stay readable
  function spin(fan, a, rpm) { fan.userData.rot.rotation.z = a; const b = fan.userData.blur; b.material.opacity = clamp((rpm - 250) / 1800) * 0.5; }

  function frame(ts) {
    raf = 0; if (!inView) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
    const p = P, motion = !calm(); tm += motion ? dt : 0;
    const rd = readAt(p);

    // fan speeds chase their targets the way a real fan spins up and coasts down
    const k = motion ? 1 - Math.exp(-dt * 2.2) : 1;
    rpmNow.rear += (rd.rpmRear - rpmNow.rear) * k; rpmNow.cpu += (rd.rpmCpu - rpmNow.cpu) * k; rpmNow.front += (rd.rpmFront - rpmNow.front) * k;
    if (!motion) { rpmNow.rear = rd.rpmRear; rpmNow.cpu = rd.rpmCpu; rpmNow.front = rd.rpmFront; }
    const om = (rpm) => rpm / 60 * TAU * SLOW;
    if (motion) { ang.rear += dt * om(rpmNow.rear); ang.cfan += dt * om(rpmNow.cpu); ang.front += dt * om(rpmNow.front); }
    else { ang.rear = 0.4 + p * 9; ang.cfan = 0.2 + p * 7; ang.front = p * 5; }
    const oldOut = T.oldOut(p), newIn = T.newIn(p), oldHere = p < 0.5;
    spin(rearOld, oldHere ? ang.rear : 0, oldHere ? rpmNow.rear : 0);
    spin(rearNew, oldHere ? 0 : ang.rear, oldHere ? 0 : rpmNow.rear);
    // the worn bearing lets the rotor's axis precess once per turn, more when it labours
    const wob = oldHere && rpmNow.rear > 40 ? 0.045 + 0.02 * Math.sin(tm * 3.1) : 0;
    rearOld.userData.rot.rotation.x = Math.sin(ang.rear) * wob; rearOld.userData.rot.rotation.y = Math.cos(ang.rear) * wob;
    rearOld.userData.rot.position.z = Math.sin(ang.rear * 2) * wob * 2;
    spin(cfan, ang.cfan, rpmNow.cpu); fronts.forEach((f, i) => spin(f, ang.front + i, rpmNow.front));

    // side panel: thumbscrews out, slide back, lift away (and the reverse at the end)
    const th = T.thumbs(p), po = T.panelOff(p);
    thumbs.forEach((g) => { g.position.set(X0 - 0.6 - th * 1.6, g.userData.y, Z1 - 1.4); g.rotation.x = th * 10 * TAU; g.visible = po < 0.995 || th < 0.99; });
    const slide = smooth(clamp(po / 0.3)), away = smooth(clamp((po - 0.3) / 0.7));
    panel.position.set(-slide * 2.2 - away * 6, away * 4, away * 34); panel.rotation.y = away * 0.25; panel.visible = away < 0.99;
    inner.intensity = 520 * po; inner2.intensity = 260 * po;
    M.led.color.setHex(rd.on ? 0xdff3ff : 0x2a2f35);

    // the new fan arrives in its box beside the tower; later it rises out of it and into the rear mount
    const bx = T.box(p);
    pack.position.set(lerp(70, 34, bx), 0, 6); pack.visible = bx > 0.001;
    const sc = T.rearScrews(p);
    rearScrews.forEach((s, i) => { s.position.copy(s.userData.at); s.position.x -= sc * 2.4; s.rotation.x = sc * 6 * TAU + i; s.visible = !(p > 0.492 && p < 0.603); });
    rearOld.visible = oldOut < 0.999;
    rearOld.position.set(REAR.x + oldOut * 4, REAR.y + oldOut * 2, REAR.z + oldOut * 26);
    rearNew.visible = p > 0.385;
    const inBox = new THREE.Vector3(pack.position.x, 1.8, 6);
    if (p < 0.59) { rearNew.position.copy(inBox); rearNew.rotation.set(-Math.PI / 2, 0, 0); }
    else { const u = newIn; const mid = new THREE.Vector3(REAR.x + 6, REAR.y + 8, REAR.z + 28);
      rearNew.position.copy(u < 0.55 ? inBox.clone().lerp(mid, smooth(u / 0.55)) : mid.clone().lerp(REAR, smooth((u - 0.55) / 0.45)));
      const r = smooth(clamp(u / 0.6)); rearNew.rotation.set(-Math.PI / 2 * (1 - r), Math.PI / 2 * r, 0); }

    // the cooler's fan unclipped and set aside, so the fins' intake face shows
    const cf = T.cfanOff(p);
    const cf2 = smooth(clamp((cf - 0.3) / 0.7));
    cfan.position.set(CFAN.x + smooth(clamp(cf / 0.4)) * 3 + cf2 * 40, CFAN.y + cf2 * 4, CFAN.z + cf2 * 20); cfan.visible = cf2 < 0.98;

    // compressed air: the straw goes into the gap behind the fins, bursts push the felt off the intake face
    const fl = T.felt(p), cl = T.clean(p);
    M.felt.userData.u.uClear.value = fl; felt.visible = fl < 0.995;
    tufts.children.forEach((m) => { m.visible = m.userData.k > fl * 1.1 && fl < 0.98; });
    DUST.uClean.value = cl * 1.15; DUST.uDust.value = 1;
    cfan.traverse((o) => { if (o.userData.dust) o.visible = cl < 0.5; });
    can.visible = T.air(p) > 0;
    const burst = motion ? 0.5 + 0.5 * Math.sin(tm * 9) : 1;
    can.position.set(-8 * (1 - sw(p, 0.53, 0.538)) - 8 * sw(p, 0.572, 0.578), 0, 0);
    const motesOn = p > 0.536 && p < 0.58;
    dustPts.visible = motesOn;
    if (motesOn) for (let i = 0; i < DN; i++) {
      const m = motes[i], age = ((motion ? tm * 0.9 : 0.6) + m.t0 + (p - 0.536) * 40) % 1, tt = age * 1.2;
      const x = FX1 + 0.2 + m.v * tt - 2 * tt * tt, y = m.y + m.vy * tt - 9 * tt * tt, z = m.z + m.vz * tt;
      dPos[i * 3] = x; dPos[i * 3 + 1] = Math.max(Y0 + 0.5, y); dPos[i * 3 + 2] = z;
      dA[i] = (1 - age) * 0.85 * clamp((0.58 - p) / 0.008) * clamp((p - 0.536) / 0.004) * (0.6 + 0.4 * burst); dS[i] = m.s;
    }
    dG.attributes.position.needsUpdate = true; dG.attributes.alpha.needsUpdate = true; dG.attributes.size.needsUpdate = true;

    // cooler: two screws out, lifted straight off the CPU, then back down onto a pea of fresh paste
    const cs = T.cScrews(p), co = T.coolerOut(p);
    cScrews.forEach((g, i) => { g.position.z = g.userData.z + cs * 1.4; g.rotation.z = cs * 6 * TAU + i; });
    // straight off the CPU first (2 cm), then up and out through the open side
    const off = clamp(co / 0.25) * 2, outZ = smooth(clamp((co - 0.25) / 0.35)), outX = smooth(clamp((co - 0.6) / 0.4));
    cooler.position.set(outX * 38, outX * 6, off + outZ * 18);
    // wipe: the swab sweeps across in rows and the flakes it passes are gone
    const wp = T.wipe(p);
    swab.visible = p > 0.65 && p < 0.668;
    const row = Math.min(3, Math.floor(wp * 4)), along = (wp * 4) % 1, dir = row % 2 ? -1 : 1;
    swab.position.set(CX + dir * lerp(-1.8, 1.8, along), CY - 1.4 + row * 0.95, IHS_Z + 0.4); swab.rotation.set(-0.5, 0.35 * dir, 0);
    flakes.forEach((f, i) => { f.visible = p < 0.652 || (p < 0.668 && wp < (i + 1) / (flakes.length + 1) * 0.98); });
    // the pea is squeezed only by the base coming down: its height is the gap, its volume stays the same
    const pe = T.pea(p), gap = p > 0.66 ? cooler.position.z : 9, top = Math.max(0.05, Math.min(0.35, gap)), rr = Math.sqrt(0.35 / top);
    pea.visible = pe > 0.02;
    pea.scale.set(pe * rr, pe * rr, pe * (top / 0.5) + 0.01); pea.position.z = IHS_Z;
    syr.visible = p > 0.664 && p < 0.684;
    syr.position.set(CX, CY, IHS_Z + 0.6 + (1 - span(p, 0.664, 0.669)) * 4 + span(p, 0.68, 0.684) * 6); plunger.position.z = 4.4 - pe * 0.8;

    // the processor's colour hints at heat: the base of the cooler, not the chip, is what you see; the air shows it
    const run = rd.on;
    air.visible = run && (po > 0.6 || p < 0.105) && rpmNow.front > 60;
    if (air.visible) {
      const before = p < 0.5, flowFins = before ? 0.25 : 1, exit = clamp(rpmNow.rear / 1150), fr = clamp(rpmNow.front / 900);
      for (let i = 0; i < N; i++) {
        const q = parts[i];
        const loopIt = before && q.path < 0.45, path = loopIt ? PATHS.loop : q.path < 0.72 ? PATHS.cpu : PATHS.gpu;
        let sp = 0.07 * fr * q.s;
        if (path === PATHS.cpu) { const at = q.t; if (at > 0.4 && at < 0.62) sp *= flowFins; if (at > 0.62) sp *= 0.25 + 0.75 * exit; }
        if (path === PATHS.gpu && q.t > 0.6) sp *= 0.35 + 0.65 * exit;
        if (motion) q.t += dt * sp * (loopIt ? 0.6 : 1);
        else q.t = (q.t0 === undefined ? (q.t0 = q.t) : q.t0);
        if (q.t > 1) { q.t -= 1; q.oz = (R() - 0.5) * 9; q.oy = (R() - 0.5) * 9; }
        for (let k2 = 0; k2 < TRAIL; k2++) {
          const tt = ((q.t - k2 * 0.008) % 1 + 1) % 1;
          path.getPoint(tt, pv);
          const squeeze = path === PATHS.cpu && tt > 0.38 && tt < 0.66 ? 0.55 : 1;
          pv.y += q.oy * 0.55 * squeeze; pv.z += q.oz * 0.8 * squeeze;
          const o = (i * TRAIL + k2) * 3;
          aPos[o] = pv.x; aPos[o + 1] = pv.y; aPos[o + 2] = pv.z;
          const warm = loopIt ? 0.85 : path === PATHS.cpu ? smooth(span(tt, 0.48, 0.66)) : smooth(span(tt, 0.45, 0.75)) * 0.6;
          cTmp.copy(cCool).lerp(cWarm, Math.min(1, warm + (before ? 0.25 : 0)));
          aCol[o] = cTmp.r; aCol[o + 1] = cTmp.g; aCol[o + 2] = cTmp.b;
          const fade = clamp(tt / 0.06) * clamp((1 - tt) / 0.08);
          aA[i * TRAIL + k2] = (loopIt ? 0.34 : before ? 0.5 : 0.7) * fade * (1 - k2 * 0.3);
          aS[i * TRAIL + k2] = (before ? 0.26 : 0.34) - k2 * 0.06;
        }
      }
      airG.attributes.position.needsUpdate = true; airG.attributes.color.needsUpdate = true; airG.attributes.alpha.needsUpdate = true; airG.attributes.size.needsUpdate = true;
    }

    const [cp, ct] = camAt(p);
    camera.position.copy(cp); camera.lookAt(ct);
    scene.updateMatrixWorld();

    const show = {
      in: p > 0.14 && p < 0.2 || p > 0.79 && p < 0.86, out: p > 0.14 && p < 0.2 || p > 0.79 && p < 0.86, felt: p > 0.19 && p < 0.255, rear: p > 0.28 && p < 0.345, box: p > 0.405 && p < 0.47,
      screws: p > 0.465 && p < 0.495, blow: p > 0.54 && p < 0.575, oldpaste: p > 0.645 && p < 0.66, newpaste: p > 0.688 && p < 0.703, flow: p > 0.86 && p < 0.9,
    };
    labels.forEach((l) => {
      v.copy(l.v); l.obj.localToWorld(v); v.project(camera);
      const vis = show[l.id] && v.z < 1 && Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.9;
      l.el.style.opacity = vis ? 1 : 0;
      const lx = Math.max(8, Math.min((v.x + 1) / 2 * w, w - (l.el.offsetWidth || 0) - 8));
      l.el.style.transform = `translate(${lx.toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
    });
    renderer.render(scene, camera);
    const idle = (performance.now() - moved) / 1000;
    const spinning = rpmNow.rear > 30 || rpmNow.cpu > 30 || Math.abs(rpmNow.cpu - rd.rpmCpu) > 5 || Math.abs(rpmNow.rear - rd.rpmRear) > 5;
    const live = motion && (spinning || motesOn) && idle < 5;
    if (inView && live && !paused) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && inView && !paused) raf = requestAnimationFrame(frame); }
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; last = 0; kick(); }).observe(host);
  resize();
  return {
    set(p) { if (p !== P) moved = performance.now(); P = p; kick(); },
    redraw: kick,
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; canvas.style.visibility = 'hidden'; labelsHost.style.visibility = 'hidden'; },
    resume() { paused = false; canvas.style.visibility = ''; labelsHost.style.visibility = ''; last = 0; kick(); },
  };
}
