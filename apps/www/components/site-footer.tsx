import Link from "next/link";
import { person } from "@/app/about/facts";
import { DOOR, WORD } from "@/app/specimen";
import { VlakMark } from "./vlak-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand" aria-hidden="true">
          <VlakMark />
        </div>
        <nav className="site-footer-nav" aria-label="Footer">
          <Link href="/">{WORD}</Link>
          <Link href="/about/">About</Link>
          <Link href="/components/">Components</Link>
          <Link href="/interfaces/">Interfaces</Link>
          <Link href="/use-cases/">Use cases</Link>
          <Link href="/docs/">Docs</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <a href={person.repo}>GitHub</a>
          <a href={DOOR}>vlak.dev</a>
        </nav>
        <div className="site-footer-about">
          <p>
            Vlak was designed and built at <a href="https://noord.dev">Noord</a> in Alkmaar by <a href="https://renatovaldes.com">Renn</a>.
          </p>
          <p>A modernist method translated into practical constraints for product interfaces.</p>
          <p>MIT-licensed. React, CSS, source, and machine-readable data.</p>
        </div>
      </div>
    </footer>
  );
}
