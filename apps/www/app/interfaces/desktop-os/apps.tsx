"use client";
import type { DesktopAppProps } from "./types";
import { FilesApp, EditorApp, TerminalApp } from "./files-app";
import { BrowserApp, CalculatorApp } from "./browser-calculator";
import { PaintApp, CalendarApp, SettingsApp, MonitorApp, MinesApp } from "./utilities";
import "./apps.css";

export function DesktopApp(props: DesktopAppProps) {
  switch (props.app) {
    case "files": return <FilesApp {...props} />;
    case "editor": return <EditorApp {...props} />;
    case "terminal": return <TerminalApp {...props} />;
    case "browser": return <BrowserApp />;
    case "calculator": return <CalculatorApp />;
    case "paint": return <PaintApp {...props} />;
    case "calendar": return <CalendarApp {...props} />;
    case "settings": return <SettingsApp {...props} />;
    case "monitor": return <MonitorApp {...props} />;
    case "mines": return <MinesApp {...props} />;
  }
}
