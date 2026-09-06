export const duration = 40;
export const prompt = "Build me a quick agent management interface using Vlak.";
export const response =
	"I’ll build a task queue, live agent status, and review controls. Here’s your interface.";
export const beats = Object.freeze({
	typeStart: 0.7,
	typeEnd: 3.9,
	send: 4.6875,
	reply: 6.5625,
	replyEnd: 8.45,
	construct: 9.375,
	assembled: 13.125,
	tourEnd: 31.875,
	payoff: 31.875,
	resolve: 37.5,
});
// Two complete light/dark cycles across the whole payoff, shared with Cuelume.
export const themeChanges = Object.freeze([
	{ time: 31.875, theme: "dark" },
	{ time: 32.4375, theme: "light" },
	{ time: 33, theme: "dark" },
	{ time: 33.5625, theme: "light" },
]);
export const themeAt = (time) =>
	themeChanges.filter((change) => time >= change.time).at(-1)?.theme ?? "light";
const mapping = [
	{ film: 9.375, source: 0 },
	{ film: 13.125, source: 8.15 },
	{ film: 31.875, source: 33 },
	{ film: 35, source: 36 },
	{ film: 40, source: 40 },
];
function map(value, from, to) {
	for (let i = 1; i < mapping.length; i++) {
		const a = mapping[i - 1],
			b = mapping[i];
		if (value <= b[from])
			return (
				a[to] +
				Math.max(0, (value - a[from]) / (b[from] - a[from])) * (b[to] - a[to])
			);
	}
	return mapping.at(-1)[to];
}
export const storyToSource = (time) => map(time, "film", "source");
export const sourceToStory = (time) => map(time, "source", "film");
