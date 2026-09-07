import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { OrbitBoard } from "../concepts/orbit";
import "../concepts/orbit.css";
import "../interfaces.css";
import { InterfaceShell } from "../shell";

const proto = interfaceBySlug("orbit")!;

export const metadata: Metadata = pageMetadata("/interfaces/orbit", { title: proto.title, description: proto.law });

export default function Page() {
  return <InterfaceShell slug="orbit"><OrbitBoard /></InterfaceShell>;
}
