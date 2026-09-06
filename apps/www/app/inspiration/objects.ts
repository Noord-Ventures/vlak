import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Study } from "./collection";

type Point = readonly [number, number];
type Corners = readonly [Point, Point, Point, Point];

const ink = () => new THREE.MeshStandardMaterial({ color: 0x242424, metalness: 0.45, roughness: 0.42 });
const paper = () => new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.94 });
const silver = () => new THREE.MeshStandardMaterial({ color: 0xb8b8b8, metalness: 0.85, roughness: 0.29 });

function box(group: THREE.Group, width: number, height: number, depth: number, material: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function rod(group: THREE.Group, from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material) {
  const direction = to.clone().sub(from);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 10), material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  group.add(mesh);
}

/** Fit a work without stretching its artwork, including unusually wide printed matter. */
function imageSize(texture: THREE.Texture, maxWidth = 2.8, maxHeight = 2.55) {
  const source = texture.image as { width: number; height: number };
  const ratio = source.width / source.height;
  const height = Math.min(maxHeight, maxWidth / ratio);
  return { width: height * ratio, height };
}

/**
 * A subdivided front mesh samples a photographed quadrilateral projectively.
 * The source image stays intact; only mesh UVs rectify its perspective, removing
 * the surrounding wall or ceiling from the physically modelled sign face.
 * Corners are source-image fractions: top left, top right, bottom right, bottom left.
 */
function faceGeometry(width: number, height: number, corners?: Corners) {
  const geometry = new THREE.PlaneGeometry(width, height, corners ? 16 : 1, corners ? 16 : 1);
  if (!corners) return geometry;
  const [a, b, c, d] = corners;
  const dx1 = b[0] - c[0];
  const dx2 = d[0] - c[0];
  const dy1 = b[1] - c[1];
  const dy2 = d[1] - c[1];
  const sx = a[0] - b[0] + c[0] - d[0];
  const sy = a[1] - b[1] + c[1] - d[1];
  const determinant = dx1 * dy2 - dx2 * dy1;
  const g = Math.abs(determinant) < 1e-9 ? 0 : (sx * dy2 - dx2 * sy) / determinant;
  const h = Math.abs(determinant) < 1e-9 ? 0 : (dx1 * sy - sx * dy1) / determinant;
  const x1 = b[0] - a[0] + g * b[0];
  const x2 = d[0] - a[0] + h * d[0];
  const y1 = b[1] - a[1] + g * b[1];
  const y2 = d[1] - a[1] + h * d[1];
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < uv.count; index++) {
    const u = uv.getX(index);
    const v = 1 - uv.getY(index);
    const denominator = g * u + h * v + 1;
    uv.setXY(index, (x1 * u + x2 * v + a[0]) / denominator, 1 - (y1 * u + y2 * v + a[1]) / denominator);
  }
  return geometry;
}

function artwork(texture: THREE.Texture, roughness = 0.82) {
  return new THREE.MeshStandardMaterial({ map: texture, color: 0xbcbcbc, roughness, envMapIntensity: 0.5, metalness: 0 });
}

function addFace(group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, y: number, z: number) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, y, z);
  group.add(mesh);
  return mesh;
}

/** Rear easel and broad feet make a framed sheet an object with a credible reverse. */
function easel(group: THREE.Group, width: number, height: number, bottom: number, material: THREE.Material) {
  for (const side of [-1, 1]) {
    const x = side * width * 0.29;
    box(group, 0.18, 0.035, 0.6, material, x, 0.0175, -0.22);
    rod(group, new THREE.Vector3(x, 0.035, -0.46), new THREE.Vector3(x, bottom + height * 0.64, -0.08), 0.016, material);
    rod(group, new THREE.Vector3(x, 0.035, 0.035), new THREE.Vector3(x, bottom + 0.18, -0.055), 0.012, material);
  }
}

/**
 * Closed books have two distinct cover boards, a rounded binding, a recessed
 * page block and fine fore-edge signatures. The unrecorded reverse is left plain.
 * A low archival rest accounts for the existing 120 mm lift above the floor.
 */
function book(texture: THREE.Texture, study: Study) {
  const group = new THREE.Group();
  const { width, height } = imageSize(texture, 2.9);
  const depth = ["micorene", "letter-op-straat", "neue-grafik"].includes(study.id) ? 0.055 : 0.115;
  const bottom = 0.12;
  const center = bottom + height / 2;
  const stock = paper();
  const binding = new THREE.MeshStandardMaterial({ color: 0x747474, roughness: 0.72 });
  const edges = new THREE.MeshStandardMaterial({ color: 0xc3c3c3, roughness: 1 });
  box(group, width - 0.04, height - 0.035, depth - 0.026, stock, 0.012, center);
  box(group, width, height, 0.012, binding, 0, center, -depth / 2);
  box(group, width, height, 0.012, stock, 0, center, depth / 2);
  addFace(group, faceGeometry(width, height), artwork(texture), center, depth / 2 + 0.0065);
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(depth / 2, depth / 2, height, 12, 1, false, Math.PI, Math.PI), binding);
  spine.position.set(-width / 2 + 0.023, center, 0);
  group.add(spine);
  box(group, 0.004, height, 0.002, edges, -width / 2 + 0.049, center, depth / 2 + 0.007);
  const signatures: THREE.BufferGeometry[] = [];
  for (let page = 1; page < 13; page++) {
    const z = (page / 13 - 0.5) * (depth - 0.026);
    signatures.push(new THREE.BoxGeometry(width - 0.04, 0.0013, 0.0007).translate(0.012, center + (height - 0.035) / 2 + 0.0005, z));
    signatures.push(new THREE.BoxGeometry(0.0008, height - 0.035, 0.0007).translate(width / 2 - 0.007, center, z));
  }
  group.add(new THREE.Mesh(mergeGeometries(signatures), edges));
  for (const geometry of signatures) geometry.dispose();
  box(group, width * 0.56, bottom, 0.36, new THREE.MeshStandardMaterial({ color: 0xd4d4d4, roughness: 0.8 }), 0, bottom / 2, -0.025);
  return group;
}

/** Paper on a thin backing with a narrow powder-coated frame and rear easel. */
function poster(texture: THREE.Texture) {
  const group = new THREE.Group();
  const { width, height } = imageSize(texture, 2.75, 2.5);
  const bottom = 0.12;
  const center = bottom + height / 2;
  const frame = ink();
  box(group, width + 0.08, height + 0.08, 0.032, paper(), 0, center, -0.02);
  addFace(group, faceGeometry(width, height), artwork(texture, 0.92), center, 0.001);
  for (const side of [-1, 1]) {
    box(group, 0.032, height + 0.112, 0.075, frame, side * (width / 2 + 0.04), center);
    box(group, width + 0.048, 0.032, 0.075, frame, 0, center + side * (height / 2 + 0.04));
  }
  box(group, width * 0.66, 0.035, 0.03, frame, 0, center + height * 0.22, -0.051);
  easel(group, width, height, bottom, frame);
  return group;
}

/** Interpretive display supports; the source does not document an original reverse. */
function sign(texture: THREE.Texture, study: Study) {
  if (study.id.includes("vught")) return memorial(texture);
  const airport = study.id.includes("schiphol");
  const width = airport ? 2.95 : 1.54;
  const height = airport ? 1.66 : 2.58;
  const bottom = airport ? 0.8 : 0.12;
  const depth = airport ? 0.16 : 0.06;
  const center = bottom + height / 2;
  const group = new THREE.Group();
  const structure = ink();
  // These four corners follow the physical panel visible in the existing About photograph.
  const corners: Corners = airport
    ? [[0.09, 0.06], [0.872, 0.265], [0.948, 0.853], [0.082, 0.82]]
    : [[0.36, 0.033], [0.669, 0.219], [0.705, 0.954], [0.347, 0.96]];
  box(group, width + 0.045, height + 0.045, depth, structure, 0, center);
  const enamel = new THREE.MeshPhysicalMaterial({ map: texture, color: 0xc8c8c8, metalness: airport ? 0.1 : 0.24, roughness: airport ? 0.48 : 0.32, clearcoat: airport ? 0.15 : 0.65, clearcoatRoughness: 0.3 });
  addFace(group, faceGeometry(width, height, corners), enamel, center, depth / 2 + 0.002);
  box(group, width - 0.07, height - 0.07, 0.012, new THREE.MeshStandardMaterial({ color: 0x484848, metalness: 0.55, roughness: 0.46 }), 0, center, -depth / 2 - 0.008);
  const hardware = silver();
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 12), hardware);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x * (width / 2 - 0.035), center + y * (height / 2 - 0.035), depth / 2 + 0.006);
    group.add(screw);
  }
  if (airport) {
    for (const side of [-1, 1]) {
      const x = side * width * 0.37;
      box(group, 0.055, center, 0.065, structure, x, center / 2, -0.08);
      box(group, 0.42, 0.045, 0.7, structure, x, 0.0225, -0.08);
      box(group, 0.15, 0.12, 0.045, hardware, x, center - 0.04, -depth / 2 - 0.027);
    }
  } else easel(group, width, height, bottom, structure);
  return group;
}

/** A thick wall fragment with the photographed memorial recess carried into its mesh. */
function memorial(texture: THREE.Texture) {
  const group = new THREE.Group();
  const { width, height } = imageSize(texture, 2.9, 2.35);
  const bottom = 0.07;
  const stone = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.98 });
  box(group, width, height, 0.19, stone, 0, bottom + height / 2, -0.14);
  const geometry = new THREE.PlaneGeometry(width, height, 72, 54);
  const profile: Point[] = [[506, 197], [724, 197], [724, 252], [670, 252], [670, 306], [728, 306], [728, 367], [785, 367], [785, 423], [729, 423], [729, 477], [841, 477], [841, 709], [616, 709], [616, 652], [449, 652], [449, 597], [506, 597], [506, 539], [227, 539], [227, 484], [283, 484], [283, 424], [336, 424], [336, 371], [284, 371], [284, 310], [338, 310], [338, 253], [506, 253]];
  const positions = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < positions.count; index++) {
    const x = uv.getX(index) * 1200;
    const y = (1 - uv.getY(index)) * 900;
    let inside = false;
    for (let i = 0, j = profile.length - 1; i < profile.length; j = i++) {
      const a = profile[i]!;
      const b = profile[j]!;
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    positions.setZ(index, inside ? -0.042 : 0.024);
  }
  geometry.computeVertexNormals();
  addFace(group, geometry, artwork(texture, 0.98), bottom + height / 2, 0);
  box(group, width * 0.84, bottom, 0.56, ink(), 0, bottom / 2, -0.1);
  return group;
}

/** Silver medal: cropped circular face, modest relief, milled rim and plain reverse. */
function coin(texture: THREE.Texture) {
  const group = new THREE.Group();
  const radius = 1.12;
  const center = 1.26;
  const metal = silver();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.1, 96), metal);
  body.rotation.x = Math.PI / 2;
  body.position.y = center;
  group.add(body);
  const disc = new THREE.CircleGeometry(radius - 0.021, 96);
  const uv = disc.getAttribute("uv");
  // Crop to the coin's circular perimeter in the supplied 822 × 841 photograph.
  for (let index = 0; index < uv.count; index++) uv.setXY(index, 0.042 + uv.getX(index) * 0.918, 0.049 + uv.getY(index) * 0.904);
  addFace(group, disc, new THREE.MeshStandardMaterial({ map: texture, bumpMap: texture, bumpScale: 0.012, color: 0xcfcfcf, roughness: 0.43, metalness: 0.48 }), center, 0.051);
  for (const z of [-0.052, 0.052]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius - 0.015, 0.017, 8, 96), metal);
    rim.position.set(0, center, z);
    group.add(rim);
  }
  const ridges: THREE.BufferGeometry[] = [];
  for (let index = 0; index < 96; index++) {
    const angle = index / 96 * Math.PI * 2;
    ridges.push(new THREE.BoxGeometry(0.009, 0.018, 0.076).rotateZ(angle).translate(-Math.sin(angle) * radius, center + Math.cos(angle) * radius, 0));
  }
  group.add(new THREE.Mesh(mergeGeometries(ridges), metal));
  for (const geometry of ridges) geometry.dispose();
  const base = ink();
  box(group, 1.28, 0.11, 0.58, base, 0, 0.055, 0);
  for (const side of [-1, 1]) box(group, 0.07, 0.13, 0.2, base, side * 0.38, 0.175, 0.015);
  return group;
}

/** The physical format follows collection metadata; historical backs are not invented. */
export function createStudyObject(study: Study, texture: THREE.Texture): THREE.Group {
  switch (study.representation) {
    case "poster": return poster(texture);
    case "sign": return sign(texture, study);
    case "sculpture": return coin(texture);
    default: return book(texture, study);
  }
}
