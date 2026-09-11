# Schedule editing

A runnable bounded event-edit recipe using the same revision and idempotency contract.

Reference version: 0.1.0. Status: recipe.

## Run

From `examples/workflows`:

```sh
node --experimental-strip-types schedule-editing/example.ts
```

## States

editing → validating → reviewing → submitting → confirmed → conflict → outcome-unknown

## Acceptance

- End is after start
- Time zone is recognized
- A write carries expected revision and idempotency key
- Provider conflict remains authoritative

## Host responsibilities

- Calendar ownership
- Provider authorization
- Provider conflict mapping
- Recurrence and attendee semantics

The host validates calendar ownership and provider-specific eligibility before applying the revision-checked edit.

## Limitations

- No recurrence or detached instances
- No attendee, reminder, or provider synchronization
- No ICS round-trip guarantee

## Source

- [examples/workflows/schedule-editing/recipe.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/schedule-editing/recipe.ts) (recipe)
- [examples/workflows/schedule-editing/example.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/schedule-editing/example.ts) (recipe)
- [examples/workflows/schedule-editing/README.md](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/schedule-editing/README.md) (documentation)
- [examples/workflows/record-review/tests/recipes.test.ts](https://github.com/Noord-Ventures/vlak/blob/main/examples/workflows/record-review/tests/recipes.test.ts) (test)
