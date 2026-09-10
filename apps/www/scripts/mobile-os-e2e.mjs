import assert from "node:assert/strict";
import { deviceProfiles } from "../app/interfaces/mobile-os/device-profiles.ts";

/** Observe painted frames on the real animation timeline without seeking or pausing it. */
export async function assertMobileFoldAnimation({ page, device, opening }) {
  await page.waitForFunction(() => {
    const panel = document.querySelector(".mo-fold-panel-left");
    return panel && getComputedStyle(panel).transform.startsWith("matrix3d(");
  });
  const motion = await device.locator(".mo-fold-stage").evaluate(async element => {
    const moving = element.querySelector(".mo-fold-panel-left .mo-fold-texture");
    const settled = element.querySelector(".mo-fold-panel-right .mo-fold-texture");
    const diffusion = element.querySelector(".mo-fold-panel-left .mo-fold-diffusion");
    const live = element.closest("section.mo-device").querySelector(".mo-device-fit .mo-phone");
    const handset = live.closest(".mo-handset");
    const blur = target => Number.parseFloat(getComputedStyle(target).filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0");
    const result = {
      panels: element.querySelectorAll(".mo-fold-panel").length,
      posture: element.querySelector(".mo-fold-context")?.dataset.posture,
      expectedTop: element.dataset.axis === "horizontal" ? 44 : 59,
      layouts: [moving, settled].map(texture => ({
        rows: getComputedStyle(texture).gridTemplateRows.split(" ").map(Number.parseFloat),
        height: texture.clientHeight,
        contentTop: texture.querySelector(".mo-screen").offsetTop,
        gestureTop: texture.querySelector(".mo-system-nav").offsetTop,
      })),
      inert: element.inert, hidden: element.getAttribute("aria-hidden"),
      duplicateIds: element.querySelectorAll("[id]").length,
      mask: getComputedStyle(diffusion).maskImage,
      backdrop: getComputedStyle(diffusion).backdropFilter,
      samples: [],
    };
    await new Promise((resolve, reject) => {
      const deadline = setTimeout(() => reject(new Error("Fold animation did not remove its transient surfaces")), 7000);
      const sample = () => {
        if (!element.isConnected) { clearTimeout(deadline); resolve(); return; }
        result.samples.push({
          moving: blur(moving), settled: getComputedStyle(settled).filter,
          hardware: [...element.querySelectorAll(".mo-fold-panel"), handset, handset.querySelector(".mo-hardware"), element].map(target => getComputedStyle(target).filter),
          live: blur(live), opacity: Number.parseFloat(getComputedStyle(handset).opacity),
        });
        requestAnimationFrame(sample);
      };
      sample();
    });
    return result;
  });
  assert.equal(motion.posture, "expanded", "Both directions retain the expanded screen arrangement on transient surfaces");
  for (const layout of motion.layouts) {
    assert.equal(layout.rows.length, 3, "Fold textures retain status, app, and Home-gesture rows");
    assert.equal(layout.rows[0], motion.expectedTop, "The captured status safe area matches the native orientation");
    assert.equal(layout.rows[2], 34, "The captured Home gesture keeps its reserved row");
    assert.equal(layout.contentTop, motion.expectedTop, "The app does not jump upward in the fold snapshot");
    assert.equal(layout.gestureTop, layout.height - 34, "The Home gesture stays at the bottom of the snapshot");
  }
  assert.equal(motion.panels, 2, "Fold animation has two independently hinged screen surfaces");
  assert.equal(motion.inert, true, "Transient fold surfaces cannot receive input");
  assert.equal(motion.hidden, "true", "Screen readers ignore transient duplicate content");
  assert.equal(motion.duplicateIds, 0);
  assert.match(motion.mask, /linear-gradient/, "Diffusion varies across the turning display");
  assert.match(motion.backdrop, /blur\(/, "The edge diffusion uses a real backdrop blur");
  assert(motion.samples.length >= 3, "Fold paint is observed across multiple actual frames");
  const blur = motion.samples.map(sample => sample.moving);
  const direction = opening ? -1 : 1;
  assert(direction * (blur.at(-1) - blur[0]) > 8, `${opening ? "Opening resolves" : "Closing increases"} the moving display blur`);
  assert(new Set(blur.filter(value => value > 1 && value < 23).map(value => Math.round(value))).size >= 3, "Blur changes gradually through several intermediate strengths");
  assert(blur.slice(1).every((value, index) => direction * (value - blur[index]) >= -.05), "Moving-display diffusion progresses without a jump in the opposite direction");
  assert(motion.samples.every(sample => sample.settled === "none" && sample.hardware.every(filter => filter === "none")), "The settled screen and physical frame remain crisp throughout the fold");
  assert(motion.samples.some(sample => sample.opacity > .05 && sample.live > .05), "The live app gradually resolves during the final handoff");
  assert(motion.samples.at(-1).live < .5, "The live app becomes sharp before animation cleanup");
  assert.equal(await device.locator(".mo-fold-stage,.mo-folding").count(), 0);
  const final = await device.locator(".mo-device-fit .mo-phone").evaluate(element => ({ filter: getComputedStyle(element).filter, opticalAnimations: element.getAnimations().filter(animation => animation.effect?.getKeyframes().some(frame => "filter" in frame)).length }));
  assert.equal(final.filter, "none", "The final live app has no residual blur");
  assert.equal(final.opticalAnimations, 0, "Completed optical effects are canceled rather than retained");
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
          const drawn = handset.getBoundingClientRect(), frame = document.querySelector(".mo-device-fit").getBoundingClientRect();
          return Math.abs(handset.offsetWidth - width) < 1 && Math.abs(handset.offsetHeight - height) < 1 && Math.abs(drawn.width - frame.width) < 1 && Math.abs(drawn.height - frame.height) < 1;
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
      await fit();
      await library();
      await device.getByRole("searchbox", { name: "Search apps", exact: true }).fill("notes"); await page.waitForTimeout(40);
      assert.equal(await device.locator(".mo-app-grid button").count(), 1);
      await device.getByRole("searchbox", { name: "Search apps", exact: true }).fill(""); await page.waitForTimeout(40);
      assert.equal(await device.locator(".mo-app-grid button").count(), 16);
      await launch("Contacts");
      assert.equal(await device.locator(".mo-app-header").getByRole("button", { name: "Back", exact: true }).count(), 0, "Root app navigation has no fabricated Back to Home control");
      await activate(device.getByRole("button", { name: "New contact", exact: true }));
      await device.getByRole("textbox", { name: "Full name", exact: true }).fill("Avery Test"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Phone number", exact: true }).fill("+31 20 555 0103"); await page.waitForTimeout(40);
      await saveEditor("Save contact");
      assert.match(await device.locator(".mo-scroll").textContent(), /Avery Test/);
      await activate(device.locator(".mo-contact-row").filter({ hasText: "Avery Test" }).locator(".mo-list-row"));
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
      await device.getByRole("searchbox", { name: "Search recipients", exact: true }).fill("0103"); await page.waitForTimeout(40);
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
      await activate(device.getByRole("button", { name: "New event", exact: true }));
      await device.getByRole("textbox", { name: "Event title", exact: true }).fill("Local proof review"); await page.waitForTimeout(40);
      await device.getByLabel("Event time", { exact: true }).fill("16:15"); await page.waitForTimeout(40);
      await saveEditor("Save event");
      assert.match(await device.locator(".mo-event").last().textContent(), /16:15Local proof review/);
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
      await activate(device.getByRole("button", { name: "Capture", exact: true }));
      assert.match(await device.locator(".mo-notice").textContent(), /Sample capture saved to Photos/);
      await activate(device.getByRole("button", { name: "Library", exact: true }));
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
      await activate(device.getByRole("button", { name: "Fahrenheit", exact: true }));
      assert.equal(await device.locator(".mo-weather strong").textContent(), "64°");
      await launch("Maps");
      await choose(device.getByRole("combobox", { name: "Destination", exact: true }), 1);
      await activate(device.getByRole("button", { name: "Start local route", exact: true }));
      await activate(device.getByRole("button", { name: "Next step", exact: true }));
      assert.match(await device.locator(".mo-route-step").textContent(), /Follow the canal path/);
      await launch("Clock");
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
              await device.locator(".mo-fold-stage").waitFor();
              const interruptedStage = await device.locator(".mo-fold-stage").elementHandle();
              await activate(root.getByRole("button", { name: "Fold display", exact: true }));
              assert.equal(await interruptedStage.evaluate(element => element.isConnected), false, "Rapid reversal removes the interrupted fold surfaces");
              assert.equal(await device.locator(".mo-fold-stage").count(), 1, "Rapid reversal leaves only the current optical layer");
              await assertFoldMotion(false);
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
            }
          } finally { if (inspectMotion) await page.emulateMedia({ reducedMotion: "reduce" }); }
          // The reduced-motion path changes posture directly, with no blurred clone.
          if (inspectMotion) {
            for (const [label, posture] of [["Open display", "expanded"], ["Fold display", "compact"]]) {
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
      const x = rect.right - 3;
      const target = document.elementFromPoint(x, y);
      if (target && element.contains(target) && !target.closest("button,input")) return { x, y };
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
    await ios.locator(".mo-status-bar").scrollIntoViewIfNeeded();
    const status = await ios.locator(".mo-status-bar").boundingBox();
    await swipe({ x: status.x + status.width - 20, y: status.y + status.height / 2 }, { x: status.x + 20, y: status.y + status.height / 2 });
    assert(Math.abs(await stage.evaluate(element => element.scrollLeft) - originalPosition) < 1, "A status-bar swipe does not reveal a second platform");
    assert.equal(await page.locator("section.mo-device").count(), 1);
    await ios.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  } finally {
    if (!hadTouch) await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await session.detach();
  }
}
