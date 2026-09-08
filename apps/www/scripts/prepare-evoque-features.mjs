import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

/**
 * Prepare sparse linework from the licensed Evoque's actual topology.
 * The source GLB and all its surface triangles remain unchanged.
 *
 *   node apps/www/scripts/prepare-evoque-features.mjs
 *   node apps/www/scripts/prepare-evoque-features.mjs --check
 *
 * Material chunks are welded by position before boundary tracing. Named chains
 * select glazing, lamps, panels and trim; front-facing creases preserve the
 * original split-spoke alloy. RDP removes redundant samples within 2–5mm at
 * the renderer's 5.06-unit length. The source hash locks curated chain indices
 * to the geometry they were selected from.
 */
const sourcePath = fileURLToPath(
  new URL("../public/interfaces/concepts/evoque-monochrome.glb", import.meta.url),
);
const outputPath = fileURLToPath(
  new URL("../public/interfaces/concepts/evoque-feature-lines.json", import.meta.url),
);
const data = readFileSync(sourcePath);
const sourceSha256 = createHash("sha256").update(data).digest("hex");
if (sourceSha256 !== "661396e418004714e7ff3d187692e26ac3e09c89618592a5c01058d0e6e7739a") {
  throw new Error("The licensed Evoque source changed; review the selected feature chains before regenerating.");
}
const { scene } = await new GLTFLoader().parseAsync(
  data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
  "",
);
const turn = new THREE.Group();
turn.rotation.y = -Math.PI / 2;
turn.add(scene);
turn.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(turn),
  scale = 5.06 / box.getSize(new THREE.Vector3()).x,
  center = box.getCenter(new THREE.Vector3());
const normalize = new THREE.Matrix4()
  .makeScale(scale, scale, scale)
  .multiply(new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z));
const groups = new Map();
const sourceMeshes = new Map(),
  raycaster = new THREE.Raycaster(),
  rayMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
scene.traverse((o) => {
  if (!o.isMesh) return;
  const g = o.geometry.clone().applyMatrix4(normalize.clone().multiply(o.matrixWorld)),
    name = o.material.name;
  if (!groups.has(name)) groups.set(name, { vertices: [], normals: [], triangles: [], lookup: new Map() });
  if (!sourceMeshes.has(name)) sourceMeshes.set(name, []);
  const rayMesh = new THREE.Mesh(g, rayMaterial);
  rayMesh.updateMatrixWorld();
  sourceMeshes.get(name).push(rayMesh);
  const d = groups.get(name),
    ids = [];
  for (let i = 0; i < g.attributes.position.count; i++) {
    const p = new THREE.Vector3().fromBufferAttribute(g.attributes.position, i).toArray(),
      key = p.map((v) => Math.round(v * 1e5)).join(",");
    if (!d.lookup.has(key)) {
      d.lookup.set(key, d.vertices.length);
      d.vertices.push(p);
      d.normals.push([0, 0, 0]);
    }
    const normal = new THREE.Vector3().fromBufferAttribute(g.attributes.normal, i).toArray();
    const ni = d.lookup.get(key);
    d.normals[ni] = d.normals[ni].map((v, k) => v + normal[k]);
    ids.push(d.lookup.get(key));
  }
  for (let i = 0; i < g.index.count; i += 3)
    d.triangles.push([ids[g.index.array[i]], ids[g.index.array[i + 1]], ids[g.index.array[i + 2]]]);
});
for (const d of groups.values())
  d.normals = d.normals.map((n) => new THREE.Vector3(...n).normalize().toArray());
const result = {};
for (const [name, d] of groups) {
  const map = new Map();
  for (const tri of d.triangles)
    for (let i = 0; i < 3; i++) {
      const a = tri[i],
        b = tri[(i + 1) % 3],
        key = [Math.min(a, b), Math.max(a, b)].join(",");
      const e = map.get(key);
      if (e) e.count++;
      else map.set(key, { a, b, count: 1 });
    }
  const edges = [...map.values()].filter((e) => e.count === 1),
    connections = new Map();
  for (let i = 0; i < edges.length; i++) {
    const { a, b } = edges[i];
    for (const v of [a, b]) {
      if (!connections.has(v)) connections.set(v, []);
      connections.get(v).push(i);
    }
  }
  const unused = new Set(edges.map((_edge, i) => i));
  const chains = [];
  while (unused.size) {
    const first = unused.values().next().value,
      firstEdge = edges[first];
    let start = firstEdge.a;
    if (connections.get(firstEdge.b).length !== 2) start = firstEdge.b;
    else if (connections.get(firstEdge.a).length === 2) {
      const branch = [...unused].find(
        (i) => connections.get(edges[i].a).length !== 2 || connections.get(edges[i].b).length !== 2,
      );
      if (branch !== undefined) {
        const e = edges[branch];
        start = connections.get(e.a).length !== 2 ? e.a : e.b;
      }
    }
    const ids = [start];
    let current = start;
    while (true) {
      const ei = connections.get(current)?.find((i) => unused.has(i));
      if (ei === undefined) break;
      unused.delete(ei);
      const e = edges[ei];
      current = e.a === current ? e.b : e.a;
      ids.push(current);
      if (current === start || connections.get(current).length !== 2) break;
    }
    const points = ids.map((i) => d.vertices[i]);
    let length = 0;
    const bounds = new THREE.Box3();
    points.forEach((p, i) => {
      bounds.expandByPoint(new THREE.Vector3(...p));
      if (i) length += new THREE.Vector3(...p).distanceTo(new THREE.Vector3(...points[i - 1]));
    });
    chains.push({
      id: chains.length,
      closed: ids[0] === ids.at(-1),
      length,
      min: bounds.min.toArray(),
      max: bounds.max.toArray(),
      points,
    });
  }
  result[name] = chains;
}

// These are the source model's welded material-boundary chains. Selecting complete
// named features preserves its design while excluding badge letters, grille mesh,
// internal lamps, fasteners and brake hardware from visible linework.
const selected = {
  Carro_Vidros: {
    10: "right rear quarter window",
    11: "right front window",
    12: "right rear window",
    47: "left rear quarter window",
    48: "left front window",
    49: "left rear window",
    62: "windshield",
    63: "rear screen",
    8: "right headlamp",
    83: "left headlamp",
    9: "right taillamp",
    54: "left taillamp",
  },
  Carro_Pintura: {
    6: "spoiler perimeter",
    9: "roof perimeter",
    18: "shoulder perimeter",
    19: "right front handle",
    20: "right rear handle",
    21: "left front handle",
    22: "left rear handle",
    35: "front bumper lower",
    13: "rear bumper upper",
  },
  Carro_Plastico: {
    32: "right fender vent",
    88: "left fender vent",
    86: "upper grille perimeter",
    72: "lower grille perimeter",
    0: "right upper bumper vent",
    2: "right lower bumper vent",
    17: "left upper bumper vent",
    19: "left lower bumper vent",
  },
  Carro_Espelhos: { 1: "left mirror glass", 2: "right mirror glass" },
  Carro_Plastico_1: { 74: "right mirror housing", 87: "left mirror housing" },
};

function distanceToSegment(point, start, end) {
  const segment = end.map((v, i) => v - start[i]),
    length = segment.reduce((sum, v) => sum + v * v, 0);
  const ratio = length
    ? Math.max(0, Math.min(1, point.reduce((sum, v, i) => sum + (v - start[i]) * segment[i], 0) / length))
    : 0;
  return Math.hypot(...point.map((v, i) => v - start[i] - ratio * segment[i]));
}
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let farthest = 0,
    index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = distanceToSegment(points[i], points[0], points.at(-1));
    if (distance > farthest) {
      farthest = distance;
      index = i;
    }
  }
  if (farthest <= tolerance) return [points[0], points.at(-1)];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}
function feature(material, id, name, pivot = [0, 0, 0], tolerance = 0.005, chain = result[material]?.[id]) {
  if (!chain) throw new Error(`Missing source feature ${material}/${id}`);
  const d = groups.get(material);
  const mainPath = /rocker|spoiler|roof perimeter|shoulder perimeter|mirror|bonnet|rear quarter seam/.test(name);
  // Project intermediate samples too: an endpoint can sit on the exterior while
  // a long simplified chord cuts back through the original curved body.
  const samples = mainPath ? chain.points.flatMap((point, index) => {
    if (!index) return [point];
    const previous = chain.points[index - 1];
    const steps = Math.ceil(Math.hypot(...point.map((v, i) => v - previous[i])) / 0.018);
    return Array.from({ length: steps }, (_, step) => point.map((v, i) => previous[i] + (v - previous[i]) * (step + 1) / steps));
  }) : chain.points;
  const lifted = samples.map((p) => {
    const id = d.lookup.get(p.map((v) => Math.round(v * 1e5)).join(","));
    let direction;
    if (
      material === "Carro_Roda_1" ||
      name.includes("window") ||
      name.includes("mirror") ||
      name.includes("panel") ||
      name.includes("arch") ||
      name.includes("shoulder crease") ||
      name.includes("rocker") ||
      name.includes("fender vent") ||
      name.includes("handle") ||
      name.includes("rear quarter seam") ||
      name === "wheel hub"
    )
      direction = new THREE.Vector3(0, 0, Math.sign(p[2]));
    else if (/roof perimeter|spoiler/.test(name)) direction = new THREE.Vector3(0, 0.7, Math.sign(p[2]) * 0.7).normalize();
    else if (name === "shoulder perimeter") direction = Math.abs(p[2]) > 0.5 ? new THREE.Vector3(0, 0, Math.sign(p[2])) : new THREE.Vector3(Math.sign(p[0]), 0.4, 0).normalize();
    else if (name.includes("bonnet")) direction = new THREE.Vector3(name.includes("front") ? -0.5 : 0, 0.7, Math.sign(p[2]) * 0.7).normalize();
    else if (name === "windshield") direction = new THREE.Vector3(-0.5, 0.866, 0);
    else if (name === "rear screen") direction = new THREE.Vector3(0.8, 0.6, 0);
    else if (name.includes("grille")) direction = new THREE.Vector3(-1, 0, 0);
    else if (name.includes("bumper vent"))
      direction = new THREE.Vector3(-0.7, 0, Math.sign(p[2]) * 0.7).normalize();
    else if (name.includes("headlamp"))
      direction = new THREE.Vector3(-0.7, 0.2, Math.sign(p[2]) * 0.7).normalize();
    else if (name.includes("taillamp"))
      direction = new THREE.Vector3(0.7, 0.1, Math.sign(p[2]) * 0.7).normalize();
    if (direction) {
      // Open glazing boundaries sit on the pane's rear edge. Project them onto
      // nearby original outer faces so the simplified chords do not disappear
      // inside the glass or frame. A 6mm clearance permits normal depth testing;
      // the source surface is never moved or replaced.
      const travel = name.includes("mirror") ? 0.25 : name.includes("rocker") ? 0.18 : material === "Carro_Roda_1" ? 0.15 : 0.05;
      const origin = new THREE.Vector3(...p).addScaledVector(direction, travel);
      raycaster.set(origin, direction.clone().negate());
      raycaster.near = 0;
      raycaster.far = travel + 0.01;
      const hit = raycaster.intersectObjects(
        material === "Carro_Roda_1" ? sourceMeshes.get(material) : [...sourceMeshes.values()].flat(),
        false,
      )[0];
      if (hit) return hit.point.addScaledVector(direction, 0.006).toArray();
      return new THREE.Vector3(...p).addScaledVector(direction, 0.006).toArray();
    }
    return p.map((v, i) => v + d.normals[id][i] * 0.006);
  });
  const points = simplify(lifted, mainPath ? Math.min(tolerance, 0.0015) : tolerance);
  if (chain.closed) points.pop();
  return {
    name,
    source: { material, chain: id },
    closed: chain.closed,
    points: points.map((p) => p.map((v, i) => +(v - pivot[i]).toFixed(5))),
  };
}
const paint = groups.get("Carro_Pintura"),
  pm = new Map();
for (const t of paint.triangles) {
  const [a, b, c] = t.map((i) => new THREE.Vector3(...paint.vertices[i])),
    n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
  for (let k = 0; k < 3; k++) {
    const a = t[k],
      b = t[(k + 1) % 3],
      key = [Math.min(a, b), Math.max(a, b)].join(",");
    if (!pm.has(key)) pm.set(key, { a, b, normals: [] });
    pm.get(key).normals.push(n);
  }
}
const pe = [...pm.values()].filter(
  (e) => e.normals.length === 2 && e.normals[0].dot(e.normals[1]) < Math.cos(Math.PI / 6),
);
const pc = new Map();
for (let i = 0; i < pe.length; i++)
  for (const v of [pe[i].a, pe[i].b]) {
    if (!pc.has(v)) pc.set(v, []);
    pc.get(v).push(i);
  }
const pr = new Set(pe.map((_edge, i) => i)),
  paintCreases = [];
while (pr.size) {
  const first = pr.values().next().value,
    e = pe[first];
  let start = e.a;
  const branch = [...pr].find((i) => pc.get(pe[i].a).length !== 2 || pc.get(pe[i].b).length !== 2);
  if (branch !== undefined) {
    const e = pe[branch];
    start = pc.get(e.a).length !== 2 ? e.a : e.b;
  }
  const ids = [start];
  let current = start;
  while (true) {
    const ei = pc.get(current)?.find((i) => pr.has(i));
    if (ei === undefined) break;
    pr.delete(ei);
    const e = pe[ei];
    current = e.a === current ? e.b : e.a;
    ids.push(current);
    if (current === start || pc.get(current).length !== 2) break;
  }
  const points = ids.map((i) => paint.vertices[i]);
  let length = 0;
  const bounds = new THREE.Box3();
  points.forEach((p, i) => {
    bounds.expandByPoint(new THREE.Vector3(...p));
    if (i) length += new THREE.Vector3(...p).distanceTo(new THREE.Vector3(...points[i - 1]));
  });
  paintCreases.push({
    id: paintCreases.length,
    closed: ids[0] === ids.at(-1),
    length,
    min: bounds.min.toArray(),
    max: bounds.max.toArray(),
    points,
  });
}

const body = Object.entries(selected).flatMap(([material, features]) =>
  Object.entries(features).map(([id, name]) => feature(material, Number(id), name)),
);
const selectedPaintCreases = {
  1028: "right front rocker crest",
  1066: "right rear rocker crest",
  1128: "left front rocker crest",
  1138: "left rear rocker crest",
  1629: "bonnet front edge",
  1611: "bonnet cowl edge",
  1604: "left bonnet shoulder",
  1632: "right bonnet shoulder",
  551: "left rear quarter seam",
  624: "right rear quarter seam",
  349: "left front panel seam",
  481: "right front panel seam",
  339: "left middle panel seam",
  491: "right middle panel seam",
  684: "left upper middle panel seam",
  721: "right upper middle panel seam",
  555: "left rear panel seam",
  615: "right rear panel seam",
  374: "left front arch leading",
  357: "left front arch trailing",
  587: "right front arch leading",
  473: "right front arch trailing",
  334: "left rear arch leading",
  554: "left rear arch crown",
  310: "left rear arch trailing",
  500: "right rear arch leading",
  616: "right rear arch crown",
  516: "right rear arch trailing",
  635: "left front shoulder crease",
  985: "left rear shoulder crease",
  831: "right front shoulder crease",
  752: "right rear shoulder crease",
};
for (const [id, name] of Object.entries(selectedPaintCreases)) {
  const line = feature("Carro_Pintura", Number(id), name, [0, 0, 0], 0.004, paintCreases[Number(id)]);
  line.source.method = "paint crease";
  body.push(line);
}
const tire = groups.get("Carro_Pneu");
const wheelBounds = Array.from({ length: 4 }, () => new THREE.Box3());
for (const p of tire.vertices)
  wheelBounds[(p[0] < 0 ? 0 : 2) + (p[2] < 0 ? 0 : 1)].expandByPoint(new THREE.Vector3(...p));
const rimChains = [24, 0, 52, 80];
const wheels = wheelBounds.map((bounds, i) => {
  const pivot = bounds.getCenter(new THREE.Vector3()).toArray();
  return {
    pivot: pivot.map((v) => +v.toFixed(6)),
    lines: [feature("Carro_Roda_1", rimChains[i], "rim perimeter", pivot, 0.003)],
  };
});

// The wheel's open boundaries are behind its front face. Keep the creator's
// split-spoke ridge where a front-facing face turns into a side face instead.
// This excludes every tyre tread, bolt and brake edge.
const rim = groups.get("Carro_Roda_1"),
  ridgeEdges = new Map();
for (const triangle of rim.triangles) {
  const points = triangle.map((id) => new THREE.Vector3(...rim.vertices[id]));
  const normal = new THREE.Vector3()
    .subVectors(points[1], points[0])
    .cross(new THREE.Vector3().subVectors(points[2], points[0]))
    .normalize();
  for (let i = 0; i < 3; i++) {
    const a = triangle[i],
      b = triangle[(i + 1) % 3],
      key = [Math.min(a, b), Math.max(a, b)].join(",");
    if (!ridgeEdges.has(key)) ridgeEdges.set(key, { a, b, normals: [] });
    ridgeEdges.get(key).normals.push(normal);
  }
}
const ridges = [...ridgeEdges.values()].filter((edge) => {
  const a = rim.vertices[edge.a],
    b = rim.vertices[edge.b];
  const middle = a.map((v, i) => (v + b[i]) / 2),
    key = (middle[0] < 0 ? 0 : 2) + (middle[2] < 0 ? 0 : 1);
  const pivot = wheels[key].pivot,
    radius = Math.hypot(middle[0] - pivot[0], middle[1] - pivot[1]);
  const facing = edge.normals.map((n) => n.z * Math.sign(middle[2]));
  return (
    Math.abs(middle[2]) > 1.005 &&
    radius > 0.11 &&
    radius < 0.322 &&
    [a, b].every((p) => Math.hypot(p[0] - pivot[0], p[1] - pivot[1]) > 0.095) &&
    edge.normals.length === 2 &&
    edge.normals[0].dot(edge.normals[1]) < Math.cos(Math.PI / 6) &&
    Math.max(...facing) > 0.75 &&
    Math.min(...facing) < 0.6
  );
});
const connected = new Map();
for (let i = 0; i < ridges.length; i++)
  for (const v of [ridges[i].a, ridges[i].b]) {
    if (!connected.has(v)) connected.set(v, []);
    connected.get(v).push(i);
  }
const remaining = new Set(ridges.map((_edge, i) => i));
while (remaining.size) {
  const first = remaining.values().next().value,
    edge = ridges[first];
  let start = edge.a;
  const branch = [...remaining].find(
    (i) => connected.get(ridges[i].a).length !== 2 || connected.get(ridges[i].b).length !== 2,
  );
  if (branch !== undefined) {
    const e = ridges[branch];
    start = connected.get(e.a).length !== 2 ? e.a : e.b;
  }
  const ids = [start];
  let current = start;
  while (true) {
    const ei = connected.get(current)?.find((i) => remaining.has(i));
    if (ei === undefined) break;
    remaining.delete(ei);
    const e = ridges[ei];
    current = e.a === current ? e.b : e.a;
    ids.push(current);
    if (current === start || connected.get(current).length !== 2) break;
  }
  const points = ids.map((id) => rim.vertices[id]),
    length = points.reduce(
      (sum, p, i) => sum + (i ? Math.hypot(...p.map((v, k) => v - points[i - 1][k])) : 0),
      0,
    );
  if (length < 0.05) continue;
  const middle = points[0],
    key = (middle[0] < 0 ? 0 : 2) + (middle[2] < 0 ? 0 : 1),
    wheel = wheels[key];
  const simplified = simplify(
      points.map((p) => [p[0], p[1], p[2] + Math.sign(p[2]) * 0.004]),
      0.0025,
    ),
    closed = ids[0] === ids.at(-1);
  if (closed) simplified.pop();
  wheel.lines.push({
    name: "source split-spoke ridge " + wheel.lines.length,
    source: { material: "Carro_Roda_1", method: "front-facing crease" },
    closed,
    points: simplified.map((p) => p.map((v, i) => +(v - wheel.pivot[i]).toFixed(5))),
  });
}
for (const [i, id] of [119, 157, 168, 13].entries())
  wheels[i].lines.push(feature("Carro_Metal_Preto", id, "wheel hub", wheels[i].pivot, 0.002));
const asset = {
  version: 1,
  source: "evoque-monochrome.glb",
  sourceSha256,
  normalization: { length: 5.06, rotationY: -Math.PI / 2, scale, center: center.toArray(), floor: box.min.y },
  body,
  wheels,
};
const lines = [...body, ...wheels.flatMap((wheel) => wheel.lines)];
for (const line of lines) {
  if (line.points.length < (line.closed ? 3 : 2) || line.points.some((point) => point.some((v) => !Number.isFinite(v)))) {
    throw new Error(`Invalid generated source feature: ${line.name}`);
  }
}
const serialized = JSON.stringify(asset) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(outputPath, "utf8") !== serialized) throw new Error("The Evoque feature asset needs regeneration.");
} else writeFileSync(outputPath, serialized);
console.log(
  JSON.stringify(
    {
      output: outputPath,
      bytes: Buffer.byteLength(JSON.stringify(asset)),
      bodyFeatures: body.length,
      wheelFeatures: wheels.reduce((sum, w) => sum + w.lines.length, 0),
      points: [...body, ...wheels.flatMap((w) => w.lines)].reduce((sum, l) => sum + l.points.length, 0),
    },
    null,
    2,
  ),
);
