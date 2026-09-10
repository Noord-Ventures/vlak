/** Serializable navigation data. Keep component implementations and props out of this shape. */
export interface SiteSearchEntry {
  id: string;
  href: string;
  title: string;
  description: string;
  section: string;
  keywords?: readonly string[];
}

const suggestedPaths = [
  "/docs/", "/components/", "/ai/", "/interfaces/", "/docs/tokens/", "/docs/frameworks/",
  "/ai/widgets/", "/docs/agents/", "/use-cases/", "/docs/choosing-vlak/", "/docs/accessibility/", "/docs/theming/",
];

function normalized(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "")
    .replace(/([\p{Ll}\d])(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2")
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function field(value: string) {
  const text = normalized(value);
  return { text, compact: text.replace(/ /g, ""), words: text.split(" ").filter(Boolean) };
}

type SearchField = ReturnType<typeof field>;
const matchesWord = (value: SearchField, word: string) => value.words.some(candidate => candidate.startsWith(word)) || value.compact.startsWith(word);

/** Rank title matches before familiar aliases, then descriptive matches. Never mutate the index. */
export function searchSite(entries: readonly SiteSearchEntry[], query: string, limit = 12): SiteSearchEntry[] {
  const count = Number.isFinite(limit) ? Math.min(16, Math.max(0, Math.floor(limit))) : 12;
  if (count === 0) return [];
  const phrase = field(query);
  const words = [...new Set(phrase.words)];
  if (words.length === 0) {
    const suggested = suggestedPaths.flatMap(href => entries.find(entry => entry.href === href) ?? []);
    const selected = new Set(suggested.map(entry => entry.id));
    return [...suggested, ...entries.filter(entry => !selected.has(entry.id))].slice(0, count);
  }

  return entries.map((entry, position) => {
    const title = field(entry.title);
    const aliases = (entry.keywords ?? []).map(field);
    const description = field(entry.description);
    const section = field(entry.section);
    const path = field(entry.href);
    const fields = [title, ...aliases, description, section, path];
    // Compact matching also accepts API names typed without their usual capitals or spaces.
    const compactMatch = fields.some(value => value.compact.startsWith(phrase.compact));
    if (!compactMatch && !words.every(word => fields.some(value => matchesWord(value, word)))) return { entry, position, score: 0 };
    const allWords = (value: SearchField) => words.every(word => matchesWord(value, word));
    const exact = (value: SearchField) => value.compact === phrase.compact;
    const prefix = (value: SearchField) => value.compact.startsWith(phrase.compact);
    let score = exact(title) ? 10_000 : prefix(title) ? 9_000 : allWords(title) ? 8_000
      : aliases.some(exact) ? 7_000 : aliases.some(prefix) ? 6_000 : aliases.some(allWords) ? 5_000 : 1_000;
    // Mixed queries can combine a component name with its category or a described feature.
    score += words.reduce((sum, word) => sum + (matchesWord(title, word) ? 300
      : aliases.some(value => matchesWord(value, word)) ? 200
      : matchesWord(description, word) ? 60 : matchesWord(section, word) ? 40 : 20), 0) / words.length;
    return { entry, position, score };
  }).filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || left.position - right.position)
    .slice(0, count).map(result => result.entry);
}
