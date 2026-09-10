import { test } from "node:test";
import assert from "node:assert/strict";
import { playReply } from "../app/ai/reply-sequence.ts";
import { filterAiPageGroups } from "../lib/ai-catalog-search.ts";

const searchGroups = [
  { title: "Conversation", pages: [{ title: "Message composer", href: "/components/message-composer", description: "Prompt field with attachments", aliases: ["PromptInput"] }] },
  { title: "Voice", pages: [{ title: "Speech input", href: "/ai/speech-input", description: "Dictation and recorded audio", aliases: ["SpeechInput"] }] },
];

test("AI discovery matches API aliases, spaced names, punctuation, and multiple features", () => {
  for (const query of ["PromptInput", "prompt input", "prompt-input", "PROMPT_INPUT", "prompt attachments"]) {
    assert.deepEqual(filterAiPageGroups(searchGroups, query), [searchGroups[0]]);
  }
  assert.deepEqual(filterAiPageGroups(searchGroups, "voice dictation"), [searchGroups[1]]);
  assert.deepEqual(filterAiPageGroups(searchGroups, "SpeechInput"), [searchGroups[1]]);
  assert.deepEqual(filterAiPageGroups(searchGroups, "prompt dictation"), []);
});

test("clearing the AI filter restores the complete catalogue in its original order", () => {
  assert.equal(filterAiPageGroups(searchGroups, ""), searchGroups);
  assert.equal(filterAiPageGroups(searchGroups, "   "), searchGroups);
  assert.deepEqual(filterAiPageGroups(searchGroups, "unknown-feature"), []);
  assert.equal(searchGroups[0].pages.length, 1);
});

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
