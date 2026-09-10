# iOS component reference

Reviewed on 10 September 2026 against Apple's current Human Interface Guidelines,
the iOS 27 design resource index, and the published iPhone Duo and iPhone 18 Pro
specifications. This replaces the earlier pre-glass study.

## Native anatomy before the Vlak layer

The public Apple Sketch UI kit was downloaded through its enabled public
download, then all 34 page JSON documents were parsed. Twenty relevant native
components were measured before applying the Vlak palette and Inter typography.
`ios-native-reference.json` records their original component IDs, dimensions,
visible layer geometry, and typography, with document version `5l0J2p` and archive
SHA-256 `0efe167fb1c0174a3bd03de533535d1c185963b38145720c54357013f89a8f6f`.

This is an ingestion of the native component anatomy, not a UIKit runtime. The
archive and Apple's artwork are not bundled with the site. Browser controls
reproduce the measured structure and local interaction; CSS does not reproduce
Apple's material renderer.

| Component | Native structure retained | Vlak rendering and implementation |
| --- | --- | --- |
| Navigation | Leading Back symbol, centered compact title, trailing actions; root screens have a separate large title. | Real buttons with 44 px hit areas; a neutral material circle around back and icon actions. Done has ink fill. No visible Back label. |
| Search | Leading search symbol, editable field, trailing clear action when there is text. | `IOSSearchField` composes a real search input and a 44 px clear button. Clearing restores input focus. A single focus outline surrounds the field. |
| Tab navigation | Persistent peer destinations, icon and label, distinct selected state; a floating capsule above content. | Clock and Phone use floating containers with at least 44 px targets and a full selected fill. The content reserves space for the final row. Wider layouts place icon and label together; the open Duo uses the kit's 48 px vertical rail. |
| Grouped lists | Inset related rows, leading icon or avatar, primary label, optional value and disclosure. Separators begin at the content baseline. | Opaque paper groups, 1 px separators, 22 px group corners, and rows that grow beyond their 52 px resting height. |
| Switch | A list-row control with opposing checked states, translated thumb, and an independently generous hit area. | Real checkbox with switch semantics. A 64 × 28 px track, 38 × 24 px pill thumb, 22 px travel, and 44 px hit height. Ink fill and thumb position both communicate state. |
| Control Center | Connectivity group, media group, two vertical level controls, circular shortcuts, and a wider Focus control. | Functional browser controls, neutral material panels, and full ink selection. No decorative glass on the content beneath them. |
| Home | Four app columns, paired widgets, app labels, and a separate favorite-app dock. | Original monochrome glyphs on paper or ink. The dock is a floating neutral surface; glyphs keep their individual rounded silhouettes. |
| Messages | Incoming and outgoing bubbles, clear alignment, and an editable composer with send action. | Real local messaging state. Paper and ink distinguish sender; bubbles retain platform geometry. |

The stylesheet deliberately separates opaque content surfaces from the
navigation material. Material surfaces use the Vlak paper token with restrained
translucency and a hairline edge. Increased contrast or reduced transparency
makes them opaque. Forced colors retains visible boundaries and selection;
reduced motion removes control transitions.

## Geometry and type

Logical CSS pixels represent specimen points. The native text hierarchy is
preserved at default size: body 17/22, secondary text 15/20, caption 13/18, compact
title 17/22 semibold, and large title 34/41 bold. The Vlak typeface is Inter. Text
size preferences grow body text and list rows without increasing the entire
phone scale. Tab labels remain 11 px or larger.

The kit's measured default navigation row is 54 px and its large-title region
brings the total to 105 px. Search is 48 px, ordinary list rows are 52 px, large
rows are 68 px, and the tab container is 62 px. These are measurements from the
specific Apple kit version, not promises about every future UIKit release. Vlak
uses a 22 px section corner and raises the kit's 10 px tab labels to 11 px for
legibility. Hit areas and content can grow for accessibility.

## Device profiles and responsive composition

| Model | Published display pixels | Specimen logical canvas |
| --- | --- | --- |
| iPhone Duo, outer | 1398 × 2034 | 466 × 678 |
| iPhone Duo, inner | 2670 × 1878 in landscape | 951 × 669 |
| iPhone 18 Pro | 1206 × 2622 | 402 × 874 |
| iPhone 18 Pro Max | 1320 × 2868 | 440 × 956 |

The Duo logical canvases come directly from the Apple kit's inner and outer
example artboards. The Pro canvases use the published display pixels at 3×.
Apple's product pages do not publish the specimen's browser safe-area values. Hardware
and safe areas are owned by the device frame. Device changes preserve app state.
At wider widths the home screen places widgets beside the launcher, Settings
uses two content columns, and Control Center rearranges its modules. These
layouts respond to actual container width, including rotation, rather than
stretching a portrait screenshot.

Apple lists the Duo's open enclosure as 164.6 × 117.8 mm and its folded enclosure
as 84.1 × 117.8 mm. The outer camera occupies a corner and can expand into
Dynamic Island. The inner camera is under the display and appears only while
active. The model-specific frame uses the published proportions.

## Duo system anatomy

`ios-duo-reference.json` measures thirteen further native components and example
artboards from the same downloaded kit. `ios-duo.css` applies this geometry only
in hardware preview; readable phone mode retains the compact, unscaled layout.

| Native Duo component | Measured geometry and browser mapping |
| --- | --- |
| Vertical reserved region | An 84 pt strip at the trailing edge; 48 pt controls sit 24 pt from the display edge. It applies to both outer orientations and the inner display in landscape. |
| Outer camera | A 37 pt circular lens within the kit's 95.67 pt reserved region. Its origin is 29.33 pt from the top and right in portrait; rotation carries it to the bottom-right. |
| Status | Native vertical component 50 × 86 pt, or horizontal 104 × 48 pt. A 46 pt ring combines charge, Wi-Fi and cellular. Browser time and Control Center targets occupy 44 and 48 pt, extending the vertical group to 92 pt for interaction. |
| Vertical tabs | 48 pt symbols with a 2 pt gap, plus 6 pt block padding; three tabs occupy 48 × 160 pt. Text remains available to assistive technology. |
| Inner portrait toolbar | Standard height 82 pt with controls at y=24; large-title version 126 pt with its title at y=82. Duo's large title is 28/34 bold, distinct from the other iPhone models' 34/41 hierarchy. |
| Sheets | 8 pt outer gutter. The example inner landscape sheet is 653 pt wide with a 70 pt horizontal toolbar; outer sheets retain vertical actions. |

The inner portrait display restores horizontal navigation. The outer landscape
examples compress status out of the toolbar column; the browser retains a
keyboard-accessible Control Center target in the corner. The inactive inner
camera stays hidden. Application state is owned above the device frame and
persists when the layout changes.

Apple's guidance recommends keeping controls and hierarchy consistent while
adapting around the hinge. It does not publish a blur radius or timing curve for
the transition between displays. The fold effect follows observed footage;
it is not presented as a documented UIKit animation parameter.

## Primary sources

- [Apple Design Resources](https://developer.apple.com/design/resources/), current iOS 27 and iPadOS 27 UI kit links.
- [Official iOS 27 Figma kit](https://www.figma.com/community/file/1651309003795292092/ios-and-ipados-27) and [Sketch kit](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02).
- [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), navigation material and opaque content hierarchy.
- [Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars), symbol-only back navigation and logically grouped actions.
- [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), floating navigation, labels and width adaptation.
- [Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields), search symbol, input and clearing anatomy.
- [Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles), switch placement and redundant state indicators.
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) and [Layout](https://developer.apple.com/design/human-interface-guidelines/layout), text hierarchy, safe areas and adaptive composition.
- [iPhone Duo specifications](https://www.apple.com/iphone-duo/specs/) and [iPhone 18 Pro specifications](https://www.apple.com/iphone-18-pro/specs/), hardware and display dimensions.
- [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo) and [Design for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111466/), vertical controls, reserved regions, and the inner portrait exception.
- [Leverage multiple displays and scenes on iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111464/), continuous hinge-driven effects versus layout APIs.

`ios-app-glyph.tsx` contains original SVG interpretations of familiar app
categories. They are not SF Symbols or official Apple artwork. App content is a
local, reduced feature set; system networking, accounts and phone calls remain
illustrative.

## Small browser viewports

Use phone is the default on browser viewports up to 640px. It presents the live
app at its available CSS width with unscaled text and controls, three compact
Home columns and responsive panels. View device restores the hardware study.
Device selection, opening, folding and rotation preserve the same mounted app;
folding and rotation enter the hardware view. The temporary 3D screen textures
are inert, hidden from assistive technology and removed when motion finishes.

## Fold optics

The opening sequence around 00:10–00:12 and closing sequence around
02:53–02:55 in [Apple’s iPhone Duo film](https://www.apple.com/iphone-duo/)
were inspected visually. The turning half diffuses more strongly than the
settled half, with a spatial gradient toward its outer edge. Screen detail
returns gradually while the physical frame remains crisp. These are observations
from the footage, not blur or timing values published by Apple.

The browser study uses articulated CSS 3D bodies with a front and rear cover
display, 9 px logical thickness, rounded rims and edge planes, and a nine-facet
hinge. A continuous, critically damped angular spring preserves position and
velocity when retargeted. Moving inner-display content uses
`12 * (1 - p) ** 1.7` blur, where `p` is normalized opening; there is no backdrop
blur. Inspect fold exposes the complete 0–180 degree range. Reduced motion
skips the effect. These constants are implementation choices, not dimensions or
animation parameters measured from Apple hardware.

## App-specific references

App interiors also reference Apple's [Calculator guide](https://support.apple.com/guide/iphone/use-the-basic-calculator-iph1ac0b5cc/ios),
[Photos guide](https://support.apple.com/guide/iphone/view-photos-and-videos-iph3d267610/ios),
and [Lists and tables guidance](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables).
Where Apple Support currently serves iOS 26 app screenshots, those are treated
as app-content references; the downloaded iOS 27 kit remains the source for the
current shared system components and Duo geometry.


## Native app polish and continuity

Calendar owns month, week, day, year and list views, event search, calendar
visibility and local event editing. Its toolbar follows the Duo outer/inner
orientation rules. Clock owns world clocks, alarms, a stopwatch with laps, and
independent timers. Duration and alarm wheels use five visible rows with native
scroll snap, keyboard selection and 44 px rows. Both applications remain mounted
when another app is open, so timers, selections and unfinished edits survive
Home, rotation and a device change.

Contacts uses surname-ordered name rows and a separate detail/edit flow. Mail
separates sender, subject and preview. Notes uses a wrapping document title.
Camera, Maps and Photos each have their own content layout and functional local
controls. Weather has a location collection and unit control; Music separates
the player from its queue; Safari uses a bottom address field. These examples
retain the local data and capability boundaries stated in the UI.

The Home dock alignment was checked against the outer and inner Home screens
in Apple's film. Its 52 px glyphs, 76 px width and spacing are visual tuning
choices for this implementation, distinct from the kit's 48 px in-app tab rail.

Navigation uses the View Transition API to preserve the outgoing frame while
React changes content. App launch expands from the selected icon, Home reverses
that movement, detail navigation enters from the trailing edge, and editing
sheets rise from below. The physical device and surrounding page remain still.
A reduced-motion preference applies the destination immediately. The animation
curves are browser implementation choices; the project does not claim to embed
UIKit or Apple's compositor.

The fold spine and rim stop beneath the flexible inner display. Closed cover
corners remain rounded through the 3D-to-live handoff. Neither fix clips a 3D
ancestor, so the articulated depth and uninterrupted motion remain intact.

Additional content references: [Calendar](https://support.apple.com/en-lamr/guide/iphone/iphfd1054569/26/ios/26),
[Contacts](https://support.apple.com/en-ae/guide/iphone/iph3e0ca2db/ios),
[Mail](https://support.apple.com/en-gb/guide/iphone/iph461684497/ios), and
[Timers](https://support.apple.com/en-euro/guide/iphone/iph8241d6b2a/ios).
