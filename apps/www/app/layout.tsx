import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@noorddev/vlak-react/css";
import "@noorddev/vlak/css/components.css";
import "./stylex.css";
import "./site.css";
import "@/components/examples/use.css";
import { CrumbBar } from "@/components/crumb-bar";
import { SiteChrome } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import { SiteAnalytics } from "@/components/site-analytics";
import { catalogComponents } from "@noorddev/vlak";
import { publicSitePaths } from "@/lib/site-analytics";
import { social } from "./social";

export const metadata: Metadata = social;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInit = `(function(){try{var r=document.documentElement,t=localStorage.getItem("vlak-theme");var dark=t==="dark"||((!t||t==="auto")&&matchMedia("(prefers-color-scheme: dark)").matches);r.dataset.theme=dark?"dark":"light";if(localStorage.getItem("vlak-grid")==="off")r.setAttribute("data-grid","off");var s=localStorage.getItem("vlak-text-scale");if(s!=null){var n=parseFloat(s);if(isFinite(n)&&n>0){if(n>3)n=n/100;r.style.setProperty("--text-scale",String(n));r.setAttribute("data-text-scale",String(Math.round(n*100)))}}}catch(e){}})()`;

/* First paint: hide desktop crumb labels so “Vlak” cannot sit on
   Components. The bar itself stays full-bleed (no width clip). Phone
   (≤640) keeps the trail. */
const crumbPin = `@media(min-width:641px){.site-crumb-bar a.rs-crumb-root,.site-crumb-bar a.site-crumb-root,.site-crumb-bar .rs-crumbs{display:none!important}}@media(max-width:640px){.corner-nav{display:none!important}}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <style dangerouslySetInnerHTML={{ __html: crumbPin }} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteChrome />
        <CrumbBar />
        {children}
        <SiteFooter />
        <SiteAnalytics publicPaths={[
          ...publicSitePaths,
          ...catalogComponents.map(({ name }) => `/components/${name}`),
        ]} />
      </body>
    </html>
  );
}
