import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { TransitBoard } from "../concepts/transit";
import "../concepts/transit.css";
import "../interfaces.css";
import { InterfaceShell } from "../shell";

const proto = interfaceBySlug("platforms")!;

export const metadata: Metadata = { title: proto.title, description: proto.law };

export default function Page() {
  return <InterfaceShell slug="platforms"><TransitBoard /></InterfaceShell>;
}
