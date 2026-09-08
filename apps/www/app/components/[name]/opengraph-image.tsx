import { catalogComponents } from "@noorddev/vlak";
import { notFound } from "next/navigation";
import { createOgPoster, ogContentType, ogSize } from "../../og-poster";

export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return catalogComponents.map(component => ({ name: component.name }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const component = catalogComponents.find(item => item.name === name);
  if (!component) notFound();
  return createOgPoster({
    label: "React component",
    headline: [component.title, "React component"],
    path: `/components/${component.name}`,
  });
}
