# Building with Vlak

Use this document as the design brief when creating a landing page or product interface with Vlak. It is written for coding agents, but the decisions are useful to anyone composing with the system.

## Objective

Produce a complete, distinctive interface that feels designed around its subject. Use Vlak as the visual grammar, not as a gallery of components. Start from the content and task, establish hierarchy with type and space, then add only the controls the interface needs.

The result should feel calm, exact, and useful. It should not resemble a generic dashboard, a rounded card stack, or a component demo.

## Start here

Install the React package and stylesheet:

```sh
npm install @noorddev/vlak-react
```

```tsx
import "@noorddev/vlak-react/css";
```

Use components from `@noorddev/vlak-react`. Read [vlak.dev/llms-full.txt](https://vlak.dev/llms-full.txt) for the current component API, or run `npx @noorddev/vlak-cli search <term> --json` to find the right primitive. Do not recreate a component with local markup when Vlak already provides it.

## Visual direction

Vlak treats the page as a plane. Type, controls, images, and data share one field and align to a visible or implied grid.

- Use paper, ink, gray, and hairlines for the main interface.
- Let typography and position create hierarchy before introducing containers.
- Align major edges. Repeated offsets should resolve to the same grid lines.
- Prefer full-width regions, divided rows, rails, and flush panels to floating cards.
- Use square corners on structural surfaces. The small radius belongs to standalone controls and selected states, not every container.
- Use one strong image, diagram, or live work surface when the subject benefits from it. Do not decorate empty areas with arbitrary gradients.
- Keep shadows absent or nearly imperceptible. Separation comes from contrast, overlap, and 1px rules.
- Use one accent only when it communicates state, identity, or data. A brand's colour is that accent: set it through `--accent`, and its primary buttons through `--action` and `--action-text` (see https://vlak.dev/docs/brand). Never distribute color merely to make the page feel lively.

## Composition

Choose a composition before writing components.

For a landing page:

1. Build a decisive opening field. Place the headline low and left, or align it to another meaningful edge.
2. Keep the headline specific. State what the product is or what it enables.
3. Pair one primary action with at most one quieter secondary action.
4. Follow with proof, process, or product detail. Do not repeat the hero claim in three formats.
5. Alternate density. A large visual field should be followed by concise evidence; a dense specification should be followed by space.
6. End with a direct next action, not a second generic manifesto.

For a product interface:

1. Identify the primary work surface. Give it most of the area.
2. Put global navigation in a rail or compact header.
3. Keep contextual tools adjacent to what they affect.
4. Use cards only for objects that are genuinely movable, repeatable, or individually actionable.
5. Present data as aligned rows, tables, meters, or plots. Avoid turning every value into a separate tile.
6. Put destructive and secondary actions away from the main path, while keeping them discoverable.

## Grid and spacing

Use the Vlak grid as a relationship, not a compulsory measurement everywhere.

- Begin with a 20px gutter on larger screens and a 25px page gutter on phones.
- Use the modular grid for major columns, rails, image bounds, and section dividers.
- Keep spacing in a short family such as 4, 8, 12, 20, 32, 52, and 84px.
- Use equal inset on all four sides when a control or panel is visually centered.
- Extend section rules to the true container edge. Do not stop a divider at the text inset unless it separates text only.
- Align icons by their visible shape, not only their SVG view box. Put every icon in an equal square and center it with flex or grid.
- Avoid isolated offsets. If one element needs 17px to look right, reconsider the parent alignment first.

## Type and copy

Use Inter through the Vlak stylesheet unless the brand sets `--font-sans` and `--font-display`. Body copy is regular enough to read at length; headings and labels are firm, not heavy.

- Use sentence case everywhere.
- Write short, concrete labels.
- Name the object or action directly: `Export wallpaper`, `Queue capture`, `Open trip`.
- Avoid slogans that could describe any product.
- Avoid inflated contrasts such as “not just” or “more than”.
- Avoid design commentary inside the product. The interface should describe the user’s work.
- Use numerals for changing values and tabular numerals for aligned data.
- Keep paragraphs narrow enough to scan. Long body copy should not share the width of a large display heading.

## Components

Reach for Vlak primitives first:

- `Button` for actions. One primary action per region; use ghost buttons for alternatives.
- `ButtonGroup` or `ToggleGroup` for mutually exclusive views and filters.
- `Card` for a discrete object, not as a default section wrapper. Structural cards should be flush and square.
- `Input`, `Textarea`, `Select`, and `Combobox` for data entry. Keep labels visible.
- `Tabs` for sibling views of the same object, not for navigation across unrelated pages.
- `DropdownMenu`, `Dialog`, `Drawer`, and `Popover` for temporary choices or detail. Use the smallest surface that fits the task.
- `Table`, `DataTable`, and `Progress` for dense operational information.
- `CrumbBar`, `Sidebar`, and navigation components for wayfinding.
- `Empty`, `Toast`, `Alert`, and `Skeleton` for system states. Write the cause and next action when there is one.

Custom styling may adapt a component to its context, but preserve its behavior, focus state, keyboard model, and semantic element. Modify density, orientation, borders, or layout before inventing a new control.

## Interaction

- Make the primary action visually obvious without making every action loud.
- Give links, cards, table rows, and table-of-contents items a clear hover state.
- Keep focus rings visible and high contrast.
- Use motion to explain a state change. Keep it short and respect reduced motion.
- Maintain 44px touch targets on phones.
- Put close controls in the top corner of drawers and side panes.
- Keep selected states legible with fill, border, weight, or a combination. Do not rely on a thin outline alone.
- Show loading, empty, error, disabled, and success states for the main flow.

## Responsive behavior

Do not shrink a desktop composition until it fits. Recompose it.

- Replace desktop navigation with one menu button. Put appearance controls inside that menu instead of adding a second header control.
- Keep logo, current location, and menu control on one vertically centered mobile row.
- Collapse side rails into drawers, segmented views, or bottom navigation according to the task.
- Turn multi-column cards into one column and let media remain larger than their text blocks.
- Keep important data visible; move secondary metadata behind disclosure rather than scaling it below readable size.
- Respect safe-area insets and prevent fixed chrome from covering content.
- Test at 320, 390, 768, 1024, and 1440px widths.

## Accessibility

- Use semantic HTML and native behavior where possible.
- Give every interactive element an accessible name.
- Preserve Vlak’s keyboard behavior when composing components.
- Keep text and control contrast at accessible levels in light and dark schemes.
- Never encode status by color alone.
- Connect errors and help text to their fields.
- Test keyboard navigation, zoom, reduced motion, forced colors, and a screen reader path through the main task.

## One-shot build sequence

1. Read the product brief and write a one-sentence purpose for the page.
2. List the three most important user actions or questions.
3. Select the Vlak components that serve those needs.
4. Sketch the page as large regions before adding local containers.
5. Implement real copy and believable data. Do not use lorem ipsum.
6. Add one subject-specific visual idea such as a map, model, poster field, waveform, product image, or live preview.
7. Compose desktop and mobile separately within the same responsive system.
8. Add hover, focus, selected, loading, empty, and error states where relevant.
9. Audit alignment, padding, line length, contrast, and icon centering at every target width.
10. Remove anything that exists only to make the interface look busier.

## Definition of done

The page has a clear purpose in its first screen. Its main action is evident. Major edges align. Copy is specific. Components come from Vlak where available. Cards are used with restraint. Both schemes work. Mobile is recomposed and touchable. Keyboard and focus behavior work. The result contains at least one visual decision that belongs to this product and could not be exchanged unchanged with another one.
