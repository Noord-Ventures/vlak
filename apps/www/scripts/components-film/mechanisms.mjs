/**
 * Six seconds of paper-thin Waveform, MediaScrubber and PlaybackControls surfaces.
 * Every bar, rail, tick, control and symbol is geometry. update() is a pure timeline
 * evaluation: arbitrary frames can be revisited without accumulating simulation state.
 * Bounds are approximately 16.2 × 8.3 in XY, with the camera-facing surface at +Z.
 */
export function createMechanisms(THREE, { box, frame, text, materials }) {
  const group = new THREE.Group();
  group.name = "Waveform, scrubber and playback mechanisms";
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const smooth = (start, end, time) => {
    const p = clamp((time - start) / (end - start));
    return p * p * (3 - 2 * p);
  };
  const spring = (time) => {
    const p = Math.max(0, time);
    return 1 - Math.exp(-7.5 * p) * (Math.cos(11 * p) + 0.28 * Math.sin(11 * p));
  };
  const mix = THREE.MathUtils.lerp;
  const ink = materials.ink;
  const paper = materials.paper;
  const gray = materials.gray;
  const part = (parent, width, height, depth, material, x = 0, y = 0, z = 0, radius = 0.015) => {
    const mesh = box(width, height, Math.min(depth, 0.01), material, radius);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const type = (value, size, x, y, z) => {
    const mesh = text(value, size, ink, 0.001);
    mesh.position.set(x + (mesh.userData.width ?? 0) / 2, y, z);
    group.add(mesh);
    return mesh;
  };

  // Each of the 128 rounded bars has its own geometry and unfolding phase.
  const bars = Array.from({ length: 128 }, (_, index) => {
    const mesh = part(group, 0.062, 1, 0.008, index < 18 ? ink : gray, 0, 0, 0, 0.027);
    mesh.geometry = mesh.geometry.clone();
    mesh.name = `Amplitude ${String(index + 1).padStart(3, "0")}`;
    return mesh;
  });
  const baseline = part(group, 15.55, 0.021, 0.003, gray, 0, 1.59, 0.025, 0.006);
  const upperLabel = type("Waveform", 0.3, -7.72, 3.45, 0.035);

  // Only the UI track and active fill remain; no chassis or machined support.
  const railGroup = new THREE.Group();
  railGroup.position.y = -1.06;
  group.add(railGroup);
  const railTrack = part(railGroup, 15.42, 0.075, 0.006, gray, 0, 0, 0.025, 0.032);
  const railFill = part(railGroup, 1, 0.05, 0.004, ink, -7.64, 0, 0.033, 0.024);
  const ticks = Array.from({ length: 41 }, (_, index) => {
    const major = index % 5 === 0;
    return part(group, major ? 0.021 : 0.014, major ? 0.19 : 0.09, 0.003, major ? ink : gray, -7.7 + index / 40 * 15.4, -1.46, 0.022, 0.005);
  });
  type("0:00", 0.25, -7.74, -1.98, 0.035);
  type("0:18", 0.25, 6.94, -1.98, 0.035);

  const knob = new THREE.Group();
  knob.position.y = -1.06;
  group.add(knob);
  const knobFace = new THREE.Mesh(new THREE.CircleGeometry(0.2, 48), paper);
  knobFace.position.z = 0.043;
  knobFace.castShadow = knobFace.receiveShadow = true;
  knob.add(knobFace);
  const knobBorder = new THREE.Mesh(new THREE.RingGeometry(0.195, 0.212, 48), ink);
  knobBorder.position.z = 0.044;
  knob.add(knobBorder);
  const knobStem = part(knob, 0.035, 0.24, 0.002, ink, 0, 0, 0.046, 0.014);
  const rippleTimes = [1.9, 3.16, 4.67, 5.21];
  const ripples = rippleTimes.map(() => {
    const material = ink.clone();
    material.transparent = true;
    material.opacity = 0;
    material.depthWrite = false;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.273, 0.283, 64), material);
    ring.position.set(0, -1.06, 0.047);
    group.add(ring);
    return ring;
  });

  function triangle(parent, direction, material, x = 0, y = 0, z = 0, scale = 1) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.155 * direction, -0.23);
    shape.lineTo(0.225 * direction, 0);
    shape.lineTo(-0.155 * direction, 0.23);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.002, bevelEnabled: false, steps: 1 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    parent.add(mesh);
    return mesh;
  }

  /** Exact 16-unit Vlak line marks: one-unit strokes, butt caps and miter joins. */
  function outlinedMark(parent, points, material) {
    const unit = 0.048;
    const polygon = points.map(([x, y]) => new THREE.Vector2((x - 8) * unit, (8 - y) * unit));
    let area = 0;
    for (let index = 0; index < polygon.length; index++) {
      const point = polygon[index];
      const next = polygon[(index + 1) % polygon.length];
      area += point.x * next.y - next.x * point.y;
    }
    const normals = polygon.map((point, index) => {
      const edge = polygon[(index + 1) % polygon.length].clone().sub(point).normalize();
      return area > 0 ? new THREE.Vector2(edge.y, -edge.x) : new THREE.Vector2(-edge.y, edge.x);
    });
    const outside = [];
    const inside = [];
    for (let index = 0; index < polygon.length; index++) {
      const previous = normals[(index + normals.length - 1) % normals.length];
      const next = normals[index];
      const miter = previous.clone().add(next).multiplyScalar(unit / 2 / (1 + previous.dot(next)));
      outside.push(polygon[index].clone().add(miter));
      inside.push(polygon[index].clone().sub(miter));
    }
    const shape = new THREE.Shape(outside);
    shape.closePath();
    const hole = new THREE.Path(inside.reverse());
    hole.closePath();
    shape.holes.push(hole);
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.002, bevelEnabled: false, steps: 1 }), material);
    mesh.name = "Vlak outlined transport mark";
    parent.add(mesh);
    return mesh;
  }

  function transportStem(parent, x, material) {
    // Open SVG strokes end at y=3.5 and y=12.5, without round caps.
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.048, 9 * 0.048, 0.002), material);
    mesh.position.set((x - 8) * 0.048, 0, 0.001);
    parent.add(mesh);
  }

  function repeat(parent, material) {
    const arc = new THREE.Mesh(new THREE.RingGeometry(0.221, 0.269, 48, 1, 0, Math.PI * 1.67), material);
    arc.rotation.z = 0.3;
    parent.add(arc);
    const arrow = triangle(parent, 1, material, 0.225, 0.071, 0.001, 0.32);
    arrow.rotation.z = -Math.PI / 2;
  }

  function shuffle(parent, material) {
    for (const direction of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.26, direction * 0.16, 0),
        new THREE.Vector3(-0.1, direction * 0.135, 0),
        new THREE.Vector3(0.09, -direction * 0.135, 0),
        new THREE.Vector3(0.26, -direction * 0.16, 0),
      ]);
      const vertices = [];
      const indices = [];
      for (let step = 0; step <= 24; step++) {
        const point = curve.getPoint(step / 24);
        const tangent = curve.getTangent(step / 24);
        for (const side of [-1, 1]) vertices.push(point.x - tangent.y * 0.02 * side, point.y + tangent.x * 0.02 * side, 0);
        if (step < 24) {
          const index = step * 2;
          indices.push(index, index + 2, index + 1, index + 1, index + 2, index + 3);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      parent.add(new THREE.Mesh(geometry, material));
      triangle(parent, 1, material, 0.25, -direction * 0.16, 0.001, 0.28);
    }
  }

  // One thin UI surface per control. Its ink glyph floats in, then settles flush.
  const buttons = ["shuffle", "previous", "play", "next", "repeat"].map((name, index) => {
    const button = new THREE.Group();
    button.name = `${name} control`;
    button.position.set((index - 2) * 1.8, -3.24, 0);
    group.add(button);
    const capGroup = new THREE.Group();
    button.add(capGroup);
    const cap = part(capGroup, 1.155, 1.155, 0.01, index === 2 ? ink : paper, 0, 0, 0, 0.085);
    const outline = frame(1.155, 1.155, 0.001, index === 2 ? ink : gray, 0.085, 0.018);
    outline.position.z = 0.0065;
    capGroup.add(outline);
    const symbol = new THREE.Group();
    symbol.position.z = 0.009;
    capGroup.add(symbol);
    let play;
    let pause;
    if (name === "play") {
      play = new THREE.Group();
      outlinedMark(play, [[6, 3.5], [13, 8], [6, 12.5]], paper);
      symbol.add(play);
      pause = new THREE.Group();
      outlinedMark(pause, [[4, 3.5], [6.5, 3.5], [6.5, 12.5], [4, 12.5]], paper);
      outlinedMark(pause, [[9.5, 3.5], [12, 3.5], [12, 12.5], [9.5, 12.5]], paper);
      symbol.add(pause);
    } else if (name === "previous" || name === "next") {
      const previous = name === "previous";
      outlinedMark(symbol, previous ? [[12.5, 3.5], [6.5, 8], [12.5, 12.5]] : [[3.5, 3.5], [9.5, 8], [3.5, 12.5]], ink);
      transportStem(symbol, previous ? 3.5 : 12.5, ink);
    } else if (name === "repeat") repeat(symbol, ink);
    else shuffle(symbol, ink);
    return { button, cap, capGroup, symbol, play, pause };
  });

  const clocks = Array.from({ length: 19 }, (_, index) => {
    const label = type(`0:${String(index).padStart(2, "0")}`, 0.32, -0.42, -0.29, 0.035);
    label.visible = false;
    return label;
  });

  function progressAt(time) {
    // The next key causes a distinct seek, then previous returns the playhead.
    return 0.12 + 0.33 * smooth(1.65, 3.03, time)
      + 0.23 * smooth(3.12, 3.49, time)
      + 0.21 * smooth(3.5, 4.65, time)
      - 0.73 * smooth(5.17, 5.74, time);
  }

  const presses = [[0, 1.32], [2, 1.72], [3, 3.12], [2, 4.62], [1, 5.17], [4, 5.73]];
  function pressAt(index, time) {
    let value = 0;
    for (const [key, start] of presses) {
      if (key !== index) continue;
      const p = time - start;
      if (p >= 0 && p < 0.34) value += Math.sin(Math.PI * p / 0.34) ** 2;
    }
    return value;
  }

  function update(time) {
    const t = Math.max(0, Math.min(6, time));
    const progress = progressAt(t);
    const playing = smooth(1.73, 2.07, t) * (1 - smooth(4.66, 4.99, t));
    for (let index = 0; index < bars.length; index++) {
      const bar = bars[index];
      const f = index / (bars.length - 1);
      const unravel = Math.min(1.075, spring((t - 0.24 - f * 0.78) * 0.8));
      const angle = f * Math.PI * 5.1 + t * 0.32;
      const radius = 0.4 + f * 2.63;
      const coilX = Math.cos(angle) * radius;
      const coilY = 1.43 + Math.sin(angle) * radius * 0.61;
      const peak = 0.34 + 1.33 * Math.abs(Math.sin(index * 0.194) * Math.cos(index * 0.063));
      const traveling = Math.exp(-(((f - progress) * 12) ** 2));
      const amplitude = peak * (1 + playing * (0.13 * Math.sin(t * 8.1 - index * 0.32) + traveling * 0.35));
      bar.position.set(mix(coilX, -7.62 + f * 15.24, unravel), mix(coilY, 1.6, unravel), Math.max(0.042, mix(0.55 + f * 1.34, 0.05 + traveling * playing * 0.09, unravel)));
      bar.rotation.set((1 - unravel) * Math.sin(angle) * 0.52, (1 - unravel) * Math.cos(angle) * 0.32, (1 - unravel) * (angle + Math.PI / 2));
      bar.scale.set(1, mix(0.2 + f * 0.17, amplitude, unravel), 1);
      bar.material = f <= progress ? ink : gray;
    }
    const railAssembly = Math.min(1.018, spring(Math.max(0, t - 0.72)));
    railGroup.position.z = Math.max(0, 1.2 * (1 - railAssembly));
    railGroup.position.y = -1.06 + (1 - railAssembly) * 0.12;
    railGroup.rotation.x = 0.16 * (1 - railAssembly);
    railTrack.position.z = 0.025 + Math.max(0, 1 - railAssembly) * 0.36;
    railFill.scale.x = Math.max(0.01, progress * 15.28);
    railFill.position.x = -7.64 + progress * 15.28 / 2;
    railFill.position.z = 0.033 + Math.max(0, 1 - railAssembly) * 0.62;
    baseline.scale.x = smooth(0.92, 1.87, t);
    for (let index = 0; index < ticks.length; index++) {
      const assembled = Math.min(1.025, spring(Math.max(0, t - 0.72 - index * 0.014)));
      ticks[index].position.z = 0.022 + Math.max(0, 1 - assembled) * 1.05;
      ticks[index].rotation.y = (1 - assembled) * 0.55;
    }
    const knobAssembly = spring(Math.max(0, t - 0.91));
    knob.position.x = -7.64 + progress * 15.28;
    knob.position.z = Math.max(0, (1 - knobAssembly) * 1.62);
    knob.position.y = -1.06 + (1 - knobAssembly) * 0.09;
    knob.rotation.z = (1 - knobAssembly) * 0.8;
    knobStem.position.z = 0.046 + Math.max(0, 1 - knobAssembly) * 0.14;
    for (let index = 0; index < ripples.length; index++) {
      const ring = ripples[index];
      const age = t - rippleTimes[index];
      ring.visible = age >= 0 && age < 0.72;
      ring.position.x = -7.64 + progressAt(rippleTimes[index]) * 15.28;
      ring.scale.setScalar(1 + Math.max(0, Math.min(0.72, age)) * 2.7);
      ring.material.opacity = age >= 0 ? 0.27 * (1 - clamp(age / 0.72)) ** 2 : 0;
    }
    for (let index = 0; index < buttons.length; index++) {
      const key = buttons[index];
      const assembled = spring(Math.max(0, t - 0.38 - index * 0.11));
      const pressed = pressAt(index, t);
      key.button.rotation.z = (1 - assembled) * (index % 2 ? -0.15 : 0.15);
      key.capGroup.position.z = 0.04 + Math.max(0, 1 - assembled) * 1.45 - pressed * 0.025;
      key.capGroup.position.y = (1 - assembled) * 0.055;
      key.capGroup.rotation.x = pressed * 0.015 + (1 - assembled) * 0.12;
      key.capGroup.scale.set(1 - pressed * 0.012, 1 - pressed * 0.018, 1);
      key.symbol.position.z = 0.009 + Math.max(0, 1 - assembled) * 0.25;
      if (key.play) {
        const paused = t < 1.88 || t >= 4.79;
        key.play.visible = paused;
        key.pause.visible = !paused;
      }
    }
    const seconds = Math.floor(progress * 18);
    for (let index = 0; index < clocks.length; index++) clocks[index].visible = index === seconds && t > 1.04;
    upperLabel.scale.setScalar(smooth(0.38, 1.14, t));
  }

  update(0);
  return { group, update };
}
