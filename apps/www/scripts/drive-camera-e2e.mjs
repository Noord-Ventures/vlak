import assert from "node:assert/strict";

/** Watch the rendered camera while the real mode controls change and interrupt a view. */
export async function checkDriveCameraTransition({ page, root, scene }) {
  const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const choose = async name => {
    const button = root.locator(".ev-modes").getByRole("button", { name, exact: true });
    await button.focus();
    await button.press("Enter");
    await scene.scrollIntoViewIfNeeded();
  };
  const settled = mode => page.waitForFunction(mode => {
    const scene = document.querySelector(".ev-scene");
    return scene?.dataset.mode === mode && scene.dataset.settled === "true";
  }, mode);
  const begin = () => scene.evaluate(element => {
    const canvas = element.querySelector("canvas");
    const recording = { frames: [], frame: 0 };
    element.__cameraRecording = recording;
    recording.capture = () => {
      const data = element.dataset;
      return {
        time: performance.now(),
        mode: data.mode, settled: data.settled, camera: data.camera.split(",").map(Number),
        span: Number(data.span), fov: Number(data.cameraFov), opacity: Number(data.vehicleOpacity),
        sameCanvas: element.querySelector("canvas") === canvas && element.querySelectorAll("canvas").length === 1,
      };
    };
    const record = () => {
      recording.frames.push(recording.capture());
      recording.frame = requestAnimationFrame(record);
    };
    record();
  });
  const end = () => scene.evaluate(element => {
    const recording = element.__cameraRecording;
    if (!recording) return [];
    cancelAnimationFrame(recording.frame);
    recording.frames.push(recording.capture());
    delete element.__cameraRecording;
    return recording.frames;
  });
  const azimuth = frame => Math.atan2(frame.camera[0], frame.camera[2]);
  const continuous = (frames, label) => {
    assert(frames.length > 3, `${label}: collect intermediate rendered frames`);
    const angles = frames.map(azimuth);
    const angleRange = Math.max(...angles) - Math.min(...angles);
    for (const [index, frame] of frames.entries()) {
      assert(frame.sameCanvas, `${label}: preserve the same live canvas`);
      assert([...frame.camera, frame.span, frame.fov].every(Number.isFinite), `${label}: camera values remain finite`);
      if (!index) continue;
      const previous = frames[index - 1];
      const angleStep = Math.abs(azimuth(frame) - azimuth(previous));
      assert(angleStep < angleRange * .8, `${label}: an orbit must render intermediate angles (step ${angleStep.toFixed(3)}, total ${angleRange.toFixed(3)}, frame gap ${(frame.time - previous.time).toFixed(0)}ms)`);
      assert(Math.abs(frame.fov - previous.fov) < 12, `${label}: perspective opens without a jump`);
      assert(Math.max(frame.span / previous.span, previous.span / frame.span) < 1.6, `${label}: framing changes without a jump`);
    }
  };

  try {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForFunction(() => document.querySelector('.ev-scene-motion')?.disabled === false);
    await settled("vehicle");
    await begin();
    await choose("Journey");
    await settled("journey");
    const journey = await end();
    continuous(journey, "Vehicle to Journey");
    const first = journey[0], last = journey.at(-1);
    assert(journey.some(frame => frame.fov > first.fov + 1 && frame.fov < last.fov - 1), "Journey reveals intermediate perspective");
    assert(journey.some(frame => azimuth(frame) > azimuth(first) + .04 && azimuth(frame) < azimuth(last) - .04), "The side drawing visibly orbits into the rear view");
    for (let index = 1; index < journey.length; index++) {
      assert(journey[index].span >= journey[index - 1].span, "Journey zooms out continuously");
    }

    await begin();
    await choose("Energy");
    await page.waitForFunction(() => {
      const data = document.querySelector(".ev-scene")?.dataset;
      return data?.mode === "energy" && data.settled === "false" && Number(data.vehicleOpacity) < .9 && Number(data.vehicleOpacity) > .25;
    });
    await choose("Vehicle");
    await settled("vehicle");
    const reversed = await end();
    continuous(reversed, "Interrupted Energy orbit");
    assert(reversed.some(frame => frame.mode === "energy" && frame.opacity > 0 && frame.opacity < 1), "Energy starts revealing the assembly before interruption");
    const side = reversed.at(-1);
    assert.equal(side.camera[0], 0, "Returning from an interrupted orbit finishes at a true side view");
    assert.equal(side.camera[1], 1.03, "The side schematic finishes level");
    assert.equal(side.fov, 12);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => document.querySelector('.ev-scene-motion')?.disabled);
    await begin();
    await choose("Energy");
    await settled("energy");
    const snapped = await end();
    assert(snapped.every(frame => frame.sameCanvas), "Reduced motion preserves the live canvas");
    const energy = snapped.filter(frame => frame.mode === "energy");
    assert(energy.length > 0 && energy.every(frame => frame.settled === "true" && frame.opacity === 0), "Reduced motion changes composition without intermediate animation");
    await choose("Vehicle");
    await settled("vehicle");
  } finally {
    await end();
    await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
  }
}
