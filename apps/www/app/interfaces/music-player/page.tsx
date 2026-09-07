import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { MusicPlayerBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

export const metadata: Metadata = pageMetadata("/interfaces/music-player", { title: "Music Player", description: "A personal listening room with a 23-track library, individual official previews and local audio playback." });
export default function Page() { return <InterfaceShell slug="music-player"><MusicPlayerBoard /></InterfaceShell>; }
