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
| Tab navigation | Persistent peer destinations, icon and label, distinct selected state; a floating capsule above content. | Clock and Phone use 62 px containers with 54 px targets and a full selected fill. The content reserves space for the final row. Wider layouts place icon and label together; the open Duo uses the kit's 48 px vertical rail. |
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
as 84.1 × 117.8 mm. Its displays both support Dynamic Island. The model-specific
frame is illustrative and uses the published proportions.

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

The browser study uses a 1,240 ms shared hinge and optical timeline, a temporary
24 px maximum content blur, an additional masked edge diffusion layer, and a
short final focus transition into the live app. Closing reverses the optical
progression. Reduced motion skips the effect; interruption removes every visual
copy and animation while keeping the live app mounted.
