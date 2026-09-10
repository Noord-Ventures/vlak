import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { interfaceBySlug, INTERFACE_SLUGS, type InterfaceSlug } from "../../interfaces/catalog";
import { PreviewRouteProvider } from "../../interfaces/preview";
import { pageMetadata } from "@/lib/page-metadata";
import { HOST } from "../../specimen";

// The short address renders the same page modules, so apps and credits stay in sync.
const pages = {
  "calendar": () => import("../../interfaces/calendar/page"),
  "line": () => import("../../interfaces/line/page"),
  "press": () => import("../../interfaces/press/page"),
  "wall": () => import("../../interfaces/wall/page"),
  "night": () => import("../../interfaces/night/page"),
  "evening": () => import("../../interfaces/evening/page"),
  "room": () => import("../../interfaces/room/page"),
  "agents": () => import("../../interfaces/agents/page"),
  "graphics": () => import("../../interfaces/graphics/page"),
  "render": () => import("../../interfaces/render/page"),
  "drive": () => import("../../interfaces/drive/page"),
  "orbit": () => import("../../interfaces/orbit/page"),
  "frontier": () => import("../../interfaces/frontier/page"),
  "platforms": () => import("../../interfaces/platforms/page"),
  "android": () => import("../../interfaces/android/page"),
  "ios": () => import("../../interfaces/ios/page"),
  "documentation": () => import("../../interfaces/documentation/page"),
  "video-player": () => import("../../interfaces/video-player/page"),
  "music-player": () => import("../../interfaces/music-player/page"),
  "microbiology": () => import("../../interfaces/microbiology/page"),
  "genome": () => import("../../interfaces/genome/page"),
  "protein": () => import("../../interfaces/protein/page"),
  "robotics": () => import("../../interfaces/robotics/page"),
  "circuitry": () => import("../../interfaces/circuitry/page"),
  "identity": () => import("../../interfaces/identity/page"),
  "patient": () => import("../../interfaces/patient/page"),
  "music": () => import("../../interfaces/music/page"),
  "microscopy": () => import("../../interfaces/microscopy/page"),
  "desktop-os": () => import("../../interfaces/desktop-os/page"),
} satisfies Record<InterfaceSlug, () => Promise<{ default: ComponentType }>>;
export const dynamicParams = false;
export function generateStaticParams() { return [...INTERFACE_SLUGS, "mobile-os"].map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "mobile-os") {
    const { metadata } = await import("../../interfaces/mobile-os/page");
    return { ...metadata, openGraph: { ...metadata.openGraph, url: `${HOST}/i/mobile-os/` } };
  }
  const item = interfaceBySlug(slug);
  if (!item) notFound();
  const metadata = pageMetadata(`/interfaces/${slug}`, { title: item.title, description: item.voice, robots: { index: false, follow: true } });
  return { ...metadata, openGraph: { ...metadata.openGraph, url: `${HOST}/i/${slug}/` } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "mobile-os") {
    const { default: MobileOSPage } = await import("../../interfaces/mobile-os/page");
    return <MobileOSPage />;
  }
  if (!interfaceBySlug(slug)) notFound();
  const { default: InterfacePage } = await pages[slug as InterfaceSlug]();
  return <PreviewRouteProvider><InterfacePage /></PreviewRouteProvider>;
}
