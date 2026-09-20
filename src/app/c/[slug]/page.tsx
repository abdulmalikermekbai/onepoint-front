import { permanentRedirect } from "next/navigation";
import { CATEGORIES } from "@/lib/data";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LegacyCategoryRedirect({ params }: Props) {
  const { slug } = await params;
  const exists = CATEGORIES.some((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (exists) {
    permanentRedirect(`/catalog?cat=${encodeURIComponent(slug.toLowerCase())}`);
  }
  permanentRedirect("/catalog");
}

