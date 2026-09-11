/** Website telemetry only. Nothing here is exported by the Vlak packages. */
const productionHosts = new Set(["vlak.dev", "www.vlak.dev"]);

export const publicSitePaths = [
  "/", "/about", "/components", "/ai", "/ai/widgets", "/docs", "/docs/accessibility", "/docs/agents",
  "/docs/choosing-vlak", "/docs/frameworks", "/docs/layers", "/docs/stylex", "/docs/theming", "/docs/tokens",
  "/inspiration", "/privacy", "/terms", "/interfaces", "/interfaces/agents", "/interfaces/drive",
  "/interfaces/evening", "/interfaces/frontier", "/interfaces/graphics", "/interfaces/line",
  "/interfaces/night", "/interfaces/orbit", "/interfaces/platforms", "/interfaces/press",
  "/interfaces/render", "/interfaces/room", "/interfaces/wall", "/swag",
  "/interfaces/microbiology", "/interfaces/genome", "/interfaces/protein", "/interfaces/robotics",
  "/interfaces/circuitry", "/interfaces/identity", "/interfaces/patient", "/interfaces/music",
  "/workflows", "/services", "/interfaces/reconciliation", "/interfaces/calendar", "/interfaces/desktop-os", "/interfaces/documentation",
  "/interfaces/microscopy", "/interfaces/mobile-os", "/interfaces/ios", "/interfaces/android", "/interfaces/music-player", "/interfaces/video-player",
  "/showcase", "/starters", "/use-cases", "/use-cases/agent-interfaces", "/use-cases/data-heavy-software",
  "/use-cases/scientific-software", "/use-cases/healthcare-software", "/use-cases/industrial-software",
  "/use-cases/enterprise-software", "/use-cases/consumer-software",
  "/use-cases/product-prototyping", "/updates",
];

type EventName = "acquisition" | "docs_click" | "docs_from_duo" | "duo_open" | "fold_transition" | "get_started_click" | "github_click" | "inner_screen" | "install_copy" | "install_from_duo" | "interface_video_play" | "network_click" | "outer_screen" | "project_submit_click" | "start_choice" | "starter_open" | "starter_download" | "agent_setup_open" | "interface_install" | "setup_copy" | "updates_follow";
type EventData = Record<string, string>;
type AnalyticsEvent = { type: "pageview" | "event"; url: string; payload?: { name: string; data?: EventData } };
type AnalyticsQueue = (command: string, value: unknown) => void;
type Attribution = { channel: string; campaign_source?: string; campaign_medium?: string; campaign_name?: string };

declare global {
  interface Window {
    va?: AnalyticsQueue;
    vaq?: unknown[][];
    __vlakSiteAnalytics?: { paths: Set<string>; attribution: Attribution };
  }
}

export function isProductionLocation(location: Pick<Location, "hostname" | "protocol">): boolean {
  return location.protocol === "https:" && productionHosts.has(location.hostname);
}

function normalizePath(path: string): string {
  return path === "/" ? "/" : path.replace(/\/+$/, "");
}

const acquisitionChannels = new Set(["direct", "twitter", "linkedin", "threads", "github", "npm", "producthunt", "search", "referral"]);
const starterSlugs = new Set(["ios", "android", "calendar", "reconciliation", "line"]);

function safeCampaignValue(value: string | undefined): string | undefined {
  const normalized = value?.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return normalized || undefined;
}

function safeAttribution(data: EventData): Attribution | null {
  const channel = data.channel;
  if (!channel || !acquisitionChannels.has(channel)) return null;
  const result: Attribution = { channel };
  for (const key of ["campaign_source", "campaign_medium", "campaign_name"] as const) {
    const value = safeCampaignValue(data[key]);
    if (value) result[key] = value;
  }
  return result;
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
  const attribution = safeAttribution(data);
  const result: EventData = { source: "vlak", ...(attribution ?? {}) };
  if (name === "acquisition") {
    const path = normalizePath(data.landing || "");
    if (!attribution || !paths.has(path)) return null;
    return { ...result, landing: path };
  }
  if (name === "network_click") {
    if (data.destination !== "noord" && data.destination !== "renatovaldes") return null;
    return { ...result, destination: data.destination };
  }
  if (name === "start_choice") {
    return ["prototype", "agent", "install"].includes(data.path ?? "") ? { ...result, path: data.path! } : null;
  }
  if (name === "starter_open") {
    return data.slug === "all" || starterSlugs.has(data.slug ?? "") ? { ...result, slug: data.slug! } : null;
  }
  if (name === "starter_download") {
    return starterSlugs.has(data.slug ?? "") ? { ...result, slug: data.slug! } : null;
  }
  if (name === "setup_copy" || name === "interface_install") {
    const slug = data.slug;
    if (!slug || !paths.has(`/interfaces/${slug}`)) return null;
    if (name === "interface_install") return data.method === "npm" ? { ...result, slug, method: "npm" } : null;
    return { ...result, slug };
  }
  if (name === "updates_follow") {
    return data.method === "rss" || data.method === "github" ? { ...result, method: data.method } : null;
  }
  if (name === "agent_setup_open") return result;
  if (name === "install_copy") {
    const method = data.method;
    if (method !== "npm" && method !== "cli" && method !== "shadcn") return null;
    return { ...result, method };
  }
  if (name === "install_from_duo") {
    return data.method === "npm" ? { ...result, method: "npm" } : null;
  }
  if (name === "docs_click" || name === "get_started_click") {
    const path = normalizePath(data.path || "");
    if (!paths.has(path) || !/^\/docs(?:\/|$)/.test(path)) return null;
    return { ...result, path };
  }
  if (name === "interface_video_play") {
    const slug = data.slug;
    if (!slug || !paths.has(`/interfaces/${slug}`)) return null;
    return { ...result, slug };
  }
  return name === "github_click" || name === "project_submit_click" || name === "docs_from_duo" || name === "duo_open" || name === "fold_transition" || name === "outer_screen" || name === "inner_screen" ? result : null;
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
  const safe = safeEventData(name, { ...data, ...window.__vlakSiteAnalytics!.attribution }, paths);
  if (safe) window.va?.("event", { name, data: safe });
}

export function acquisitionChannel(location: Pick<Location, "href">, referrer: string): string {
  const source = new URL(location.href).searchParams.get("utm_source")?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  const named: Record<string, string> = {
    x: "twitter", twitter: "twitter", linkedin: "linkedin", threads: "threads",
    github: "github", npm: "npm", producthunt: "producthunt",
  };
  if (named[source]) return named[source];
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === "t.co" || host === "x.com" || host.endsWith("twitter.com")) return "twitter";
    if (host.endsWith("linkedin.com")) return "linkedin";
    if (host === "threads.net" || host.endsWith(".threads.net") || host === "threads.com" || host.endsWith(".threads.com")) return "threads";
    if (host === "github.com") return "github";
    if (host === "npmjs.com") return "npm";
    if (host.endsWith("producthunt.com")) return "producthunt";
    if (/^(?:www\.)?(?:google\.|bing\.com$|duckduckgo\.com$)/.test(host)) return "search";
    if (productionHosts.has(host)) return "direct";
  } catch {
    return "direct";
  }
  return "referral";
}

export function acquisitionAttribution(location: Pick<Location, "href">, referrer: string): Attribution {
  const search = new URL(location.href).searchParams;
  const result: Attribution = { channel: acquisitionChannel(location, referrer) };
  const campaignSource = safeCampaignValue(search.get("utm_source") ?? undefined);
  const campaignMedium = safeCampaignValue(search.get("utm_medium") ?? undefined);
  const campaignName = safeCampaignValue(search.get("utm_campaign") ?? undefined);
  if (campaignSource) result.campaign_source = campaignSource;
  if (campaignMedium) result.campaign_medium = campaignMedium;
  if (campaignName) result.campaign_name = campaignName;
  return result;
}

export function initializeSiteAnalytics(publicPaths: string[]): void {
  if (typeof window === "undefined" || !isProductionLocation(window.location) || window.__vlakSiteAnalytics) return;
  const paths = new Set(publicPaths.map(normalizePath));
  let attribution = acquisitionAttribution(window.location, document.referrer);
  try {
    const stored = sessionStorage.getItem("vlak-attribution");
    const saved = stored ? safeAttribution(JSON.parse(stored) as EventData) : null;
    // A campaign-tagged entry starts a new attributable visit. Internal route
    // changes and direct reloads retain the first useful source for this tab.
    if (!attribution.campaign_source && saved) attribution = saved;
    sessionStorage.setItem("vlak-attribution", JSON.stringify(attribution));
  } catch {
    // Analytics stays optional when storage is unavailable or malformed.
  }
  window.__vlakSiteAnalytics = { paths, attribution };
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

  try {
    if (sessionStorage.getItem("vlak-acquisition") !== "sent") {
      const landing = normalizePath(window.location.pathname);
      trackSiteEvent("acquisition", { channel: acquisitionChannel(window.location, document.referrer), landing });
      sessionStorage.setItem("vlak-acquisition", "sent");
    }
  } catch {
    // Analytics stays optional when storage is unavailable.
  }

  document.addEventListener("click", (event) => {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;
    let url: URL;
    try { url = new URL(anchor.href, window.location.href); } catch { return; }
    if (url.protocol !== "https:") return;
    const host = url.hostname;
    if (productionHosts.has(host)) {
      const path = normalizePath(url.pathname);
      if (anchor.dataset.startPath) trackSiteEvent("start_choice", { path: anchor.dataset.startPath });
      if (path === "/starters") trackSiteEvent("starter_open", { slug: starterSlugs.has(url.hash.slice(1)) ? url.hash.slice(1) : "all" });
      const download = /^\/starter\/([a-z-]+)\.zip$/.exec(path);
      if (download) trackSiteEvent("starter_download", { slug: download[1]! });
      if (path === "/docs/agents") trackSiteEvent("agent_setup_open");
      if (path === "/rss.xml") trackSiteEvent("updates_follow", { method: "rss" });
    }
    if (host === "github.com" && /^\/Noord-Ventures\/vlak\/releases(?:\/|\.atom|$)/i.test(url.pathname)) {
      trackSiteEvent("updates_follow", { method: "github" });
    }
    if (host === "noord.dev" || host === "www.noord.dev" || host === "noord.vc" || host === "www.noord.vc") {
      trackSiteEvent("network_click", { destination: "noord" });
    } else if (host === "renatovaldes.com" || host === "www.renatovaldes.com") {
      trackSiteEvent("network_click", { destination: "renatovaldes" });
    } else if (host === "github.com" && /^\/Noord-Ventures\/vlak\/issues\/new\/?$/i.test(url.pathname) && url.searchParams.get("template") === "showcase.yml") {
      trackSiteEvent("project_submit_click");
    } else if (host === "github.com" && /^\/Noord-Ventures\/vlak(?:\/|$)/i.test(url.pathname)) {
      trackSiteEvent("github_click");
    } else if (productionHosts.has(host)) {
      const path = normalizePath(url.pathname);
      if (path === "/docs") trackSiteEvent("get_started_click", { path });
      else if (path.startsWith("/docs/")) trackSiteEvent("docs_click", { path });
    }
  }, { capture: true });
}
