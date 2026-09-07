import { Icon } from "@noorddev/vlak-react";
import type { InterfaceSlug } from "./catalog";
import { interfaceBySlug } from "./catalog";

const marks = {
  line: "message",
  press: "printer",
  wall: "users",
  night: "truck",
  evening: "bag",
  room: "hash",
  agents: "terminal",
  graphics: "image",
  render: "box",
  drive: "compass",
  orbit: "globe",
  frontier: "code",
  platforms: "smartphone",
  "mobile-os": "grid",
  microbiology: "grid",
  genome: "list",
  protein: "layers",
  robotics: "activity",
  circuitry: "code",
  identity: "user-check",
  patient: "activity",
  music: "music",
  documentation: "file-text",
  "music-player": "music",
} as const;

/** Product marks use the current Vlak icon family. */
export function Mark({ slug }: { slug: InterfaceSlug }) {
  return <Icon className="if-mark" name={marks[slug]} size={16} />;
}

export function Brand({ slug }: { slug: InterfaceSlug }) {
  const item = interfaceBySlug(slug);
  return (
    <p className="if-app">
      <Mark slug={slug} />
      <span>{item?.what ?? slug}</span>
    </p>
  );
}
