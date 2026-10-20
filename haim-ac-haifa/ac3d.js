// A cutaway of a split air conditioner on a Haifa heat-wave day. Units are metres; the room is cut open at z = 0.
// The page's scroll position (0..1) drives every part.
// Story: the indoor unit blows warm air and the room climbs to 34° → outside, the condenser fan stands still,
// the cover comes off: a swollen run capacitor, and the high-side gauge far past its band → the capacitor is
// swapped, the cover goes back → the fan spins up, head pressure falls into the green band → inside, the coil
// goes cold, condensate runs from the pan down the drain hose → cool air, the room falls to 24°.
// Every repair here is a generic illustration of how a split unit works.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

export const STAGES = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1];
const T = {
  roomTemp: (p) => (p < 0.14 ? 31 + 3 * smooth(span(p, 0, 0.14)) : p < 0.6 ? 34 : p < 0.83 ? 34 - 1.5 * smooth(span(p, 0.6, 0.83)) : 32.5 - 8.5 * smooth(span(p, 0.84, 0.97))),
  cover: (p) => (p < 0.19 ? 0 : p < 0.46 ? smooth(span(p, 0.19, 0.23)) : 1 - smooth(span(p, 0.46, 0.5))),
  gauges: (p) => (p < 0.22 ? 0 : p < 0.64 ? smooth(span(p, 0.22, 0.27)) : 1 - smooth(span(p, 0.64, 0.68))),
  oldCap: (p) => smooth(span(p, 0.34, 0.39)),
  newCap: (p) => 1 - smooth(span(p, 0.4, 0.45)),
  fan: (p) => smooth(span(p, 0.5, 0.57)),               // condenser fan speed 0..1 (spins up, not instantly)
  // power is off during the repair: both sides settle to the same standing pressure, then the restart with the fan running
  high: (p) => (p < 0.33 ? lerp(26, 41, smooth(span(p, 0, 0.12))) : p < 0.5 ? lerp(41, 16, smooth(span(p, 0.33, 0.38))) : lerp(16, 26.5, smooth(span(p, 0.51, 0.6)))),
  low: (p) => (p < 0.33 ? 11.5 : p < 0.5 ? lerp(11.5, 16, smooth(span(p, 0.33, 0.38))) : lerp(16, 8.2, smooth(span(p, 0.51, 0.6)))),
  cold: (p) => smooth(span(p, 0.56, 0.7)),              // indoor coil temperature: 0 warm, 1 cold
  drip: (p) => (p > 0.68 ? 1 : 0),
};

// camera keyframes [p, position, target]
const KEYS = [
  [0.00, [-0.9, 1.6, 5.6], [-0.7, 1.45, -0.5]],
  [0.1, [-1.0, 2.05, 2.9], [-0.55, 2.0, -0.4]],
  [0.18, [2.7, 2.15, 2.2], [0.75, 1.65, -0.42]],
  [0.27, [2.35, 2.15, 1.45], [0.72, 1.62, -0.42]],
  [0.37, [1.85, 2.65, 0.75], [0.66, 1.82, -0.4]],
  [0.46, [1.85, 2.6, 0.8], [0.66, 1.8, -0.4]],
  [0.56, [2.6, 1.75, 0.35], [0.7, 1.6, -0.45]],
  [0.64, [2.3, 1.9, 1.25], [0.68, 1.58, -0.42]],
  [0.72, [-0.55, 2.35, 1.25], [-0.12, 2.3, -0.4]],
  [0.8, [1.15, 1.45, 1.65], [0.38, 1.25, -0.25]],
  [0.88, [-0.9, 1.8, 3.6], [-0.7, 1.6, -0.5]],
  [1.0, [-0.9, 1.6, 5.6], [-0.7, 1.45, -0.5]],
];

const LABELS = [
  ['temp', '', ''], ['warm', 'אוויר חם יוצא מהמזגן', 'Warm air from the unit'],
  ['fan', 'המאוורר בחוץ עומד', 'The outdoor fan is still'], ['cap', 'קבל מנופח', 'A swollen capacitor'],
  ['high', 'לחץ גבוה מדי', 'Head pressure far too high'], ['newcap', 'קבל חדש', 'A new capacitor'],
  ['spin', 'המאוורר מסתובב', 'The fan turns again'], ['ok', 'הלחץ חוזר לטווח', 'Pressure back in its band'],
  ['coil', 'הסליל בפנים מתקרר', 'The indoor coil goes cold'], ['pan', 'מגש הניקוז', 'Drain pan'],
  ['drain', 'המים יוצאים בצינור הניקוז', 'Water leaves by the drain hose'], ['cool', 'אוויר קר', 'Cold air'],
];

function gaugeFace(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), cx = 128, cy = 128;
  g.fillStyle = kind === 'high' ? '#c8322b' : '#1f5fae'; g.beginPath(); g.arc(cx, cy, 126, 0, TAU); g.fill();
  g.fillStyle = '#f6f6f2'; g.beginPath(); g.arc(cx, cy, 112, 0, TAU); g.fill();
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, max = 50;
  const ang = (v) => a0 + (a1 - a0) * v / max;
  const band = (from, to, col) => { g.strokeStyle = col; g.lineWidth = 14; g.beginPath(); g.arc(cx, cy, 92, ang(from), ang(to)); g.stroke(); };
  if (kind === 'high') { band(22, 30, '#2f9e5a'); band(36, 50, '#d23b2e'); } else { band(6, 10, '#2f9e5a'); }
  g.strokeStyle = '#222'; g.fillStyle = '#222'; g.font = 'bold 20px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let v = 0; v <= max; v += 5) {
    const a = ang(v), big = v % 10 === 0;
    g.lineWidth = big ? 4 : 2; g.beginPath();
    g.moveTo(cx + Math.cos(a) * (big ? 74 : 80), cy + Math.sin(a) * (big ? 74 : 80)); g.lineTo(cx + Math.cos(a) * 100, cy + Math.sin(a) * 100); g.stroke();
    if (big) g.fillText(String(v), cx + Math.cos(a) * 58, cy + Math.sin(a) * 58);
  }
  g.font = 'bold 22px sans-serif'; g.fillText(kind === 'high' ? 'HIGH · bar' : 'LOW · bar', cx, cy + 62);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { t, ang: (v) => -(ang(v) - Math.PI * 1.5) };
}

function plaster(color, rough) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = color; g.fillRect(0, 0, 256, 256);
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,255,255'},${0.02 + rnd() * 0.05})`; g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 3, 1 + rnd() * 3); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: t, roughness: rough, metalness: 0 });
}

export function initAC3D(host, labelsHost, opts) {
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  const small = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const SKY_HOT = new THREE.Color(0xf2b27a), SKY_COOL = new THREE.Color(0xbfe0ea);
  scene.background = SKY_HOT.clone();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.7;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.03, 60);

  const metal = (color, rough, extra) => new THREE.MeshPhysicalMaterial(Object.assign({ color, metalness: 1, roughness: rough }, extra || {}));
  const M = {
    wall: plaster('#e9e2d4', 0.95), cut: new THREE.MeshStandardMaterial({ color: 0x9b8f7d, roughness: 1 }),
    outside: plaster('#d9cdb7', 0.95), floor: new THREE.MeshStandardMaterial({ color: 0xc9b79a, roughness: 0.7 }),
    plastic: new THREE.MeshPhysicalMaterial({ color: 0xf3f4f1, roughness: 0.35, clearcoat: 0.4 }),
    plasticIn: new THREE.MeshStandardMaterial({ color: 0xd9dcd9, roughness: 0.6 }),
    casing: new THREE.MeshPhysicalMaterial({ color: 0xe4e5e1, roughness: 0.4, metalness: 0.2, clearcoat: 0.3 }),
    grille: metal(0x2a2d30, 0.5), blade: new THREE.MeshStandardMaterial({ color: 0x3a3f44, roughness: 0.5 }),
    copper: metal(0xc27a4a, 0.3), alu: metal(0xc9ccce, 0.35),
    coil: new THREE.MeshStandardMaterial({ color: 0xb7bcbf, roughness: 0.4, metalness: 0.7, emissive: 0x000000 }),
    comp: new THREE.MeshStandardMaterial({ color: 0x24282c, roughness: 0.45, metalness: 0.4, emissive: 0x000000 }),
    capOld: new THREE.MeshStandardMaterial({ color: 0x8e9497, roughness: 0.55, metalness: 0.6 }),
    capNew: new THREE.MeshStandardMaterial({ color: 0xc5cacd, roughness: 0.3, metalness: 0.8 }),
    capTop: new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.6 }),
    foam: new THREE.MeshStandardMaterial({ color: 0x3b3f42, roughness: 0.9 }),
    hose: new THREE.MeshStandardMaterial({ color: 0xe6e6e0, roughness: 0.6 }),
    bracket: metal(0x8d9296, 0.45), needle: new THREE.MeshStandardMaterial({ color: 0x111111 }),
    water: new THREE.MeshPhysicalMaterial({ color: 0xbfe6ff, roughness: 0.05, transmission: 0.6, thickness: 0.02, transparent: true, opacity: 0.85 }),
    tube: new THREE.MeshStandardMaterial({ color: 0xd3d6d6, roughness: 0.4 }), red: new THREE.MeshStandardMaterial({ color: 0xc8322b, roughness: 0.4 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xffe2b0, roughness: 0.2, emissive: 0xffc27a, emissiveIntensity: 0.6 }),
    sofa: new THREE.MeshStandardMaterial({ color: 0x5b6d6a, roughness: 0.9 }), wood: new THREE.MeshStandardMaterial({ color: 0x8b6a4a, roughness: 0.7 }),
  };

  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b5d4c, 0.55));
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.6); sun.position.set(6, 9, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -2, near: 1, far: 30 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const fill = new THREE.PointLight(0xfff0dd, 6, 8, 1.6); fill.position.set(-1.4, 2.4, 1.6); scene.add(fill);

  const box = (mat, x0, x1, y0, y1, z0, z1, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true;
    (parent || scene).add(m); return m;
  };
  const cyl = (mat, r, h, parent, seg) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 24), mat); m.castShadow = m.receiveShadow = true; (parent || scene).add(m); return m; };
  const tube = (mat, pts, r, parent) => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)), false, 'catmullrom', 0.05), 96, r, 12, false), mat);
    m.castShadow = true; (parent || scene).add(m); return m;
  };

  // ---- the building: room (x < 0), the outer wall (0..0.3), the slab, the sunny street outside
  box(M.floor, -3.4, 0, -0.06, 0, -2.6, 0);
  box(M.cut, -3.4, 2.2, -0.3, -0.06, -2.6, 0.001);
  box(M.wall, -3.4, 0, 0, 2.8, -2.7, -2.6);           // back wall
  box(M.cut, -3.4, 0.3, 2.8, 3.05, -2.7, 0.001);      // ceiling slab, cut
  box(M.cut, 0, 0.3, 0, 2.8, -2.7, 0.001);            // the outer wall in section
  box(M.outside, 0.3, 0.31, -0.3, 3.05, -2.7, 0);     // its plastered outer face
  const win = box(M.glass, -2.6, -1.4, 1.0, 2.2, -2.6, -2.58);
  box(M.sofa, -3.1, -1.6, 0, 0.45, -2.5, -1.7); box(M.sofa, -3.1, -1.6, 0.45, 0.85, -2.6, -2.35);
  box(M.wood, -1.3, -0.7, 0, 0.42, -1.6, -1.0);
  // balcony floor outside, where the drain water lands
  box(M.cut, 0.31, 2.2, -0.3, 0, -2.6, 0.001); box(M.floor, 0.31, 2.2, 0, 0.02, -2.6, 0);

  // room thermometer on the back wall: a tube with a red column
  const thermo = new THREE.Group(); thermo.position.set(-0.75, 1.35, -2.58); thermo.scale.setScalar(1.8); scene.add(thermo);
  box(M.plasticIn, -0.05, 0.05, -0.3, 0.3, 0, 0.02, thermo);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 12), M.red); bulb.position.set(0, -0.24, 0.04); thermo.add(bulb);
  const column = box(M.red, -0.008, 0.008, 0, 1, 0.03, 0.045, thermo); column.position.y = -0.24;
  const tempAt = new THREE.Object3D(); thermo.add(tempAt);

  // ---- indoor unit, cut through its length (long axis z); section shows coil, cross-flow fan, drain pan, louvre
  const indoor = new THREE.Group(); indoor.position.set(-0.27, 2.2, -0.95); scene.add(indoor); // spans z -0.95..-0.0
  const DEPTH = 0.9;
  const shellShape = new THREE.Shape();
  shellShape.moveTo(0.27, 0.0); shellShape.lineTo(0.27, 0.33); shellShape.lineTo(0.06, 0.33); shellShape.quadraticCurveTo(0.0, 0.32, 0.0, 0.25);
  shellShape.lineTo(0.0, 0.1); shellShape.quadraticCurveTo(0.0, 0.03, 0.05, 0.0); shellShape.lineTo(0.27, 0.0);
  const inner = new THREE.Path(); inner.moveTo(0.255, 0.015); inner.lineTo(0.255, 0.315); inner.lineTo(0.06, 0.315); inner.quadraticCurveTo(0.015, 0.31, 0.015, 0.25);
  inner.lineTo(0.015, 0.1); inner.quadraticCurveTo(0.015, 0.04, 0.06, 0.015); inner.lineTo(0.255, 0.015); shellShape.holes.push(inner);
  const shell = new THREE.Mesh(new THREE.ExtrudeGeometry(shellShape, { depth: DEPTH, bevelEnabled: false, curveSegments: 12 }), M.plastic);
  shell.castShadow = true; indoor.add(shell);
  // the outlet slot at the bottom front: a gap in the shell is suggested by the louvre
  const louvre = box(M.plastic, -0.06, 0.06, -0.004, 0.004, 0, DEPTH, indoor); louvre.position.set(0.04, 0.02, DEPTH / 2);
  // coil: a bent fin pack (two slabs in a Λ) — warm grey that turns frost blue
  M.coilIn = M.coil.clone();
  const coilA = box(M.coilIn, -0.01, 0.01, -0.09, 0.09, 0.02, DEPTH - 0.02, indoor); coilA.position.set(0.07, 0.2, DEPTH / 2); coilA.rotation.z = 0.5;
  const coilB = box(M.coilIn, -0.01, 0.01, -0.07, 0.07, 0.02, DEPTH - 0.02, indoor); coilB.position.set(0.17, 0.25, DEPTH / 2); coilB.rotation.z = -1.0;
  const fins = new THREE.Group(); indoor.add(fins);
  for (let i = 0; i < 9; i++) { const t = cyl(M.copper, 0.006, DEPTH - 0.06, fins, 8); t.rotation.x = Math.PI / 2; const k = i / 8; t.position.set(lerp(0.035, 0.12, k), lerp(0.13, 0.28, k), DEPTH / 2); if (i > 5) t.position.set(lerp(0.13, 0.22, (i - 6) / 2), lerp(0.3, 0.2, (i - 6) / 2), DEPTH / 2); }
  // cross-flow fan: a cylinder of thin blades
  const xfan = new THREE.Group(); xfan.position.set(0.13, 0.1, DEPTH / 2); indoor.add(xfan);
  for (let i = 0; i < 14; i++) { const b = box(M.blade, -0.003, 0.003, -0.012, 0.012, -DEPTH / 2 + 0.03, DEPTH / 2 - 0.03, xfan); const a = i / 14 * TAU; b.position.set(Math.cos(a) * 0.045, Math.sin(a) * 0.045, 0); b.rotation.z = a + 0.6; }
  // drain pan under the coil's front leg
  const pan = box(M.plasticIn, 0.02, 0.1, 0.07, 0.085, 0.02, DEPTH - 0.02, indoor);
  box(M.plasticIn, 0.02, 0.03, 0.085, 0.11, 0.02, DEPTH - 0.02, indoor);
  const panWater = box(M.water, 0.03, 0.098, 0.085, 0.09, 0.03, DEPTH - 0.03, indoor); panWater.scale.y = 0.01;
  // mounting plate
  box(M.alu, 0.27, 0.275, -0.02, 0.33, 0.05, DEPTH - 0.05, indoor);

  // ---- the lines through the wall: liquid (thin), suction (thick, in black foam), the drain hose
  const liquid = tube(M.copper, [[-0.05, 2.4, -0.05], [0.15, 2.4, -0.05], [0.35, 2.4, -0.05], [0.42, 2.3, -0.05], [0.42, 1.75, -0.05], [0.5, 1.55, -0.05], [0.6, 1.47, -0.02]], 0.0045);
  const suction = tube(M.foam, [[-0.05, 2.33, -0.1], [0.15, 2.33, -0.1], [0.36, 2.33, -0.1], [0.46, 2.22, -0.1], [0.46, 1.72, -0.1], [0.54, 1.5, -0.09], [0.62, 1.4, -0.03]], 0.016);
  const drainPts = [[-0.2, 2.27, -0.5], [-0.15, 2.22, -0.2], [0.05, 2.18, -0.16], [0.33, 2.15, -0.16], [0.38, 2.0, -0.16], [0.38, 1.0, -0.16], [0.38, 0.62, -0.16]];
  tube(M.hose, drainPts, 0.009);
  const drainEnd = new THREE.Vector3(0.38, 0.6, -0.16);

  // ---- outdoor unit on its bracket: casing x 0.5..0.82 (front grille at +x), y 1.3..1.95, z -0.9..-0.05
  const out = new THREE.Group(); scene.add(out);
  const OX0 = 0.5, OX1 = 0.82, OY0 = 1.3, OY1 = 1.95, OZ0 = -0.9, OZ1 = -0.05;
  box(M.bracket, 0.31, 0.9, 1.26, 1.3, -0.82, -0.78); box(M.bracket, 0.31, 0.9, 1.26, 1.3, -0.17, -0.13);
  box(M.bracket, 0.31, 0.34, 0.95, 1.3, -0.82, -0.78); box(M.bracket, 0.31, 0.34, 0.95, 1.3, -0.17, -0.13);
  box(M.casing, OX0, OX1, OY0, OY0 + 0.02, OZ0, OZ1, out);                  // base
  box(M.casing, OX0, OX1, OY0, OY1 - 0.02, OZ1 - 0.02, OZ1, out);           // side panel, valve side (cut lower part open below)
  box(M.casing, OX0, OX1, OY0, OY1 - 0.02, OZ0, OZ0 + 0.02, out);
  // front panel with a round opening: built as a frame of four boxes around the fan
  const FY = 1.62, FZ = -0.55, FR = 0.24;
  box(M.casing, OX1 - 0.02, OX1, OY0, FY - FR, OZ0, -0.27, out); box(M.casing, OX1 - 0.02, OX1, FY + FR, OY1 - 0.02, OZ0, -0.27, out);
  box(M.casing, OX1 - 0.02, OX1, OY0, OY1 - 0.02, OZ0, FZ - FR, out); box(M.casing, OX1 - 0.02, OX1, OY0, OY1 - 0.02, FZ + FR, OZ1, out);
  // grille rings
  for (const r of [0.08, 0.15, 0.22]) { const g = new THREE.Mesh(new THREE.TorusGeometry(r, 0.003, 6, 48), M.grille); g.rotation.y = Math.PI / 2; g.position.set(OX1 + 0.01, FY, FZ); out.add(g); }
  for (let i = 0; i < 4; i++) { const g = box(M.grille, -0.002, 0.002, -FR, FR, -0.002, 0.002, out); g.position.set(OX1 + 0.01, FY, FZ); g.rotation.x = i * Math.PI / 4; }
  // condenser coil along the back (toward the wall), with a hot glow when the fan is dead
  const condCoil = box(M.coil, OX0, OX0 + 0.03, OY0 + 0.03, OY1 - 0.05, OZ0 + 0.03, -0.3, out);
  // the fan: three swept blades on a hub, axis x
  const fan = new THREE.Group(); fan.position.set(OX1 - 0.12, FY, FZ); out.add(fan);
  const hub = cyl(M.blade, 0.04, 0.06, fan); hub.rotation.z = Math.PI / 2;
  const bladeShape = new THREE.Shape(); bladeShape.moveTo(0, 0.03); bladeShape.bezierCurveTo(0.08, 0.06, 0.2, 0.09, 0.21, 0.02); bladeShape.bezierCurveTo(0.2, -0.05, 0.1, -0.04, 0, -0.03);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.ExtrudeGeometry(bladeShape, { depth: 0.006, bevelEnabled: false }), M.blade);
    const holder = new THREE.Group(); holder.rotation.x = i * TAU / 3; fan.add(holder);
    b.rotation.set(0, Math.PI / 2, 0); b.rotation.order = 'YXZ'; b.rotateZ(0); b.rotation.y = Math.PI / 2; b.rotation.z = Math.PI / 2;
    b.rotateX(0.35); holder.add(b); b.castShadow = true;
  }
  box(M.bracket, OX0 + 0.03, OX1 - 0.15, FY - 0.015, FY + 0.015, FZ - 0.015, FZ + 0.015, out); // motor arm
  const motor = cyl(M.comp, 0.045, 0.07, out); motor.rotation.z = Math.PI / 2; motor.position.set(OX1 - 0.19, FY, FZ);
  // compressor in the valve-side compartment
  const comp = cyl(M.comp, 0.075, 0.26, out); comp.position.set(0.64, OY0 + 0.15, -0.16);
  const domeC = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 10, 0, TAU, 0, Math.PI / 2), M.comp); domeC.position.set(0.64, OY0 + 0.28, -0.16); out.add(domeC);
  box(M.casing, OX0 + 0.04, OX1 - 0.04, OY0 + 0.02, OY1 - 0.06, -0.29, -0.28, out); // divider
  // run capacitors (old: swollen, new) on a little shelf by the top
  box(M.casing, 0.56, 0.78, 1.78, 1.79, -0.24, -0.08, out);
  const capOld = new THREE.Group(); capOld.position.set(0.67, 1.79, -0.16); out.add(capOld);
  const capBody = cyl(M.capOld, 0.026, 0.1, capOld); capBody.position.y = 0.05;
  const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 8, 0, TAU, 0, Math.PI / 2), M.capTop); capDome.scale.y = 0.65; capDome.position.y = 0.1; capOld.add(capDome);
  const capNew = new THREE.Group(); capNew.position.set(0.67, 1.79, -0.16); out.add(capNew);
  const capBody2 = cyl(M.capNew, 0.026, 0.1, capNew); capBody2.position.y = 0.05;
  const capTop2 = cyl(M.capTop, 0.026, 0.008, capNew); capTop2.position.y = 0.104;
  // top cover lifts off for the diagnosis
  const cover = box(M.casing, OX0 - 0.01, OX1 + 0.01, OY1 - 0.02, OY1, OZ0 - 0.01, OZ1 + 0.01, out);
  const coverY = cover.position.y;
  // service valves on the side
  const valve1 = cyl(M.alu, 0.012, 0.04, out); valve1.rotation.x = Math.PI / 2; valve1.position.set(0.6, 1.47, -0.03);
  const valve2 = cyl(M.alu, 0.015, 0.04, out); valve2.rotation.x = Math.PI / 2; valve2.position.set(0.62, 1.4, -0.03);

  // ---- manifold gauges, hanging from the valves
  const mani = new THREE.Group(); mani.scale.setScalar(1.5); scene.add(mani);
  const gH = gaugeFace('high'), gL = gaugeFace('low');
  function gauge(face, x) {
    const g = new THREE.Group(); g.position.set(x, 0, 0); mani.add(g);
    const body = cyl(M.grille, 0.06, 0.03, g, 32); body.rotation.x = Math.PI / 2;
    const f = new THREE.Mesh(new THREE.CircleGeometry(0.056, 48), new THREE.MeshStandardMaterial({ map: face.t, roughness: 0.4 })); f.position.z = 0.016; g.add(f);
    const n = new THREE.Group(); n.position.z = 0.019; g.add(n);
    const nm = box(M.needle, -0.002, 0.002, 0, 0.046, 0, 0.002, n);
    nm.castShadow = false;
    return n;
  }
  const needleL = gauge(gL, -0.07), needleH = gauge(gH, 0.07);
  box(M.alu, -0.12, 0.12, -0.09, -0.06, -0.015, 0.015, mani);
  const hoseL = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0x1f5fae, roughness: 0.6 })); scene.add(hoseL);
  const hoseH = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0xc8322b, roughness: 0.6 })); scene.add(hoseH);
  const MANI_HOME = new THREE.Vector3(0.9, 1.3, 0.3), MANI_AWAY = new THREE.Vector3(1.6, 0.4, 1.4);
  function hoseGeo(mesh, a, b) {
    const mid = a.clone().lerp(b, 0.5); mid.y -= 0.18;
    mesh.geometry.dispose(); mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 24, 0.006, 6, false);
  }

  // ---- air: particles from the louvre, warm orange before, cold blue after
  const N = 220;
  const airGeo = new THREE.BufferGeometry();
  const airPos = new Float32Array(N * 3), airCol = new Float32Array(N * 3);
  airGeo.setAttribute('position', new THREE.BufferAttribute(airPos, 3)); airGeo.setAttribute('color', new THREE.BufferAttribute(airCol, 3));
  const airMat = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false });
  const air = new THREE.Points(airGeo, airMat); scene.add(air);
  const seeds = []; let sd = 11; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < N; i++) seeds.push([rnd(), rnd(), rnd(), rnd()]);
  const HOT = new THREE.Color(0xff7a2e), COLD = new THREE.Color(0x3fb2e6);
  // heat shimmer off the condenser when its fan is dead
  const HN = 60, heatPos = new Float32Array(HN * 3), heatGeo = new THREE.BufferGeometry(); heatGeo.setAttribute('position', new THREE.BufferAttribute(heatPos, 3));
  const heat = new THREE.Points(heatGeo, new THREE.PointsMaterial({ size: 0.03, color: 0xff5a1f, transparent: true, opacity: 0.6, depthWrite: false })); scene.add(heat);
  // condensate: drops falling off the coil into the pan, and from the hose end onto the balcony
  const drops = []; for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), M.water); d.scale.y = 1.4; scene.add(d); drops.push(d); }
  const hoseDrops = []; for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), M.water); d.scale.y = 1.3; scene.add(d); hoseDrops.push(d); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.01, 0.016, 24), new THREE.MeshBasicMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(drainEnd.x, 0.025, drainEnd.z); scene.add(ring);
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), new THREE.MeshPhysicalMaterial({ color: 0x9fb8c4, roughness: 0.05, transparent: true, opacity: 0.55 }));
  puddle.rotation.x = -Math.PI / 2; puddle.position.set(drainEnd.x + 0.02, 0.022, drainEnd.z); puddle.scale.set(1.3, 0.8, 1); scene.add(puddle);

  // ---- labels
  const anchors = {
    temp: [tempAt, new THREE.Vector3(0.06, 0.1, 0.05)], warm: [scene, new THREE.Vector3(-0.45, 2.1, -0.45)], fan: [fan, new THREE.Vector3(0.08, 0.12, 0)],
    cap: [capOld, new THREE.Vector3(0, 0.12, 0)], high: [needleH, new THREE.Vector3(0, 0, 0)], newcap: [capNew, new THREE.Vector3(0, 0.12, 0)],
    spin: [fan, new THREE.Vector3(0.08, 0.18, 0)], ok: [needleH, new THREE.Vector3(0, 0, 0)], coil: [indoor, new THREE.Vector3(0.1, 0.22, DEPTH)],
    pan: [indoor, new THREE.Vector3(0.06, 0.08, DEPTH)], drain: [scene, new THREE.Vector3(0.38, 0.8, -0.16)], cool: [scene, new THREE.Vector3(-0.85, 1.75, -0.45)],
  };
  const labels = LABELS.map(([id, he, en]) => {
    const el = document.createElement('span'); el.className = 'l3d l3d-' + id; el.innerHTML = `<span lang="he">${he}</span><span lang="en">${en}</span>`;
    el.style.opacity = 0; labelsHost.appendChild(el);
    return { id, el, obj: anchors[id][0], v: anchors[id][1] };
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

  let P = 0, inView = false, raf = 0, last = 0, w = 0, h = 0, paused = false, moved = 0, fanAngle = 0, xAngle = 0, clock = 1.3;
  const calmOpt = (opts && opts.calm) || (() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const calm = () => !!window.__calm3d || calmOpt();
  function resize() {
    const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const ref = 16 / 11, base = 40 * Math.PI / 180;
    camera.fov = camera.aspect >= ref ? 40 : Math.min(70, 2 * Math.atan(Math.tan(base / 2) * ref / camera.aspect) * 180 / Math.PI);
    camera.updateProjectionMatrix();
    if (typeof kick === 'function') kick();
  }
  new ResizeObserver(resize).observe(host); resize();

  const v = new THREE.Vector3(), louvreOut = new THREE.Vector3(-0.27 + 0.03, 2.2 + 0.0, 0);
  const hotGlow = new THREE.Color(0x8a1d00), none = new THREE.Color(0), frost = new THREE.Color(0x0b3d66);
  const coilWarm = new THREE.Color(0xb7bcbf), coilCold = new THREE.Color(0xdff3ff);
  function frame(ts) {
    raf = 0; if (!inView) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
    const p = P, motion = !calm();
    if (motion) clock += dt;
    const tm = clock;

    // sky & window cool down at the end (the sun stays; the room is what changes)
    const k = smooth(span(p, 0.84, 0.97));
    scene.background.copy(SKY_HOT).lerp(SKY_COOL, k);
    win.material.emissiveIntensity = lerp(0.6, 0.25, k);

    // thermometer
    const temp = T.roomTemp(p);
    const colH = 0.04 + (temp - 15) / 25 * 0.46; column.scale.y = colH; column.position.y = -0.24 + colH / 2;
    tempAt.position.set(0, -0.24 + colH, 0);

    // outdoor: fan, capacitor, cover, compressor heat
    const fs = T.fan(p);
    if (motion) fanAngle += dt * fs * 26; else fanAngle = fs * 0.6;
    fan.rotation.x = fanAngle;
    const cv = T.cover(p);
    cover.position.y = coverY + cv * 0.32; cover.position.x = 0.66 + cv * 0.35; cover.rotation.z = -cv * 0.25;
    const oc = T.oldCap(p), nc = T.newCap(p);
    capOld.visible = oc < 1; capOld.position.y = 1.79 + oc * 0.45; capOld.position.x = 0.67 + oc * 0.25;
    capNew.visible = p > 0.395; capNew.position.y = 1.79 + nc * 0.45; capNew.position.x = 0.67 + nc * 0.25;
    const fault = p < 0.5 ? 1 : 1 - smooth(span(p, 0.52, 0.62));
    const overheat = fault * smooth(span(p, 0.02, 0.12)) * (p < 0.5 ? 1 - smooth(span(p, 0.33, 0.38)) : 0);
    M.comp.emissive.copy(none).lerp(hotGlow, overheat * 0.55);
    M.coil.emissive.copy(none).lerp(hotGlow, overheat * 0.35);
    // indoor coil color: warm grey → frost
    const cold = T.cold(p);
    M.coilIn.color.copy(coilWarm).lerp(coilCold, cold); M.coilIn.emissive.copy(none).lerp(frost, cold * 0.5);
    if (motion) xAngle += dt * 12; xfan.rotation.z = xAngle;
    louvre.rotation.z = -0.5 - 0.25 * Math.sin(tm * 0.6) * (motion ? 1 : 0);

    // gauges
    const ga = T.gauges(p);
    mani.visible = hoseL.visible = hoseH.visible = ga > 0.001;
    if (mani.visible) {
      mani.position.copy(MANI_AWAY).lerp(MANI_HOME, ga);
      mani.rotation.y = 0.5;
      const jitter = motion && fs < 0.5 ? Math.sin(tm * 23) * 0.4 : 0;
      needleH.rotation.z = gH.ang(T.high(p) + jitter); needleL.rotation.z = gL.ang(T.low(p));
      mani.updateMatrixWorld(true);
      hoseGeo(hoseL, needleL.parent.localToWorld(new THREE.Vector3(0, -0.06, 0)), new THREE.Vector3(0.62, 1.4, -0.0));
      hoseGeo(hoseH, needleH.parent.localToWorld(new THREE.Vector3(0, -0.06, 0)), new THREE.Vector3(0.6, 1.47, -0.0));
    }

    // air particles: they leave the louvre, spread and sink into the room
    const warm = 1 - smooth(span(p, 0.6, 0.86));
    const blowing = 1;
    for (let i = 0; i < N; i++) {
      const s = seeds[i], life = 2.4 + s[0] * 1.2, t = ((tm * 0.9 + s[1] * life) % life) / life;
      const z = -0.9 + s[2] * 0.85;
      const vx = -(0.9 + s[3] * 0.9) * blowing, sink = 0.55 + s[0] * 0.5;
      const x = louvreOut.x + vx * t * 1.6 + Math.sin(t * 6 + s[3] * 9) * 0.03;
      const y = louvreOut.y - 0.05 - sink * t * t * 1.4 - t * 0.2;
      airPos[i * 3] = x; airPos[i * 3 + 1] = Math.max(0.05, y); airPos[i * 3 + 2] = z;
      const c = HOT.clone().lerp(COLD, 1 - warm);
      const fade = 1 - t;
      airCol[i * 3] = c.r * fade + 0.95 * (1 - fade); airCol[i * 3 + 1] = c.g * fade + 0.92 * (1 - fade); airCol[i * 3 + 2] = c.b * fade + 0.88 * (1 - fade);
    }
    airGeo.attributes.position.needsUpdate = true; airGeo.attributes.color.needsUpdate = true;
    air.visible = true;

    // heat rising off the condenser while its fan is dead
    heat.visible = overheat > 0.05;
    for (let i = 0; i < HN; i++) {
      const s = seeds[i], t = ((tm * 0.5 + s[1]) % 1);
      heatPos[i * 3] = OX0 + 0.05 + s[0] * 0.3 + Math.sin(t * 8 + i) * 0.02; heatPos[i * 3 + 1] = OY1 + t * 0.5; heatPos[i * 3 + 2] = OZ0 + 0.05 + s[2] * 0.8;
    }
    heatGeo.attributes.position.needsUpdate = true; heat.material.opacity = 0.6 * overheat;

    // condensate: forms once the coil is cold; drops fall from the coil's low edge into the pan,
    // the pan fills a little and drains; at the hose end a drop swells, falls, splashes, the puddle spreads
    const dr = cold;
    panWater.scale.y = Math.max(0.01, dr);
    drops.forEach((d, i) => {
      d.visible = dr > 0.3;
      const t = ((tm * 0.8 + i / 5) % 1);
      d.position.set(indoor.position.x + 0.05, indoor.position.y + 0.12 - t * t * 0.03, indoor.position.z + 0.1 + i * 0.17);
    });
    const hd = span(p, 0.7, 0.74);
    hoseDrops.forEach((d, i) => {
      d.visible = hd > 0;
      const t = ((tm * 0.7 + i / 3) % 1);
      const grow = t < 0.45 ? t / 0.45 : 1;
      const fall = t < 0.45 ? 0 : (t - 0.45) / 0.55;
      d.scale.setScalar(0.5 + 0.5 * grow); d.scale.y *= 1 + fall * 0.6;
      d.position.set(drainEnd.x, drainEnd.y - 0.01 - fall * fall * (drainEnd.y - 0.03), drainEnd.z);
      if (fall >= 0.98) d.visible = false;
    });
    const rt = ((tm * 0.7) % (1 / 3)) * 3;
    ring.visible = hd > 0 && motion; ring.scale.setScalar(1 + rt * 3); ring.material.opacity = 0.8 * (1 - rt);
    puddle.visible = hd > 0; puddle.scale.set(1.3 * (0.4 + 0.6 * span(p, 0.7, 0.86)), 0.8 * (0.4 + 0.6 * span(p, 0.7, 0.86)), 1);

    // camera
    const [lp, lt] = camAt(p);
    camera.position.copy(lp); camera.lookAt(lt);
    scene.updateMatrixWorld();

    const show = {
      temp: (p < 0.13) || (p > 0.86), warm: p > 0.03 && p < 0.14, fan: p > 0.17 && p < 0.23, cap: p > 0.23 && p < 0.37, high: p > 0.27 && p < 0.33,
      newcap: p > 0.43 && p < 0.49, spin: p > 0.53 && p < 0.6, ok: p > 0.6 && p < 0.65, coil: p > 0.68 && p < 0.75, pan: p > 0.69 && p < 0.75,
      drain: p > 0.76 && p < 0.84, cool: p > 0.89,
    };
    labels.forEach((l) => {
      if (l.id === 'temp') l.el.innerHTML = `<span lang="he">${Math.round(temp)}° בחדר</span><span lang="en">${Math.round(temp)}° in the room</span>`;
      v.copy(l.v); l.obj.localToWorld(v); v.project(camera);
      const vis = show[l.id] && v.z < 1 && Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.92;
      l.el.style.opacity = vis ? 1 : 0;
      l.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
    });
    if (window.__acTemp) window.__acTemp(temp);
    renderer.render(scene, camera);
    const idle = (performance.now() - moved) / 1000;
    if (motion && inView && !paused && idle < 4.5) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && inView && !paused) raf = requestAnimationFrame(frame); }
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; last = 0; kick(); }).observe(host);
  return {
    set(p) { if (p !== P) moved = performance.now(); P = p; kick(); },
    redraw: kick,
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; canvas.style.visibility = 'hidden'; labelsHost.style.visibility = 'hidden'; },
    resume() { paused = false; canvas.style.visibility = ''; labelsHost.style.visibility = ''; last = 0; moved = performance.now(); kick(); },
  };
}
