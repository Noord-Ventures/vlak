import { interfaces, mobilePatterns } from "../interfaces/catalog";
import { HOST } from "../specimen";

export const dynamic = "force-static";

/** The authored interface catalogue, available without client rendering. */
export function GET() {
  const text = [
    "# Vlak interfaces",
    "",
    ...interfaces.flatMap(study => [
      `## ${study.title}`,
      "",
      study.law,
      "",
      `- Interface: ${HOST}/interfaces/${study.slug}/`,
      `- Workflow: ${study.use}`,
      `- Components: ${study.components.join(", ")}`,
      "",
      study.story,
      "",
      study.note,
      "",
      mobilePatterns[study.slug],
      "",
    ]),
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
