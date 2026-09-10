import type { InterfaceSlug } from "./catalog";

export const FILMED_INTERFACE_SLUGS = [
  "agents", "circuitry", "desktop-os", "documentation", "drive", "evening",
  "frontier", "genome", "graphics", "identity", "line", "microbiology",
  "microscopy", "mobile-os", "music", "music-player", "night", "orbit",
  "patient", "platforms", "press", "protein", "render", "robotics", "room",
  "video-player", "wall",
] as const satisfies readonly InterfaceSlug[];

const filmed = new Set<InterfaceSlug>(FILMED_INTERFACE_SLUGS);

export const INTERFACE_FILM_UPLOAD_DATE = "2026-09-09T00:00:00+02:00";
export const INTERFACE_FILM_DURATION = "PT20S";

export function hasInterfaceFilm(slug: InterfaceSlug): boolean {
  return filmed.has(slug);
}

