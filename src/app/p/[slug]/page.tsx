import { redirect, RedirectType } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LegacyProductRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/product/${slug}`, RedirectType.replace);
}
