"use client";

import { BottomNavigation } from "@noorddev/vlak-react";

export function Use() {
  return <BottomNavigation current="interfaces" items={[{ id: "components", label: "Components", href: "/components/", icon: "grid" }, { id: "interfaces", label: "Interfaces", href: "/interfaces/", icon: "layout" }, { id: "docs", label: "Docs", href: "/docs/", icon: "file-text" }]} />;
}
