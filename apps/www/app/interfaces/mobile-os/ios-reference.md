# iOS study reference

This specimen follows the UIKit and pre-glass iPhone component vocabulary. The
logical display is 393 × 852 CSS pixels. Device presentation scales the complete
display, so component geometry does not change when the example is shown smaller.
Vlak supplies the neutral palette; Apple system font metrics supply the text
hierarchy on platforms where that font is installed.

## Primary references

- [Apple typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography): iOS default body 17/22 pt, large title 34/41 pt, headline semibold, and Dynamic Type. The large title here uses the emphasized bold weight.
- [Apple layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout): respect safe areas and system layout margins. The display and safe areas belong to `device-chrome.css`.
- [UIKit navigation bars](https://developer.apple.com/documentation/uikit/uinavigationbar): compact navigation title, back navigation, trailing actions, and optional large title.
- [UIKit inset-grouped tables](https://developer.apple.com/documentation/uikit/uitableview/style-swift.enum/insetgrouped): rounded, inset sections with aligned row content.
- [UIKit tab bars](https://developer.apple.com/documentation/uikit/uitabbar): peer destinations, icon and text labels, and selected state.
- [Apple's iOS 18 Control Center demonstration](https://www.youtube.com/watch?v=H4EIBrW8kM4): resizable modules, circular single controls, and groups. This example implements a selected set of local controls, not the complete iOS 18 default control set.

## Geometry and scope

The implementation uses conventional UIKit default-size geometry: a 44 pt
compact navigation bar, 52 pt large-title region, 49 pt tab content, 44 pt minimum
list rows, 16 pt content margins, 10 pt inset-grouped corners, and a 51 × 31 pt
switch with a 27 pt thumb inside a 44 pt hit area. These are explicit specimen
targets, not a claim that the HIG fixes every dimension for every iOS release.
The launcher uses 60 pt icons and small square widgets spanning two of four icon
columns. Search has a 36 pt painted field inside a 44 pt interactive control.

The controls are functioning browser inputs and buttons arranged with the native
component anatomy. They are not UIKit runtime controls. The launcher symbols in
`ios-app-glyph.tsx` are original filled SVG approximations of familiar app
categories; they are not SF Symbols or official Apple app artwork. The local app
content and reduced feature set are illustrative, so this is a component study,
not an exact reproduction of every Apple application.

Search, navigation, grouped Settings, home widgets, lists, Messages, tab bars,
and Control Center have independent rules in `ios-native.css`. Shared Vlak
component leaves and generated system CSS remain untouched.
