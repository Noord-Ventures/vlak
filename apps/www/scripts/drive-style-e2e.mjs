import assert from "node:assert/strict";
import { checkDriveCameraTransition } from "./drive-camera-e2e.mjs";
import { checkDriveLoading } from "./drive-loading-e2e.mjs";

/** Exercise the EV workspace through visible, keyboard-operable Vlak controls. */
export async function checkDriveStyle({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/drive/`, { waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    const root = page.locator(".ev");
    await page.waitForFunction(() => Object.keys(document.querySelector(".ev-reading") ?? {}).some(key => key.startsWith("__reactProps")));
    const scene = root.locator(".ev-scene");
    const waitForScene = async (predicate, argument) => {
      // Focus can scroll a short phone to a bottom control. Render assertions
      // need the scene back in view so its visibility-gated renderer can run.
      await scene.scrollIntoViewIfNeeded();
      await page.waitForFunction(predicate, argument);
    };
    const activate = async control => { await control.focus(); await control.press("Enter"); await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); };
    const screen = async () => {
      if (await root.getAttribute("data-panel-open") === "true") await activate(root.getByRole("button", {name: "Close vehicle details", exact: true}));
    };
    const panel = async name => {
      const key = name === "Charging" ? "charging" : name === "Climate" ? "climate" : "media";
      if (await root.getAttribute("data-control-panel") !== key) await activate(root.locator(`.ev-reading[data-panel="${key}"]`));
      await page.waitForFunction(key => document.querySelector(".ev")?.dataset.controlPanel === key, key);
    };
    const mode = async name => {
      await screen("Vehicle");
      await activate(root.locator(".ev-modes").getByRole("button", { name, exact: true }));
      assert.equal(await root.getAttribute("data-view"), name.toLowerCase());
      await waitForScene(mode => document.querySelector(".ev-scene")?.dataset.mode === mode && document.querySelector(".ev-scene")?.dataset.settled === "true", name.toLowerCase());
    };
    const fit = async () => {
      const geometry = await root.evaluate(element => {
        const bounds = element.getBoundingClientRect();
        const visible = target => target.getClientRects().length && getComputedStyle(target).visibility !== "hidden";
        return {
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          overflow: element.scrollWidth - element.clientWidth,
          clippedFigure: [...element.querySelectorAll('.ev-model-footer')].filter(visible).some(target => {
            const box = target.getBoundingClientRect(), figure = target.closest('.ev-visual').getBoundingClientRect();
            return box.bottom > figure.bottom + 1 || [...target.querySelectorAll('button')].some(button => button.getBoundingClientRect().bottom > box.bottom + 1);
          }),
          legacyClasses: element.querySelectorAll('[class*="cx-"]').length,
          escapedDocks: [...element.querySelectorAll(".ev-header,.ev-view-header,.ev-vehicle-actions,.ev-controls-header,.ev-mobile-nav,.ev-footer")].filter(visible).filter(target => {
            const rect = target.getBoundingClientRect();
            return rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1 || rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
          }).map(target => target.className),
          shortControls: [...element.querySelectorAll("button,input:not([type=hidden])")].filter(visible).filter(target => {
            const rect = target.getBoundingClientRect();
            return rect.width < 43.5 || rect.height < 43.5;
          }).map(target => target.getAttribute("aria-label") || target.textContent),
        };
      });
      assert(geometry.pageOverflow <= 1, `page overflow: ${geometry.pageOverflow}px`);
      assert(geometry.overflow <= 1, `workspace overflow: ${geometry.overflow}px`);
      assert.equal(geometry.legacyClasses, 0);
      assert.equal(geometry.clippedFigure, false, "3D motion and current footer must not be clipped by its own figure");
      assert.deepEqual(geometry.escapedDocks, [], "a pinned region escapes the workspace frame");
      assert.deepEqual(geometry.shortControls, [], "a control has less than 44px reach");
    };

    await fit();
    const closedWidth = await root.locator('.ev-vehicle').evaluate(element => element.clientWidth);
    await panel("Climate");
    assert(await root.locator(".ev-controls h2").evaluate(element => element === document.activeElement), "Opening details moves keyboard focus into the pane");
    assert.equal(await root.locator('.ev-reading[data-panel="climate"]').getAttribute('aria-expanded'), 'true');
    if (await root.locator('.ev-controls').evaluate(element => getComputedStyle(element).position !== 'absolute')) {
      await page.waitForFunction(() => Math.abs(document.querySelector('.ev-controls').getBoundingClientRect().left - document.querySelector('.ev-reading[data-panel="media"]').getBoundingClientRect().left) < 1);
      const headerOffset = await root.evaluate(element => element.querySelector('.ev-view-header').getBoundingClientRect().bottom - element.querySelector('.ev-controls-header').getBoundingClientRect().bottom);
      assert(Math.abs(headerOffset) < 1, "The vehicle and detail pane header dividers share one grid row");
    }
    await activate(root.locator('.ev-reading[data-panel="climate"]'));
    assert.equal(await root.getAttribute('data-panel-open'), 'false', 'Repeat tap closes the pane');
    await page.waitForFunction(width => Math.abs(document.querySelector('.ev-vehicle').clientWidth - width) <= 1, closedWidth);
    await waitForScene(() => document.querySelector('.ev-scene')?.dataset.rendered === 'true');
    assert.equal(await scene.locator('canvas[data-engine="three"]').count(), 1);
    const triangles = Number(await scene.getAttribute('data-triangles'));
    assert(triangles >= 204453 && triangles < 350000, 'The complete Evoque source and sparse contour hull stay within the measured rendering budget');
    assert(Number(await scene.getAttribute('data-draw-calls')) < 150, 'Source surfaces and feature lines remain batched');
    const sourceResources = await page.evaluate(() => performance.getEntriesByType('resource').map(resource => new URL(resource.name).pathname));
    assert(sourceResources.includes('/interfaces/concepts/evoque-monochrome.glb'), 'Vehicle proportions use the original licensed Evoque surface geometry');
    assert(sourceResources.includes('/interfaces/concepts/evoque-feature-lines.json'), 'Sparse contours use the prepared source feature paths');
    const lock = root.getByRole("button", { name: "Door lock", exact: true });
    await activate(lock); assert.equal(await lock.getAttribute("aria-pressed"), "false");
    assert.match(await root.locator(".ev-profile figcaption").textContent(), /Doors unlocked/);
    await activate(lock); assert.equal(await lock.getAttribute("aria-pressed"), "true");
    const lights = root.getByRole("button", { name: "Lights", exact: true });
    const originalTheme = await page.evaluate(() => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    await activate(lights); assert.equal(await root.locator(".ev-visual").getAttribute("data-lights"), "true");
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "dark", "Lights must switch the whole site to dark");
    await waitForScene(() => Number(document.querySelector('.ev-scene')?.dataset.lightPower) > .99);
    assert.equal(await scene.getAttribute('data-headlights'), '2');
    await activate(lights);
    await waitForScene(() => Number(document.querySelector('.ev-scene')?.dataset.lightPower) < .01);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), originalTheme, "Lights off restores the previous site theme");
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const on of [true, false]) {
        await activate(lights);
        await waitForScene(on => document.querySelector('.ev-scene')?.dataset.lights === String(on) && Math.abs(Number(document.querySelector('.ev-scene')?.dataset.lightPower) - Number(on)) < .01, on);
        const palette = await scene.evaluate(element => {
          const style = getComputedStyle(element), canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const context = canvas.getContext('2d');
          context.fillStyle = style.getPropertyValue('--bg'); context.fillRect(0,0,1,1);
          context.fillStyle = style.getPropertyValue('--table-alt'); context.fillRect(0,0,1,1);
          return { actual: element.dataset.paper, expected: [...context.getImageData(0,0,1,1).data].slice(0,3).map(value => value.toString(16).padStart(2,'0')).join('') };
        });
        assert.equal(palette.actual, palette.expected, 'Repeated Lights toggles must keep the renderer palette in sync');
      }
    }
    assert(Number(await scene.getAttribute('data-contour-width')) >= 1, 'Main contours use a stable CSS-pixel width');
    assert.equal(await scene.getAttribute("data-camera-style"), "side", "Vehicle uses the side-profile camera");
    if (page.viewportSize()?.width === 1440 && originalTheme === "light") await checkDriveCameraTransition({ page, root, scene });
    const profileScale = await scene.evaluate(element => element.clientHeight / Number(element.dataset.span));
    await mode("Journey");
    assert(await scene.evaluate(element => element.clientHeight / Number(element.dataset.span)) < profileScale * .5, "Journey must zoom substantially farther out");
    assert.equal(await scene.getAttribute("data-camera-style"), "chase", "Journey uses a trailing third-person camera");
    assert.equal(await scene.getAttribute("data-world-visible"), "true", "Journey renders its surrounding3D streetscape");
    assert(Number(await scene.getAttribute("data-camera-fov")) >= 47.9, "Journey has real perspective depth");
    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await waitForScene(() => document.querySelector('.ev-scene')?.dataset.moving === 'true');
    const firstDistance = await scene.getAttribute("data-world-distance");
    const firstAngle = await scene.getAttribute('data-wheel-angle');
    await waitForScene(angle => document.querySelector('.ev-scene')?.dataset.wheelAngle !== angle, firstAngle);
    await waitForScene(distance => document.querySelector(".ev-scene")?.dataset.worldDistance !== distance, firstDistance);
    await activate(root.getByRole('button', { name: 'Pause 3D motion', exact: true }));
    await waitForScene(() => document.querySelector('.ev-scene')?.dataset.moving === 'false');
    const pausedAngle = await scene.getAttribute('data-wheel-angle');
    const pausedDistance = await scene.getAttribute('data-world-distance');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await scene.getAttribute('data-wheel-angle'), pausedAngle, 'Pause must stop wheel geometry');
    assert.equal(await scene.getAttribute('data-world-distance'), pausedDistance, 'Pause must stop the moving streetscape');
    await activate(root.getByRole('button', { name: 'Resume 3D motion', exact: true }));
    await activate(root.getByRole("button", { name: "Start route", exact: true }));
    await waitForScene(() => document.querySelector('.ev-scene')?.dataset.routeActive === 'true');
    await activate(root.getByRole("button", { name: "End route", exact: true }));
    await waitForScene(() => document.querySelector('.ev-scene')?.dataset.routeActive === 'false');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await waitForScene(() => document.querySelector('.ev-scene')?.dataset.moving === 'false');
    assert.equal(await root.getByRole('button', { name: '3D motion disabled for reduced motion', exact: true }).isDisabled(), true);
    if (!reduced) await page.emulateMedia({ reducedMotion: 'no-preference' });
    await fit();
    await mode("Energy");
    assert.equal(await scene.getAttribute('data-modules'), '12');
    assert(Number(await scene.getAttribute('data-vehicle-opacity')) < .003, 'Energy composition must focus only on the battery assembly');
    await activate(root.getByRole("button", { name: "Schedule charge", exact: true }));
    assert.match(await root.locator(".ev-vehicle-actions .ev-state").textContent(), /Scheduled for 23:00/);
    await panel("Charging");
    await activate(root.getByRole('button', { name: 'Run charge simulation', exact: true }));
    await page.waitForFunction(() => Number(document.querySelector('.ev-charge-reading strong')?.textContent.replace('%', '')) > 84);
    await activate(root.getByRole('button', { name: 'Stop simulation', exact: true }));
    await screen('Vehicle');
    await waitForScene(() => Number(document.querySelector('.ev-scene')?.dataset.charge) > 84);
    await panel('Charging');
    await activate(root.getByRole("button", { name: "Charge limit 90 percent. Change to 100 percent", exact: true }));
    assert.equal(await root.getByRole("button", { name: "Charge limit 100 percent. Change to 90 percent", exact: true }).isVisible(), true);
    await activate(root.getByRole("button", { name: "Cancel charging schedule", exact: true }));
    assert.equal(await root.getByRole("button", { name: "Schedule charging", exact: true }).isVisible(), true);
    await panel("Climate");
    const temperature = root.getByRole("spinbutton", { name: "Cabin", exact: true });
    await activate(root.getByRole("button", { name: "Raise temperature", exact: true }));
    assert.equal(await temperature.inputValue(), "21");
    await activate(root.getByRole("button", { name: "Lower temperature", exact: true }));
    assert.equal(await temperature.inputValue(), "20");
    await fit();
    await panel("Media");
    await activate(root.getByRole("button", { name: "Pause", exact: true }));
    const scrubber = root.getByRole("slider", { name: "Track position", exact: true });
    await scrubber.focus(); await scrubber.press("ArrowRight");
    assert.equal(await scrubber.inputValue(), "91");
    await activate(root.getByRole("button", { name: "Skip ahead", exact: true }));
    assert.equal(await scrubber.inputValue(), "106");
    await activate(root.getByRole("button", { name: "Restart track", exact: true }));
    assert.equal(await scrubber.inputValue(), "0");
    await activate(root.getByRole("button", { name: "Disconnect Mara’s phone", exact: true }));
    assert.equal(await root.getByRole("button", { name: "Play", exact: true }).isDisabled(), true);
    assert.equal(await scrubber.isDisabled(), true);
    assert.match(await root.locator(".ev-header-status").textContent(), /Phone offline/);
    await activate(root.getByRole("button", { name: "Connect Mara’s phone", exact: true }));
    assert.equal(await root.getByRole("button", { name: "Play", exact: true }).isEnabled(), true);
    assert.equal(await root.getAttribute("data-playing"), "false");
    await activate(root.getByRole("button", { name: "Play", exact: true }));
    assert.equal(await root.getAttribute("data-playing"), "true");
    await fit();
    if (page.viewportSize()?.width === 1440 && originalTheme === "light") await checkDriveLoading({ page, base });
  } catch (error) {
    fail(`EV workspace: ${error instanceof Error ? error.message : String(error)}`);
  }
}
