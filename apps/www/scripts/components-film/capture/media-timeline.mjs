// One deterministic playback clock for the actual Waveform, MediaScrubber,
// PlaybackControls and their contact sounds. Times in mediaTiming are global.
export const mediaTiming = Object.freeze({
	chapterStart: 6,
	chapterEnd: 12.5,
	duration: 18,
	play: 7.88,
	pause: 9.8,
	seekStart: 10.2,
	seekEnd: 10.65,
	seekTo: 9,
	resume: 11.15,
});

// The native play/pause button is index 1. A .35s visual press can begin .175s
// before each event, putting maximum depression, sound and state on this time.
export const mediaTransportEvents = Object.freeze(
	[
		["Play", mediaTiming.play],
		["Pause", mediaTiming.pause],
		["Resume", mediaTiming.resume],
	].map(([action, time]) =>
		Object.freeze({
			action,
			time,
			localTime: Math.round((time - mediaTiming.chapterStart) * 1e6) / 1e6,
			buttonIndex: 1,
		}),
	),
);

/** Local chapter seconds in; media seconds out. Playback runs at exactly 1×. */
export function mediaStateAt(localTime, overview = false) {
	const duration = mediaTiming.duration;
	if (overview) {
		return {
			position: mediaTiming.seekTo,
			progress: mediaTiming.seekTo / duration,
			playing: false,
			seeking: false,
			duration,
		};
	}
	const elapsed = Number.isFinite(localTime) ? Math.max(0, localTime) : 0;
	const time = Math.min(
		mediaTiming.chapterStart + elapsed,
		mediaTiming.chapterEnd,
	);
	const pausedPosition = mediaTiming.pause - mediaTiming.play;
	let position = 0;
	if (time >= mediaTiming.resume) {
		position = mediaTiming.seekTo + time - mediaTiming.resume;
	} else if (time >= mediaTiming.seekEnd) {
		position = mediaTiming.seekTo;
	} else if (time >= mediaTiming.seekStart) {
		const progress =
			(time - mediaTiming.seekStart) /
			(mediaTiming.seekEnd - mediaTiming.seekStart);
		const ease = progress * progress * (3 - 2 * progress);
		position =
			pausedPosition + (mediaTiming.seekTo - pausedPosition) * ease;
	} else if (time >= mediaTiming.pause) {
		position = pausedPosition;
	} else if (time >= mediaTiming.play) {
		position = time - mediaTiming.play;
	}
	position = Math.max(0, Math.min(duration, position));
	return {
		position,
		progress: position / duration,
		playing:
			(time >= mediaTiming.play && time < mediaTiming.pause) ||
			(time >= mediaTiming.resume && time < mediaTiming.chapterEnd),
		seeking: time >= mediaTiming.seekStart && time < mediaTiming.seekEnd,
		duration,
	};
}
