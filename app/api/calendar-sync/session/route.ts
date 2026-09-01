import { NextRequest, NextResponse } from "next/server";
import { checkSetupPassword, createSetupSession } from "@/lib/calendar-sync/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { password?: string } | null;
  if (!body?.password || !checkSetupPassword(body.password)) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  createSetupSession(response);
  return response;
}
