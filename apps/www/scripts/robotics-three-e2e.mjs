import assert from "node:assert/strict";

/** Articulated geometry and local confirmation, run on the runner's current viewport. */
export async function checkRoboticsThree({ page, base, fail }) {
  const activate = async locator => { await locator.press("Enter"); await page.waitForTimeout(50); };
  try {
    await page.goto(`${base.replace(/\/$/, "")}/interfaces/robotics/`, { waitUntil: "networkidle" });
    if (page.viewportSize()?.width === 1024) await page.addStyleTag({ content: ".if-specimen { width: 620px; max-width: 100%; }" });
    const board = page.locator(".rb"), scene = board.locator(".rb-scene"), canvas = scene.locator('canvas[data-renderer="three"]');
    await page.waitForFunction(() => document.querySelector(".rb-scene")?.getAttribute("data-status") === "ready");
    await scene.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !!document.querySelector(".rb-scene canvas")?.getAttribute("data-tip"));
    const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduced) assert.equal(await board.getAttribute("data-running"), "false", "reduced motion auto-plays the arm");
    else {
      const before = await canvas.getAttribute("data-tip");
      await page.waitForTimeout(300);
      assert.notEqual(await canvas.getAttribute("data-tip"), before, "running arm does not articulate");
      await activate(board.getByRole("button", { name: "Pause", exact: true }));
    }
    const paused = await canvas.getAttribute("data-tip");
    await page.waitForTimeout(180);
    assert.equal(await canvas.getAttribute("data-tip"), paused, "paused geometry still moves");
    await activate(board.getByRole("button", { name: "Step", exact: true }));
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    assert.notEqual(await canvas.getAttribute("data-tip"), paused, "manual sample does not reach the mechanism");
    const select = async (name, option) => { const trigger = board.getByRole("combobox", { name, exact: true }); await activate(trigger); const labels = await page.getByRole("option").allTextContents(); const index = labels.findIndex(label => label.trim() === option); assert.ok(index >= 0, `Missing option ${option}`); await trigger.press("Home"); for (let i = 0; i < index; i++) await trigger.press("ArrowDown"); await activate(trigger); };
    await select("Playback speed", "2×");
    assert.equal(await board.getAttribute("data-speed"), "2");
    await select("Arm viewpoint", "Front");
    await scene.scrollIntoViewIfNeeded(); await page.waitForTimeout(80);
    assert.equal(await canvas.getAttribute("data-view"), "front", "viewpoint never reaches the camera");
    await activate(board.getByRole("button", { name: "Zoom in arm", exact: true }));
    await scene.scrollIntoViewIfNeeded(); await page.waitForTimeout(80);
    assert.equal(await canvas.getAttribute("data-zoom"), "1.15");
    await activate(board.getByRole("button", { name: "Show sample path", exact: true }));
    await scene.scrollIntoViewIfNeeded(); await page.waitForTimeout(80);
    assert.equal(await canvas.getAttribute("data-path"), "true");
    await activate(board.getByRole("button", { name: "Close gripper", exact: true }));
    await scene.scrollIntoViewIfNeeded(); await page.waitForTimeout(80);
    assert.equal(await canvas.getAttribute("data-aperture"), "0", "gripper control does not move the fingers");
    const monitor = async () => { const back = board.getByRole("button", { name: "Back to monitor", exact: true }); if (await back.isVisible()) await activate(back); await scene.scrollIntoViewIfNeeded(); await page.waitForTimeout(90); };
    const elbowBefore = await canvas.getAttribute("data-elbow");
    const shoulderBefore = await canvas.getAttribute("data-shoulder"), wristBefore = await canvas.getAttribute("data-wrist");
    await activate(board.locator(".rb-joint-row").filter({ hasText: "Elbow" }));
    const editor = board.getByRole("spinbutton", { name: "Elbow draft target (deg)", exact: true });
    await editor.fill("-25"); await editor.press("Tab");
    await monitor();
    assert.equal(await canvas.getAttribute("data-elbow"), elbowBefore, "draft edits changed solid geometry");
    assert.equal(await canvas.getAttribute("data-draft"), "true", "valid draft has no distinct preview");
    await activate(board.locator(".rb-joint-row").filter({ hasText: "Elbow" }));
    await activate(board.getByRole("button", { name: "Request targets", exact: true }));
    assert.equal(await canvas.getAttribute("data-elbow"), elbowBefore, "unconfirmed request changed solid geometry");
    await activate(board.getByRole("button", { name: "Confirm simulation", exact: true }));
    await monitor();
    assert.equal(await canvas.getAttribute("data-elbow"), "-25.000", "confirmed record does not match actual elbow transform");
    assert.equal(await canvas.getAttribute("data-draft"), "false", "applied target retains draft ghost");
    assert.equal(await canvas.getAttribute("data-shoulder"), shoulderBefore, "confirming the elbow moved an unrequested shoulder joint");
    assert.equal(await canvas.getAttribute("data-wrist"), wristBefore, "confirming the elbow moved an unrequested wrist joint");
    const [x, y, z] = (await canvas.getAttribute("data-tip")).split(",").map(Number);
    const readout = await board.locator(".rb-tip").textContent();
    const displayed = [...readout.matchAll(/-?\d+\.\d+/g)].map(match => Number(match[0]));
    assert.equal(displayed.length, 3);
    [x, y, z].forEach((value, index) => { assert.ok(Math.abs(value - displayed[index]) <= .0006, "tool readout disagrees with wrist world transform beyond its displayed precision"); });
    await activate(board.getByRole("button", { name: "Debug", exact: true }));
    await activate(board.getByRole("button", { name: "Alarms", exact: true }));
    await activate(board.getByRole("button", { name: /Acknowledge.*Sample camera unavailable/ }));
    assert.equal(await canvas.getAttribute("data-camera"), "false", "acknowledgement restores a failed camera");
    await activate(board.getByRole("button", { name: "Restore sample camera", exact: true }));
    await monitor();
    assert.equal(await canvas.getAttribute("data-camera"), "true", "camera restoration does not enable scan geometry");
    // Context loss must preserve the native joint editor and recover one canvas.
    const lost = await canvas.evaluate(element => { const gl = element.getContext("webgl2"); const extension = gl?.getExtension("WEBGL_lose_context"); if (!extension) return false; extension.loseContext(); return true; });
    if (lost) {
      await board.getByRole("button", { name: "Retry 3D view", exact: true }).waitFor();
      assert.equal(await board.locator(".rb-joint-row").count(), 3);
      await activate(board.getByRole("button", { name: "Retry 3D view", exact: true }));
      await page.waitForFunction(() => document.querySelector(".rb-scene")?.getAttribute("data-status") === "ready");
      assert.equal(await scene.locator("canvas").count(), 1, "renderer recovery leaked a canvas");
      await scene.scrollIntoViewIfNeeded(); await page.waitForTimeout(100);
      assert.equal(await canvas.getAttribute("data-elbow"), "-25.000", "renderer recovery reset the confirmed arm pose");
    }
    const size = await board.evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
    assert.ok(size.scroll <= size.width + 1, "robot workspace overflows horizontally");
  } catch (error) { fail(`Robotics Three scene: ${error instanceof Error ? error.message : String(error)}`); }
}
