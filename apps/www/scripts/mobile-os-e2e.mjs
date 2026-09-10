import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { deviceProfiles } from "../app/interfaces/mobile-os/device-profiles.ts";

/** Read real geometry, including the chassis faces that remain solid edge-on. */
async function readMobileFoldScene(device) {
  return device.locator(".mo-fold-presentation").evaluate(wrapper => {
    const stage = wrapper.querySelector(".mo-fold-stage");
    const body = element => { const style = getComputedStyle(element); return { preserve: style.transformStyle, overflow: style.overflow, filter: style.filter, opacity: style.opacity, mask: style.maskImage, clip: style.clipPath }; };
    const matrix = element => new DOMMatrixReadOnly(getComputedStyle(element).transform);
    const texture = element => {
      const content = element.querySelector(".mo-screen"), gesture = element.querySelector(".mo-system-nav");
      return { posture: element.closest(".mo-fold-context").dataset.posture, display: element.dataset.duoDisplay,
        width: element.clientWidth, height: element.clientHeight,
        contentTop: content.offsetTop, contentHeight: content.offsetHeight,
        gestureTop: gesture.offsetTop, gestureHeight: gesture.offsetHeight,
      };
    };
    return {
      inert: wrapper.inert, hidden: wrapper.getAttribute("aria-hidden"), duplicateIds: wrapper.querySelectorAll("[id],[name],[popover]").length,
      body: body(stage),
      panels: [...stage.querySelectorAll(".mo-fold-panel")].map(panel => {
        const front = panel.querySelector(".mo-fold-front"), back = panel.querySelector(".mo-fold-back");
        const frontMatrix = matrix(front), backMatrix = matrix(back);
        return { body: body(panel), frontBackface: getComputedStyle(front).backfaceVisibility, rearBackface: getComputedStyle(back).backfaceVisibility,
          depth: Math.abs(frontMatrix.m43 - backMatrix.m43), opposing: frontMatrix.m33 * backMatrix.m33,
          edges: panel.querySelectorAll(".mo-fold-edge").length,
          rimDepths: [...panel.querySelectorAll(".mo-fold-rim")].map(element => matrix(element).m43),
          inner: texture(front.querySelector(".mo-fold-texture")),
        };
      }),
      cover: texture(stage.querySelector(".mo-fold-cover-texture")),
      hingeFacets: stage.querySelectorAll(".mo-fold-spine > i").length,
      liveInert: wrapper.closest("section.mo-device").querySelector(".mo-device-fit").inert,
    };
  });
}

function assertPhysicalFoldScene(scene) {
  assert.equal(scene.panels.length, 2, "The fold consists of two solid articulated bodies");
  assert.equal(scene.inert, true, "Visual textures cannot receive input");
  assert.equal(scene.hidden, "true", "Screen readers ignore duplicate display textures");
  assert.equal(scene.duplicateIds, 0, "Textures have no duplicate form identities or native popovers");
  assert.equal(scene.liveInert, true, "The hidden live app cannot receive keyboard input during inspection");
  for (const body of [scene.body, ...scene.panels.map(panel => panel.body)]) {
    assert.equal(body.preserve, "preserve-3d");
    assert(["visible", "clip"].includes(body.overflow), "The chassis does not flatten its depth by clipping");
    assert.deepEqual([body.filter, body.opacity, body.mask, body.clip], ["none", "1", "none", "none"], "Optical paint never flattens the physical scene");
  }
  for (const panel of scene.panels) {
    assert.deepEqual([panel.frontBackface, panel.rearBackface], ["hidden", "hidden"], "Rear casing replaces mirrored front-screen content");
    assert(panel.depth > 3 && panel.opposing < -.9, "Front and rear faces occupy opposite sides of a solid body");
    assert(panel.edges >= 4, "Physical perimeter faces remain visible when the screen turns edge-on");
    assert(panel.rimDepths.length >= 3 && Math.max(...panel.rimDepths) - Math.min(...panel.rimDepths) > 3, "Rounded chassis sections span real depth");
    assert.equal(panel.inner.posture, "expanded", "Inner displays retain their expanded app arrangement");
  }
  assert.equal(scene.cover.posture, "compact", "The rear outer display retains its compact app arrangement");
  assert(scene.hingeFacets >= 6, "The hinge has a curved physical perimeter");
  for (const layout of scene.panels.map(panel => panel.inner)) assert.equal(layout.display, "inner");
  assert.equal(scene.cover.display, "outer", "The cover uses actual outer-display chrome");
  for (const layout of [...scene.panels.map(panel => panel.inner), scene.cover]) {
    assert(layout.width > 0 && layout.height > 0 && layout.contentHeight > 0, "Every physical display carries a laid-out app surface");
    assert(layout.contentTop >= 0 && layout.contentTop < layout.height, "App content remains inside its captured display");
    assert.equal(layout.gestureHeight, 34, "The Home gesture keeps its native reserved height");
    assert.equal(layout.gestureTop + layout.gestureHeight, layout.height, "Snapshot Home gesture stays pinned at the bottom");
  }
}

/** Include real clipping ancestors, not just the model's own reserved rectangle. */
async function assertMobileFoldBounds(device) {
  const overflow = await device.locator(".mo-fold-presentation").evaluate(wrapper => {
    const viewport = wrapper.parentElement.getBoundingClientRect(), own = wrapper.getBoundingClientRect();
    const clips = [];
    for (let element = wrapper.parentElement; element && !element.matches(".if-study"); element = element.parentElement) {
      const style = getComputedStyle(element);
      if ([style.overflowX, style.overflowY].some(value => ["hidden", "clip"].includes(value))) clips.push(element.getBoundingClientRect());
    }
    const faces = [...wrapper.querySelectorAll(".mo-fold-front,.mo-fold-back,.mo-fold-edge,.mo-fold-rim")].map(element => element.getBoundingClientRect());
    return Math.max(Math.max(viewport.left, ...clips.map(rect => rect.left)) - Math.min(...faces.map(rect => rect.left)),
      Math.max(...faces.map(rect => rect.right)) - Math.min(viewport.right, ...clips.map(rect => rect.right)),
      Math.max(own.top, ...clips.map(rect => rect.top)) - Math.min(...faces.map(rect => rect.top)),
      Math.max(...faces.map(rect => rect.bottom)) - Math.min(own.bottom, ...clips.map(rect => rect.bottom)));
  });
  assert(overflow <= 2, `Physical scene is not clipped by its real ancestors: ${overflow.toFixed(2)}px`);
}

/** Observe the spring's painted frames. No seeking, pausing, or synthetic clock advance. */
export async function assertMobileFoldAnimation({ device, opening, reversed = false }) {
  await device.locator(".mo-fold-stage").waitFor();
  assertPhysicalFoldScene(await readMobileFoldScene(device));
  const samples = await device.locator(".mo-fold-stage").evaluate(async stage => {
    const wrapper = stage.closest(".mo-fold-presentation"), viewport = wrapper.parentElement;
    const moving = stage.querySelector(".mo-fold-panel-left .mo-fold-front .mo-fold-texture");
    const settled = stage.querySelector(".mo-fold-panel-right .mo-fold-front .mo-fold-texture");
    const cover = stage.querySelector(".mo-fold-cover-texture");
    const left = stage.querySelector(".mo-fold-panel-left");
    const rows = [];
    await new Promise((resolve, reject) => {
      const deadline = setTimeout(() => reject(new Error("Physical fold did not settle and remove its presentation")), 10000);
      const sample = time => {
        if (!stage.isConnected) { clearTimeout(deadline); resolve(); return; }
        const angle = Number(stage.dataset.hingeAngle), transform = new DOMMatrixReadOnly(getComputedStyle(left).transform);
        const physicalAngle = 180 - Math.acos(Math.max(-1, Math.min(1, stage.dataset.axis === "horizontal" ? transform.m22 : transform.m11))) * 180 / Math.PI;
        const bounds = wrapper.getBoundingClientRect(), horizontal = viewport.getBoundingClientRect();
        const faces = [...stage.querySelectorAll(".mo-fold-front,.mo-fold-back,.mo-fold-edge,.mo-fold-rim")].map(face => face.getBoundingClientRect());
        const clips = [stage.closest(".mo-stage"), stage.closest("section.mo"), stage.closest(".if-specimen")].filter(Boolean).map(element => element.getBoundingClientRect());
        rows.push({ time, angle, physicalAngle, blur: Number.parseFloat(getComputedStyle(moving).filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0"),
          crisp: [settled, cover, stage, ...stage.querySelectorAll(".mo-fold-panel")].every(element => getComputedStyle(element).filter === "none"),
          overflow: Math.max(Math.max(horizontal.left, ...clips.map(rect => rect.left)) - Math.min(...faces.map(face => face.left)), Math.max(...faces.map(face => face.right)) - Math.min(horizontal.right, ...clips.map(rect => rect.right)), Math.max(bounds.top, ...clips.map(rect => rect.top)) - Math.min(...faces.map(face => face.top)), Math.max(...faces.map(face => face.bottom)) - Math.min(bounds.bottom, ...clips.map(rect => rect.bottom))),
        });
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    return rows;
  });
  assert(samples.length >= 3, "The real hinge is observed over several rendered frames");
  const direction = opening ? 1 : -1;
  assert(direction * (samples.at(-1).angle - samples[0].angle) > (reversed ? 5 : 90), "The physical hinge travels toward the requested posture");
  if (!reversed) assert(samples.slice(1).every((sample, index) => direction * (sample.angle - samples[index].angle) >= -.05), "An uninterrupted fold progresses smoothly toward its target");
  assert(samples.every(sample => Math.abs(sample.physicalAngle - sample.angle) < .1), "Actual 3D articulation follows the reported hinge pose");
  assert(samples.every(sample => sample.crisp), "Rear cover, settled screen, and physical frame stay sharp");
  assert(samples.every(sample => sample.overflow <= 2), `Projected chassis remains inside its reserved frame: ${Math.max(...samples.map(sample => sample.overflow)).toFixed(2)}px`);
  const optical = samples.filter(sample => sample.angle > 15 && sample.angle < 165);
  assert(optical.length >= 3 && new Set(optical.map(sample => Math.round(sample.blur))).size >= (reversed ? 2 : 3), "Moving inner-display diffusion follows several intermediate hinge poses");
  assert.equal(await device.locator(".mo-fold-presentation,.mo-fold-stage,.mo-folding").count(), 0);
  const final = await device.locator(".mo-device-fit").evaluate(frame => ({ inert: frame.inert, filter: getComputedStyle(frame.querySelector(".mo-phone")).filter, opacity: getComputedStyle(frame.querySelector(".mo-handset")).opacity }));
  assert.deepEqual(final, { inert: false, filter: "none", opacity: "1" }, "The same live app becomes interactive and sharp after settling");
}

/** Reverse a moving body in the same frame, preserving its actual current pose. */
export async function assertMobileFoldReversal({ page, device }) {
  await page.waitForFunction(() => {
    const angle = Number(document.querySelector(".mo-fold-stage")?.dataset.hingeAngle);
    return angle > 60 && angle < 125;
  });
  const reversal = await device.locator(".mo-fold-stage").evaluate(async stage => {
    const before = Number(stage.dataset.hingeAngle), now = performance.now();
    const button = [...stage.closest("section.mo").querySelectorAll(".mo-device-controls button")].find(element => element.textContent === "Fold display");
    button.click();
    await new Promise(resolve => requestAnimationFrame(resolve));
    return { same: stage.isConnected && stage === document.querySelector(".mo-fold-stage"), before, after: Number(stage.dataset.hingeAngle), elapsed: performance.now() - now };
  });
  assert.equal(reversal.same, true, "Reversing retargets the same articulated scene");
  assert(Math.abs(reversal.after - reversal.before) <= 20, `Reversal preserves hinge position instead of snapping to an endpoint: ${JSON.stringify(reversal)}`);
  assert.equal(await device.locator(".mo-fold-presentation").count(), 1, "Reversal leaves one physical scene");
  await assertMobileFoldAnimation({ page, device, opening: false, reversed: true });
}

/** The native range can hold real intermediate 3D poses without moving the live app. */
export async function assertMobileFoldInspection({ page, device }) {
  const root = page.locator("section.mo");
  const activate = async target => { await target.focus(); await target.press("Enter"); };
  await activate(root.getByRole("button", { name: "Inspect fold", exact: true }));
  const range = root.getByRole("slider", { name: "Hinge angle", exact: true });
  await range.waitFor();
  const scene = await device.locator(".mo-fold-stage").elementHandle();
  if (await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    assert.equal(Number(await device.locator(".mo-fold-stage").getAttribute("data-hinge-angle")), Number(await range.inputValue()), "Reduced-motion inspection opens directly at its requested static pose");
  }
  for (const angle of [45, 90, 135]) {
    await range.fill(String(angle));
    await page.waitForFunction(angle => Math.abs(Number(document.querySelector(".mo-fold-stage")?.dataset.hingeAngle) - angle) < .1, angle);
    assertPhysicalFoldScene(await readMobileFoldScene(device));
    await assertMobileFoldBounds(device);
    assert(await scene.evaluate(element => element.isConnected), "Manual inspection keeps the same physical scene");
    const stable = await device.locator(".mo-fold-stage").evaluate(async element => { const before = element.dataset.hingeAngle; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); return before === element.dataset.hingeAngle; });
    assert.equal(stable, true, "A manually selected hinge pose stays still");
  }
  const viewport = page.viewportSize();
  if (viewport.width === 1440) {
    try {
      await page.setViewportSize({ ...viewport, width: 390 });
      await page.waitForFunction(() => {
        const wrapper = document.querySelector(".mo-fold-presentation"), bounds = wrapper?.parentElement.getBoundingClientRect();
        const faces = [...document.querySelectorAll(".mo-fold-front,.mo-fold-back")].map(element => element.getBoundingClientRect());
        return bounds && bounds.width < 390 && faces.every(rect => rect.left >= bounds.left - 2 && rect.right <= bounds.right + 2);
      });
      await assertMobileFoldBounds(device);
      assert.equal(await device.locator(".mo-fold-stage").getAttribute("data-hinge-angle"), "135.00", "Resize preserves the selected physical pose");
    } finally { await page.setViewportSize(viewport); }
    await page.waitForFunction(() => document.querySelector(".mo-device-viewport").clientWidth > 390);
    await assertMobileFoldBounds(device);
  }
  await range.focus(); await range.press("Home"); assert.equal(await range.inputValue(), "0");
  await range.press("End"); assert.equal(await range.inputValue(), "180");
  await range.press("ArrowLeft"); assert.equal(await range.inputValue(), "179");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => !!document.activeElement.closest(".mo-device-fit")), false, "Tab skips the hidden live app during inspection");
  await activate(root.getByRole("button", { name: "Return to app", exact: true }));
  await device.locator(".mo-fold-presentation").waitFor({ state: "detached" });
  assert.equal(await range.count(), 0);
  assert.equal(await device.locator(".mo-device-fit").evaluate(element => element.inert), false);
}

/** App-level semantics and keyboard scrolling are not covered by the Home audit. */
export async function checkMobileAppAccessibility({ page, phone, app }) {
  if (!await page.evaluate(() => typeof window.axe?.run === "function")) {
    await page.addScriptTag({ content: readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8") });
  }
  const violations = await phone.evaluate(async element => (await window.axe.run(element, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })).violations.map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) })));
  assert.deepEqual(violations, [], `${app} keeps its active app surface accessible`);
  if (app === "camera") {
    const scroll = phone.locator(".mo-scroll");
    if (await scroll.evaluate(element => element.scrollHeight - element.clientHeight > 1)) {
      await scroll.evaluate(element => element.scrollTo({ top: 0, behavior: "instant" }));
      await scroll.focus();
      assert.equal(await scroll.evaluate(element => element === document.activeElement), true, "Keyboard users can focus the overflowing Camera scene");
      await scroll.press("PageDown");
      await page.waitForFunction(() => document.querySelector(".mo-device-fit .mo-phone .mo-scroll").scrollTop > 0);
      await scroll.evaluate(element => element.scrollTo({ top: 0, behavior: "instant" }));
    }
  } else if (app === "maps") {
    const map = phone.getByRole("group", { name: "Illustrative neighbourhood map", exact: true });
    const drawing = map.locator("svg > g"), original = await drawing.getAttribute("transform");
    const target = await drawing.elementHandle();
    await map.getByRole("button", { name: "Zoom in", exact: true }).press("Enter");
    await page.waitForFunction(({ target, original }) => target.getAttribute("transform") !== original, { target, original });
    await map.getByRole("button", { name: "Zoom out", exact: true }).press("Enter");
    await page.waitForFunction(({ target, original }) => target.getAttribute("transform") === original, { target, original });
  }
}

async function assertMobileIconCentered(button) {
  const result = await button.evaluate(element => {
    const rect = element.getBoundingClientRect(), icon = element.querySelector("svg")?.getBoundingClientRect();
    const phone = element.closest(".mo-phone"), scale = phone.getBoundingClientRect().width / phone.offsetWidth;
    return icon ? [(icon.x + icon.width / 2 - rect.x - rect.width / 2) / scale, (icon.y + icon.height / 2 - rect.y - rect.height / 2) / scale] : null;
  });
  assert(result && result.every(value => Math.abs(value) < .5), `Icon is centered within its actual hit area: ${JSON.stringify(result)}`);
}

async function assertIOSAppChrome(phone, app) {
  const result = await phone.evaluate((element, name) => {
    const bounds = element.getBoundingClientRect(), scale = bounds.width / element.offsetWidth;
    const host = element.querySelector(name === "calendar" ? ".mo-ios-calendar" : ".mo-ios-clock");
    const selector = name === "calendar" ? ".mo-cal-primary > button,.mo-cal-bottom button,.mo-cal-period-nav > button" : ".mo-ios-clock-tabs button,.mo-ios-clock-header-actions button";
    const controls = [...host.querySelectorAll(selector)].filter(button => button.getClientRects().length && !button.closest("[inert]"));
    const boxes = controls.map(button => ({ name: button.getAttribute("aria-label"), rect: button.getBoundingClientRect() }));
    const rail = [...host.querySelectorAll(name === "calendar" ? ".mo-cal-primary > button" : ".mo-ios-clock-tabs button")].map(button => button.getBoundingClientRect());
    return {
      layout: element.dataset.duoLayout ?? "horizontal",
      // Duo rail controls intentionally extend outside the content host into
      // the phone's reserved84px rail; their actual bounds are checked below.
      overflow: [document.documentElement.scrollWidth - innerWidth, element.scrollWidth - element.clientWidth, element.dataset.duoLayout === "vertical" ? 0 : host.scrollWidth - host.clientWidth],
      short: boxes.filter(({ rect }) => rect.width / scale < 43.5 || rect.height / scale < 43.5).map(box => box.name),
      escaped: boxes.filter(({ rect }) => rect.left < bounds.left - 1 || rect.top < bounds.top - 1 || rect.right > bounds.right + 1 || rect.bottom > bounds.bottom + 1).map(box => box.name),
      overlaps: boxes.flatMap((a, index) => boxes.slice(index + 1).filter(b => Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left) > 1 && Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top) > 1).map(b => [a.name, b.name])),
      rail: rail.map(rect => ({ x: (rect.x + rect.width / 2 - bounds.left) / scale, y: (rect.y + rect.height / 2 - bounds.top) / scale })),
      phoneWidth: element.offsetWidth,
    };
  }, app);
  assert(result.overflow.every(value => value <= 1), `${app} remains inside its phone: ${JSON.stringify(result)}`);
  assert.deepEqual(result.short, [], `${app} native controls retain44px targets`);
  assert.deepEqual(result.escaped, [], `${app} controls remain inside the visible display`);
  assert.deepEqual(result.overlaps, [], `${app} navigation hit areas do not overlap`);
  if (result.layout === "vertical") {
    assert(result.rail.every(point => Math.abs(point.x - (result.phoneWidth - 48)) < 1), `${app} navigation occupies the native trailing rail`);
    assert(result.rail.every((point, i) => i === 0 || point.y - result.rail[i - 1].y >= 47.5), `${app} rail controls remain separate`);
  } else assert(result.rail.every(point => Math.abs(point.y - result.rail[0].y) < 1), `${app} uses horizontal navigation in readable/inner portrait layout`);
  const icons = phone.locator(app === "calendar" ? ".mo-cal-primary > button" : ".mo-ios-clock-header-actions button");
  for (const button of await icons.all()) await assertMobileIconCentered(button);
}

export async function checkIOSCalendar({ page, device, activate }) {
  const root = page.locator(".mo"), phone = device.locator(".mo-device-fit .mo-phone"), calendar = phone.locator(".mo-ios-calendar");
  await calendar.waitFor();
  const view = async name => { await activate(calendar.getByRole("button", { name: "Calendar view", exact: true })); await activate(calendar.getByRole("dialog").getByRole("button", { name, exact: true })); await calendar.getByRole("dialog").waitFor({ state: "hidden" }); };
  await assertIOSAppChrome(phone, "calendar");
  const originalMonth = await calendar.locator(".mo-cal-month-heading h3").textContent();
  await activate(calendar.getByRole("button", { name: "Next month", exact: true }));
  assert.notEqual(await calendar.locator(".mo-cal-month-heading h3").textContent(), originalMonth);
  await activate(calendar.getByRole("button", { name: "Previous month", exact: true }));
  assert.equal(await calendar.locator(".mo-cal-month-heading h3").textContent(), originalMonth);
  await view("Day"); await calendar.getByRole("region", { name: "Daily schedule", exact: true }).waitFor();
  const selected = await calendar.locator('.mo-cal-day-strip [aria-pressed="true"]').getAttribute("data-date");
  await activate(calendar.getByRole("button", { name: "Next day", exact: true }));
  assert.notEqual(await calendar.locator('.mo-cal-day-strip [aria-pressed="true"]').getAttribute("data-date"), selected);
  await activate(calendar.getByRole("button", { name: "Previous day", exact: true }));
  await view("List");
  await activate(calendar.getByRole("button", { name: "New event", exact: true }));
  const editor = calendar.getByRole("dialog", { name: "New event", exact: true });
  await editor.getByRole("textbox", { name: "Event title", exact: true }).fill("Local proof review");
  await editor.getByLabel("Event time", { exact: true }).fill("16:15");
  await editor.getByRole("textbox", { name: "Event notes", exact: true }).fill("Keep this draft through both displays.");
  const date = await editor.getByRole("button", { name: "Event date", exact: true }).textContent();
  const mounted = await calendar.elementHandle();
  for (const action of ["Open display", "Rotate device", "Rotate device", "Fold display"]) {
    await activate(root.getByRole("button", { name: action, exact: true }));
    await device.locator(".mo-fold-stage").waitFor({ state: "detached" });
    assert.equal(await editor.getByRole("textbox", { name: "Event title", exact: true }).inputValue(), "Local proof review");
    assert.equal(await editor.getByRole("textbox", { name: "Event notes", exact: true }).inputValue(), "Keep this draft through both displays.");
    assert.equal(await editor.getByRole("button", { name: "Event date", exact: true }).textContent(), date);
    assert(await mounted.evaluate(element => element.isConnected), "Fold and rotation preserve the live Calendar editor");
  }
  await activate(editor.getByRole("button", { name: "Save event", exact: true }));
  let details = calendar.getByRole("dialog", { name: "Event details", exact: true });
  assert.match(await details.textContent(), /Local proof review/);
  assert.match(await details.textContent(), /4:15pm/);
  await activate(details.getByRole("button", { name: "Edit", exact: true }));
  await calendar.getByRole("textbox", { name: "Event title", exact: true }).fill("Revised proof review");
  await activate(calendar.getByRole("button", { name: "Save event", exact: true }));
  await activate(details.getByRole("button", { name: "Close", exact: true }));
  await activate(calendar.getByRole("button", { name: "Search events", exact: true }));
  await calendar.getByRole("searchbox", { name: "Search events", exact: true }).fill("Revised proof");
  await activate(calendar.getByRole("dialog").locator(".mo-cal-event-row").filter({ hasText: "Revised proof review" }));
  details = calendar.getByRole("dialog", { name: "Event details", exact: true });
  await activate(details.getByRole("button", { name: "Delete event", exact: true }));
  assert.equal(await calendar.getByText("Revised proof review", { exact: true }).count(), 0);
  await activate(calendar.getByRole("button", { name: "Calendar view", exact: true }));
  await calendar.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).press("Escape");
  await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Calendar view");
  await checkMobileAppAccessibility({ page, phone, app: "calendar" });
  // The same root controls use a rail in both Duo landscape contexts and a
  // horizontal bar in inner portrait and readable phone mode.
  for (const action of ["Open display", "Rotate device", "Rotate device", "Fold display"]) {
    await activate(root.getByRole("button", { name: action, exact: true }));
    await device.locator(".mo-fold-stage").waitFor({ state: "detached" });
    await page.waitForFunction(() => !document.querySelector(".mo-handset").getAnimations().some(animation => animation.playState === "running"));
    await assertIOSAppChrome(phone, "calendar");
  }
  if (page.viewportSize().width <= 640) {
    await activate(root.getByRole("button", { name: "Use phone", exact: true }));
    await assertIOSAppChrome(phone, "calendar");
    await checkMobileAppAccessibility({ page, phone, app: "calendar" });
    await activate(root.getByRole("button", { name: "View device", exact: true }));
  }
}

export async function checkIOSClock({ page, device, activate, launch }) {
  const phone = device.locator(".mo-device-fit .mo-phone"), clock = phone.locator(".mo-ios-clock");
  await clock.waitFor(); await assertIOSAppChrome(phone, "clock");
  const secondsWheel = clock.getByRole("listbox", { name: "Timer seconds", exact: true });
  await secondsWheel.press("Home");
  await secondsWheel.getByRole("option", { name: "01", exact: true }).click();
  assert.equal(await secondsWheel.getByRole("option", { selected: true }).textContent(), "01", "Tapping a wheel row changes the selected duration");
  await secondsWheel.press("Home"); await secondsWheel.hover(); await page.mouse.wheel(0, 88);
  await page.waitForFunction(() => document.querySelector('[role="listbox"][aria-label="Timer seconds"] [aria-selected="true"]')?.textContent === "02");
  assert(await secondsWheel.evaluate(element => Math.abs(element.scrollTop - 88) < 1), "The wheel snaps its selected row to the central band");
  await clock.getByRole("listbox", { name: "Timer minutes", exact: true }).press("Home"); await clock.getByRole("listbox", { name: "Timer minutes", exact: true }).pressSequentially("0");
  await clock.getByRole("listbox", { name: "Timer seconds", exact: true }).press("Home"); await clock.getByRole("listbox", { name: "Timer seconds", exact: true }).pressSequentially("2");
  await activate(clock.getByRole("button", { name: "Start timer", exact: true }));
  await launch("Notes"); await page.clock.runFor(2300); await launch("Clock");
  assert.equal(await clock.getByRole("timer", { name: "Time remaining", exact: true }).textContent(), "00:00", "Timer deadline continues in another app");
  assert.match(await device.locator(".mo-notice").textContent(), /Timer complete/);
  await activate(clock.getByRole("button", { name: "Dismiss timer", exact: true }));
  await clock.getByRole("listbox", { name: "Timer seconds", exact: true }).press("Home"); await clock.getByRole("listbox", { name: "Timer seconds", exact: true }).pressSequentially("20");
  await activate(clock.getByRole("button", { name: "Start timer", exact: true }));
  await activate(clock.getByRole("button", { name: "Pause timer", exact: true }));
  const paused = await clock.getByRole("timer", { name: "Time remaining", exact: true }).textContent();
  await page.clock.runFor(1200); assert.equal(await clock.getByRole("timer", { name: "Time remaining", exact: true }).textContent(), paused);
  await activate(clock.getByRole("button", { name: "Resume timer", exact: true })); await page.clock.runFor(1200);
  assert.notEqual(await clock.getByRole("timer", { name: "Time remaining", exact: true }).textContent(), paused);
  await activate(clock.getByRole("button", { name: "Cancel timer", exact: true }));
  await activate(clock.getByRole("button", { name: "Stopwatch", exact: true }));
  await activate(clock.getByRole("button", { name: "Start stopwatch", exact: true })); await page.clock.runFor(1200);
  await activate(clock.getByRole("button", { name: "Lap", exact: true }));
  await launch("Notes"); await page.clock.runFor(1200); await launch("Clock");
  await activate(clock.getByRole("button", { name: "Stop", exact: true }));
  assert.match(await clock.getByRole("timer", { name: "Stopwatch elapsed", exact: true }).textContent(), /00:0[2-9]/);
  assert.equal(await clock.getByRole("list", { name: "Recorded laps", exact: true }).locator("li").count(), 1);
  await activate(clock.getByRole("button", { name: "Reset", exact: true }));
  assert.equal(await clock.getByRole("timer", { name: "Stopwatch elapsed", exact: true }).textContent(), "00:00.00");
  await activate(clock.getByRole("button", { name: "Alarm", exact: true }));
  await assertMobileIconCentered(clock.getByRole("button", { name: "New alarm", exact: true }));
  await activate(clock.getByRole("button", { name: "New alarm", exact: true }));
  await clock.getByRole("textbox", { name: "Alarm label", exact: true }).fill("Proof reminder");
  await clock.getByRole("listbox", { name: "Alarm hours", exact: true }).press("Home"); await clock.getByRole("listbox", { name: "Alarm hours", exact: true }).pressSequentially("11");
  await clock.getByRole("listbox", { name: "Alarm minutes", exact: true }).press("Home"); await clock.getByRole("listbox", { name: "Alarm minutes", exact: true }).pressSequentially("45");
  await clock.getByRole("checkbox", { name: "Friday", exact: true }).check();
  const mounted = await clock.elementHandle();
  await activate(page.locator(".mo").getByRole("button", { name: "Open display", exact: true }));
  await device.locator(".mo-fold-stage").waitFor({ state: "detached" });
  await activate(page.locator(".mo").getByRole("button", { name: "Rotate device", exact: true }));
  assert.equal(await clock.getByRole("textbox", { name: "Alarm label", exact: true }).inputValue(), "Proof reminder");
  assert.equal(await clock.getByRole("listbox", { name: "Alarm hours", exact: true }).getByRole("option", { selected: true }).textContent(), "11");
  assert(await mounted.evaluate(element => element.isConnected), "Clock alarm draft stays mounted through folding and rotation");
  await activate(page.locator(".mo").getByRole("button", { name: "Rotate device", exact: true }));
  await activate(page.locator(".mo").getByRole("button", { name: "Fold display", exact: true }));
  await device.locator(".mo-fold-stage").waitFor({ state: "detached" });
  await activate(clock.getByRole("button", { name: "Save alarm", exact: true }));
  const alarm = clock.getByRole("switch", { name: "Proof reminder alarm enabled", exact: true });
  assert.equal(await alarm.isChecked(), true); await alarm.press("Space"); assert.equal(await alarm.isChecked(), false);
  await activate(clock.getByRole("button", { name: "Edit Proof reminder alarm", exact: true }));
  assert.equal(await clock.getByRole("listbox", { name: "Alarm hours", exact: true }).getByRole("option", { selected: true }).textContent(), "11");
  assert.equal(await clock.getByRole("checkbox", { name: "Friday", exact: true }).isChecked(), true);
  await activate(clock.getByRole("button", { name: "Delete alarm", exact: true }));
  assert.equal(await clock.getByRole("button", { name: "Edit Proof reminder alarm", exact: true }).count(), 0);
  await activate(clock.getByRole("button", { name: "World Clock", exact: true }));
  await activate(clock.getByRole("button", { name: "Add city", exact: true }));
  await clock.getByRole("searchbox", { name: "Search cities", exact: true }).fill("London");
  await activate(clock.getByRole("button", { name: "London", exact: true }));
  assert.match(await clock.locator(".mo-ios-clock-world article").filter({ hasText: "London" }).locator("time").textContent(), /^\d{2}:\d{2}$/);
  await activate(clock.getByRole("button", { name: "Remove London", exact: true }));
  await checkMobileAppAccessibility({ page, phone, app: "clock" });
  for (const action of ["Open display", "Rotate device", "Rotate device", "Fold display"]) {
    await activate(page.locator(".mo").getByRole("button", { name: action, exact: true }));
    await device.locator(".mo-fold-stage").waitFor({ state: "detached" });
    await page.waitForFunction(() => !document.querySelector(".mo-handset").getAnimations().some(animation => animation.playState === "running"));
    await assertIOSAppChrome(phone, "clock");
  }
}

/** Observe the browser's real View Transition animations, including queued
 * update races. This deliberately does not seek animation clocks or snapshots. */
export async function checkIOSNavigationMotion({ page, base }) {
  await page.goto(`${base}/interfaces/ios/`, { waitUntil: "networkidle" });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const device = page.locator("section.mo-device"), phone = device.locator(".mo-device-fit .mo-phone");
  await phone.getByRole("button", { name: "App Library", exact: true }).waitFor();
  await page.evaluate(() => {
    window.__iosMotionRecords = [];
    window.__iosNativeTransition = document.startViewTransition;
    document.startViewTransition = function (update) {
      const record = { kind: document.documentElement.dataset.iosMotion, origin: document.documentElement.style.getPropertyValue("--ios-launch-origin") };
      window.__iosMotionRecords.push(record);
      const transition = window.__iosNativeTransition.call(document, update);
      transition.ready.then(() => {
        record.ready = true;
        record.clip = getComputedStyle(document.documentElement, "::view-transition-group(mo-ios-app)").overflow;
        record.rootName = getComputedStyle(document.documentElement).viewTransitionName;
        record.animations = document.getAnimations().filter(animation => animation.effect?.pseudoElement?.includes("mo-ios-app")).map(animation => ({ name: animation.animationName, duration: animation.effect.getTiming().duration, frames: animation.effect.getKeyframes().map(frame => ({ transform: frame.transform, opacity: frame.opacity })) }));
      }, error => { record.error = error.message; });
      transition.finished.then(() => { record.done = true; }, () => { record.done = true; });
      return transition;
    };
  });
  const settle = async () => page.waitForFunction(() => !document.documentElement.dataset.iosMotion);
  const motion = async (button, kind, expectedAnimation) => {
    const count = await page.evaluate(() => window.__iosMotionRecords.length);
    await button.focus(); await button.press("Enter");
    await page.waitForFunction(count => window.__iosMotionRecords.length > count && (window.__iosMotionRecords.at(-1).ready || window.__iosMotionRecords.at(-1).error), count);
    const record = await page.evaluate(() => window.__iosMotionRecords.at(-1));
    assert.equal(record.kind, kind);
    assert.equal(record.error, undefined, `The live phone has a unique snapshot name: ${JSON.stringify(record)}`);
    assert.equal(record.clip, "hidden", "Translated app snapshots stay clipped inside their captured surface");
    assert.equal(record.rootName, "none", "System and site chrome remain live outside the captured app");
    assert(record.animations.some(animation => animation.name === expectedAnimation && animation.duration > 0 && animation.frames.some(frame => frame.transform && frame.transform !== "none")), `${kind} has a real spatial animation`);
    await settle();
    return record;
  };
  try {
    await phone.getByRole("button", { name: "App Library", exact: true }).press("Enter"); await settle();
    const opened = await motion(phone.getByRole("button", { name: "Open Contacts", exact: true }), "open", "mo-ios-app-open");
    await motion(phone.locator(".mo-contact-row").filter({ hasText: "Mara Vos" }).locator(".mo-list-row"), "push", "mo-ios-push-in");
    await motion(phone.locator(".mo-app-header").getByRole("button", { name: "Back", exact: true }), "back", "mo-ios-back-in");
    await motion(phone.getByRole("button", { name: "New contact", exact: true }), "sheet", "mo-ios-sheet-in");
    await phone.getByRole("textbox", { name: "Full name", exact: true }).fill("Motion proof");
    await phone.getByRole("textbox", { name: "Phone number", exact: true }).fill("+31 20 555 0110");
    await motion(phone.getByRole("button", { name: "Save contact", exact: true }), "dismiss", "mo-ios-sheet-out");
    assert.equal(await phone.locator(".mo-contact-row").filter({ hasText: "Motion proof" }).count(), 1);
    await motion(phone.getByRole("button", { name: "New contact", exact: true }), "sheet", "mo-ios-sheet-in");
    await motion(phone.locator(".mo-app-header").getByRole("button", { name: "Back", exact: true }), "dismiss", "mo-ios-sheet-out");
    const closed = await motion(phone.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }), "close", "mo-ios-app-close");
    assert.equal(closed.origin, opened.origin, "Home reverses toward the app's launch icon");
    await motion(phone.getByRole("button", { name: "Open Control Center", exact: true }), "overlay-open", "mo-ios-overlay-in");
    await motion(phone.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }), "overlay-close", "mo-ios-overlay-out");
    await phone.getByRole("button", { name: "App Library", exact: true }).press("Enter"); await settle();
    await page.evaluate(() => {
      const phone = document.querySelector(".mo-device-fit .mo-phone");
      [...phone.querySelectorAll("button")].find(button => button.getAttribute("aria-label") === "Open Notes").click();
      phone.querySelector(".mo-system-nav button").click();
    });
    await settle();
    await page.waitForFunction(() => window.__iosMotionRecords.every(record => record.done));
    assert.equal(await phone.getAttribute("data-app"), "home", "A queued app-open update must not overwrite a later Home action");
    assert.equal(await phone.getAttribute("data-overlay"), null);
    // Interrupt a visible launch with a real pointer on the live Home gesture.
    await phone.getByRole("button", { name: "App Library", exact: true }).press("Enter"); await settle();
    const before = await page.evaluate(() => window.__iosMotionRecords.length);
    await phone.getByRole("button", { name: "Open Notes", exact: true }).press("Enter");
    await page.waitForFunction(before => window.__iosMotionRecords.length > before && window.__iosMotionRecords.at(-1).ready, before);
    assert.equal(await page.evaluate(() => window.__iosMotionRecords.at(-1).done === true), false, "The launch is still visibly animating before interruption");
    const home = await phone.locator(".mo-system-nav button").boundingBox();
    await page.mouse.click(home.x + home.width / 2, home.y + home.height / 2);
    await page.waitForFunction(() => document.querySelector(".mo-device-fit .mo-phone").dataset.app === "home"); await settle();
    await page.getByRole("button", { name: "Inspect fold", exact: true }).press("Enter");
    await page.waitForFunction(() => document.querySelector(".mo-fold-stage")?.dataset.hingeAngle === "110.00");
    assert.deepEqual(await device.locator(".mo-fold-presentation .mo-screen").evaluateAll(elements => elements.map(element => getComputedStyle(element).viewTransitionName)), ["none", "none", "none"], "Physical fold copies never create duplicate animation snapshots");
    assert.equal(await phone.locator(".mo-screen").evaluate(element => getComputedStyle(element).viewTransitionName), "none", "The inert live app is excluded during physical inspection");
    await page.getByRole("button", { name: "Return to app", exact: true }).press("Enter");
    await device.locator(".mo-fold-stage").waitFor({ state: "detached" });
    assert.equal(await phone.locator(".mo-screen").evaluate(element => getComputedStyle(element).viewTransitionName), "mo-ios-app");
    const viewport = page.viewportSize();
    await page.setViewportSize({ width: 390, height: viewport.height });
    await page.getByRole("button", { name: "Use phone", exact: true }).press("Enter");
    await device.locator('.mo-device-fit[data-live="true"]').waitFor();
    assert.equal(await page.locator(".mo-screen").evaluateAll(elements => elements.filter(element => getComputedStyle(element).viewTransitionName === "mo-ios-app").length), 1, "Readable mode has exactly one live app snapshot");
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedCount = await page.evaluate(() => window.__iosMotionRecords.length);
    await phone.getByRole("button", { name: "App Library", exact: true }).press("Enter");
    await phone.getByRole("button", { name: "Open Contacts", exact: true }).press("Enter");
    await phone.getByRole("button", { name: "New contact", exact: true }).press("Enter");
    await phone.getByRole("textbox", { name: "Full name", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.__iosMotionRecords.length), reducedCount, "Reduced motion commits navigation without snapshot animations");
    assert.equal(await phone.locator(".mo-screen").evaluate(element => getComputedStyle(element).viewTransitionName), "none");
  } finally {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => { document.startViewTransition = window.__iosNativeTransition; delete window.__iosNativeTransition; delete window.__iosMotionRecords; });
  }
}

/** Native component geometry and keyboard journeys through the separate phone studies. */
export async function checkMobileOS({ page, base, fail }) {
  const activate = async target => { await target.focus(); await target.press("Enter"); await page.waitForTimeout(40); };
  const choose = async (target, index) => { await activate(target); await target.press("Home"); for (let i = 0; i < index; i++) await target.press("ArrowDown"); await target.press("Enter"); await page.waitForTimeout(40); };
  let stage = "initial home";
  try {
    await page.addInitScript(() => {
      const NativeAudioContext = window.AudioContext;
      window.__mobileOSAudio = [];
      window.AudioContext = class extends NativeAudioContext {
        constructor(...args) { super(...args); this.__oscillators = 0; window.__mobileOSAudio.push(this); }
        createOscillator() { this.__oscillators++; return super.createOscillator(); }
      };
    });
    const root = page.locator(".mo");
    let clockInstalled = false;
    for (const platform of ["ios", "android"]) {
      stage = `${platform} initial home`;
      await page.goto(`${base}/interfaces/${platform}/`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => Object.keys(document.querySelector(".mo-app-icon") ?? {}).some(key => key.startsWith("__reactProps")));
      await page.evaluate(async () => { await document.fonts.ready; });
      assert.equal(await root.locator("section.mo-device").count(), 1, "Each study renders exactly one platform");
      assert.equal(await page.getByRole("heading", { level: 1, name: platform === "ios" ? "iOS" : "Android", exact: true }).count(), 1);
      const device = root.locator(`section.mo-device[data-platform="${platform}"]`);
      if (page.viewportSize().width <= 640) {
        stage = `${platform} readable phone mode`;
        await device.locator('.mo-device-fit[data-live="true"]').waitFor();
        const readable = await device.evaluate(element => {
          const phone = element.querySelector(".mo-phone"), handset = element.querySelector(".mo-handset");
          const bounds = phone.getBoundingClientRect();
          const controls = [...phone.querySelectorAll("button,input:not([type=hidden]),textarea,select")].filter(target => target.getClientRects().length && getComputedStyle(target).visibility !== "hidden" && !target.closest('[aria-hidden="true"],.mo-sr-only'));
          return { scale: handset.getBoundingClientRect().width / handset.offsetWidth, font: parseFloat(getComputedStyle(phone).fontSize), overflow: phone.scrollWidth - phone.clientWidth, short: controls.filter(target => { const box = target.getBoundingClientRect(); return box.width < 43.5 || box.height < 43.5; }).map(target => target.getAttribute("aria-label") || target.textContent), edges: [bounds.left, bounds.right], width: innerWidth };
        });
        assert.equal(readable.scale, 1, "Phone mode keeps controls at their actual size");
        assert(readable.font >= 16, "Phone mode retains readable body typography");
        assert(readable.overflow <= 1 && readable.edges[0] >= 0 && readable.edges[1] <= readable.width, "Phone mode fits the viewport");
        assert.deepEqual(readable.short, [], "Phone mode preserves physical44px controls");
        await activate(device.getByRole("button", { name: platform === "ios" ? "App Library" : "All apps", exact: true }));
        await activate(device.locator(".mo-app-grid").getByRole("button", { name: "Open Notes", exact: true }));
        await activate(device.getByRole("button", { name: "New note", exact: true }));
        await device.getByRole("textbox", { name: "Note title", exact: true }).fill("Phone mode note");
        const draft = device.getByRole("textbox", { name: "Note text", exact: true });
        await draft.fill("Readable local work.");
        assert(await draft.evaluate(element => parseFloat(getComputedStyle(element).fontSize) >= 16), "Readable phone editor keeps16px text");
        const mounted = await device.locator(".mo-phone").elementHandle();
        await activate(root.getByRole("button", { name: "View device", exact: true }));
        await device.locator('.mo-device-fit[data-live="false"]').waitFor();
        assert.equal(await draft.inputValue(), "Readable local work.");
        await activate(root.getByRole("button", { name: "Use phone", exact: true }));
        await device.locator('.mo-device-fit[data-live="true"]').waitFor();
        assert.equal(await draft.inputValue(), "Readable local work.");
        assert(await mounted.evaluate(element => element.isConnected), "Readable and hardware views preserve the mounted editor");
        await activate(device.getByRole("button", { name: "Save note", exact: true }));
        await activate(device.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }));
        if (platform === "ios" && page.context().browser()?.browserType().name() === "chromium") {
          stage = "iOS native touch gestures in readable phone mode";
          await checkIOSHomeTouch(page);
        }
        await activate(root.getByRole("button", { name: "View device", exact: true }));
        await device.locator('.mo-device-fit[data-live="false"]').waitFor();
      }
      if (platform === "ios" && page.viewportSize().width > 640 && page.context().browser()?.browserType().name() === "chromium") {
        stage = "iOS native touch gestures";
        await checkIOSHomeTouch(page);
      }
      if (!clockInstalled) { await page.clock.install(); clockInstalled = true; }
      await device.scrollIntoViewIfNeeded();
      const profiles = deviceProfiles.filter(item => item.platform === platform);
      const deviceSelect = root.getByRole("combobox", { name: "Device", exact: true });
      assert.equal(await deviceSelect.inputValue(), profiles[0].id, `${platform} starts with its current reference device`);
      assert.deepEqual(await deviceSelect.locator("option").evaluateAll(options => options.map(option => option.value)), profiles.map(item => item.id), "Device choices belong to the selected platform");
      const phone = device.locator(".mo-device-fit .mo-phone");
      const reference = { icon: platform === "ios" ? 60 : 56 };
      const presentation = await device.evaluate(element => {
        const phone = element.querySelector(".mo-phone");
        const icon = element.querySelector(".mo-app-icon > [data-app-icon]");
        const hardware = getComputedStyle(element.querySelector(".mo-handset"));
        const transform = new DOMMatrixReadOnly(hardware.transform);
        return { font: getComputedStyle(phone).fontFamily, controlFont: getComputedStyle(phone.querySelector("button")).fontFamily, icon: [icon.offsetWidth, icon.offsetHeight], rotated: [transform.b, transform.c], perspective: hardware.perspective };
      });
      assert.match(presentation.font, /^"?Inter"?(?:,|$)/, `${platform} applies Vlak typography to native component structure`);
      assert.equal(presentation.controlFont, presentation.font, `${platform} controls inherit the platform typeface`);
      assert.deepEqual(presentation.icon, [reference.icon, reference.icon], `${platform} launcher icon logical size`);
      assert.deepEqual(presentation.rotated, [0, 0], "The handset remains a flat front view");
      assert.equal(presentation.perspective, "none");

      const home = async () => { const control = device.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }); await activate(control); if (await phone.getAttribute("data-app") !== "home") await activate(control); assert.equal(await phone.evaluate(element => element.scrollTop), 0, "Focusing Home must not scroll fixed system chrome"); };
      const library = async () => activate(device.getByRole("button", { name: platform === "ios" ? "App Library" : "All apps", exact: true }));
      const closeSystem = async () => activate(device.getByRole("button", { name: platform === "ios" ? "Home" : "System back", exact: true }));
      const launch = async name => { stage = `${platform} ${name}`; await home(); await library(); await activate(device.locator(".mo-app-grid").getByRole("button", { name: `Open ${platform === "ios" && name === "Browser" ? "Safari" : name}`, exact: true })); };
      const back = async () => activate(device.locator(".mo-app-header").getByRole("button", { name: "Back", exact: true }));
      const saveEditor = async name => {
        const button = device.getByRole("button", { name, exact: true });
        if (platform === "ios") assert(await button.evaluate(element => !!element.closest(".mo-app-header .mo-ios-editor-actions")), `${name} belongs in the iOS editor navigation bar`);
        await activate(button);
      };
      const fit = async () => {
        const selectedId = await device.getAttribute("data-device");
        const selected = profiles.find(item => item.id === selectedId);
        const expanded = await device.getAttribute("data-posture") === "expanded";
        const rotated = await device.getAttribute("data-orientation") === "landscape";
        const display = expanded && selected.expanded ? selected.expanded : selected.display;
        const expectedPhone = rotated ? [display.height, display.width] : [display.width, display.height];
        const expectedHandset = expectedPhone.map(size => size + display.bezel * 2);
        await page.waitForFunction(({ width, height }) => {
          const handset = document.querySelector(".mo-handset");
          const fitted = document.querySelector(".mo-device-fit"), phone = fitted.querySelector(".mo-phone");
          const drawn = handset.getBoundingClientRect(), frame = fitted.getBoundingClientRect();
          // Rounded offset sizes can already equal the target while the last
          // subpixel of a CSS transition is still changing the apparent scale.
          const moving = [handset, fitted, phone].some(element => element.getAnimations().some(animation => animation.pending || animation.playState === "running"));
          const style = getComputedStyle(handset);
          return !moving && Math.abs(Number.parseFloat(style.width) - width) < .01 && Math.abs(Number.parseFloat(style.height) - height) < .01 && Math.abs(drawn.width - frame.width) < .1 && Math.abs(drawn.height - frame.height) < .1;
        }, { width: expectedHandset[0], height: expectedHandset[1] });
        const result = await device.evaluate(element => {
          const phone = element.querySelector(".mo-phone"); const bounds = phone.getBoundingClientRect();
          const handset = element.querySelector(".mo-handset"); const drawn = handset.getBoundingClientRect();
          const fit = element.querySelector(".mo-device-fit").getBoundingClientRect();
          const scaleX = drawn.width / handset.offsetWidth; const scaleY = drawn.height / handset.offsetHeight;
          const visible = target => target.getClientRects().length && getComputedStyle(target).visibility !== "hidden" && !target.closest('[aria-hidden="true"],.mo-sr-only');
          const controls = [...phone.querySelectorAll("button,input:not([type=hidden]),textarea,select")].filter(visible);
          const hit = target => (target.matches('input[type="checkbox"],input[type="radio"]') ? target.closest("label") : null) ?? target;
          const logicalHit = target => { const rect = hit(target).getBoundingClientRect(); return { width: rect.width / scaleX, height: rect.height / scaleY }; };
          return {
            phone: [phone.offsetWidth, phone.offsetHeight], handset: [handset.offsetWidth, handset.offsetHeight],
            scale: [scaleX, scaleY], frameDifference: [drawn.width - fit.width, drawn.height - fit.height],
            displayScale: [bounds.width / phone.offsetWidth, bounds.height / phone.offsetHeight],
            pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            overflow: phone.scrollWidth - phone.clientWidth,
            scrollOverflow: phone.querySelector(".mo-scroll").scrollWidth - phone.querySelector(".mo-scroll").clientWidth,
            // These are logical pt/dp. A scaled illustration can be smaller on the page.
            short: controls.filter(target => { const rect = logicalHit(target); const minimum = element.dataset.platform === "android" && target.matches('.mo-native-range,input[role="switch"]') ? 48 : 44; return rect.width < minimum - .5 || rect.height < minimum - .5; }).map(target => ({ name: target.getAttribute("aria-label") || target.textContent, ...logicalHit(target) })),
            escaped: [...phone.querySelectorAll(".mo-status-bar,.mo-app-header,.mo-app-actions,.mo-dock,.mo-system-nav,.mo-clock-tabs")].filter(visible).filter(target => { const rect = target.getBoundingClientRect(); return rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1 || rect.left < bounds.left - 1 || rect.right > bounds.right + 1; }).map(target => target.className),
          };
        });
        assert.deepEqual(result.phone, expectedPhone, `${platform} selected study display geometry`);
        assert.deepEqual(result.handset, expectedHandset, `${platform} selected hardware proportions`);
        assert(result.scale[0] > 0 && result.scale[0] <= 1.001 && Math.abs(result.scale[0] - result.scale[1]) < .001, `${platform} scales uniformly`);
        assert(result.frameDifference.every(value => Math.abs(value) <= 1), `${platform} frame reserves the full scaled handset`);
        assert(result.displayScale.every(value => Math.abs(value - result.scale[0]) < .001), `${platform} display and hardware share one scale`);
        assert(result.pageOverflow <= 1 && result.overflow <= 1 && result.scrollOverflow <= 1, `${platform} overflow: ${JSON.stringify(result)}`);
        assert.deepEqual(result.short, [], `${platform} controls below their logical native hit area`);
        assert.deepEqual(result.escaped, [], `${platform} pinned regions escaped`);
      };
      stage = `${platform} hardware Home layout`;
      await fit();
      if (platform === "ios") {
        const search = phone.getByRole("button", { name: "Search", exact: true });
        assert.equal(await search.count(), 1, "Home exposes exactly one Search control in each native layout");
        await activate(search);
      } else await library();
      await device.getByRole("searchbox", { name: "Search apps", exact: true }).fill("notes"); await page.waitForTimeout(40);
      assert.equal(await device.locator(".mo-app-grid button").count(), 1);
      await device.getByRole("searchbox", { name: "Search apps", exact: true }).fill(""); await page.waitForTimeout(40);
      assert.equal(await device.locator(".mo-app-grid button").count(), 16);
      await launch("Contacts");
      assert.equal(await device.locator(".mo-app-header").getByRole("button", { name: "Back", exact: true }).count(), 0, "Root app navigation has no fabricated Back to Home control");
      if (platform === "ios") {
        await assertMobileIconCentered(device.getByRole("button", { name: "New contact", exact: true }));
        for (const action of ["Open display", "Rotate device", "Rotate device", "Fold display"]) {
          await activate(root.getByRole("button", { name: action, exact: true }));
          await device.locator(".mo-fold-stage").waitFor({ state: "detached" });
          await assertMobileIconCentered(device.getByRole("button", { name: "New contact", exact: true }));
        }
        if (page.viewportSize().width <= 640) {
          await activate(root.getByRole("button", { name: "Use phone", exact: true }));
          await assertMobileIconCentered(device.getByRole("button", { name: "New contact", exact: true }));
          await activate(root.getByRole("button", { name: "View device", exact: true }));
        }
      }
      await activate(device.getByRole("button", { name: "New contact", exact: true }));
      await device.getByRole("textbox", { name: "Full name", exact: true }).fill("Avery Test"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Phone number", exact: true }).fill("+31 20 555 0103"); await page.waitForTimeout(40);
      await saveEditor("Save contact");
      assert.match(await device.locator(".mo-scroll").textContent(), /Avery Test/);
      await activate(device.locator(".mo-contact-row").filter({ hasText: "Avery Test" }).locator(".mo-list-row"));
      if (platform === "ios") {
        await activate(device.getByRole("button", { name: "Edit", exact: true }));
        assert.equal(await phone.getAttribute("data-screen"), "edit-contact", "Keyboard Edit opens the contact editor without submitting it");
        assert.equal(await device.getByRole("textbox", { name: "Full name", exact: true }).inputValue(), "Avery Test");
        assert.equal(await device.getByRole("textbox", { name: "Phone number", exact: true }).inputValue(), "+31 20 555 0103");
        await device.getByRole("textbox", { name: "Phone number", exact: true }).fill("+31 20 555 0104");
        await saveEditor("Save contact");
        assert.match(await device.locator(".mo-contact-card").textContent(), /\+31 20 555 0104/);
        await activate(device.getByRole("button", { name: "Call Avery Test", exact: true }));
      }
      assert.equal(await device.getByText("Simulated call", { exact: true }).isVisible(), true);
      await activate(device.getByRole("button", { name: "End call", exact: true }));
      await launch("Phone");
      await activate(device.getByRole("button", { name: "Keypad", exact: true }));
      if (platform === "ios") {
        assert.equal(await phone.getAttribute("data-root-app"), "true", "Phone tabs are peer destinations");
        assert.equal(await device.locator(".mo-app-header").getByRole("button", { name: "Back", exact: true }).count(), 0);
        assert.equal(await device.locator(".mo-app-header h2").textContent(), "Keypad");
      }
      for (const digit of ["1", "2", "3"]) await activate(device.locator(".mo-keypad").getByRole("button", { name: digit, exact: true }));
      assert.equal(await device.getByRole("textbox", { name: "Dial number", exact: true }).inputValue(), "123");
      await launch("Messages");
      await activate(device.locator(".mo-list-row").filter({ hasText: "Mara Vos" }));
      await back();
      await activate(device.getByRole("button", { name: "New message", exact: true }));
      assert.equal(await phone.getAttribute("data-screen"), "recipients");
      assert.equal(await device.locator(".mo-app-header h2").textContent(), "New message");
      assert.equal(await device.getByRole("textbox", { name: "Message", exact: true }).count(), 0, "Choose a recipient before showing the message composer");
      await device.getByRole("searchbox", { name: "Search recipients", exact: true }).fill(platform === "ios" ? "0104" : "0103"); await page.waitForTimeout(40);
      assert.equal(await device.locator(".mo-list-row").count(), 1, "Recipient search matches the newly created contact’s phone number");
      await activate(device.locator(".mo-list-row").filter({ hasText: "Avery Test" }));
      assert.equal(await phone.getAttribute("data-screen"), "thread");
      assert.equal(await device.locator(".mo-app-header h2").textContent(), "Avery Test");
      assert.equal(await device.getByRole("combobox", { name: "Conversation", exact: true }).count(), 0, "The recipient belongs in the conversation header");
      await device.getByRole("textbox", { name: "Message", exact: true }).fill("A local message from the test phone."); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Send local message", exact: true }));
      assert.match(await device.locator(".mo-message-mine").textContent(), /A local message from the test phone\./);
      await fit();
      await launch("Mail");
      await activate(device.getByRole("button", { name: "Compose", exact: true }));
      await device.getByRole("textbox", { name: "To", exact: true }).fill("avery@example.invalid"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Subject", exact: true }).fill("Local studio mail"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Message body", exact: true }).fill("This message is saved locally."); await page.waitForTimeout(40);
      await saveEditor("Save to local Sent");
      assert.match(await device.locator(".mo-list-row").textContent(), /Local studio mail/);
      await launch("Calendar");
      if (platform === "ios") await checkIOSCalendar({ page, device, activate });
      else {
      await activate(device.getByRole("button", { name: "New event", exact: true }));
      await device.getByRole("textbox", { name: "Event title", exact: true }).fill("Local proof review"); await page.waitForTimeout(40);
      await device.getByLabel("Event time", { exact: true }).fill("16:15"); await page.waitForTimeout(40);
      await saveEditor("Save event");
      assert.match(await device.locator(".mo-event").last().textContent(), /16:15Local proof review/);
      }
      await launch("Notes");
      await activate(device.getByRole("button", { name: "New note", exact: true }));
      await device.getByRole("textbox", { name: "Note title", exact: true }).fill("Local test note"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Note text", exact: true }).fill("A first thought."); await page.waitForTimeout(40);
      await fit();
      await saveEditor("Save note");
      await activate(device.locator(".mo-list-row").filter({ hasText: "Local test note" }));
      await device.getByRole("textbox", { name: "Note text", exact: true }).fill("A revised thought."); await page.waitForTimeout(40);
      await saveEditor("Save note");
      assert.match(await device.locator(".mo-list-row").filter({ hasText: "Local test note" }).textContent(), /A revised thought\./);
      await launch("Files");
      await activate(device.getByRole("button", { name: "New text file", exact: true }));
      await device.getByRole("textbox", { name: "File name", exact: true }).fill("local-test.txt"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "File contents", exact: true }).fill("A downloadable local file."); await page.waitForTimeout(40);
      await saveEditor("Save file");
      await activate(device.locator(".mo-list-row").filter({ hasText: "local-test.txt" }));
      const downloadPromise = page.waitForEvent("download");
      await activate(device.getByRole("button", { name: "Download", exact: true }));
      const download = await downloadPromise; assert.equal(download.suggestedFilename(), "local-test.txt"); assert.equal(await download.failure(), null);
      await launch("Camera");
      await checkMobileAppAccessibility({ page, phone, app: "camera" });
      await activate(device.getByRole("button", { name: platform === "ios" ? "Capture sample photo" : "Capture", exact: true }));
      assert.match(await device.locator(".mo-notice").textContent(), /Sample capture saved to Photos/);
      await activate(device.getByRole("button", { name: platform === "ios" ? "Open Photos" : "Library", exact: true }));
      assert.equal(await device.locator(".mo-photo-grid button").count(), 4);
      await activate(device.getByRole("button", { name: "Open Studio capture 1", exact: true }));
      await activate(device.getByRole("button", { name: "Favorite", exact: true }));
      assert.equal(await device.getByRole("button", { name: "Favorite", exact: true }).getAttribute("aria-pressed"), "true");
      await launch("Calculator");
      for (const value of ["1", "+", "2", "×", "3", "Equals"]) await activate(device.locator(".mo-calculator").getByRole("button", { name: value, exact: true }));
      assert.equal(await device.locator(".mo-calculator-display").textContent(), "7");
      for (const value of ["Clear", "0", "−", "5", "Equals", "+", "2", "Equals"]) await activate(device.locator(".mo-calculator").getByRole("button", { name: value, exact: true }));
      assert.equal(await device.locator(".mo-calculator-display").textContent(), "-3");
      await launch("Weather");
      await activate(device.getByRole("button", { name: platform === "ios" ? "Use Fahrenheit" : "Fahrenheit", exact: true }));
      assert.equal(await device.locator(".mo-weather strong").textContent(), "64°");
      await launch("Maps");
      await checkMobileAppAccessibility({ page, phone, app: "maps" });
      if (platform === "ios") await device.getByRole("combobox", { name: "Destination", exact: true }).selectOption("park");
      else await choose(device.getByRole("combobox", { name: "Destination", exact: true }), 1);
      await activate(device.getByRole("button", { name: "Start local route", exact: true }));
      await activate(device.getByRole("button", { name: "Next step", exact: true }));
      assert.match(await device.locator(platform === "ios" ? ".mo-ios-map-instruction" : ".mo-route-step").textContent(), /Follow the canal path/);
      await launch("Clock");
      if (platform === "ios") await checkIOSClock({ page, device, activate, launch });
      else {
      await device.getByRole("spinbutton", { name: "Timer seconds", exact: true }).fill("2"); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Start timer", exact: true }));
      await page.clock.runFor(2300);
      assert.equal(await device.getByRole("timer", { name: "Time remaining", exact: true }).textContent(), "00:00");
      assert.match(await device.locator(".mo-notice").textContent(), /Timer complete/);
      await activate(device.getByRole("button", { name: "Stopwatch", exact: true }));
      await activate(device.getByRole("button", { name: "Start stopwatch", exact: true }));
      await page.clock.runFor(1200);
      await activate(device.getByRole("button", { name: "Stop", exact: true }));
      assert.match(await device.getByRole("timer", { name: "Stopwatch elapsed", exact: true }).textContent(), /00:01/);
      await activate(device.getByRole("button", { name: "Alarm", exact: true }));
      const alarm = device.getByRole("switch", { name: "Alarm enabled", exact: true }); await alarm.focus(); await alarm.press("Space"); assert.equal(await alarm.isChecked(), true);
      }
      await launch("Music");
      await activate(device.getByRole("button", { name: "Play music", exact: true }));
      await page.clock.runFor(500);
      assert.equal(await device.getByRole("img", { name: "Music is playing", exact: true }).count(), 1);
      assert.equal(await page.evaluate(() => window.__mobileOSAudio.some(context => context.state === "running" && context.__oscillators > 0)), true, "no actual audio oscillator was started");
      await page.evaluate(async () => { await window.__mobileOSAudio.at(-1).suspend(); });
      await device.getByRole("button", { name: "Play music", exact: true }).waitFor();
      assert.equal(await device.getByRole("img", { name: "Music is paused", exact: true }).count(), 1, "Suspended audio must not claim it is playing");
      await activate(device.getByRole("button", { name: platform === "ios" ? "Open Control Center" : "Open Quick Settings", exact: true }));
      assert.equal(await device.getByRole("button", { name: "Play music", exact: true }).count(), 1, "System media controls reflect suspended audio");
      await closeSystem();
      await page.evaluate(() => { const context = window.__mobileOSAudio.at(-1); context.__resume = context.resume.bind(context); context.resume = async () => {}; });
      await activate(device.getByRole("button", { name: "Play music", exact: true }));
      assert.equal(await device.getByRole("button", { name: "Play music", exact: true }).count(), 1, "A resolved resume that leaves audio suspended must remain resumable");
      assert.match(await device.locator(".mo-notice").textContent(), /still suspended/);
      await page.evaluate(() => { const context = window.__mobileOSAudio.at(-1); context.resume = context.__resume; delete context.__resume; });
      await activate(device.getByRole("button", { name: "Play music", exact: true }));
      assert.equal(await page.evaluate(() => window.__mobileOSAudio.at(-1).state), "running");
      await activate(device.getByRole("button", { name: "Next track", exact: true }));
      assert.equal(await device.locator(".mo-track h3").textContent(), "Quiet current");
      await activate(device.getByRole("button", { name: "Pause music", exact: true }));
      await launch("Browser");
      await activate(device.locator(".mo-list-row").filter({ hasText: "A slower morning" }));
      assert.equal(await device.locator(".mo-browser-page h3").textContent(), "A slower morning");
      await device.getByRole("textbox", { name: "Page address", exact: true }).fill("outside.example"); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Open local page", exact: true }));
      assert.equal(await device.locator(".mo-browser-page h3").textContent(), "A slower morning", "an unknown address changed the local page");
      await launch("Settings");
      if (platform === "ios") {
        await activate(device.getByRole("button", { name: "Display & Brightness", exact: true }));
        const dark = device.getByRole("radio", { name: "Dark", exact: true });
        await dark.focus(); await dark.press("Space");
        assert.equal(await dark.isChecked(), true);
        assert.equal(await device.getByRole("switch", { name: "Automatic appearance", exact: true }).isChecked(), false);
      } else {
        assert.equal(await device.locator(".mo-android-setting-row").count(), 6, "Android Settings lists native categories");
        await activate(device.getByRole("button", { name: /^Display\s/ }));
        assert.equal(await device.locator(".mo-app-header h2").textContent(), "Display");
        const dark = device.getByRole("switch", { name: "Dark theme", exact: true });
        await dark.focus(); await dark.press("Space");
        assert.equal(await dark.isChecked(), true);
      }
      assert.equal(await phone.getAttribute("data-theme"), "dark");
      const textSize = device.getByRole("slider", { name: "Text size", exact: true }); await textSize.focus(); await textSize.press("End"); assert.equal(await textSize.inputValue(), "125");
      await fit();
      await back();
      if (platform === "ios") await activate(device.getByRole("button", { name: /Wi-Fi Studio network/ }));
      else {
        await activate(device.getByRole("button", { name: /^Network & internet\s/ }));
        assert.equal(await device.locator(".mo-app-header h2").textContent(), "Network & internet");
      }
      const wifi = device.getByRole("switch", { name: platform === "ios" ? "Wi-Fi" : "Use Wi-Fi", exact: true });
      await wifi.focus(); await wifi.press("Space"); assert.equal(await wifi.isChecked(), false);
      await fit();
      await activate(device.getByRole("button", { name: platform === "ios" ? "Open Control Center" : "Open Quick Settings", exact: true }));
      assert.equal(await device.locator(".mo-quick-grid").getByRole("button", { name: /Wi-Fi/ }).getAttribute("aria-pressed"), "false");
      await activate(device.locator(".mo-quick-grid").getByRole("button", { name: /Wi-Fi/ }));
      if (platform === "ios") {
        const brightness = device.getByRole("slider", { name: "Display brightness", exact: true });
        assert.equal(await brightness.getAttribute("type"), "range");
        assert.equal(await brightness.getAttribute("aria-orientation"), "vertical");
        const geometry = await brightness.evaluate(element => { const input = element.getBoundingClientRect(); const tile = element.closest(".mo-vertical-slider").getBoundingClientRect(); return { width: input.width / tile.width, height: input.height / tile.height, transform: getComputedStyle(element).transform, writingMode: getComputedStyle(element).writingMode }; });
        assert(Math.abs(geometry.width - 1) < .01 && Math.abs(geometry.height - 1) < .01, "Native vertical slider covers its visible tile");
        assert.equal(geometry.transform, "none");
        assert.equal(geometry.writingMode, "vertical-lr");
        await brightness.focus(); await brightness.press("Home"); assert.equal(await brightness.inputValue(), "30");
        await brightness.press("ArrowUp"); assert.equal(await brightness.inputValue(), "31");
        await brightness.press("End"); assert.equal(await brightness.inputValue(), "100");
      }
      await fit();
      await closeSystem();
      assert.equal(await wifi.isChecked(), true);
      await back();
      stage = `${platform} device changes preserve local work`;
      await launch("Notes");
      await activate(device.locator(".mo-list-row").filter({ hasText: "Local test note" }));
      const draft = device.getByRole("textbox", { name: "Note text", exact: true });
      await draft.fill("Unsaved work across devices, folding and rotation.");
      const mountedPhone = await phone.elementHandle();
      const retained = async () => {
        assert(await mountedPhone.evaluate(element => element.isConnected), "Device changes keep the same app mounted");
        assert.equal(await phone.getAttribute("data-app"), "notes");
        assert.equal(await draft.inputValue(), "Unsaved work across devices, folding and rotation.", "Unsaved draft survives hardware changes");
        assert.equal(await phone.getAttribute("data-theme"), "dark", "Local appearance survives hardware changes");
        assert.equal(await phone.evaluate(element => element.style.getPropertyValue("--mo-text-scale")), "1.25", "Local text preference survives hardware changes");
        await fit();
      };
      for (const profile of profiles) {
        stage = `${platform} ${profile.name} retains work`;
        await deviceSelect.selectOption(profile.id);
        await page.waitForFunction(id => document.querySelector("section.mo-device").dataset.device === id, profile.id);
        await retained();
        if (profile.expanded) {
          const inspectMotion = page.viewportSize().width === 1440;
          const assertFoldMotion = async opening => {
            if (!inspectMotion) return;
            await assertMobileFoldAnimation({ page, device, opening });
            assert(await mountedPhone.evaluate(element => element.isConnected), "Fold cleanup retains the live application");
          };
          if (inspectMotion) await page.emulateMedia({ reducedMotion: "no-preference" });
          try {
            await activate(root.getByRole("button", { name: "Open display", exact: true }));
            await assertFoldMotion(true);
            assert.equal(await device.getAttribute("data-posture"), "expanded");
            await retained();
            await activate(root.getByRole("button", { name: "Fold display", exact: true }));
            await assertFoldMotion(false);
            assert.equal(await device.getAttribute("data-posture"), "compact");
            await retained();
            if (inspectMotion) {
              await activate(root.getByRole("button", { name: "Open display", exact: true }));
              await assertMobileFoldReversal({ page, device });
              assert.equal(await device.getAttribute("data-posture"), "compact");
              await retained();
              await activate(root.getByRole("button", { name: "Rotate device", exact: true }));
              for (const opening of [true, false]) {
                await activate(root.getByRole("button", { name: opening ? "Open display" : "Fold display", exact: true }));
                await assertFoldMotion(opening);
                await retained();
              }
              await activate(root.getByRole("button", { name: "Rotate device", exact: true }));
              await retained();
              await assertMobileFoldInspection({ page, device });
              await retained();
            }
          } finally { if (inspectMotion) await page.emulateMedia({ reducedMotion: "reduce" }); }
          if (!inspectMotion) {
            await assertMobileFoldInspection({ page, device });
            await retained();
            await activate(root.getByRole("button", { name: "Fold display", exact: true }));
            await retained();
          }
          // The reduced-motion path changes posture directly, with no blurred clone.
          if (inspectMotion) {
            for (const [label, posture] of [["Fold display", "compact"], ["Open display", "expanded"], ["Fold display", "compact"]]) {
              await activate(root.getByRole("button", { name: label, exact: true }));
              assert.equal(await device.getAttribute("data-posture"), posture);
              assert.equal(await device.locator(".mo-fold-stage,.mo-folding").count(), 0, "Reduced motion bypasses transient optical surfaces");
              assert.equal(await phone.evaluate(element => getComputedStyle(element).filter), "none", "Reduced motion keeps the live app sharp");
              await retained();
            }
          }
        }
        const rotate = root.getByRole("button", { name: "Rotate device", exact: true });
        await activate(rotate);
        assert.equal(await device.getAttribute("data-orientation"), "landscape");
        await retained();
        await activate(rotate);
        assert.equal(await device.getAttribute("data-orientation"), "portrait");
        await retained();
      }
      await deviceSelect.selectOption(profiles[0].id);
      await page.waitForFunction(id => document.querySelector("section.mo-device").dataset.device === id, profiles[0].id);
      await retained();
      await page.getByRole("button", { name: "Preview fullscreen", exact: true }).click();
      await page.locator('.if-preview-frame[data-preview-open="true"]').waitFor();
      await retained();
      await page.locator(".if-preview-bar").getByRole("button", { name: "Exit fullscreen preview", exact: true }).click();
      await page.locator('.if-preview-frame[data-preview-open="false"]').waitFor();
      await retained();
      await saveEditor("Save note");
      await launch("Settings");
      if (platform === "ios") await activate(device.getByRole("button", { name: "Restore default settings", exact: true }));
      else {
        await activate(device.getByRole("button", { name: /^Display\s/ }));
        await choose(device.getByRole("combobox", { name: "Appearance", exact: true }), 0);
        const size = device.getByRole("slider", { name: "Text size", exact: true }); await size.focus(); await size.press("Home");
        assert.equal(await size.inputValue(), "100");
        await back();
      }
      assert.equal(await phone.getAttribute("data-theme"), null, "Automatic appearance follows the enclosing website");
      await activate(device.getByRole("button", { name: "09:41, open notifications", exact: true }));
      assert.match(await device.locator(".mo-notification").first().textContent(), /Timer complete/);
      await activate(device.getByRole("button", { name: "Clear notifications", exact: true }));
      assert.equal(await device.getByText("You’re all caught up", { exact: true }).isVisible(), true);
      const notificationHeading = device.getByRole("heading", { name: platform === "ios" ? "Notification Center" : "Notifications", exact: true }).first();
      await notificationHeading.focus(); await notificationHeading.press("Escape"); await page.waitForTimeout(40);
      assert.equal(await phone.getAttribute("data-overlay"), null, "Escape closes the system overlay");
      assert.equal(await device.getByRole("button", { name: "09:41, open notifications", exact: true }).evaluate(element => document.activeElement === element), true, "System overlay dismissal restores trigger focus");
      const gesture = device.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }); await gesture.focus(); await gesture.press("ArrowUp"); await page.waitForTimeout(40);
      assert.equal(await device.locator(".mo-recent-task").count(), 6);
      await home(); await fit();
    }
    for (const platform of ["ios", "android"]) {
      stage = `${platform} standalone preview cascade`;
      await page.goto(`${base}/i/${platform}/`, { waitUntil: "networkidle" });
      await page.locator('.if-preview-frame[data-preview-open="true"]').waitFor();
      const standalone = await page.locator(".mo").evaluate(element => {
        const device = element.querySelector("section.mo-device"), phone = device.querySelector(".mo-phone");
        return {
          devices: element.querySelectorAll("section.mo-device").length,
          platform: device.dataset.platform,
          live: device.querySelector(".mo-device-fit").dataset.live,
          availableWidth: device.querySelector(".mo-device-viewport").clientWidth,
          phoneDimensions: [phone.offsetWidth, phone.offsetHeight],
          font: getComputedStyle(phone).fontFamily,
          wallpaper: getComputedStyle(device.querySelector(".mo-home")).backgroundImage,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      const profile = deviceProfiles.find(item => item.platform === platform);
      assert.equal(standalone.devices, 1);
      assert.equal(standalone.platform, platform);
      if (page.viewportSize().width <= 640) {
        assert.equal(standalone.live, "true", "Direct mobile preview starts in readable phone mode");
        assert.deepEqual(standalone.phoneDimensions, [standalone.availableWidth, 680]);
      } else assert.deepEqual(standalone.phoneDimensions, [profile.display.width, profile.display.height]);
      assert.match(standalone.font, /^"?Inter"?(?:,|$)/, "Standalone CSS order preserves the Vlak type layer");
      assert.equal(standalone.wallpaper, "none", "Standalone route does not restore the legacy gradient");
      assert(standalone.overflow <= 1, "Standalone preview fits the viewport");
    }
    if (page.viewportSize().width === 1440) {
      stage = "iOS native navigation motion";
      await checkIOSNavigationMotion({ page, base });
    }
    stage = "legacy platform chooser";
    for (const route of ["interfaces/mobile-os", "i/mobile-os"]) {
      await page.goto(`${base}/${route}/`, { waitUntil: "networkidle" });
      assert.equal(await page.locator("section.mo-device").count(), 0, "Legacy chooser does not mount two phone apps");
      for (const platform of ["ios", "android"]) {
        assert.equal(await page.locator(`.if-tile[href="/interfaces/${platform}/"]`).count(), 1, `Legacy link offers ${platform}`);
      }
    }
  } catch (error) { fail(`Mobile OS (${stage}): ${error instanceof Error ? error.message : String(error)}`); }
}

/** Real touch dispatch catches native panning that synthetic pointer events cannot. */
export async function checkIOSHomeTouch(page) {
  const ios = page.locator('section.mo-device[data-platform="ios"]');
  const stage = page.locator('.mo-stage');
  await ios.scrollIntoViewIfNeeded();
  const session = await page.context().newCDPSession(page);
  const hadTouch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const swipe = async (from, to) => {
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...from, radiusX: 1, radiusY: 1, force: 1 }] });
    for (let step = 1; step <= 10; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x + (to.x - from.x) * step / 10, y: from.y + (to.y - from.y) * step / 10, radiusX: 1, radiusY: 1, force: 1 }] });
      await page.waitForTimeout(20);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(350);
  };
  const blankPoint = (fromBottom = false) => ios.locator(".mo-home").evaluate((element, fromBottom) => {
    const rect = element.getBoundingClientRect();
    const top = Math.max(rect.top + 40, 30), bottom = Math.min(rect.bottom - 20, innerHeight - 30);
    for (let y = fromBottom ? bottom : top; fromBottom ? y > top : y < bottom; y += fromBottom ? -6 : 6) {
      const x = rect.right - 16;
      // Chromium expands nearby touch targets. A single blank pixel beside a
      // widget can still dispatch pointerdown on that button, so require a
      // genuinely clear touch-sized patch within the Home gesture surface.
      const clear = [-10, 0, 10].every(dx => [-10, 0, 10].every(dy => {
        const target = document.elementFromPoint(x + dx, y + dy);
        return target && element.contains(target) && !target.closest("button,input");
      }));
      if (clear) return { x, y };
    }
    throw new Error("No reachable home-screen gesture surface");
  }, fromBottom);
  try {
    const home = ios.locator(".mo-home");
    const availableScroll = await home.evaluate(element => element.scrollHeight - element.clientHeight);
    if (availableScroll > 1) {
      const start = await blankPoint(true);
      await swipe(start, { x: start.x, y: Math.max(30, start.y - 160) });
      assert(await home.evaluate(element => element.scrollTop > 0), "Shorter phone displays retain native vertical Home scrolling");
      await home.evaluate(element => element.scrollTo({ top: 0, behavior: "instant" }));
    }
    const start = await blankPoint();
    const originalPosition = await stage.evaluate(element => element.scrollLeft);
    await swipe(start, { x: start.x - Math.min(220, (await ios.boundingBox()).width * .6), y: start.y });
    assert.equal(await ios.locator(".mo-phone").getAttribute("data-overlay"), "library", "A horizontal iOS home swipe opens App Library");
    assert(Math.abs(await stage.evaluate(element => element.scrollLeft) - originalPosition) < 1, "App Library gesture does not shift the single-phone stage");
    await ios.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }).click();
    const widget = ios.locator(".mo-ios-calendar-widget");
    await widget.scrollIntoViewIfNeeded();
    const widgetBounds = await widget.boundingBox();
    const widgetStart = { x: widgetBounds.x + widgetBounds.width - 24, y: widgetBounds.y + widgetBounds.height / 2 };
    await swipe(widgetStart, { x: widgetStart.x - 100, y: widgetStart.y });
    assert.equal(await ios.locator(".mo-device-fit .mo-phone").getAttribute("data-overlay"), "library", "A Home page swipe may begin over an interactive widget");
    assert.equal(await ios.locator(".mo-device-fit .mo-phone").getAttribute("data-app"), "home", "Swiping suppresses the widget's generated click");
    await ios.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }).click();
    await widget.scrollIntoViewIfNeeded();
    const tapBounds = await widget.boundingBox();
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: tapBounds.x + tapBounds.width / 2, y: tapBounds.y + tapBounds.height / 2, radiusX: 1, radiusY: 1, force: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForFunction(() => document.querySelector(".mo-device-fit .mo-phone").dataset.app === "calendar");
    await ios.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }).click();
    await ios.locator(".mo-status-bar").scrollIntoViewIfNeeded();
    const status = await ios.locator(".mo-status-bar").boundingBox();
    const phoneBounds = await ios.locator(".mo-device-fit .mo-phone").boundingBox();
    const statusStart = { x: status.x + status.width - 20, y: status.y + status.height / 2 };
    await swipe(statusStart, { x: Math.max(phoneBounds.x + 20, statusStart.x - 100), y: statusStart.y });
    assert(Math.abs(await stage.evaluate(element => element.scrollLeft) - originalPosition) < 1, "A status-bar swipe does not reveal a second platform");
    assert.equal(await page.locator("section.mo-device").count(), 1);
    // A compact native status rail may open its own system panel; restore Home
    // before the next independent journey without changing the stage assertion.
    await ios.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }).click();
    await page.waitForFunction(() => { const phone = document.querySelector(".mo-device-fit .mo-phone"); return phone.dataset.app === "home" && !phone.dataset.overlay; });
    await ios.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  } finally {
    if (!hadTouch) await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await session.detach();
  }
}
