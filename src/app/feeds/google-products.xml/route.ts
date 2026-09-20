import { GET as handler } from "@/app/merchant-feed.xml/route";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  return handler();
}

