// A cutaway of a laptop's base: the keyboard deck lifts away to show the cooler (die, cold plate, heat pipe,
// fin stack) and the blower fan. The page's scroll position (0..1) drives every part. Units are centimetres.
// Story: under load the CPU climbs to 97 °C and throttles → inside, a felt of dust covers the fins' intake face
// and the air backs up → the fan's worn bearing makes the impeller wobble → the old fan comes out, the dust mat
// is lifted off the fins, a new fan goes in → the cooler lifts, the dried paste is wiped off, a pea of fresh paste
// spreads under the plate's pressure → closed again, the air streams out of the vent and the temperature falls.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

export const STAGES = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1];
const T = {
  deck: (p) => (p < 0.5 ? smooth(span(p, 0.165, 0.225)) : 1 - smooth(span(p, 0.93, 0.97))),
  screws: (p) => (p < 0.58 ? smooth(span(p, 0.505, 0.53)) : 1 - smooth(span(p, 0.625, 0.65))),
  oldOut: (p) => smooth(span(p, 0.533, 0.565)),
  dust: (p) => smooth(span(p, 0.567, 0.592)),
  newIn: (p) => smooth(span(p, 0.595, 0.623)),
  cooler: (p) => (p < 0.75 ? smooth(span(p, 0.67, 0.69)) : 1 - smooth(span(p, 0.775, 0.805))),
  wipe: (p) => span(p, 0.695, 0.73),
  pea: (p) => smooth(span(p, 0.735, 0.755)),
  spread: (p) => smooth(span(p, 0.785, 0.805)),
};
// fan speed in rpm and how much of the air gets through the fins (shared with the page's readout)
function fanState(p) {
  if (p < 0.5) return { rpm: 5200, flow: 0.18, wobble: 1, old: true };
  if (p < 0.83) return { rpm: 0, flow: 0, wobble: 0, old: false };
  return { rpm: 3100 * smooth(span(p, 0.86, 0.9)), flow: 1, wobble: 0, old: false };
}
function heat(p) {           // 0 = cold, 1 = 97 °C
  if (p < 0.5) return lerp(0.55, 1, smooth(span(p, 0, 0.12)));
  if (p < 0.83) return lerp(1, 0, smooth(span(p, 0.5, 0.56)));
  return lerp(0.35, 0.3, span(p, 0.9, 1)) + 0.65 * (1 - smooth(span(p, 0.86, 0.97))) * 0.0;
}

const KEYS = [
  [0.00, [5, 30, 50], [0, 7, -6]],
  [0.11, [-3, 25, 36], [-3, 5, -6]],
  [0.2, [-1, 15, 9], [-7, 1, -6.5]],
  [0.29, [-3.5, 9.5, 2.5], [-9, 0.8, -8]],
  [0.4, [-6.5, 6.4, -0.2], [-9.5, 0.8, -6.6]],
  [0.48, [-5, 8.5, 2], [-9.3, 1, -7]],
  [0.58, [-2, 13, 6], [-8.5, 2.2, -6.8]],
  [0.68, [6.5, 8.5, 2.5], [3, 1.2, -5]],
  [0.77, [5.2, 5.6, -0.6], [3, 0.8, -5]],
  [0.86, [-14, 14, 4], [-8, 1.5, -9]],
  [0.93, [-4, 17, 9], [-8, 1, -9.5]],
  [1.00, [5, 30, 50], [0, 7, -6]],
];

const LABELS = [
  ['screen', 'המסך: טמפרטורה ותדר המעבד', 'The screen: CPU temperature and clock'],
  ['dust', 'שכבת אבק חוסמת את הצלעות', 'A mat of dust blocks the fins'],
  ['cpu', 'המעבד מתחמם', 'The CPU heats up'],
  ['bearing', 'מסב שחוק: המאוורר מתנדנד', 'Worn bearing: the fan wobbles'],
  ['pipe', 'צינור חום', 'Heat pipe'],
  ['oldfan', 'המאוורר הישן יוצא', 'The old fan comes out'],
  ['newfan', 'מאוורר חדש', 'A new fan'],
  ['oldpaste', 'משחה טרמית יבשה', 'Dried thermal paste'],
  ['newpaste', 'משחה חדשה מתפזרת בלחץ', 'Fresh paste spreads under pressure'],
  ['flow', 'האוויר יוצא חופשי', 'The air flows out freely'],
];

function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

export function initPc3D(host, labelsHost, opts) {
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
  scene.background = new THREE.Color(0xe9ecea);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.75;
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);
  const R = rng(7);

  // ---- textures drawn on canvases: the board's solder mask and traces, the keyboard, the screen
  function pcbTexture() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#145a3a'; g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = '#1f7a4f'; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      let x = R() * 1024, y = R() * 512; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 3; k++) { if (R() < 0.5) x += (R() - 0.5) * 360; else y += (R() - 0.5) * 240; g.lineTo(x, y); const d = (R() - 0.5) * 60; x += d; y += Math.abs(d) * (R() < 0.5 ? -1 : 1); g.lineTo(x, y); }
      g.stroke();
    }
    g.fillStyle = '#c9b37a';
    for (let i = 0; i < 160; i++) { g.beginPath(); g.arc(R() * 1024, R() * 512, 3.2, 0, TAU); g.fill(); }
    g.fillStyle = '#e8efe9'; g.font = '600 20px sans-serif';
    ['C504', 'R311', 'U12', 'Q7', 'L3', 'FAN1', 'J2'].forEach((t) => g.fillText(t, R() * 960, 20 + R() * 480));
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  const screenC = document.createElement('canvas'); screenC.width = 512; screenC.height = 320;
  const screenT = new THREE.CanvasTexture(screenC); screenT.colorSpace = THREE.SRGBColorSpace;
  let screenKey = '';
  function drawScreen(p) {
    const r = (window.__pcRead && window.__pcRead(p)) || { t: 0, ghz: 0, off: true };
    const key = r.off ? 'off' : r.t + '|' + r.ghz; if (key === screenKey) return; screenKey = key;
    const g = screenC.getContext('2d');
    g.fillStyle = r.off ? '#05070a' : '#0b1512'; g.fillRect(0, 0, 512, 320);
    if (r.off) { screenT.needsUpdate = true; return; }
    const hot = r.t >= 90;
    g.fillStyle = hot ? '#ff6a3d' : '#a1ffcb'; g.font = '700 120px sans-serif'; g.textAlign = 'center';
    g.fillText(r.t + '°C', 256, 170);
    g.fillStyle = '#e8efe9'; g.font = '500 44px sans-serif';
    g.fillText('CPU ' + r.ghz.toFixed(1) + ' GHz', 256, 245);
    g.fillStyle = hot ? '#ff6a3d' : '#a1ffcb'; g.fillRect(56, 276, 400 * Math.min(1, r.t / 100), 14);
    screenT.needsUpdate = true;
  }

  const metal = (color, rough, extra) => new THREE.MeshPhysicalMaterial(Object.assign({ color, metalness: 1, roughness: rough }, extra || {}));
  const plastic = (color, rough, extra) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0 }, extra || {}));
  const M = {
    shell: plastic(0x2a2e33, 0.55),
    deck: plastic(0xb9bec4, 0.45, { metalness: 0.4, transparent: true }),
    key: plastic(0x1d2024, 0.6, { transparent: true }),
    pcb: new THREE.MeshStandardMaterial({ map: pcbTexture(), roughness: 0.45, metalness: 0.05 }),
    battery: plastic(0x16181b, 0.7),
    copper: metal(0xd48a5a, 0.28),
    fin: metal(0xc9cdd1, 0.32),
    steel: metal(0xb7bcc1, 0.3),
    fanBlack: plastic(0x141619, 0.5, { side: THREE.DoubleSide }),
    bladeOld: plastic(0x4b4843, 0.9, { side: THREE.DoubleSide }),
    bladeNew: plastic(0x0e1012, 0.35, { side: THREE.DoubleSide }),
    die: new THREE.MeshPhysicalMaterial({ color: 0x5a6068, metalness: 0.6, roughness: 0.25, emissive: 0x000000 }),
    substrate: plastic(0x1d5a3a, 0.5),
    dust: plastic(0x7a746b, 1, { flatShading: false }),
    pasteOld: plastic(0x6f747a, 0.95),
    pasteNew: plastic(0xd9dde0, 0.35),
    screen: new THREE.MeshBasicMaterial({ map: screenT, toneMapped: false }),
    swab: plastic(0xf3f0ea, 0.9),
    stick: plastic(0x2b6cb0, 0.5),
    syringe: plastic(0xdfe6ea, 0.2, { transparent: true, opacity: 0.85 }),
  };

  scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x3a3f44, 0.55));
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.3); sun.position.set(12, 30, 16); sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 18, bottom: -18, near: 1, far: 80 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd8f5e6, 0.7); fill.position.set(-16, 10, -10); scene.add(fill);

  const box = (mat, x0, x1, y0, y1, z0, z1, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true;
    (parent || scene).add(m); return m;
  };

  // ---------------------------------------------------------------- the bench and the base shell
  const bench = box(plastic(0xdfe3e0, 0.85), -40, 40, -0.6, 0, -40, 40); bench.castShadow = false;
  box(M.shell, -17, 17, 0, 0.3, -12, 12);
  box(M.shell, -17, 17, 0.3, 1.9, 11.7, 12); box(M.shell, -17, -16.7, 0.3, 1.9, -12, 12); box(M.shell, 16.7, 17, 0.3, 1.9, -12, 12);
  // the back wall has the exhaust vent behind the fins (x -13 .. -6)
  box(M.shell, -16.7, -13.1, 0.3, 1.9, -12, -11.7); box(M.shell, -5.9, 16.7, 0.3, 1.9, -12, -11.7);
  box(M.shell, -13.1, -5.9, 1.55, 1.9, -12, -11.7); box(M.shell, -13.1, -5.9, 0.3, 0.55, -12, -11.7);
  for (let x = -12.6; x < -6; x += 1.1) box(M.shell, x, x + 0.18, 0.55, 1.55, -12, -11.7);

  // board and battery
  box(M.pcb, -16.4, 16.4, 0.3, 0.42, -11.5, -0.6);
  box(M.battery, -14, 14, 0.3, 1.35, 0.6, 11.2);
  box(plastic(0x2c3036, 0.6), -10, -3, 1.35, 1.36, 3, 8);
  // a few parts on the board
  [[6, -9], [9, -3], [12, -8], [-2, -2.5], [14, -4]].forEach(([x, z], i) => box(i % 2 ? M.battery : M.steel, x - 0.7, x + 0.7, 0.42, 0.7, z - 0.5, z + 0.5));
  box(M.steel, 10, 15, 0.42, 1.1, -11.4, -9.4);           // ports
  box(plastic(0x0e1a14, 0.4), 7, 13, 0.42, 0.55, -7, -4.5);  // a memory module

  // ---------------------------------------------------------------- CPU and the cooler
  const CPU = new THREE.Vector3(3, 0, -5);
  box(M.substrate, CPU.x - 1.9, CPU.x + 1.9, 0.42, 0.52, CPU.z - 1.9, CPU.z + 1.9);
  const die = box(M.die, CPU.x - 0.9, CPU.x + 0.9, 0.52, 0.6, CPU.z - 0.65, CPU.z + 0.65);
  // dried paste: irregular cracked flakes on the die
  const flakes = [];
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Shape(); const n = 7, rr = 0.14 + R() * 0.08;
    for (let k = 0; k < n; k++) { const a = k / n * TAU, r = rr * (0.6 + R() * 0.6); k ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, M.pasteOld); m.position.set(CPU.x - 0.6 + (i % 3) * 0.6, 0.6, CPU.z - 0.38 + Math.floor(i / 3) * 0.38); m.rotation.y = R() * TAU;
    m.userData.x = m.position.x; scene.add(m); flakes.push(m);
  }
  // fresh paste: a pea that flattens to a disc when the plate comes down (volume kept)
  const pea = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 16), M.pasteNew); pea.position.set(CPU.x, 0.6, CPU.z); scene.add(pea);
  // swab and syringe
  const swab = new THREE.Group(); scene.add(swab);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6, 12), M.stick); stick.position.y = 3; swab.add(stick);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), M.swab); tip.scale.set(1, 1.6, 1); tip.position.y = 0.3; swab.add(tip);
  swab.rotation.z = 0.5;
  const syringe = new THREE.Group(); scene.add(syringe);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 5, 24), M.syringe); barrel.position.y = 3.4; syringe.add(barrel);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.8, 16), M.syringe); nozzle.position.y = 0.5; syringe.add(nozzle);
  const plunge = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 3, 16), M.pasteNew); plunge.position.y = 4.4; syringe.add(plunge);

  const cooler = new THREE.Group(); scene.add(cooler);
  box(M.copper, CPU.x - 1.6, CPU.x + 1.6, 0.66, 0.9, CPU.z - 1.6, CPU.z + 1.6, cooler);    // cold plate
  // spring bracket with four screws
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
    const arm = box(M.steel, -0.25, 0.25, 0.9, 0.98, 0, 2.6, cooler);
    arm.position.set(CPU.x + sx * 1.3, 0.94, CPU.z + sz * 1.3); arm.rotation.y = Math.atan2(sx, sz);
    arm.translateZ(1.1);
    const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), M.steel); sc.position.set(CPU.x + sx * 2.9, 1.05, CPU.z + sz * 2.9); cooler.add(sc);
  });
  // heat pipe: from the plate to the fins, flattened
  const pipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(CPU.x + 1.2, 0.98, CPU.z + 0.2), new THREE.Vector3(CPU.x - 1.6, 0.98, CPU.z - 0.4),
    new THREE.Vector3(-3, 1.0, -8.2), new THREE.Vector3(-6.3, 1.0, -9.25), new THREE.Vector3(-13.2, 1.0, -9.25)]);
  const pipe = new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 80, 0.32, 16, false), M.copper); pipe.scale.y = 1; pipe.castShadow = true; cooler.add(pipe);
  // fin stack in front of the vent
  const FIN_N = 42, fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, 1.15, 2.1), M.fin, FIN_N);
  const mm = new THREE.Matrix4();
  for (let i = 0; i < FIN_N; i++) { mm.makeTranslation(-13 + i * (7 / (FIN_N - 1)), 1.0, -10.55); fins.setMatrixAt(i, mm); }
  fins.castShadow = true; cooler.add(fins);
  box(M.fin, -13.1, -5.9, 1.56, 1.6, -11.6, -9.5, cooler);

  // the dust mat on the fins' intake face: an irregular felt of flattened lumps and loose fibres
  const dust = new THREE.Group(); scene.add(dust);
  const lumpG = new THREE.IcosahedronGeometry(1, 2);
  const pos = lumpG.attributes.position;
  for (let i = 0; i < pos.count; i++) { const k = 0.85 + R() * 0.3; pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k); }
  lumpG.computeVertexNormals();
  for (let i = 0; i < 70; i++) {
    const m = new THREE.Mesh(lumpG, M.dust);
    const x = -12.8 + R() * 6.6, y = 0.6 + R() * 0.95;
    m.position.set(x, y, -9.32 + R() * 0.08); m.scale.set(0.45 + R() * 0.4, 0.22 + R() * 0.18, 0.07 + R() * 0.05); m.rotation.set(0, 0, (R() - 0.5) * 0.8);
    m.castShadow = true; dust.add(m);
  }
  for (let i = 0; i < 24; i++) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5 + R() * 0.7, 4), M.dust);
    f.position.set(-12.8 + R() * 6.6, 0.4 + R() * 1.3, -9.2); f.rotation.set(R() * 3, 0, R() * 3); dust.add(f);
  }

  // ---------------------------------------------------------------- blower fans (old: dusty, worn bearing; new: clean)
  const FAN = new THREE.Vector3(-9.5, 0.42, -5.9);
  function makeFan(bladeMat) {
    const g = new THREE.Group(); g.position.copy(FAN);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(3.25, 3.25, 1.3, 64, 1, true, Math.PI * 0.12, Math.PI * 1.55), M.fanBlack);
    wall.position.y = 0.67; wall.rotation.y = Math.PI; wall.castShadow = true; g.add(wall);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(3.25, 48), M.fanBlack); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.04; g.add(floor);
    // the cover over the far half only, so the impeller shows (cutaway)
    const cover = new THREE.Mesh(new THREE.RingGeometry(1.55, 3.3, 48, 1, Math.PI * 0.05, Math.PI * 0.9), M.fanBlack); cover.rotation.x = -Math.PI / 2; cover.position.y = 1.33; g.add(cover);
    // the outlet duct to the fins
    box(M.fanBlack, -3.6, 3.5, 0.04, 0.1, -3.4, -2.6, g); box(M.fanBlack, -3.6, -3.5, 0.04, 1.33, -3.4, -1.0, g);
    const ears = [[2.9, 2.2], [-3.2, 2.0], [2.6, -2.8]];
    ears.forEach(([x, z]) => { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 20), M.fanBlack); e.position.set(x, 0.1, z); g.add(e); });
    const rot = new THREE.Group(); rot.position.y = 0.1; g.add(rot);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.05, 32), bladeMat); hub.position.y = 0.55; rot.add(hub);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), M.steel); cap.rotation.x = -Math.PI / 2; cap.position.y = 1.08; rot.add(cap);
    const bladeG = new THREE.BoxGeometry(1.65, 1.0, 0.05); bladeG.translate(0.82, 0.55, 0);
    for (let i = 0; i < 31; i++) { const b = new THREE.Mesh(bladeG, bladeMat); b.position.set(Math.cos(i / 31 * TAU) * 0.9, 0, Math.sin(i / 31 * TAU) * 0.9); b.rotation.y = -i / 31 * TAU - 0.5; rot.add(b); }
    g.userData.rot = rot; g.userData.ears = ears;
    return g;
  }
  const oldFan = makeFan(M.bladeOld), newFan = makeFan(M.bladeNew);
  scene.add(oldFan); scene.add(newFan);
  // grey fluff caught on the old impeller's blade tips
  for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(lumpG, M.dust); const a = R() * TAU; m.position.set(Math.cos(a) * 2.55, 0.4 + R() * 0.7, Math.sin(a) * 2.55); m.scale.set(0.2, 0.12, 0.2); oldFan.userData.rot.add(m); }
  const screws = oldFan.userData.ears.map(([x, z]) => {
    const s = new THREE.Group(); const head = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 6), M.steel); head.position.y = 0.07; s.add(head);
    const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8), M.steel); shank.position.y = -0.3; s.add(shank);
    s.userData.x = FAN.x + x; s.userData.z = FAN.z + z; scene.add(s); return s;
  });

  // ---------------------------------------------------------------- the keyboard deck and the lid
  const deck = new THREE.Group(); scene.add(deck);
  box(M.deck, -17, 17, 1.9, 2.1, -12, 12, deck);
  const keyG = new THREE.BoxGeometry(1.55, 0.18, 1.45);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) { const k = new THREE.Mesh(keyG, M.key); k.position.set(-14 + c * 2, 2.18, -9.5 + r * 1.85); deck.add(k); }
  box(M.key, -6, 6, 2.1, 2.27, -0.2 + 0.4, 1.4 + 0.4, deck);
  box(plastic(0xa9aeb4, 0.4, { metalness: 0.4, transparent: true }), -5.5, 5.5, 2.1, 2.12, 3.5, 10, deck); // touchpad
  const lid = new THREE.Group(); lid.position.set(0, 2.1, -12); scene.add(lid);
  const lidBody = box(M.shell, -17, 17, 0, 23, -0.6, 0, lid);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(31, 19.5), M.screen); scr.position.set(0, 11.8, 0.01); lid.add(scr);
  lid.rotation.x = -0.32;

  // ---------------------------------------------------------------- air: points pushed by the fan
  const AIR = 220, airPos = new Float32Array(AIR * 3), air = [];
  for (let i = 0; i < AIR; i++) air.push({ t: R(), a: R() * TAU, y: 0.6 + R() * 0.9, x: R(), stuck: R() });
  const airG = new THREE.BufferGeometry(); airG.setAttribute('position', new THREE.BufferAttribute(airPos, 3));
  const airM = new THREE.PointsMaterial({ color: 0x43c98a, size: 0.12, transparent: true, opacity: 0.85, depthWrite: false });
  const airPts = new THREE.Points(airG, airM); scene.add(airPts);
  function airStep(dt, fs, motion) {
    const speed = fs.rpm / 5200;
    for (let i = 0; i < AIR; i++) {
      const q = air[i];
      if (motion) q.t += dt * speed * 0.55;
      if (q.t > 1) { q.t -= 1; q.x = R(); q.stuck = R(); }
      let x, y = q.y, z, t = q.t;
      const pass = q.stuck < fs.flow;
      if (t < 0.45) {                           // spiral from the intake out to the rim
        const u = t / 0.45, a = q.a + u * 5, r = 0.9 + u * 2.2;
        x = FAN.x + Math.cos(a) * r; z = FAN.z + Math.sin(a) * r; y = 1.6 - u * 0.9 + q.y * 0.3 * u;
      } else {                                   // down the duct into the fins
        const u = (t - 0.45) / 0.55, xs = -12.8 + q.x * 6.6;
        const zEnd = pass ? -14.5 : -9.25;
        const k = pass ? u : Math.min(1, u * 1.6);
        x = xs; z = lerp(-8.6, zEnd, k);
        if (!pass && u > 0.62) { const b = (u - 0.62) / 0.38; z = -9.25 + b * 1.4; y = q.y + Math.sin(b * 6 + i) * 0.15; }   // backs up and swirls
      }
      airPos[i * 3] = x; airPos[i * 3 + 1] = y; airPos[i * 3 + 2] = z;
    }
    airG.attributes.position.needsUpdate = true;
  }

  // ---------------------------------------------------------------- labels projected into the page
  const anchors = {
    screen: [lid, [11, 2.2, 0.3]], dust: [dust, [-9.5, 1.7, -9.2]], cpu: [scene, [CPU.x, 0.9, CPU.z + 1.8]],
    bearing: [oldFan, [0.0, 1.4, 0.0]], pipe: [cooler, [-2.6, 1.3, -8.0]], oldfan: [oldFan, [0, 1.5, 0]], newfan: [newFan, [0.4, 1.4, 1.6]],
    oldpaste: [scene, [CPU.x - 0.4, 0.65, CPU.z + 0.2]], newpaste: [scene, [CPU.x + 0.3, 0.7, CPU.z + 0.4]], flow: [scene, [-9.5, 1.8, -13.2]],
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

  let P = 0, inView = false, raf = 0, last = 0, w = 0, h = 0, paused = false, moved = 0, angOld = 0, angNew = 0;
  const calmOpt = (opts && opts.calm) || (() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const calm = () => !!window.__calm3d || calmOpt();
  function resize() {
    const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const ref = 16 / 11, base = 38 * Math.PI / 180;
    camera.fov = camera.aspect >= ref ? 38 : Math.min(68, 2 * Math.atan(Math.tan(base / 2) * ref / camera.aspect) * 180 / Math.PI);
    camera.updateProjectionMatrix();
    if (typeof kick === 'function') kick();
  }
  new ResizeObserver(resize).observe(host); resize();

  const v = new THREE.Vector3(), hot = new THREE.Color(0xff4a1c);
  function frame(ts) {
    raf = 0; if (!inView) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
    const p = P, motion = !calm(), tm = ts / 1000;

    // deck lifts straight up and away, keys fade with it
    const d = T.deck(p);
    deck.position.set(0, d * 16, -d * 4); M.deck.opacity = 1 - d * 0.9; M.key.opacity = 1 - d * 0.9; deck.visible = d < 0.98;
    lid.visible = d < 0.98; lid.rotation.x = -0.32 - d * 0.5;
    drawScreen(p);

    // fans: the old one wobbles on its worn bearing while it runs, then is unscrewed and lifted out; the new one drops in
    const fs = fanState(p);
    const sOut = T.screws(p);
    screws.forEach((s, i) => { s.position.set(s.userData.x, 0.55 + sOut * 1.4, s.userData.z); s.rotation.y = sOut * 8 * TAU + i; s.visible = p < 0.565 || p > 0.6; });
    const out = T.oldOut(p);
    oldFan.visible = out < 1; oldFan.position.set(FAN.x - out * 3, FAN.y + out * 9, FAN.z + out * 5);
    const inn = T.newIn(p);
    newFan.visible = p > 0.59; newFan.position.set(FAN.x + (1 - inn) * 3, FAN.y + (1 - inn) * 9, FAN.z + (1 - inn) * 5);
    const omega = fs.rpm / 60 * TAU * 0.02;          // shown slowed down so the blades stay readable
    if (motion) { if (fs.old) angOld += dt * omega; else angNew += dt * omega; }
    else { angOld = 0.3; angNew = p > 0.9 ? 0.6 : 0; }
    oldFan.userData.rot.rotation.set(0, angOld, 0);
    if (fs.wobble && p < 0.5) {          // the worn bearing lets the axis precess
      const wob = (motion ? 0.06 : 0.05) * (p > 0.33 ? 1.4 : 1);
      oldFan.userData.rot.rotation.x = Math.sin(motion ? tm * 9 : 0.8) * wob; oldFan.userData.rot.rotation.z = Math.cos(motion ? tm * 9 : 0.8) * wob;
    }
    newFan.userData.rot.rotation.y = angNew;

    // dust mat lifted off the fins in one piece
    const du = T.dust(p);
    dust.visible = du < 1; dust.position.set(-du * 2, du * 8, du * 3); dust.rotation.x = -du * 0.6;

    // cooler up, old paste wiped off by the swab, pea of new paste, cooler down and the pea spreads
    const cu = T.cooler(p);
    cooler.position.y = cu * 3.2; cooler.rotation.z = cu * 0.05;
    const wp = T.wipe(p);
    swab.visible = p > 0.69 && p < 0.735;
    const sweep = Math.sin(wp * Math.PI * 3);
    swab.position.set(CPU.x - sweep * 0.9, 0.62, CPU.z + (wp - 0.5) * 0.8);
    flakes.forEach((f, i) => { const gone = wp > (i + 1) / (flakes.length + 1); f.visible = !gone; });
    const pe = T.pea(p), sp = T.spread(p);
    pea.visible = pe > 0.02;
    const rr = lerp(1, 2.6, sp), hh = 1 / (rr * rr);     // radius grows as height flattens (volume conserved)
    pea.scale.set(pe * rr, pe * hh * 0.6, pe * rr * 0.8); pea.position.y = 0.6 + 0.08 * (1 - sp) * pe;
    syringe.visible = p > 0.73 && p < 0.765;
    syringe.position.set(CPU.x, 0.9 + (1 - span(p, 0.73, 0.745)) * 2 + span(p, 0.755, 0.765) * 4, CPU.z);
    plunge.position.y = 4.4 - pe * 0.6;

    // heat: the die glows, the air colour follows
    const ht = heat(p);
    M.die.emissive.copy(hot).multiplyScalar(Math.max(0, ht - 0.5) * 1.6);
    airPts.visible = fs.rpm > 50 && d > 0.5 || (p > 0.83 && fs.rpm > 50);
    airM.color.setHex(p < 0.5 ? 0xd28b4a : 0x43c98a);
    airStep(dt, fs, motion);

    const [cp, ct] = camAt(p);
    camera.position.copy(cp); camera.lookAt(ct);
    scene.updateMatrixWorld();

    const show = {
      screen: p < 0.14 || p > 0.985, dust: p > 0.215 && p < 0.33, cpu: p > 0.24 && p < 0.31, bearing: p > 0.35 && p < 0.49, pipe: p > 0.38 && p < 0.45,
      oldfan: p > 0.535 && p < 0.56, newfan: p > 0.61 && p < 0.66, oldpaste: p > 0.685 && p < 0.72, newpaste: p > 0.74 && p < 0.825, flow: p > 0.87 && p < 0.93,
    };
    labels.forEach((l) => {
      v.copy(l.v); l.obj.localToWorld(v); v.project(camera);
      const vis = show[l.id] && v.z < 1 && Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.92;
      l.el.style.opacity = vis ? 1 : 0;
      const lx = Math.max(10, Math.min((v.x + 1) / 2 * w, w - (l.el.offsetWidth || 0) + 2)); // stays inside narrow stages
      l.el.style.transform = `translate(${lx.toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
    });
    renderer.render(scene, camera);
    const idle = (performance.now() - moved) / 1000;
    const live = motion && fs.rpm > 50 && idle < 4;
    if (inView && live && !paused) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && inView && !paused) raf = requestAnimationFrame(frame); }
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; last = 0; kick(); }).observe(host);
  return {
    set(p) { if (p !== P) moved = performance.now(); P = p; kick(); },
    redraw: kick,
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; canvas.style.visibility = 'hidden'; labelsHost.style.visibility = 'hidden'; },
    resume() { paused = false; canvas.style.visibility = ''; labelsHost.style.visibility = ''; last = 0; kick(); },
  };
}
