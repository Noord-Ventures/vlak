import "@noorddev/vlak-react/css";
import "./style.css";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
