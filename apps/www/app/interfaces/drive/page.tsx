import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { Drive } from "../concepts/drive";
import "../concepts/drive.css";
import "../interfaces.css";
import { InterfaceShell } from "../shell";

const proto = interfaceBySlug("drive")!;

export const metadata: Metadata = pageMetadata("/interfaces/drive", { title: proto.title, description: proto.law });

export default function Page() {
  return <InterfaceShell slug="drive"><Drive /></InterfaceShell>;
}
