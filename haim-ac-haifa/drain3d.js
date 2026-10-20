// A wall-mounted split unit in a living room whose condensate drain is blocked. The page's scroll position
// (0..1) drives everything; the camera follows the water.
// Story: the drain pan overflows, water runs along the louvre to its lowest corner, drops form, stretch, fall
// and splash into a growing puddle, a wet streak creeps down the wall → the unit is switched off, the front
// panel lifts, the right end is cut away: a pan full to the brim, a plug of slime and dust in its outlet →
// a flushing lance clears it, the pan drains, water and debris run down the drain hose, through the wall and
// out over the balcony drain → the drip slows and stops, the wall and the floor dry from their edges →
// the unit runs again, the louvre opens, cold air, the room cools to 24°. Textures: Poly Haven (CC0).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const G = 9.81;

// ---------------------------------------------------------------- the shared timeline (the page reads it too)
export const STAGES = [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1];
export const T = {
  on: (p) => p < 0.2 || p > 0.845,
  // drops per second from the louvre corner: the pan overflows until the flush empties it, then the wet louvre drains off
  rate: (p) => (p < 0.1 ? lerp(0.85, 1.4, smooth(span(p, 0, 0.1))) : p < 0.2 ? 1.4 : p < 0.545 ? lerp(1.4, 0.9, smooth(span(p, 0.2, 0.3)))
    : p < 0.72 ? 0.9 * Math.pow(1 - span(p, 0.545, 0.72), 1.7) : 0),
  // water on the floor in millilitres: already a puddle when we arrive, it grows, then it's wiped and dries
  floor: (p) => (p < 0.6 ? lerp(110, 360, smooth(span(p, 0, 0.6))) : p < 0.69 ? 360 : 360 * (1 - smooth(span(p, 0.69, 0.82)))),
  wall: (p) => (p < 0.69 ? lerp(0.45, 1, smooth(span(p, 0, 0.3))) : 1 - smooth(span(p, 0.69, 0.83))),
  room: (p) => (p < 0.2 ? 26 : p < 0.845 ? lerp(26, 28.5, span(p, 0.2, 0.8)) : lerp(28.5, 24, smooth(span(p, 0.86, 0.98)))),
  pan: (p) => (p < 0.53 ? 1 : p < 0.83 ? lerp(1, 0.06, smooth(span(p, 0.53, 0.6))) : lerp(0.06, 0.16, span(p, 0.88, 0.96))),
  panel: (p) => (p < 0.5 ? smooth(span(p, 0.22, 0.28)) : 1 - smooth(span(p, 0.74, 0.79))),
  cut: (p) => (p < 0.5 ? smooth(span(p, 0.26, 0.33)) : 1 - smooth(span(p, 0.72, 0.78))),
  lance: (p) => (p < 0.5 ? smooth(span(p, 0.43, 0.5)) : 1 - smooth(span(p, 0.61, 0.66))),
  jet: (p) => (p > 0.515 && p < 0.6 ? 1 : 0),
  plug: (p) => 1 - smooth(span(p, 0.515, 0.565)),
  // flow in the drain hose: nothing while blocked, a rush when the plug goes, slowing as the pan empties; a trickle of condensate later
  flow: (p) => (p < 0.52 ? 0 : p < 0.56 ? smooth(span(p, 0.52, 0.545)) : p < 0.7 ? Math.pow(1 - span(p, 0.56, 0.7), 1.5) : p > 0.88 ? 0.1 * span(p, 0.88, 0.94) : 0),
  front: (p) => span(p, 0.522, 0.6),
  louvre: (p) => (p < 0.5 ? 1 - smooth(span(p, 0.2, 0.23)) : smooth(span(p, 0.85, 0.89))),
  air: (p) => smooth(span(p, 0.87, 0.92)),
  sec: (p) => (p < 0.58 ? smooth(span(p, 0.515, 0.535)) : 1 - smooth(span(p, 0.595, 0.61))),
};

// camera keyframes [p, position, target]
const XC0 = 0.64;
const KEYS = [
  [0.0, [-0.95, 1.62, 2.55], [-0.15, 1.72, 0]],
  [0.075, [0.62, 1.84, 0.78], [0.1, 1.93, 0.1]],
  [0.15, [0.78, 0.82, 1.3], [0.12, 0.22, 0.1]],
  [0.24, [-0.08, 2.05, 1.45], [-0.18, 2.12, 0.08]],
  [0.33, [0.62, 2.42, 0.62], [0.05, 2.1, 0.06]],
  [0.42, [0.34, 2.38, 0.4], [0.15, 2.105, 0.09]],
  [0.5, [0.36, 2.4, 0.42], [0.15, 2.105, 0.09]],
  [0.565, [2.3, 1.86, -0.08], [XC0, 1.86, -0.08]],
  [0.63, [1.35, 1.0, -1.75], [0.47, 0.55, -0.3]],
  [0.71, [0.75, 1.5, 1.5], [0.06, 1.45, 0.1]],
  [0.8, [0.6, 1.05, 1.35], [0.1, 0.3, 0.05]],
  [0.9, [-0.6, 1.6, 1.8], [-0.2, 1.84, 0.25]],
  [1.0, [-0.95, 1.62, 2.55], [-0.15, 1.72, 0]],
];

const GLSL_NOISE = `
float lh(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(lh(i), lh(i + vec3(1,0,0)), f.x), mix(lh(i + vec3(0,1,0)), lh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(lh(i + vec3(0,0,1)), lh(i + vec3(1,0,1)), f.x), mix(lh(i + vec3(0,1,1)), lh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
`;

// a standard material whose "wet" field darkens it and makes it glossy; drying shrinks the field from its
// edges and leaves a faint tide mark where the edge was the longest
function wetMaterial(mat, kind) {
  mat.userData.u = { uR: { value: 0 }, uMax: { value: 0 }, uC: { value: new THREE.Vector3() }, uTop: { value: 0 }, uFront: { value: 0 } };
  mat.customProgramCacheKey = () => 'wet-' + kind;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, mat.userData.u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    const field = kind === 'floor'
      // a puddle: an irregular round field around the drip point, its edge wobbling like a real spill
      ? `vec2 q = vW.xz - uC.xz; float nb = (fbm(vW * 6.0) - 0.5) * 0.9 + (fbm(vW * 26.0) - 0.5) * 0.08;
         float d0 = length(q * vec2(0.9, 1.15));
         float d = d0 + nb * uR * 0.6;
         float wet = (1.0 - smoothstep(uR - 0.02, uR + 0.004, d)) * step(0.001, uR) * (0.45 + 0.55 * uTop);
         float dm = d0 + nb * uMax * 0.6;
         float ring = exp(-pow((dm - uMax) / 0.012, 2.0)) * step(0.02, uMax) * (1.0 - smoothstep(0.0, 0.3, wet));
         float rim = exp(-pow((d - uR) / 0.005, 2.0)) * step(0.01, uR);`
      // a streak: water leaving the back of the unit runs straight down by gravity and fans out a little as it goes
      : `float dy = uTop - vW.y;
         float hw = 0.018 + dy * 0.05 + (fbm(vW * vec3(16.0, 4.0, 16.0)) - 0.5) * 0.04;
         float dx = abs(vW.x - uC.x - 0.025 * sin(vW.y * 7.0) - 0.01 * sin(vW.y * 23.0));
         // the lower edge breaks into fingers where single runs got further than the rest
         float frontN = uFront + (fbm(vec3(vW.x * 38.0, 0.5, 0.2)) - 0.5) * 0.22 + (fbm(vW * 9.0) - 0.5) * 0.06;
         float inStreak = (1.0 - smoothstep(hw * uR - 0.012, hw * uR + 0.01, dx)) * step(0.0, dy) * smoothstep(frontN - 0.03, frontN + 0.03, vW.y);
         float wet = inStreak * step(0.001, uR) * (0.45 + 0.55 * smoothstep(frontN, frontN + 0.5, vW.y));
         float ring = exp(-pow((dx - hw * uMax) / 0.004, 2.0)) * step(0.0, dy) * step(uFront, vW.y) * step(0.02, uMax) * (1.0 - wet) * 0.8;`;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vW;\nuniform float uR; uniform float uMax; uniform vec3 uC; uniform float uTop; uniform float uFront;\n${GLSL_NOISE}`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n${field}\n` +
        (kind === 'floor'
          ? `diffuseColor.rgb *= mix(vec3(1.0), vec3(0.66, 0.68, 0.7), wet) * mix(vec3(1.0), vec3(0.6, 0.55, 0.47), ring); diffuseColor.rgb += rim * 0.06;`
          : `diffuseColor.rgb *= mix(vec3(1.0), vec3(0.8, 0.76, 0.69), wet) * mix(vec3(1.0), vec3(0.88, 0.83, 0.74), ring);`))
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, ${kind === 'floor' ? '0.04' : '0.4'}, wet);`);
  };
  return mat;
}

// the louvre's slow dripping: a fin texture for the evaporator, a noise roughness for the plastic
function canvasTex(w, h, draw, srgb) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function initDrain3D(host, labelsHost, opts) {
  opts = opts || {};
  const hero = !!opts.hero;
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: hero, preserveDrawingBuffer: !!opts.capture, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  const small = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(opts.dpr || Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = hero ? 1.0 : 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.background = hero ? null : new THREE.Color(opts.background != null ? opts.background : 0x10181d);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = hero ? 0.55 : 0.45;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 40);

  const loader = new THREE.TextureLoader();
  const tex = (name, rep, color) => {
    const t = loader.load(`tex/${name}.jpg`, () => kick());
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const pbr = (id, rep, extra) => new THREE.MeshStandardMaterial(Object.assign({
    map: tex(`${id}_diff`, rep, true), normalMap: tex(`${id}_nor`, rep), roughnessMap: tex(`${id}_rough`, rep), roughness: 1, metalness: 0,
  }, extra || {}));

  // a fine grain in the roughness of the unit's plastic, so its highlights break up like a real moulded part
  const grain = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, w, h);
    let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 9000; i++) { const v = 100 + r() * 60 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * w, r() * h, 1, 1); }
  });
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(4, 2);
  // aluminium fins with copper tubes running through them
  const finTex = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#9fa6aa'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 4) { g.fillStyle = x % 8 ? '#c4c9cc' : '#7d8589'; g.fillRect(x, 0, 2, h); }
    for (let y = 18; y < h; y += 44) { g.fillStyle = '#b0703f'; g.fillRect(0, y, w, 9); g.fillStyle = 'rgba(255,220,180,.5)'; g.fillRect(0, y + 1, w, 2); }
  }, true);
  finTex.wrapS = THREE.RepeatWrapping; finTex.repeat.set(3, 1);
  // slime streaks for the dirty pan
  const slimeTex = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = '#d6d8d2'; g.fillRect(0, 0, w, h);
    let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${70 + r() * 30 | 0},${80 + r() * 30 | 0},${55 + r() * 20 | 0},${0.15 + r() * 0.35})`; g.beginPath(); g.ellipse(w * (0.45 + r() * 0.55), r() * h, 2 + r() * 14, 1 + r() * 4, 0, 0, 7); g.fill(); }
  }, true);

  const M = {
    wall: wetMaterial(pbr('beige_wall_001', [3.2, 2.4], { color: 0x7f8b90 }), 'wall'),
    floor: wetMaterial(pbr('grey_cartago_01', [3, 3], { color: 0xd8d4cc }), 'floor'),
    facade: pbr('beige_wall_001', [5, 4], { color: 0xe2dccf }),
    balcony: pbr('grey_cartago_01', [2, 2], { color: 0xb9b2a6 }),
    cut: new THREE.MeshStandardMaterial({ color: 0x8f8679, roughness: 0.95 }),
    block: new THREE.MeshStandardMaterial({ color: 0x8a8378, roughness: 1 }),
    plastic: new THREE.MeshPhysicalMaterial({ color: 0xe9ebe8, roughness: 0.3, roughnessMap: grain, clearcoat: 0.55, clearcoatRoughness: 0.22, side: THREE.DoubleSide }),
    plasticIn: new THREE.MeshStandardMaterial({ color: 0xd3d5d1, roughness: 0.6, side: THREE.DoubleSide }),
    pan: new THREE.MeshStandardMaterial({ color: 0xc7cac2, roughness: 0.5, map: slimeTex }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1d2225, roughness: 0.55 }),
    blade: new THREE.MeshStandardMaterial({ color: 0x2b3135, roughness: 0.5 }),
    fins: new THREE.MeshStandardMaterial({ map: finTex, roughness: 0.38, metalness: 0.75 }),
    copper: new THREE.MeshPhysicalMaterial({ color: 0xc27a45, metalness: 1, roughness: 0.3, clearcoat: 0.2 }),
    insul: new THREE.MeshStandardMaterial({ color: 0x2a2d2f, roughness: 0.92 }),
    tape: new THREE.MeshStandardMaterial({ color: 0xe9e8e2, roughness: 0.75 }),
    hose: new THREE.MeshPhysicalMaterial({ color: 0xdfe7e9, roughness: 0.18, metalness: 0, transparent: true, opacity: 0.38, depthWrite: false, clearcoat: 0.6, side: THREE.DoubleSide }),
    slime: new THREE.MeshPhysicalMaterial({ color: 0x3f4430, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.12 }),
    // no transmission: it would cost a second render of the whole scene every frame on phones
    water: new THREE.MeshPhysicalMaterial({ color: 0xd9eef6, roughness: 0.02, transparent: true, opacity: 0.62, ior: 1.33, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.6, specularIntensity: 1 }),
    film: new THREE.MeshPhysicalMaterial({ color: 0xd5ecf3, roughness: 0.04, transparent: true, opacity: 0.55, clearcoat: 1, depthWrite: false }),
    panWater: new THREE.MeshStandardMaterial({ color: 0x6f7d68, roughness: 0.08, transparent: true, opacity: 0.8, depthWrite: false }),
    flowW: new THREE.MeshStandardMaterial({ color: 0x9cc6d6, roughness: 0.1, transparent: true, opacity: 0.85, depthWrite: false }),
    ripple: new THREE.MeshBasicMaterial({ color: 0xe8f4f8, transparent: true, opacity: 0.5, depthWrite: false }),
    brass: new THREE.MeshPhysicalMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.3 }),
    red: new THREE.MeshStandardMaterial({ color: 0xb8322a, roughness: 0.45 }),
    grate: new THREE.MeshStandardMaterial({ color: 0x8c9396, metalness: 0.8, roughness: 0.4 }),
    steel: new THREE.MeshPhysicalMaterial({ color: 0xb9bec1, metalness: 0.9, roughness: 0.35 }),
    casing: new THREE.MeshPhysicalMaterial({ color: 0xe2e3df, roughness: 0.42, metalness: 0.15, clearcoat: 0.25 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6b4b33, roughness: 0.6 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x3f4f55, roughness: 0.95 }),
  };
  M.wall.normalScale.set(1.8, 1.8); M.facade.normalScale.set(1.4, 1.4);
  // the display on the unit: two digits that read the set point while the unit runs
  const dispC = document.createElement('canvas'); dispC.width = 128; dispC.height = 64;
  const dispT = new THREE.CanvasTexture(dispC); dispT.colorSpace = THREE.SRGBColorSpace;
  const dispMat = new THREE.MeshStandardMaterial({ color: 0x0b0f12, roughness: 0.15, emissive: 0xffffff, emissiveMap: dispT, emissiveIntensity: 1.2 });
  let dispKey = '';
  function drawDisplay(txt) {
    if (txt === dispKey) return; dispKey = txt;
    const g = dispC.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 128, 64);
    if (txt) { g.fillStyle = '#9fe3ff'; g.font = '600 46px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 58, 34); g.font = '600 18px sans-serif'; g.fillText('°', 98, 18); }
    dispT.needsUpdate = true;
  }

  const add = (geo, mat, x, y, z, parent, noCast) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    m.castShadow = !noCast; m.receiveShadow = true; (parent || scene).add(m); return m;
  };
  const box = (mat, x0, x1, y0, y1, z0, z1, parent, noCast) => add(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, parent, noCast);

  // ---------------------------------------------------------------- the building. Room: z > 0, outside: z < -0.25.
  // While the camera follows the drain line through the wall, the whole building is cut on the plane x = XC
  // (a renderer clipping plane), and caps show the cut faces of the wall and the slabs.
  const XC = 0.64, X0 = -3.2, X1 = 2.8, WT = 0.25;
  const secPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 99);
  renderer.clippingPlanes = [secPlane];
  const caps = new THREE.Group(); caps.visible = false; scene.add(caps);
  if (hero) {   // the hero render is cut out of its room: only the unit's cast light-occlusion on the wall is kept (3D lighting, taste-skill-ignore)
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.ShadowMaterial({ opacity: 0.38 }));
    catcher.position.set(0, 1.6, 0.0); catcher.receiveShadow = true; scene.add(catcher);
  }
  if (!hero) {
    const floor = add(new THREE.PlaneGeometry(X1 - X0, 3.4), M.floor, (X0 + X1) / 2, 0, 1.7, null, true); floor.rotation.x = -Math.PI / 2;
    add(new THREE.PlaneGeometry(X1 - X0, 2.8), M.wall, (X0 + X1) / 2, 1.4, 0, null, true);
    const side = add(new THREE.PlaneGeometry(3.4, 2.8), M.wall, X0, 1.4, 1.7, null, true); side.rotation.y = Math.PI / 2;
    box(M.cut, X0, X1, -0.22, -0.003, -WT - 2, 3.4, null, true);      // the floor slab
    box(M.block, X0, X1, 0, 2.8, -WT, -0.001, null, true);            // the outer wall
    box(M.cut, X0, X1, 2.8, 3.02, -WT - 1.6, 3.4, null, true);        // ceiling slab and the balcony above
    add(new THREE.PlaneGeometry(X1 - X0, 3.02), M.facade, (X0 + X1) / 2, 1.4, -WT - 0.001, null, true).rotation.y = Math.PI;
    const balc = add(new THREE.PlaneGeometry(X1 - X0, 1.6), M.balcony, (X0 + X1) / 2, 0.002, -WT - 0.8, null, true); balc.rotation.x = -Math.PI / 2;
    box(M.cut, X0, X1, 0, 0.95, -WT - 1.62, -WT - 1.5);               // balcony parapet
    box(M.tape, X0, X1, 0, 0.08, 0.001, 0.012, null, true);           // skirting
    // the cut faces: wall (around the sleeve), floor slab, ceiling slab
    const cap = (z0, z1, y0, y1, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, y1 - y0), mat); m.rotation.y = Math.PI / 2; m.position.set(XC - 0.0004, (y0 + y1) / 2, (z0 + z1) / 2); caps.add(m); };
    cap(-WT, 0, 0, 2.02, M.block); cap(-WT, 0, 2.165, 2.8, M.block); cap(-WT - 2, 3.4, -0.22, -0.003, M.cut); cap(-WT - 1.6, 3.4, 2.8, 3.02, M.cut);
    // the balcony's floor drain, where the hose ends
    const grate = add(new THREE.CylinderGeometry(0.06, 0.06, 0.006, 28), M.grate, 0.42, 0.004, -0.62);
    for (let i = -2; i <= 2; i++) box(M.dark, 0.42 - 0.045, 0.42 + 0.045, 0.0075, 0.008, -0.62 + i * 0.02 - 0.004, -0.62 + i * 0.02 + 0.004, null, true);
    grate.receiveShadow = true;
    // a socket and a light switch on the wall
    box(M.tape, -0.98, -0.9, 1.0, 1.08, 0, 0.012); box(M.dark, -0.955, -0.925, 1.035, 1.045, 0.012, 0.014, null, true);
    box(M.tape, -1.5, -1.42, 0.3, 0.38, 0, 0.012); box(M.dark, -1.475, -1.445, 0.335, 0.345, 0.012, 0.014, null, true);
    // a sheer curtain at the balcony door on the left, hanging in soft folds
    const cg = new THREE.PlaneGeometry(1.2, 2.55, 90, 1); const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) { const x = cp.getX(i); cp.setZ(i, 0.035 * Math.sin(x * 26) + 0.012 * Math.sin(x * 71 + 1.3)); }
    cg.computeVertexNormals();
    const curtain = add(cg, new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }), -2.15, 1.32, 0.12);
    box(M.steel, -2.85, -1.45, 2.62, 2.635, 0.08, 0.095, null, true);   // curtain rod
    // the outdoor unit on its brackets, below and to the side, for context
    const OX0 = -0.9, OX1 = -0.05, OY0 = 1.0, OY1 = 1.6, OZ0 = -WT - 0.33, OZ1 = -WT - 0.04;
    box(M.steel, OX0 + 0.08, OX0 + 0.12, OY0 - 0.04, OY0, -WT - 0.46, -WT); box(M.steel, OX1 - 0.12, OX1 - 0.08, OY0 - 0.04, OY0, -WT - 0.46, -WT);
    box(M.casing, OX0, OX1, OY0, OY1, OZ0, OZ1);
    const gr = add(new THREE.CircleGeometry(0.2, 40), M.dark, OX0 + 0.32, (OY0 + OY1) / 2, OZ0 - 0.002, null, true); gr.rotation.y = Math.PI;
    for (const r of [0.07, 0.13, 0.19]) { const t = add(new THREE.TorusGeometry(r, 0.003, 6, 48), M.steel, OX0 + 0.32, (OY0 + OY1) / 2, OZ0 - 0.006, null, true); }
  }

  // ---------------------------------------------------------------- the indoor unit, local frame: x 0..W, y 0..H, z 0..D (back on the wall)
  const W = 0.9, H = 0.29, D = 0.215;
  const unit = new THREE.Group(); unit.position.set(-0.68, 2.07, 0.006); unit.rotation.z = -0.012; scene.add(unit); // falls 1 cm toward the drain end
  // profile in (z, y): flat back, a domed top, a gently bowed front, the outlet slot on the underside
  const prof = new THREE.Shape();
  prof.moveTo(0, 0.02); prof.lineTo(0, H - 0.01); prof.quadraticCurveTo(0, H, 0.015, H);
  // the body stops behind the front panel (which is its own part and lifts); it comes forward again under it, round the outlet
  prof.lineTo(0.15, H); prof.lineTo(0.15, 0.075); prof.lineTo(0.198, 0.062); prof.quadraticCurveTo(0.2, 0.03, 0.175, 0.03);
  prof.lineTo(0.165, 0.012); prof.lineTo(0.06, 0.0); prof.quadraticCurveTo(0.02, 0.0, 0.0, 0.02);
  const shellGeo = new THREE.ExtrudeGeometry(prof, { depth: W - 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 5, curveSegments: 24 });
  shellGeo.rotateY(-Math.PI / 2); shellGeo.translate(W - 0.01, 0, 0);  // shape x → z, extrusion → x 0..W
  // the right end is cut away during the inspection: everything of the shell to the right of this plane disappears
  const cutPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 99);
  M.plastic.clippingPlanes = [cutPlane];
  const shell = add(shellGeo, M.plastic, 0, 0, 0, unit);
  // the front panel lifts on hinges at the top (it is the part of the shell in front of z = 0.15)
  const panelPivot = new THREE.Group(); panelPivot.position.set(0, H - 0.005, 0.15); unit.add(panelPivot);
  const fp = new THREE.Shape();
  fp.moveTo(0, 0); fp.quadraticCurveTo(0.055, -0.006, 0.062, -0.06); fp.quadraticCurveTo(0.068, -0.15, 0.055, -0.225);
  fp.lineTo(0.05, -0.225); fp.quadraticCurveTo(0.062, -0.15, 0.056, -0.06); fp.quadraticCurveTo(0.05, -0.01, 0, -0.006);
  const fpGeo = new THREE.ExtrudeGeometry(fp, { depth: W - 0.04, bevelEnabled: false, curveSegments: 20 }); fpGeo.rotateY(-Math.PI / 2); fpGeo.translate(W - 0.02, 0, 0);
  const frontPanel = add(fpGeo, M.plastic, 0, 0, 0, panelPivot);
  // the display window and a thin seam line on the panel
  // a smoked window with the two digits, sitting proud of the panel's curve
  const dispFrame = add(new THREE.BoxGeometry(0.095, 0.042, 0.004), new THREE.MeshPhysicalMaterial({ color: 0x15191c, roughness: 0.12, clearcoat: 1 }), W - 0.17, -0.105, 0.0675, panelPivot, true);
  const disp = add(new THREE.PlaneGeometry(0.072, 0.03), dispMat, W - 0.17, -0.105, 0.0699, panelPivot, true);
  // the seam where the front panel meets the body, and the dark outlet slot the louvre covers
  const slot = box(M.dark.clone(), 0.02, W - 0.02, -0.0015, 0.0, 0.07, 0.162, unit, true); slot.material.clippingPlanes = [cutPlane];
  // inside: filter mesh, the evaporator coil (a bent fin pack), the cross-flow fan, the drain pan with its outlet
  const inner = new THREE.Group(); unit.add(inner);
  const LC = W - 0.15, CX = 0.035 + LC / 2;
  const finA = add(new THREE.BoxGeometry(LC, 0.15, 0.018), M.fins, CX, 0.165, 0.135, inner); finA.rotation.x = -0.42;
  const finB = add(new THREE.BoxGeometry(LC, 0.12, 0.018), M.fins, CX, 0.235, 0.075, inner); finB.rotation.x = 0.95;
  const fan = new THREE.Group(); fan.position.set(0, 0.058, 0.085); inner.add(fan);
  const bladeGeo = new THREE.BoxGeometry(W - 0.12, 0.014, 0.0025);
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; const b = add(bladeGeo, M.blade, W / 2, Math.sin(a) * 0.03, Math.cos(a) * 0.03, fan, true); b.rotation.x = a + 0.7; }
  // the coil's end plate and its copper return bends
  [[finA, 0.15], [finB, 0.12]].forEach(([leg, hgt]) => {
    for (let y = -hgt / 2 + 0.02; y < hgt / 2 - 0.012; y += 0.034) {
      const b = new THREE.Mesh(new THREE.TorusGeometry(0.0085, 0.003, 8, 14, Math.PI), M.copper);
      b.rotation.z = -Math.PI / 2; b.position.set(LC / 2 + 0.006, y + 0.0085, 0); leg.add(b);
    }
  });
  // the drain pan: a trough under the front leg of the coil, sloping to the outlet at the right end
  const PAN = { y0: 0.08, y1: 0.104, z0: 0.12, z1: 0.19 };
  box(M.pan, 0.03, W - 0.03, PAN.y0, PAN.y0 + 0.004, PAN.z0, PAN.z1, inner);
  box(M.pan, 0.03, W - 0.03, PAN.y0, PAN.y1, PAN.z1 - 0.004, PAN.z1, inner);           // front lip
  box(M.pan, 0.03, W - 0.03, PAN.y0, PAN.y1 + 0.012, PAN.z0, PAN.z0 + 0.004, inner);   // back wall
  const panWater = box(M.panWater, 0.034, W - 0.034, PAN.y0 + 0.004, PAN.y1, PAN.z0 + 0.004, PAN.z1 - 0.004, inner, true);
  // the outlet stub through the back of the pan to the hose
  const stub = add(new THREE.CylinderGeometry(0.009, 0.009, 0.14, 16), M.plasticIn, W - 0.062, PAN.y0 + 0.008, PAN.z0 - 0.05, inner); stub.rotation.x = Math.PI / 2;
  // the plug of slime and dust sitting in the outlet, and sludge in the pan corner
  const plugGeo = new THREE.IcosahedronGeometry(0.02, 4);
  { const pos = plugGeo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const n = 1 + 0.28 * Math.sin(v.x * 260) * Math.cos(v.y * 210) + 0.18 * Math.sin(v.z * 330 + v.x * 120); v.multiplyScalar(n); v.y *= 0.65; pos.setXYZ(i, v.x, v.y, v.z); } plugGeo.computeVertexNormals(); }
  const plug = add(plugGeo, M.slime, W - 0.062, PAN.y0 + 0.016, PAN.z0 + 0.018, inner);
  const sludge = []; for (let i = 0; i < 7; i++) { const s = add(plugGeo, M.slime, W - 0.07 - i * 0.03 - Math.random() * 0.01, PAN.y0 + 0.006, PAN.z0 + 0.02 + Math.random() * 0.04, inner, true); s.scale.set(0.5 + Math.random() * 0.5, 0.3, 0.6 + Math.random() * 0.4); sludge.push(s); }
  // louvre: a curved blade across the outlet, pivoting on its long axis
  const louvrePivot = new THREE.Group(); louvrePivot.position.set(0, 0.012, 0.165); unit.add(louvrePivot);
  const lv = new THREE.Shape(); lv.moveTo(0, 0); lv.quadraticCurveTo(-0.05, -0.012, -0.1, -0.004); lv.lineTo(-0.1, -0.0005); lv.quadraticCurveTo(-0.05, -0.0075, 0, 0.004);
  const lvGeo = new THREE.ExtrudeGeometry(lv, { depth: W - 0.07, bevelEnabled: false, curveSegments: 16 }); lvGeo.rotateY(-Math.PI / 2); lvGeo.translate(W - 0.035, 0, 0);
  const louvre = add(lvGeo, M.plastic, 0, 0, 0, louvrePivot);
  // mounting plate edge visible behind
  box(M.steel, 0.06, W - 0.06, 0.03, H - 0.03, -0.004, 0.0, unit, true);

  // ---------------------------------------------------------------- the drain line: from the outlet, back through the wall, down the facade
  const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const outletW = new THREE.Vector3(); unit.updateMatrixWorld(true);
  unit.localToWorld(outletW.set(W - 0.062, PAN.y0 + 0.008, PAN.z0 - 0.12));
  // it leaves the unit's back at the drain end, runs along the wall with a steady fall, through the sleeve, then down outside
  const HX = XC - 0.014;
  const hosePts = [outletW.clone(), v3(outletW.x + 0.08, 2.083, 0.026), v3(0.42, 2.073, 0.026), v3(HX - 0.02, 2.068, 0.022), v3(HX, 2.062, -0.03),
    v3(HX, 2.052, -0.13), v3(HX, 2.04, -WT + 0.01), v3(HX - 0.03, 1.99, -WT - 0.05), v3(0.5, 1.84, -WT - 0.045),
    v3(0.5, 0.6, -WT - 0.045), v3(0.49, 0.25, -WT - 0.05), v3(0.45, 0.13, -0.5), v3(0.42, 0.1, -0.6)];
  const hoseCurve = new THREE.CatmullRomCurve3(hosePts, false, 'centripetal', 0.3);
  const HOSE_SEG = 220;
  const hose = add(new THREE.TubeGeometry(hoseCurve, HOSE_SEG, 0.0095, 14, false), M.hose, 0, 0, 0, null, true);
  hose.renderOrder = 3;
  const flowGeo = new THREE.TubeGeometry(hoseCurve, HOSE_SEG, 0.0062, 10, false);
  const flowMat = M.flowW.clone();
  const stripes = canvasTex(256, 8, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  stripes.wrapS = THREE.RepeatWrapping; stripes.repeat.set(14, 1);
  flowMat.alphaMap = stripes;
  const flowTube = add(flowGeo, flowMat, 0, 0, 0, null, true); flowTube.renderOrder = 2;
  const HOSE_IDX = flowGeo.index.count;
  // the copper pair and its insulation run beside the hose through the same hole, then to the outdoor unit
  if (!hero) {
    // the refrigerant pair and the cable leave the unit's back as one bundle wrapped in white PVC tape
    const lineA = [v3(0.12, 2.2, 0.02), v3(0.3, 2.19, 0.034), v3(XC - 0.05, 2.17, 0.034), v3(XC - 0.03, 2.14, -0.04), v3(XC - 0.03, 2.135, -0.15), v3(XC - 0.035, 2.13, -WT - 0.03), v3(0.42, 1.98, -WT - 0.07), v3(0.05, 1.82, -WT - 0.08), v3(-0.12, 1.6, -WT - 0.12), v3(-0.2, 1.42, -WT - 0.15)];
    const bundle = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lineA, false, 'centripetal'), 160, 0.019, 14), M.tape, 0, 0, 0);
    const tapeTex = canvasTex(64, 16, (g, w, h) => { g.fillStyle = '#e9e8e2'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.5; for (let x = -16; x < w; x += 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 16, h); g.stroke(); } });
    tapeTex.wrapS = tapeTex.wrapT = THREE.RepeatWrapping; tapeTex.repeat.set(140, 1);
    bundle.material = new THREE.MeshStandardMaterial({ map: tapeTex, roughness: 0.55, color: 0xf2f1ec });
    // the sleeve through the wall, cut in half by the section
    const sleeve = add(new THREE.CylinderGeometry(0.072, 0.072, WT, 28, 1, true, Math.PI, Math.PI), M.plasticIn, XC, 2.0925, -WT / 2, null, true);
    sleeve.rotation.x = Math.PI / 2;
  }

  // ---------------------------------------------------------------- water: films, drops, splashes, the jet, the outside stream
  // drip point: the lowest corner of the louvre's trailing edge
  // the drip point is the louvre's lowest corner at the drain end: its free edge while open, the belly of the blade when shut
  const OPEN = 0.62;
  const dripLocal = (o) => new THREE.Vector3(W - 0.075, lerp(-0.011, -0.006, o), lerp(-0.05, -0.098, o));
  const dripW = new THREE.Vector3();
  function updateDrip(o) { louvrePivot.updateMatrixWorld(true); louvrePivot.localToWorld(dripW.copy(dripLocal(o))); }
  louvrePivot.rotation.x = -OPEN; updateDrip(1);
  const dripW0 = dripW.clone();                                          // where the drops land: the puddle's centre
  // the overflow film: from the pan's front lip down the inside of the panel, then along the louvre's underside to its low corner
  const lipFilm = box(M.film.clone(), 0.3, W - 0.06, PAN.y0 - 0.025, PAN.y1, PAN.z1 + 0.001, PAN.z1 + 0.0025, inner, true); lipFilm.material.opacity = 0.35;
  const louvreFilm = add(new THREE.BoxGeometry(1, 0.0025, 0.03), M.film, 0, 0, 0, louvrePivot, true);
  const dropGeo = new THREE.SphereGeometry(1, 20, 14);
  const DROP_R = 0.0058;                                     // a pendant drop just before it lets go (×1.6 so it reads on camera)
  const hang = add(dropGeo, M.water, 0, -99, 0, null, true);
  const neck = add(new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), M.water, 0, -99, 0, null, true);
  const pool = (n, geo, mat) => Array.from({ length: n }, () => { const m = add(geo, mat, 0, -99, 0, null, true); m.visible = false; return m; });
  const falling = pool(5, dropGeo, M.water), beads = pool(18, dropGeo, M.water), louvreBeads = pool(9, dropGeo, M.water), rings = pool(5, new THREE.RingGeometry(0.85, 1, 40), M.ripple);
  rings.forEach((r) => { r.rotation.x = -Math.PI / 2; r.material = M.ripple.clone(); });
  // static beads of condensation along the louvre's edge (they swell while the louvre is wet)
  const beadX = Array.from({ length: 9 }, (_, i) => 0.1 + i * 0.082 + (i % 3) * 0.009);
  // the jet from the flushing lance, and outside: the stream from the hose end
  const lance = new THREE.Group(); scene.add(lance);
  const lanceTube = add(new THREE.CylinderGeometry(0.0035, 0.0035, 0.32, 12), M.brass, 0, 0.16, 0, lance); lanceTube.rotation.x = 0;
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 16), M.red, 0, 0.36, 0, lance);
  const jet = add(new THREE.CylinderGeometry(0.0016, 0.004, 0.06, 10, 1, true), M.film, 0, -0.03, 0, lance, true);
  const lanceAt = new THREE.Vector3(); unit.localToWorld(lanceAt.set(W - 0.062, PAN.y0 + 0.02, PAN.z0 + 0.03));
  const hoseEnd = hoseCurve.getPoint(1);
  const streamGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 8, true); streamGeo.translate(0, -0.5, 0);
  const stream = add(streamGeo, M.film.clone(), hoseEnd.x, hoseEnd.y, hoseEnd.z, null, true);
  const outFalling = pool(3, dropGeo, M.water);
  const debris = pool(7, plugGeo, M.slime); debris.forEach((d, i) => { d.scale.setScalar(0.18 + (i % 3) * 0.08); d.userData.o = i / 7; });
  // cold air from the outlet: soft streaks of mist drifting down and out, fading as they warm
  // cold air from the outlet: thin ribbons of cooled air that pour forward and sink (cold air is heavier), streaming and fading as they mix
  const airMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uT: { value: 0 }, uA: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float uT; uniform float uA;
      void main(){ float edge = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
        float along = smoothstep(0.0, 0.05, vUv.x) * pow(1.0 - vUv.x, 1.2);
        float puffs = 0.7 + 0.3 * sin((vUv.x * 4.0 - uT * 1.2) * 6.2831 + vUv.y * 1.5);
        gl_FragColor = vec4(0.84, 0.94, 1.0, uA * edge * along * puffs * 0.75); }`,
  });
  const air = new THREE.Group(); scene.add(air);
  const airOrigin = new THREE.Vector3(); unit.localToWorld(airOrigin.set(W / 2, 0.0, 0.16));
  for (let k = 0; k < 6; k++) {
    const dx = (k / 5 - 0.5) * (W - 0.2), N = 40, wid = 0.08, pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, sway = 0.03 * Math.sin(t * 5 + k * 1.7);
      const cx = airOrigin.x + dx * (1 + t * 0.35) + sway, cy = airOrigin.y - 0.02 - 0.5 * Math.pow(t, 1.35), cz = airOrigin.z + 0.04 + 0.85 * t;
      const half = wid * (0.8 + t * 1.4) / 2;
      pos.push(cx - half, cy, cz, cx + half, cy - 0.02 * t, cz); uv.push(t, 0, t, 1);
      if (i < N) { const j = i * 2; idx.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const r = new THREE.Mesh(g, airMat); r.renderOrder = 5; air.add(r);
  }

  // lights: daylight from the balcony door at the left, a soft fill, sun outside
  scene.add(new THREE.HemisphereLight(0xf3efe8, 0x2a2622, hero ? 0.3 : 0.22));
  const key = new THREE.DirectionalLight(0xfff1df, hero ? 1.5 : 2.6); key.position.set(-3.2, 3.4, 2.6); key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3.2, bottom: -1, near: 1, far: 14 }); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.015;
  scene.add(key);
  const fill = new THREE.PointLight(0xe8f1ff, hero ? 1.1 : 2.2, 6, 1.6); fill.position.set(0.8, 1.6, 1.8); scene.add(fill);
  // a warm lamp in the room, off camera to the left, gives the drops their glints
  const lamp = new THREE.PointLight(0xffe2c0, hero ? 0 : 3.5, 5, 1.5); lamp.position.set(-1.6, 1.4, 1.4); scene.add(lamp);
  const sunOut = new THREE.DirectionalLight(0xfff4e6, 3.2); sunOut.position.set(1.5, 4, -6); scene.add(sunOut);

  // labels projected from 3D into the page
  const labelDefs = [
    ['drip', dripW.clone().add(v3(0, -0.02, 0)), 'הטיפות נוצרות בנקודה הנמוכה', 'Drops form at the lowest point'],
    ['wall', v3(0.06, 1.62, 0.01), 'רטיבות יורדת בקיר', 'Damp creeping down the wall'],
    ['puddle', v3(dripW.x - 0.15, 0.01, dripW.z + 0.2), 'שלולית על הרצפה', 'A puddle on the floor'],
    ['pan', null, 'מגש הניקוז מלא עד השפה', 'The drain pan, full to the lip'],
    ['plug', null, 'סתימה: רפש ואבק', 'The plug: slime and dust'],
    ['flush', null, 'שטיפה בלחץ', 'Flushing under pressure'],
    ['hose', v3(0.6, 1.99, -0.12), 'המים יורדים בצינור', 'Water runs down the drain line'],
    ['out', hoseEnd.clone().add(v3(0, 0.12, 0)), 'ויוצאים בחוץ, לניקוז', '…and leave outside, into the drain'],
    ['slow', dripW.clone().add(v3(0, -0.02, 0)), 'הטפטוף מאט ונעצר', 'The drip slows, then stops'],
    ['dry', v3(dripW.x - 0.1, 0.01, dripW.z + 0.25), 'מתייבש מהשוליים פנימה', 'Drying from the edges in'],
    ['air', airOrigin.clone().add(v3(-0.1, -0.3, 0.3)), 'אוויר קר', 'Cold air'],
  ];
  const inUnit = (x, y, z) => { const q = new THREE.Vector3(x, y, z); unit.localToWorld(q); return q; };
  labelDefs[3][1] = inUnit(W - 0.25, PAN.y1 + 0.01, PAN.z1);
  labelDefs[4][1] = inUnit(W - 0.062, PAN.y0 + 0.045, PAN.z0 + 0.018);
  labelDefs[5][1] = inUnit(W - 0.062, PAN.y0 + 0.1, PAN.z0 + 0.03);
  const labels = hero || !labelsHost ? [] : labelDefs.map(([id, pos, he, en]) => {
    const el = document.createElement('span'); el.className = 'l3d l3d-' + id;
    el.innerHTML = `<span lang="he">${he}</span><span lang="en">${en}</span>`; labelsHost.appendChild(el);
    return { id, el, v: pos, on: false };
  });

  // camera path
  const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[1])), false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[2])), false, 'centripetal');
  const kp = KEYS.map((k) => k[0]);
  function camAt(p) {
    let i = 0; while (i < kp.length - 2 && p > kp[i + 1]) i++;
    const u = (i + smooth(span(p, kp[i], kp[i + 1]))) / (kp.length - 1);
    return [posCurve.getPoint(u), tgtCurve.getPoint(u)];
  }

  let OV = null; // a fixed view for renders: { cam, tgt, clean, sec }
  let P = opts.p || 0, inView = hero, raf = 0, last = 0, w = 0, h = 0, paused = false, simT = 0;
  const frozen = () => !!(opts.frozen || window.__calm3d);
  function resize() {
    const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // the keyframes were framed at 4:3; on tall phone stages widen the view instead of cropping the sides
    const ref = 4 / 3, base = 40 * Math.PI / 180;
    camera.fov = camera.aspect >= ref ? 40 : Math.min(66, 2 * Math.atan(Math.tan(base / 2) * ref / camera.aspect) * 180 / Math.PI);
    camera.updateProjectionMatrix(); kick();
  }
  new ResizeObserver(resize).observe(host); resize();

  // ---------------------------------------------------------------- the drip simulation (real time, rate from the scroll position)
  const fall = [];      // {m, y, v, born}
  const splashes = [];  // {ring, t, beads:[{m, p, v}]}
  let hangVol = 0.3;     // 0..1 of a detaching drop
  const floorY = 0.0015;
  function release(x, z, y) {
    const m = falling.find((f) => !f.visible); if (!m) return;
    m.visible = true; m.position.set(x, y, z); fall.push({ m, v: 0 });
  }
  function splash(x, z, big) {
    const r = rings.find((q) => !q.visible); const bs = beads.filter((b) => !b.visible).slice(0, big ? 6 : 4);
    if (r) { r.visible = true; r.position.set(x, floorY + 0.001, z); r.scale.setScalar(0.004); r.material.opacity = 0.55; }
    const s = { ring: r, t: 0, beads: bs.map((b, i) => { const a = (i / bs.length) * Math.PI * 2 + Math.random() * 0.6, sp = 0.35 + Math.random() * 0.45; b.visible = true; b.position.set(x, floorY + 0.003, z); b.scale.setScalar(0.0014 + Math.random() * 0.0012); return { m: b, v: v3(Math.cos(a) * sp, 0.7 + Math.random() * 0.6, Math.sin(a) * sp) }; }) };
    splashes.push(s);
  }
  function stepSim(dt, p) {
    const R = T.rate(p);
    // a pendant drop swells at the corner; when it is heavy enough it necks, stretches and lets go
    if (R > 0.01) { hangVol += dt * R * 1.0; if (hangVol >= 1) { hangVol = 0.08; release(dripW.x, dripW.z, dripW.y - DROP_R * 1.5); } }
    else hangVol = Math.max(0, hangVol - dt * 0.6);
    for (let i = fall.length - 1; i >= 0; i--) {
      const f = fall[i]; f.v += G * dt; f.m.position.y -= f.v * dt;
      const st = 1 + Math.min(0.35, f.v * 0.06);
      f.m.scale.set(DROP_R / Math.sqrt(st), DROP_R * st, DROP_R / Math.sqrt(st));
      if (f.m.position.y <= floorY + DROP_R) { splash(f.m.position.x, f.m.position.z, true); f.m.visible = false; fall.splice(i, 1); }
    }
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i]; s.t += dt;
      if (s.ring) { s.ring.scale.setScalar(0.004 + s.t * 0.16); s.ring.material.opacity = 0.55 * Math.max(0, 1 - s.t / 0.55); }
      s.beads.forEach((b) => { if (!b.m.visible) return; b.v.y -= G * dt; b.m.position.addScaledVector(b.v, dt); if (b.m.position.y < floorY) b.m.visible = false; });
      if (s.t > 0.6) { if (s.ring) s.ring.visible = false; s.beads.forEach((b) => { b.m.visible = false; }); splashes.splice(i, 1); }
    }
  }
  // stills and hero: a fixed, readable pose instead of the live simulation
  function freezePose(p) {
    fall.length = 0; splashes.length = 0; falling.forEach((f) => { f.visible = false; }); beads.forEach((b) => { b.visible = false; }); rings.forEach((r) => { r.visible = false; });
    const R = T.rate(p);
    hangVol = R > 0.01 ? 0.82 : 0;
    if (R > 0.3 && !hero) {
      const y1 = dripW.y - 0.09, y2 = 0.62;
      release(dripW.x, dripW.z, y1); fall[0].v = Math.sqrt(2 * G * (dripW.y - y1)); fall[0].m.scale.set(DROP_R * 0.9, DROP_R * 1.3, DROP_R * 0.9);
      release(dripW.x, dripW.z, y2); fall[1].v = Math.sqrt(2 * G * (dripW.y - y2)); fall[1].m.scale.set(DROP_R * 0.88, DROP_R * 1.35, DROP_R * 0.88);
      splash(dripW.x, dripW.z, true); splashes[0].t = 0.09;
      const s = splashes[0]; if (s.ring) { s.ring.scale.setScalar(0.004 + s.t * 0.16); s.ring.material.opacity = 0.5; }
      s.beads.forEach((b) => { b.m.position.addScaledVector(b.v, 0.07); b.m.position.y += 0.02; });
    }
  }

  function frame(ts) {
    raf = 0; if (!inView || paused) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
    const p = P, still = frozen();
    if (!still) simT += dt;
    if (OV && OV.cam) { camera.position.set(...OV.cam); camera.lookAt(...OV.tgt); }
    else if (!hero) { const [cpos, ctgt] = camAt(p); camera.position.copy(cpos); camera.lookAt(ctgt); }
    else { camera.position.set(opts.heroCam[0], opts.heroCam[1], opts.heroCam[2]); camera.lookAt(opts.heroTgt[0], opts.heroTgt[1], opts.heroTgt[2]); }

    const on = T.on(p);
    drawDisplay(on ? '24' : '');
    dispMat.emissiveIntensity = on ? 1.3 : 0;
    const lo = T.louvre(p);
    louvrePivot.rotation.x = -(OPEN * lo + (on && p > 0.89 && !still ? 0.1 * Math.sin(simT * 0.9) : 0));
    updateDrip(lo);
    panelPivot.rotation.x = -1.05 * T.panel(p);
    cutPlane.constant = T.cut(p) > 0.001 ? (unit.position.x + W - 0.34 * T.cut(p)) : 99;
    const sc = OV && OV.sec != null ? OV.sec : T.sec(p); secPlane.constant = sc > 0.001 ? lerp(X1, XC, sc) : 99; caps.visible = sc > 0.999;
    if (!still) fan.rotation.x += dt * (on ? 22 : 0);

    // the pan: full to its lip while blocked; the flush drains it; condensate keeps a film running once it is on again
    const pan = T.pan(p);
    panWater.scale.y = Math.max(0.02, pan); panWater.position.y = PAN.y0 + 0.004 + (PAN.y1 - PAN.y0 - 0.004) * Math.max(0.02, pan) / 2;
    const over = p < 0.545 ? 1 : 0;
    lipFilm.visible = over && T.cut(p) > 0.05;
    plug.scale.setScalar(Math.max(0.001, T.plug(p))); plug.visible = T.plug(p) > 0.01;
    sludge.forEach((s, i) => { s.visible = p < 0.53 + i * 0.006 || p > 0.98; });
    // the film along the louvre thins with the rate and is gone a little after the last drop
    const R = T.rate(p);
    const lf = R > 0.01 ? Math.min(1, 0.3 + R * 0.5) : 0;
    const flen = 0.4 * lf + 0.04;
    louvreFilm.scale.set(flen, 1, 1);
    louvreFilm.position.set(W - 0.075 - flen / 2, lerp(-0.011, -0.006, lo) - 0.0015, lerp(-0.04, -0.08, lo));
    louvreFilm.visible = lf > 0;
    beadX.forEach((bx, i) => {
      const m = louvreBeads[i]; m.visible = hero || R > 0.05 || (p > 0.9 && i % 3 === 0);
      if (!m.visible) return;
      const r = 0.0015 + (i % 3) * 0.0006;
      louvrePivot.localToWorld(m.position.set(bx, lerp(-0.011, -0.006, lo) - r * 0.8, lerp(-0.05, -0.097, lo)));
      m.scale.set(r, r * 1.25, r);
    });

    // drops: live, or a fixed readable pose
    if (still) freezePose(p); else stepSim(dt, p);
    if (hangVol > 0.02) {
      const g = hangVol, r = DROP_R * (0.45 + 0.6 * Math.cbrt(g)), str = 1 + 0.9 * Math.max(0, g - 0.6);
      hang.position.set(dripW.x, dripW.y - r * str * 0.9, dripW.z); hang.scale.set(r, r * str, r);
      neck.visible = g > 0.55; neck.position.set(dripW.x, dripW.y - r * str * 0.25, dripW.z); neck.scale.set(r * 0.42 * (1.2 - g * 0.4), r * str * 0.6, r * 0.42 * (1.2 - g * 0.4));
    } else { hang.position.y = -99; neck.visible = false; }

    // wet fields: the puddle's radius follows its volume (a 1.5 mm film); drying shrinks it from the edge, leaving the tide line
    const ml = T.floor(p), maxMl = p < 0.69 ? ml : 360;
    const rOf = (v) => Math.sqrt(v * 1e-6 / (Math.PI * 0.0015));
    const fu = M.floor.userData.u; fu.uC.value.copy(dripW0); fu.uTop.value = clamp(ml / 300); fu.uR.value = rOf(ml) * (ml > 1 ? 1 : 0); fu.uMax.value = p > 0.69 ? rOf(maxMl) : 0;
    const wu = M.wall.userData.u, wl = T.wall(p);
    wu.uC.value.set(unit.position.x + W - 0.16, 0, 0); wu.uTop.value = unit.position.y + 0.02;
    wu.uR.value = p < 0.69 ? 1 : wl; wu.uFront.value = p < 0.69 ? lerp(unit.position.y, 0.95, wl) : 0.95; wu.uMax.value = p > 0.69 ? 1 : 0;
    if (hero || (OV && OV.clean)) { fu.uR.value = 0; wu.uR.value = 0; fu.uMax.value = 0; wu.uMax.value = 0; }

    // the lance comes in from the front, the jet plays on the plug
    const la = T.lance(p);
    lance.visible = la > 0.01;
    lance.position.set(lanceAt.x + 0.02, lanceAt.y + lerp(0.5, 0.0, la), lanceAt.z + lerp(0.35, 0.02, la));
    lance.rotation.x = lerp(-0.6, -0.35, la);
    jet.visible = T.jet(p) > 0 && la > 0.9; if (jet.visible && !still) jet.scale.set(1 + 0.15 * Math.sin(simT * 40), 1, 1 + 0.15 * Math.cos(simT * 37));

    // water in the hose: the front runs down from the outlet; slugs move at the flow's speed; debris rides along
    const F = T.flow(p), fr = T.front(p);
    flowTube.visible = F > 0.005;
    const reach = F > 0.005 ? (p > 0.88 ? 1 : fr) : 0;
    flowGeo.setDrawRange(0, Math.floor(HOSE_IDX * reach / 30) * 30);
    flowMat.opacity = 0.25 + 0.65 * Math.min(1, F * 1.4);
    if (!still) stripes.offset.x -= dt * (0.4 + 3.2 * F);
    debris.forEach((d, i) => {
      const on = p > 0.522 && p < 0.6;
      d.visible = on; if (!on) return;
      const t = still ? Math.min(fr, 0.15 + i * 0.12) : Math.min(fr, ((simT * 0.35 + d.userData.o) % 1) * fr);
      d.position.copy(hoseCurve.getPoint(Math.max(0.01, t)));
    });
    // outside: a continuous stream while the flow is strong, breaking into drops as it slows
    const sm = stream.material;
    stream.visible = F > 0.22 && fr >= 0.99;
    if (stream.visible) { const r = 0.0012 + 0.0042 * Math.sqrt(F); stream.scale.set(r, hoseEnd.y - 0.005, r); sm.opacity = 0.5 + 0.3 * F; }
    outFalling.forEach((d, i) => {
      const dripping = F > 0.003 && F <= 0.22 && (fr >= 0.99 || p > 0.88);
      d.visible = dripping; if (!dripping) return;
      const per = 1 / Math.max(0.6, F * 14), ph = still ? 0.3 + i * 0.25 : ((simT / per + i / 3) % 1);
      const y = hoseEnd.y - 0.5 * G * Math.pow(ph * Math.sqrt(2 * hoseEnd.y / G), 2);
      d.position.set(hoseEnd.x, Math.max(0.006, y), hoseEnd.z); d.scale.set(DROP_R * 0.8, DROP_R * 1.2, DROP_R * 0.8);
    });

    // cold air
    const A = T.air(p);
    airMat.uniforms.uA.value = A; airMat.uniforms.uT.value = still ? 0.3 : simT; air.visible = A > 0.001;

    // labels
    const show = {
      drip: p < 0.12, wall: p > 0.03 && p < 0.12, puddle: p > 0.11 && p < 0.2, pan: p > 0.3 && p < 0.39, plug: p > 0.37 && p < 0.5,
      flush: p > 0.5 && p < 0.555, hose: p > 0.55 && p < 0.6, out: p > 0.61 && p < 0.67, slow: p > 0.68 && p < 0.745, dry: p > 0.745 && p < 0.84, air: p > 0.9,
    };
    camera.updateMatrixWorld();
    const v = new THREE.Vector3();
    labels.forEach((l) => {
      v.copy(l.v).project(camera);
      const want = OV && OV.labels ? OV.labels.indexOf(l.id) >= 0 : show[l.id];
      const vis = want && v.z < 1 && Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.95;
      if (vis !== l.on) { l.on = vis; l.el.style.opacity = vis ? 1 : 0; }
      if (vis) l.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
    });

    renderer.render(scene, camera);
    if (inView && !paused && !still) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && inView && !paused) raf = requestAnimationFrame(frame); }
  if (!hero) new IntersectionObserver((es) => { inView = es[0].isIntersecting; last = 0; kick(); }).observe(host);
  kick();
  return {
    set(p) { P = p; kick(); },
    view(v) { OV = v; kick(); },
    redraw: kick,
    canvas, M, scene, camera,
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; canvas.style.visibility = 'hidden'; if (labelsHost) labelsHost.style.visibility = 'hidden'; },
    resume() { paused = false; canvas.style.visibility = ''; if (labelsHost) labelsHost.style.visibility = ''; last = 0; kick(); },
    // where the drip corner lands on screen (hero renders record it for the page's falling drops)
    dripScreen() { const q = dripW.clone().project(camera); return [(q.x + 1) / 2, (1 - q.y) / 2]; },
  };
}
