import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { InterfaceShell } from "../shell";
import { Board } from "./board";
import "../interfaces.css";
import "./scene.css";

const study = interfaceBySlug("mobile-os");
export const metadata: Metadata = pageMetadata("/interfaces/mobile-os", { title: study?.title ?? "Mobile OS", description: "Interactive local phone environments with everyday apps, navigation, and settings built with Vlak." });
export default function Page() { return <InterfaceShell slug="mobile-os"><Board /></InterfaceShell>; }
