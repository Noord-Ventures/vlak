# Robotics

Controls for robot joint targets, recorded poses and mission plans.

## State and targets

Inspect independently reported poses and joint readings while editing explicit target values.

- [Joint panel](https://vlak.dev/docs/joint-panel.md): Pairs host-reported joint positions with independent draft targets, supplied units and limits, and an explicit request action.
- [Robot pose](https://vlak.dev/docs/robot-pose.md): Displays exact Cartesian translation and explicitly named orientation components for a selected supplied pose, with frame, time, and recorded status.

## Mission planning

Order supplied mission steps and request actions without inventing execution status.

- [Robot mission queue](https://vlak.dev/docs/robot-mission-queue.md): Shows supplied mission order and recorded step states, with keyboard reorder requests and explicit host actions separate from pending and confirmed records.

## Data and action contracts

### Keep coordinate frames explicit

Every pose belongs to a supplied frame, timestamp and orientation representation. Components display exact values and do not transform frames, normalize quaternions or infer an orientation convention.

### Keep reported state separate from targets

Joint targets do not update reported positions. The application supplies joint limits, accepts or rejects target requests and returns confirmed state. Missing limits or readings remain visible.

### Execute in the controller

The host owns robot connectivity, permissions, motion planning, collision checks, interlocks and mission execution. Reordering a plan or requesting an action is not evidence that a robot moved.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add joint-panel
```
