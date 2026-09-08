export type Platform = "mac" | "windows" | "linux" | "beos";
export type AppId = "files" | "editor" | "terminal" | "browser" | "calculator" | "paint" | "calendar" | "settings" | "monitor" | "mines";
export type DesktopEntry = { path: string; kind: "file" | "folder"; content?: string };
export type FileSystem = DesktopEntry[];
export type DesktopPreferences = { wallpaper: "paper" | "grid" | "stripes"; volume: number; sound: boolean };
export type AppWindow = { id: number; app: AppId; title: string; path?: string; minimized: boolean };
export interface DesktopAppProps {
  platform: Platform;
  app: AppId;
  path?: string;
  files: FileSystem;
  setFiles: (update: (files: FileSystem) => FileSystem) => void;
  preferences: DesktopPreferences;
  setPreferences: (update: (preferences: DesktopPreferences) => DesktopPreferences) => void;
  windows: AppWindow[];
  openApp: (app: AppId, path?: string) => void;
  closeWindow: (id: number) => void;
  onDocumentSave?: (path: string) => void;
}
export const platforms: { id: Platform; label: string; edition: string }[] = [
  { id: "mac", label: "Mac OS", edition: "Classic desktop" },
  { id: "windows", label: "Windows", edition: "XP desktop" },
  { id: "linux", label: "Linux", edition: "GNOME desktop" },
  { id: "beos", label: "BeOS", edition: "R5 desktop" },
];
export const appNames: Record<Platform, Record<AppId, string>> = {
  mac: { files: "Finder", editor: "SimpleText", terminal: "Terminal", browser: "Browser", calculator: "Calculator", paint: "Sketch", calendar: "Calendar", settings: "Control Panels", monitor: "Process Viewer", mines: "Mines" },
  windows: { files: "My Computer", editor: "Notepad", terminal: "Command Prompt", browser: "Internet Explorer", calculator: "Calculator", paint: "Paint", calendar: "Calendar", settings: "Control Panel", monitor: "Task Manager", mines: "Minesweeper" },
  linux: { files: "Files", editor: "Text Editor", terminal: "Terminal", browser: "Web", calculator: "Calculator", paint: "Drawing", calendar: "Calendar", settings: "Settings", monitor: "System Monitor", mines: "Mines" },
  beos: { files: "Tracker", editor: "StyledEdit", terminal: "Terminal", browser: "NetPositive", calculator: "DeskCalc", paint: "ArtPaint", calendar: "Calendar", settings: "Preferences", monitor: "ProcessController", mines: "Mines" },
};
export const defaultPreferences: DesktopPreferences = { wallpaper: "paper", volume: 60, sound: false };
