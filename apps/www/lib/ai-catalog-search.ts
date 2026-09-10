import type { AiPageGroup } from "./ai-catalog";

const searchKey = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Match familiar API names as well as the names used in Vlak's catalogue. */
export function filterAiPageGroups(groups: AiPageGroup[], query: string): AiPageGroup[] {
  const words = query.trim().split(/\s+/).map(searchKey).filter(Boolean);
  if (words.length === 0) return groups;
  return groups.map(group => ({
    ...group,
    pages: group.pages.filter(page => {
      const text = searchKey([group.title, page.title, page.description, page.href, ...(page.aliases ?? [])].join(" "));
      return words.every(word => text.includes(word));
    }),
  })).filter(group => group.pages.length > 0);
}
