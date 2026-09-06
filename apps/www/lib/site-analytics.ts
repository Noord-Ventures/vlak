/** Website telemetry only. Nothing here is exported by the Vlak packages. */
const productionHosts = new Set(["vlak.dev", "www.vlak.dev"]);

export const publicSitePaths = [
  "/", "/about", "/components", "/docs", "/docs/accessibility", "/docs/agents",
  "/docs/frameworks", "/docs/layers", "/docs/stylex", "/docs/theming", "/docs/tokens",
  "/inspiration", "/interfaces", "/interfaces/agents", "/interfaces/drive",
  "/interfaces/evening", "/interfaces/frontier", "/interfaces/graphics", "/interfaces/line",
  "/interfaces/night", "/interfaces/orbit", "/interfaces/platforms", "/interfaces/press",
  "/interfaces/render", "/interfaces/room", "/interfaces/wall", "/swag",
];

type EventName = "docs_click" | "get_started_click" | "github_click" | "install_copy" | "network_click";
type EventData = Record<string, string>;
type AnalyticsEvent = { type: "pageview" | "event"; url: string; payload?: { name: string; data?: EventData } };
type AnalyticsQueue = (command: string, value: unknown) => void;

declare global {
  interface Window {
    va?: AnalyticsQueue;
    vaq?: unknown[][];
    __vlakSiteAnalytics?: { paths: Set<string> };
  }
}

export function isProductionLocation(location: Pick<Location, "hostname" | "protocol">): boolean {
  return location.protocol === "https:" && productionHosts.has(location.hostname);
}

function normalizePath(path: string): string {
  return path === "/" ? "/" : path.replace(/\/+$/, "");
}

export function redactUrl(value: string, paths: Set<string>): string | null {
  try {
    const url = new URL(value);
    if (!isProductionLocation(url)) return null;
    const path = normalizePath(url.pathname);
    if (!paths.has(path)) return null;
    url.pathname = path;
    url.search = "";
    url.hash = "";
    url.username = "";
    url.password = "";
    return url.href;
  } catch {
    return null;
  }
}

function safeEventData(name: string | undefined, data: EventData = {}, paths: Set<string>): EventData | null {
  const result: EventData = { source: "vlak" };
  if (name === "network_click") {
    if (data.destination !== "noord" && data.destination !== "renatovaldes") return null;
    return { ...result, destination: data.destination };
  }
  if (name === "install_copy") {
    const method = data.method;
    if (method !== "npm" && method !== "cli" && method !== "shadcn") return null;
    return { ...result, method };
  }
  if (name === "docs_click" || name === "get_started_click") {
    const path = normalizePath(data.path || "");
    if (!paths.has(path) || !/^\/docs(?:\/|$)/.test(path)) return null;
    return { ...result, path };
  }
  return name === "github_click" ? result : null;
}

export function beforeSend(event: AnalyticsEvent, paths: Set<string>): AnalyticsEvent | null {
  const url = redactUrl(event.url, paths);
  if (!url) return null;
  if (event.type === "pageview") return { type: "pageview", url };
  if (event.type !== "event") return null;
  const payload = event.payload;
  const data = safeEventData(payload?.name, payload?.data, paths);
  return data && payload ? { type: "event", url, payload: { name: payload.name, data } } : null;
}

export function installMethod(text: string): "npm" | "cli" | "shadcn" | null {
  // Inspect the fixed example locally; never send copied text or clipboard contents.
  if (/^npm install @noorddev\/vlak(?:-react)?(?:\s|$)/.test(text)) return "npm";
  if (/^npx @noorddev\/vlak-cli (?:init|add)(?:\s|$)/.test(text)) return "cli";
  if (/^npx shadcn add https:\/\/vlak\.dev\/r\/[a-z0-9-]+\.json(?:\s|$)/.test(text)) return "shadcn";
  return null;
}

export function trackSiteEvent(name: EventName, data: EventData = {}): void {
  if (typeof window === "undefined" || !isProductionLocation(window.location)) return;
  const paths = window.__vlakSiteAnalytics?.paths;
  if (!paths) return;
  const safe = safeEventData(name, data, paths);
  if (safe) window.va?.("event", { name, data: safe });
}

export function initializeSiteAnalytics(publicPaths: string[]): void {
  if (typeof window === "undefined" || !isProductionLocation(window.location) || window.__vlakSiteAnalytics) return;
  const paths = new Set(publicPaths.map(normalizePath));
  window.__vlakSiteAnalytics = { paths };
  window.va ??= (...args: unknown[]) => {
    window.vaq ??= [];
    window.vaq.push(args);
  };
  // Queue privacy filtering before loading the native collector, including its first page view.
  window.va("beforeSend", (event: AnalyticsEvent) => beforeSend(event, paths));
  const script = document.createElement("script");
  script.src = "/_vercel/insights/script.js";
  script.defer = true;
  // Suppress automatic URL/referrer HTTP headers on this script request.
  script.referrerPolicy = "no-referrer";
  document.head.appendChild(script);

  document.addEventListener("click", (event) => {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;
    let url: URL;
    try { url = new URL(anchor.href, window.location.href); } catch { return; }
    if (url.protocol !== "https:") return;
    const host = url.hostname;
    if (host === "noord.dev" || host === "www.noord.dev" || host === "noord.vc" || host === "www.noord.vc") {
      trackSiteEvent("network_click", { destination: "noord" });
    } else if (host === "renatovaldes.com" || host === "www.renatovaldes.com") {
      trackSiteEvent("network_click", { destination: "renatovaldes" });
    } else if (host === "github.com" && /^\/Noord-Ventures\/vlak(?:\/|$)/i.test(url.pathname)) {
      trackSiteEvent("github_click");
    } else if (productionHosts.has(host)) {
      const path = normalizePath(url.pathname);
      if (path === "/docs") trackSiteEvent("get_started_click", { path });
      else if (path.startsWith("/docs/")) trackSiteEvent("docs_click", { path });
    }
  }, { capture: true });
}
