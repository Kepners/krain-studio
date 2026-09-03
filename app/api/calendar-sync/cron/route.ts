import { NextRequest, NextResponse } from "next/server";
import { hasCronAccess } from "@/lib/calendar-sync/auth";
import { maintainCalendarSync } from "@/lib/calendar-sync/service";

export const runtime = "nodejs";

/** Outlook changes are found by polling here. There is no webhook, because registering one is itself a write to Microsoft. */
export async function POST(request: NextRequest) {
  if (!hasCronAccess(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    await maintainCalendarSync();
    return NextResponse.json({ ok: true });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Calendar maintenance failed" }, { status: 500 });
  }
}
