import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { VideoPlayerBoard } from "./board";
import "../interfaces.css";

export const metadata: Metadata = pageMetadata("/interfaces/video-player", { title: "Video Player", description: "A music video screening room for Loathe, Foals and Woodkid, with official YouTube and Vimeo playback and a focused playlist." });
export default function Page() { return <InterfaceShell slug="video-player"><VideoPlayerBoard /></InterfaceShell>; }
