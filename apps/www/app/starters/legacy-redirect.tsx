"use client";

import { useEffect } from "react";

/** Static hosts need a client redirect to retain the query and selected study. */
export function LegacyStartersRedirect() {
  useEffect(() => {
    window.location.replace(`/interfaces/${window.location.search}${window.location.hash}`);
  }, []);

  return null;
}
