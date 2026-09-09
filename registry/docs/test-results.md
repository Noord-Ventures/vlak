# Test results

Displays suites, derived pass/fail/skip totals, elapsed time and failure details with optional retries.

Category: ai  
Name: `test-results`  
Also known as: AI Elements Test Results, Test runner output, Suite results  
Page: https://vlak.dev/ai/test-results/

## When to use

- Render supplied test suites, durations in milliseconds and per-test failures.
- Provide onRetry to request another run; new application data determines the resulting status.
- Counts and completion progress derive from the displayed tests, including skipped and running states.

## When not to

- Executing tests or marking them passed merely because a retry callback resolves.
- Announcing full changing logs through a live region.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { TestResults } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add test-results
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/test-results.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<section class="rs-test-results" aria-labelledby="tests-title"><header class="rs-test-results-header"><span class="rs-test-results-title" id="tests-title">Test results</span><div class="rs-test-results-summary" role="status"><span class="rs-badge-solid">1 passed</span><span class="rs-badge-muted">1 failed</span><span class="rs-test-results-note">2 of 2 complete</span></div><progress class="rs-test-results-progress" value="2" max="2" aria-label="Tests completed"></progress></header><div class="rs-test-results-content"><p class="rs-test-results-note">Open a suite to inspect its results.</p></div></section>
```

## Example

```tsx
import { TestResults } from "@noorddev/vlak-react";

<TestResults suites={[{ id: "composer", name: "Composer", tests: [{ id: "send", name: "Sends a prompt", status: "passed", duration: 82 }, { id: "retry", name: "Retains failed drafts", status: "failed", error: "Expected the original draft.", stack: "at retryTest (composer.test.tsx:38:3)" }] }]} duration={428} />
```

## Props

### TestResults

Test hierarchy and derived totals, with runner-owned status and retry results.

Extends `Omit<HTMLAttributes<HTMLElement>, "title">`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `suites` (required) | `TestResultSuite[]` |  |  |
| `title` | `ReactNode` | `"Test results"` |  |
| `duration` | `number` |  | Total elapsed time in milliseconds, when measured by the runner. |
| `defaultOpen` | `boolean` | `true` |  |
| `onRetry` | `(test: TestResultItem, suite: TestResultSuite) => void \| Promise<void>` |  | Requests a retry; only new supplied test data changes the displayed result. |

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Tab reaches suite/failure disclosures, retry actions and stack copy controls. |
| Enter, Space | Enter or Space toggles disclosures or requests retry for the focused failed test. |

## Accessibility

- Text labels distinguish all five states without color dependence.
- A concise atomic status announces totals; failure text remains ordinary readable content.
- The named native progress element avoids a zero maximum for empty results.
- Retries prevent duplicate activation, retain actionable failure feedback and ignore stale completion after data changes.

## Classes

`rs-test-results-test`, `rs-test-results-line`, `rs-test-results-name`, `rs-test-results-note`, `rs-test-results-error`, `rs-test-results`, `rs-test-results-header`, `rs-test-results-title`, `rs-test-results-summary`, `rs-test-results-progress`, `rs-test-results-content`, `rs-test-results-list`

## Dependencies

Registry dependencies: [badge](badge.md), [button](button.md), [collapsible](collapsible.md), [code-block](code-block.md).  
React: `packages/react/src/components/test-results.tsx`  
CSS: `packages/core/css/components/test-results.css`
