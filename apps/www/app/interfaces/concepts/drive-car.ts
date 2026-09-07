import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import type { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** The creator's geometry is retained; this adapter supplies monochrome paint and wheel pivots. */
export async function loadDriveCar(signal: AbortSignal) {
  const response = await fetch("/interfaces/concepts/evoque-monochrome.glb", { signal });
  if (!response.ok) throw new Error("Vehicle geometry could not load");
  const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "");
  return gltf.scene;
}

export function arrangeDriveCar(car: THREE.Group, materials: {
  paint: THREE.Material; glass: THREE.Material; rubber: THREE.Material;
  alloy: THREE.Material; trim: THREE.Material; lamp: THREE.Material; edge: THREE.LineBasicMaterial; vehicleEdge: LineMaterial; silhouette: THREE.Material;
}) {
  const body = new THREE.Group(), runningGear = new THREE.Group();
  const turn = new THREE.Group(); turn.rotation.y = -Math.PI / 2; turn.add(car); turn.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(turn), size = bounds.getSize(new THREE.Vector3());
  const scale = 5.06 / size.x, center = bounds.getCenter(new THREE.Vector3());
  const normalize = new THREE.Matrix4().makeScale(scale, scale, scale).multiply(new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));
  const pieces: { geometry: THREE.BufferGeometry; name: string }[] = [];
  car.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const geometry = object.geometry.clone().applyMatrix4(normalize.clone().multiply(object.matrixWorld));
    geometry.computeBoundingBox();
    const material = Array.isArray(object.material) ? object.material[0] : object.material;
    pieces.push({ geometry, name: material?.name ?? "" });
  });
  const wheelKey = (x: number, z: number) => (x < 0 ? 0 : 2) + (z < 0 ? 0 : 1);
  const split = (geometry: THREE.BufferGeometry) => {
    const positions = geometry.getAttribute("position"), indices = geometry.index!;
    const buckets: number[][] = [[], [], [], []];
    for (let i = 0; i < indices.count; i += 3) {
      const a = indices.getX(i), b = indices.getX(i + 1), c = indices.getX(i + 2);
      const key = wheelKey((positions.getX(a) + positions.getX(b) + positions.getX(c)) / 3, (positions.getZ(a) + positions.getZ(b) + positions.getZ(c)) / 3);
      buckets[key]!.push(a, b, c);
    }
    return buckets.map(bucket => {
      const part = geometry.clone(); part.setIndex(bucket); part.computeBoundingBox(); return part;
    });
  };
  const tire = pieces.find(piece => piece.name === "Carro_Pneu")!;
  const tireParts = split(tire.geometry);
  const wheels = tireParts.map(part => {
    // Bounds must use referenced indices; a shared attribute contains all four tires.
    const positions = part.getAttribute("position"), box = new THREE.Box3();
    for (const index of part.index!.array) box.expandByPoint(new THREE.Vector3().fromBufferAttribute(positions, index));
    const wheel = new THREE.Group(); wheel.position.copy(box.getCenter(new THREE.Vector3())); runningGear.add(wheel); return wheel;
  });
  const buckets = new Map<THREE.Group, Map<THREE.Material, THREE.BufferGeometry[]>>();
  function collect(parent: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material) {
    if (parent !== body) geometry.translate(-parent.position.x, -parent.position.y, -parent.position.z);
    if (!buckets.has(parent)) buckets.set(parent, new Map());
    const byMaterial = buckets.get(parent)!;
    if (!byMaterial.has(material)) byMaterial.set(material, []);
    byMaterial.get(material)!.push(geometry);
  }
  const materialFor = (name: string) => name === "Carro_Pintura" ? materials.paint
    : /Vidros|Espelhos/.test(name) ? materials.glass
    : /Pneu|Interno/.test(name) ? materials.rubber
    : /Refletor|Metal_Vermelho|Metal_Farol/.test(name) ? materials.lamp
    : /Cromado|Roda|Freio_Disco/.test(name) ? materials.alloy : materials.trim;
  for (const piece of pieces) {
    const { name, geometry } = piece, material = materialFor(name);
    const box = geometry.boundingBox!, dimensions = box.getSize(new THREE.Vector3());
    // The rim material also covers rear bumper trim spanning both sides of the car.
    // Only a part contained on one side can belong to an individual wheel pivot.
    const isRim = name === "Carro_Roda_1" && box.max.y < 1 && dimensions.x < 1 && (box.min.z > 0 || box.max.z < 0);
    if (name === "Carro_Pneu" || name === "Carro_Freio_Disco") {
      const parts = name === "Carro_Pneu" ? tireParts : split(geometry);
      for (const [i, part] of parts.entries()) collect(wheels[i]!, part, material);
      geometry.dispose();
    } else if (isRim) {
      const center = box.getCenter(new THREE.Vector3()); collect(wheels[wheelKey(center.x, center.z)]!, geometry, material);
    } else collect(body, geometry, material);
  }
  for (const [parent, byMaterial] of buckets) for (const [material, geometries] of byMaterial) {
    const geometry = mergeGeometries(geometries)!;
    const mesh = new THREE.Mesh(geometry, material); mesh.userData.vehicleSurface = true; parent.add(mesh);
    // A thin reverse hull preserves curved tire and body silhouettes without shading.
    const contour = geometry.clone();
    const positions = contour.getAttribute("position"), normals = contour.getAttribute("normal");
    for (let index = 0; index < positions.count; index++) {
      positions.setXYZ(index, positions.getX(index) + normals.getX(index) * .009, positions.getY(index) + normals.getY(index) * .009, positions.getZ(index) + normals.getZ(index) * .009);
    }
    const outline = new THREE.Mesh(contour, materials.silhouette); outline.userData.vehicleContour = true; parent.add(outline);
    if (material !== materials.rubber) {
      const edges = new THREE.EdgesGeometry(geometry, 55);
      const strokes = new LineSegmentsGeometry().setPositions(edges.getAttribute("position").array as Float32Array);
      mesh.add(new LineSegments2(strokes, materials.vehicleEdge));
      edges.dispose();
    }
    for (const source of geometries) source.dispose();
  }
  const sourceGeometries = new Set<THREE.BufferGeometry>(), sourceMaterials = new Set<THREE.Material>();
  car.traverse(object => { if (object instanceof THREE.Mesh) { sourceGeometries.add(object.geometry); for (const m of Array.isArray(object.material) ? object.material : [object.material]) sourceMaterials.add(m); } });
  for (const geometry of sourceGeometries) geometry.dispose(); for (const material of sourceMaterials) material.dispose();
  return { body, runningGear, wheels };
}
