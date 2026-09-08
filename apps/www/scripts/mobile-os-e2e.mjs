import assert from "node:assert/strict";

/** Native platform geometry and bounded keyboard journeys through both local phones. */
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
    await page.goto(`${base}/interfaces/mobile-os/`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => Object.keys(document.querySelector(".mo-app-icon") ?? {}).some(key => key.startsWith("__reactProps")));
    await page.evaluate(async () => { await document.fonts.ready; });
    if (page.context().browser()?.browserType().name() === "chromium" && await page.locator(".mo-stage").evaluate(element => getComputedStyle(element).display === "flex")) {
      stage = "iOS native touch gestures";
      await checkIOSHomeTouch(page);
    }
    await page.clock.install();
    const root = page.locator(".mo");
    for (const platform of ["ios", "android"]) {
      const device = root.locator(`.mo-device[data-platform="${platform}"]`);
      await device.scrollIntoViewIfNeeded();
      await page.waitForTimeout(50);
      assert.equal(await root.locator(".mo-workspace-header button").count(), 0, "The removed platform switch returned");
      const phone = device.locator(".mo-phone");
      const reference = platform === "ios" ? { phone: [393, 852], handset: [411, 870], icon: 60 } : { phone: [412, 915], handset: [430, 933], icon: 56 };
      const presentation = await device.evaluate(element => {
        const phone = element.querySelector(".mo-phone");
        const icon = element.querySelector(".mo-app-icon > [data-app-icon]");
        const hardware = getComputedStyle(element.querySelector(".mo-handset"));
        const transform = new DOMMatrixReadOnly(hardware.transform);
        return { font: getComputedStyle(phone).fontFamily, controlFont: getComputedStyle(phone.querySelector("button")).fontFamily, icon: [icon.offsetWidth, icon.offsetHeight], rotated: [transform.b, transform.c], perspective: hardware.perspective };
      });
      assert.match(presentation.font, platform === "ios" ? /-apple-system|BlinkMacSystemFont/ : /^"?Roboto"?(?:,|$)/, `${platform} retains its platform typeface`);
      assert.equal(presentation.controlFont, presentation.font, `${platform} controls inherit the platform typeface`);
      assert.deepEqual(presentation.icon, [reference.icon, reference.icon], `${platform} launcher icon logical size`);
      assert.deepEqual(presentation.rotated, [0, 0], "The handset remains a flat front view");
      assert.equal(presentation.perspective, "none");
      if (platform === "android") assert(await page.evaluate(async () => { const faces = await document.fonts.load('16px "Roboto"'); return faces.length > 0 && faces.every(face => face.status === "loaded"); }), "Bundled Roboto loaded");
      const home = async () => { const control = device.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }); await activate(control); if (await phone.getAttribute("data-app") !== "home") await activate(control); };
      const library = async () => activate(device.getByRole("button", { name: platform === "ios" ? "App Library" : "All apps", exact: true }));
      const closeSystem = async () => activate(device.locator(".mo-system-nav").getByRole("button", { name: platform === "ios" ? "Home" : "System back", exact: true }));
      const launch = async name => { stage = `${platform} ${name}`; await home(); await library(); await activate(device.locator(".mo-app-grid").getByRole("button", { name: `Open ${platform === "ios" && name === "Browser" ? "Safari" : name}`, exact: true })); };
      const back = async () => activate(device.locator(".mo-app-header").getByRole("button", { name: "Back", exact: true }));
      const saveEditor = async name => {
        const button = device.getByRole("button", { name, exact: true });
        if (platform === "ios") assert(await button.evaluate(element => !!element.closest(".mo-app-header .mo-ios-editor-actions")), `${name} belongs in the iOS editor navigation bar`);
        await activate(button);
      };
      const fit = async () => {
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
        assert.deepEqual(result.phone, reference.phone, `${platform} fixed logical display`);
        assert.deepEqual(result.handset, reference.handset, `${platform} fixed hardware proportions`);
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
      if (platform === "ios") { const gesture = device.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }); await gesture.focus(); await gesture.press("ArrowUp"); await page.waitForTimeout(40); }
      else await activate(device.locator(".mo-system-nav").getByRole("button", { name: "Recent apps", exact: true }));
      assert.equal(await device.locator(".mo-recent-task").count(), 6);
      await home(); await fit();
    }
  } catch (error) { fail(`Mobile OS (${stage}): ${error instanceof Error ? error.message : String(error)}`); }
}

/** Real touch dispatch catches native panning that synthetic pointer events cannot. */
export async function checkIOSHomeTouch(page) {
  const ios = page.locator('.mo-device[data-platform="ios"]');
  const stage = page.locator('.mo-stage');
  await ios.scrollIntoViewIfNeeded();
  const session = await page.context().newCDPSession(page);
  const hadTouch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const swipe = async (from, to) => {
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
    for (let step = 1; step <= 10; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x + (to.x - from.x) * step / 10, y: from.y + (to.y - from.y) * step / 10 }] });
      await page.waitForTimeout(20);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(350);
  };
  const blankPoint = () => ios.locator(".mo-home").evaluate(element => {
    const rect = element.getBoundingClientRect();
    for (let y = Math.max(rect.top + 40, 30); y < Math.min(rect.bottom - 20, innerHeight - 30); y += 6) {
      const x = rect.right - 22;
      const target = document.elementFromPoint(x, y);
      if (target && element.contains(target) && !target.closest("button,input")) return { x, y };
    }
    throw new Error("No reachable home-screen gesture surface");
  });
  try {
    const home = ios.locator(".mo-home");
    const availableScroll = await home.evaluate(element => element.scrollHeight - element.clientHeight);
    assert(availableScroll <= 1, "The complete iOS launcher fits its fixed logical display without vertical scrolling");
    const start = await blankPoint();
    const originalPosition = await stage.evaluate(element => element.scrollLeft);
    await swipe(start, { x: start.x - Math.min(220, (await ios.boundingBox()).width * .6), y: start.y });
    assert.equal(await ios.locator(".mo-phone").getAttribute("data-overlay"), "library", "A horizontal iOS home swipe opens App Library");
    assert(Math.abs(await stage.evaluate(element => element.scrollLeft) - originalPosition) < 1, "App Library gesture must not change the selected phone");
    await ios.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }).click();
    await ios.locator(".mo-status-bar").scrollIntoViewIfNeeded();
    const status = await ios.locator(".mo-status-bar").boundingBox();
    await swipe({ x: status.x + status.width - 20, y: status.y + status.height / 2 }, { x: status.x + 20, y: status.y + status.height / 2 });
    assert(await stage.evaluate(element => element.scrollLeft > element.clientWidth * .8), "Status-bar swipe keeps Android reachable");
    await ios.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  } finally {
    if (!hadTouch) await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await session.detach();
  }
}
