import { test } from "node:test";
import assert from "node:assert/strict";
import { playReply } from "../app/ai/reply-sequence.ts";

test("widgets follow the introduction one at a time, then complete", t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const events = [];
  playReply({ text: "Here they are", widgetCount: 3, onText: text => events.push(text), onWidget: count => events.push(count), onComplete: () => events.push("complete") });
  t.mock.timers.tick(65);
  t.mock.timers.tick(65);
  assert.deepEqual(events, ["Here they ar", "Here they are"]);
  t.mock.timers.tick(250);
  assert.equal(events.at(-1), 1);
  t.mock.timers.tick(700);
  assert.equal(events.at(-1), 2);
  t.mock.timers.tick(700);
  assert.deepEqual(events.slice(-4), [1, 2, 3, "complete"]);
});

test("stopping after a widget preserves that result and cancels later reveals", t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const events = [];
  const cancel = playReply({ text: "Widgets", widgetCount: 3, onText: text => events.push(text), onWidget: count => events.push(count), onComplete: () => events.push("complete") });
  t.mock.timers.tick(65);
  t.mock.timers.tick(250);
  cancel();
  t.mock.timers.tick(5000);
  assert.deepEqual(events, ["Widgets", 1]);
});

test("resetting during text prevents the old reply from completing over a new one", t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const events = [];
  const cancel = playReply({ text: "An unfinished recorded response", widgetCount: 3, onText: text => events.push(text), onWidget: count => events.push(count), onComplete: () => events.push("old complete") });
  t.mock.timers.tick(65);
  cancel();
  playReply({ text: "New reply", onText: text => events.push(text), onWidget: count => events.push(count), onComplete: () => events.push("new complete") });
  t.mock.timers.tick(65);
  t.mock.timers.tick(5000);
  assert.deepEqual(events, ["An unfinishe", "New reply", "new complete"]);
});
