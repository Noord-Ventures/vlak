# Schedule editing recipe

This recipe validates a bounded event edit, projects it onto the record-review revision contract, and commits it through the same adapters. Run it from `examples/workflows`:

```sh
node --experimental-strip-types schedule-editing/example.ts
```

The example supports one timed or all-day event with ISO date-time boundaries and an IANA time zone. It intentionally excludes recurrence, detached instances, attendee updates, reminders, calendar authorization, provider synchronization, and ICS round-tripping. Add those semantics in the host only after the calendar provider and ownership rules are defined.
