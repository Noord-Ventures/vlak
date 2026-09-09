/** Focused AI interactions on the built site; the main suite already visits every catalog page. */
export async function checkAIInteractions({ browser, base, fail }) {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    page.setDefaultTimeout(10_000);
    let current = "initialization";
    const errorHandler = error => fail(`AI ${width}px ${current}: page error ${error.message}`);
    page.on("pageerror", errorHandler);
    const ensure = (condition, message) => { if (!condition) throw new Error(message); };
    const check = async (name, run) => {
      current = name;
      try { await run(); } catch (error) { fail(`AI ${width}px ${name}: ${error.message}`); }
    };
    const visit = async name => {
      await page.goto(`${base}/ai/${name}/`, { waitUntil: "networkidle" });
      return page.locator(".preview-box");
    };
    try {
      await check("workflow", async () => {
        const preview = await visit("workflow-canvas");
        const edge = preview.locator(".react-flow__edge").first();
        await edge.waitFor({ state: "visible" });
        const path = edge.locator(".react-flow__edge-path");
        const endpoints = await preview.evaluate((root, webkit) => {
          const edgePath = root.querySelector(".react-flow__edge-path");
          const source = root.querySelector('[data-testid="rf__node-brief"] .source');
          const target = root.querySelector('[data-testid="rf__node-review"] .target');
          // WebKit's getScreenCTM omits ancestor CSS scale. Project this scale/translate-only
          // fixture from its bounds there; Firefox includes stroke in client bounds, so use CTM.
          const local = edgePath.getBBox(); const client = edgePath.getBoundingClientRect();
          const project = point => webkit ? ({ x: client.x + (point.x - local.x) * (local.width ? client.width / local.width : 1), y: client.y + (point.y - local.y) * (local.height ? client.height / local.height : 1) }) : point.matrixTransform(edgePath.getScreenCTM());
          const start = project(edgePath.getPointAtLength(0));
          const end = project(edgePath.getPointAtLength(edgePath.getTotalLength()));
          const from = source.getBoundingClientRect(); const to = target.getBoundingClientRect();
          const hit = getComputedStyle(source, "::before");
          return { startGap: Math.hypot(start.x - from.right, start.y - from.y - from.height / 2), endGap: Math.hypot(end.x - to.left, end.y - to.y - to.height / 2), hitWidth: Number.parseFloat(hit.width), hitHeight: Number.parseFloat(hit.height) };
        }, browser.browserType().name() === "webkit");
        ensure(endpoints.startGap < 1.5 && endpoints.endGap < 1.5 && endpoints.hitWidth >= 44 && endpoints.hitHeight >= 44, `edges and handles do not share visible geometry with 44px targets: ${JSON.stringify(endpoints)}`);
        const restingStroke = await path.evaluate(element => getComputedStyle(element).stroke);
        await edge.focus();
        ensure(await edge.evaluate(element => element === document.activeElement), "edge cannot receive keyboard focus");
        ensure(await path.evaluate(element => getComputedStyle(element).stroke) !== restingStroke, "unselected edge has no visible focus stroke");
        const connect = preview.getByRole("button", { name: "Connect steps", exact: true });
        await connect.focus(); await page.keyboard.press("Enter");
        await page.waitForFunction(() => document.querySelectorAll(".preview-box .react-flow__edge").length === 2);
        const node = preview.locator('[data-testid="rf__node-review"]');
        await node.focus(); await page.keyboard.press("Enter");
        const toolbar = preview.getByRole("toolbar", { name: "Review actions", exact: true });
        const position = await node.getAttribute("style");
        await toolbar.getByRole("button", { name: "Mark reviewed", exact: true }).focus();
        await page.keyboard.press("ArrowRight");
        ensure(await toolbar.getByRole("button", { name: "Remove", exact: true }).evaluate(element => element === document.activeElement), "toolbar arrow key does not move focus");
        ensure(await node.getAttribute("style") === position, "toolbar arrow key moves the graph node");
        await page.keyboard.press("ArrowLeft"); await page.keyboard.press("Enter");
        await node.getByText("Reviewed locally", { exact: true }).waitFor({ state: "visible" });
      });

      await check("citation", async () => {
        const preview = await visit("inline-citation");
        const trigger = preview.getByRole("button", { name: "View 2 sources", exact: true });
        await trigger.focus(); await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog", { name: "Citation sources", exact: true });
        await dialog.waitFor({ state: "visible" });
        ensure(await dialog.evaluate(element => element === document.activeElement), "opening does not focus the citation dialog");
        await page.keyboard.press("ArrowRight");
        await dialog.getByText("Source 2 of 2", { exact: true }).waitFor({ state: "visible" });
        await dialog.getByText("Review the draft together on Thursday.", { exact: true }).waitFor({ state: "visible" });
        const bounds = await dialog.boundingBox();
        ensure(bounds && bounds.x >= -1 && bounds.x + bounds.width <= width + 1, "citation dialog escapes the viewport");
        ensure(bounds.height < 400, `short citation content stretches toward the viewport height: ${bounds.height}px`);
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        ensure(await trigger.evaluate(element => element === document.activeElement), "Escape does not restore citation trigger focus");
      });

      await check("response actions", async () => {
        const preview = await visit("response-actions");
        const actions = preview.getByRole("group", { name: "Response actions", exact: true });
        const buttons = await actions.locator(":scope > button").evaluateAll(elements => elements.map(element => {
          const rect = element.getBoundingClientRect();
          return { width: rect.width, height: rect.height, text: element.textContent.trim(), name: element.getAttribute("aria-label") };
        }));
        ensure(buttons.length === 4 && buttons.every(button => button.width >= 43.9 && button.height >= 43.9 && button.width <= 44.1 && button.text === "" && button.name), `expected four named 44px icon actions: ${JSON.stringify(buttons)}`);
        const trigger = actions.getByRole("button", { name: "Rate response", exact: true });
        await trigger.focus(); await page.keyboard.press("ArrowDown");
        await page.getByRole("menuitemcheckbox", { name: "Helpful response", exact: true }).waitFor({ state: "visible" });
        await page.keyboard.press("Enter");
        ensure(await trigger.getAttribute("data-feedback") === "positive", "keyboard feedback is not selected");
        ensure(await trigger.evaluate(element => element === document.activeElement), "feedback selection loses trigger focus");
        await page.keyboard.press("ArrowDown");
        await page.getByRole("menuitemcheckbox", { name: "Helpful response", exact: true }).waitFor({ state: "visible" });
        await page.keyboard.press("Enter");
        ensure(await trigger.getAttribute("data-feedback") === "none", "selecting the current feedback does not clear it");
      });

      await check("composer and cancellation", async () => {
        await page.goto(`${base}/ai/`, { waitUntil: "networkidle" });
        const chat = page.locator(".ai-chat-demo");
        const draft = chat.getByRole("textbox", { name: "Message", exact: true });
        const initial = await draft.evaluate(element => element.getBoundingClientRect().height);
        ensure(initial >= 43.9 && initial <= 50, `empty composer is not a single line: ${initial}px`);
        await draft.fill("A short prompt");
        ensure(Math.abs(await draft.evaluate(element => element.getBoundingClientRect().height) - initial) < 1, "a short prompt grows the composer");
        await draft.fill(Array.from({ length: 20 }, (_, index) => `Prompt line ${index + 1}`).join("\n"));
        const grown = await draft.evaluate(element => ({ height: element.getBoundingClientRect().height, maximum: Number.parseFloat(getComputedStyle(element).maxHeight), scroll: element.scrollHeight > element.clientHeight, overflow: getComputedStyle(element).overflowY }));
        ensure(grown.height > initial && grown.height <= grown.maximum + 1 && grown.scroll && grown.overflow === "auto", `long draft does not stop growing: ${JSON.stringify(grown)}`);
        const send = chat.getByRole("button", { name: "Send", exact: true });
        ensure((await send.textContent()).trim() === "", "compact send button includes visible text");
        await draft.fill("Show widgets"); await draft.press("Enter");
        await chat.getByRole("button", { name: "Stop response", exact: true }).click();
        const stopped = chat.locator('.ai-chat-reply[data-status="stopped"]');
        await stopped.waitFor({ state: "visible" });
        const snapshot = await stopped.textContent();
        // Covers the text tick and delayed widget callback; stopping must leave both unchanged.
        await page.waitForTimeout(900);
        ensure(await stopped.textContent() === snapshot && await chat.locator(".ai-chat-widget-reveal").count() === 0, "Stop allows later text or widgets to arrive");
        await draft.fill("Show widgets"); await draft.press("Enter");
        await chat.getByRole("button", { name: "Stop response", exact: true }).waitFor({ state: "visible" });
        await chat.getByRole("button", { name: "Reset chat", exact: true }).click();
        await page.waitForTimeout(900);
        ensure(await chat.locator(".ai-chat-exchange").count() === 1 && await chat.locator('[data-status="streaming"]').count() === 0 && await chat.locator(".ai-chat-widget-reveal").count() === 0, "Reset retains an old generation");
        ensure(await draft.evaluate(element => element === document.activeElement && element.value === ""), "Reset does not focus an empty composer");
      });

      await check("embedded widget", async () => {
        await page.goto(`${base}/ai/widgets/`, { waitUntil: "networkidle" });
        const iframe = page.locator('iframe[title="Calendar time selection example"]').first();
        await iframe.scrollIntoViewIfNeeded();
        ensure(await iframe.getAttribute("sandbox") === "" && await iframe.getAttribute("referrerpolicy") === "no-referrer", "example iframe lost its sandbox or referrer policy");
        const size = await iframe.boundingBox();
        ensure(size && Math.abs(size.height - 268) < 1 && size.width > 0 && size.x >= -1 && size.x + size.width <= width + 1, `iframe escaped its explicit bounds: ${JSON.stringify(size)}`);
        const choice = iframe.contentFrame().getByRole("radio").nth(1);
        await choice.check(); ensure(await choice.isChecked(), "native embedded choice does not work inside the sandbox");
      });

      await check("audio and transcript", async () => {
        const preview = await visit("audio-player");
        await page.waitForFunction(() => Number.isFinite(document.querySelector(".preview-box audio")?.duration));
        const media = preview.locator("audio");
        ensure(await media.evaluate(element => element.paused), "audio starts without a playback action");
        ensure(Math.abs(await media.evaluate(element => element.duration) - 8) < 0.1, "generated audio bytes did not decode as the eight-second example");
        await preview.getByRole("button", { name: "Forward 3 seconds", exact: true }).click();
        ensure(Math.abs(await media.evaluate(element => element.currentTime) - 3) < 0.1, "forward seek does not reach the media element");
        await preview.getByRole("button", { name: "Mute audio", exact: true }).click();
        await preview.getByRole("button", { name: "Play audio", exact: true }).click();
        await preview.getByRole("button", { name: "Pause audio", exact: true }).click();
        ensure(await media.evaluate(element => element.paused && element.muted), "audio controls do not reflect native playback state");
        const transcript = await visit("transcription");
        const phrase = transcript.getByRole("button", { name: /Seek to 0:04, Noor:/ });
        await phrase.focus(); await phrase.press("Enter");
        ensure(await phrase.getAttribute("aria-current") === "true", "transcript seek does not select the matching phrase");
        await transcript.getByText("Selected position: 4s · Transcript data example", { exact: true }).waitFor({ state: "visible" });
      });

      await check("speech input alignment", async () => {
        // Deterministic recognition feedback exercises layout without requesting a microphone.
        await page.addInitScript(() => {
          window.SpeechRecognition = class {
            start() { window.__vlakSpeechInputRecognition = this; this.onstart?.(); }
            stop() { this.onend?.(); }
            abort() {}
          };
        });
        await visit("speech-input");
        for (const selector of [".preview-box", ".ai-component-example"]) {
          const example = page.locator(selector);
          const button = example.getByRole("button", { name: "Start speech input", exact: true });
          await button.waitFor({ state: "visible" });
          const geometry = () => example.evaluate(root => {
            const persona = root.querySelector(".rs-persona").getBoundingClientRect();
            const input = root.querySelector(".rs-speech-input");
            const control = input.querySelector("button").getBoundingClientRect();
            const message = input.querySelector('[role="status"]');
            return { difference: Math.abs(persona.y + persona.height / 2 - control.y - control.height / 2), wrapper: input.getBoundingClientRect().height, control: control.height, empty: !message.textContent, margin: Number.parseFloat(getComputedStyle(message).marginTop), messageHeight: message.getBoundingClientRect().height };
          });
          const idle = await geometry();
          ensure(idle.difference < 1 && idle.control >= 44 && idle.empty && idle.margin === 0 && Math.abs(idle.wrapper - idle.control) < 1, `${selector} has empty status spacing or a misaligned idle avatar: ${JSON.stringify(idle)}`);
          await button.click();
          await page.evaluate(() => window.__vlakSpeechInputRecognition.onerror?.({ error: "not-allowed" }));
          await example.getByRole("status").getByText("Microphone permission was denied. Allow access and try again.", { exact: true }).waitFor({ state: "visible" });
          const feedback = await geometry();
          ensure(feedback.difference < 1 && feedback.margin > 0 && feedback.messageHeight > 0, `${selector} moves the avatar when speech feedback appears: ${JSON.stringify(feedback)}`);
        }
      });

      if (width === 1280) {
        await check("voice activation", async () => {
          await page.addInitScript(() => {
            window.__vlakCaptureRequests = 0;
            const devices = navigator.mediaDevices;
            if (devices?.getUserMedia) {
              const original = devices.getUserMedia.bind(devices);
              Object.defineProperty(devices, "getUserMedia", { configurable: true, value: (...args) => { window.__vlakCaptureRequests++; return original(...args); } });
            }
            const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (Recognition?.prototype.start) {
              const start = Recognition.prototype.start;
              Recognition.prototype.start = function (...args) { window.__vlakCaptureRequests++; return start.apply(this, args); };
            }
          });
          for (const name of ["mic-selector", "speech-input"]) {
            const preview = await visit(name);
            await preview.waitFor({ state: "visible" });
            ensure(await page.evaluate(() => window.__vlakCaptureRequests) === 0, `${name} starts capture on mount`);
          }
        });

        await check("optional renderers", async () => {
          const markdown = await visit("response-markdown");
          await markdown.locator(".katex").first().waitFor({ state: "visible" });
          await markdown.locator('.rs-highlighted-code[data-highlighted="true"]').first().waitFor({ state: "visible" });
          const diagram = page.locator(".ai-component-example .rs-response-markdown-diagram").first();
          const checklist = await page.locator(".ai-component-example .rs-response-markdown-list").first().evaluate(list => ({ height: list.getBoundingClientRect().height, rows: [...list.children].reduce((sum, row) => sum + row.getBoundingClientRect().height, 0) }));
          ensure(checklist.height <= checklist.rows + 32, `Markdown preserves structural newlines as blank checklist rows: ${JSON.stringify(checklist)}`);
          await diagram.locator(".rs-response-markdown-diagram-art svg").waitFor({ state: "visible", timeout: 20_000 });
          await diagram.getByRole("button", { name: "Zoom in diagram", exact: true }).click();
          ensure((await diagram.getByRole("button", { name: "Reset diagram zoom", exact: true }).textContent()).includes("125%"), "loaded Mermaid diagram does not zoom");
          const code = await visit("highlighted-code");
          await code.locator('.rs-highlighted-code[data-highlighted="true"]').waitFor({ state: "visible" });
          const jsx = await visit("jsx-preview");
          await jsx.getByText("3 findings are ready for review.", { exact: true }).waitFor({ state: "visible" });
          await jsx.getByRole("button", { name: "Show details", exact: true }).click();
          await jsx.getByText("This registered component owns its local controls.", { exact: true }).waitFor({ state: "visible" });
          await jsx.getByRole("button", { name: "Invalid expression", exact: true }).click();
          await jsx.getByRole("alert").waitFor({ state: "visible" });
          await jsx.getByRole("button", { name: "Complete", exact: true }).click();
          await jsx.getByText("3 findings are ready for review.", { exact: true }).waitFor({ state: "visible" });
          ensure(await jsx.getByRole("alert").count() === 0, "valid JSX does not recover from a rejected expression");
        });
      }
    } finally {
      page.off("pageerror", errorHandler);
      await page.close();
    }
  }
}
