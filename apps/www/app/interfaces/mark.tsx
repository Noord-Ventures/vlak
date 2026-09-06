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
