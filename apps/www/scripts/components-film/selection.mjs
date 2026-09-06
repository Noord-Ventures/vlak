/**
 * MultiSelect → TagInput → QueryBuilder, made from individual solid parts.
 * Pixel proportions follow the Vlak leaves: 44px controls, 4px radii, 14px
 * text, 16px checks, and the full 44px tag remove target. No image surfaces.
 * update() is deterministic, including when the renderer seeks backwards.
 */
export function createSelection(THREE, kit) {
  const { box, frame, text, extrude, materials } = kit;
  const group = new THREE.Group();
  group.name = "Selection becomes a query";
  const S = 0.022;
  const H = 44 * S;
  const R = 4 * S;
  const W = 3.518;
  const ink = materials.ink;
  const paper = materials.paper;
  const gray = materials.gray ?? materials.edge;
  const muted = ink.clone();
  muted.color.set(0x6b6b6b);
  const selected = paper.clone();
  selected.color.set(0xe4e2dc);
  const border = gray.clone();
  border.color.set(0x999892);
  const divider = gray.clone();
  divider.color.set(0xd8d6cf);
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const lerp = THREE.MathUtils.lerp;
  const smooth = (a, b, t) => {
    const p = clamp((t - a) / (b - a));
    return p * p * p * (p * (p * 6 - 15) + 10);
  };
  const spring = (age, speed = 1) => {
    const p = Math.max(0, age) * speed;
    return 1 - Math.exp(-7.8 * p) * (Math.cos(10 * p) + 0.4 * Math.sin(10 * p));
  };
  const press = (t, start) => {
    const age = (t - start) / 0.26;
    return age > 0 && age < 1 ? Math.sin(age * Math.PI) ** 2 : 0;
  };
  function add(parent, part, x = 0, y = 0, z = 0) {
    part.position.set(x, y, z);
    parent.add(part);
    return part;
  }
  function type(parent, value, size, x, y, z, material = ink, align = "left") {
    const part = text(value, size, material, 0.024, -0.01);
    add(parent, part, x + (align === "left" ? part.userData.width / 2 : 0), y, z);
    return part;
  }

  // Extruded SVG-style strokes: butt caps, miter joins, and a true 1px width.
  function stroke(parent, coordinates, size = 16 * S, material = ink, width = S) {
    const points = coordinates.map(([x, y]) => new THREE.Vector2((x - 8) / 16 * size, (8 - y) / 16 * size));
    const left = [];
    const right = [];
    for (let i = 0; i < points.length; i++) {
      const incoming = points[i].clone().sub(points[Math.max(0, i - 1)]).normalize();
      const outgoing = points[Math.min(points.length - 1, i + 1)].clone().sub(points[i]).normalize();
      if (i === 0) incoming.copy(outgoing);
      if (i === points.length - 1) outgoing.copy(incoming);
      const a = new THREE.Vector2(-incoming.y, incoming.x);
      const b = new THREE.Vector2(-outgoing.y, outgoing.x);
      const miter = a.clone().add(b).normalize();
      const offset = miter.multiplyScalar(width / 2 / Math.max(0.25, miter.dot(b)));
      left.push(points[i].clone().add(offset));
      right.push(points[i].clone().sub(offset));
    }
    const shape = new THREE.Shape([...left, ...right.reverse()]);
    shape.closePath();
    const mesh = new THREE.Mesh(extrude(shape, 0.035, 0.002), material);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function chevron(parent, x, y, z) {
    const icon = new THREE.Group();
    // chevron-right rotated 90° in SVG's downward Y coordinate system.
    stroke(icon, [[4.25, 5.5], [8.75, 10.5], [13.25, 5.5]]);
    return add(parent, icon, x, y, z);
  }
  function cross(parent, x, y, z) {
    const icon = new THREE.Group();
    stroke(icon, [[4.5, 4.5], [11.5, 11.5]]);
    stroke(icon, [[11.5, 4.5], [4.5, 11.5]]);
    return add(parent, icon, x, y, z);
  }
  function control(parent, width, value, options = {}) {
    const part = new THREE.Group();
    part.name = options.name ?? value;
    const body = add(part, box(width, H, 0.14, paper, R));
    const rim = add(part, frame(width - 0.007, H - 0.007, 0.038, options.ghost ? divider : border, R, S), 0, 0, 0.091);
    const caption = value ? type(part, value, 14 * S, options.center ? 0 : -width / 2 + 12 * S, 0, 0.116, options.muted ? muted : ink, options.center ? "center" : "left") : null;
    const arrow = options.select ? chevron(part, width / 2 - 20 * S, 0, 0.132) : null;
    parent.add(part);
    return { group: part, body, rim, caption, arrow, width };
  }

  const menu = new THREE.Group();
  menu.name = "MultiSelect individual controls";
  group.add(menu);
  const summary = control(menu, 6.06, "Select topics", { select: true });
  summary.group.position.set(-5.38, 4.26, 0.23);
  const summaryStates = ["Motion", "Motion, Accessibility"].map((value) => type(summary.group, value, 14 * S, -3.03 + 12 * S, 0, 0.118));
  const panel = add(menu, frame(6.06, 8.04, 0.07, border, R, S), -5.38, -0.37, 0.13);
  const search = control(menu, 5.53, "Search options", { muted: true });
  search.group.position.set(-5.38, 2.85, 0.25);
  const optionNames = ["Motion", "Typography", "Components", "Accessibility", "Documentation", "Tokens"];
  const rows = optionNames.map((value, i) => {
    const row = new THREE.Group();
    row.name = `${value} option`;
    const width = 5.53;
    const slab = add(row, box(width, H, 0.085, paper, R));
    const wash = add(row, box(width - 0.022, H - 0.022, 0.04, selected, R), 0, 0, 0.065);
    const checkbox = new THREE.Group();
    checkbox.name = `${value} checkbox`;
    const checkFace = add(checkbox, box(16 * S, 16 * S, 0.07, paper, 3 * S));
    add(checkbox, frame(16 * S, 16 * S, 0.03, ink, 3 * S, 1.5 * S), 0, 0, 0.05);
    const check = new THREE.Group();
    stroke(check, [[3.5, 8.5], [6.5, 11.5], [12.5, 4.5]], 12 * S, paper);
    add(checkbox, check, 0, 0, 0.08);
    add(row, checkbox, -width / 2 + 16 * S, 0, 0.12);
    const caption = type(row, value, 14 * S, -width / 2 + 33 * S, 0, 0.123);
    add(menu, row, -5.38, 1.69 - i * 48 * S, 0.22);
    return { group: row, slab, wash, checkbox, checkFace, check, caption, y: row.position.y };
  });

  // The two original selected labels travel with their own paper tag shells.
  // During the query assembly those same labels become the value-field glyphs.
  const selectedRows = [0, 3];
  const chips = selectedRows.map((rowIndex, i) => {
    const value = optionNames[rowIndex];
    const part = new THREE.Group();
    part.name = `${value}: selected option → tag → query value`;
    const caption = text(value, 14 * S, ink, 0.03, -0.01);
    const width = caption.userData.width + 66 * S;
    const body = add(part, box(width, 54 * S, 0.16, paper, R));
    const rim = add(part, frame(width - 0.007, 54 * S - 0.007, 0.04, border, R, S), 0, 0, 0.103);
    const valueBody = add(part, box(W, H, 0.16, paper, R));
    const valueRim = add(part, frame(W - 0.007, H - 0.007, 0.04, border, R, S), 0, 0, 0.103);
    const labelX = -width / 2 + 12 * S + caption.userData.width / 2;
    add(part, caption, labelX, 0, 0.137);
    const remove = new THREE.Group();
    const removeBody = add(remove, box(H, H, 0.045, selected, R));
    const icon = cross(remove, 0, 0, 0.047);
    const removeRim = add(remove, frame(H, H, 0.035, divider, R, S), 0, 0, 0.035);
    const finalRemoveBody = add(remove, box(W, H, 0.045, paper, R));
    const finalRemoveRim = add(remove, frame(W, H, 0.035, divider, R, S), 0, 0, 0.035);
    const removeLabel = type(remove, "Remove", 14 * S, 0, 0, 0.063, ink, "center");
    add(part, remove, width / 2 - 26 * S, 0, 0.111);
    group.add(part);
    return {
      group: part, body, rim, valueBody, valueRim, caption, width, labelX, remove, removeBody,
      removeRim, finalRemoveBody, finalRemoveRim, removeLabel, icon, start: 1.25 + i * 0.48,
      source: new THREE.Vector3(-5.16, rows[rowIndex].y, 0.44),
      hover: new THREE.Vector3(i === 0 ? 2.24 : 4.49, i === 0 ? 1.19 : -1.21, 1.15 + i * 0.28),
      target: new THREE.Vector3(1.847, i === 0 ? 0.31 : -1.12, 0.31),
    };
  });

  const query = new THREE.Group();
  query.name = "QueryBuilder nested groups and controls";
  group.add(query);
  const outerFrame = add(query, frame(16.64, 9.14, 0.063, divider, 0.001, S), 0, 0, 0.10);
  const innerFrame = add(query, frame(15.23, 5.93, 0.054, divider, 0.001, S), 0, -0.20, 0.16);
  // A small paper legend backing is part of the fieldset itself, not a panel.
  const legendMask = add(query, box(1.95, 0.40, 0.08, paper, 0.001), -6.72, 4.57, 0.16);
  const legend = type(query, "Conditions", 14 * S, -7.54, 4.57, 0.217);
  const nestedMask = add(query, box(2.45, 0.42, 0.06, paper, 0.001), -5.98, 2.765, 0.18);
  const nestedLegend = type(query, "Nested group", 14 * S, -7.09, 2.765, 0.22);
  const all = control(query, 4.65, "All conditions", { select: true });
  all.group.position.set(-5.41, 3.69, 0.29);
  const any = control(query, 4.35, "Any condition", { select: true });
  any.group.position.set(-5.09, 1.88, 0.29);
  const fields = [];
  const rowLabels = [];
  const controlX = [-5.541, -1.847, 1.847, 5.541];
  for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
    const y = rowIndex === 0 ? 0.31 : -1.12;
    for (let column = 0; column < 2; column++) {
      const part = control(query, W, column === 0 ? "Topic" : "is", { select: true });
      part.group.position.set(controlX[column], y, 0.31);
      fields.push({ ...part, rowIndex, column, target: part.group.position.clone(), start: 3.57 + rowIndex * 0.17 + column * 0.13 });
    }
    for (let column = 0; column < 3; column++) {
      const label = type(query, ["Field", "Operator", "Value"][column], 12 * S, controlX[column] - W / 2, y + 0.70, 0.22, muted);
      rowLabels.push({ label, rowIndex, column });
    }
  }
  const actionSpecs = [
    ["Add condition", -5.54, -2.40, 3.50, 4.52],
    ["Add group", -2.03, -2.40, 3.16, 4.65],
    ["Remove group", 5.23, -2.40, 3.63, 4.78],
    ["Add condition", -5.84, -3.86, 3.50, 4.89],
    ["Add group", -2.33, -3.86, 3.16, 5.01],
  ];
  const actions = actionSpecs.map(([value, x, y, width, start]) => {
    const part = control(query, width, value, { ghost: true, center: true });
    part.group.position.set(x, y, 0.23);
    return { ...part, target: part.group.position.clone(), start };
  });

  // Ballistic cubic paths, followed by small damped settling at the destination.
  function curved(part, a, b, progress, loft, side = 1) {
    const p = clamp(progress);
    const one = 1 - p;
    const c = a.clone().lerp(b, 0.31).add(new THREE.Vector3(0.0, side * 1.15, loft));
    const d = a.clone().lerp(b, 0.76).add(new THREE.Vector3(side * 0.43, side * 0.61, loft * 0.74));
    part.position.copy(a).multiplyScalar(one ** 3)
      .addScaledVector(c, 3 * one * one * p)
      .addScaledVector(d, 3 * one * p * p)
      .addScaledVector(b, p ** 3);
  }
  function splitLayers(part, settled, amount = 1) {
    part.body.position.z = (1 - settled) * 0.22 * amount;
    part.rim.position.z = 0.091 + (1 - settled) * 0.61 * amount;
    if (part.caption) part.caption.position.z = 0.116 + (1 - settled) * 1.02 * amount;
    if (part.arrow) part.arrow.position.z = 0.132 + (1 - settled) * 1.22 * amount;
  }

  function update(time) {
    const t = Math.max(0, Math.min(6.5, Number.isFinite(time) ? time : 0));
    const menuAway = smooth(3.04, 3.90, t);
    menu.visible = menuAway < 1;
    menu.position.set(-5.38 * menuAway * 0.94, 0, 0.03 + menuAway * 0.6);
    menu.scale.setScalar(1 - menuAway * 0.94);
    const summaryAssembled = spring(t - 0.03);
    summary.group.position.z = 0.23 + (1 - summaryAssembled) * 0.7 + menuAway * 0.2;
    splitLayers(summary, summaryAssembled);
    summary.group.rotation.x = (1 - summaryAssembled) * 0.10;
    summary.caption.visible = t < chips[0].start + 0.12;
    for (let i = 0; i < summaryStates.length; i++) {
      summaryStates[i].visible = i === 0 ? t >= chips[0].start + 0.12 && t < chips[1].start + 0.12 : t >= chips[1].start + 0.12;
      summaryStates[i].position.z = 0.118 + (1 - summaryAssembled) * 1.02;
    }
    const panelOpening = smooth(0.22, 1.14, t);
    panel.scale.y = Math.max(0.001, panelOpening);
    panel.position.y = 3.65 - 4.02 * panelOpening;
    panel.position.z = 0.13 + (1 - panelOpening) * 0.75;
    const searchAssembled = spring(t - 0.31);
    search.group.visible = t > 0.20;
    splitLayers(search, searchAssembled, 0.7);
    search.group.position.z = 0.25 + (1 - searchAssembled) * 0.5;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const settled = spring(t - 0.40 - i * 0.064, 1.08);
      const inView = smooth(0.27 + i * 0.05, 0.62 + i * 0.06, t);
      row.group.visible = inView > 0;
      row.group.position.set(-5.38 + (1 - settled) * (i % 2 ? 0.50 : -0.5), row.y + (1 - settled) * 0.65, 0.22 + (1 - settled) * (1.1 + i * 0.15));
      row.group.rotation.set((1 - settled) * 0.11, (1 - settled) * (i % 2 ? -0.11 : 0.11), (1 - settled) * 0.035);
      row.group.scale.setScalar(Math.max(0.001, inView));
      row.caption.position.z = 0.123 + (1 - settled) * 0.35;
      row.checkbox.position.z = 0.12 + (1 - settled) * 0.53;
      const selectedIndex = selectedRows.indexOf(i);
      const at = selectedIndex < 0 ? 99 : chips[selectedIndex].start;
      const fill = smooth(at, at + 0.22, t);
      row.wash.visible = fill > 0;
      row.wash.scale.x = Math.max(0.001, fill);
      row.wash.position.x = -(5.53 - 0.022) * (1 - fill) / 2;
      row.checkFace.material = t >= at + 0.09 ? ink : paper;
      row.check.visible = t >= at + 0.09;
      row.check.scale.setScalar(Math.max(0.001, spring((t - at - 0.09) * 1.8)));
      row.check.position.z = 0.08 + Math.max(0, 1 - spring(t - at - 0.09)) * 0.28;
      row.slab.position.z = -0.048 * press(t, at);
    }

    const queryAppears = smooth(3.15, 3.90, t);
    query.visible = queryAppears > 0;
    const frameSettle = spring(t - 3.29);
    outerFrame.scale.set(Math.max(0.001, queryAppears), 0.58 + 0.42 * queryAppears, 1);
    outerFrame.position.z = Math.max(0.055, 0.1 + (1 - frameSettle) * 1.30);
    innerFrame.scale.set(Math.max(0.001, smooth(3.40, 4.24, t)), 0.48 + 0.52 * smooth(3.40, 4.24, t), 1);
    innerFrame.position.z = 0.16 + (1 - spring(t - 3.55)) * 1.40;
    for (const part of [legendMask, legend, nestedMask, nestedLegend]) {
      part.scale.setScalar(smooth(3.72, 4.35, t));
    }
    for (const [index, part] of [all, any].entries()) {
      const assembled = spring(t - 3.31 - index * 0.18);
      splitLayers(part, assembled, 0.67);
      part.group.position.z = 0.29 + (1 - assembled) * 1.25;
      part.group.rotation.x = (1 - assembled) * -0.17;
      part.group.scale.setScalar(Math.max(0.001, smooth(3.20 + index * 0.15, 3.80 + index * 0.15, t)));
    }

    for (let i = 0; i < chips.length; i++) {
      const chip = chips[i];
      const launched = smooth(chip.start + 0.08, chip.start + 1.10, t);
      const assemblyStart = 3.44 + i * 0.23;
      const assembled = smooth(assemblyStart, assemblyStart + 1.25, t);
      chip.group.visible = t >= chip.start + 0.06;
      if (t < assemblyStart) {
        curved(chip.group, chip.source, chip.hover, launched, 2.2, i === 0 ? 1 : -1);
        const arrival = Math.max(0, t - chip.start - 1.10);
        chip.group.position.z += arrival > 0 ? Math.sin(arrival * 11) * Math.exp(-arrival * 6) * 0.16 : 0;
      } else {
        curved(chip.group, chip.hover, chip.target, assembled, 1.55, i === 0 ? 1 : -1);
      }
      chip.group.rotation.set(Math.sin(launched * Math.PI) * -0.23 * (1 - assembled), Math.sin(launched * Math.PI) * (i === 0 ? 0.42 : -0.35) * (1 - assembled), Math.sin(launched * Math.PI) * (i === 0 ? -0.08 : 0.08) * (1 - assembled));
      chip.group.scale.setScalar(Math.max(0.001, smooth(chip.start + 0.06, chip.start + 0.32, t)));
      const stretch = lerp(chip.width, W, assembled) / chip.width;
      chip.body.scale.set(stretch, lerp(1, H / (54 * S), assembled), 1);
      chip.rim.scale.copy(chip.body.scale);
      // End on unscaled 4px corners after the deliberately elastic transition.
      chip.body.visible = chip.rim.visible = assembled < 0.999;
      chip.valueBody.visible = chip.valueRim.visible = assembled >= 0.999;
      // Keep the exact glyphs; only their left padding changes with the shell.
      chip.caption.position.x = lerp(chip.labelX, -W / 2 + 12 * S + chip.caption.userData.width / 2, assembled);
      chip.caption.position.z = 0.137 + Math.sin(assembled * Math.PI) * 0.34;
      const removeFlight = smooth(assemblyStart + 0.17, assemblyStart + 1.30, t);
      chip.remove.position.x = lerp(chip.width / 2 - 26 * S, controlX[3] - controlX[2], removeFlight);
      chip.remove.position.y = Math.sin(removeFlight * Math.PI) * (i === 0 ? 0.52 : -0.47);
      chip.remove.position.z = 0.111 + Math.sin(removeFlight * Math.PI) * 1.32;
      chip.remove.rotation.z = Math.sin(removeFlight * Math.PI) * (i === 0 ? 0.10 : -0.10);
      chip.removeBody.scale.x = lerp(1, W / H, removeFlight);
      chip.removeBody.material = t < assemblyStart + 0.35 ? selected : paper;
      chip.removeRim.scale.x = lerp(1, W / H, removeFlight);
      chip.icon.visible = removeFlight < 0.49;
      chip.removeBody.visible = chip.removeRim.visible = removeFlight < 0.999;
      chip.finalRemoveBody.visible = chip.finalRemoveRim.visible = removeFlight >= 0.999;
      chip.removeLabel.visible = removeFlight >= 0.49;
      chip.removeLabel.scale.setScalar(Math.max(0.001, smooth(0.42, 0.88, removeFlight)));
    }
    for (const field of fields) {
      const p = smooth(field.start, field.start + 0.89, t);
      const source = chips[field.rowIndex].hover.clone();
      source.y += field.column === 0 ? 0.22 : -0.22;
      curved(field.group, source, field.target, p, 1.65 - field.column * 0.25, field.rowIndex === 0 ? 1 : -1);
      field.group.visible = t >= field.start;
      field.group.scale.setScalar(Math.max(0.001, smooth(field.start, field.start + 0.28, t)));
      field.group.rotation.y = Math.sin(p * Math.PI) * 0.32;
      field.group.rotation.z = Math.sin(p * Math.PI) * (field.column === 0 ? 0.08 : -0.08);
      splitLayers(field, spring(t - field.start - 0.14), 0.55);
    }
    for (const { label, rowIndex, column } of rowLabels) {
      const start = 4.11 + rowIndex * 0.19 + column * 0.10;
      const settled = spring(t - start);
      label.visible = t > start;
      label.position.z = 0.22 + (1 - settled) * 0.58;
      label.scale.setScalar(Math.max(0.001, smooth(start, start + 0.29, t)));
    }
    for (let i = 0; i < actions.length; i++) {
      const part = actions[i];
      const settled = spring(t - part.start, 1.1);
      part.group.visible = t >= part.start;
      part.group.position.copy(part.target);
      part.group.position.y -= (1 - settled) * 0.32;
      part.group.position.z += (1 - settled) * (1.05 + i * 0.07);
      part.group.rotation.x = (1 - settled) * -0.14;
      part.group.scale.setScalar(Math.max(0.001, smooth(part.start, part.start + 0.30, t)));
      splitLayers(part, settled, 0.45);
    }
  }

  update(0);
  return { group, update };
}
