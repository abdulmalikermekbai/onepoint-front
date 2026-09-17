import { redirect, RedirectType } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LegacyCategoryRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/catalog?cat=${slug}`, RedirectType.replace);
}
