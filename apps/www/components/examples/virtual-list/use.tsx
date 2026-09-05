"use client";

import { VirtualList } from "@noorddev/vlak-react";

export function Use() {
  return <VirtualList label="Records" height={264} items={Array.from({ length: 200 }, (_, index) => ({ id: String(index), label: `Record ${index + 1}` }))} />;
}
