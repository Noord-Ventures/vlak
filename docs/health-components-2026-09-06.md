# Health component collection

Twelve components extend the public catalogue from 114 to 126 entries. They use
the existing monochrome tokens and React StyleX leaves, with no new runtime
dependencies. Each entry has an isolated specimen, a contextual example,
generated CSS and props, a registry item, and agent-readable documentation.

| Workflow | Components |
| --- | --- |
| Readings and observations | HealthMetric, ReferenceRange, LabResults, SymptomDiary |
| Daily wellbeing | CheckIn, HabitTracker, SleepTimeline, ActivityGoal |
| Care workflows | PatientBanner, MedicationSchedule, AppointmentCard, CarePlan |

The website introduces `/docs/health/` and the Health catalogue category. The
same composition guide is generated at `/docs/health.md`, linked from `llms.txt`,
and exposed through the CLI and the `vlak://docs/health` MCP resource.

## Behavior

- Missing, pending, unavailable, skipped, and unrecorded states remain distinct
  from zero, a negative answer, or a completed task.
- The caller supplies reference intervals, result flags, medication instructions,
  time zones, and confirmation of recorded changes. No clinical thresholds or
  treatment rules are embedded in the components.
- Check-ins use native radio groups with form reset and controlled/uncontrolled
  values. Interactive controls retain keyboard access and 44px targets.
- Repeated medication doses have distinct time, dose, and status descriptions
  for their recording actions. Pending actions cannot be submitted again.
- Reference ranges use logical positioning in both reading directions. Sleep
  intervals retain proportional widths even when a segment is narrower than a
  pixel; gaps and invalid data retain explicit text equivalents.

## Verification

- Package builds, package/site typechecks, and lint pass. Existing lint warnings
  remain; two unrelated labeled generic containers received group roles to
  restore the full lint check.
- All 739 unit and integrity tests pass, including native refs and attributes
  for every new component, registry completeness, keyboard interaction, missing
  data, controlled updates, form reset, and accessibility semantics.
- Tarball consumer checks pass under React 18 and 19: 52 expansion components
  render through both root and leaf imports, with zero React 18 prop warnings.
  CLI installation produces 84 source files with complete relative imports.
- The production site build generates 167 static routes. All 127 catalogue
  entries, including the hidden compatibility entry, have isolated use examples.
- Chromium end-to-end checks pass across 140 pages: axe, keyboard navigation,
  skip links, phone menu behavior, and no horizontal page overflow at 390px.
  All twelve health pages additionally pass in light and dark themes, with
  rendered 44px targets and keyboard changes in their interactive specimens.
  Checkbox/radio target checks measure their associated clickable labels.
- All 400 generated files are byte-stable across repeated builds (manifest
  SHA-256 `a8adbdbd27319f07bece20ceaa8663929f1291bc25304218f621825b7804486f`).

Visual review covered desktop and phone layouts in both themes. Browser checks
used Chromium on this Mac; no physical-device or screen-reader session was run.

## Distribution budgets

The complete React catalogue is 139.8 KB gzipped; CLI code plus registry data is
66.1 KB. Their caps increase to 144 KB and 68 KB to accommodate the additions.
Every new leaf has an individual 3 KB cap. Existing control and CSS caps stay
unchanged; core CSS is 22.4 KB and atomic React CSS is 14.6 KB gzipped.

This change does not publish a new npm package version. Examples use fictional
records and local state; applications own persistence and health-record
integration.
