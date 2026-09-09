import { createOgPoster, ogContentType, ogSize } from "../og-poster";

export const alt = "AI components · Vlak";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return createOgPoster({ label: "AI components", headline: ["Conversations, responses,", "tools, and approvals."], path: "/ai" });
}
