import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@noorddev/vlak-react/css";
import "@noorddev/vlak/css/components.css";
import "katex/dist/katex.min.css";
import "./shell.css";

export const metadata: Metadata = {
  title: "Assistant · Vlak",
  description: "A working AI SDK reference app built with Vlak components.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
