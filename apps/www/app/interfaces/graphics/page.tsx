import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { WallpaperGenerator } from "../concepts/wallpaper-generator";
import "../concepts/wallpaper.css";
import "../interfaces.css";
import { InterfaceShell } from "../shell";

const proto = interfaceBySlug("graphics")!;

export const metadata: Metadata = pageMetadata("/interfaces/graphics", { title: proto.title, description: proto.law });

export default function Page() {
  return <InterfaceShell slug="graphics"><WallpaperGenerator /></InterfaceShell>;
}
