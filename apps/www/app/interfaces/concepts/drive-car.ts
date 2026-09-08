import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import type { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type FeatureLine = { name: string; points: [number, number, number][]; closed: boolean };
type FeatureAsset = { version: 1; body: FeatureLine[]; wheels: { pivot: [number, number, number]; lines: FeatureLine[] }[] };
let geometryBytes: Promise<ArrayBuffer> | undefined;
let featureData: Promise<FeatureAsset> | undefined;
function requestAsset<T>(url: string, read: (response: Response) => Promise<T>) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  return fetch(url, { signal: controller.signal }).then(response => {
    if (!response.ok) throw new Error("Vehicle asset could not load");
    return read(response);
  }).finally(() => window.clearTimeout(timeout));
}
function sourceGeometry() {
  geometryBytes ??= requestAsset("/interfaces/concepts/evoque-monochrome.glb", response => response.arrayBuffer()).catch(error => { geometryBytes = undefined; throw error; });
  return geometryBytes;
}
function sourceFeatures() {
  featureData ??= requestAsset("/interfaces/concepts/evoque-feature-lines.json", async response => {
    const asset = await response.json() as FeatureAsset;
    if (asset.version !== 1 || !Array.isArray(asset.body) || !Array.isArray(asset.wheels) || asset.wheels.length !== 4) throw new Error("Vehicle contours are invalid");
    return asset;
  }).catch(error => { featureData = undefined; throw error; });
  return featureData;
}
function disposeSource(car: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
  car.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

/** The licensed Evoque supplies every surface; only its drawn feature lines are simplified. */
export function arrangeDriveCar(materials: {
  paint: THREE.Material; glass: THREE.Material; rubber: THREE.Material;
  alloy: THREE.Material; trim: THREE.Material; lamp: THREE.Material;
  vehicleEdge: LineMaterial; silhouette: THREE.Material;
}) {
  const body = new THREE.Group(), runningGear = new THREE.Group();
  const wheels = Array.from({ length: 4 }, () => { const wheel = new THREE.Group(); runningGear.add(wheel); return wheel; });
  let disposed = false;
  const sourceBytes = sourceGeometry();
  const ready = Promise.all([sourceBytes, sourceFeatures()]).then(async ([bytes, features]) => {
    if (disposed) return;
    // Cache immutable bytes, never live scene objects whose disposal affects another mount.
    const { scene: car } = await new GLTFLoader().parseAsync(bytes.slice(0), "").catch(error => { if (geometryBytes === sourceBytes) geometryBytes = undefined; throw error; });
    if (disposed) { disposeSource(car); return; }
    const scratch = new Set<THREE.BufferGeometry>();
    const remember = (geometry: THREE.BufferGeometry) => { scratch.add(geometry); return geometry; };
    const release = (geometry: THREE.BufferGeometry) => { scratch.delete(geometry); geometry.dispose(); };
    try {
      const turn = new THREE.Group(); turn.rotation.y = -Math.PI / 2; turn.add(car); turn.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(turn), size = bounds.getSize(new THREE.Vector3());
      const scale = 5.06 / size.x, center = bounds.getCenter(new THREE.Vector3());
      const normalize = new THREE.Matrix4().makeScale(scale, scale, scale).multiply(new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));
      const pieces: { geometry: THREE.BufferGeometry; name: string }[] = [];
      car.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        const geometry = remember(object.geometry.clone().applyMatrix4(normalize.clone().multiply(object.matrixWorld)));
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
        return buckets.map(bucket => { const part = remember(geometry.clone()); part.setIndex(bucket); part.computeBoundingBox(); return part; });
      };
      const tire = pieces.find(piece => piece.name === "Carro_Pneu");
      if (!tire) throw new Error("Vehicle wheel geometry is missing");
      const tireParts = split(tire.geometry);
      for (const [index, part] of tireParts.entries()) {
        const positions = part.getAttribute("position"), box = new THREE.Box3();
        for (const vertex of part.index!.array) box.expandByPoint(new THREE.Vector3().fromBufferAttribute(positions, vertex));
        wheels[index]!.position.copy(box.getCenter(new THREE.Vector3()));
      }
      const buckets = new Map<THREE.Group, Map<THREE.Material, THREE.BufferGeometry[]>>();
      const hulls = new Map<THREE.Group, THREE.BufferGeometry[]>();
      function collect(parent: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, contour: boolean) {
        if (parent !== body) geometry.translate(-parent.position.x, -parent.position.y, -parent.position.z);
        if (!buckets.has(parent)) buckets.set(parent, new Map());
        const byMaterial = buckets.get(parent)!;
        if (!byMaterial.has(material)) byMaterial.set(material, []);
        byMaterial.get(material)!.push(geometry);
        if (contour) { if (!hulls.has(parent)) hulls.set(parent, []); hulls.get(parent)!.push(geometry); }
      }
      const materialFor = (name: string) => name === "Carro_Pintura" ? materials.paint
        : /Vidros|Espelhos/.test(name) ? materials.glass
        : /Pneu|Interno/.test(name) ? materials.rubber
        : /Refletor|Metal_Vermelho|Metal_Farol/.test(name) ? materials.lamp
        : /Cromado|Roda|Freio_Disco/.test(name) ? materials.alloy : materials.trim;
      for (const { name, geometry } of pieces) {
        const material = materialFor(name), box = geometry.boundingBox!, dimensions = box.getSize(new THREE.Vector3());
        if (name === "Carro_Plastico_1") {
          // The mirror cases share a material chunk with the rest of the trim.
          // Select their actual source triangles for the silhouette pass; their
          // glass opening alone cannot describe the full housing from the side.
          const positions = geometry.getAttribute("position"), indices = geometry.index!, mirrorIndices: number[] = [];
          for (let i = 0; i < indices.count; i += 3) {
            const vertices = [indices.getX(i), indices.getX(i + 1), indices.getX(i + 2)];
            if (vertices.every(vertex => positions.getX(vertex) > -.9 && positions.getX(vertex) < -.3 && positions.getY(vertex) > 1.32 && positions.getY(vertex) < 1.62 && Math.abs(positions.getZ(vertex)) > .97)) mirrorIndices.push(...vertices);
          }
          if (mirrorIndices.length) {
            const housing = remember(geometry.clone().setIndex(mirrorIndices));
            if (!hulls.has(body)) hulls.set(body, []);
            hulls.get(body)!.push(housing);
          }
        }
        const isRim = name === "Carro_Roda_1" && box.max.y < 1 && dimensions.x < 1 && (box.min.z > 0 || box.max.z < 0);
        if (name === "Carro_Pneu" || name === "Carro_Freio_Disco") {
          const parts = name === "Carro_Pneu" ? tireParts : split(geometry);
          for (const [i, part] of parts.entries()) collect(wheels[i]!, part, material, name === "Carro_Pneu");
          release(geometry);
        } else if (isRim) {
          const midpoint = box.getCenter(new THREE.Vector3()); collect(wheels[wheelKey(midpoint.x, midpoint.z)]!, geometry, material, false);
        } else collect(body, geometry, material, name === "Carro_Pintura");
      }
      // A reverse hull draws only paint, tires and the mirror cases. Interior,
      // grille perforations, badges and trim do not contribute extra contour noise.
      for (const [parent, geometries] of hulls) {
        const contour = mergeGeometries(geometries)!;
        const positions = contour.getAttribute("position"), normals = contour.getAttribute("normal");
        for (let i = 0; i < positions.count; i++) positions.setXYZ(i, positions.getX(i) + normals.getX(i) * .004, positions.getY(i) + normals.getY(i) * .004, positions.getZ(i) + normals.getZ(i) * .004);
        const outline = new THREE.Mesh(contour, materials.silhouette); outline.userData.vehicleContour = true; parent.add(outline);
      }
      for (const [parent, byMaterial] of buckets) for (const [material, geometries] of byMaterial) {
        const geometry = mergeGeometries(geometries)!;
        const mesh = new THREE.Mesh(geometry, material); mesh.userData.vehicleSurface = true; parent.add(mesh);
        for (const source of geometries) release(source);
      }
      const addFeatures = (parent: THREE.Group, lines: FeatureLine[]) => {
        const segments: number[] = [];
        for (const line of lines) {
          for (let i = 1; i < line.points.length; i++) segments.push(...line.points[i - 1]!, ...line.points[i]!);
          if (line.closed && line.points.length > 2) segments.push(...line.points.at(-1)!, ...line.points[0]!);
        }
        if (segments.length) parent.add(new LineSegments2(new LineSegmentsGeometry().setPositions(segments), materials.vehicleEdge));
      };
      addFeatures(body, features.body);
      for (const wheel of features.wheels) {
        const parent = wheels[wheelKey(wheel.pivot[0], wheel.pivot[2])]!;
        const offset = new THREE.Vector3(...wheel.pivot).sub(parent.position);
        addFeatures(parent, wheel.lines.map(line => ({ ...line, points: line.points.map(point => [point[0] + offset.x, point[1] + offset.y, point[2] + offset.z]) })));
      }
    } finally { for (const geometry of scratch) geometry.dispose(); disposeSource(car); }
  });
  return { body, runningGear, wheels, ready, cancel() { disposed = true; } };
}
