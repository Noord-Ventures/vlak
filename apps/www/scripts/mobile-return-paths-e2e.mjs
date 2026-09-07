import assert from "node:assert/strict";

export async function checkMobileReturnPaths({ page, base, fail }) {
  const press = async control => { await control.press("Enter"); await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); };
  const open = async slug => {
    await page.goto(`${base}/interfaces/${slug}/`, { waitUntil: "networkidle" });
    await page.waitForFunction(selector => { const button = document.querySelector(`${selector} button`); return button && Object.keys(button).some(key => key.startsWith("__reactProps")); }, slug === "room" ? ".tc" : ".fo");
  };
  try {
    await open("room");
    const chat = page.locator(".tc");
    const create = chat.getByRole("button", { name: "New channel", exact: true });
    await press(create);
    await chat.getByRole("textbox", { name: "Channel name", exact: true }).fill("draft-channel");
    await press(chat.getByRole("button", { name: "Cancel new channel", exact: true }));
    assert.equal(await chat.getAttribute("data-screen"), "channels", "Cancel must return to the channel list that opened creation");
    assert.equal(await create.evaluate(element => document.activeElement === element), true);
    await press(chat.locator('[data-channel="studio"]'));
    await press(chat.locator('[data-message="s1"] .tc-open-thread'));
    await chat.getByRole("textbox", { name: "Reply in thread", exact: true }).fill("Keep this reply while creating another channel.");
    await press(create);
    await press(chat.getByRole("button", { name: "Cancel new channel", exact: true }));
    assert.equal(await chat.getAttribute("data-screen"), "thread", "Cancel must restore the originating thread");
    assert.equal(await chat.getByRole("textbox", { name: "Reply in thread", exact: true }).inputValue(), "Keep this reply while creating another channel.");
    assert.equal(await create.evaluate(element => document.activeElement === element), true);
    await press(chat.getByRole("button", { name: "Back to channel", exact: true }));
    await press(chat.getByRole("button", { name: "Channel details", exact: true }));
    await press(chat.getByRole("button", { name: "Back to channel", exact: true }));
    assert.equal(await chat.getAttribute("data-screen"), "chat");
  } catch (error) { fail(`Team chat mobile return paths: ${error.message}`); }
  try {
    await open("evening");
    const food = page.locator(".fo");
    await press(food.getByRole("button", { name: "Open Joe's Kitchen menu", exact: true }));
    const bag = food.getByRole("navigation", { name: "Food sections" }).getByRole("button", { name: /^Bag/ });
    await press(bag);
    await press(bag);
    await press(food.getByRole("button", { name: "Back", exact: true }));
    assert.equal(await food.getAttribute("data-view"), "menu", "Repeatedly choosing the active Bag tab must not insert duplicate history");
    assert.equal(await food.getAttribute("data-page"), "menu");
    assert.equal(await food.getByRole("heading", { name: "Joe's Kitchen", exact: true }).isVisible(), true);
  } catch (error) { fail(`Food mobile return paths: ${error.message}`); }
}
