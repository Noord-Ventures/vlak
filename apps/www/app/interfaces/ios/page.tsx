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
  title: "iPhone Duo",
  description: "Prototype for the iPhone Duo fold, with outer and inner screens, familiar iOS conventions, and Vlak’s monochrome visual system.",
}, {
  searchTitle: "iPhone Duo interface prototype · Vlak",
  imagePath: "/interfaces/ios/opengraph-image?v=duo-prototype",
});

export default function Page() {
  return <InterfaceShell slug="ios"><Board platform="ios" /></InterfaceShell>;
}
