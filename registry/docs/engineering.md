# Industrial

Controls for operator alarms and machining coordinate records.

## Industrial operations

Review alarm lifecycle fields and prepare fixture offsets alongside actual controller readings.

- [Alarm panel](https://vlak.dev/docs/alarm-panel.md): Industrial alarm records with independent condition, acknowledgement and shelving states, explicit filters and host-confirmed actions.
- [Work offset panel](https://vlak.dev/docs/work-offset-panel.md): Reported machine and work coordinates alongside editable draft offsets, explicit axis units and a host-owned apply request.

## Data and action contracts

### Preserve independent states

Alarm condition, acknowledgement and shelving are independent. Unknown states remain distinct from inactive states.

### Separate drafts from controller readings

WorkOffsetPanel shows host-supplied machine and work coordinates, active system and offset state. Changing a draft does not infer new positions, activate another system or zero suspended offsets. The host supplies offsets for each selected system.

### Confirm actions in the host

Callbacks request alarm actions or an offset update. The application owns permissions, controller access, machine interlocks, audit records, persistence and confirmed results. These examples use local state and supplied fictional readings.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add alarm-panel
```
