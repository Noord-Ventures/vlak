# Desktop OS interface

The desktop study at `/interfaces/desktop-os/` adapts four operating-system conventions using Vlak paper, ink, Inter and hairlines. It runs local browser applications, not native operating systems.

- Mac OS follows the creator’s classic Mac prototype: a global menu bar with anchored dropdowns, desktop shortcuts along the screen’s left edge, a bottom dock, centered window titles, shading and Finder-style file browsing.
- Windows follows the creator’s Windows XP prototype: Start, a bottom taskbar, caption controls and independent application windows.
- Linux uses GNOME conventions: Activities, an application grid, a favorites dock and workspaces.
- BeOS follows the creator’s BeOS prototype: Deskbar, window title tabs, Tracker and four workspaces.

The creator’s standalone `classic`, `windowsxp` and `beos` projects informed window, filesystem and application behavior. Their source patterns were reimplemented in React with pointer capture, cleanup and keyboard controls. No proprietary fonts, sampled icons, boot artwork or personal browser content was copied.

## Working applications

Each desktop has its own validated local file store and preferences. Files, folders and their contents are shared between its file manager, text editor and terminal. File operations include create, rename, delete, import and export. Editor drafts stay available when switching applications or operating-system tabs; saved files survive a page reload when browser storage is available.

The terminal parses local commands without evaluating JavaScript or accessing host files. The browser application loads Vlak guides from the same origin; external addresses open a new browser tab. Other applications include a calculator with arithmetic precedence and memory, a drawing canvas with PNG save and export, a calendar with dated notes, workspace settings, a view of actual open windows and a playable Mines game.

Windows can move, resize, minimize, restore, maximize and close. Keyboard users can move a focused title with arrow keys and resize with Shift plus arrow keys. Compact layouts show one focused application and separate Apps and Tasks drawers. Desktop coordinates, application state and files remain available when the layout changes.

## Mac desktop chrome

Desktop shortcuts form a column at the desktop’s left edge in both the embedded workspace and fullscreen preview. Each icon and caption stays centered within its shortcut tile.

The dock launches applications and restores their existing windows. Running applications have an indicator; the front application also has a selected surface. Maximized windows fill the space above the dock. The Apps control opens the searchable application drawer, and Trash opens its folder in Finder. At workspace widths of 680px or less, the desktop shortcuts and dock are hidden and the bottom Apps and Tasks controls remain available.

Mac OS, File and Window open traditional dropdown menus below the menu bar. File creates documents and opens Documents or Trash. Window provides minimize, zoom, shade, arrangement and individual window switching. Selecting a window restores it with its existing application state.

Arrow keys move through menu items and between menus; Home and End reach the first and last items. Typing selects a matching item. Moving the pointer across menu titles switches an already-open menu. Escape closes the dropdown and returns focus to its title, Tab continues out of the menu, and an outside click dismisses it. In fullscreen preview, the first Escape closes an open menu while keeping the workspace expanded.

## References

- [Microsoft title bar design](https://learn.microsoft.com/en-us/windows/apps/design/basics/titlebar-design)
- [GNOME windows](https://developer.gnome.org/hig/patterns/containers/windows.html)
- [Haiku user guide](https://www.haiku-os.org/docs/userguide/en/contents.html)

## Validation

`desktop-os.test.mjs` checks filesystem integrity, independent records, terminal operations and arithmetic parsing. `desktop-os-e2e.mjs` checks editor-to-terminal-to-file-manager workflows across all four desktops, independent persisted files, window controls, compact application screens, browser navigation and keyboard menu dismissal. `desktop-mac-chrome-e2e.mjs` checks shortcut placement and centered captions in embedded and fullscreen views, dock launch and restore, maximized-window bounds, dropdown placement and keyboard behavior, compact controls, preview state and the other platforms’ launchers. The interface refresh suite checks light and dark appearance, accessibility, overflow and 44px targets at 320, 390, 1024 and 1440px.

## Full-screen preview

The same live workspace can expand into the browser viewport. Its windows and application state stay mounted, so entering and leaving preview preserves current work. The Vlak share bar copies `/i/desktop-os/`, which opens the workspace directly, or opens the browser’s share sheet and social composition links. Shared links open the application’s normal starting state; private file contents are not encoded in the address.
