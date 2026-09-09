/** Display labels stay independent of stable category and route identifiers. */
export function categoryTitle(value: string) {
  if (value === "ai") return "AI";
  return value === "engineering" ? "Industrial" : value === "electronics" ? "Circuitry" : value.charAt(0).toUpperCase() + value.slice(1);
}
