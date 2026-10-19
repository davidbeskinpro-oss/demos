// A cutaway of a multi-bolt steel door and its pin-tumbler cylinder, sectioned through the key's axis.
// The page's scroll position (0..1) drives every part. Units are centimetres.
// Story: a worn key lifts two pin stacks short of the shear line, so the plug cannot turn → inside the
// cylinder → the lock is opened pin by pin with a pick and tension wrench, the gear pulls the bolts →
// the cylinder is swapped on the open door → a copy of the new key is cut on a duplicator (tracer + cutter)
// → the copy lifts every pin exactly to the shear line, the plug turns and the bolts throw.
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
const BIT_A = [0.06, -0.02, 0.1, 0.02, 0.12];        // old cylinder (cut bottoms)
const BIT_B = [0.02, 0.1, -0.02, 0.08, 0.04];        // new cylinder
const WORN = [0, -0.07, 0, -0.06, 0];                // the old key's wear at each cut
const OLD_KEY = BIT_A.map((b, i) => b + WORN[i]);
// the blade's top edge at u (u = 0 at the shoulder): 90° V cuts with a small flat, and a chamfered tip
export function profile(bits, u, cutTo) {
  if (u < 0 || u > BLADE) return null;
  let h = Math.min(TOP0, -0.12 + (BLADE - u) * 1.1);
  if (cutTo === undefined || u <= cutTo) for (let i = 0; i < bits.length; i++) h = Math.min(h, bits[i] + Math.max(0, Math.abs(u - PINS[i]) - 0.035));
  return h;
}

// ---- the shared timeline (the page reads the same numbers for its text)
export const STAGES = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1];
const PICK_ORDER = [2, 0, 3, 4, 1];
const PICK0 = 0.345, PICK_EACH = 0.016;   // setting the five pins, then the plug turns
const T = {
  oldKey: (p) => (p < 0.27 ? 0 : -3.3 * smooth(span(p, 0.27, 0.32))),
  tools: (p) => (p >= 0.33 && p < 0.5 ? smooth(span(p, 0.33, 0.345)) * (1 - span(p, 0.485, 0.5)) : 0),
  pickTurn: (p) => TAU * smooth(span(p, PICK0 + 5 * PICK_EACH + 0.004, 0.47)),
  door: (p) => (p < 0.47 ? 0 : p < 0.66 ? smooth(span(p, 0.47, 0.5)) : 1 - smooth(span(p, 0.66, 0.7))),
  screw: (p) => (p < 0.5 ? 0 : p < 0.6 ? smooth(span(p, 0.505, 0.545)) : 1 - smooth(span(p, 0.615, 0.655))),
  oldOut: (p) => smooth(span(p, 0.548, 0.578)),
  newIn: (p) => smooth(span(p, 0.582, 0.612)),
  cut: (p) => span(p, 0.695, 0.8),
  newKey: (p) => (p < 0.84 ? -3.3 : -3.3 * (1 - smooth(span(p, 0.845, 0.905)))),
  newTurn: (p) => -TAU * smooth(span(p, 0.925, 0.985)),
};

// camera keyframes [p, position, target], in the door's own space (the camera rides with the door)
const KEYS = [
  [0.00, [-0.6, 4.6, 17.5], [-3.7, -0.9, 1.4]],
  [0.09, [2.2, 1.6, 12.0], [-1.9, -0.4, 2.2]],
  [0.2, [6.4, 0.9, 2.6], [0, 0.4, 1.9]],
  [0.29, [4.9, 0.85, 2.1], [0, 0.5, 1.9]],
  [0.4, [4.6, 0.5, 2.9], [0, 0.35, 2.1]],
  [0.475, [9.5, 6.8, 11.5], [-3.2, -1.0, 0.6]],
  [0.56, [4.5, 2.4, 13.5], [-3.6, -0.9, 1.8]],
  [0.64, [5.5, 2.6, 12.5], [-2.2, -0.5, 2.4]],
  [0.72, [10.6, 3.0, 13.8], [11.6, -1.0, 5.6]],
  [0.81, [10.2, 1.9, 11.2], [11.4, -1.1, 5.9]],
  [0.88, [5.8, 0.85, 2.7], [0, 0.4, 1.9]],
  [0.94, [5.4, 0.8, 2.5], [0, 0.35, 1.9]],
  [1.0, [-2.2, 3.8, 15.0], [-5.4, -1.0, 1.0]],
];

const LABELS = [
  ['worn', 'מפתח שחוק', 'Worn key'], ['bolts', 'הבריחים בתוך המשקוף', 'Bolts in the frame'],
  ['shear', 'קו הגזירה', 'Shear line'], ['spring', 'קפיץ', 'Spring'], ['driver', 'פין עליון', 'Driver pin'], ['keypin', 'פין תחתון', 'Key pin'],
  ['blocked', 'פינים שחוצים את הקו', 'Pins across the line'],
  ['wrench', 'מפתח מתח', 'Tension wrench'], ['pick', 'מרים פין אחרי פין', 'Lifting pin by pin'],
  ['gear', 'גלגל השיניים מושך את הבריחים', 'The gear pulls the bolts'],
  ['screw', 'בורג הצילינדר', 'Cylinder screw'], ['newcyl', 'צילינדר חדש', 'New cylinder'],
  ['tracer', 'המפתח המקורי', 'The original key'], ['cutter', 'הסכין חותכת את העותק', 'The cutter cuts the copy'],
  ['aligned', 'כל הפינים על הקו', 'Every pin on the line'], ['locked', 'הבריחים ננעלים', 'The bolts throw'],
];

export function initLock3D(host, labelsHost, opts) {
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  const small = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07123a);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.8;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200);

  const loader = new THREE.TextureLoader();
  const tex = (name, rep, color) => {
    const t = loader.load(`tex/${name}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const pbr = (id, rep, extra) => new THREE.MeshStandardMaterial(Object.assign({
    map: tex(`${id}_diff`, rep, true), normalMap: tex(`${id}_nor`, rep), roughnessMap: tex(`${id}_rough`, rep), roughness: 1, metalness: 0,
  }, extra || {}));
  const clipLocal = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.02), clipWorld = new THREE.Plane();
  const metal = (color, rough, extra) => new THREE.MeshPhysicalMaterial(Object.assign({ color, metalness: 1, roughness: rough }, extra || {}));
  const M = {
    veneer: pbr('oak_veneer_01', [0.12, 0.12], { color: 0xd9c3a0 }),
    skin: pbr('metal_plate', [0.15, 0.15], { color: 0x5b6470, metalness: 0.75, roughness: 0.6 }),
    filler: pbr('plastered_wall_04', [0.4, 0.4], { color: 0xb9ab88 }),
    frame: pbr('metal_plate', [0.2, 0.2], { color: 0xb4c0d0, metalness: 0.5, roughness: 0.5 }),
    wall: pbr('plastered_wall_04', [0.35, 0.35], { color: 0xd9cfbc }),
    caseSteel: metal(0x8e959c, 0.42),
    zinc: metal(0xa9b0b6, 0.3, { clippingPlanes: [clipWorld] }),
    bolt: metal(0xdfe3e7, 0.16),
    brassOld: metal(0xa88848, 0.5, { side: THREE.DoubleSide }),
    brassNew: metal(0xe3c171, 0.2, { side: THREE.DoubleSide }),
    keyPin: metal(0xd2a957, 0.28),
    driver: metal(0xc3c8cd, 0.26, { emissive: 0x000000 }),
    spring: metal(0xc9ced3, 0.22),
    keyOld: metal(0x9d7f45, 0.55),
    keyNew: metal(0xcfcbc1, 0.24),
    blank: metal(0xd9b768, 0.22),
    tool: metal(0x9aa1a8, 0.3),
    enamel: new THREE.MeshPhysicalMaterial({ color: 0x2c3442, roughness: 0.42, metalness: 0.15, clearcoat: 0.5 }),
    cutter: metal(0xd4d8dc, 0.18),
    line: new THREE.MeshBasicMaterial({ color: 0xffc95a, transparent: true, opacity: 0.95, depthTest: false }),
  };
  const blockedDrivers = PINS.map(() => M.driver.clone());

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

  // ---------------------------------------------------------------- the frame and wall (they stay; the door swings)
  const Y0 = -5, Y1 = 2.4, EDGE = -6.5;
  box(M.wall, -13, -8.8, Y0, Y1, -6, 3.62);
  box(M.frame, -8.8, -6.62, Y0, Y1, -3.5, -0.55);                                   // back of the frame
  box(M.frame, -8.8, -6.62, Y0, -4.1, 0.55, 3.62); box(M.frame, -8.8, -6.62, 2.0, Y1, 0.55, 3.62);   // front, cut away between
  const BOLT_Y = [1.5, -1.6, -3.3];
  // the strike between the bolt holes
  const strikeGaps = [[Y0, -3.8], [-2.8, -2.1], [-1.1, 1.0], [2.0, Y1]];
  strikeGaps.forEach(([a, b]) => box(M.frame, -8.8, -6.62, a, b, -0.55, 0.55));
  BOLT_Y.forEach((y) => box(M.frame, -8.8, -8.75, y - 0.5, y + 0.5, -0.55, 0.55));  // the hole's back wall

  // ---------------------------------------------------------------- the door (pivot far to the right, opens inward)
  const pivot = new THREE.Group(); pivot.position.set(40, 0, -3.5); scene.add(pivot);
  const door = new THREE.Group(); door.position.set(-40, 0, 3.5); pivot.add(door);
  const WX0 = -6.1, WX1 = -0.95, WY0 = -4.4, WY1 = 2.0;   // the window cut into the outer skins
  [[M.veneer, 3.1, 3.5], [M.skin, 2.95, 3.1], [M.filler, 0.6, 2.95]].forEach(([mat, z0, z1]) => {
    box(mat, EDGE, 0, WY1, Y1, z0, z1, door); box(mat, EDGE, 0, Y0, WY0, z0, z1, door);
    box(mat, EDGE, WX0, WY0, WY1, z0, z1, door);
    box(mat, WX1, 0, 1.85, WY1, z0, z1, door); box(mat, WX1, 0, WY0, -1.35, z0, z1, door);
  });
  box(M.filler, EDGE, 0, 2.1, Y1, -0.6, 0.6, door); box(M.filler, EDGE, 0, Y0, -4.3, -0.6, 0.6, door);
  box(M.filler, EDGE, 0, Y0, Y1, -2.95, -0.6, door); box(M.skin, EDGE, 0, Y0, Y1, -3.1, -2.95, door); box(M.veneer, EDGE, 0, Y0, Y1, -3.5, -3.1, door);
  // the lock case: back plate, top, bottom, and the faceplate on the door's edge with the bolt holes
  box(M.caseSteel, -6.3, 0, -4.3, 2.1, -0.6, -0.5, door);
  box(M.caseSteel, -6.3, 0, 2.0, 2.1, -0.5, 0.6, door); box(M.caseSteel, -6.3, 0, -4.3, -4.2, -0.5, 0.6, door);
  [[-4.3, -3.75], [-2.85, -2.05], [-1.15, -1.07], [-0.83, 1.05], [1.95, 2.1]].forEach(([a, b]) => box(M.caseSteel, EDGE, -6.3, a, b, -0.75, 0.75, door));

  // bolts, carrier and rack move together; bolts out = locked
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
  // pinion on the cylinder's axis (pitch radius 0.4 → the bolts travel 0.4 × angle)
  const gear = new THREE.Group(); gear.position.set(0, 0, -0.09); door.add(gear);
  const gearBody = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 40), M.zinc); gearBody.rotation.x = Math.PI / 2; gear.add(gearBody);
  for (let i = 0; i < 16; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.26), M.zinc); const a = i / 16 * TAU; t.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0); t.rotation.z = a; gear.add(t); }
  const hub = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), M.caseSteel); hub.position.z = 0.02; gear.add(hub);
  const TRAVEL = 0.4 * TAU;

  // ---------------------------------------------------------------- a cylinder (old or new), section at z = 0
  function makeCylinder(bits, mat) {
    const g = new THREE.Group();
    // housing: front layer with pin chambers, rear layer solid, a tail with the screw hole
    const bore = [[0, 1.75], [0, R]];
    PINS.forEach((c) => bore.push([c - 0.13, R], [c - 0.13, CHAMBER], [c + 0.13, CHAMBER], [c + 0.13, R]));
    bore.push([2.7, R], [2.7, -R], [0, -R], [0, -1.25], [3.4, -1.25], [3.4, -0.62], [2.85, -0.62], [2.85, 1.75]);
    const hFront = new THREE.Mesh(extrude([poly(bore)], 0.13), mat);
    const hRear = new THREE.Mesh(extrude([poly([[0, 1.75], [0, R], [2.7, R], [2.7, -R], [0, -R], [0, -1.25], [3.4, -1.25], [3.4, -0.62], [2.85, -0.62], [2.85, 1.75]])], 0.7), mat);
    hRear.position.z = -0.13;
    [hFront, hRear].forEach((m) => { m.castShadow = m.receiveShadow = true; g.add(m); });
    // plug: rotates about the key axis
    const plug = new THREE.Group(); g.add(plug);
    const KW0 = -0.42, KW1 = 0.26;
    const pieces = [rect(0, -R, 2.7, KW0), rect(2.62, KW0, 2.7, KW1)];
    let x = 0; PINS.forEach((c) => { pieces.push(rect(x, KW1, c - 0.13, R)); x = c + 0.13; }); pieces.push(rect(x, KW1, 2.62, R));
    const pFront = new THREE.Mesh(extrude(pieces, 0.13), mat);
    const pRear = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.004, R - 0.004, 2.7, 40, 1, true, Math.PI, Math.PI), mat);
    pRear.rotation.z = Math.PI / 2; pRear.position.x = 1.35;
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 40, 1, false, Math.PI, Math.PI), mat);
    face.rotation.z = Math.PI / 2; face.position.x = -0.06;
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.2), M.caseSteel); tail.position.set(3.1, 0, -0.08);
    [pFront, pRear, face, tail].forEach((m) => { m.castShadow = m.receiveShadow = true; plug.add(m); });
    const keyPins = [], drivers = [], springs = [];
    PINS.forEach((c, i) => {
      const L = R - bits[i];
      const kp = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.05, 0.005), new THREE.Vector2(0.112, 0.06), new THREE.Vector2(0.112, L - 0.015), new THREE.Vector2(0.1, L), new THREE.Vector2(0, L)], 24), M.keyPin);
      kp.position.set(c, LIP, 0); kp.castShadow = true; plug.add(kp); keyPins.push({ m: kp, L });
      const dr = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.1, 0), new THREE.Vector2(0.112, 0.015), new THREE.Vector2(0.112, DRIVER - 0.015), new THREE.Vector2(0.1, DRIVER), new THREE.Vector2(0, DRIVER)], 24), blockedDrivers[i]);
      dr.position.set(c, LIP + L, 0); dr.castShadow = true; g.add(dr); drivers.push(dr);
      const pts = []; for (let k = 0; k <= 180; k++) { const a = k / 180 * 9 * TAU; pts.push(new THREE.Vector3(Math.cos(a) * 0.088, k / 180, Math.sin(a) * 0.088)); }
      const sp = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 260, 0.017, 6), M.spring);
      sp.position.set(c, 1, 0); g.add(sp); springs.push(sp);
    });
    // the shear line, drawn on the section
    const line = new THREE.Mesh(new THREE.PlaneGeometry(2.72, 0.022), M.line); line.position.set(1.35, R, 0.13); line.renderOrder = 5; g.add(line);
    // place it in the door: s runs from the outer face (z = 3.5) inward, the section faces +X
    g.rotation.y = Math.PI / 2; g.position.set(0, 0, 3.5);
    door.add(g);
    return { g, plug, keyPins, drivers, springs, line, bits, hFront };
  }
  const oldCyl = makeCylinder(BIT_A, M.brassOld);
  const newCyl = makeCylinder(BIT_B, M.brassNew);

  // the retaining screw, from the door's edge into the cylinder's tail
  const screw = new THREE.Group(); door.add(screw);
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6.3, 16), M.tool); shank.rotation.z = Math.PI / 2; shank.position.x = -3.35; screw.add(shank);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 24), M.tool); head.rotation.z = Math.PI / 2; head.position.x = -6.52; screw.add(head);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.05), M.caseSteel); slot.position.x = -6.585; screw.add(slot);
  for (let i = 0; i < 26; i++) { const th = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 4, 12), M.tool); th.rotation.y = Math.PI / 2; th.position.x = -1.2 - i * 0.07; screw.add(th); }
  screw.position.set(0, -0.95, 0.35);

  // ---------------------------------------------------------------- keys
  function keyGeo(bits, cutTo) {
    const s = new THREE.Shape();
    s.moveTo(-0.05, -0.38); s.lineTo(BLADE - 0.25, -0.38);
    const pts = []; for (let u = BLADE; u >= 0; u -= 0.01) { const h = profile(bits, u, cutTo); if (h !== null) pts.push([u, h]); }
    s.lineTo(BLADE, -0.25);
    pts.forEach(([u, h]) => s.lineTo(u, h));
    s.lineTo(-0.05, TOP0); s.lineTo(-0.05, 0.4); s.lineTo(-0.3, 0.42);
    s.absarc(-1.25, 0.0, 0.98, 0.45, TAU - 0.45, false);
    s.lineTo(-0.05, -0.42); s.closePath();
    const hole = new THREE.Path(); hole.absarc(-1.7, 0, 0.24, 0, TAU, true); s.holes.push(hole);
    const g = extrude([s], 0.08, 0.012); return g;
  }
  const oldKey = new THREE.Mesh(keyGeo(OLD_KEY), M.keyOld); oldKey.castShadow = true; oldKey.position.set(0, 0, -0.02); oldCyl.plug.add(oldKey);
  const newKey = new THREE.Mesh(keyGeo(BIT_B), M.keyNew); newKey.castShadow = true; newKey.position.set(0, 0, -0.02); newCyl.plug.add(newKey);
  // the tension wrench at the bottom of the keyway and a hook pick
  const wrench = new THREE.Group(); oldCyl.plug.add(wrench);
  box(M.tool, -0.05, 0.5, -0.4, -0.33, -0.09, -0.04, wrench); box(M.tool, -0.12, -0.05, -1.6, -0.33, -0.09, -0.04, wrench);
  // the pick pivots at the keyway's mouth, so lifting the tip barely raises the shaft under the other pins
  const pickPivot = new THREE.Group(); pickPivot.position.set(-0.1, 0, 0); oldCyl.plug.add(pickPivot);
  const pick = new THREE.Group(); pickPivot.add(pick);
  box(M.tool, -3.2, 0, -0.3, -0.24, -0.08, -0.04, pick);
  box(M.tool, -0.06, 0.02, -0.3, -0.08, -0.08, -0.04, pick);
  box(M.enamel, -4.6, -3.2, -0.36, -0.18, -0.12, 0.0, pick);

  // ---------------------------------------------------------------- the key duplicator (on the bench, beside the door)
  const dup = new THREE.Group(); dup.position.set(12.2, -1.4, 6); door.add(dup);
  box(M.enamel, -3.6, 3.6, -2.3, -1.5, -2.2, 2.4, dup);                    // base
  const carriage = new THREE.Group(); dup.add(carriage);
  box(M.caseSteel, -3.3, 1.2, -1.5, -0.55, -1.9, 1.9, carriage);              // the carriage with its two vises
  [-1.1, 0.95].forEach((z) => { box(M.cutter, -2.4, -0.1, -0.55, -0.2, z - 0.42, z - 0.06, carriage); box(M.cutter, -2.4, -0.1, -0.55, -0.2, z + 0.1, z + 0.46, carriage); });
  const original = new THREE.Mesh(keyGeo(BIT_B), M.keyNew); original.position.set(0, 0, -1.07); carriage.add(original);
  let blankCut = -1, blank = new THREE.Mesh(keyGeo(BIT_B, -1), M.blank); blank.position.set(0, 0, 0.99); carriage.add(blank);
  box(M.enamel, 1.9, 3.3, -1.5, TOP0 + 0.6, 0.3, 1.6, dup);                // column under the motor
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.6, 32), M.enamel); motor.rotation.z = Math.PI / 2; motor.position.set(2.0, TOP0 + 1.0, 0.95); dup.add(motor);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 12), M.cutter); shaft.rotation.z = Math.PI / 2; shaft.position.set(0.4, TOP0 + 0.75, 0.95); dup.add(shaft);
  const wheel = new THREE.Group(); wheel.position.set(0, TOP0 + 0.75, 0.95); dup.add(wheel);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 48), M.cutter); disc.rotation.z = Math.PI / 2; wheel.add(disc);
  for (let i = 0; i < 36; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 4), M.cutter); const a = i / 36 * TAU; t.position.set(0, Math.cos(a) * 0.73, Math.sin(a) * 0.73); t.rotation.x = a; wheel.add(t); }
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.36, 32, 1, true, 0, Math.PI * 1.1), M.enamel); guard.rotation.z = Math.PI / 2; guard.rotation.x = -0.4; guard.position.copy(wheel.position); dup.add(guard);
  const tracer = new THREE.Group(); tracer.position.set(0, TOP0, -1.03); dup.add(tracer);
  const tracerTip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 4), M.cutter); tracerTip.rotation.x = Math.PI; tracerTip.position.y = 0.175; tracer.add(tracerTip);
  box(M.cutter, -0.08, 0.08, 0.35, 1.6, -0.08, 0.08, tracer); box(M.enamel, -0.2, 1.7, 1.45, 1.75, -0.2, 0.2, tracer);
  // brass chips flung from the cut (motion only)
  const chips = []; const chipG = new THREE.BoxGeometry(0.035, 0.012, 0.025);
  for (let i = 0; i < 24; i++) { const c = new THREE.Mesh(chipG, M.blank); c.userData = { t: Math.random(), v: new THREE.Vector3() }; dup.add(c); chips.push(c); }

  // ---------------------------------------------------------------- labels projected into the page
  const anchors = {
    worn: [oldKey, [-1.25, 0.9, 0]], bolts: [scene, [-8.0, BOLT_Y[0] + 0.55, 0.6]],
    shear: [oldCyl.g, [0.15, R, 0.13]], spring: [oldCyl.g, [PINS[4], 1.38, 0.1]], driver: [oldCyl.g, [PINS[3], 0.95, 0.12]], keypin: [oldCyl.g, [PINS[2], 0.28, 0.12]],
    blocked: [oldCyl.g, [PINS[1], 0.95, 0.12]], wrench: [oldCyl.plug, [-0.1, -1.4, 0]], pick: [oldCyl.plug, [-0.6, -0.15, 0]],
    gear: [door, [-0.25, -0.55, 0.3]], screw: [screw, [-1.0, 0.3, 0]], newcyl: [newCyl.g, [-0.6, 1.5, -0.4]],
    tracer: [original, [0.8, 0.2, 0]], cutter: [wheel, [0, 0.75, 0]], aligned: [newCyl.g, [0.2, R, 0.13]], locked: [scene, [-8.0, BOLT_Y[1] + 0.55, 0.6]],
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

  let P = 0, inView = false, raf = 0, last = 0, w = 0, h = 0, paused = false, moved = 0, spin = 0;
  const calmOpt = (opts && opts.calm) || (() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const calm = () => !!window.__calm3d || calmOpt();
  function resize() {
    const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const ref = 16 / 11, base = 40 * Math.PI / 180;    // framed at 16:11; on taller stages keep that width of view
    camera.fov = camera.aspect >= ref ? 40 : Math.min(66, 2 * Math.atan(Math.tan(base / 2) * ref / camera.aspect) * 180 / Math.PI);
    camera.updateProjectionMatrix();
    if (typeof kick === 'function') kick();
  }
  new ResizeObserver(resize).observe(host); resize();

  // pins: each stack rests on whatever is under its key pin (the blade, the pick, or the bore's lip)
  function stack(cyl, i, under, plugTurned, setPin) {
    const c = cyl.keyPins[i], dr = cyl.drivers[i], sp = cyl.springs[i];
    let kb = Math.max(LIP, under === null ? LIP : under);
    let db;
    if (plugTurned || setPin) { db = R + 0.004; if (plugTurned) kb = Math.max(LIP, Math.min(kb, R - c.L)); }
    else db = kb + c.L;
    if (setPin && !plugTurned) kb = Math.min(kb, R - c.L);
    c.m.position.y = kb; dr.position.y = db;
    const top = db + DRIVER; sp.position.y = top; sp.scale.y = Math.max(0.05, CHAMBER - top);
    return db;
  }

  const v = new THREE.Vector3(), cp = new THREE.Vector3(), ct = new THREE.Vector3();
  function frame(ts) {
    raf = 0; if (!inView) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
    const p = P, motion = !calm();
    const tm = ts / 1000;

    // door swing (opens inward once the bolts are back)
    pivot.rotation.y = -0.2 * T.door(p);
    pivot.updateMatrixWorld(true);
    clipWorld.copy(clipLocal).applyMatrix4(door.matrixWorld);

    // which cylinder is in the door
    const outO = T.oldOut(p), inN = T.newIn(p);
    oldCyl.g.visible = outO < 1; oldCyl.g.position.z = 3.5 + 9 * outO;
    newCyl.g.visible = p > 0.578; newCyl.g.position.z = 3.5 + 9 * (1 - inN);

    // the old cylinder: worn key, jiggle, withdrawal, picking, the turn
    const ko = T.oldKey(p);
    oldKey.visible = p < 0.33; oldKey.position.x = ko;
    const tools = T.tools(p);
    wrench.visible = pick.visible = tools > 0.001;
    const pt = T.pickTurn(p);
    let set = 0, nowPin = -1, lift = 0;
    for (let k = 0; k < 5; k++) {
      const a = PICK0 + k * PICK_EACH, f = span(p, a, a + PICK_EACH);
      if (f >= 1) set++; else if (f > 0) { nowPin = PICK_ORDER[k]; lift = Math.sin(f * Math.PI); break; }
    }
    // someone tries the worn key: the plug rocks against the blocking pins for a moment after each scroll, then rests
    const idle = (performance.now() - moved) / 1000;
    let jig = 0;
    if (p > 0.03 && p < 0.27) jig = motion ? 0.03 * Math.abs(Math.sin(tm * 7)) * Math.max(0, 1 - idle / 2.5) : 0.03;
    const setMicro = 0.012 * set;
    oldCyl.plug.rotation.x = -(jig + (p >= 0.33 ? setMicro : 0) + pt);
    const turned = pt > 0.05 && pt < TAU - 0.05;
    const pinX = nowPin >= 0 ? PINS[nowPin] : PINS[PICK_ORDER[Math.min(4, set)]];
    const tipS = lerp(-3.3, pinX + 0.02, tools);
    const target = nowPin >= 0 ? R - oldCyl.keyPins[nowPin].L + 0.012 : -0.08;
    const raise = (target + 0.08) * lift, hookTop = -0.08 + raise;
    pick.position.x = tipS + 0.1;
    pickPivot.rotation.z = Math.asin(Math.min(0.5, raise / Math.max(0.4, tipS + 0.1)));
    PINS.forEach((c, i) => {
      let under = profile(OLD_KEY, c - ko);
      const k = PICK_ORDER.indexOf(i), f = span(p, PICK0 + k * PICK_EACH, PICK0 + (k + 1) * PICK_EACH);
      if (p >= 0.33) under = i === nowPin ? hookTop : null;
      const isSet = p >= 0.33 && f >= 0.5;
      const db = stack(oldCyl, i, under, turned, isSet);
      const crossing = db < R - 0.01 && db + DRIVER > R + 0.01;
      blockedDrivers[i].emissive.setHex(crossing && p > 0.02 && p < 0.33 && profile(OLD_KEY, c - ko) !== null ? 0xc8461b : 0x000000);
      blockedDrivers[i].emissiveIntensity = 0.9;
    });
    oldCyl.line.visible = p > 0.16 && p < 0.5;

    // the new cylinder: copy goes in, rides the pins, turns
    const nk = T.newKey(p), nt = T.newTurn(p);
    newKey.visible = p > 0.84; newKey.position.x = nk;
    newCyl.plug.rotation.x = -nt;
    const nTurned = Math.abs(nt) > 0.05 && Math.abs(nt) < TAU - 0.05;
    let allOn = newKey.visible && nk > -0.001;
    PINS.forEach((c, i) => {
      const under = newKey.visible ? profile(BIT_B, c - nk) : null;
      stack(newCyl, i, under, nTurned, false);
    });
    newCyl.line.visible = p > 0.84;
    M.line.color.setHex(allOn ? 0x7cf0c0 : 0xffc95a);

    // gear and bolts: one turn of the plug moves the bolts 0.4 × 2π
    const theta = pt + nt;
    gear.rotation.z = theta;
    slide.position.x = 0.4 * theta;
    const scr = T.screw(p);
    screw.position.x = -6.4 * scr; screw.rotation.x = scr * 26 * TAU / 4;

    // the duplicator: tracer rides the original, the cutter copies it onto the blank
    const cu = T.cut(p), uc = lerp(-0.06, BLADE + 0.02, cu);
    const ho = profile(BIT_B, uc);
    const hh = ho === null ? TOP0 : ho;
    carriage.position.set(-uc, TOP0 - hh, 0);
    const cutTo = cu <= 0 ? -1 : uc;
    if (Math.abs(cutTo - blankCut) > 0.015 || (cu >= 1 && blankCut < BLADE)) {
      blankCut = cu >= 1 ? BLADE + 1 : cutTo; blank.geometry.dispose(); blank.geometry = keyGeo(BIT_B, blankCut);
    }
    const cutting = cu > 0 && cu < 1;
    // the motor runs while the carriage moves and spins down within a few seconds once it stops
    const spinTo = p > 0.69 && p < 0.81 && idle < 2 ? 42 : 0;
    spin += (spinTo - spin) * Math.min(1, dt * (spinTo > spin ? 6 : 1.4));
    if (motion && p > 0.66 && p < 0.84) wheel.rotation.x -= dt * spin;
    chips.forEach((c) => {
      if (!cutting || !motion || idle > 0.4) { c.visible = false; return; }
      c.visible = true; c.userData.t += dt * 1.6;
      if (c.userData.t > 1) { c.userData.t = 0; c.userData.v.set((Math.random() - 0.5) * 1.2, 1.2 + Math.random() * 1.5, 1.8 + Math.random() * 1.6); }
      const t = c.userData.t, vv = c.userData.v;
      c.position.set(vv.x * t, TOP0 + vv.y * t - 4.9 * t * t, 0.95 + vv.z * t * 0.6);
      c.rotation.set(t * 20, t * 13, 0);
    });

    // camera, in door space
    const [lp, lt] = camAt(p);
    cp.copy(lp); ct.copy(lt); door.localToWorld(cp); door.localToWorld(ct);
    camera.position.copy(cp); camera.lookAt(ct);

    scene.updateMatrixWorld();
    // labels
    const show = {
      worn: p < 0.12, bolts: p > 0.02 && p < 0.13,
      shear: p > 0.18 && p < 0.33, spring: p > 0.2 && p < 0.27, driver: p > 0.2 && p < 0.27, keypin: p > 0.2 && p < 0.27, blocked: p > 0.235 && p < 0.29,
      wrench: p > 0.345 && p < 0.44, pick: p > 0.35 && p < 0.43, gear: p > 0.455 && p < 0.49,
      screw: p > 0.505 && p < 0.555, newcyl: p > 0.59 && p < 0.65, tracer: p > 0.7 && p < 0.79, cutter: p > 0.7 && p < 0.8,
      aligned: p > 0.9 && p < 0.935, locked: p > 0.965,
    };
    labels.forEach((l) => {
      v.copy(l.v); l.obj.localToWorld(v); v.project(camera);
      const vis = show[l.id] && v.z < 1 && Math.abs(v.x) < 0.98 && Math.abs(v.y) < 0.95;
      l.el.style.opacity = vis ? 1 : 0;
      l.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
    });
    renderer.render(scene, camera);
    const live = motion && (((p > 0.03 && p < 0.27) && idle < 2.6) || ((p > 0.66 && p < 0.84) && (idle < 2 || spin > 0.2)));
    if (inView && live) raf = requestAnimationFrame(frame);
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
