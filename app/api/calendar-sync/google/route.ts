import { NextRequest, NextResponse } from "next/server";
import { calendarDb } from "@/lib/calendar-sync/db";
import { syncGoogleChanges } from "@/lib/calendar-sync/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const channel = calendarDb.getSecretJson<{ id: string; resourceId: string }>("google:channel");
  if (!channel || request.headers.get("x-goog-channel-id") !== channel.id || request.headers.get("x-goog-resource-id") !== channel.resourceId) return NextResponse.json({ error: "Invalid notification" }, { status: 401 });
  void syncGoogleChanges().catch(console.error);
  return NextResponse.json({ ok: true }, { status: 202 });
}
