import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Matrix4, Quaternion, Vector3, EdgesGeometry, BufferGeometry, Float32BufferAttribute } from "three";

// Reproducible geometry-only adaptation of the author's official downloaded GLB.
const input = process.argv[2];
if (!input) throw new Error("Supply the officially downloaded bust_of_athena.glb path");
const file = await readFile(input);
if (file.readUInt32LE(0) !== 0x46546c67) throw new Error("Expected a binary glTF file");
const jsonLength = file.readUInt32LE(12);
const gltf = JSON.parse(file.subarray(20, 20 + jsonLength).toString());
const binStart = 20 + jsonLength + 8;
const binary = file.subarray(binStart);
function accessor(id) {
  const definition = gltf.accessors[id], view = gltf.bufferViews[definition.bufferView];
  const width = ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 })[definition.type];
  const component = ({ 5126: [4, "readFloatLE"], 5125: [4, "readUInt32LE"], 5123: [2, "readUInt16LE"], 5121: [1, "readUInt8"] })[definition.componentType];
  if (!component || !width) throw new Error("Unsupported attribute format");
  const stride = view.byteStride ?? width * component[0];
  return Array.from({ length: definition.count }, (_, row) => Array.from({ length: width }, (_, column) => binary[component[1]]((view.byteOffset ?? 0) + (definition.byteOffset ?? 0) + row * stride + column * component[0])));
}
const points = [], triangles = [];
function visit(id, parent) {
  const node = gltf.nodes[id];
  const local = node.matrix ? new Matrix4().fromArray(node.matrix) : new Matrix4().compose(new Vector3(...(node.translation ?? [0, 0, 0])), new Quaternion(...(node.rotation ?? [0, 0, 0, 1])), new Vector3(...(node.scale ?? [1, 1, 1])));
  const world = parent.clone().multiply(local);
  if (node.mesh != null) for (const primitive of gltf.meshes[node.mesh].primitives) {
    if (primitive.mode != null && primitive.mode !== 4) continue;
    const vertices = accessor(primitive.attributes.POSITION), offset = points.length;
    points.push(...vertices.map(point => new Vector3(...point).applyMatrix4(world)));
    triangles.push(...(primitive.indices == null ? vertices.map((_, index) => index + offset) : accessor(primitive.indices).map(([index]) => index + offset)));
  }
  for (const child of node.children ?? []) visit(child, world);
}
for (const id of gltf.scenes[gltf.scene ?? 0].nodes) visit(id, new Matrix4());
const minimum = new Vector3(Infinity, Infinity, Infinity), maximum = new Vector3(-Infinity, -Infinity, -Infinity);
for (const point of points) { minimum.min(point); maximum.max(point); }
const centre = minimum.clone().add(maximum).multiplyScalar(.5), scale = 2.8 / (maximum.y - minimum.y);
const welded = [], lookup = new Map(), remap = [];
for (const point of points) {
  point.sub(centre).multiplyScalar(scale);
  const values = point.toArray().map(value => Math.round(value * 10000)), key = values.join(",");
  if (!lookup.has(key)) { lookup.set(key, welded.length / 3); welded.push(...values); }
  remap.push(lookup.get(key));
}
const indices = triangles.map(index => remap[index]);
const contours = [];
// Parallel surface sections follow the face and helmet; no triangle diagonals are retained.
for (const [axis, spacing, rake] of [[1, .055, .55], [0, .125, -.40]]) {
  let low = Infinity, high = -Infinity;
  for (let index = 0; index < welded.length; index += 3) { const distance = (welded[index + axis] + rake * welded[index + 2]) / 10000; low = Math.min(low, distance); high = Math.max(high, distance); }
  for (let level = Math.ceil(low / spacing) * spacing; level < high; level += spacing) {
    for (let face = 0; face < indices.length; face += 3) {
      const vertices = [0, 1, 2].map(corner => welded.slice(indices[face + corner] * 3, indices[face + corner] * 3 + 3).map(value => value / 10000));
      const hits = [];
      for (let side = 0; side < 3; side++) {
        const a = vertices[side], b = vertices[(side + 1) % 3], da = a[axis] + rake * a[2] - level, db = b[axis] + rake * b[2] - level;
        if ((da <= 0 && db > 0) || (db <= 0 && da > 0)) { const t = da / (da - db); hits.push(a.map((value, coordinate) => value + (b[coordinate] - value) * t)); }
      }
      if (hits.length === 2) for (const hit of hits) contours.push(...hit.map(value => Math.round(value * 10000)));
    }
  }
}
const geometry = new BufferGeometry(); geometry.setAttribute("position", new Float32BufferAttribute(welded.map(value => value / 10000), 3)); geometry.setIndex(indices);
const features = new EdgesGeometry(geometry, 30);
const featurePositions = Array.from(features.getAttribute("position").array).map(value => Math.round(value * 10000));
const output = fileURLToPath(new URL("../public/interfaces/concepts/", import.meta.url));
await mkdir(output, { recursive: true });
await writeFile(output + "athena-lines.json", JSON.stringify({ positions: welded, indices, contours, features: featurePositions }));
await writeFile(output + "athena-license.json", JSON.stringify({ title: gltf.asset.extras.title, author: gltf.asset.extras.author, source: gltf.asset.extras.source, license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", originalSha256: createHash("sha256").update(file).digest("hex"), adaptation: "Textures and materials removed; geometry normalized and welded. Thin surface-section, crease and silhouette curves derived for an animated line portrait. Static fallback projected from the same geometry.", preparation: "node apps/www/scripts/prepare-athena-model.mjs /path/to/bust_of_athena.glb" }, null, 2) + "\n");
console.log({ vertices: welded.length / 3, triangles: indices.length / 3, contourSegments: contours.length / 6, featureSegments: featurePositions.length / 6 });
geometry.dispose(); features.dispose();

// A transparent, same-geometry static portrait for the gallery and WebGL fallback.
const width = 600, height = 700, span = 3.05, angle = -.23, cosine = Math.cos(angle), sine = Math.sin(angle);
const project = point => { const [x, y, z] = point; return [(x * cosine + z * sine) / span * height + width / 2, (.04 - y) / span * height + height / 2, -x * sine + z * cosine]; };
const vertices = Array.from({ length: welded.length / 3 }, (_, index) => welded.slice(index * 3, index * 3 + 3).map(value => value / 10000));
const projected = vertices.map(project);
const zBuffer = new Float32Array(width * height).fill(-Infinity);
for (let face = 0; face < indices.length; face += 3) {
  const a = projected[indices[face]], b = projected[indices[face + 1]], c = projected[indices[face + 2]];
  const denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  if (Math.abs(denominator) < 1e-8) continue;
  const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))), maxX = Math.min(width - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))), maxY = Math.min(height - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const u = ((b[1] - c[1]) * (x + .5 - c[0]) + (c[0] - b[0]) * (y + .5 - c[1])) / denominator;
    const v = ((c[1] - a[1]) * (x + .5 - c[0]) + (a[0] - c[0]) * (y + .5 - c[1])) / denominator;
    if (u < -.0001 || v < -.0001 || u + v > 1.0001) continue;
    const z = a[2] * u + b[2] * v + c[2] * (1 - u - v), pixel = y * width + x;
    if (z > zBuffer[pixel]) zBuffer[pixel] = z;
  }
}
const adjacency = new Map(), silhouette = [];
for (let face = 0; face < indices.length; face += 3) {
  const ids = indices.slice(face, face + 3), a = new Vector3(...vertices[ids[0]]), b = new Vector3(...vertices[ids[1]]), c = new Vector3(...vertices[ids[2]]);
  const normal = b.sub(a).cross(c.sub(a)).normalize();
  const facing = normal.x * -sine + normal.z * cosine;
  for (let side = 0; side < 3; side++) {
    const a = ids[side], b = ids[(side + 1) % 3], key = a < b ? `${a}:${b}` : `${b}:${a}`;
    const previous = adjacency.get(key);
    if (previous) { previous.other = facing; }
    else adjacency.set(key, { a, b, facing });
  }
}
for (const edge of adjacency.values()) if (edge.other == null || edge.facing * edge.other <= 0) silhouette.push(...welded.slice(edge.a * 3, edge.a * 3 + 3), ...welded.slice(edge.b * 3, edge.b * 3 + 3));
function pathFor(lines, visible) {
  const pieces = [];
  for (let index = 0; index < lines.length; index += 6) {
    const a = project(lines.slice(index, index + 3).map(value => value / 10000)), b = project(lines.slice(index + 3, index + 6).map(value => value / 10000));
    const count = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3));
    for (let sample = 0; sample < count; sample++) {
      const t = (sample + .5) / count, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, z = a[2] + (b[2] - a[2]) * t;
      if (visible && (x < 0 || x >= width || y < 0 || y >= height || z < zBuffer[Math.floor(y) * width + Math.floor(x)] - .009)) continue;
      const from = sample / count, to = (sample + 1) / count;
      pieces.push(`M${(a[0] + (b[0] - a[0]) * from).toFixed(2)} ${(a[1] + (b[1] - a[1]) * from).toFixed(2)}L${(a[0] + (b[0] - a[0]) * to).toFixed(2)} ${(a[1] + (b[1] - a[1]) * to).toFixed(2)}`);
    }
  }
  return pieces.join("");
}
await writeFile(output + "athena-still.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" stroke="#000" stroke-width="1.25"><title>Athena bust, contour portrait</title><desc>Adapted from Bust of Athena by yugengen, CC BY 4.0. ${gltf.asset.extras.source}</desc><path opacity=".025" d="${pathFor(contours, false)}"/><path opacity=".24" d="${pathFor(contours, true)}"/><path opacity=".50" d="${pathFor(featurePositions, true)}"/><path opacity=".75" d="${pathFor(silhouette, true)}"/></svg>\n`);
