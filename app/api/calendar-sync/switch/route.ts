import { NextRequest, NextResponse } from "next/server";
import { requireSetupSession } from "@/lib/calendar-sync/auth";
import { calendarDb } from "@/lib/calendar-sync/db";
import { allowWritesByHand, pauseSync } from "@/lib/calendar-sync/mail-guard";

export const runtime = "nodejs";

/** Switches the copying on or off. Switching on needs a name, so the decision is never anonymous. */
export async function POST(request: NextRequest) {
  const denied = await requireSetupSession();
  if (denied) return denied;
  const body = await request.json().catch(() => null) as { on?: boolean; name?: string } | null;
  if (!body || typeof body.on !== "boolean") return NextResponse.json({ error: "Say whether the sync should be on or off." }, { status: 400 });
  if (!body.on) {
    pauseSync(`switched off by ${body.name?.trim() || "someone at the setup page"}`);
    return NextResponse.json({ ok: true });
  }
  const name = body.name?.trim() ?? "";
  if (!name) return NextResponse.json({ error: "Type your name before switching the copying on." }, { status: 400 });
  allowWritesByHand(name);
  // Switching it back on is a person saying they have dealt with it, so stopped meetings start again.
  const restarted = calendarDb.clearBlockedLinks();
  return NextResponse.json({ ok: true, restarted });
}
