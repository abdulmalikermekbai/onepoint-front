import { GET as handler } from "@/app/merchant-feed.xml/route";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(request: Request) {
  return handler();
}
