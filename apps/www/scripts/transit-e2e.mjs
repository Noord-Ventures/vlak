const activate = async control => { await control.page().evaluate(() => new Promise(requestAnimationFrame)); await control.press("Enter"); await control.page().evaluate(() => new Promise(requestAnimationFrame)); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
export async function checkTransit({ page, base, fail }) {
  try {
    await page.goto(`${base}/interfaces/platforms/`, { waitUntil: "networkidle" });
    const root = page.locator(".tr"); await root.waitFor();
    await page.waitForFunction(() => {
      const control = document.querySelector(".tr button");
      return control && Object.keys(control).some(key => key.startsWith("__reactProps"));
    });
    assert(await root.getByRole("button", { name: /^(iOS|Android)$/ }).count() === 0, "The responsive transit app must not expose an OS mode switch");
    const nav = async name => { const mobile = root.locator(".tr-mobile-nav"); await activate((await mobile.isVisible() ? mobile : root.locator(".tr-desktop-nav")).getByRole("button", { name, exact: true })); };
    const choose = async (label, option) => { const control = root.getByRole("combobox", { name: label, exact: true }); await activate(control); const labels = await root.getByRole("option").allTextContents(); const index = labels.findIndex(value => value.trim() === option); assert(index >= 0, `Missing station option ${option}`); await control.press("Home"); for (let step = 0; step < index; step++) await control.press("ArrowDown"); await activate(control); };
    await activate(root.getByRole("button", { name: "Swap stations", exact: true }));
    assert((await root.getByRole("combobox", { name: "From", exact: true }).innerText()).includes("Rotterdam"), "Swap must exchange the actual selected stations");
    await choose("From", "Utrecht Centraal");
    await choose("To", "Utrecht Centraal");
    await activate(root.getByRole("button", { name: "Find routes", exact: true }));
    assert((await root.getByRole("alert").innerText()).includes("different stations"), "Identical stations must not create a fictitious journey");
    await choose("To", "Haarlem");
    await root.getByLabel("Travel date", { exact: true }).fill("2026-09-12");
    await root.getByLabel("Leave after", { exact: true }).fill("11:05");
    await activate(root.getByRole("button", { name: "Find routes", exact: true }));
    assert(await root.locator(".tr-trip").count() === 3, "A normal search must show its three supplied sample options");
    const row = root.locator(".tr-trip").first();
    assert((await row.innerText()).includes("11:05") && (await row.innerText()).includes("11:56"), "Route times must follow the chosen departure and supplied 51-minute duration");
    await activate(row);
    assert((await root.locator(".tr-stops").innerText()).includes("Utrecht Centraal") && (await root.locator(".tr-stops").innerText()).includes("Haarlem"), "Journey detail must retain the exact chosen endpoints");
    assert((await root.locator(".tr-detail-scroll").innerText()).includes("Illustrative, not live departures"), "Timetable provenance must be explicit");
    await activate(root.getByRole("button", { name: "Save journey", exact: true }));
    assert(await root.getByRole("button", { name: "Journey saved", exact: true }).getAttribute("aria-pressed") === "true", "Saving must update the selected journey state");
    await activate(root.getByRole("button", { name: "View your day", exact: true }));
    assert(await root.locator(".tr-trip").count() === 1, "The itinerary must contain the one actually saved journey");
    await activate(root.locator(".tr-trip"));
    await activate(root.getByRole("button", { name: "Your day", exact: true }));
    await page.waitForFunction(element => document.activeElement === element, await root.locator(".tr-trip").elementHandle());
    await root.getByLabel("Itinerary day", { exact: true }).fill("2026-09-13");
    assert(await root.locator(".tr-trip").count() === 0, "The next day must not inherit a journey saved for another date");
    await root.getByLabel("Itinerary day", { exact: true }).fill("2026-09-12");
    assert(await root.locator(".tr-trip").count() === 1, "Returning to its saved date must restore the itinerary");
    await nav("Profile");
    await root.getByRole("textbox", { name: "Display name", exact: true }).fill("Noor");
    await activate(root.getByRole("button", { name: "Save profile", exact: true }));
    assert((await root.locator(".tr-profile-person").innerText()).includes("Noor"), "Saving a profile must display the entered name");
    await activate(root.getByRole("switch", { name: "Direct routes only", exact: true }));
    await nav("Plan");
    assert(await root.locator(".tr-trip").count() === 2, "Direct-only preference must remove the connecting option");
    await choose("From", "Amsterdam Centraal"); await choose("To", "Rotterdam Centraal");
    await root.getByLabel("Leave after", { exact: true }).fill("23:50");
    await activate(root.getByRole("button", { name: "Find routes", exact: true }));
    assert(await root.locator(".tr-trip").count() === 1, "A late search must not silently label next-day departures as the selected day");
    await activate(root.locator(".tr-trip"));
    assert((await root.locator(".tr-journey-times").innerText()).includes("00:34") && (await root.locator(".tr-journey-times").innerText()).includes("+1 day"), "An overnight arrival must show its exact clock time and next-day offset");
    console.log("PASS Transit: station swap/validation, dated route search, exact time/stop details, save/day filtering, focus return, responsive navigation, profile/preferences, overnight arrival");
  } catch (error) { fail("Transit app principal flow", error.message); }
}
