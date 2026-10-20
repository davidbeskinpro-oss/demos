// A cutaway of a multi-bolt steel door and its pin-tumbler cylinder, sectioned through the key's axis.
// The page's scroll position (0..1) drives every part. Units are centimetres.
// Story (six stages, one sixth of the scroll each):
//  1 a worn copy goes into the keyway; the pin stacks ride up and down over its cuts
//  2 it is all the way in, but two cuts are worn too deep: those key pins sit low, their driver pins
//    hang across the shear line and the plug only rocks against them
//  3 the worn key comes out; beside it, a key cut to the right depths; the worn-away metal shows red
//  4 the new key goes in; every stack lifts as its cut passes under it
//  5 every gap between key pin and driver pin lies on the shear line
//  6 the plug turns, its cam turns the gear, the rack pushes three bolts into the frame
// Textures: Poly Haven (CC0).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

// ---- the cylinder, in its own section coordinates: s along the key (0 = front face), y up, z out of the cut
const R = 0.6;                         // plug radius = the shear line
const PINS = [0.45, 0.9, 1.35, 1.8, 2.25];
const LIP = -0.05;                     // where a key pin rests when nothing lifts it
const TOP0 = 0.18;                     // the uncut top of the blade
const CHAMBER = 1.62, DRIVER = 0.4, BLADE = 2.62;
const BITS = [0.02, 0.1, -0.02, 0.08, 0.04];          // this lock's cut depths (cut bottoms)
const WORN = [0, -0.075, 0, -0.065, 0];               // how much deeper two cuts of the old copy have worn
const OLD = BITS.map((b, i) => b + WORN[i]);
// the blade's top edge at u (u = 0 at the shoulder): 90° V cuts with a small flat, and a chamfered tip
export function profile(bits, u) {
  if (u < 0 || u > BLADE) return null;
  let h = Math.min(TOP0, -0.12 + (BLADE - u) * 1.1);
  for (let i = 0; i < bits.length; i++) h = Math.min(h, bits[i] + Math.max(0, Math.abs(u - PINS[i]) - 0.035));
  return h;
}

// ---- the shared timeline (the page reads the same stage boundaries for its text)
export const STAGES = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
const OUT = -3.6;                       // where a key sits when it is just out of the keyway
const T = {
  // the worn key: in, jams, out, then aside for the comparison
  oldS: (p) => (p < 0.34 ? lerp(OUT, 0, smooth(span(p, 0.015, 0.14))) : p < 0.38 ? lerp(0, OUT, smooth(span(p, 0.34, 0.38))) : lerp(OUT, -4.3, smooth(span(p, 0.38, 0.405)))),
  oldY: (p) => -0.78 * smooth(span(p, 0.38, 0.41)) - 2.6 * smooth(span(p, 0.49, 0.515)),
  // the new key: lowered in beside the worn one, then down to the keyway and in, slowly
  newS: (p) => (p < 0.5 ? -4.3 : p < 0.535 ? lerp(-4.3, OUT, smooth(span(p, 0.5, 0.535))) : lerp(OUT, 0, smooth(span(p, 0.54, 0.655)))),
  newY: (p) => (p < 0.5 ? lerp(3.4, 1.25, smooth(span(p, 0.385, 0.425))) : lerp(1.25, 0, smooth(span(p, 0.505, 0.535)))),
  turn: (p) => TAU * smooth(span(p, 0.845, 0.975)),
};

// camera keyframes [p, position, target], in the door's own space
const KEYS = [
  [0.00, [7.2, 2.4, 14.0], [-1.0, -0.2, 4.6]],
  [0.07, [6.4, 1.3, 9.2], [0, 0.1, 4.0]],
  [0.14, [6.1, 0.95, 3.6], [0, 0.35, 2.2]],
  [0.24, [4.3, 0.85, 2.45], [0, 0.55, 2.2]],
  [0.31, [4.4, 0.85, 2.5], [0, 0.55, 2.25]],
  [0.37, [6.4, 1.1, 6.2], [0, 0.3, 5.3]],
  [0.43, [6.6, 0.45, 7.9], [0, 0.2, 7.55]],
  [0.5, [6.6, 0.45, 7.8], [0, 0.2, 7.4]],
  [0.56, [6.2, 0.9, 4.9], [0, 0.35, 4.0]],
  [0.62, [4.7, 0.85, 3.0], [0, 0.5, 2.6]],
  [0.68, [4.6, 0.85, 2.3], [0, 0.55, 2.15]],
  [0.77, [4.2, 0.8, 2.3], [0, 0.6, 2.15]],
  [0.84, [5.3, 0.9, 2.0], [0, 0.0, 1.1]],
  [0.885, [4.1, 0.3, 1.25], [0, -0.35, 0.0]],
  [0.935, [3.6, 2.4, 9.6], [-3.6, -0.9, 0.4]],
  [0.97, [-1.5, 1.6, 10.0], [-6.6, -1.0, 0.3]],
  [1.0, [-5.2, 1.3, 9.4], [-7.6, -1.0, 0.0]],
];

const LABELS = [
  ['worn', 'מפתח שחוק', 'A worn key'],
  ['shear', 'קו הגזירה', 'Shear line'], ['spring', 'קפיץ', 'Spring'], ['driver', 'פין עליון', 'Driver pin'], ['keypin', 'פין תחתון', 'Key pin'],
  ['blocked', 'פין עליון חוצה את הקו', 'A driver pin across the line'],
  ['wear', 'המתכת שנשחקה', 'The worn-away metal'], ['fresh', 'מפתח בעומק הנכון', 'A key cut to depth'],
  ['lift', 'כל פין עולה על השן שלו', 'Each pin rides up its cut'],
  ['aligned', 'כל הפינים על הקו', 'Every pin on the line'],
  ['cam', 'הזנב מסובב את גלגל השיניים', 'The cam turns the gear'],
  ['bolts', 'הבריחים נכנסים למשקוף', 'The bolts go into the frame'],
];

export function initLock3D(host, labelsHost, opts) {
  opts = opts || {};
  const base = opts.base || '';
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.remove(); return null; }
  const small = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.bg || 0x111a2b);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.85;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200);

  const loader = new THREE.TextureLoader();
  const tex = (name, rep, color) => {
    const t = loader.load(`${base}tex/${name}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const pbr = (id, rep, extra) => new THREE.MeshStandardMaterial(Object.assign({
    map: tex(`${id}_diff`, rep, true), normalMap: tex(`${id}_nor`, rep), roughnessMap: tex(`${id}_rough`, rep), roughness: 1, metalness: 0,
  }, extra || {}));
  // machined metal: the scanned plate's roughness and normal at a fine repeat give the brass and steel tool marks
  const fineRough = tex('metal_plate_rough', [3, 3]), fineNor = tex('metal_plate_nor', [3, 3]);
  const clipLocal = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.02), clipWorld = new THREE.Plane();
  const metal = (color, rough, extra) => new THREE.MeshPhysicalMaterial(Object.assign({
    color, metalness: 1, roughness: rough, roughnessMap: fineRough, normalMap: fineNor, normalScale: new THREE.Vector2(0.12, 0.12),
  }, extra || {}));
  const M = {
    veneer: pbr('oak_veneer_01', [0.12, 0.12], { color: 0xd2b993 }),
    skin: pbr('metal_plate', [0.15, 0.15], { color: 0x5b6470, metalness: 0.75, roughness: 0.6 }),
    filler: pbr('plastered_wall_04', [0.4, 0.4], { color: 0xb3a684 }),
    frame: pbr('metal_plate', [0.2, 0.2], { color: 0xaab6c6, metalness: 0.5, roughness: 0.5 }),
    wall: pbr('plastered_wall_04', [0.35, 0.35], { color: 0xcfc6b4 }),
    caseSteel: metal(0x8e959c, 0.42),
    zinc: metal(0xa9b0b6, 0.3, { clippingPlanes: [clipWorld] }),
    bolt: metal(0xdfe3e7, 0.18),
    brass: metal(0xd2ad62, 0.28, { side: THREE.DoubleSide }),
    keyPin: metal(0xd9b45e, 0.26),
    driver: metal(0xc3c8cd, 0.26, { emissive: 0x000000 }),
    spring: metal(0xc9ced3, 0.22),
    keyOld: metal(0x9a7c43, 0.55),
    keyNew: metal(0xd3d0c8, 0.22),
    cam: metal(0x7d848b, 0.36),
    wear: new THREE.MeshBasicMaterial({ color: 0xff5a36, transparent: true, opacity: 0.9, depthTest: false }),
    line: new THREE.MeshBasicMaterial({ color: 0xffc95a, transparent: true, opacity: 0.95, depthTest: false }),
  };
  const drv = PINS.map(() => M.driver.clone());

  scene.add(new THREE.HemisphereLight(0xe8eefc, 0x1a1a22, 0.4));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2); key.position.set(14, 18, 20); key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -16, right: 20, top: 12, bottom: -12, near: 1, far: 80 }); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.03;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd2ff, 0.9); rim.position.set(-10, 6, -12); scene.add(rim);
  const lamp = new THREE.PointLight(0xffe7c2, 30, 30, 1.8); lamp.position.set(8, 4, 6); scene.add(lamp);

  const box = (mat, x0, x1, y0, y1, z0, z1, parent) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true;
    (parent || scene).add(m); return m;
  };
  const extrude = (shapes, depth, bevel) => {
    const g = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: 1, curveSegments: 16 });
    g.translate(0, 0, -depth); return g;
  };
  const poly = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; };
  const rect = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);

  // ---------------------------------------------------------------- the frame and wall
  const Y0 = -5, Y1 = 2.4, EDGE = -6.5;
  box(M.wall, -13, -8.8, Y0, Y1, -6, 3.62);
  box(M.frame, -8.8, -6.62, Y0, Y1, -3.5, -0.55);
  box(M.frame, -8.8, -6.62, Y0, -4.1, 0.55, 3.62); box(M.frame, -8.8, -6.62, 2.0, Y1, 0.55, 3.62);
  const BOLT_Y = [1.5, -1.6, -3.3];
  [[Y0, -3.8], [-2.8, -2.1], [-1.1, 1.0], [2.0, Y1]].forEach(([a, b]) => box(M.frame, -8.8, -6.62, a, b, -0.55, 0.55));
  BOLT_Y.forEach((y) => box(M.frame, -8.8, -8.75, y - 0.5, y + 0.5, -0.55, 0.55));

  // ---------------------------------------------------------------- the door, cut through the cylinder's axis
  const door = new THREE.Group(); scene.add(door);
  const WX0 = -6.1, WX1 = -0.95, WY0 = -4.4, WY1 = 2.0;   // the window cut into the outer skins
  [[M.veneer, 3.1, 3.5], [M.skin, 2.95, 3.1], [M.filler, 0.6, 2.95]].forEach(([mat, z0, z1]) => {
    box(mat, EDGE, 0, WY1, Y1, z0, z1, door); box(mat, EDGE, 0, Y0, WY0, z0, z1, door);
    box(mat, EDGE, WX0, WY0, WY1, z0, z1, door);
    box(mat, WX1, 0, 1.85, WY1, z0, z1, door); box(mat, WX1, 0, WY0, -1.35, z0, z1, door);
  });
  box(M.filler, EDGE, 0, 2.1, Y1, -0.6, 0.6, door); box(M.filler, EDGE, 0, Y0, -4.3, -0.6, 0.6, door);
  box(M.filler, EDGE, 0, Y0, Y1, -2.95, -0.6, door); box(M.skin, EDGE, 0, Y0, Y1, -3.1, -2.95, door); box(M.veneer, EDGE, 0, Y0, Y1, -3.5, -3.1, door);
  box(M.caseSteel, -6.3, 0, -4.3, 2.1, -0.6, -0.5, door);
  box(M.caseSteel, -6.3, 0, 2.0, 2.1, -0.5, 0.6, door); box(M.caseSteel, -6.3, 0, -4.3, -4.2, -0.5, 0.6, door);
  [[-4.3, -3.75], [-2.85, -2.05], [-1.15, -1.07], [-0.83, 1.05], [1.95, 2.1]].forEach(([a, b]) => box(M.caseSteel, EDGE, -6.3, a, b, -0.75, 0.75, door));
  // the escutcheon ring around the cylinder's face, on the outer veneer
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.11, 16, 48, Math.PI), M.caseSteel);
  ring.rotation.z = Math.PI / 2; ring.position.set(0, 0, 3.52); ring.scale.z = 0.5; door.add(ring);

  // bolts, carrier and rack move together; slide.x = TRAVEL means drawn back into the door
  const slide = new THREE.Group(); door.add(slide);
  BOLT_Y.forEach((y) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 4.2, 32), M.bolt);
    b.rotation.z = Math.PI / 2; b.position.set(-6.6, y, 0); b.castShadow = true; slide.add(b);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 12, 0, TAU, 0, Math.PI / 2), M.bolt);
    cap.rotation.z = Math.PI / 2; cap.scale.y = 0.25; cap.position.set(-8.7, y, 0); slide.add(cap);
  });
  box(M.caseSteel, -4.5, -4.2, -3.9, 1.95, -0.3, 0.1, slide);
  const rack = new THREE.Group(); slide.add(rack);
  box(M.zinc, -4.2, 3.6, -0.72, -0.47, -0.22, 0.04, rack);
  const toothG = new THREE.BoxGeometry(0.09, 0.1, 0.26);
  for (let x = -3.6; x < 3.6; x += 0.157) { const t = new THREE.Mesh(toothG, M.zinc); t.position.set(x, -0.42, -0.09); rack.add(t); }
  const gear = new THREE.Group(); gear.position.set(0, 0, -0.09); door.add(gear);
  const gearBody = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 40), M.zinc); gearBody.rotation.x = Math.PI / 2; gear.add(gearBody);
  for (let i = 0; i < 16; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.26), M.zinc); const a = i / 16 * TAU; t.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0); t.rotation.z = a; gear.add(t); }
  const hub = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), M.caseSteel); hub.position.z = 0.02; gear.add(hub);
  const TRAVEL = 0.4 * TAU;

  // ---------------------------------------------------------------- the cylinder, section at z = 0
  const cyl = new THREE.Group();
  const bore = [[0, 1.75], [0, R]];
  PINS.forEach((c) => bore.push([c - 0.13, R], [c - 0.13, CHAMBER], [c + 0.13, CHAMBER], [c + 0.13, R]));
  bore.push([2.7, R], [2.7, -R], [0, -R], [0, -1.25], [3.4, -1.25], [3.4, -0.62], [2.85, -0.62], [2.85, 1.75]);
  const hFront = new THREE.Mesh(extrude([poly(bore)], 0.13), M.brass);
  const hRear = new THREE.Mesh(extrude([poly([[0, 1.75], [0, R], [2.7, R], [2.7, -R], [0, -R], [0, -1.25], [3.4, -1.25], [3.4, -0.62], [2.85, -0.62], [2.85, 1.75]])], 0.7), M.brass);
  hRear.position.z = -0.13;
  [hFront, hRear].forEach((m) => { m.castShadow = m.receiveShadow = true; cyl.add(m); });
  const plug = new THREE.Group(); cyl.add(plug);
  const KW0 = -0.42, KW1 = 0.26;
  const pieces = [rect(0, -R, 2.7, KW0), rect(2.62, KW0, 2.7, KW1)];
  let x0 = 0; PINS.forEach((c) => { pieces.push(rect(x0, KW1, c - 0.13, R)); x0 = c + 0.13; }); pieces.push(rect(x0, KW1, 2.62, R));
  const pFront = new THREE.Mesh(extrude(pieces, 0.13), M.brass);
  const pRear = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.004, R - 0.004, 2.7, 40, 1, true, Math.PI, Math.PI), M.brass);
  pRear.rotation.z = Math.PI / 2; pRear.position.x = 1.35;
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 40, 1, false, Math.PI, Math.PI), M.brass);
  face.rotation.z = Math.PI / 2; face.position.x = -0.06;
  // the cam: a hub with one finger, in the gap at the back of the cylinder
  const camShape = new THREE.Shape(); camShape.absarc(0, 0, 0.3, -0.5, Math.PI + 0.5, true);
  camShape.lineTo(-0.17, -0.74); camShape.quadraticCurveTo(0, -0.84, 0.17, -0.74); camShape.closePath();
  const cam = new THREE.Mesh(extrude([camShape], 0.16, 0.015), M.cam);
  cam.rotation.y = -Math.PI / 2; cam.position.x = 2.94;
  [pFront, pRear, face, cam].forEach((m) => { m.castShadow = m.receiveShadow = true; plug.add(m); });
  const keyPins = [], drivers = [], springs = [];
  PINS.forEach((c, i) => {
    const L = R - BITS[i];
    const kp = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.05, 0.005), new THREE.Vector2(0.112, 0.06), new THREE.Vector2(0.112, L - 0.015), new THREE.Vector2(0.1, L), new THREE.Vector2(0, L)], 24), M.keyPin);
    kp.position.set(c, LIP, 0); kp.castShadow = true; plug.add(kp); keyPins.push({ m: kp, L });
    const dr = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.1, 0), new THREE.Vector2(0.112, 0.015), new THREE.Vector2(0.112, DRIVER - 0.015), new THREE.Vector2(0.1, DRIVER), new THREE.Vector2(0, DRIVER)], 24), drv[i]);
    dr.position.set(c, LIP + L, 0); dr.castShadow = true; cyl.add(dr); drivers.push(dr);
    const pts = []; for (let k = 0; k <= 180; k++) { const a = k / 180 * 9 * TAU; pts.push(new THREE.Vector3(Math.cos(a) * 0.088, k / 180, Math.sin(a) * 0.088)); }
    const sp = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 260, 0.017, 6), M.spring);
    sp.position.set(c, 1, 0); cyl.add(sp); springs.push(sp);
  });
  const line = new THREE.Mesh(new THREE.PlaneGeometry(2.72, 0.022), M.line); line.position.set(1.35, R, 0.13); line.renderOrder = 5; cyl.add(line);
  // s runs from the outer face (z = 3.5) inward, the section faces +X
  cyl.rotation.y = Math.PI / 2; cyl.position.set(0, 0, 3.5);
  door.add(cyl);

  // ---------------------------------------------------------------- the two keys
  function keyGeo(bits) {
    const s = new THREE.Shape();
    s.moveTo(-0.05, -0.38); s.lineTo(BLADE - 0.25, -0.38);
    s.lineTo(BLADE, -0.25);
    for (let u = BLADE; u >= 0; u -= 0.01) { const h = profile(bits, u); if (h !== null) s.lineTo(u, h); }
    s.lineTo(-0.05, TOP0); s.lineTo(-0.05, 0.4); s.lineTo(-0.3, 0.42);
    s.absarc(-1.25, 0.0, 0.98, 0.45, TAU - 0.45, false);
    s.lineTo(-0.05, -0.42); s.closePath();
    const hole = new THREE.Path(); hole.absarc(-1.7, 0, 0.24, 0, TAU, true); s.holes.push(hole);
    // the long groove that fits the keyway's ward, pressed into the blade's face
    return extrude([s], 0.08, 0.012);
  }
  const oldKey = new THREE.Group(); plug.add(oldKey);
  const oldMesh = new THREE.Mesh(keyGeo(OLD), M.keyOld); oldMesh.castShadow = true; oldMesh.position.z = -0.02; oldKey.add(oldMesh);
  const newKey = new THREE.Group(); plug.add(newKey);
  const newMesh = new THREE.Mesh(keyGeo(BITS), M.keyNew); newMesh.castShadow = true; newMesh.position.z = -0.02; newKey.add(newMesh);
  [oldKey, newKey].forEach((k) => box(M.cam, 0.02, BLADE - 0.3, -0.16, -0.1, 0.0, 0.004, k));   // the ward groove, seen as a dark line
  // the metal the worn key has lost, between the right depth and the worn one, in red
  const wear = new THREE.Group(); oldKey.add(wear);
  PINS.forEach((c, i) => {
    if (!WORN[i]) return;
    const top = [], bot = [];
    for (let u = c - 0.3; u <= c + 0.3001; u += 0.01) { const a = profile(BITS, u), b = profile(OLD, u); if (a - b > 0.002) { top.push([u, a]); bot.push([u, b]); } }
    const m = new THREE.Mesh(new THREE.ShapeGeometry(poly(top.concat(bot.reverse()))), M.wear); m.position.z = 0.012; m.renderOrder = 6; wear.add(m);
  });

  // ---------------------------------------------------------------- labels projected into the page
  const anchors = {
    worn: [oldKey, [-1.25, 1.05, 0]], shear: [cyl, [2.55, R, 0.13]], spring: [cyl, [PINS[4], 1.38, 0.1]], driver: [cyl, [PINS[3], 1.0, 0.12]], keypin: [cyl, [PINS[2], 0.3, 0.12]],
    blocked: [cyl, [PINS[1], 0.82, 0.12]], wear: [oldKey, [PINS[1], -0.05, 0]], fresh: [newKey, [-1.25, 1.05, 0]],
    lift: [cyl, [PINS[2], 1.2, 0.12]], aligned: [cyl, [2.55, R, 0.13]], cam: [door, [-0.25, -0.62, 0.3]], bolts: [scene, [-7.7, BOLT_Y[0] + 0.5, 0.6]],
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

  let P = 0, inView = false, raf = 0, paused = false, moved = 0, w = 0, h = 0;
  const calm = () => !!window.__calm3d || (opts.calm ? opts.calm() : matchMedia('(prefers-reduced-motion: reduce)').matches);
  function resize() {
    const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const ref = 16 / 11, baseF = 40 * Math.PI / 180;    // framed at 16:11; on taller stages keep that width of view
    camera.fov = camera.aspect >= ref ? 40 : Math.min(70, 2 * Math.atan(Math.tan(baseF / 2) * ref / camera.aspect) * 180 / Math.PI);
    camera.updateProjectionMatrix();
    kick();
  }

  // a pin stack rests on whatever is under its key pin (the blade, or the bore's lip); once the plug has turned
  // away, the drivers stay up in the housing and the key pins ride round with the plug
  function stack(i, under, turned) {
    const c = keyPins[i], dr = drivers[i], sp = springs[i];
    let kb = Math.max(LIP, under === null ? LIP : under), db;
    if (turned) { db = R + 0.004; kb = Math.max(LIP, Math.min(kb, R - c.L)); }
    else db = kb + c.L;
    c.m.position.y = kb; dr.position.y = db;
    const top = db + DRIVER; sp.position.y = top; sp.scale.y = Math.max(0.05, CHAMBER - top);
    return db;
  }

  const v = new THREE.Vector3(), cp = new THREE.Vector3(), ct = new THREE.Vector3();
  function frame(ts) {
    raf = 0; if (!inView || paused) return;
    const p = P, motion = !calm(), idle = (performance.now() - moved) / 1000;
    door.updateMatrixWorld(true);
    clipWorld.copy(clipLocal).applyMatrix4(door.matrixWorld);

    // keys
    const os = T.oldS(p), ns = T.newS(p);
    oldKey.position.set(os, T.oldY(p), 0); oldKey.visible = p < 0.53;
    newKey.position.set(ns, T.newY(p), 0); newKey.visible = p > 0.38;
    wear.visible = p > 0.395 && p < 0.53;
    const oldIn = p < 0.38, inKey = oldIn ? OLD : BITS, inS = oldIn ? os : ns, inOn = oldIn || p > 0.5;

    // the plug: the worn key only rocks it against the blocking drivers; the right key turns it
    const turn = T.turn(p);
    let jig = 0;
    if (p > 0.15 && p < 0.34) jig = motion ? 0.028 * Math.abs(Math.sin(ts / 1000 * 7)) * Math.max(0, 1 - idle / 2.5) : 0.028;
    plug.rotation.x = jig + turn;
    const turned = turn > 0.05 && turn < TAU - 0.05;
    let onLine = 0;
    PINS.forEach((c, i) => {
      const under = inOn ? profile(inKey, c - inS) : null;
      const db = stack(i, under, turned);
      const crossing = !turned && db < R - 0.01 && db + DRIVER > R + 0.01;
      if (Math.abs(db - R) < 0.006) onLine++;
      drv[i].emissive.setHex(crossing && oldIn && os > -0.02 ? 0xc8461b : 0x000000);
      drv[i].emissiveIntensity = 0.9;
    });
    line.visible = (p > 0.15 && p < 0.37) || (p > 0.6 && p < 0.88);
    M.line.color.setHex(p > 0.6 && onLine === 5 ? 0x7cf0c0 : 0xffc95a);

    // cam → gear → rack: one turn of the plug moves the bolts 0.4 × 2π, from drawn back to thrown
    gear.rotation.z = -turn;
    slide.position.x = TRAVEL - 0.4 * turn;

    const [lp, lt] = camAt(p);
    cp.copy(lp); ct.copy(lt); door.localToWorld(cp); door.localToWorld(ct);
    camera.position.copy(cp); camera.lookAt(ct);
    scene.updateMatrixWorld(); camera.updateMatrixWorld();   // labels are projected before render, so the camera's matrices must be current

    const show = {
      worn: p > 0.02 && p < 0.12, shear: p > 0.17 && p < 0.33, spring: p > 0.19 && p < 0.26, driver: p > 0.19 && p < 0.26, keypin: p > 0.19 && p < 0.26,
      blocked: p > 0.235 && p < 0.33, wear: p > 0.41 && p < 0.5, fresh: p > 0.425 && p < 0.5, lift: p > 0.57 && p < 0.65,
      aligned: p > 0.69 && p < 0.82, cam: p > 0.86 && p < 0.915, bolts: p > 0.96,
    };
    labels.forEach((l) => {
      v.copy(l.v); l.obj.localToWorld(v); v.project(camera);
      const vis = show[l.id] && v.z < 1 && Math.abs(v.x) < 0.96 && Math.abs(v.y) < 0.92;
      l.el.style.opacity = vis ? 1 : 0;
      l.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${Math.max(40, (1 - v.y) / 2 * h).toFixed(1)}px)`;
    });
    renderer.render(scene, camera);
    // keep drawing only while the plug is rocking against the pins after a scroll
    if (motion && p > 0.15 && p < 0.34 && idle < 2.6) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && inView && !paused) raf = requestAnimationFrame(frame); }
  new ResizeObserver(resize).observe(host); resize();
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; kick(); }).observe(host);
  return {
    set(p) { if (p !== P) moved = performance.now(); P = p; kick(); },
    redraw: kick,
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; canvas.style.visibility = 'hidden'; labelsHost.style.visibility = 'hidden'; },
    resume() { paused = false; canvas.style.visibility = ''; labelsHost.style.visibility = ''; kick(); },
  };
}
