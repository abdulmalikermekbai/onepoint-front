import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { newsletter } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    // MySQL equivalent of INSERT IGNORE — update nothing on duplicate email
    await db.insert(newsletter).values({ email }).onDuplicateKeyUpdate({ set: { email } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // graceful fallback
  }
}
