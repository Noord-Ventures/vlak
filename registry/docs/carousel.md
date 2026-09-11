# Carousel

Browses a sequence on a scroll-snap track. Buttons move one slide; the ends feather.

Category: content  
Name: `carousel`  
Also known as: Carousel, Slideshow, Embla, Swiper  
Page: https://vlak.dev/components/carousel/

## When to use

- A row of cards or images wider than the page, browsed one nudge at a time.
- Scroll snap does the alignment; the buttons nudge by 80% of the width.

## When not to

- Autoplay or hero sliders; nothing moves on its own.
- Essential content only reachable by scrolling; show it in the flow too.

## Install

**React package.** Precompiled; no compiler to configure.

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
import { Carousel, CarouselSlide } from "@noorddev/vlak-react";
```

**Vendor the source.** The StyleX leaf lands in `components/vlak/` for your compiler to own.

```sh
npx @noorddev/vlak-cli add carousel
```

**shadcn registry.** Same files, through the shadcn CLI.

```sh
npx shadcn add https://vlak.dev/r/carousel.json
```

**CSS only.** `rs-*` classes on plain markup, styled by `@noorddev/vlak/css`.

```html
<div class="rs-carousel"><div class="rs-carousel-track"><div class="rs-carousel-slide">One</div><div class="rs-carousel-slide">Two</div><div class="rs-carousel-slide">Three</div></div><div class="rs-carousel-nav"><button class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 3.75 L5.5 8.25 L10.5 12.75" vector-effect="non-scaling-stroke"/></svg></button><button class="rs-page"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3.75 L10.5 8.25 L5.5 12.75" vector-effect="non-scaling-stroke"/></svg></button></div></div>
```

## Example

```tsx
import { Carousel, CarouselSlide } from "@noorddev/vlak-react";

<Carousel aria-label="Case studies">
  {cases.map((c) => (
    <CarouselSlide key={c.id}>
      <CaseCard {...c} />
    </CarouselSlide>
  ))}
</Carousel>
```

## Props

### Carousel

Native scroll snap; the buttons nudge. The track is the named, focusable carousel region.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `aria-label` | `string` | `"Carousel"` | Name of the carousel region. |

### CarouselSlide

One slide: a named group, "n of N" unless you name it yourself.

Extends `HTMLAttributes<HTMLDivElement>`: every native attribute, `className`, `style`, and event handler passes through.

Forwards `ref` to the `HTMLDivElement`.

No props of its own.

## Keyboard

| Keys | Does |
| --- | --- |
| Tab | Focuses the track, then the previous and next buttons |
| Arrow left, Arrow right | Scrolls the focused track |
| Enter, Space | Nudges from the buttons |

## Accessibility

- The track is role="region" with aria-roledescription="carousel", named by aria-label, and focusable.
- CarouselSlide is role="group" with aria-roledescription="slide", named "n of N" unless you pass aria-label.
- The buttons are labelled "Previous" and "Next".

## Classes

`rs-carousel`, `rs-carousel-track`, `rs-carousel-slide`, `rs-carousel-nav`, `rs-carousel-icon`, `rs-carousel-page`

## Dependencies

Registry dependencies: [pagination](pagination.md).  
React: `packages/react/src/components/carousel.tsx`  
CSS: `packages/core/css/components/carousel.css`
