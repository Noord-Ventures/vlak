"use client";

import { useEffect } from "react";
import { initializeSiteAnalytics } from "@/lib/site-analytics";

export function SiteAnalytics({ publicPaths }: { publicPaths: string[] }) {
  useEffect(() => { initializeSiteAnalytics(publicPaths); }, [publicPaths]);
  return null;
}
