import type { Metadata } from "next";
import { referenceCaptions } from "../about/reference-captions";
import { Gallery } from "./gallery";
import "./inspiration.css";

export const metadata: Metadata = {
  title: "Inspiration",
  description: "An interactive collection of furniture, architecture, and graphic systems behind Vlak.",
  alternates: { canonical: "https://vlak.dev/inspiration/" },
};

export default function InspirationPage() {
  return <Gallery captions={referenceCaptions} />;
}
