// Node 22.6+: node --experimental-strip-types --test apps/www/scripts/test-inspiration-dynamics.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_FRAME_DELTA,
  nearestEquivalentIndex,
  releaseTarget,
  stepInertia,
  stepSpring,
  wrapIndex,
} from "../app/inspiration/dynamics.ts";

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} must be within ${tolerance} of ${expected}`);
}

function simulate(step, state, hz, seconds = 1) {
  let result = state;
  for (let frame = 0; frame < hz * seconds; frame++) result = step(result, 1 / hz);
  return result;
}

test("spring motion agrees at 30, 60 and 120 Hz throughout settling", () => {
  for (const seconds of [0.1, 0.5, 1]) {
    const baseline = simulate((state, dt) => stepSpring(state, 2, dt), { position: -0.4, velocity: 3 }, 30, seconds);
    for (const hz of [60, 120]) {
      const result = simulate((state, dt) => stepSpring(state, 2, dt), { position: -0.4, velocity: 3 }, hz, seconds);
      close(result.position, baseline.position);
      close(result.velocity, baseline.velocity);
    }
    if (seconds === 1) {
      close(baseline.position, 2, 0.00001);
      close(baseline.velocity, 0, 0.0001);
    }
  }
});

test("a long frame advances only the capped duration instead of teleporting", () => {
  const state = { position: 0, velocity: 1 };
  assert.deepEqual(stepSpring(state, 3, 20), stepSpring(state, 3, MAX_FRAME_DELTA));
  assert.deepEqual(stepInertia(state, 20), stepInertia(state, MAX_FRAME_DELTA));
  assert.ok(stepSpring(state, 3, 20).position < 1);
  for (const dt of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.deepEqual(stepSpring(state, 3, dt), state);
    assert.deepEqual(stepInertia(state, dt), state);
  }
});

test("stationary spring settles without overshooting its destination", () => {
  let state = { position: -3, velocity: 0 };
  for (let frame = 0; frame < 120; frame++) {
    const next = stepSpring(state, 1, 1 / 120);
    assert.ok(next.position >= state.position && next.position <= 1);
    state = next;
  }
  close(state.position, 1, 0.00001);
});

test("rotation friction preserves displacement and velocity across refresh rates", () => {
  const initial = { position: 0.3, velocity: -4 };
  const baseline = simulate(stepInertia, initial, 30);
  for (const hz of [60, 120]) {
    const result = simulate(stepInertia, initial, hz);
    close(result.position, baseline.position);
    close(result.velocity, baseline.velocity);
  }
  close(baseline.position, initial.position + initial.velocity * (1 - Math.exp(-5)) / 5);
  assert.deepEqual(stepInertia({ position: 1, velocity: 3 }, 0.05, 0), { position: 1.15, velocity: 3 });
});

test("cyclic navigation chooses the closest copy across both boundaries", () => {
  assert.equal(wrapIndex(-1, 6), 5);
  assert.equal(wrapIndex(6, 6), 0);
  assert.equal(wrapIndex(-12, 6), 0);
  assert.equal(wrapIndex(13.5, 6), 1.5);
  assert.equal(nearestEquivalentIndex(5, 0, 6), -1);
  assert.equal(nearestEquivalentIndex(0, 5, 6), 6);
  assert.equal(nearestEquivalentIndex(1, 11.8, 6), 13);
  assert.equal(nearestEquivalentIndex(5, -12.2, 6), -13);
  for (let position = -30; position <= 30; position += 0.125) {
    for (let item = 0; item < 6; item++) {
      const target = nearestEquivalentIndex(item, position, 6);
      assert.ok(Math.abs(target - position) <= 3);
      assert.equal(wrapIndex(target, 6), item);
    }
  }
});

test("release momentum selects adjacent items without uncontrolled flick skips", () => {
  assert.equal(releaseTarget(0.2, 0), 0);
  assert.equal(releaseTarget(0.6, 0), 1);
  assert.equal(releaseTarget(0.1, 4), 1);
  assert.equal(releaseTarget(-0.1, -4), -1);
  assert.equal(releaseTarget(5.2, 100000), 6);
  assert.equal(releaseTarget(0.1, -100000), -1);
  for (let position = -12; position < 12; position += 0.125) {
    for (const velocity of [-1e12, -10, -1, 0, 1, 10, 1e12]) {
      const target = releaseTarget(position, velocity);
      assert.ok(Number.isInteger(target));
      assert.ok(Math.abs(target - Math.round(position)) <= 1);
    }
  }
});

test("invalid input cannot propagate non-finite values into the rendered scene", () => {
  for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_VALUE]) {
    for (const state of [{ position: invalid, velocity: invalid }, { position: -invalid, velocity: invalid }]) {
      for (const result of [stepSpring(state, invalid, 1 / 60), stepInertia(state, 1 / 60)]) {
        assert.ok(Number.isFinite(result.position));
        assert.ok(Number.isFinite(result.velocity));
      }
    }
  }
  assert.equal(wrapIndex(3, 0), 0);
  assert.equal(wrapIndex(Number.NaN, 6), 0);
  assert.equal(nearestEquivalentIndex(3, 0, Number.NaN), 0);
  assert.equal(releaseTarget(Number.NaN, Number.POSITIVE_INFINITY), 0);
});
