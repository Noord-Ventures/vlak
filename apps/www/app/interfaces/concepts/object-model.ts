import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

/** Keep the supplied object's geometry and transforms; replace only its presentation. */
export function createObjectModel(source: THREE.Group) {
  source.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(source);
  const size = bounds.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(longest) || longest <= 0) throw new Error("Object geometry has no extent");
  const root = new THREE.Group();
  const surface = new THREE.MeshBasicMaterial({ color: 0xf5f3ed, side: THREE.DoubleSide, toneMapped: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const silhouette = new THREE.MeshBasicMaterial({ color: 0x525252, side: THREE.BackSide, toneMapped: false });
  const edges = new LineMaterial({ color: 0x525252, linewidth: 1.05, worldUnits: false, transparent: true, opacity: .88, depthWrite: false });
  const sourceGeometries = new Set<THREE.BufferGeometry>();
  const sourceMaterials = new Set<THREE.Material>();
  source.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    sourceGeometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) sourceMaterials.add(material);
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.name = object.name; mesh.userData.objectSurface = true; root.add(mesh);
    const feature = new THREE.EdgesGeometry(geometry, 55);
    const strokes = new LineSegmentsGeometry().setPositions(feature.getAttribute("position").array as Float32Array);
    const lines = new LineSegments2(strokes, edges); lines.userData.objectContour = true; mesh.add(lines); feature.dispose();
    const expanded = geometry.clone();
    const positions = expanded.getAttribute("position"), normals = expanded.getAttribute("normal");
    const offset = longest * .00133;
    for (let index = 0; index < positions.count; index++) {
      positions.setXYZ(index, positions.getX(index) + normals.getX(index) * offset, positions.getY(index) + normals.getY(index) * offset, positions.getZ(index) + normals.getZ(index) * offset);
    }
    const outline = new THREE.Mesh(expanded, silhouette); outline.userData.objectContour = true; root.add(outline);
  });
  for (const geometry of sourceGeometries) geometry.dispose();
  for (const material of sourceMaterials) material.dispose();
  return { root, materials: { surface, silhouette, edges } };
}
