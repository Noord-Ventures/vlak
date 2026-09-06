/** Global film seconds. Contacts are the first arrival, before spring settling. */
export const planningMotionTiming = Object.freeze({
	commit: 25.04,
	typeContact: 25.52,
	motionContact: 25.59,
	settled: 25.7,
});

const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => {
	const p = clamp(value);
	return p ** 3 * (p * (p * 6 - 15) + 10);
};
const smoothVelocity = (value) =>
	value <= 0 || value >= 1 ? 0 : 30 * value ** 2 * (value - 1) ** 2;

// The approach's terminal velocity becomes the spring's initial velocity.
// A finite envelope leaves the DOM exactly at its natural layout at 25.70.
function approach(time, start, contact, end) {
	if (time <= start) return { position: 0, velocity: 0 };
	if (time >= end) return { position: 1, velocity: 0 };
	const speed = 0.36;
	if (time < contact) {
		const duration = contact - start,
			p = (time - start) / duration;
		const tangent = speed * duration;
		const a = 10 - 4 * tangent,
			b = -15 + 7 * tangent,
			c = 6 - 3 * tangent;
		return {
			position: a * p ** 3 + b * p ** 4 + c * p ** 5,
			velocity: (3 * a * p ** 2 + 4 * b * p ** 3 + 5 * c * p ** 4) / duration,
		};
	}
	const elapsed = time - contact,
		duration = end - contact;
	const phase = (elapsed / duration - 0.4) / 0.6;
	const envelope = 1 - smooth(phase);
	const envelopeVelocity = -smoothVelocity(phase) / (duration * 0.6);
	const decay = Math.exp(-20 * elapsed),
		angle = 31 * elapsed;
	const displacement = (speed / 31) * decay * Math.sin(angle);
	const velocity =
		speed * decay * (Math.cos(angle) - (20 / 31) * Math.sin(angle));
	return {
		position: 1 + displacement * envelope,
		velocity: velocity * envelope + displacement * envelopeVelocity,
	};
}

function layoutRect(element) {
	// offset metrics are independent of all ancestor film/camera transforms.
	// Comparing the two cards in this same grid also cancels its scroll offset.
	let x = 0,
		y = 0;
	for (let current = element; current; current = current.offsetParent) {
		x += current.offsetLeft;
		y += current.offsetTop;
	}
	return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

/**
 * A seekable FLIP for the two actual Kanban card elements. Call after the React
 * fixture render and after entry motion, using global film time. `modify` is
 * the film's reversible style recorder; reset its recorded styles each frame.
 * No snapshots, clones, temporary layouts, content edits or persistent state.
 * The paired top slots are measured from the current DOM on every invocation.
 */
export function applyPlanningMotion(host, time, modify) {
	const { commit, typeContact, motionContact, settled } = planningMotionTiming;
	if (!host || !Number.isFinite(time) || time < commit || time >= settled)
		return;
	const board = host.matches?.('[data-film-planning="kanban"]')
		? host
		: host.querySelector('[data-film-planning="kanban"]');
	if (board?.dataset.filmState !== "transferred") return;
	const cards = [...board.querySelectorAll(".rs-kanban-card")];
	const find = (name) =>
		cards.find(
			(card) =>
				card.querySelector(".rs-kanban-title")?.textContent.trim() === name,
		);
	const type = find("Type study"),
		motion = find("Motion study");
	if (!type || !motion) return;
	const typeSlot = layoutRect(type),
		motionSlot = layoutRect(motion);
	if (!typeSlot.width || !motionSlot.width) return;

	// Entry transforms create stacking contexts even after settling. Release
	// them so the real cards can pass across the adjacent column boundaries.
	for (const column of board.querySelectorAll(".rs-kanban-column"))
		modify(column, { transform: "none" });

	const tracks = [
		{
			element: type,
			source: motionSlot,
			target: typeSlot,
			start: 25.11,
			rise: commit,
			contact: typeContact,
			side: -1,
		},
		{
			element: motion,
			source: typeSlot,
			target: motionSlot,
			start: 25.14,
			rise: 25.055,
			contact: motionContact,
			side: 1,
		},
	];
	let room = 0;
	for (const track of tracks) {
		const { element, source, target, start, rise, contact, side } = track;
		const state = approach(time, start, contact, settled);
		const airborne =
			smooth((time - rise) / 0.12) *
			(1 - smooth((time - contact + 0.115) / 0.115));
		room = Math.max(room, airborne);
		const x = (source.x - target.x) * (1 - state.position);
		const y =
			(source.y - target.y) * (1 - state.position) +
			side * target.height * 0.4 * airborne;
		const scale = 1 - 0.3 * airborne;
		const velocity = (target.x - source.x) * state.velocity;
		const angle = Math.max(-0.55, Math.min(0.55, -velocity * 0.00036));
		modify(element, {
			transformOrigin: "50% 50%",
			transform: `translate(${x}px,${y}px) rotate(${angle}deg) scale(${scale})`,
			zIndex: "4",
		});
	}

	// The moving surfaces remain legible in separate lanes. Only the nearby
	// real headings and cards yield a few pixels, then return to canonical CSS.
	for (const column of [
		type.closest(".rs-kanban-column"),
		motion.closest(".rs-kanban-column"),
	]) {
		const heading = column?.querySelector(".rs-kanban-heading");
		if (heading) modify(heading, { transform: `translateY(${-20 * room}px)` });
		const siblings = [...(column?.querySelectorAll(".rs-kanban-card") ?? [])];
		siblings.slice(1).forEach((card, index) => {
			modify(card, {
				transform: `translateY(${room * (index === 0 ? 12 : 5)}px)`,
			});
		});
	}
}
