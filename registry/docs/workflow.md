# Workflow card

Frames an ordered pipeline. 1px dashed frame, chips, and a ghost add action. Reordering is supplied by SortableList.

Category: patterns  
Name: `workflow`  
Also known as: Workflow, Pipeline, Flow card, Process steps  
Page: https://vlak.dev/components/workflow/

## When to use

- Editable pipelines: numbered steps with sub-items and a ghost add action.
- Builders, automations, onboarding flows.

## When not to

- Read-only progress; use Stepper.
- Deep trees; the pipeline is one row.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Flow, FlowAdd, FlowBody, FlowNum, FlowPlus, FlowStep, FlowSub, FlowSubAdd, FlowSubs, FlowTitle } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add workflow
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/workflow.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-flow" style="grid-template-columns:184px;width:184px"><div class="rs-flow-step"><span class="rs-flow-num">1</span><h3 class="rs-flow-title">Proposal</h3><p>Scope, timeline, and fee on one page.</p><div class="rs-flow-subs"><span>Brief</span><span>Fee</span><span class="rs-flow-sub-add">+</span></div></div><button type="button" class="rs-flow-add"><span class="rs-flow-plus">+</span> Add a step</button></div>
```

## Example

```tsx
import { Flow, FlowAdd, FlowBody, FlowNum, FlowStep, FlowSub, FlowSubAdd, FlowSubs, FlowTitle } from "@noorddev/vlak-react";

<Flow>
  <FlowStep>
    <FlowNum>1</FlowNum>
    <FlowTitle>Proposal</FlowTitle>
    <FlowBody>Scope, timeline, and fee on one page.</FlowBody>
    <FlowSubs>
      <FlowSub>Brief</FlowSub>
      <FlowSub>Fee</FlowSub>
      <FlowSubAdd>+</FlowSubAdd>
    </FlowSubs>
  </FlowStep>
  <FlowAdd onClick={addStep}>Add a step</FlowAdd>
</Flow>
```

## Props

### Flow

Dashed 1px pipeline.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### FlowAdd

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLButtonElement`.

No props of its own.

### FlowBody

Extends `HTMLAttributes<HTMLParagraphElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLParagraphElement`.

No props of its own.

### FlowNum

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

No props of its own.

### FlowPlus

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

No props of its own.

### FlowStep

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### FlowSub

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

No props of its own.

### FlowSubAdd

Extends `HTMLAttributes<HTMLSpanElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLSpanElement`.

No props of its own.

### FlowSubs

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

### FlowTitle

Extends `HTMLAttributes<HTMLHeadingElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLHeadingElement`.

No props of its own.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Moves to the add-step button |
| Enter, Space | Activates it |

## Accessibility

- FlowAdd is a native <button>; FlowTitle is an <h3>. FlowSubAdd is a <span>: wrap it in a button when it acts. FlowStep is presentational and is not draggable by itself.

## Classes

`rs-flow`, `rs-flow-step`, `rs-flow-num`, `rs-flow-subs`, `rs-flow-sub-add`, `rs-flow-add`, `rs-flow-plus`, `rs-flow-body`, `rs-flow-sub`, `rs-flow-title`

## Dependencies

Registry dependencies: none.  
React: `packages/react/src/components/flow.tsx`  
CSS: `packages/core/css/components/workflow.css`
