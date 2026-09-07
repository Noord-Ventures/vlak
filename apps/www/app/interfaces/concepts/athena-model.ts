import * as THREE from "three";

export const athenaAsset = {
  title: "Bust of Athena",
  creator: "yugengen",
  source: "https://sketchfab.com/3d-models/bust-of-athena-6f372d03e69b48ee8901bdc6e48f17b5",
  license: "https://creativecommons.org/licenses/by/4.0/",
  geometry: "/interfaces/concepts/athena-lines.json",
} as const;

type AthenaData = { positions: number[]; indices: number[]; contours: number[]; features: number[] };

/** Section curves and silhouette edges retain the sculpture, without displaying its triangles. */
export function createAthenaModel(data: AthenaData) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(data.positions.map(value => value / 10000), 3));
  geometry.setIndex(data.indices); geometry.computeVertexNormals(); geometry.computeBoundingBox();
  const root = new THREE.Group();
  const depthMaterial = new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2, side: THREE.DoubleSide });
  const depth = new THREE.Mesh(geometry, depthMaterial); root.add(depth);
  const ink = new THREE.LineBasicMaterial({ color: 0x252525, transparent: true, opacity: .50, depthWrite: false });
  const fine = new THREE.LineBasicMaterial({ color: 0x252525, transparent: true, opacity: .24, depthWrite: false });
  const hidden = new THREE.LineBasicMaterial({ color: 0x252525, transparent: true, opacity: .025, depthTest: false, depthWrite: false });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x252525, transparent: true, opacity: .75, depthWrite: false });
  const makeLines = (values: number[], material: THREE.LineBasicMaterial) => {
    const buffer = new THREE.BufferGeometry(); buffer.setAttribute("position", new THREE.Float32BufferAttribute(values.map(value => value / 10000), 3));
    const line = new THREE.LineSegments(buffer, material); root.add(line); return line;
  };
  const contours = makeLines(data.contours, fine); contours.renderOrder = 3;
  const hiddenContours = new THREE.LineSegments(contours.geometry, hidden); hiddenContours.renderOrder = 2; root.add(hiddenContours);
  const features = makeLines(data.features, ink); features.renderOrder = 4;

  // Face adjacency is built once. Only the small visible contour buffer changes with the camera.
  const positions = geometry.getAttribute("position");
  const index = geometry.getIndex()!;
  type Edge = { a: number; b: number; normal: THREE.Vector3; other?: THREE.Vector3 };
  const edges = new Map<string, Edge>();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
  for (let face = 0; face < index.count; face += 3) {
    const ids = [index.getX(face), index.getX(face + 1), index.getX(face + 2)];
    a.fromBufferAttribute(positions, ids[0]!); b.fromBufferAttribute(positions, ids[1]!); c.fromBufferAttribute(positions, ids[2]!);
    const normal = ab.subVectors(b, a).cross(ac.subVectors(c, a)).normalize().clone();
    for (let side = 0; side < 3; side++) {
      const x = ids[side]!, y = ids[(side + 1) % 3]!, key = x < y ? `${x}:${y}` : `${y}:${x}`;
      const edge = edges.get(key);
      if (edge) edge.other = normal;
      else edges.set(key, { a: x, b: y, normal });
    }
  }
  const edgeList = [...edges.values()];
  const silhouetteGeometry = new THREE.BufferGeometry();
  const silhouettePositions = new Float32Array(edgeList.length * 6);
  silhouetteGeometry.setAttribute("position", new THREE.BufferAttribute(silhouettePositions, 3)); silhouetteGeometry.setDrawRange(0, 0);
  const silhouette = new THREE.LineSegments(silhouetteGeometry, edgeMaterial); silhouette.frustumCulled = false; silhouette.renderOrder = 5; root.add(silhouette);
  const inverse = new THREE.Matrix4();
  const direction = new THREE.Vector3();
  function updateSilhouette(cameraDirection: THREE.Vector3) {
    root.updateMatrixWorld(true); inverse.copy(root.matrixWorld).invert(); direction.copy(cameraDirection).transformDirection(inverse);
    let count = 0;
    for (const edge of edgeList) {
      if (edge.other && edge.normal.dot(direction) * edge.other.dot(direction) > 0) continue;
      for (const vertex of [edge.a, edge.b]) {
        silhouettePositions[count++] = positions.getX(vertex); silhouettePositions[count++] = positions.getY(vertex); silhouettePositions[count++] = positions.getZ(vertex);
      }
    }
    silhouetteGeometry.setDrawRange(0, count / 3); silhouetteGeometry.getAttribute("position").needsUpdate = true;
  }
  function setInk(color: string) { for (const material of [ink, fine, hidden, edgeMaterial]) material.color.set(color); }
  function dispose() { geometry.dispose(); contours.geometry.dispose(); features.geometry.dispose(); silhouetteGeometry.dispose(); for (const material of [depthMaterial, ink, fine, hidden, edgeMaterial]) material.dispose(); }
  return { root, updateSilhouette, setInk, dispose };
}
