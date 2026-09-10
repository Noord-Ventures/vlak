import { siteSearchEntries } from "@/lib/site-search-index";

export const dynamic = "force-static";

/** A small public index, fetched on search intent instead of added to every page. */
export function GET() {
  return Response.json(siteSearchEntries);
}
