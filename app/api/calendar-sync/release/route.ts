import { NextRequest, NextResponse } from "next/server";
import { requireSetupSession } from "@/lib/calendar-sync/auth";
import { calendarDb } from "@/lib/calendar-sync/db";

export const runtime = "nodejs";

/** Starts ONE stopped meeting again. Separate from switching the copying on, so a person releases only what they have looked at. */
export async function POST(request: NextRequest) {
  const denied = await requireSetupSession();
  if (denied) return denied;
  const body = await request.json().catch(() => null) as { outlookEventId?: string } | null;
  const outlookEventId = body?.outlookEventId?.trim() ?? "";
  if (!outlookEventId) return NextResponse.json({ error: "Say which meeting to start again." }, { status: 400 });
  const released = calendarDb.releaseLink(outlookEventId);
  if (!released) return NextResponse.json({ error: "That meeting was not stopped." }, { status: 404 });
  return NextResponse.json({ ok: true, released });
}
