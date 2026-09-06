import type { VlakComponent } from "./schema";

export const healthRings: VlakComponent[] = [{
  name: "activity-rings",
  title: "Activity rings",
  description: "Shows one to six personal goals as concentric rings with named progress, units, and explicit missing-data states.",
  category: "health",
  classes: ["rs-activity-rings", "rs-activity-rings-caption", "rs-activity-rings-body", "rs-activity-rings-graphic", "rs-activity-rings-track", "rs-activity-rings-arc", "rs-activity-rings-list", "rs-activity-rings-item", "rs-activity-rings-index", "rs-activity-rings-label", "rs-activity-rings-value", "rs-activity-rings-target", "rs-activity-rings-note", "rs-activity-rings-description", "rs-activity-rings-progress"],
  css: ["components/activity-rings.css"],
  react: "components/activity-rings.tsx",
  registryDependencies: [],
  snippet: '<figure class="rs-activity-rings"><figcaption class="rs-activity-rings-caption">Daily activity</figcaption><div class="rs-activity-rings-body"><svg class="rs-activity-rings-graphic" viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(-90 100 100)"><circle class="rs-activity-rings-track" cx="100" cy="100" r="88" stroke-width="14"/><circle class="rs-activity-rings-arc" cx="100" cy="100" r="88" stroke-width="14" pathLength="100" stroke-dasharray="60 100"/></g></svg><ol class="rs-activity-rings-list" aria-label="Daily activity, outer ring first"><li class="rs-activity-rings-item"><span class="rs-activity-rings-index" aria-hidden="true">01</span><div><p class="rs-activity-rings-label">Walking</p><p class="rs-activity-rings-value">18 <span class="rs-activity-rings-target">of 30 minutes</span></p><progress class="rs-activity-rings-progress" value="18" max="30" aria-label="Walking, ring 1" aria-valuetext="18 of 30 minutes">18 of 30 minutes</progress></div></li></ol></div></figure>',
  example: 'import { ActivityRings } from "@noorddev/vlak-react";\n\n<ActivityRings label="Daily activity" goals={[\n  { id: "walk", label: "Walking", current: 18, target: 30, unit: "minutes" },\n  { id: "move", label: "Movement breaks", current: 5, target: 8, unit: "breaks" },\n  { id: "stand", label: "Standing", current: 7, target: 10, unit: "hours" },\n]} description="Personal targets, supplied by your application" />',
  usage: { use: ["One activity ring or a compact set of personal movement, routine, or wellness goals.", "Supply goals in outer-to-inner order, with unique ids, labels, amounts, targets, and units.", "Pair with ActivityGoal for a linear progress view of the same data."], avoid: ["Deriving a readiness score, calorie prescription, or recommended target.", "Treating an unrecorded amount as zero. More than six goals retain their text records without a ring graphic."] },
  keyboard: [],
  a11y: ["Every valid goal has a named native progress element and an explicit amount, target, and unit.", "Concentric geometry is decorative. Visible numbering and outer-to-inner order connect the rings with their text records without relying on hue.", "Zero stays empty, amounts above target retain their actual value, and missing or invalid data has no progress arc.", "The figure forwards its native attributes and ref. Static rings have no animation or extra tab stops and remain visible in forced colors."],
  aliases: ["Activity ring", "Fitness rings", "Goal rings", "Move rings", "Wellness progress", "Concentric progress"],
}];
