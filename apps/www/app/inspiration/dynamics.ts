/** Position is measured in carousel items (or radians), velocity in units/second. */
export type MotionState = { position: number; velocity: number };

/** Do not jump across the scene after a suspended tab or a long frame. */
export const MAX_FRAME_DELTA = 1 / 15;
const SPRING_FREQUENCY = 16;

function frameDelta(deltaSeconds: number): number {
  return Number.isFinite(deltaSeconds)
    ? Math.min(MAX_FRAME_DELTA, Math.max(0, deltaSeconds))
    : 0;
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Exact critically damped spring integration, independent of display refresh rate. */
export function stepSpring(
  state: MotionState,
  target: number,
  deltaSeconds: number,
): MotionState {
  const destination = finite(target);
  const position = finite(state.position, destination);
  const velocity = finite(state.velocity);
  const dt = frameDelta(deltaSeconds);
  if (dt === 0) return { position, velocity };

  const displacement = position - destination;
  const accelerationTerm = velocity + SPRING_FREQUENCY * displacement;
  const decay = Math.exp(-SPRING_FREQUENCY * dt);
  const nextPosition = destination + (displacement + accelerationTerm * dt) * decay;
  const nextVelocity = (velocity - SPRING_FREQUENCY * accelerationTerm * dt) * decay;
  return {
    position: finite(nextPosition, destination),
    velocity: finite(nextVelocity),
  };
}

/** Exact exponential friction for released rotation; damping is in inverse seconds. */
export function stepInertia(
  state: MotionState,
  deltaSeconds: number,
  damping = 5,
): MotionState {
  const position = finite(state.position);
  const velocity = finite(state.velocity);
  const dt = frameDelta(deltaSeconds);
  const drag = Math.max(0, finite(damping, 5));
  const decay = Math.exp(-drag * dt);
  // expm1 keeps the displacement accurate when damping or dt is very small.
  const travel = drag === 0 ? dt : -Math.expm1(-drag * dt) / drag;
  return {
    position: finite(position + velocity * travel, position),
    velocity: finite(velocity * decay),
  };
}

/** Wrap a continuous carousel coordinate into [0, count). */
export function wrapIndex(index: number, count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  const remainder = finite(index) % count;
  return remainder < 0 ? remainder + count : remainder === 0 ? 0 : remainder;
}

/** Find the equivalent item closest to the current continuous carousel position. */
export function nearestEquivalentIndex(index: number, position: number, count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  const wrapped = wrapIndex(index, count);
  const cycles = Math.round((finite(position) - wrapped) / count);
  return finite(wrapped + cycles * count, wrapped);
}

/** Project a flick 160 ms ahead, limited to one neighbor from the nearest item. */
export function releaseTarget(position: number, velocity: number): number {
  const current = finite(position);
  const nearest = Math.round(current);
  const projected = current + Math.max(-0.85, Math.min(0.85, finite(velocity) * 0.16));
  return Math.max(nearest - 1, Math.min(nearest + 1, Math.round(projected)));
}
