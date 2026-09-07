import assert from "node:assert/strict";

/** Bounded keyboard journeys through both independent local phone systems. */
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
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    await page.waitForFunction(() => Object.keys(document.querySelector(".mo-app-icon") ?? {}).some(key => key.startsWith("__reactProps")));
    if (page.context().browser()?.browserType().name() === "chromium" && await page.locator(".mo").evaluate(element => element.clientWidth <= 640)) {
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
      if (platform === "ios") {
        const paint = await device.evaluate(element => {
          const phone = element.querySelector('.mo-phone');
          const icon = element.querySelector('.mo-app-icon > [data-app-icon]');
          return { wallpaper: getComputedStyle(phone).backgroundImage, widget: getComputedStyle(element.querySelector('.mo-ios-weather-widget')).backgroundImage, shadow: getComputedStyle(icon).boxShadow, paper: getComputedStyle(phone).backgroundColor, iconPaper: getComputedStyle(icon).backgroundColor, font: getComputedStyle(phone).fontFamily, inheritedFont: getComputedStyle(element).fontFamily };
        });
        assert.equal(paint.wallpaper, "none", "iPhone wallpaper uses the Vlak paper surface");
        assert.equal(paint.widget, "none", "iPhone widgets should have no decorative gradient");
        assert.equal(paint.shadow, "none");
        assert.equal(paint.iconPaper, paint.paper, "Launcher icons share the token paper surface");
        assert.equal(paint.font, paint.inheritedFont, "iPhone keeps the inherited Vlak typeface");
      }
      const home = async () => { const control = device.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }); await activate(control); if (await phone.getAttribute("data-app") !== "home") await activate(control); };
      const library = async () => activate(device.getByRole("button", { name: platform === "ios" ? "App Library" : "All apps", exact: true }));
      const closeSystem = async () => activate(device.locator(".mo-system-nav").getByRole("button", { name: platform === "ios" ? "Home" : "System back", exact: true }));
      const launch = async name => { stage = `${platform} ${name}`; await home(); await library(); await activate(device.locator(".mo-app-grid").getByRole("button", { name: `Open ${platform === "ios" && name === "Browser" ? "Safari" : name}`, exact: true })); };
      const fit = async () => {
        const result = await device.evaluate(element => {
          const phone = element.querySelector(".mo-phone"); const bounds = phone.getBoundingClientRect();
          const visible = target => target.getClientRects().length && getComputedStyle(target).visibility !== "hidden" && !target.closest('[aria-hidden="true"]');
          return {
            pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            overflow: phone.scrollWidth - phone.clientWidth,
            short: [...phone.querySelectorAll("button,input:not([type=hidden]),textarea")].filter(visible).filter(target => { const rect = (target.matches('input[type="checkbox"]') ? target.closest("label") : target)?.getBoundingClientRect(); return rect && (rect.width < 43.5 || rect.height < 43.5); }).map(target => target.getAttribute("aria-label") || target.textContent),
            escaped: [...phone.querySelectorAll(".mo-status-bar,.mo-app-header,.mo-app-actions,.mo-dock,.mo-system-nav,.mo-notice")].filter(visible).filter(target => { const rect = target.getBoundingClientRect(); return rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1 || rect.left < bounds.left - 1 || rect.right > bounds.right + 1; }).map(target => target.className),
          };
        });
        assert(result.pageOverflow <= 1 && result.overflow <= 1, `${platform} overflow: ${JSON.stringify(result)}`);
        assert.deepEqual(result.short, [], `${platform} controls below 44px`);
        assert.deepEqual(result.escaped, [], `${platform} pinned regions escaped`);
      };
      await fit();
      await library();
      await device.getByRole("searchbox", { name: "Search apps", exact: true }).fill("notes"); await page.waitForTimeout(40);
      assert.equal(await device.locator(".mo-app-grid button").count(), 1);
      await device.getByRole("searchbox", { name: "Search apps", exact: true }).fill(""); await page.waitForTimeout(40);
      assert.equal(await device.locator(".mo-app-grid button").count(), 16);
      await launch("Contacts");
      await activate(device.getByRole("button", { name: "New contact", exact: true }));
      await device.getByRole("textbox", { name: "Full name", exact: true }).fill("Avery Test"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Phone number", exact: true }).fill("+31 20 555 0103"); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Save contact", exact: true }));
      assert.match(await device.locator(".mo-scroll").textContent(), /Avery Test/);
      await activate(device.locator(".mo-contact-row").filter({ hasText: "Avery Test" }).locator(".mo-list-row"));
      assert.equal(await device.getByText("Simulated call", { exact: true }).isVisible(), true);
      await activate(device.getByRole("button", { name: "End call", exact: true }));
      await launch("Phone");
      await activate(device.getByRole("button", { name: "Keypad", exact: true }));
      for (const digit of ["1", "2", "3"]) await activate(device.locator(".mo-keypad").getByRole("button", { name: digit, exact: true }));
      assert.equal(await device.getByRole("textbox", { name: "Dial number", exact: true }).inputValue(), "123");
      await launch("Messages");
      await activate(device.locator(".mo-list-row").filter({ hasText: "Avery Test" }));
      await device.getByRole("textbox", { name: "Message", exact: true }).fill("A local message from the test phone."); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Send local message", exact: true }));
      assert.match(await device.locator(".mo-message-mine").textContent(), /A local message from the test phone\./);
      await fit();
      await launch("Mail");
      await activate(device.getByRole("button", { name: "Compose", exact: true }));
      await device.getByRole("textbox", { name: "To", exact: true }).fill("avery@example.invalid"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Subject", exact: true }).fill("Local studio mail"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Message body", exact: true }).fill("This message is saved locally."); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Save to local Sent", exact: true }));
      assert.match(await device.locator(".mo-list-row").textContent(), /Local studio mail/);
      await launch("Calendar");
      await activate(device.getByRole("button", { name: "New event", exact: true }));
      await device.getByRole("textbox", { name: "Event title", exact: true }).fill("Local proof review"); await page.waitForTimeout(40);
      await device.getByLabel("Event time", { exact: true }).fill("16:15"); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Save event", exact: true }));
      assert.match(await device.locator(".mo-event").last().textContent(), /16:15Local proof review/);
      await launch("Notes");
      await activate(device.getByRole("button", { name: "New note", exact: true }));
      await device.getByRole("textbox", { name: "Note title", exact: true }).fill("Local test note"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "Note text", exact: true }).fill("A first thought."); await page.waitForTimeout(40);
      await fit();
      await activate(device.getByRole("button", { name: "Save note", exact: true }));
      await activate(device.locator(".mo-list-row").filter({ hasText: "Local test note" }));
      await device.getByRole("textbox", { name: "Note text", exact: true }).fill("A revised thought."); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Save note", exact: true }));
      assert.match(await device.locator(".mo-list-row").filter({ hasText: "Local test note" }).textContent(), /A revised thought\./);
      await launch("Files");
      await activate(device.getByRole("button", { name: "New text file", exact: true }));
      await device.getByRole("textbox", { name: "File name", exact: true }).fill("local-test.txt"); await page.waitForTimeout(40);
      await device.getByRole("textbox", { name: "File contents", exact: true }).fill("A downloadable local file."); await page.waitForTimeout(40);
      await activate(device.getByRole("button", { name: "Save file", exact: true }));
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
      const alarm = device.getByRole("switch", { name: "Alarm enabled", exact: true }); await alarm.focus(); await alarm.press("Space"); assert.equal(await alarm.getAttribute("aria-checked"), "true");
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
      if (platform === "ios") await activate(device.getByRole("button", { name: "Display & Brightness", exact: true }));
      await choose(device.getByRole("combobox", { name: "Appearance", exact: true }), 2);
      assert.equal(await phone.getAttribute("data-theme"), "dark");
      const textSize = device.getByRole("slider", { name: "Text size", exact: true }); await textSize.focus(); await textSize.press("End"); assert.equal(await textSize.inputValue(), "125");
      if (platform === "ios") { await activate(device.getByRole("button", { name: "Back", exact: true })); await activate(device.getByRole("button", { name: /Wi-Fi Studio network/ })); }
      const wifi = device.getByRole("switch", { name: "Wi-Fi", exact: true }); await wifi.focus(); await wifi.press("Space"); assert.equal(await wifi.getAttribute("aria-checked"), "false");
      await fit();
      await activate(device.getByRole("button", { name: platform === "ios" ? "Open Control Center" : "Open Quick Settings", exact: true }));
      assert.equal(await device.locator(".mo-quick-grid").getByRole("button", { name: /Wi-Fi/ }).getAttribute("aria-pressed"), "false");
      await activate(device.locator(".mo-quick-grid").getByRole("button", { name: /Wi-Fi/ }));
      await fit();
      await closeSystem();
      assert.equal(await wifi.getAttribute("aria-checked"), "true");
      if (platform === "ios") await activate(device.getByRole("button", { name: "Back", exact: true }));
      await activate(device.getByRole("button", { name: "Restore default settings", exact: true }));
      await activate(device.getByRole("button", { name: "09:41, open notifications", exact: true }));
      assert.match(await device.locator(".mo-notification").first().textContent(), /Timer complete/);
      await activate(device.getByRole("button", { name: "Clear notifications", exact: true }));
      assert.equal(await device.getByText("You’re all caught up", { exact: true }).isVisible(), true);
      await closeSystem();
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
    for (let y = rect.top + 120; y < Math.min(rect.bottom - 20, innerHeight - 30); y += 6) {
      const x = rect.right - 22;
      const target = document.elementFromPoint(x, y);
      if (target && element.contains(target) && !target.closest("button,input")) return { x, y };
    }
    throw new Error("No reachable home-screen gesture surface");
  });
  try {
    const home = ios.locator(".mo-home");
    const availableScroll = await home.evaluate(element => element.scrollHeight - element.clientHeight);
    if (availableScroll > 4) {
      const start = await blankPoint();
      await swipe(start, { x: start.x, y: Math.max(start.y - 100, (await home.boundingBox()).y + 8) });
      assert(await home.evaluate(element => element.scrollTop) > 0, "iOS home keeps native vertical scrolling");
      assert.equal(await ios.locator(".mo-phone").getAttribute("data-overlay"), null, "Vertical scrolling must not open App Library");
      await home.evaluate(element => { element.scrollTop = 0; });
    }
    const start = await blankPoint();
    const originalPosition = await stage.evaluate(element => element.scrollLeft);
    await swipe(start, { x: start.x - Math.min(220, (await ios.boundingBox()).width * .6), y: start.y });
    assert.equal(await ios.locator(".mo-phone").getAttribute("data-overlay"), "library", "A horizontal iOS home swipe opens App Library");
    assert(Math.abs(await stage.evaluate(element => element.scrollLeft) - originalPosition) < 1, "App Library gesture must not change the selected phone");
    await ios.locator(".mo-system-nav").getByRole("button", { name: "Home", exact: true }).click();
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
