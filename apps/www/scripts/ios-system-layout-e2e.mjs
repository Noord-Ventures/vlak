import assert from "node:assert/strict";

/** Exercise physical screen centering, modular controls and camera exclusions. */
export async function checkIOSSystemLayout({ page, base }) {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/interfaces/ios/`, { waitUntil: "networkidle" });
  const phone = page.locator(".mo-phone");
  const rotate = page.getByRole("button", { name: "Rotate device", exact: true });
  const device = page.getByRole("combobox", { name: "Device", exact: true });
  const measure = () => phone.evaluate(node => {
    const bounds = element => { const b = element.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const intersects = (a, b) => a.x < b.x + b.w - .5 && a.x + a.w > b.x + .5 && a.y < b.y + b.h - .5 && a.y + a.h > b.y + .5;
    const frame = bounds(node), scale = frame.w / node.clientWidth;
    const gesture = bounds(node.querySelector(".mo-home-indicator-button > span"));
    const page = node.querySelector(".mo-library-page"), camera = node.querySelector(".mo-camera-cutout");
    const cameraBounds = camera?.checkVisibility() ? bounds(camera) : null;
    const collisions = cameraBounds ? [...node.querySelectorAll("button, input")].filter(element => element.checkVisibility({ checkOpacity: true }) && intersects(bounds(element), cameraBounds)).map(element => element.getAttribute("aria-label") || element.textContent) : [];
    const groups = [...node.querySelectorAll(".mo-ios-control-pair > button, .mo-ios-control-shortcuts > button")].map(bounds);
    const layout = node.querySelector(".mo-ios-control-layout"), scroll = layout?.closest(".mo-scroll");
    return { gestureOffset: (gesture.x + gesture.w / 2 - frame.x - frame.w / 2) / scale,
      pageOffset: page && node.dataset.duoLayout === "vertical" ? (bounds(page).x + bounds(page).w / 2 - frame.x - frame.w / 2) / scale : 0,
      collisions, circles: groups.map(b => ({ width: b.w / scale, height: b.h / scale })),
      overlapping: groups.some((a, i) => groups.slice(i + 1).some(b => intersects(a, b))),
      overflow: scroll ? scroll.scrollWidth - scroll.clientWidth : 0,
      columns: layout ? getComputedStyle(layout).gridTemplateColumns.split(" ").length : 0,
    };
  });
  const verify = async label => {
    const home = await measure();
    assert(Math.abs(home.gestureOffset) < 1, `${label}: Home indicator centers on the physical display`);
    assert(Math.abs(home.pageOffset) < 1, `${label}: pagination centers on the physical display`);
    assert.deepEqual(home.collisions, [], `${label}: Home controls clear the camera`);
    const controlCenter = page.getByRole("button", { name: "Open Control Center", exact: true });
    await controlCenter.click({ force: true });
    // Also exercise :focus-within: pointer focus may hand off to the panel at
    // different times, but keyboard focus must never reveal a covered target.
    await controlCenter.focus();
    const controls = await measure();
    assert.equal(controls.overflow, 0, `${label}: Control Center does not overflow horizontally`);
    assert.equal(controls.overlapping, false, `${label}: circular controls have separate targets`);
    assert.deepEqual(controls.collisions, [], `${label}: controls clear the camera`);
    assert(controls.circles.every(b => b.width >= 43.9 && b.height >= 43.9 && Math.abs(b.width - b.height) < 1), `${label}: controls remain square and at least 44px`);
    const lock = phone.getByRole("button", { name: "Portrait orientation lock", exact: true });
    const pressed = await lock.getAttribute("aria-pressed");
    await lock.click();
    assert.notEqual(await lock.getAttribute("aria-pressed"), pressed, `${label}: the lock remains interactive`);
    await phone.getByRole("button", { name: "Home", exact: true }).click();
    return { label, columns: controls.columns };
  };
  const results = [];
  results.push(await verify("Duo outer portrait"));
  await rotate.click(); results.push(await verify("Duo outer landscape"));
  await rotate.click(); await page.getByRole("button", { name: "Open display", exact: true }).click();
  results.push(await verify("Duo inner landscape"));
  await rotate.click(); results.push(await verify("Duo inner portrait"));
  await rotate.click();
  for (const id of ["iphone-18-pro", "iphone-18-pro-max"]) {
    await device.selectOption(id);
    results.push(await verify(`${id} portrait`));
    await rotate.click(); results.push(await verify(`${id} landscape`)); await rotate.click();
  }
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("button", { name: "Use phone", exact: true }).click();
    results.push(await verify(`Readable ${width}px`));
    await page.getByRole("button", { name: "View device", exact: true }).click();
  }
  await page.setViewportSize({ width: 1440, height: 1100 });
  for (const id of ["iphone-duo", "iphone-18-pro"]) {
    await device.selectOption(id);
    if (id === "iphone-duo" && await page.getByRole("button", { name: "Fold display", exact: true }).count()) await page.getByRole("button", { name: "Fold display", exact: true }).click();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const overlay of [false, true]) {
      if (overlay) await page.getByRole("button", { name: "Open Control Center", exact: true }).click({ force: true });
      for (let direction = 0; direction < 2; direction++) {
        await rotate.click();
        const started = Date.now();
        while (Date.now() - started < 750) {
          assert.deepEqual((await measure()).collisions, [], `${id}: the rotating camera never sweeps across a ${overlay ? "Control Center" : "Home"} control`);
          await page.evaluate(() => new Promise(requestAnimationFrame));
        }
      }
      if (overlay) await phone.getByRole("button", { name: "Home", exact: true }).click();
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  return results;
}
