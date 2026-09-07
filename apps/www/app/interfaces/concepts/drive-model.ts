import * as THREE from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { arrangeDriveCar } from "./drive-car";

/** Original battery illustration paired with the licensed Evoque vehicle geometry. */
export function createDriveModel(car: THREE.Group) {
  const root = new THREE.Group();
  const battery = new THREE.Group();
  const cover = new THREE.Group();
  const gradient = new THREE.DataTexture(new Uint8Array([178, 228, 255]), 3, 1, THREE.RedFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter; gradient.needsUpdate = true;
  const paint = new THREE.MeshBasicMaterial({ color: 0xfaf9f6, toneMapped: false });
  const glass = new THREE.MeshBasicMaterial({ color: 0xfaf9f6, toneMapped: false });
  const rubber = new THREE.MeshBasicMaterial({ color: 0xfaf9f6, toneMapped: false });
  const alloy = new THREE.MeshBasicMaterial({ color: 0xfaf9f6, toneMapped: false });
  const cell = new THREE.MeshBasicMaterial({ color: 0xfaf9f6, toneMapped: false });
  const edge = new THREE.LineBasicMaterial({ color: 0x303030, transparent: true, opacity: .84 });
  const vehicleEdge = new LineMaterial({ color: 0x3a3a3a, linewidth: 1.05, worldUnits: false, transparent: true, opacity: .88, depthWrite: false });
  const detail = new THREE.LineBasicMaterial({ color: 0x5f5f5f, transparent: true, opacity: .7 });
  const lamp = new THREE.MeshBasicMaterial({ color: 0x6c6c6c });
  const trim = new THREE.MeshBasicMaterial({ color: 0xfaf9f6, toneMapped: false });
  const chargeFill = new THREE.MeshBasicMaterial({ color: 0x414141 });
  const silhouette = new THREE.MeshBasicMaterial({ color: 0x505050, side: THREE.BackSide, toneMapped: false });
  const materials = { paint, glass, rubber, alloy, cell, edge, detail, lamp, trim, chargeFill, silhouette, vehicleEdge };
  for (const surface of [paint, glass, rubber, alloy, trim, lamp]) { surface.polygonOffset = true; surface.polygonOffsetFactor = 1; surface.polygonOffsetUnits = 1; }
  const { body, runningGear, wheels } = arrangeDriveCar(car, materials);
  const line = (parent: THREE.Object3D, points: number[][], material = edge, closed = false) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(point => new THREE.Vector3(point[0], point[1], point[2])));
    const object = closed ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material);
    parent.add(object); return object;
  };
  const mesh = (parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material = paint, outline = true) => {
    const object = new THREE.Mesh(geometry, material); parent.add(object);
    if (outline) object.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 28), edge));
    return object;
  };
  const box = (parent: THREE.Object3D, size: number[], position: number[], material: THREE.Material = paint, outline = true) => {
    const object = mesh(parent, new THREE.BoxGeometry(size[0], size[1], size[2]), material, outline);
    object.position.set(position[0]!, position[1]!, position[2]!); return object;
  };
  box(battery,[2.65,.11,1.44],[0,.50,0],alloy);
  const moduleFills: THREE.Mesh[] = [];
  for(let row=0;row<4;row++)for(let column=0;column<3;column++){
    const module=box(battery,[.60,.17,.40],[-.975+row*.65,.64,-.44+column*.44],cell);
    module.userData.module=row*3+column;
    const fill=box(battery,[.55,.012,.14],[-.975+row*.65,.737,-.44+column*.44],chargeFill,false);
    fill.userData.module=row*3+column;moduleFills.push(fill);
    for(let index=0;index<3;index++)line(battery,[[-1.21+row*.65+index*.18,.727,-.61+column*.44],[-1.21+row*.65+index*.18,.727,-.28+column*.44]],detail);
  }
  for(const z of [-.66,.66]){line(battery,[[-1.24,.75,z],[1.24,.75,z]],edge);for(const x of [-1.08,1.08])box(battery,[.07,.045,.07],[x,.76,z],rubber);}
  box(cover,[2.70,.045,1.48],[0,.78,0],paint);
  const connectors=new THREE.Group(); root.add(connectors);
  for(const x of [-1.08,1.08])for(const z of [-.57,.57])line(connectors,[[x,.56,z],[x,2.25,z]],detail);
  connectors.visible=false;
  const current=new THREE.Group();battery.add(current);
  for(let i=0;i<8;i++){const dot=mesh(current,new THREE.SphereGeometry(.026,8,6),lamp,false);dot.position.set(-1.16+i*.31,.80,-.66);}
  root.add(body,runningGear,battery,cover);
  const vehicleMaterials = new Map<THREE.Material, THREE.Material>();
  for (const group of [body, runningGear]) group.traverse(object => {
    const drawable = object as THREE.Mesh;
    if (!drawable.material || Array.isArray(drawable.material)) return;
    const source = drawable.material;
    if (!vehicleMaterials.has(source)) vehicleMaterials.set(source, source.clone());
    drawable.material = vehicleMaterials.get(source)!;
  });
  return {root,body,runningGear,battery,cover,wheels,connectors,current,moduleFills,vehicleMaterials,materials,gradient};
}
