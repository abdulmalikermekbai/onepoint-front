import { notFound, permanentRedirect } from "next/navigation";
import { fetchLiveProducts } from "@/lib/data";
import { resolveCanonicalProductSlug } from "@/lib/legacy-redirects";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LegacyProductRedirect({ params }: Props) {
  const { slug } = await params;
  const allProducts = await fetchLiveProducts();
  const resolution = resolveCanonicalProductSlug(slug, allProducts);

  if (resolution.canonicalSlug) {
    permanentRedirect(`/product/${resolution.canonicalSlug}`);
  }

  // If no matching product exists in active catalog, return standard 404
  notFound();
}

