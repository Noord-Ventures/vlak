import * as THREE from "three";

/** An original, repeating streetscape for the local journey simulation. */
export function createDriveWorld() {
  const root = new THREE.Group();
  root.name = "Journey streetscape";
  const segmentLength = 24;
  const segmentCount = 6;
  const loopLength = segmentLength * segmentCount;
  const paperMaterial = new THREE.MeshBasicMaterial({ color: 0xfaf8f2, toneMapped: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x949494, toneMapped: false, transparent: true, opacity: .72 });
  const box = new THREE.BoxGeometry(1, 1, 1);
  const canopy = new THREE.IcosahedronGeometry(1, 0);
  const boxEdges = new THREE.EdgesGeometry(box);
  const canopyEdges = new THREE.EdgesGeometry(canopy);
  const boxes: THREE.Matrix4[] = [];
  const canopies: THREE.Matrix4[] = [];
  const linePoints: number[] = [];
  const point = new THREE.Vector3();
  const rotation = new THREE.Quaternion();

  function shape(geometry: THREE.BufferGeometry, position: [number, number, number], size: [number, number, number], instances: THREE.Matrix4[]) {
    const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...position), rotation, new THREE.Vector3(...size));
    instances.push(matrix);
    const vertices = geometry.getAttribute("position");
    for (let index = 0; index < vertices.count; index++) {
      point.fromBufferAttribute(vertices, index).applyMatrix4(matrix);
      linePoints.push(point.x, point.y, point.z);
    }
  }
  function line(a: [number, number, number], b: [number, number, number]) { linePoints.push(...a, ...b); }
  function windowFrame(x: number, y: number, z: number, width = .8, height = 1.1) {
    const a: [number, number, number] = [x - width / 2, y - height / 2, z];
    const b: [number, number, number] = [x + width / 2, y - height / 2, z];
    const c: [number, number, number] = [x + width / 2, y + height / 2, z];
    const d: [number, number, number] = [x - width / 2, y + height / 2, z];
    line(a, b); line(b, c); line(c, d); line(d, a);
  }

  // Five different building proportions per segment, mirrored on alternate blocks.
  const buildings = [
    { x: -8.7, side: -1, width: 4.7, height: 6.2, depth: 4.4 },
    { x: -1.8, side: -1, width: 5.1, height: 8.1, depth: 5.2 },
    { x: 6.5, side: -1, width: 5.8, height: 4.4, depth: 4.1 },
    { x: -6.4, side: 1, width: 5.9, height: 4.9, depth: 4.8 },
    { x: 3.4, side: 1, width: 6.2, height: 7, depth: 5.5 },
  ];
  for (const building of buildings) {
    const facade = building.side * 6.6;
    const z = facade + building.side * building.depth / 2;
    shape(boxEdges, [building.x, building.height / 2, z], [building.width, building.height, building.depth], boxes);
    const front = facade - building.side * .012;
    windowFrame(building.x, .95, front, .9, 1.8);
    for (const y of [2.8, ...(building.height > 6 ? [5.2] : [])]) {
      for (const x of [-1.15, 1.15]) windowFrame(building.x + x, y, front);
    }
  }
  for (const side of [-1, 1]) {
    shape(boxEdges, [0, .075, side * 4.6], [segmentLength, .15, .16], boxes);
    line([-12, .008, side * 3.5], [12, .008, side * 3.5]);
    const treeX = side < 0 ? 10.2 : -11;
    shape(boxEdges, [treeX, 1.05, side * 5.45], [.13, 2.1, .13], boxes);
    shape(canopyEdges, [treeX, 2.85, side * 5.7], [1.1, 1.25, 1.1], canopies);
    const poleX = side < 0 ? 2.2 : 8.8;
    shape(boxEdges, [poleX, 2, side * 5.05], [.07, 4, .07], boxes);
    shape(boxEdges, [poleX, 3.98, side * 4.86], [.07, .07, .45], boxes);
    shape(boxEdges, [poleX, 3.92, side * 4.67], [.28, .08, .28], boxes);
  }
  boxEdges.dispose(); canopyEdges.dispose();

  const block = new THREE.Group();
  for (const [geometry, instances] of [[box, boxes], [canopy, canopies]] as const) {
    const surfaces = new THREE.InstancedMesh(geometry, paperMaterial, instances.length);
    for (const [index, matrix] of instances.entries()) surfaces.setMatrixAt(index, matrix);
    surfaces.instanceMatrix.needsUpdate = true;
    surfaces.computeBoundingSphere();
    block.add(surfaces);
  }
  const lineGeometry = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(linePoints, 3));
  block.add(new THREE.LineSegments(lineGeometry, lineMaterial));
  const segments = Array.from({ length: segmentCount }, (_, index) => {
    const segment = block.clone(true);
    segment.name = `Street block ${index + 1}`;
    segment.rotation.y = index % 2 ? Math.PI : 0;
    root.add(segment);
    return segment;
  });
  function update(distance: number) {
    const traveled = Number.isFinite(distance) ? ((distance % loopLength) + loopLength) % loopLength : 0;
    for (const [index, segment] of segments.entries()) {
      // Recycle at +36 behind the car; the replacement begins beyond the forward horizon.
      segment.position.x = ((index * segmentLength + traveled) % loopLength) - 108;
    }
  }
  update(0);
  return {
    root,
    objectCount: (boxes.length + canopies.length) * segmentCount,
    buildingCount: buildings.length * segmentCount,
    loopLength,
    palette(paper: THREE.Color, ink: THREE.Color) {
      paperMaterial.color.copy(paper);
      lineMaterial.color.copy(ink).lerp(paper, .34);
    },
    update,
  };
}
