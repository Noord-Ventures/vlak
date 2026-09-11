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

export const metadata: Metadata = pageMetadata("/interfaces/ios", {
  title: "iOS",
  description: "Explore an interactive iPhone with local apps, Home navigation, Control Center and settings in Vlak’s paper and ink.",
}, {
  searchTitle: "iOS interface with interactive iPhone apps · Vlak",
  imagePath: "/interfaces/ios/opengraph-image",
});

export default function Page() {
  return <InterfaceShell slug="ios"><Board platform="ios" /></InterfaceShell>;
}
