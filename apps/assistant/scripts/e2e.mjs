// Run only against AI_REFERENCE_MODE=fixture: AI_REFERENCE_BASE=http://localhost:3211 pnpm e2e
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const base = process.env.AI_REFERENCE_BASE || "http://localhost:3211";
const artifacts = resolve(process.env.AI_REFERENCE_ARTIFACTS || "/tmp/vlak-assistant-e2e");
mkdirSync(artifacts, { recursive: true });
const failures = []; const passed = [];
const ensure = (value, message) => { if (!value) throw new Error(message); };
const tool = (message, name) => message.parts.find(part => part.type === `tool-${name}` || (part.type === "dynamic-tool" && part.toolName === name));
const text = message => message.parts.filter(part => part.type === "text").map(part => part.text).join("\n");
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || chromium.executablePath() });

try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: "reduce", acceptDownloads: true });
    const page = await context.newPage(); page.setDefaultTimeout(15_000);
    let current = "startup";
    const pageError = error => failures.push(`${width}px ${current}: browser error ${error.message}`);
    page.on("pageerror", pageError);
    const check = async (name, run) => {
      current = name;
      try { await run(); const result = `${width}px ${name}`; passed.push(result); console.log(`Passed ${result}`); }
      catch (error) { const message = `${width}px ${name}: ${error.message}`; failures.push(message); console.error(message); await page.screenshot({ path: `${artifacts}/failure-${width}-${name.replace(/\W+/g, "-")}.png`, fullPage: true }).catch(() => {}); throw error; }
    };
    const settled = async () => {
      await page.waitForFunction(() => document.querySelector('.rs-message-composer[aria-busy="false"]') !== null);
      const alerts = await page.getByRole("alert").evaluateAll(nodes => nodes.filter(node => node.id !== "__next-route-announcer__").map(node => node.textContent.trim()).filter(Boolean));
      ensure(alerts.length === 0, `application reports an error: ${alerts.join("; ")}`);
    };
    const conversationId = () => new URL(page.url()).searchParams.get("conversation");
    const stored = async () => {
      const response = await context.request.get(`${base}/api/conversations/${conversationId()}`);
      ensure(response.ok(), `cannot read persisted conversation (${response.status()})`);
      return (await response.json()).conversation;
    };
    const submit = async prompt => {
      const response = page.waitForResponse(result => result.url().endsWith("/api/chat") && result.request().method() === "POST");
      const input = page.getByRole("textbox", { name: "Message", exact: true });
      await input.fill(prompt); await input.press("Enter");
      const started = await response; ensure(started.ok(), `chat request failed (${started.status()})`);
      await settled();
    };
    const create = async () => {
      const previous = conversationId();
      await page.getByRole("button", { name: "New conversation", exact: true }).click();
      await page.waitForFunction(id => new URL(location.href).searchParams.get("conversation") !== id, previous);
      await settled(); return conversationId();
    };
    const accessible = async state => {
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }));
      for (const violation of result.violations) failures.push(`${width}px ${state}: axe ${violation.id}: ${violation.nodes.map(node => node.target.join(" ")).join(", ")}`);
      const overflow = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      ensure(overflow.content <= overflow.viewport + 1, `${state} overflows horizontally: ${JSON.stringify(overflow)}`);
    };
    const layout = async () => {
      const result = await page.evaluate(() => {
        const shell = document.querySelector(".assistant-shell"); const heading = document.querySelector(".assistant-heading");
        const outer = shell.getBoundingClientRect(); const header = heading.getBoundingClientRect(); const border = getComputedStyle(shell);
        const actions = [...heading.querySelector(".assistant-tools").children].map(element => element.getBoundingClientRect());
        const textBounds = [...document.querySelectorAll(".assistant-history nav button")].map(button => {
          const box = button.getBoundingClientRect(); const style = getComputedStyle(button); const range = document.createRange(); range.selectNodeContents(button); const text = range.getBoundingClientRect();
          return { label: button.textContent, fits: box.height >= 44 && text.left >= box.left + Number.parseFloat(style.paddingLeft) - 1 && text.right <= box.right - Number.parseFloat(style.paddingRight) + 1 && text.top >= box.top + Number.parseFloat(style.paddingTop) - 1 && text.bottom <= box.bottom - Number.parseFloat(style.paddingBottom) + 1 };
        });
        return { left: Math.abs(header.left - outer.left - Number.parseFloat(border.borderLeftWidth)), right: Math.abs(outer.right - header.right - Number.parseFloat(border.borderRightWidth)), actionGap: Math.abs(actions[0].top - actions[1].top) < 2 ? actions[1].left - actions[0].right : actions[1].top - actions[0].bottom, textBounds };
      });
      ensure(result.left <= 1 && result.right <= 1, `header divider is not flush with the shell: ${JSON.stringify(result)}`);
      ensure(result.actionGap >= 15, `header actions have insufficient separation: ${result.actionGap}px`);
      ensure(result.textBounds.every(item => item.fits), `history labels overflow their padded controls: ${JSON.stringify(result.textBounds)}`);
    };
    try {
      await check("fixture startup and keyboard access", async () => {
        await page.goto(base, { waitUntil: "networkidle" });
        const configuration = await context.request.get(`${base}/api/conversations`);
        ensure(configuration.ok() && (await configuration.json()).mode === "fixture", "refusing to send prompts unless the server explicitly reports fixture mode");
        await page.waitForFunction(() => new URL(location.href).searchParams.has("conversation"));
        await settled();
        await page.keyboard.press("Tab");
        ensure(await page.getByRole("link", { name: "Skip to conversation", exact: true }).evaluate(element => element === document.activeElement), "skip link is not the first keyboard stop");
        await page.keyboard.press("Enter");
        ensure(await page.locator("#assistant-main").evaluate(element => element === document.activeElement), "skip link does not focus the main conversation");
        await layout();
        await accessible("empty conversation");
      });

      let original; let initialVersion;
      const firstPrompt = `Review the launch brief for browser ${width}.`;
      await check("stream, tools and saved conversation", async () => {
        await submit(firstPrompt);
        original = await stored();
        ensure(original.messages.every(message => typeof message.id === "string" && message.id.length > 0) && new Set(original.messages.map(message => message.id)).size === original.messages.length, "saved messages do not have distinct, nonempty IDs for edit and regeneration");
        ensure(original.messages.some(message => message.role === "user" && text(message) === firstPrompt), "the submitted request is not persisted");
        ensure(original.messages.some(message => tool(message, "readBrief")?.state === "output-available"), "the brief tool did not execute and persist");
        ensure(original.messages.some(message => tool(message, "projectWidget")?.state === "output-available"), "the project widget tool did not execute and persist");
        ensure(original.messages.some(message => message.role === "assistant" && text(message).includes("The brief is the source")), "the streamed answer did not finish and persist");
        await page.getByRole("button", { name: "View integration example", exact: true }).click();
        const iframe = page.locator('iframe[title="Example provider project widget"]');
        await iframe.waitFor(); ensure(await iframe.getAttribute("sandbox") === "", "provider widget iframe lost its sandbox");
        await page.reload({ waitUntil: "networkidle" }); await settled();
        const reloaded = await stored();
        ensure(JSON.stringify(reloaded.messages) === JSON.stringify(original.messages), "reload changes saved messages");
        await page.getByRole("button", { name: "Edit request", exact: true }).waitFor();
        await layout();
        await accessible("completed conversation");
        await page.screenshot({ path: `${artifacts}/conversation-${width}.png`, fullPage: true });
      });

      await check("edit, regenerate and restore earlier version", async () => {
        await page.getByRole("button", { name: "Edit request", exact: true }).first().click();
        const revision = `Review the launch brief with emphasis on accessibility ${width}.`;
        await page.getByRole("textbox", { name: "Edit your request", exact: true }).fill(revision);
        await page.getByRole("button", { name: "Save and send", exact: true }).click(); await settled();
        const edited = await stored();
        ensure(edited.messages.some(message => message.role === "user" && text(message) === revision), "edited request was not persisted");
        ensure(edited.versions.length > 0, "editing lost the previous conversation version");
        initialVersion = edited.versions[0].id;
        await page.getByRole("button", { name: "Regenerate", exact: true }).last().click(); await settled();
        const regenerated = await stored();
        ensure(regenerated.versions.length > edited.versions.length, "regeneration does not preserve its previous version");
        ensure(regenerated.messages.some(message => message.role === "assistant" && text(message).includes("The brief is the source")), "regenerated answer is incomplete");
        await page.getByRole("combobox", { name: "Earlier versions", exact: true }).selectOption(initialVersion);
        await page.getByRole("button", { name: "Restore version", exact: true }).click(); await settled();
        ensure(JSON.stringify((await stored()).messages) === JSON.stringify(original.messages), "restoring the saved version does not recover the original messages");
        await page.reload({ waitUntil: "networkidle" }); await settled();
        ensure((await stored()).messages.some(message => text(message) === firstPrompt), "restored version does not survive reload");
      }).catch(() => {});

      await check("stop, persist partial output and resume work", async () => {
        await create();
        const input = page.getByRole("textbox", { name: "Message", exact: true });
        await input.fill("[slow] Review the launch brief."); await input.press("Enter");
        await page.waitForFunction(() => [...document.querySelectorAll(".assistant-message .rs-response-markdown")].some(element => element.textContent.includes("Start with")));
        await page.getByRole("button", { name: "Stop response", exact: true }).click();
        await settled();
        const stopped = await stored(); const reply = stopped.messages.findLast(message => message.role === "assistant");
        ensure(reply?.metadata?.outcome === "stopped" && text(reply).length > 0, "Stop did not preserve partial output as stopped");
        const snapshot = JSON.stringify(stopped.messages);
        await page.waitForTimeout(300);
        ensure(JSON.stringify((await stored()).messages) === snapshot, "server keeps changing the conversation after Stop");
        await page.reload({ waitUntil: "networkidle" }); await settled();
        ensure(JSON.stringify((await stored()).messages) === snapshot, "stopped response does not survive reload");
        await submit("Review the launch brief again.");
        ensure(text((await stored()).messages.findLast(message => message.role === "assistant")).includes("The brief is the source"), "new work cannot complete after Stop releases the conversation");
      }).catch(() => {});

      await check("retry a saved response after a dropped connection", async () => {
        await create();
        const prompt = `Review the launch brief after a connection drop ${width}.`;
        await page.route("**/api/chat", async route => { await route.fetch(); await route.abort("failed"); }, { times: 1 });
        const input = page.getByRole("textbox", { name: "Message", exact: true });
        await input.fill(prompt); await input.press("Enter");
        const retry = page.getByRole("button", { name: "Retry response", exact: true }); await retry.waitFor();
        await page.waitForFunction(() => document.querySelector('.rs-message-composer[aria-busy="false"]') !== null);
        const saved = await stored();
        ensure(saved.messages.filter(message => message.role === "user" && text(message) === prompt).length === 1 && text(saved.messages.findLast(message => message.role === "assistant")).includes("The brief is the source"), "connection-drop fixture did not preserve the completed server response");
        ensure(await input.inputValue() === prompt, "failed transport loses the retained draft before retry");
        const resumed = page.waitForResponse(response => response.url().endsWith("/api/chat") && response.request().method() === "POST");
        await retry.click(); ensure((await resumed).ok(), "retry request failed"); await settled();
        const retried = await stored();
        ensure(retried.messages.filter(message => message.role === "user" && text(message) === prompt).length === 1, "retry duplicates an already-saved user turn");
        ensure(text(retried.messages.findLast(message => message.role === "assistant")).includes("The brief is the source"), "retried response did not finish");
        ensure(await input.inputValue() === "", "successful retry leaves the submitted draft in the composer");
      }).catch(() => {});

      await check("upload and saved attachment", async () => {
        await create();
        const name = `review-${width}.txt`; const content = `Browser fixture ${width}: verify keyboard navigation before launch.`;
        await page.locator('input[type="file"]').setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from(content) });
        await page.getByRole("button", { name: `Remove ${name}`, exact: true }).waitFor();
        await submit("Review the attached source file.");
        const conversation = await stored();
        const file = conversation.messages.flatMap(message => message.parts).find(part => part.type === "file" && part.filename === name);
        ensure(file && /^\/api\/uploads\//.test(file.url), "uploaded file was not attached as an owned server URL");
        const response = await context.request.get(new URL(file.url, base).href);
        ensure(response.ok() && await response.text() === content, "uploaded bytes were not saved faithfully");
        await page.reload({ waitUntil: "networkidle" }); await settled();
        await page.getByRole("link", { name, exact: true }).waitFor();
        await accessible("uploaded conversation");
      }).catch(() => {});

      await check("approval, denial and persistent tasks", async () => {
        await create();
        await submit("Create a task to review the launch checklist.");
        const approve = page.getByRole("button", { name: "Approve task", exact: true }); await approve.waitFor();
        let conversation = await stored();
        ensure(conversation.tasks.length === 0 && conversation.messages.some(message => tool(message, "createTask")?.state === "approval-requested"), "a task was written before approval");
        ensure(await page.getByRole("textbox", { name: "Message", exact: true }).isDisabled(), "composer accepts new work while an approval is pending");
        await accessible("pending approval");
        await approve.focus(); await page.keyboard.press("Enter"); await settled();
        conversation = await stored();
        ensure(conversation.tasks.length === 1 && conversation.tasks[0].title === "Review the launch checklist", "approval did not create exactly one task");
        const savedTask = conversation.tasks[0].id;
        await page.getByRole("region", { name: "Saved tasks", exact: true }).getByText("Review the launch checklist", { exact: true }).waitFor();
        await page.reload({ waitUntil: "networkidle" }); await settled();
        ensure((await stored()).tasks.length === 1 && (await stored()).tasks[0].id === savedTask, "reload duplicates or loses an approved task");
        await submit("Create another task for the launch checklist.");
        await page.getByRole("button", { name: "Reject task", exact: true }).click(); await settled();
        conversation = await stored();
        ensure(conversation.tasks.length === 1 && conversation.tasks[0].id === savedTask, "rejecting a task still writes one");
        ensure(conversation.messages.some(message => text(message).includes("No task was created")), "the assistant does not explain the denied task honestly");
        await page.reload({ waitUntil: "networkidle" }); await settled();
        ensure((await stored()).tasks.length === 1, "denied task is written after reload");
        await accessible("approved and denied tasks");
        await page.screenshot({ path: `${artifacts}/tasks-${width}.png`, fullPage: true });
      });
    } catch { /* A dependent scenario stops for this isolated session; the other viewport still runs. */ }
    finally { page.off("pageerror", pageError); await context.close(); }
  }
} finally { await browser.close(); }
writeFileSync(`${artifacts}/report.json`, JSON.stringify({ passed, failures }, null, 2));
console.log(JSON.stringify({ passed, failures, artifacts }, null, 2));
if (failures.length) process.exitCode = 1;
