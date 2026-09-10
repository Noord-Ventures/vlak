import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { InterfaceShell } from "../shell";
import { Board } from "../mobile-os/board";
import "../interfaces.css";
import "../mobile-os/scene.css";
import "../mobile-os/platform-controls.css";
import "../mobile-os/ios-native.css";
import "../mobile-os/android-native.css";
import "../mobile-os/device-chrome.css";

export const metadata: Metadata = pageMetadata("/interfaces/android", {
  title: "Android",
  description: "Explore an interactive Android phone with local apps, Material navigation, Quick Settings and Vlak’s paper and ink.",
});

export default function Page() {
  return <InterfaceShell slug="android"><Board platform="android" /></InterfaceShell>;
}
