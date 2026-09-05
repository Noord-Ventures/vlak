# Vlak tokens

Every custom property `@noorddev/vlak/css/tokens.css` defines, generated from `packages/core/src/tokens.ts`. The dark column applies under `data-theme="dark"` on the root element, or under the system dark scheme until the page decides. The StyleX alias is the key on `vlak` from `@noorddev/vlak-react/tokens.stylex`. The same tokens ship as JSON (`@noorddev/vlak/tokens`) and in the W3C Design Tokens format (`@noorddev/vlak/tokens.dtcg`) for Style Dictionary, Figma Variables, and Tokens Studio.

## Custom properties

| Property | Light | Dark | StyleX | Note |
| --- | --- | --- | --- | --- |
| `--bg` | `#FAF8F2` | `#0E0C0A` | `vlak.paper` | paper |
| `--text` | `#1A1A1A` | `#E8E8E8` | `vlak.ink` | ink |
| `--text-secondary` | `#6B6B6B` | `#949494` | `vlak.gray` | gray |
| `--accent` | `#1A1A1A` | `#E8E8E8` | `vlak.accent` | the "accent" is ink; monochrome |
| `--divider` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.10)` | `vlak.divider` |  |
| `--divider-subtle` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.07)` | `vlak.dividerSubtle` |  |
| `--table-alt` | `rgba(0,0,0,0.02)` | `rgba(255,255,255,0.03)` | `vlak.tableAlt` |  |
| `--grid-line` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.05)` | `vlak.gridLine` |  |
| `--control-border` | `rgba(0,0,0,0.42)` | `rgba(255,255,255,0.38)` | `vlak.controlBorder` |  |
| `--control-fill` | `#E4E2DC` | `#242220` | `vlak.controlFill` |  |
| `--radius-sm` | `4px` |  | `vlak.radiusSm` | slight Vlak radius; standalone buttons |
| `--radius` | `var(--radius-sm)` |  | `vlak.radius` | alias — buttons, boxes, dialogs share it; cards stay 0 |
| `--radius-chrome` | `0px` |  | `vlak.radiusChrome` |  |
| `--gutter` | `20px` |  | `vlak.gutter` |  |
| `--pad` | `20px` |  | `vlak.pad` |  |
| `--radius-in` | `max(0px, calc(var(--radius) - var(--pad)))` |  | `vlak.radiusIn` |  |
| `--ease` | `cubic-bezier(0.3, 0, 0.2, 1)` |  | `vlak.ease` |  |
| `--duration-snap` | `0.1s` |  | `vlak.durationSnap` |  |
| `--duration` | `0.2s` |  | `vlak.duration` |  |
| `--duration-deliberate` | `0.4s` |  | `vlak.durationDeliberate` |  |
| `--duration-confirm` | `0.3s` |  | `vlak.durationConfirm` |  |
| `--transition` | `background-color var(--duration) var(--ease), border-color var(--duration) var(--ease), color var(--duration) var(--ease), opacity var(--duration) var(--ease)` |  | `vlak.transition` |  |
| `--grid-image` | `linear-gradient(to right,var(--grid-line) 0,var(--grid-line) 1px,transparent 1px,transparent 184px,var(--grid-line) 184px,var(--grid-line) 185px,transparent 185px,transparent 204px)` |  | `vlak.gridImage` |  |
| `--grid-size` | `204px` |  | `vlak.module` |  |
| `--grid-pos` | `20px 0` |  | `vlak.gridPos` |  |
| `--text-scale` | `1` |  | `vlak.textScale` |  |
| `--z-raised` | `10` |  | `vlak.zRaised` |  |
| `--z-sticky` | `100` |  | `vlak.zSticky` |  |
| `--z-float` | `200` |  | `vlak.zFloat` |  |
| `--z-overlay` | `300` |  | `vlak.zOverlay` |  |
| `--z-toast` | `400` |  | `vlak.zToast` |  |
| `--rs-out` | `var(--radius)` |  |  |  |
| `--rs-gap` | `var(--pad)` |  |  |  |
| `--rs-in` | `var(--radius-in)` |  |  |  |
| `--rs-chart-spot` | `var(--text)` |  |  |  |
| `--hit` | `2.75rem` |  | `vlak.hit` |  |
| `--control-h` | `2.75rem` |  | `vlak.controlH` |  |
| `--control-fs` | `0.875rem` |  | `vlak.controlFs` |  |
| `--control-label` | `0.75rem` |  | `vlak.controlLabel` |  |

## Responsive overrides

Under `@media (max-width:480px)`:

| Property | Value |
| --- | --- |
| `--pad` | `25px` |
| `--grid-image` | `linear-gradient(to right,transparent 0,transparent 25px,var(--grid-line) 25px,var(--grid-line) 26px,transparent 26px,transparent calc(50vw - 12.5px),var(--grid-line) calc(50vw - 12.5px),var(--grid-line) calc(50vw - 11.5px),transparent calc(50vw - 11.5px),transparent calc(50vw + 12.5px),var(--grid-line) calc(50vw + 12.5px),var(--grid-line) calc(50vw + 13.5px),transparent calc(50vw + 13.5px),transparent calc(100vw - 26px),var(--grid-line) calc(100vw - 26px),var(--grid-line) calc(100vw - 25px),transparent calc(100vw - 25px))` |
| `--grid-size` | `100vw` |
| `--grid-pos` | `0 0` |

Under `@media (max-width:640px)`:

| Property | Value |
| --- | --- |
| `--hit` | `2.75rem` |
| `--control-h` | `2.75rem` |
| `--control-fs` | `1rem` |
| `--control-label` | `0.9375rem` |

## Token groups

The raw values from `vlakTokens` (`import { vlakTokens } from "@noorddev/vlak"`, or `@noorddev/vlak/tokens` as JSON).

### color

| Key | Value |
| --- | --- |
| `light.paper` | `#FAF8F2` |
| `light.ink` | `#1A1A1A` |
| `light.gray` | `#6B6B6B` |
| `light.divider` | `rgba(0,0,0,0.08)` |
| `light.dividerSubtle` | `rgba(0,0,0,0.06)` |
| `light.gridLine` | `rgba(0,0,0,0.04)` |
| `light.tableAlt` | `rgba(0,0,0,0.02)` |
| `light.controlBorder` | `rgba(0,0,0,0.42)` |
| `light.controlFill` | `#E4E2DC` |
| `dark.black` | `#0E0C0A` |
| `dark.white` | `#E8E8E8` |
| `dark.gray` | `#949494` |
| `dark.divider` | `rgba(255,255,255,0.10)` |
| `dark.dividerSubtle` | `rgba(255,255,255,0.07)` |
| `dark.gridLine` | `rgba(255,255,255,0.05)` |
| `dark.tableAlt` | `rgba(255,255,255,0.03)` |
| `dark.controlBorder` | `rgba(255,255,255,0.38)` |
| `dark.controlFill` | `#242220` |
| `neutralScale` | `["#1A1A1A","#3D3D3D","#6B6B6B","#949494","#C4C2BD","#E8E8E8","#FAF8F2"]` |
| `accent` | `none; emphasis comes from weight, size, and spacing` |

### type

| Key | Value |
| --- | --- |
| `family` | `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` |
| `foundry.typeface` | `Inter` |
| `foundry.designer` | `Rasmus Andersson` |
| `foundry.license` | `SIL OFL 1.1` |
| `foundry.url` | `https://rsms.me/inter/` |
| `weights.body` | `500` |
| `weights.heading` | `600` |
| `weights.label` | `600` |
| `bodyLineHeight` | `1.45` |
| `lineHeight.min` | `1.2` |
| `lineHeight.max` | `1.45` |
| `measure.columns` | `3` |
| `measure.px` | `592` |
| `measure.characters` | `66` |
| `measure.minCharacters` | `45` |
| `measure.maxCharacters` | `90` |
| `caseRule` | `Never all caps; labels and eyebrows are sentence case.` |
| `textScale.default` | `1` |
| `textScale.steps` | `[0.9,1,1.1,1.25,1.4]` |
| `textScale.rule` | `Reading type only; chrome stays put.` |
| `scale` | `[{"name":"displayXl","px":52,"weight":600,"tracking":"-0.035em","lineHeight":1.05},{"name":"display","px":38,"weight":600,"tracking":"-0.03em","lineHeight":1.15},{"name":"title","px":22,"weight":600,"tracking":"-0.02em","lineHeight":1.3},{"name":"subhead","px":17,"weight":500,"tracking":"-0.01em","lineHeight":1.45},{"name":"body","px":15,"weight":500,"tracking":"-0.01em","lineHeight":1.45},{"name":"label","px":13,"weight":600,"tracking":"-0.01em","lineHeight":1.3}]` |

### grid

| Key | Value |
| --- | --- |
| `module` | `204` |
| `column` | `184` |
| `gutter` | `20` |
| `pad` | `20` |
| `snap` | `content boxes span whole 204px modules; edges step from grid line to grid line` |
| `maxModules` | `6` |
| `maxWidth` | `1244` |
| `anchors.rail` | `1024` |
| `anchors.wide` | `1440` |
| `mobile.breakpoint` | `480` |
| `mobile.columns` | `2` |
| `mobile.gutter` | `25` |
| `mobile.pad` | `25` |
| `mobile.columnWidth` | `50vw − 37.5px` |

### radius

| Key | Value |
| --- | --- |
| `small` | `4` |
| `base` | `4` |
| `chrome` | `0` |
| `concentric` | `Steve Ruiz innerRadius, clamped at 0` |
| `rule` | `One token: --radius-sm (4px), the standalone button radius. Toggles share it. Cards are chrome-square (no frame, 0). Callouts are hairline, radius 0. Nested inners follow Steve Ruiz. Chrome stays 0.` |

### icons

| Key | Value |
| --- | --- |
| `sizes` | `[12,16,24]` |
| `variants` | `["line","filled"]` |
| `stroke` | `1` |
| `viewBox` | `16` |
| `center` | `[8,8]` |
| `rule` | `Line: 1px currentColor hairline, butt/miter, no rx. Filled: solid silhouettes with transparent detail cuts. Draw at 12, 16, or 24; 12px uses simplified fine detail` |

### motion

| Key | Value |
| --- | --- |
| `duration` | `0.1–0.4s` |
| `response` | `0.1s` |
| `snappy` | `0.2s` |
| `deliberate` | `0.4s` |
| `snap` | `0.1s` |
| `ease` | `0.2s` |
| `confirm` | `0.3s` |
| `easing` | `cubic-bezier(0.3, 0, 0.2, 1)` |
| `rule` | `A state the user caused may ease, snap with a short curve, or confirm. Entry is not a show. Color and opacity name the change; nothing bounces.` |
| `reducedMotion` | `looping demos and unsolicited entry disabled under prefers-reduced-motion` |

### performance

| Key | Value |
| --- | --- |
| `frame.hz120` | `8.3` |
| `frame.hz60` | `16.7` |
| `frame.unit` | `ms` |
| `responseInstant.max` | `100` |
| `responseInstant.unit` | `ms` |
| `thoughtInterruption.at` | `1000` |
| `thoughtInterruption.unit` | `ms` |
| `attentionLoss.at` | `10000` |
| `attentionLoss.unit` | `ms` |
| `rule` | `A response lands within 100ms. Keep each frame under its refresh-rate budget. At 1s show progress without stealing focus; before 10s explain the wait and preserve the user's place.` |

### accessibility

| Key | Value |
| --- | --- |
| `contrast.ordinaryText` | `4.5` |
| `contrast.largeText` | `3` |
| `contrast.controls` | `3` |
| `touchTarget.width` | `44` |
| `touchTarget.height` | `44` |
| `touchTarget.unit` | `px` |
| `rule` | `Ordinary text is at least 4.5:1, large text and control boundaries are at least 3:1, and interactive targets are at least 44px by 44px.` |

### breakpoints

| Key | Value |
| --- | --- |
| `mobileGrid` | `480` |
| `mobileLayout` | `640` |
| `rail` | `1024` |
| `wide` | `1440` |
| `cap` | `1700` |

### z

| Key | Value |
| --- | --- |
| `raised` | `10` |
| `sticky` | `100` |
| `float` | `200` |
| `overlay` | `300` |
| `toast` | `400` |
| `rule` | `raised: a handle or thumb over its track. sticky: pinned chrome. float: menus, tooltips, hover cards, chart tooltips. overlay: the fixed fallback of a panel that has no top layer. toast: above everything.` |

### control

| Key | Value |
| --- | --- |
| `desktop.hit` | `44` |
| `desktop.height` | `44` |
| `desktop.font` | `14` |
| `desktop.label` | `12` |
| `phone.hit` | `44` |
| `phone.height` | `44` |
| `phone.font` | `16` |
| `phone.label` | `15` |
| `breakpoint` | `640` |
