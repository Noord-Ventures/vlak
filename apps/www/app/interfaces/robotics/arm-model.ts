import * as THREE from "three";
import { armDimensions, armPose, type ArmAngles, type JointId } from "./simulation";

/** Original procedural inspection arm. No manufacturer model or controller dimensions. */
export function createArmModel() {
  const root = new THREE.Group();
  const gradient = new THREE.DataTexture(new Uint8Array([100, 174, 232, 255]), 4, 1, THREE.RedFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  const shell = new THREE.MeshToonMaterial({ color: 0xe3e3e3, gradientMap: gradient });
  const metal = new THREE.MeshToonMaterial({ color: 0xb8b8b8, gradientMap: gradient });
  const dark = new THREE.MeshToonMaterial({ color: 0x383838, gradientMap: gradient });
  const lens = new THREE.MeshToonMaterial({ color: 0x181818, gradientMap: gradient });
  const edge = new THREE.LineBasicMaterial({ color: 0x343434 });
  const fine = new THREE.LineBasicMaterial({ color: 0x777777, transparent: true, opacity: .65 });
  const selectedMaterial = new THREE.MeshBasicMaterial({ color: 0x242424, side: THREE.DoubleSide });
  const ghostMaterial = new THREE.LineDashedMaterial({ color: 0x696969, dashSize: .06, gapSize: .04, depthTest: false, transparent: true, opacity: .85 });
  const scanMaterial = new THREE.LineDashedMaterial({ color: 0x595959, dashSize: .04, gapSize: .025, transparent: true, opacity: .55 });
  const lampMaterial = new THREE.MeshBasicMaterial({ color: 0x252525 });
  const mats = { shell, metal, dark, lens, edge, fine, selectedMaterial, ghostMaterial, scanMaterial, lampMaterial };
  const mesh = (parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material = shell, outline = true) => {
    const object = new THREE.Mesh(geometry, material); object.castShadow = true; object.receiveShadow = true;
    parent.add(object);
    if (outline) object.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 32), edge));
    return object;
  };
  const box = (parent: THREE.Object3D, dimensions: [number, number, number], position: [number, number, number], material: THREE.Material = shell, outline = true) => {
    const object = mesh(parent, new THREE.BoxGeometry(...dimensions), material, outline); object.position.set(...position); return object;
  };
  const cylinder = (parent: THREE.Object3D, radius: number, depth: number, position: [number, number, number], material: THREE.Material = metal, axis: "y" | "z" = "z", segments = 40) => {
    const object = mesh(parent, new THREE.CylinderGeometry(radius, radius, depth, segments), material); object.position.set(...position);
    if (axis === "z") object.rotation.x = Math.PI / 2;
    return object;
  };
  const line = (parent: THREE.Object3D, points: THREE.Vector3[], material: THREE.LineBasicMaterial | THREE.LineDashedMaterial = fine) => {
    const object = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material); object.computeLineDistances(); parent.add(object); return object;
  };
  const bolt = (parent: THREE.Object3D, x: number, y: number, z: number, radius = .018) => cylinder(parent, radius, .013, [x, y, z], dark, "z", 6);
  const hub = (parent: THREE.Object3D, radius: number, width: number) => {
    cylinder(parent, radius, width, [0, 0, 0], dark);
    for (const sign of [-1, 1]) {
      cylinder(parent, radius * .93, .05, [0, 0, sign * (width / 2 + .02)], shell);
      cylinder(parent, radius * .70, .018, [0, 0, sign * (width / 2 + .055)], metal);
      cylinder(parent, radius * .23, .028, [0, 0, sign * (width / 2 + .072)], dark);
      const ring = mesh(parent, new THREE.TorusGeometry(radius * .82, .009, 6, 48), dark, false); ring.position.z = sign * (width / 2 + .048);
      for (let index = 0; index < 8; index++) {
        const theta = index / 8 * Math.PI * 2;
        bolt(parent, Math.cos(theta) * radius * .57, Math.sin(theta) * radius * .57, sign * (width / 2 + .072), .014);
      }
    }
  };
  const link = (parent: THREE.Object3D, length: number, width: number, depth: number) => {
    // A tapered cast housing, removable side covers and recessed longitudinal ribs.
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, .08); shape.lineTo(-width * .39, length - .08);
    shape.quadraticCurveTo(0, length + .035, width * .39, length - .08);
    shape.lineTo(width / 2, .08); shape.quadraticCurveTo(0, -.025, -width / 2, .08);
    const casting = mesh(parent, new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .022, bevelThickness: .018, bevelSegments: 2, steps: 1 })); casting.position.z = -depth / 2;
    for (const side of [-1, 1]) {
      box(parent, [width * .40, length * .56, .018], [0, length * .50, side * (depth / 2 + .025)], metal);
      for (const offset of [-1, 1]) line(parent, [new THREE.Vector3(offset * width * .31, .22, side * (depth / 2 + .03)), new THREE.Vector3(offset * width * .25, length - .20, side * (depth / 2 + .03))]);
      for (const y of [.24, length - .23]) for (const x of [-width * .15, width * .15]) bolt(parent, x, y, side * (depth / 2 + .045), .013);
      for (let index = 0; index < 5; index++) box(parent, [width * .35, .013, .008], [0, .38 + index * .045, side * (depth / 2 + .04)], dark, false);
    }
    const points = [new THREE.Vector3(width * .55, .13, -depth * .35), new THREE.Vector3(width * .71, length * .40, -depth * .35), new THREE.Vector3(width * .60, length * .76, -depth * .35), new THREE.Vector3(width * .40, length - .06, -depth * .35)];
    mesh(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 28, .028, 8, false), dark, false);
    for (const y of [.32, length - .31]) box(parent, [.11, .055, .075], [width * .63, y, -depth * .35], metal);
  };

  // Machined fixture plate: panel seams, mounting holes, feet and a sample coupon.
  const stage = new THREE.Group(); root.add(stage);
  box(stage, [4.2, .16, 2.45], [.25, -.10, 0], shell);
  box(stage, [4.0, .15, 2.20], [.25, -.24, 0], dark);
  for (const x of [-1.35, 1.85]) for (const z of [-.85, .85]) cylinder(stage, .10, .18, [x, -.34, z], metal, "y", 20);
  for (let column = 0; column < 14; column++) for (let row = 0; row < 7; row++) {
    const hole = mesh(stage, new THREE.CircleGeometry(.017, 10), dark, false); hole.rotation.x = -Math.PI / 2; hole.position.set(-1.58 + column * .275, -.014, -.825 + row * .275);
  }
  for (const z of [-1.03, 1.03]) line(stage, [new THREE.Vector3(-1.80, -.013, z), new THREE.Vector3(2.29, -.013, z)]);
  box(stage, [.64, .06, .84], [1.62, .02, 0], metal);
  for (const z of [-.39, .39]) { box(stage, [.60, .07, .045], [1.62, .08, z], dark); for (const x of [1.4, 1.85]) cylinder(stage, .032, .07, [x, .11, z], metal, "y", 6); }
  const coupon = cylinder(stage, .21, .31, [1.62, .21, 0], metal, "y", 48);
  cylinder(coupon, .105, .025, [0, .17, 0], dark, "y");

  const base = new THREE.Group(); base.position.x = armDimensions.baseX; root.add(base);
  box(base, [.67, .095, .68], [0, .06, 0], metal);
  for (const x of [-.25, .25]) for (const z of [-.25, .25]) cylinder(base, .036, .02, [x, .12, z], dark, "y", 6);
  cylinder(base, .235, .20, [0, .19, 0], dark, "y");
  cylinder(base, .255, .055, [0, .30, 0], metal, "y");
  box(base, [.35, .35, .35], [0, .48, 0], shell);
  for (const side of [-1, 1]) box(base, [.28, .09, .03], [0, .44, side * .19], dark);
  const shoulder = new THREE.Group(); shoulder.position.y = armDimensions.shoulderHeight; base.add(shoulder);
  link(shoulder, armDimensions.upper, .30, .30); hub(shoulder, .245, .42);
  const elbow = new THREE.Group(); elbow.position.y = armDimensions.upper; shoulder.add(elbow);
  link(elbow, armDimensions.forearm, .23, .235); hub(elbow, .205, .33);
  const wrist = new THREE.Group(); wrist.position.y = armDimensions.forearm; elbow.add(wrist);
  hub(wrist, .143, .27);
  box(wrist, [.16, .22, .16], [0, .14, 0], metal);
  cylinder(wrist, .105, .038, [0, .255, 0], dark, "y");
  box(wrist, [.22, .075, .31], [0, .30, 0], shell);
  const fingers = [-1, 1].map(side => {
    const finger = new THREE.Group(); wrist.add(finger); finger.position.z = side * .15;
    box(finger, [.10, .18, .045], [0, .36, 0], metal);
    box(finger, [.11, .03, .07], [0, .445, -side * .013], dark);
    return finger;
  });
  const camera = new THREE.Group(); camera.position.set(-.155, .24, 0); wrist.add(camera);
  box(camera, [.145, .18, .145], [0, .015, 0], dark);
  cylinder(camera, .051, .045, [0, .12, 0], metal, "y", 24);
  cylinder(camera, .038, .01, [0, .147, 0], lens, "y", 24);
  const lamp = mesh(camera, new THREE.SphereGeometry(.013, 10, 8), lampMaterial, false); lamp.position.set(.05, .09, .073);
  const scan = new THREE.Group(); camera.add(scan);
  for (const x of [-.14, .14]) for (const z of [-.12, .12]) line(scan, [new THREE.Vector3(0, .16, 0), new THREE.Vector3(x, .65, z)], scanMaterial);
  line(scan, [new THREE.Vector3(-.14, .65, -.12), new THREE.Vector3(.14, .65, -.12), new THREE.Vector3(.14, .65, .12), new THREE.Vector3(-.14, .65, .12), new THREE.Vector3(-.14, .65, -.12)], scanMaterial);
  const selectors = ([shoulder, elbow, wrist] as const).map((pivot, index) => {
    const ring = mesh(pivot, new THREE.RingGeometry([.26, .22, .16][index]!, [.29, .25, .19][index]!, 64), selectedMaterial, false);
    ring.position.z = [.27, .22, .19][index]!; return ring;
  });
  const axes = new THREE.Group(); wrist.add(axes); axes.position.y = armDimensions.tool;
  for (const endpoint of [[.20, 0, 0], [0, .20, 0], [0, 0, .20]]) line(axes, [new THREE.Vector3(), new THREE.Vector3(...endpoint)], edge);

  const ghostGeometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 4 }, () => new THREE.Vector3()));
  const ghost = new THREE.Line(ghostGeometry, ghostMaterial); ghost.renderOrder = 4; root.add(ghost);
  const ghostTip = mesh(root, new THREE.SphereGeometry(.035, 12, 8), selectedMaterial, false);
  const pivots = { shoulder, elbow, wrist };
  function apply(angles: ArmAngles, selected: JointId, aperture: number, cameraAvailable: boolean, draft: ArmAngles | null) {
    shoulder.rotation.z = -angles.shoulder * Math.PI / 180;
    elbow.rotation.z = -(90 + angles.elbow) * Math.PI / 180;
    wrist.rotation.z = -angles.wrist * Math.PI / 180;
    selectors.forEach((ring, index) => { ring.visible = (Object.keys(pivots)[index]) === selected; });
    fingers.forEach((finger, index) => { finger.position.z = (index === 0 ? -1 : 1) * (.055 + aperture / 100 * .11); });
    scan.visible = cameraAvailable; lamp.visible = cameraAvailable;
    ghost.visible = ghostTip.visible = draft != null;
    if (draft) {
      const s = draft.shoulder * Math.PI / 180, e = (draft.shoulder + 90 + draft.elbow) * Math.PI / 180;
      const { baseX, shoulderHeight, upper, forearm } = armDimensions;
      const end = armPose(draft);
      const points = [[baseX, shoulderHeight, 0], [baseX + upper * Math.sin(s), shoulderHeight + upper * Math.cos(s), 0], [baseX + upper * Math.sin(s) + forearm * Math.sin(e), shoulderHeight + upper * Math.cos(s) + forearm * Math.cos(e), 0], [end.x, end.y, end.z]];
      const positions = ghostGeometry.getAttribute("position") as THREE.BufferAttribute;
      points.forEach((point, index) => { positions.setXYZ(index, point[0]!, point[1]!, point[2]!); }); positions.needsUpdate = true; ghostGeometry.computeBoundingSphere(); ghost.computeLineDistances(); ghostTip.position.set(end.x, end.y, end.z);
    }
  }
  function dispose() {
    const geometries = new Set<THREE.BufferGeometry>();
    root.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Line) geometries.add(object.geometry); });
    geometries.forEach(geometry => { geometry.dispose(); }); Object.values(mats).forEach(material => { material.dispose(); }); gradient.dispose();
  }
  return { root, pivots, selectors, apply, mats, dispose };
}
