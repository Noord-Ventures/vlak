# Android component reference

Verified September 10, 2026. This study starts from Android's published Material 3 Expressive anatomy, then applies Vlak's Inter, paper, ink, gray and flat surfaces. Hardware profiles affect the viewport and outer chrome. They do not switch the application to Samsung One UI or claim to reproduce Google's proprietary apps.

## Published baseline

[Android 17 is the current platform release](https://android-developers.googleblog.com/2026/06/Android-17.html). [Compose Material 3 release notes](https://developer.android.com/jetpack/androidx/releases/compose-material3) distinguish stable 1.4 from the latest Expressive 1.5.0-alpha28, published September 9. The web implementation uses native HTML controls and React state, not those Android binaries. Alpha component APIs are not described as stable.

Measurements below are taken from the AndroidX token sources pinned at `1c4911b721b1b410f8d6046703cfec9b3b26fb58`. CSS pixels represent logical dp within the handset. Native font roles are recorded separately from the final Vlak typeface.

| Component | Native anatomy | Implementation |
| --- | --- | --- |
| [Small app bar](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarSmallTokens.kt) and [flexible app bar](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarMediumFlexibleTokens.kt) | 64dp detail bar; 112dp flexible bar; title-large and headline-medium roles | 64dp detail navigation; 112dp root title; 16dp content rail; compact bar in landscape |
| [Buttons](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ButtonSmallTokens.kt) | 40dp small container; 16dp side insets; 20dp icon; 8dp icon gap | At least 48dp interactive bounds; expressive action shape and neutral fill |
| [Connected buttons](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ConnectedButtonGroupSmallTokens.kt) | 40dp container; 2dp group gap; outer full corners; selected inner corners become full | 40dp paint in 48dp targets, 2dp gaps and animated selected shape; existing arrow-key ToggleGroup behavior |
| [Search](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SearchBarTokens.kt) | 56dp container; full corners; body-large text | 56dp search field, leading search icon and native text input |
| [Slider](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SliderTokens.kt) | 16dp active/inactive tracks; 4 × 44dp handle; 6dp handle padding | Native range input with separated tracks and the current elongated handle; keyboard, pointer and touch input retained |
| [Switch](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SwitchTokens.kt) | 52 × 32dp track; 16dp off and 24dp on handles | Native checkbox with switch semantics inside a 52 × 48dp target |
| [Expressive list](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ListTokens.kt) | 56/72/88dp rows; 16dp side and 10dp vertical insets; 12dp internal gap; 2dp segmented gap | Contained Settings rows with full-surface interaction feedback and 20dp leading/trailing icons |
| [Short navigation](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarTokens.kt) and [vertical item](https://github.com/androidx/androidx/blob/1c4911b721b1b410f8d6046703cfec9b3b26fb58/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarVerticalItemTokens.kt) | 64dp navigation container; 56 × 32dp active indicator; 24dp icons | Clock navigation uses short-bar geometry, a neutral active indicator and readable labels |

## Vlak translation

Material's native reference uses Roboto typography roles. Final rendering uses locally supplied Inter while retaining the component hierarchy, logical text sizes and layout anatomy. Primary and selected surfaces use ink on paper or paper on ink; supporting surfaces use neutral mixtures. Elevation shadows and dynamic accent hues are removed. Fields and segmented list interiors retain Vlak's 4px control corners. Shape changes that communicate selection remain expressive, with a 260ms easing curve and reduced-motion fallback.

System panels are functional local examples: Quick Settings toggles their actual local settings, brightness changes this specimen, and media controls play the local tone sequence. The panel uses a compact two-column tile layout with selected shape changes. It is a curated Pixel-style composition, not a claim that every installed Android version has identical tile dimensions or that Samsung runs Pixel SystemUI. [Google documents both gesture and button system navigation](https://support.google.com/android/answer/9079644?hl=en).

## Device sources and coverage

- [Google Pixel 11](https://store.google.com/product/pixel_11_specs?hl=en-US): 6.3-inch, 1080 × 2424 display; 152.8 × 72 × 8.6mm enclosure; Android 17 at launch. It supplies the current Google hardware reference, rather than a claim about global sales rank.
- [Samsung Galaxy S26 Ultra](https://news.samsung.com/global/samsung-unveils-galaxy-s26-series-the-most-intuitive-galaxy-ai-phone-yet): 6.9-inch, 1440 × 3120 display; 163.6 × 78.1 × 7.9mm enclosure. The hardware ships with Samsung's own software; this study keeps its Material presentation independent of that software.
- [Samsung Galaxy A17 5G](https://shop.samsung.com/ie/galaxy-a17-5g-blue-128gb): 6.7-inch, 1080 × 2340 display; 164.4 × 77.9 × 7.5mm enclosure and Infinity-U camera cutout. It represents the widely used Galaxy A series.

[Counterpoint's Q2 2026 model research](https://counterpointresearch.com/en/insights/iphone-17-global-best-selling-smartphone-in-q2-2026), published August 25, identifies the S26 Ultra as the best-selling Android model and includes the A17 5G in its top-ten chart. The selection therefore combines a current platform reference with flagship and mass-market coverage. Logical specimen viewport widths are display-density choices, not physical millimetre measurements.

## Responsive behavior

Portrait retains the single-column phone hierarchy. At a logical viewport width of 600dp, the same live application reflows: the home widget and app grid sit alongside a vertical dock, Settings uses two columns, the app drawer uses eight columns, and Quick Settings becomes two panes. Detail views preserve their scroll container. The application is not remounted when the hardware or orientation changes, so current screens, drafts and controls remain in place.

All app content is local sample data. Calls, network controls and notifications do not connect to a real handset or external account.

On browser viewports up to 640px, Use phone presents the live application at its
available CSS width with unscaled text and controls. Compact container rules
reflow app grids and system panels. View device restores the proportioned
hardware preview; folding and rotation also enter that inspection mode. Both
presentations use the same mounted app and preserve its records and settings.
