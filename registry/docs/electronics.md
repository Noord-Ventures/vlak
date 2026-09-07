# Circuitry

Controls for board pad inspection, design-rule results and assembly variants.

## Board inspection

Keep pad identity, nets, layers and geometry together; inspect supplied rule violations with their recorded status.

- [Pad inspector](https://vlak.dev/docs/pad-inspector.md): Circuit-board pad selection with supplied footprint references, net and layer records, pad types and a dimension table with explicit units.
- [Design rule results](https://vlak.dev/docs/design-rule-results.md): Supplied board-check violations with severity and status filters, object and location details, and host-confirmed selection and resolution actions.

## Assembly variants

Inspect population, bill-of-materials inclusion and placement inclusion independently for every reference and variant.

- [Assembly variant matrix](https://vlak.dev/docs/assembly-variant-matrix.md): Edits independent population, bill-of-materials, and placement flags per reference and assembly variant, preserving unspecified choices.

## Data and action contracts

### Preserve independent assembly flags

Population, bill-of-materials inclusion and placement inclusion are separate supplied flags. An unspecified state is not false and no flag silently rewrites another.

### Read geometry without inferring connectivity

Pad numbers, net assignments, layer names, shapes and dimensions come from the board model. Missing data remains explicit; these views do not run a netlist, router or geometry engine.

### Keep rule results tied to their source

The host provides violation severity, status, location and available resolution actions. A resolve request does not establish that a board passes its rules; return confirmed results after the board model changes and checks rerun.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add pad-inspector
```
