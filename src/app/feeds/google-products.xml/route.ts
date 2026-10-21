import { GET as handler } from "@/app/merchant-feed.xml/route";

export const revalidate = 1800;

export async function GET() {
  return handler();
}

